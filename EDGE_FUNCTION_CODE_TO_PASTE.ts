// ============================================
// GLENKEOS BACKEND - SUPABASE EDGE FUNCTION
// Copy this ENTIRE file and paste into Supabase Dashboard
// ============================================

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ============================================
// KV STORE (included inline)
// ============================================
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
};

const KV_TABLE = "kv_store_89a553ba";

const kv = {
  async set(key: string, value: any): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(KV_TABLE).upsert({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async get(key: string): Promise<any> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select("value")
      .eq("key", key)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data ? JSON.parse(data.value) : null;
  },

  async mget(keys: string[]): Promise<any[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select("key, value")
      .in("key", keys);
    if (error) throw error;
    return (data || []).map((row) => JSON.parse(row.value));
  },

  async del(key: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(KV_TABLE).delete().eq("key", key);
    if (error) throw error;
  },

  async getByPrefix(prefix: string): Promise<any[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select("value")
      .like("key", `${prefix}%`);
    if (error) throw error;
    return (data || []).map((row) => JSON.parse(row.value));
  }
};

// ============================================
// HONO APP
// ============================================
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/make-server-89a553ba/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mode: "production",
    message: "GlenKeos backend is running!"
  });
});

// Analytics Dashboard
app.get("/make-server-89a553ba/analytics/dashboard", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    const customers = await kv.getByPrefix("customer:");
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeCustomers = customers.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByBrand: Record<string, number> = {};
    const revenueByBrand: Record<string, number> = {};
    
    orders.forEach(order => {
      const brand = order.brand || 'unknown';
      ordersByBrand[brand] = (ordersByBrand[brand] || 0) + 1;
      revenueByBrand[brand] = (revenueByBrand[brand] || 0) + (order.total || 0);
    });

    return c.json({
      totalRevenue,
      totalOrders,
      activeCustomers,
      averageOrderValue,
      ordersByBrand,
      revenueByBrand,
      topProducts: [],
      recentOrders: orders.slice(-10).reverse()
    });
  } catch (err: any) {
    console.log(`Analytics error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// CUSTOMERS
// ========================================

app.post("/make-server-89a553ba/customers", async (c) => {
  try {
    const body = await c.req.json();
    const customerId = crypto.randomUUID();
    
    const customer = {
      id: customerId,
      email: body.email,
      name: body.name,
      phone: body.phone || null,
      loyalty_points: 0,
      tier: 'STANDARD',
      created_at: new Date().toISOString(),
    };

    await kv.set(`customer:${customerId}`, customer);
    await kv.set(`customer:email:${body.email}`, customerId);

    return c.json({ data: customer }, 201);
  } catch (err: any) {
    console.log(`Create customer error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json({ data: customer });
  } catch (err: any) {
    console.log(`Get customer error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/customers/email/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const customerId = await kv.get(`customer:email:${email}`);
    
    if (!customerId) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const customer = await kv.get(`customer:${customerId}`);
    return c.json({ data: customer });
  } catch (err: any) {
    console.log(`Get customer by email error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    const filtered = customers.filter(c => c && c.id);
    return c.json({ data: filtered });
  } catch (err: any) {
    console.log(`List customers error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// ORDERS
// ========================================

app.post("/make-server-89a553ba/orders", async (c) => {
  try {
    const body = await c.req.json();
    const orderId = crypto.randomUUID();
    
    const order = {
      id: orderId,
      order_number: `ORD-${Date.now()}`,
      customer_id: body.customer_id,
      store_id: body.store_id,
      brand: body.brand,
      items: body.items,
      total: body.total,
      status: body.status || 'pending',
      created_at: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    return c.json({ data: order }, 201);
  } catch (err: any) {
    console.log(`Create order error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ data: order });
  } catch (err: any) {
    console.log(`Get order error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/orders", async (c) => {
  try {
    let orders = await kv.getByPrefix("order:");
    
    const status = c.req.query("status");
    const customerId = c.req.query("customer_id");
    const brand = c.req.query("brand");
    
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (customerId) {
      orders = orders.filter(o => o.customer_id === customerId);
    }
    if (brand) {
      orders = orders.filter(o => o.brand === brand);
    }

    return c.json({ data: orders });
  } catch (err: any) {
    console.log(`List orders error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.patch("/make-server-89a553ba/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    order.status = body.status;
    order.updated_at = new Date().toISOString();
    
    await kv.set(`order:${id}`, order);
    return c.json({ data: order });
  } catch (err: any) {
    console.log(`Update order status error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// STORES
// ========================================

app.post("/make-server-89a553ba/stores", async (c) => {
  try {
    const body = await c.req.json();
    const storeId = crypto.randomUUID();
    
    const store = {
      id: storeId,
      brand: body.brand,
      name: body.name,
      address: body.address,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
    };

    await kv.set(`store:${storeId}`, store);
    return c.json({ data: store }, 201);
  } catch (err: any) {
    console.log(`Create store error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/stores/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const store = await kv.get(`store:${id}`);
    
    if (!store) {
      return c.json({ error: "Store not found" }, 404);
    }

    return c.json({ data: store });
  } catch (err: any) {
    console.log(`Get store error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/stores", async (c) => {
  try {
    let stores = await kv.getByPrefix("store:");
    
    const brand = c.req.query("brand");
    if (brand) {
      stores = stores.filter(s => s.brand === brand);
    }

    return c.json({ data: stores });
  } catch (err: any) {
    console.log(`List stores error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// DRIVERS
// ========================================

app.post("/make-server-89a553ba/drivers", async (c) => {
  try {
    const body = await c.req.json();
    const driverId = crypto.randomUUID();
    
    const driver = {
      id: driverId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: 'available',
      vehicle_type: body.vehicle_type,
      license_plate: body.license_plate,
      created_at: new Date().toISOString(),
    };

    await kv.set(`driver:${driverId}`, driver);
    return c.json({ data: driver }, 201);
  } catch (err: any) {
    console.log(`Create driver error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/drivers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const driver = await kv.get(`driver:${id}`);
    
    if (!driver) {
      return c.json({ error: "Driver not found" }, 404);
    }

    return c.json({ data: driver });
  } catch (err: any) {
    console.log(`Get driver error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/drivers", async (c) => {
  try {
    let drivers = await kv.getByPrefix("driver:");
    
    const status = c.req.query("status");
    if (status) {
      drivers = drivers.filter(d => d.status === status);
    }

    return c.json({ data: drivers });
  } catch (err: any) {
    console.log(`List drivers error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.post("/make-server-89a553ba/drivers/:id/assign", async (c) => {
  try {
    const driverId = c.req.param("id");
    const body = await c.req.json();
    const orderId = body.order_id;
    
    const driver = await kv.get(`driver:${driverId}`);
    const order = await kv.get(`order:${orderId}`);
    
    if (!driver) {
      return c.json({ error: "Driver not found" }, 404);
    }
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    driver.status = 'busy';
    driver.current_order = orderId;
    order.driver_id = driverId;
    order.status = 'assigned';

    await kv.set(`driver:${driverId}`, driver);
    await kv.set(`order:${orderId}`, order);

    return c.json({ data: { driver, order } });
  } catch (err: any) {
    console.log(`Assign driver error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// INVENTORY
// ========================================

app.post("/make-server-89a553ba/inventory", async (c) => {
  try {
    const body = await c.req.json();
    const itemId = crypto.randomUUID();
    
    const item = {
      id: itemId,
      store_id: body.store_id,
      name: body.name,
      category: body.category,
      quantity: body.quantity || 0,
      created_at: new Date().toISOString(),
    };

    await kv.set(`inventory:${itemId}`, item);
    return c.json({ data: item }, 201);
  } catch (err: any) {
    console.log(`Create inventory error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`inventory:${id}`);
    
    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    return c.json({ data: item });
  } catch (err: any) {
    console.log(`Get inventory error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/inventory", async (c) => {
  try {
    let items = await kv.getByPrefix("inventory:");
    
    const storeId = c.req.query("store_id");
    const category = c.req.query("category");
    
    if (storeId) {
      items = items.filter(i => i.store_id === storeId);
    }
    if (category) {
      items = items.filter(i => i.category === category);
    }

    return c.json({ data: items });
  } catch (err: any) {
    console.log(`List inventory error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.patch("/make-server-89a553ba/inventory/:id/quantity", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const item = await kv.get(`inventory:${id}`);
    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const { quantity, operation } = body;
    
    if (operation === 'set') {
      item.quantity = quantity;
    } else if (operation === 'add') {
      item.quantity += quantity;
    } else if (operation === 'subtract') {
      item.quantity -= quantity;
    }

    item.updated_at = new Date().toISOString();
    await kv.set(`inventory:${id}`, item);
    
    return c.json({ data: item });
  } catch (err: any) {
    console.log(`Update inventory quantity error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// ========================================
// PAYMENTS
// ========================================

app.post("/make-server-89a553ba/payments", async (c) => {
  try {
    const body = await c.req.json();
    const paymentId = crypto.randomUUID();
    
    const payment = {
      id: paymentId,
      order_id: body.order_id,
      amount: body.amount,
      method: body.method,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    await kv.set(`payment:${paymentId}`, payment);
    return c.json({ data: payment }, 201);
  } catch (err: any) {
    console.log(`Process payment error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-89a553ba/payments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const payment = await kv.get(`payment:${id}`);
    
    if (!payment) {
      return c.json({ error: "Payment not found" }, 404);
    }

    return c.json({ data: payment });
  } catch (err: any) {
    console.log(`Get payment error: ${err.message}`);
    return c.json({ error: err.message }, 500);
  }
});

// Start server
Deno.serve(app.fetch);
