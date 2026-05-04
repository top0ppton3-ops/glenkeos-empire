/**
 * ================================================================
 * ASSIGN DRIVER - Supabase Edge Function
 * ================================================================
 * Assigns available driver to delivery order
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssignDriverRequest {
  order_id: string
  driver_id?: string // Optional - will auto-assign if not provided
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body: AssignDriverRequest = await req.json()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', body.order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.order_type !== 'DELIVERY') {
      throw new Error('Order is not a delivery order')
    }

    let driver

    // If driver_id provided, use that driver
    if (body.driver_id) {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('driver_id', body.driver_id)
        .eq('status', 'AVAILABLE')
        .single()

      if (driverError || !driverData) {
        throw new Error('Driver not available')
      }

      driver = driverData
    } else {
      // Auto-assign: Find closest available driver
      const { data: availableDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'AVAILABLE')
        .limit(10)

      if (driversError || !availableDrivers || availableDrivers.length === 0) {
        throw new Error('No available drivers')
      }

      // For now, just take the first available driver
      // In production, calculate distance to store and assign closest
      driver = availableDrivers[0]
    }

    // Update driver status
    const { error: driverUpdateError } = await supabase
      .from('drivers')
      .update({
        status: 'ASSIGNED',
        active_order_id: body.order_id,
        updated_at: new Date().toISOString()
      })
      .eq('driver_id', driver.driver_id)

    if (driverUpdateError) throw driverUpdateError

    // Update order with driver
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        driver_id: driver.driver_id,
        status: 'OUT_FOR_DELIVERY',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', body.order_id)

    if (orderUpdateError) throw orderUpdateError

    // Calculate ETA (default 30 minutes)
    const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Send notification to customer
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: order.customer_id,
          channel: 'SMS',
          template_id: 'driver_assigned',
          data: {
            order_id: body.order_id,
            driver_name: `${driver.first_name} ${driver.last_name}`,
            eta: 30
          }
        })
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }

    return new Response(
      JSON.stringify({
        success: true,
        driver: {
          driver_id: driver.driver_id,
          first_name: driver.first_name,
          last_name: driver.last_name,
          phone: driver.phone,
          vehicle_type: driver.vehicle_type,
          vehicle_plate: driver.vehicle_plate,
          rating: driver.rating
        },
        estimated_delivery_time: estimatedDeliveryTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Driver assignment error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'DRIVER_ASSIGNMENT_FAILED',
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
