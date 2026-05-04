import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-89a553ba/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
      customer_id: body.customer_id,
      store_id: body.store_id,
      brand: body.brand,
      campus_id: body.campus_id,
      dorm_id: body.dorm_id,
      room_number: body.room_number,
      items: body.items || [],
      total_amount: body.total_amount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    
    // Log metric
    await kv.set(`metric:order_created:${orderId}:${Date.now()}`, {
      event: 'ORDER_CREATED',
      order_id: orderId,
      brand: body.brand,
      amount: body.total_amount,
      timestamp: new Date().toISOString(),
    });

    return c.json({ data: order }, 201);
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    console.log(`Get driver error: ${err}`);
    return c.json({ error: "Failed to get driver" }, 500);
  }
});

// Assign driver to order
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
  } catch (err) {
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
  } catch (err) {
    console.log(`List drivers error: ${err}`);
    return c.json({ error: "Failed to list drivers" }, 500);
  }
});

// ========================================
// STAFF SERVICE
// ========================================

// Create staff member
app.post("/make-server-89a553ba/staff", async (c) => {
  try {
    const body = await c.req.json();
    const staffId = crypto.randomUUID();
    
    const staff = {
      id: staffId,
      name: body.name,
      email: body.email,
      role: body.role, // MANAGER, CHEF, CASHIER, etc.
      store_id: body.store_id,
      phone: body.phone,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    await kv.set(`staff:${staffId}`, staff);
    return c.json({ data: staff }, 201);
  } catch (err) {
    console.log(`Create staff error: ${err}`);
    return c.json({ error: "Failed to create staff member" }, 500);
  }
});

// List staff
app.get("/make-server-89a553ba/staff", async (c) => {
  try {
    const store_id = c.req.query("store_id");
    const role = c.req.query("role");
    const staff = await kv.getByPrefix("staff:");
    
    let filteredStaff = staff;
    if (store_id) {
      filteredStaff = filteredStaff.filter((s: any) => s.store_id === store_id);
    }
    if (role) {
      filteredStaff = filteredStaff.filter((s: any) => s.role === role);
    }

    return c.json({ data: filteredStaff });
  } catch (err) {
    console.log(`List staff error: ${err}`);
    return c.json({ error: "Failed to list staff" }, 500);
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
      payment_method: body.payment_method, // CREDIT_CARD, PAYPAL, APPLE_PAY, etc.
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
  } catch (err) {
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
  } catch (err) {
    console.log(`Get payment error: ${err}`);
    return c.json({ error: "Failed to get payment" }, 500);
  }
});

// ========================================
// METRICS SERVICE
// ========================================

// Log metric
app.post("/make-server-89a553ba/metrics", async (c) => {
  try {
    const body = await c.req.json();
    const metricId = crypto.randomUUID();
    
    const metric = {
      id: metricId,
      name: body.name,
      value: body.value,
      unit: body.unit,
      tags: body.tags || {},
      timestamp: new Date().toISOString(),
    };

    await kv.set(`metric:${body.name}:${metricId}:${Date.now()}`, metric);
    return c.json({ data: metric }, 201);
  } catch (err) {
    console.log(`Log metric error: ${err}`);
    return c.json({ error: "Failed to log metric" }, 500);
  }
});

// Get metrics
app.get("/make-server-89a553ba/metrics", async (c) => {
  try {
    const name = c.req.query("name");
    const prefix = name ? `metric:${name}:` : "metric:";
    const metrics = await kv.getByPrefix(prefix);
    
    return c.json({ data: metrics });
  } catch (err) {
    console.log(`Get metrics error: ${err}`);
    return c.json({ error: "Failed to get metrics" }, 500);
  }
});

// ========================================
// COMPLIANCE SERVICE
// ========================================

// Log compliance event
app.post("/make-server-89a553ba/compliance", async (c) => {
  try {
    const body = await c.req.json();
    const eventId = crypto.randomUUID();
    
    const event = {
      id: eventId,
      event_type: body.event_type,
      details: body.details,
      severity: body.severity || 'INFO',
      timestamp: new Date().toISOString(),
    };

    await kv.set(`compliance:${body.event_type}:${eventId}:${Date.now()}`, event);
    return c.json({ data: event }, 201);
  } catch (err) {
    console.log(`Log compliance event error: ${err}`);
    return c.json({ error: "Failed to log compliance event" }, 500);
  }
});

// Get compliance events
app.get("/make-server-89a553ba/compliance", async (c) => {
  try {
    const event_type = c.req.query("event_type");
    const prefix = event_type ? `compliance:${event_type}:` : "compliance:";
    const events = await kv.getByPrefix(prefix);
    
    return c.json({ data: events });
  } catch (err) {
    console.log(`Get compliance events error: ${err}`);
    return c.json({ error: "Failed to get compliance events" }, 500);
  }
});

// ========================================
// NOTIFICATIONS SERVICE
// ========================================

// Send notification
app.post("/make-server-89a553ba/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const notificationId = crypto.randomUUID();
    
    const notification = {
      id: notificationId,
      user_id: body.user_id,
      type: body.type, // EMAIL, SMS, PUSH
      channel: body.channel,
      message: body.message,
      status: 'SENT',
      created_at: new Date().toISOString(),
    };

    await kv.set(`notification:${notificationId}`, notification);
    return c.json({ data: notification }, 201);
  } catch (err) {
    console.log(`Send notification error: ${err}`);
    return c.json({ error: "Failed to send notification" }, 500);
  }
});

