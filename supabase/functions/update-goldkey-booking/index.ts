import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { booking_id, status, final_price } = await req.json()

    if (!booking_id || !status) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_PARAMS', message: 'booking_id and status required' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (final_price !== undefined) updateData.final_price = final_price

    const { data: booking, error } = await supabase
      .from('goldkey_bookings')
      .update(updateData)
      .eq('booking_id', booking_id)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'UPDATE_BOOKING_FAILED', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
