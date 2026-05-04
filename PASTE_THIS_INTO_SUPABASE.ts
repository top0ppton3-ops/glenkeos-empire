// ============================================
// GLENKEOS COMPLETE BACKEND
// This is a single-file version combining index.tsx + kv_store.tsx
// Copy this ENTIRE file and paste into Supabase Dashboard
// ============================================

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ============================================
// KV STORE (inline)
// ============================================
const getKVClient = () => createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const supabase = getKVClient();
    const { error } = await supabase.from("kv_store_89a553ba").upsert({ key, value });
    if (error) throw new Error(error.message);
  },

  get: async (key: string): Promise<any> => {
    const supabase = getKVClient();
    const { data, error } = await supabase.from("kv_store_89a553ba").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },

  del: async (key: string): Promise<void> => {
    const supabase = getKVClient();
    const { error } = await supabase.from("kv_store_89a553ba").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },

  mset: async (keys: string[], values: any[]): Promise<void> => {
    const supabase = getKVClient();
    const { error } = await supabase.from("kv_store_89a553ba").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
    if (error) throw new Error(error.message);
  },

  mget: async (keys: string[]): Promise<any[]> => {
    const supabase = getKVClient();
    const { data, error } = await supabase.from("kv_store_89a553ba").select("value").in("key", keys);
    if (error) throw new Error(error.message);
    return data?.map((d) => d.value) ?? [];
  },

  mdel: async (keys: string[]): Promise<void> => {
    const supabase = getKVClient();
    const { error } = await supabase.from("kv_store_89a553ba").delete().in("key", keys);
    if (error) throw new Error(error.message);
  },

  getByPrefix: async (prefix: string): Promise<any[]> => {
    const supabase = getKVClient();
    const { data, error } = await supabase.from("kv_store_89a553ba").select("key, value").like("key", prefix + "%");
    if (error) throw new Error(error.message);
    return data?.map((d) => d.value) ?? [];
  }
};

// ============================================
// HONO APP
// ============================================
const app = new Hono();

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
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

// Health check endpoint
app.get("/make-server-89a553ba/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString(), mode: "production" });
});

// ========================================
// AUTHENTICATION SERVICE
// ========================================

