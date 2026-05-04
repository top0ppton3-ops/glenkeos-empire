/**
 * GlenKeos Production API - Direct Supabase Integration
 * Full backend connectivity for all operations
 */

import { supabase } from '../../../../utils/supabase/client';

export const supabaseAPI = {
  // ============================================
  // MENU ITEMS
  // ============================================
  menuItems: {
    list: async (filters?: { brand?: string; category?: string }) => {
      let query = supabase.from('menu_items').select('*').eq('available', true);
      
      if (filters?.brand) {
        query = query.eq('tenant_id', filters.brand);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { items: data || [] };
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (item: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: false })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    }
  },

  // ============================================
  // ORDERS
  // ============================================
  orders: {
    create: async (orderData: Record<string, unknown>) => {
      // Start transaction by creating order first
      const { items, ...orderFields } = orderData;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: orderFields.customer_id,
          tenant_id: orderFields.tenant_id,
          store_id: orderFields.store_id || null,
          total_amount: orderFields.total_amount,
          tax_amount: orderFields.tax_amount || 0,
          delivery_fee: orderFields.delivery_fee || 0,
          status: orderFields.status || 'PENDING',
          delivery_address: orderFields.delivery_address,
          customer_info: orderFields.customer_info,
          payment_status: 'PENDING',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Create order items if items array provided
      if (items && Array.isArray(items) && items.length > 0) {
        const orderItems = (items as any[]).map((item: any) => ({
          order_id: order.id,
          menu_item_id: item.item_id || item.id,
          quantity: item.quantity || 1,
          unit_price: item.price,
          subtotal: (item.price || 0) * (item.quantity || 1),
          special_instructions: item.special_instructions || null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Order items creation error:', itemsError);
          // Rollback order creation
          await supabase.from('orders').delete().eq('id', order.id);
          throw new Error(`Failed to create order items: ${itemsError.message}`);
        }
      }

      return order;
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          store:stores(name, address, city, state),
          driver:drivers(name, phone, vehicle_info)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    list: async (filters?: any) => {
      let query = supabase.from('orders').select('*');
      
      if (filters?.brand) {
        query = query.eq('tenant_id', filters.brand);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return { orders: data || [] };
    },

    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    assignDriver: async (orderId: string, driverId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          driver_id: driverId,
          status: 'ASSIGNED',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // STORES
  // ============================================
  stores: {
    list: async (filters?: { brand?: string }) => {
      let query = supabase.from('stores').select('*').eq('status', 'ACTIVE');
      
      if (filters?.brand) {
        query = query.eq('tenant_id', filters.brand);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return { stores: data || [] };
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (store: any) => {
      const { data, error } = await supabase
        .from('stores')
        .insert([store])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // CUSTOMERS
  // ============================================
  customers: {
    create: async (customer: any) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    getByEmail: async (email: string) => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    },

    list: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { customers: data || [] };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // DRIVERS
  // ============================================
  drivers: {
    list: async (filters?: { status?: string; brand?: string }) => {
      let query = supabase.from('drivers').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.brand) {
        query = query.eq('tenant_id', filters.brand);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return { drivers: data || [] };
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (driver: any) => {
      const { data, error } = await supabase
        .from('drivers')
        .insert([driver])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    updateLocation: async (id: string, latitude: number, longitude: number) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({ 
          current_location: { lat: latitude, lng: longitude },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // ANALYTICS
  // ============================================
  analytics: {
    getDashboard: async (brand?: string) => {
      // Get real-time analytics from database
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      
      let ordersQuery = supabase
        .from('orders')
        .select('total_amount, status, created_at');
      
      if (brand) {
        ordersQuery = ordersQuery.eq('tenant_id', brand);
      }
      
      const { data: orders, error } = await ordersQuery
        .gte('created_at', startOfDay);
      
      if (error) throw error;
      
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
      
      return {
        revenue: {
          today: totalRevenue,
          thisWeek: totalRevenue * 7, // Simplified
          thisMonth: totalRevenue * 30, // Simplified
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: orders?.filter(o => o.status === 'DELIVERED').length || 0,
        },
      };
    },

    getMetrics: async (filters?: any) => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at, tenant_id')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      return {
        totalRevenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        totalOrders: data?.length || 0,
        averageOrderValue: data?.length ? 
          (data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length) : 0,
      };
    }
  },

  // ============================================
  // INVENTORY
  // ============================================
  inventory: {
    list: async (filters?: { store_id?: string }) => {
      let query = supabase.from('inventory_items').select('*');

      if (filters?.store_id) {
        query = query.eq('store_id', filters.store_id);
      }

      const { data, error } = await query.order('item_name');

      if (error) throw error;
      return { items: data || [] };
    },

    updateQuantity: async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set' = 'set') => {
      if (operation === 'set') {
        const { data, error } = await supabase
          .from('inventory_items')
          .update({ quantity: quantity })
          .eq('item_id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // For add/subtract, we need to fetch current value first
      const { data: current } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('item_id', id)
        .single();

      const newQuantity = operation === 'add'
        ? (current?.quantity || 0) + quantity
        : (current?.quantity || 0) - quantity;

      const { data, error } = await supabase
        .from('inventory_items')
        .update({ quantity: Math.max(0, newQuantity) })
        .eq('item_id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // PAYMENTS
  // ============================================
  payments: {
    process: async (paymentData: any) => {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // LOYALTY PROGRAMS
  // ============================================
  loyalty: {
    getPoints: async (customerId: string) => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('customer_id', customerId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.points_balance || 0;
    },

    addPoints: async (customerId: string, points: number, reason: string) => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .upsert([{
          customer_id: customerId,
          points_balance: points,
          last_transaction: reason,
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // ============================================
  // COMPLIANCE & RISK
  // ============================================
  compliance: {
    getStatus: async () => {
      const { data, error } = await supabase
        .from('compliance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || { status: 'COMPLIANT' };
    },

    logEvent: async (event: any) => {
      const { data, error } = await supabase
        .from('compliance_logs')
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

export default supabaseAPI;
