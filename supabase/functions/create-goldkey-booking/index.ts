import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PACKAGE_MULTIPLIERS = {
  standard: 1.0,
  premium: 1.5,
  elite: 2.5
}

const BASE_PRICES = {
  black_truck: 500,
  pool_party: 2000,
  event_25_plus: 3500,
  live_event: 1500,
  concierge: 200
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()
    const { service_type, package_tier, customer_id } = body

    if (!service_type || !package_tier || !customer_id) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_PARAMS', message: 'service_type, package_tier, customer_id required' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const bookingId = `GK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const basePrice = BASE_PRICES[service_type] || 500
    const multiplier = PACKAGE_MULTIPLIERS[package_tier] || 1.0
    const estimatedPrice = basePrice * multiplier

    const bookingData = {
      booking_id: bookingId,
      customer_id,
      service_type,
      package_tier,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      pickup_location: body.pickup_location,
      dropoff_location: body.dropoff_location,
      party_size: body.party_size,
      preferences: body.preferences || {},
      status: 'PENDING_REVIEW',
      estimated_price: estimatedPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: booking, error } = await supabase
      .from('goldkey_bookings')
      .insert(bookingData)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'CREATE_BOOKING_FAILED', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