// Sign up endpoint
app.post("/make-server-89a553ba/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { 
        name: body.name,
        role: body.role || 'customer'
      },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user }, 201);
  } catch (err: any) {
    console.log(`Signup exception: ${err}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Sign in endpoint (frontend handles this via Supabase client)
app.post("/make-server-89a553ba/auth/signin", async (c) => {
  return c.json({ 
    message: "Use Supabase client auth.signInWithPassword on frontend" 
  });
});

// ========================================
// CUSTOMER SERVICE
// ========================================

// Create customer
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
    console.log(`Create customer error: ${err}`);
    return c.json({ error: "Failed to create customer" }, 500);
  }
});

// Get customer by ID
app.get("/make-server-89a553ba/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json({ data: customer });
  } catch (err: any) {
    console.log(`Get customer error: ${err}`);
    return c.json({ error: "Failed to get customer" }, 500);
  }
});

// Get customer by email
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
    console.log(`Get customer by email error: ${err}`);
    return c.json({ error: "Failed to get customer" }, 500);
  }
});

// List all customers
app.get("/make-server-89a553ba/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    const filteredCustomers = customers.filter((c: any) => c.id); // Filter out email mappings
    return c.json({ data: filteredCustomers });
  } catch (err: any) {
    console.log(`List customers error: ${err}`);
    return c.json({ error: "Failed to list customers" }, 500);
  }
});

// ========================================
// STORE SERVICE
// ========================================

// Create store
app.post("/make-server-89a553ba/stores", async (c) => {
  try {
    const body = await c.req.json();
    const storeId = crypto.randomUUID();
    
    const store = {
      id: storeId,
      brand: body.brand, // CHIC_ON_CHAIN, GHETTO_EATS
      name: body.name,
      campus_id: body.campus_id,
      location: body.location,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    await kv.set(`store:${storeId}`, store);
    return c.json({ data: store }, 201);
  } catch (err: any) {
    console.log(`Create store error: ${err}`);
    return c.json({ error: "Failed to create store" }, 500);
  }
});

// Get store by ID
app.get("/make-server-89a553ba/stores/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const store = await kv.get(`store:${id}`);

    if (!store) {
      return c.json({ error: "Store not found" }, 404);
    }

    return c.json({ data: store });
  } catch (err: any) {
    console.log(`Get store error: ${err}`);
    return c.json({ error: "Failed to get store" }, 500);
  }
});

// List all stores
app.get("/make-server-89a553ba/stores", async (c) => {
  try {
    const brand = c.req.query("brand");
    const stores = await kv.getByPrefix("store:");
    
    let filteredStores = stores;
    if (brand) {
      filteredStores = stores.filter((s: any) => s.brand === brand);
    }

    return c.json({ data: filteredStores });
  } catch (err: any) {
    console.log(`List stores error: ${err}`);
    return c.json({ error: "Failed to list stores" }, 500);
  }
});

// ========================================
// ORDER SERVICE
// ========================================

// Create order
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
      campus_id: body.campus_id,
      dorm_id: body.dorm_id,
      room_number: body.room_number,
      items: body.items || [],
      total: body.total || body.total_amount,
      status: body.status || 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    
    // Log metric
    await kv.set(`metric:order_created:${orderId}:${Date.now()}`, {
      event: 'ORDER_CREATED',
      order_id: orderId,
      brand: body.brand,
      amount: order.total,
      timestamp: new Date().toISOString(),
    });

    return c.json({ data: order }, 201);
  } catch (err: any) {
    console.log(`Create order error: ${err}`);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Get order by ID
app.get("/make-server-89a553ba/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ data: order });
  } catch (err: any) {
    console.log(`Get order error: ${err}`);
    return c.json({ error: "Failed to get order" }, 500);
  }
});

// Update order status
app.put("/make-server-89a553ba/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const order = await kv.get(`order:${id}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      status: body.status,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`order:${id}`, updatedOrder);
    
    // Log compliance event
    await kv.set(`compliance:order_status_change:${id}:${Date.now()}`, {
      event: 'ORDER_STATUS_CHANGED',
      order_id: id,
      old_status: order.status,
      new_status: body.status,
      timestamp: new Date().toISOString(),
    });

    return c.json({ data: updatedOrder });
  } catch (err: any) {
    console.log(`Update order status error: ${err}`);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// PATCH version for compatibility
app.patch("/make-server-89a553ba/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const order = await kv.get(`order:${id}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      status: body.status,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`order:${id}`, updatedOrder);
    return c.json({ data: updatedOrder });
  } catch (err: any) {
    console.log(`Update order status error: ${err}`);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// List orders
app.get("/make-server-89a553ba/orders", async (c) => {
  try {
    const customer_id = c.req.query("customer_id");
    const status = c.req.query("status");
    const brand = c.req.query("brand");
    
    const orders = await kv.getByPrefix("order:");
    
    let filteredOrders = orders;
    if (customer_id) {
      filteredOrders = filteredOrders.filter((o: any) => o.customer_id === customer_id);
    }
    if (status) {
      filteredOrders = filteredOrders.filter((o: any) => o.status === status);
    }
    if (brand) {
      filteredOrders = filteredOrders.filter((o: any) => o.brand === brand);
    }

    return c.json({ data: filteredOrders });
  } catch (err: any) {
    console.log(`List orders error: ${err}`);
    return c.json({ error: "Failed to list orders" }, 500);
  }
});

// ========================================
// INVENTORY SERVICE
// ========================================

// Create inventory item
app.post("/make-server-89a553ba/inventory", async (c) => {
  try {
    const body = await c.req.json();
    const itemId = crypto.randomUUID();
    
    const item = {
      id: itemId,
      store_id: body.store_id,
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      quantity: body.quantity,
      low_stock_threshold: body.low_stock_threshold || 10,
      created_at: new Date().toISOString(),
    };

    await kv.set(`inventory:${itemId}`, item);
    return c.json({ data: item }, 201);
  } catch (err: any) {
    console.log(`Create inventory item error: ${err}`);
    return c.json({ error: "Failed to create inventory item" }, 500);
  }
});

// Get inventory item by ID
app.get("/make-server-89a553ba/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`inventory:${id}`);

    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    return c.json({ data: item });
  } catch (err: any) {
    console.log(`Get inventory item error: ${err}`);
    return c.json({ error: "Failed to get inventory item" }, 500);
  }
});

