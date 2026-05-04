# 🎯 How to Use the GlenKeos API

## ✅ READY TO USE NOW - Mock Backend Active

Your GlenKeos platform is **fully functional right now** with a mock backend. No deployment needed!

---

## 📍 WHERE TO USE THE API

### 1. **Homepage Buttons**
Go to the homepage and click:
- **📚 API DEMO** - Interactive API examples
- **🔧 TEST BACKEND** - Health check & diagnostics

### 2. **Analytics Dashboard** 
**URL**: `/internal/analytics`

Already integrated! The analytics page loads real data from the mock backend:
```typescript
import api from '../../services/api';

const data = await api.analytics.getDashboard();
// Returns: { totalRevenue, totalOrders, activeCustomers, topProducts, etc. }
```

**What you see:**
- Total Revenue: $124,750.50
- Total Orders: 1,247
- Active Customers: 892
- Top Products with sales data
- Recent orders

### 3. **Operations Dashboard**
**URL**: `/internal/operations`

Use the API to manage:
```typescript
// List all customers
const customers = await api.customers.list();

// Create new customer
const customer = await api.customers.create({
  email: 'john@example.com',
  name: 'John Doe',
  phone: '+1234567890'
});

// List orders
const orders = await api.orders.list({ status: 'pending' });

// Update order status
await api.orders.updateStatus(orderId, 'completed');
```

### 4. **Any Component**
Import and use anywhere:
```typescript
import api from '../services/api';

// In your component
useEffect(() => {
  const loadData = async () => {
    const data = await api.analytics.getDashboard();
    setData(data);
  };
  loadData();
}, []);
```

---

## 🔧 AVAILABLE API METHODS

### Analytics
```typescript
api.analytics.getDashboard()
```

### Customers
```typescript
api.customers.create(data)
api.customers.get(id)
api.customers.getByEmail(email)
api.customers.list()
```

### Orders
```typescript
api.orders.create(data)
api.orders.get(id)
api.orders.list(filters)
api.orders.updateStatus(id, status)
```

### Stores
```typescript
api.stores.create(data)
api.stores.get(id)
api.stores.list(filters)
```

### Drivers
```typescript
api.drivers.create(data)
api.drivers.get(id)
api.drivers.list(filters)
api.drivers.assign(driverId, orderId)
```

### Inventory
```typescript
api.inventory.create(data)
api.inventory.get(id)
api.inventory.list(filters)
api.inventory.updateQuantity(id, quantity, operation)
```

### Payments
```typescript
api.payments.process(data)
api.payments.get(id)
```

### Health Check
```typescript
api.health()
```

---

## 📊 SAMPLE DATA INCLUDED

The mock backend comes pre-loaded with:

### Customers (2)
- John Doe (john.doe@example.com) - 250 loyalty points
- Jane Smith (jane.smith@example.com) - 180 loyalty points

### Stores (2)
- Chic-on-Chain Downtown
- Ghetto Eats Hub

### Orders (2)
- ORD-1000001 - $29.98 (completed)
- ORD-1000002 - $17.98 (preparing)

### Drivers (1)
- Mike Johnson (available)

---

## 🎨 EXAMPLE USAGE IN COMPONENTS

### Load Analytics Data
```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';

export function MyDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.analytics.getDashboard();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Revenue: ${analytics.totalRevenue}</h1>
      <p>Orders: {analytics.totalOrders}</p>
    </div>
  );
}
```

### Create Order
```typescript
const handleCreateOrder = async () => {
  try {
    const order = await api.orders.create({
      customer_id: 'mock_1',
      store_id: 'store_1',
      brand: 'chic-on-chain',
      items: [
        { name: 'Classic Fried Chicken', quantity: 2, price: 14.99 }
      ],
      total: 29.98
    });
    
    console.log('Order created:', order);
    alert(`Order ${order.order_number} created!`);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
};
```

### List & Filter Orders
```typescript
// Get all orders
const allOrders = await api.orders.list();

// Get pending orders only
const pendingOrders = await api.orders.list({ status: 'pending' });

// Get orders for specific customer
const customerOrders = await api.orders.list({ customer_id: 'mock_1' });

// Get orders for specific brand
const chicOrders = await api.orders.list({ brand: 'chic-on-chain' });
```

---

## 🔄 SWITCHING TO REAL BACKEND

When you deploy the Supabase backend:

1. Open `/src/app/services/api/index.ts`
2. Change line 10:
   ```typescript
   const USE_MOCK = false; // Set to false once deployed
   ```
3. Done! All API calls now go to real Supabase backend

---

## 📁 KEY FILES

- **API Service**: `/src/app/services/api/index.ts` - Main API interface
- **Mock Backend**: `/src/app/services/api/mockBackend.ts` - Mock data & logic
- **API Client**: `/src/app/services/api/client.ts` - HTTP client
- **Analytics Page**: `/src/app/pages/internal/Analytics.tsx` - Example usage
- **API Demo**: `/src/app/pages/ApiDemo.tsx` - Interactive examples
- **Backend Test**: `/src/app/components/BackendTest.tsx` - Health checks

---

## 🚀 QUICK START

1. **Test the API**: Go to `/api-demo` and click any example
2. **View Analytics**: Go to `/internal/analytics` (login with any email)
3. **Use in your code**: Import `api` and call any method
4. **Create data**: Use the API to create customers, orders, etc.

**Everything works immediately!** The mock backend simulates network delays and returns realistic data.

---

## 💡 TIPS

1. **All API calls are async** - Always use `await` or `.then()`
2. **Check console for errors** - Failed calls log detailed info
3. **Mock mode indicator** - Yellow banner shows when using mock backend
4. **Network simulation** - Mock backend adds realistic delays (100-300ms)
5. **Data persistence** - Mock data persists during page session (resets on refresh)

---

## ✅ NEXT STEPS

1. ✅ **Use the API now** - It's ready! No setup needed.
2. ✅ **Build features** - Create new components using the API
3. ✅ **Test functionality** - Create orders, customers, etc.
4. ⏳ **Deploy real backend** (later) - Follow `/DEPLOY_BACKEND_NOW.md`

**Start building now! The mock backend has everything you need.** 🎉
