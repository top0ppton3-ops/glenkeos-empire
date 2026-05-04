/**
 * ================================================================
 * CREATE ORDER - Supabase Edge Function
 * ================================================================
 * Creates a new order in the system
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOrderRequest {
  brand_id: string
  store_id: string
  customer_id: string
  order_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  items: Array<{
    product_id: string
    quantity: number
    customizations?: any[]
    special_instructions?: string
  }>
  delivery_address?: any
  special_instructions?: string
  tip?: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Parse request
    const body: CreateOrderRequest = await req.json()

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Fetch products to calculate pricing
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('product_id', body.items.map(item => item.product_id))

    if (productError) throw productError

    // Calculate totals
    let subtotal = 0
    const orderItems = body.items.map(item => {
      const product = products.find(p => p.product_id === item.product_id)
      if (!product) throw new Error(`Product ${item.product_id} not found`)

      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal

      return {
        item_id: `ITEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        customizations: item.customizations || [],
        subtotal: itemSubtotal,
        special_instructions: item.special_instructions
      }
    })

    const tax = subtotal * 0.08 // 8% tax
    const deliveryFee = body.order_type === 'DELIVERY' ? 5.99 : 0
    const tip = body.tip || 0
    const total = subtotal + tax + deliveryFee + tip

    // Get store tenant_id
    const { data: store } = await supabase
      .from('stores')
      .select('tenant_id')
      .eq('store_id', body.store_id)
      .single()

    if (!store) throw new Error('Store not found')

    // Calculate estimated ready time (30 minutes from now)
    const estimatedReadyTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Create order
    const orderData = {
      order_id: orderId,
      customer_id: body.customer_id,
      store_id: body.store_id,
      brand_id: body.brand_id,
      status: 'PENDING',
      order_type: body.order_type,
      items: orderItems,
      subtotal,
      tax,
      delivery_fee: deliveryFee,
      tip,
      total,
      delivery_address: body.delivery_address,
      special_instructions: body.special_instructions,
      estimated_ready_time: estimatedReadyTime,
      tenant_id: store.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderId,
      created_at: new Date().toISOString()
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)

    if (itemsError) throw itemsError

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        payment_required: true,
        estimated_ready_time: estimatedReadyTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error creating order:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'ORDER_CREATE_FAILED',
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
