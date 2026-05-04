/**
 * Mock Backend - Works Immediately Without Deployment
 * Use this while deploying the real Supabase backend
 */

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
const mockDB = {
  customers: [] as any[],
  orders: [] as any[],
  stores: [] as any[],
  inventory: [] as any[],
  drivers: [] as any[],
  staff: [] as any[],
  payments: [] as any[],
  metrics: [] as any[],
};

// Generate IDs
let idCounter = 1000;
const generateId = () => `mock_${idCounter++}`;

export const mockBackend = {
  // Health check
  async health() {
    await delay(100);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mode: 'MOCK',
      message: 'Mock backend running. Deploy real backend for production.'
    };
  },

  // Analytics
  async getAnalytics() {
    await delay(300);
    return {
      totalRevenue: 124750.50,
      totalOrders: 1247,
      activeCustomers: 892,
      averageOrderValue: 100.04,
      ordersByBrand: {
        'chic-on-chain': 847,
        'ghetto-eats': 400
      },
      revenueByBrand: {
        'chic-on-chain': 84750.50,
        'ghetto-eats': 40000.00
      },
      topProducts: [
        { name: 'Classic Fried Chicken', quantity: 542, revenue: 8127.58 },
        { name: 'Spicy Sandwich', quantity: 389, revenue: 5053.11 },
        { name: 'Tenders Combo', quantity: 312, revenue: 5300.88 }
      ],
      recentOrders: mockDB.orders.slice(-10).reverse()
    };
  },

  // Customers
  async createCustomer(data: any) {
    await delay(200);
    const customer = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      loyalty_points: 0
    };
    mockDB.customers.push(customer);
    return customer;
  },

  async getCustomer(id: string) {
    await delay(100);
    const customer = mockDB.customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  async getCustomerByEmail(email: string) {
    await delay(100);
    const customer = mockDB.customers.find(c => c.email === email);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  async listCustomers() {
    await delay(150);
    return mockDB.customers;
  },

  // Orders
  async createOrder(data: any) {
    await delay(250);
    const order = {
      id: generateId(),
      order_number: `ORD-${Date.now()}`,
      ...data,
      status: data.status || 'pending',
      created_at: new Date().toISOString()
    };
    mockDB.orders.push(order);
    return order;
  },

  async getOrder(id: string) {
    await delay(100);
    const order = mockDB.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async updateOrderStatus(id: string, status: string) {
    await delay(150);
    const order = mockDB.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updated_at = new Date().toISOString();
    return order;
  },

  async listOrders(filters?: any) {
    await delay(150);
    let orders = [...mockDB.orders];
    
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters?.customer_id) {
      orders = orders.filter(o => o.customer_id === filters.customer_id);
    }
    if (filters?.brand) {
      orders = orders.filter(o => o.brand === filters.brand);
    }
    
    return orders;
  },

  // Stores
  async createStore(data: any) {
    await delay(200);
    const store = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    };
    mockDB.stores.push(store);
    return store;
  },

  async getStore(id: string) {
    await delay(100);
    const store = mockDB.stores.find(s => s.id === id);
    if (!store) throw new Error('Store not found');
    return store;
  },

  async listStores(filters?: any) {
    await delay(150);
    let stores = [...mockDB.stores];
    
    if (filters?.brand) {
      stores = stores.filter(s => s.brand === filters.brand);
    }
    
    return stores;
  },

  // Drivers
  async createDriver(data: any) {
    await delay(200);
    const driver = {
      id: generateId(),
      ...data,
      status: 'available',
      created_at: new Date().toISOString()
    };
    mockDB.drivers.push(driver);
    return driver;
  },

  async getDriver(id: string) {
    await delay(100);
    const driver = mockDB.drivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    return driver;
  },

  async assignDriver(driverId: string, orderId: string) {
    await delay(150);
    const driver = mockDB.drivers.find(d => d.id === driverId);
    const order = mockDB.orders.find(o => o.id === orderId);
    
    if (!driver) throw new Error('Driver not found');
    if (!order) throw new Error('Order not found');
    
    driver.status = 'busy';
    driver.current_order = orderId;
    order.driver_id = driverId;
    order.status = 'assigned';
    
    return { driver, order };
  },

  async listDrivers(filters?: any) {
    await delay(150);
    let drivers = [...mockDB.drivers];
    
    if (filters?.status) {
      drivers = drivers.filter(d => d.status === filters.status);
    }
    
    return drivers;
  },

  // Inventory
  async createInventoryItem(data: any) {
    await delay(200);
    const item = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    };
    mockDB.inventory.push(item);
    return item;
  },

  async getInventoryItem(id: string) {
    await delay(100);
    const item = mockDB.inventory.find(i => i.id === id);
    if (!item) throw new Error('Inventory item not found');
    return item;
  },

  async updateInventoryQuantity(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    await delay(150);
    const item = mockDB.inventory.find(i => i.id === id);
    if (!item) throw new Error('Inventory item not found');
    
    if (operation === 'set') {
      item.quantity = quantity;
    } else if (operation === 'add') {
      item.quantity += quantity;
    } else if (operation === 'subtract') {
      item.quantity -= quantity;
    }
    
    item.updated_at = new Date().toISOString();
    return item;
  },

  async listInventory(filters?: any) {
    await delay(150);
    let items = [...mockDB.inventory];
    
    if (filters?.store_id) {
      items = items.filter(i => i.store_id === filters.store_id);
    }
    if (filters?.category) {
      items = items.filter(i => i.category === filters.category);
    }
    
    return items;
  },

  // Payments
  async processPayment(data: any) {
    await delay(300);
    const payment = {
      id: generateId(),
      ...data,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    mockDB.payments.push(payment);
    return payment;
  },

  async getPayment(id: string) {
    await delay(100);
    const payment = mockDB.payments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return payment;
  }
};

