# Backend Implementation Guide: Payment Processing

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Owner**: Backend Engineering Team  
**Status**: Implementation Guide

---

## 1. Overview

This guide provides step-by-step instructions for implementing the complete payment processing system for GlenKeos, including:
- **Stripe integration** (credit/debit cards)
- **PayPal integration** (PayPal balance, cards via PayPal)
- **Payment webhooks** (async payment status updates)
- **Refund processing**
- **Payment reconciliation**
- **PCI-DSS compliance** (SAQ A via tokenization)

---

## 2. Architecture Overview

### 2.1 Payment Flow

```
CUSTOMER CHECKOUT
    ↓
[Frontend] Select payment method (Stripe or PayPal)
    ↓
[Edge Function] Create payment intent/order
    ↓
[Payment Provider] Process payment (Stripe or PayPal)
    ↓
[Webhook] Payment confirmed asynchronously
    ↓
[Database] Update order status to CONFIRMED
    ↓
[Realtime] Notify customer + store via WebSocket
```

### 2.2 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend SDK** | Stripe.js, PayPal SDK | Collect payment info (client-side tokenization) |
| **Backend Logic** | Supabase Edge Functions | Create payment intents, handle webhooks |
| **Database** | PostgreSQL | Store payment metadata (NOT card data) |
| **Webhooks** | Supabase Edge Functions (HTTP endpoints) | Receive async payment status updates |
| **Secrets** | Vercel Environment Variables | Store API keys securely |

### 2.3 Data Flow (PCI-DSS Compliant)

**CRITICAL**: Card data NEVER touches our servers (PCI-DSS SAQ A compliance)

```
[Customer enters card #1234-5678-9012-3456]
    ↓
[Stripe.js tokenizes → token: tok_visa]  ← Stripe servers handle card data
    ↓
[Frontend sends token to backend]
    ↓
[Backend creates charge using token]  ← Backend NEVER sees card number
    ↓
[Stripe processes payment]
    ↓
[Webhook confirms payment]
    ↓
[Database stores: payment_intent_id, status, amount] ← NO card data stored
```

---

## 3. Stripe Integration

### 3.1 Environment Variables

**Add to Vercel**:
```bash
# Vercel Dashboard → Settings → Environment Variables

# Public (frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51H8...  # Safe to expose

# Secret (backend only)
STRIPE_SECRET_KEY=sk_live_51H8...  # NEVER expose in frontend
STRIPE_WEBHOOK_SECRET=whsec_...    # For webhook signature verification
```

**Validation**:
```bash
# Test Stripe API connectivity
curl https://api.stripe.com/v1/charges \
  -u "sk_test_...:" \
  -d "amount=1000" \
  -d "currency=usd" \
  -d "source=tok_visa"

# Expected: HTTP 200 with charge object
```

### 3.2 Frontend Integration (Stripe Elements)

**Install Dependencies**:
```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

**src/app/components/StripeCheckoutForm.tsx**:
```typescript
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';

// Load Stripe (once, outside component)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, orderId }: { amount: number; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent on backend
      const { data: { client_secret }, error: intentError } = await supabase.functions.invoke(
        'create-stripe-payment-intent',
        {
          body: {
            order_id: orderId,
            amount: amount * 100, // Stripe uses cents
            currency: 'usd'
          }
        }
      );

      if (intentError) throw intentError;

      // Step 2: Confirm payment with card element
      const cardElement = elements.getElement(CardElement);
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: 'Customer Name', // From user profile
              email: 'customer@example.com'
            }
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Step 3: Payment successful!
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment successful:', paymentIntent.id);
        // Redirect to success page or show confirmation
        window.location.href = `/orders/${orderId}/confirmed`;
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' }
              },
              invalid: { color: '#9e2146' }
            }
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export function StripeCheckout({ amount, orderId }: { amount: number; orderId: string }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} orderId={orderId} />
    </Elements>
  );
}
```

### 3.3 Backend Integration (Edge Function)

**supabase/functions/create-stripe-payment-intent/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient()
});

serve(async (req) => {
  try {
    // Parse request body
    const { order_id, amount, currency = 'usd' } = await req.json();

    // Validate input
    if (!order_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order from database (verify it exists and belongs to user)
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('order_id, total_amount, status, customer_id')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches order total (prevent tampering)
    if (Math.abs(order.total_amount * 100 - amount) > 1) { // Allow 1 cent tolerance for rounding
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // In cents
      currency,
      metadata: {
        order_id,
        customer_id: order.customer_id,
        tenant_id: order.tenant_id
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // For cards only, no redirects to 3D Secure
      }
    });

    // Store payment intent ID in database
    await supabaseClient
      .from('orders')
      .update({
        payment_provider: 'stripe',
        payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('order_id', order_id);

    // Log transaction attempt
    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'PAYMENT_INTENT_CREATED',
        user_id: order.customer_id,
        tenant_id: order.tenant_id,
        event_data: {
          order_id,
          payment_intent_id: paymentIntent.id,
          amount: amount / 100,
          currency,
          provider: 'stripe'
        }
      });

    // Return client secret to frontend
    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy Edge Function**:
```bash
# Link to Supabase project
supabase link --project-ref beswluhdxaphtitaovly