// Update inventory quantity
app.put("/make-server-89a553ba/inventory/:id/quantity", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const item = await kv.get(`inventory:${id}`);

    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const updatedItem = {
      ...item,
      quantity: body.quantity,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`inventory:${id}`, updatedItem);
    
    // Check low stock
    if (body.quantity <= item.low_stock_threshold) {
      await kv.set(`notification:low_stock:${id}:${Date.now()}`, {
        event: 'LOW_STOCK_ALERT',
        item_id: id,
        item_name: item.name,
        current_quantity: body.quantity,
        threshold: item.low_stock_threshold,
        timestamp: new Date().toISOString(),
      });
    }

    return c.json({ data: updatedItem });
  } catch (err: any) {
    console.log(`Update inventory quantity error: ${err}`);
    return c.json({ error: "Failed to update inventory quantity" }, 500);
  }
});

// PATCH version for compatibility
app.patch("/make-server-89a553ba/inventory/:id/quantity", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const item = await kv.get(`inventory:${id}`);

    if (!item) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const { quantity, operation } = body;
    let newQuantity = item.quantity;
    
    if (operation === 'set') {
      newQuantity = quantity;
    } else if (operation === 'add') {
      newQuantity += quantity;
    } else if (operation === 'subtract') {
      newQuantity -= quantity;
    }

    const updatedItem = {
      ...item,
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`inventory:${id}`, updatedItem);
    return c.json({ data: updatedItem });
  } catch (err: any) {
    console.log(`Update inventory quantity error: ${err}`);
    return c.json({ error: "Failed to update inventory quantity" }, 500);
  }
});

// List inventory
app.get("/make-server-89a553ba/inventory", async (c) => {
  try {
    const store_id = c.req.query("store_id");
    const category = c.req.query("category");
    
    const items = await kv.getByPrefix("inventory:");
    
    let filteredItems = items;
    if (store_id) {
      filteredItems = filteredItems.filter((i: any) => i.store_id === store_id);
    }
    if (category) {
      filteredItems = filteredItems.filter((i: any) => i.category === category);
    }

    return c.json({ data: filteredItems });
  } catch (err: any) {
    console.log(`List inventory error: ${err}`);
    return c.json({ error: "Failed to list inventory" }, 500);
  }
});

// ========================================
// DRIVER SERVICE
// ========================================

// Create driver
app.post("/make-server-89a553ba/drivers", async (c) => {
  try {
    const body = await c.req.json();
    const driverId = crypto.randomUUID();
    
    const driver = {
      id: driverId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      vehicle_type: body.vehicle_type,
      license_plate: body.license_plate,
      status: 'AVAILABLE',
      current_location: body.current_location || null,
      created_at: new Date().toISOString(),
    };

    await kv.set(`driver:${driverId}`, driver);
    return c.json({ data: driver }, 201);
  } catch (err: any) {
    console.log(`Create driver error: ${err}`);
    return c.json({ error: "Failed to create driver" }, 500);
  }
});

// Get driver by ID
app.get("/make-server-89a553ba/drivers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const driver = await kv.get(`driver:${id}`);

    if (!driver) {
      return c.json({ error: "Driver not found" }, 404);
    }

    return c.json({ data: driver });
  } catch (err: any) {
    console.log(`Get driver error: ${err}`);
    return c.json({ error: "Failed to get driver" }, 500);
  }
});

// Assign driver to order (original route)
app.post("/make-server-89a553ba/drivers/:driverId/assign/:orderId", async (c) => {
  try {
    const driverId = c.req.param("driverId");
    const orderId = c.req.param("orderId");
    
    const driver = await kv.get(`driver:${driverId}`);
    const order = await kv.get(`order:${orderId}`);

    if (!driver) {
      return c.json({ error: "Driver not found" }, 404);
    }
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Update driver status
    const updatedDriver = {
      ...driver,
      status: 'ASSIGNED',
      current_order_id: orderId,
      updated_at: new Date().toISOString(),
    };
    await kv.set(`driver:${driverId}`, updatedDriver);

    // Update order
    const updatedOrder = {
      ...order,
      driver_id: driverId,
      status: 'ASSIGNED',
      updated_at: new Date().toISOString(),
    };
    await kv.set(`order:${orderId}`, updatedOrder);

    // Log event
    await kv.set(`metric:driver_assigned:${orderId}:${Date.now()}`, {
      event: 'DRIVER_ASSIGNED',
      driver_id: driverId,
      order_id: orderId,
      timestamp: new Date().toISOString(),
    });

    return c.json({ data: { driver: updatedDriver, order: updatedOrder } });
  } catch (err: any) {
    console.log(`Assign driver error: ${err}`);
    return c.json({ error: "Failed to assign driver" }, 500);
  }
});