// Pre-populate with sample data
const initMockData = () => {
  // Sample customers
  mockDB.customers.push(
    {
      id: 'mock_1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      loyalty_points: 250,
      created_at: '2026-04-15T10:00:00Z'
    },
    {
      id: 'mock_2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+1234567891',
      loyalty_points: 180,
      created_at: '2026-04-16T11:00:00Z'
    }
  );

  // Sample stores
  mockDB.stores.push(
    {
      id: 'store_1',
      brand: 'chic-on-chain',
      name: 'Chic-on-Chain Downtown',
      address: '123 Main St, City, ST 12345',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 'store_2',
      brand: 'ghetto-eats',
      name: 'Ghetto Eats Hub',
      address: '456 Oak Ave, City, ST 12345',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z'
    }
  );

  // Sample orders
  mockDB.orders.push(
    {
      id: 'order_1',
      order_number: 'ORD-1000001',
      customer_id: 'mock_1',
      store_id: 'store_1',
      brand: 'chic-on-chain',
      items: [
        { name: 'Classic Fried Chicken', quantity: 2, price: 14.99 }
      ],
      total: 29.98,
      status: 'completed',
      created_at: '2026-04-20T14:30:00Z'
    },
    {
      id: 'order_2',
      order_number: 'ORD-1000002',
      customer_id: 'mock_2',
      store_id: 'store_1',
      brand: 'chic-on-chain',
      items: [
        { name: 'Spicy Sandwich', quantity: 1, price: 12.99 },
        { name: 'Fries', quantity: 1, price: 4.99 }
      ],
      total: 17.98,
      status: 'preparing',
      created_at: '2026-04-21T12:00:00Z'
    }
  );

  // Sample drivers
  mockDB.drivers.push(
    {
      id: 'driver_1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      status: 'available',
      vehicle_type: 'car',
      license_plate: 'ABC123',
      created_at: '2026-03-01T00:00:00Z'
    }
  );
};

// Initialize mock data
initMockData();
