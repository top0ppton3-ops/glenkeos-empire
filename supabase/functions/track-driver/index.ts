/**
 * ================================================================
 * TRACK DRIVER - Supabase Edge Function
 * ================================================================
 * Update and retrieve driver location in real-time
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateLocationRequest {
  driver_id: string
  latitude: number
  longitude: number
  heading?: number
  speed?: number
}

interface GetLocationRequest {
  order_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'get'

    if (action === 'update') {
      // Update driver location
      const body: UpdateLocationRequest = await req.json()

      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          current_location: {
            latitude: body.latitude,
            longitude: body.longitude,
            heading: body.heading,
            speed: body.speed,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('driver_id', body.driver_id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Location updated'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else {
      // Get driver location for order
      const body: GetLocationRequest = await req.json()

      // Get order to find driver
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('driver_id')
        .eq('order_id', body.order_id)
        .single()

      if (orderError || !order || !order.driver_id) {
        throw new Error('Order or driver not found')
      }

      // Get driver location
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('current_location, first_name, last_name, phone, vehicle_type, vehicle_plate')
        .eq('driver_id', order.driver_id)
        .single()

      if (driverError || !driver) {
        throw new Error('Driver not found')
      }

      // Calculate ETA (simplified - in production use Google Maps Distance Matrix API)
      const etaMinutes = 15 // Default ETA

      return new Response(
        JSON.stringify({
          success: true,
          driver: {
            first_name: driver.first_name,
            last_name: driver.last_name,
            phone: driver.phone,
            vehicle_type: driver.vehicle_type,
            vehicle_plate: driver.vehicle_plate
          },
          location: driver.current_location || null,
          eta_minutes: etaMinutes
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Tracking error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'TRACKING_FAILED',
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