// Assign driver (alternative route for API compatibility)
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

    // Update driver status
    const updatedDriver = {
      ...driver,
      status: 'ASSIGNED',
      current_order_id: orderId,
      updated_at: new Date().toISOString(),
    };
    await kv.set(`driver:${driverId}`, updatedDriver);

    // Update order
    const updatedOrder = {
      ...order,
      driver_id: driverId,
      status: 'ASSIGNED',
      updated_at: new Date().toISOString(),
    };
    await kv.set(`order:${orderId}`, updatedOrder);

    return c.json({ data: { driver: updatedDriver, order: updatedOrder } });
  } catch (err: any) {
    console.log(`Assign driver error: ${err}`);
    return c.json({ error: "Failed to assign driver" }, 500);
  }
});

// List drivers
app.get("/make-server-89a553ba/drivers", async (c) => {
  try {
    const status = c.req.query("status");
    const drivers = await kv.getByPrefix("driver:");
    
    let filteredDrivers = drivers;
    if (status) {
      filteredDrivers = drivers.filter((d: any) => d.status === status);
    }

    return c.json({ data: filteredDrivers });
  } catch (err: any) {
    console.log(`List drivers error: ${err}`);
    return c.json({ error: "Failed to list drivers" }, 500);
  }
});

// ========================================
// PAYMENTS SERVICE
// ========================================

// Create payment
app.post("/make-server-89a553ba/payments", async (c) => {
  try {
    const body = await c.req.json();
    const paymentId = crypto.randomUUID();
    
    const payment = {
      id: paymentId,
      order_id: body.order_id,
      customer_id: body.customer_id,
      amount: body.amount,
      payment_method: body.payment_method || body.method,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    await kv.set(`payment:${paymentId}`, payment);

    // Simulate payment processing
    const processedPayment = {
      ...payment,
      status: 'COMPLETED',
      transaction_id: `TXN_${Date.now()}`,
      processed_at: new Date().toISOString(),
    };
    await kv.set(`payment:${paymentId}`, processedPayment);

    // Log compliance event
    await kv.set(`compliance:payment:${paymentId}:${Date.now()}`, {
      event: 'PAYMENT_PROCESSED',
      payment_id: paymentId,
      amount: body.amount,
      timestamp: new Date().toISOString(),
    });

    return c.json({ data: processedPayment }, 201);
  } catch (err: any) {
    console.log(`Create payment error: ${err}`);
    return c.json({ error: "Failed to process payment" }, 500);
  }
});

// Get payment by ID
app.get("/make-server-89a553ba/payments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const payment = await kv.get(`payment:${id}`);

    if (!payment) {
      return c.json({ error: "Payment not found" }, 404);
    }

    return c.json({ data: payment });
  } catch (err: any) {
    console.log(`Get payment error: ${err}`);
    return c.json({ error: "Failed to get payment" }, 500);
  }
});

// ========================================
// ANALYTICS & DASHBOARD
// ========================================

// Get dashboard analytics
app.get("/make-server-89a553ba/analytics/dashboard", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    const customers = await kv.getByPrefix("customer:");
    const drivers = await kv.getByPrefix("driver:");
    const payments = await kv.getByPrefix("payment:");
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const activeDrivers = drivers.filter((d: any) => d.status === 'AVAILABLE').length;
    const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
    const activeCustomers = customers.filter((c: any) => c.id).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count by brand
    const ordersByBrand: Record<string, number> = {};
    const revenueByBrand: Record<string, number> = {};
    
    orders.forEach((order: any) => {
      const brand = order.brand || 'unknown';
      ordersByBrand[brand] = (ordersByBrand[brand] || 0) + 1;
      revenueByBrand[brand] = (revenueByBrand[brand] || 0) + (order.total || 0);
    });

    return c.json({
      totalRevenue,
      totalOrders,
      activeCustomers,
      averageOrderValue,
      activeDrivers,
      pendingOrders,
      ordersByBrand,
      revenueByBrand,
      topProducts: [],
      recentOrders: orders.slice(-10).reverse(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.log(`Get analytics error: ${err}`);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});

// Start server
Deno.serve(app.fetch);