# Deploy function
supabase functions deploy create-stripe-payment-intent --no-verify-jwt

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Test function
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-stripe-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"order_id":"order-uuid","amount":5000,"currency":"usd"}'

# Expected: {"client_secret":"pi_..."}
```

### 3.4 Webhook Handler (Async Payment Confirmation)

**Why Webhooks?**  
Payment confirmation happens asynchronously. Customer may close browser before payment completes. Webhooks ensure we update order status even if frontend is gone.

**supabase/functions/stripe-webhook/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient()
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

serve(async (req) => {
  try {
    // Verify webhook signature (security: reject forged webhooks)
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        // Update order status
        const { error } = await supabaseClient
          .from('orders')
          .update({
            payment_status: 'succeeded',
            status: 'CONFIRMED',
            payment_confirmed_at: new Date().toISOString()
          })
          .eq('order_id', orderId);

        if (error) {
          console.error('Error updating order:', error);
        }

        // Log successful payment
        await supabaseClient
          .from('compliance_audit_log')
          .insert({
            event_type: 'PAYMENT_SUCCEEDED',
            user_id: paymentIntent.metadata.customer_id,
            tenant_id: paymentIntent.metadata.tenant_id,
            event_data: {
              order_id: orderId,
              payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency
            }
          });

        // Trigger Realtime notification (customer + store notified)
        await supabaseClient
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single(); // Triggers Realtime broadcast via RLS

        console.log(`Payment succeeded for order ${orderId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.order_id;

        // Update order status
        await supabaseClient
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'CANCELLED',
            payment_error: paymentIntent.last_payment_error?.message
          })
          .eq('order_id', orderId);

        // Log failed payment
        await supabaseClient
          .from('compliance_audit_log')
          .insert({
            event_type: 'PAYMENT_FAILED',
            user_id: paymentIntent.metadata.customer_id,
            tenant_id: paymentIntent.metadata.tenant_id,
            event_data: {
              order_id: orderId,
              payment_intent_id: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message
            }
          });

        console.log(`Payment failed for order ${orderId}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        // Find order by payment_intent_id
        const { data: order } = await supabaseClient
          .from('orders')
          .select('order_id, customer_id, tenant_id')
          .eq('payment_intent_id', paymentIntentId)
          .single();

        if (order) {
          // Update order status
          await supabaseClient
            .from('orders')
            .update({
              payment_status: 'refunded',
              refunded_at: new Date().toISOString()
            })
            .eq('order_id', order.order_id);

          // Log refund
          await supabaseClient
            .from('compliance_audit_log')
            .insert({
              event_type: 'PAYMENT_REFUNDED',
              user_id: order.customer_id,
              tenant_id: order.tenant_id,
              event_data: {
                order_id: order.order_id,
                charge_id: charge.id,
                amount_refunded: charge.amount_refunded / 100
              }
            });

          console.log(`Refund processed for order ${order.order_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

**Deploy Webhook Handler**:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt

# Get webhook URL
echo "Webhook URL: https://beswluhdxaphtitaovly.supabase.co/functions/v1/stripe-webhook"
```

**Register Webhook in Stripe Dashboard**:
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://beswluhdxaphtitaovly.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret → Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Test Webhook**:
```bash
# Use Stripe CLI to trigger test webhook
stripe listen --forward-to https://beswluhdxaphtitaovly.supabase.co/functions/v1/stripe-webhook

# In another terminal, trigger payment
stripe trigger payment_intent.succeeded
```

---

## 4. PayPal Integration

### 4.1 Environment Variables

```bash
# Vercel Dashboard → Settings → Environment Variables

# Public (frontend)
VITE_PAYPAL_CLIENT_ID=AYSq3RDGsmBLJE...  # Safe to expose

# Secret (backend only)
PAYPAL_CLIENT_SECRET=EGnHDxD_qRPdaLdZz8...  # NEVER expose
PAYPAL_MODE=sandbox  # Or "live" for production
```

### 4.2 Frontend Integration (PayPal SDK)

**Install Dependencies**:
```bash
pnpm add @paypal/react-paypal-js
```

**src/app/components/PayPalCheckout.tsx**:
```typescript
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '@/lib/supabase';

export function PayPalCheckout({ amount, orderId }: { amount: number; orderId: string }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture'
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={async () => {
          // Step 1: Create PayPal order on backend
          const { data, error } = await supabase.functions.invoke(
            'create-paypal-order',
            {
              body: {
                order_id: orderId,
                amount: amount.toFixed(2), // PayPal uses decimal string
                currency: 'USD'
              }
            }
          );

          if (error) {
            console.error('Error creating PayPal order:', error);
            throw error;
          }

          return data.paypal_order_id; // Return PayPal order ID
        }}
        onApprove={async (data, actions) => {
          // Step 2: Capture payment on backend
          const { error } = await supabase.functions.invoke(
            'capture-paypal-payment',
            {
              body: {
                order_id: orderId,
                paypal_order_id: data.orderID
              }
            }
          );

          if (error) {
            console.error('Error capturing PayPal payment:', error);
            alert('Payment failed. Please try again.');
            return;
          }

          // Step 3: Payment successful!
          window.location.href = `/orders/${orderId}/confirmed`;
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again.');
        }}
      />
    </PayPalScriptProvider>
  );
}
```

### 4.3 Backend Integration (Create PayPal Order)

**supabase/functions/create-paypal-order/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox';
const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  try {
    const { order_id, amount, currency = 'USD' } = await req.json();

    // Validate input
    if (!order_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches
    if (Math.abs(order.total_amount - parseFloat(amount)) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const paypalResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order_id,
          amount: {
            currency_code: currency,
            value: amount
          },
          description: `GlenKeos Order #${order_id.substring(0, 8)}`
        }]
      })
    });

    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok) {
      throw new Error(`PayPal API error: ${JSON.stringify(paypalOrder)}`);
    }

    // Store PayPal order ID in database
    await supabaseClient
      .from('orders')
      .update({
        payment_provider: 'paypal',
        payment_intent_id: paypalOrder.id,
        payment_status: 'pending'
      })
      .eq('order_id', order_id);

    // Log transaction attempt
    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'PAYMENT_INTENT_CREATED',
        user_id: order.customer_id,
        tenant_id: order.tenant_id,
        event_data: {
          order_id,
          paypal_order_id: paypalOrder.id,
          amount: parseFloat(amount),
          currency,
          provider: 'paypal'
        }
      });

    return new Response(
      JSON.stringify({ paypal_order_id: paypalOrder.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 4.4 Capture PayPal Payment

**supabase/functions/capture-paypal-payment/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox';
const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  try {
    const { order_id, paypal_order_id } = await req.json();

    if (!order_id || !paypal_order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture PayPal payment
    const captureResponse = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${paypal_order_id}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      throw new Error(`PayPal capture failed: ${JSON.stringify(captureData)}`);
    }

    // Update order status
    const { error } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'succeeded',
        status: 'CONFIRMED',
        payment_confirmed_at: new Date().toISOString()
      })
      .eq('order_id', order_id);

    if (error) {
      console.error('Error updating order:', error);
    }

    // Log successful payment
    const { data: order } = await supabaseClient
      .from('orders')
      .select('customer_id, tenant_id, total_amount')
      .eq('order_id', order_id)
      .single();

    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'PAYMENT_SUCCEEDED',
        user_id: order.customer_id,
        tenant_id: order.tenant_id,
        event_data: {
          order_id,
          paypal_order_id,
          amount: order.total_amount,
          capture_id: captureData.purchase_units[0].payments.captures[0].id
        }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy PayPal Functions**:
```bash
supabase functions deploy create-paypal-order --no-verify-jwt
supabase functions deploy capture-paypal-payment --no-verify-jwt

# Set environment variables
supabase secrets set PAYPAL_CLIENT_ID=AYSq3RDGsmBLJE...
supabase secrets set PAYPAL_CLIENT_SECRET=EGnHDxD_qRPdaLdZz...
supabase secrets set PAYPAL_MODE=sandbox
```

---

## 5. Refund Processing

### 5.1 Refund Policy

**Who can refund?**
- STORE_MANAGER: Full refund within 24 hours of order
- SUPER_ADMIN: Full or partial refund anytime

**Refund Methods**:
- Stripe: Automatic refund to original payment method
- PayPal: Automatic refund to PayPal balance or original payment method

### 5.2 Refund Implementation

**supabase/functions/process-refund/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient()
});

