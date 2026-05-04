/**
 * ================================================================
 * PROCESS PAYMENT - Supabase Edge Function
 * ================================================================
 * Processes payment via PayPal and updates order status
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPaymentRequest {
  order_id: string
  payment_method: string
  paypal_order_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get PayPal credentials
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!
    const paypalSecret = Deno.env.get('PAYPAL_SECRET')!
    const paypalEnv = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'

    const paypalBaseUrl = paypalEnv === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

    const body: ProcessPaymentRequest = await req.json()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', body.order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Get PayPal access token
    const authHeader = btoa(`${paypalClientId}:${paypalSecret}`)
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const { access_token } = await tokenResponse.json()

    let transactionId = ''
    let paypalOrderId = body.paypal_order_id

    // If no PayPal order ID provided, create one
    if (!paypalOrderId) {
      const createOrderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: body.order_id,
            amount: {
              currency_code: 'USD',
              value: order.total.toFixed(2)
            },
            description: `Order ${body.order_id}`
          }]
        })
      })

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create PayPal order')
      }

      const paypalOrder = await createOrderResponse.json()
      paypalOrderId = paypalOrder.id
    }

    // Capture payment
    const captureResponse = await fetch(
      `${paypalBaseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!captureResponse.ok) {
      const error = await captureResponse.text()
      throw new Error(`PayPal capture failed: ${error}`)
    }

    const captureResult = await captureResponse.json()
    transactionId = captureResult.purchase_units[0].payments.captures[0].id

    // Create payment record
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_id: paymentId,
        order_id: body.order_id,
        customer_id: order.customer_id,
        amount: order.total,
        currency: 'USD',
        payment_method: body.payment_method,
        status: 'COMPLETED',
        transaction_id: transactionId,
        processor: 'PAYPAL',
        processor_response: captureResult,
        tenant_id: order.tenant_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (paymentError) throw paymentError

    // Update order with payment and status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_id: paymentId,
        status: 'ACCEPTED',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', body.order_id)

    if (updateError) throw updateError

    // Send notification (call send-notification function)
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: order.customer_id,
          channel: 'EMAIL',
          template_id: 'order_confirmed',
          data: {
            order_id: body.order_id,
            total: order.total,
            estimated_ready_time: order.estimated_ready_time
          }
        })
      })
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the payment if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentId,
        transaction_id: transactionId,
        status: 'COMPLETED',
        order_status: 'ACCEPTED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'PAYMENT_FAILED',
          message: error.message
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
