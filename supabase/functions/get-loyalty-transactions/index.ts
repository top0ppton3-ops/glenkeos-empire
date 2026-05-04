import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as kv from "../server/kv_store.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customer_id')

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_CUSTOMER_ID', message: 'customer_id required' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transactions = await kv.get(`loyalty_transactions:${customerId}`) || []

    return new Response(
      JSON.stringify({ transactions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'GET_LOYALTY_TRANSACTIONS_FAILED', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
