/**
 * ================================================================
 * SEND NOTIFICATION - Supabase Edge Function
 * ================================================================
 * Sends notifications via EMAIL, SMS, or PUSH
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendNotificationRequest {
  recipient_id: string
  channel: 'EMAIL' | 'SMS' | 'PUSH'
  template_id: string
  data: Record<string, any>
}

const templates = {
  order_confirmed: {
    email: {
      subject: 'Order Confirmed - GlenKeos',
      body: (data: any) => `
        <h1>Order Confirmed!</h1>
        <p>Your order ${data.order_id} has been confirmed.</p>
        <p><strong>Total:</strong> $${data.total}</p>
        <p><strong>Estimated Ready Time:</strong> ${new Date(data.estimated_ready_time).toLocaleString()}</p>
        <p>Thank you for choosing GlenKeos!</p>
      `
    },
    sms: (data: any) => `Your GlenKeos order ${data.order_id} is confirmed! Total: $${data.total}. Ready at ${new Date(data.estimated_ready_time).toLocaleTimeString()}`
  },
  order_ready: {
    email: {
      subject: 'Order Ready for Pickup - GlenKeos',
      body: (data: any) => `
        <h1>Your Order is Ready!</h1>
        <p>Order ${data.order_id} is now ready for pickup.</p>
        <p>Please come to the store to collect your order.</p>
      `
    },
    sms: (data: any) => `Your order ${data.order_id} is ready for pickup! Come get it while it's hot!`
  },
  driver_assigned: {
    email: {
      subject: 'Driver Assigned - GlenKeos',
      body: (data: any) => `
        <h1>Driver on the Way!</h1>
        <p>Your order ${data.order_id} is out for delivery.</p>
        <p><strong>Driver:</strong> ${data.driver_name}</p>
        <p><strong>ETA:</strong> ${data.eta} minutes</p>
      `
    },
    sms: (data: any) => `Driver ${data.driver_name} is delivering your order! ETA: ${data.eta} min`
  },
  order_delivered: {
    email: {
      subject: 'Order Delivered - GlenKeos',
      body: (data: any) => `
        <h1>Enjoy Your Meal!</h1>
        <p>Your order ${data.order_id} has been delivered.</p>
        <p>Thank you for choosing GlenKeos!</p>
      `
    },
    sms: (data: any) => `Your order ${data.order_id} has been delivered. Enjoy!`
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body: SendNotificationRequest = await req.json()

    // Get recipient details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_id', body.recipient_id)
      .single()

    if (customerError || !customer) {
      throw new Error('Customer not found')
    }

    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    let status: 'SENT' | 'FAILED' = 'SENT'
    let errorMessage: string | undefined

    try {
      const template = templates[body.template_id as keyof typeof templates]
      
      if (body.channel === 'EMAIL') {
        const emailTemplate = template.email as { subject: string; body: (data: any) => string }
        const subject = emailTemplate.subject
        const message = emailTemplate.body(body.data)

        // In production, integrate with SendGrid, AWS SES, etc.
        // For now, log it
        console.log(`Sending email to ${customer.email}:`, { subject, message })

        // Store notification
        await supabase
          .from('notifications')
          .insert({
            notification_id: notificationId,
            recipient_id: body.recipient_id,
            channel: body.channel,
            template_id: body.template_id,
            subject,
            message,
            status: 'SENT',
            sent_at: new Date().toISOString(),
            metadata: body.data,
            created_at: new Date().toISOString()
          })

      } else if (body.channel === 'SMS') {
        const smsTemplate = template.sms as (data: any) => string
        const message = smsTemplate(body.data)

        // In production, integrate with Twilio
        console.log(`Sending SMS to ${customer.phone}:`, message)

        await supabase
          .from('notifications')
          .insert({
            notification_id: notificationId,
            recipient_id: body.recipient_id,
            channel: body.channel,
            template_id: body.template_id,
            message,
            status: 'SENT',
            sent_at: new Date().toISOString(),
            metadata: body.data,
            created_at: new Date().toISOString()
          })

      } else if (body.channel === 'PUSH') {
        // In production, integrate with Firebase Cloud Messaging or OneSignal
        console.log(`Sending PUSH to customer ${body.recipient_id}`)

        await supabase
          .from('notifications')
          .insert({
            notification_id: notificationId,
            recipient_id: body.recipient_id,
            channel: body.channel,
            template_id: body.template_id,
            message: JSON.stringify(body.data),
            status: 'SENT',
            sent_at: new Date().toISOString(),
            metadata: body.data,
            created_at: new Date().toISOString()
          })
      }

    } catch (error) {
      status = 'FAILED'
      errorMessage = error.message
      console.error('Notification send failed:', error)
    }

    return new Response(
      JSON.stringify({
        success: status === 'SENT',
        notification_id: notificationId,
        status,
        error_message: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'NOTIFICATION_FAILED',
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
