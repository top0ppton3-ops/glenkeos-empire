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

    const url = new URL(req.url)
    const storeId = url.searchParams.get('store_id')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let ordersQuery = supabase.from('orders').select('status, total, created_at')
    if (storeId) ordersQuery = ordersQuery.eq('store_id', storeId)
    const { data: orders } = await ordersQuery

    let driversQuery = supabase.from('drivers').select('status')
    if (storeId) driversQuery = driversQuery.eq('store_id', storeId)
    const { data: drivers } = await driversQuery

    const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY']
    const activeOrders = orders?.filter(o => activeStatuses.includes(o.status)).length || 0
    const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today && o.status === 'DELIVERED') || []
    const completedOrdersToday = todayOrders.length
    const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const activeDrivers = drivers?.filter(d => d.status === 'ACTIVE').length || 0

    const metrics = {
      store_id: storeId || null,
      active_orders: activeOrders,
      pending_orders: pendingOrders,
      completed_orders_today: completedOrdersToday,
      active_drivers: activeDrivers,
      average_delivery_time: 28,
      revenue_today: revenueToday,
      customer_satisfaction: 4.7,
      updated_at: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'GET_METRICS_FAILED', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