// Get notifications for user
app.get("/make-server-89a553ba/notifications/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const notifications = await kv.getByPrefix("notification:");
    const userNotifications = notifications.filter((n: any) => n.user_id === userId);
    
    return c.json({ data: userNotifications });
  } catch (err) {
    console.log(`Get notifications error: ${err}`);
    return c.json({ error: "Failed to get notifications" }, 500);
  }
});

// ========================================
// GRC (Governance, Risk, Compliance) SERVICE
// ========================================

// Create policy
app.post("/make-server-89a553ba/grc/policies", async (c) => {
  try {
    const body = await c.req.json();
    const policyId = crypto.randomUUID();
    
    const policy = {
      id: policyId,
      name: body.name,
      description: body.description,
      category: body.category,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    await kv.set(`grc:policy:${policyId}`, policy);
    return c.json({ data: policy }, 201);
  } catch (err) {
    console.log(`Create policy error: ${err}`);
    return c.json({ error: "Failed to create policy" }, 500);
  }
});

// Log risk event
app.post("/make-server-89a553ba/grc/risks", async (c) => {
  try {
    const body = await c.req.json();
    const riskId = crypto.randomUUID();
    
    const risk = {
      id: riskId,
      category: body.category,
      description: body.description,
      severity: body.severity, // LOW, MEDIUM, HIGH, CRITICAL
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    await kv.set(`grc:risk:${riskId}`, risk);
    return c.json({ data: risk }, 201);
  } catch (err) {
    console.log(`Log risk error: ${err}`);
    return c.json({ error: "Failed to log risk" }, 500);
  }
});

// Get all policies
app.get("/make-server-89a553ba/grc/policies", async (c) => {
  try {
    const policies = await kv.getByPrefix("grc:policy:");
    return c.json({ data: policies });
  } catch (err) {
    console.log(`Get policies error: ${err}`);
    return c.json({ error: "Failed to get policies" }, 500);
  }
});

// Get all risks
app.get("/make-server-89a553ba/grc/risks", async (c) => {
  try {
    const risks = await kv.getByPrefix("grc:risk:");
    return c.json({ data: risks });
  } catch (err) {
    console.log(`Get risks error: ${err}`);
    return c.json({ error: "Failed to get risks" }, 500);
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
    const totalRevenue = payments.reduce((sum: number, p: any) => 
      p.status === 'COMPLETED' ? sum + (p.amount || 0) : sum, 0
    );
    const activeDrivers = drivers.filter((d: any) => d.status === 'AVAILABLE').length;
    const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
    const totalCustomers = customers.filter((c: any) => c.id).length;

    return c.json({
      data: {
        totalOrders,
        totalRevenue,
        activeDrivers,
        pendingOrders,
        totalCustomers,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.log(`Get analytics error: ${err}`);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});

Deno.serve(app.fetch);