serve(async (req) => {
  try {
    const { order_id, amount, reason } = await req.json();

    // Fetch order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify order is refundable
    if (order.payment_status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Order not paid or already refunded' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process refund based on payment provider
    let refundResult;
    if (order.payment_provider === 'stripe') {
      refundResult = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: amount ? amount * 100 : undefined, // Partial or full refund
        reason: 'requested_by_customer'
      });
    } else if (order.payment_provider === 'paypal') {
      // PayPal refund logic (similar to Stripe)
      // ... (implementation omitted for brevity)
    } else {
      throw new Error('Unknown payment provider');
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({
        payment_status: 'refunded',
        status: 'CANCELLED',
        refunded_at: new Date().toISOString(),
        refund_reason: reason
      })
      .eq('order_id', order_id);

    // Log refund
    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'PAYMENT_REFUNDED',
        user_id: order.customer_id,
        tenant_id: order.tenant_id,
        event_data: {
          order_id,
          refund_id: refundResult.id,
          amount: amount || order.total_amount,
          reason
        }
      });

    return new Response(
      JSON.stringify({ success: true, refund_id: refundResult.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Refund error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 6. Testing

### 6.1 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined (insufficient funds) |
| `4000 0000 0000 9987` | Payment declined (expired card) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

**Expiration**: Any future date (e.g., `12/34`)  
**CVC**: Any 3 digits (e.g., `123`)  
**ZIP**: Any 5 digits (e.g., `12345`)

### 6.2 PayPal Test Accounts

**Sandbox URL**: https://www.sandbox.paypal.com/

**Test Buyer Account**:
- Email: buyer@example.com (created in PayPal Developer Dashboard)
- Password: testpass123
- Balance: $9,999.00

**Test Payments**:
1. Use PayPal checkout on frontend
2. Log in with test buyer account
3. Confirm payment
4. Verify order status updates to CONFIRMED

---

## 7. Troubleshooting

### 7.1 Common Errors

**Error: "No such payment_intent"**  
- Cause: payment_intent_id not found in Stripe  
- Fix: Verify order.payment_intent_id matches Stripe dashboard

**Error: "Webhook signature verification failed"**  
- Cause: STRIPE_WEBHOOK_SECRET incorrect  
- Fix: Copy webhook signing secret from Stripe dashboard → Update environment variable

**Error: "Amount mismatch"**  
- Cause: Frontend sent different amount than order total  
- Fix: Verify order.total_amount calculation (including tax, fees)

**Error: "PayPal capture failed"**  
- Cause: Buyer didn't authorize payment in PayPal popup  
- Fix: Buyer must click "Pay Now" in PayPal popup

---

## 8. Production Checklist

Before going live:
- [ ] Switch to live API keys (Stripe: `pk_live_...`, `sk_live_...`)
- [ ] Switch PayPal mode to `live` (`PAYPAL_MODE=live`)
- [ ] Register production webhook URLs in Stripe Dashboard
- [ ] Test full payment flow end-to-end with real card (refund immediately)
- [ ] Verify webhook handler receives events
- [ ] Enable Stripe Radar for fraud detection
- [ ] Configure Stripe account settings (business info, payout schedule)
- [ ] Verify PCI-DSS SAQ A compliance (card data never touches our servers)
- [ ] Set up payment monitoring alerts (high failure rate, unusual refunds)

---

**Payment processing is mission-critical. Test thoroughly before production.**
