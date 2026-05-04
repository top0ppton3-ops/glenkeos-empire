import paypal from '@paypal/checkout-server-sdk';

/**
 * PayPal HTTP client configuration
 * Supports both sandbox and production environments
 */
export function getPayPalClient(): paypal.core.PayPalHttpClient {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  // Choose environment
  let environment: paypal.core.PayPalEnvironment;
  
  if (mode === 'production' || mode === 'live') {
    environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }

  return new paypal.core.PayPalHttpClient(environment);
}

/**
 * Build order request for PayPal
 */
export function buildOrderRequest(params: {
  amount: string;
  currency?: string;
  orderId: string;
  customerId: string;
  items?: Array<{
    name: string;
    quantity: string;
    unit_amount: { value: string; currency_code: string };
  }>;
}): any {
  const { amount, currency = 'USD', orderId, customerId, items } = params;

  const request: any = {
    intent: 'CAPTURE',
    application_context: {
      brand_name: 'GlenKeos - Chic-on-Chain',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.FRONTEND_URL}/checkout/success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      shipping_preference: 'NO_SHIPPING'
    },
    purchase_units: [
      {
        reference_id: orderId,
        custom_id: customerId,
        amount: {
          currency_code: currency,
          value: amount,
          breakdown: items ? {
            item_total: {
              currency_code: currency,
              value: amount
            }
          } : undefined
        },
        items: items
      }
    ],
    // Enable 3D Secure when required
    payment_source: {
      card: {
        attributes: {
          verification: {
            method: 'SCA_WHEN_REQUIRED'
          }
        }
      }
    }
  };

  return request;
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyWebhookSignature(
  webhookId: string,
  headers: any,
  body: any
): Promise<boolean> {
  try {
    const client = getPayPalClient();
    
    const verifyRequest = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body
    };

    const request = new paypal.notifications.WebhookVerifySignature(verifyRequest);
    const response = await client.execute(request);
    
    return response.result?.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}
