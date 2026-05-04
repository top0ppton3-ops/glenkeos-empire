/**
 * API Demo Page - Shows how to use the GlenKeos API
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import api, { USE_MOCK } from '../services/api';
import { Link } from 'react-router';

export function ApiDemo() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runExample = async (exampleFn: () => Promise<any>, name: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await exampleFn();
      setResult({ success: true, name, data });
    } catch (error: any) {
      setResult({ success: false, name, error: error.message || String(error) });
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    {
      name: 'Get Analytics Dashboard',
      description: 'Load analytics data with revenue, orders, and top products',
      fn: () => api.analytics.getDashboard()
    },
    {
      name: 'List All Customers',
      description: 'Get all customers from the system',
      fn: () => api.customers.list()
    },
    {
      name: 'Create New Customer',
      description: 'Create a new customer account',
      fn: () => api.customers.create({
        email: `test${Date.now()}@example.com`,
        name: 'Test Customer',
        phone: '+1234567890'
      })
    },
    {
      name: 'List All Orders',
      description: 'Get all orders',
      fn: () => api.orders.list()
    },
    {
      name: 'Create New Order',
      description: 'Create a test order',
      fn: () => api.orders.create({
        customer_id: 'mock_1',
        store_id: 'store_1',
        brand: 'chic-on-chain',
        items: [
          { name: 'Test Item', quantity: 1, price: 9.99 }
        ],
        total: 9.99
      })
    },
    {
      name: 'List All Stores',
      description: 'Get all stores',
      fn: () => api.stores.list()
    },
    {
      name: 'List All Drivers',
      description: 'Get all delivery drivers',
      fn: () => api.drivers.list()
    },
    {
      name: 'Health Check',
      description: 'Check backend health status',
      fn: () => api.health()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">GlenKeos API Demo</h1>
          <p className="text-gray-600 mb-6">
            Interactive examples showing how to use the GlenKeos backend API in your components.
          </p>

          {USE_MOCK && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ MOCK MODE ACTIVE</strong><br />
                Currently using local mock backend. All data is simulated.<br />
                Deploy real backend and set <code className="bg-yellow-100 px-1">USE_MOCK = false</code> to use production API.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>📚 Usage:</strong>
            </p>
            <pre className="text-xs font-mono bg-blue-100 p-3 rounded overflow-x-auto">
{`import api from '../services/api';

// In your component:
const data = await api.analytics.getDashboard();
const customers = await api.customers.list();
const order = await api.orders.create({ ... });`}
            </pre>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-lg mb-2">{example.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{example.description}</p>
              <button
                onClick={() => runExample(example.fn, example.name)}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Running...' : 'Run Example'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-lg shadow-lg p-8 border-l-4 ${
              result.success ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {result.success ? '✅ Success' : '❌ Error'}
              </h2>
              <span className="text-sm text-gray-600">{result.name}</span>
            </div>

            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {result.success 
                  ? JSON.stringify(result.data, null, 2)
                  : result.error
                }
              </pre>
            </div>

            {result.success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
                <p className="text-sm text-green-800">
                  <strong>💡 Tip:</strong> This data is now ready to use in your React components.
                  Store it in state, display it in tables, or pass it to child components.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Where to Use This API</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">📊 Analytics Dashboard</h3>
              <p className="text-sm text-gray-600 mb-2">
                File: <code className="bg-gray-100 px-2 py-1 rounded">/src/app/pages/internal/Analytics.tsx</code>
              </p>
              <pre className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto">
{`const [analyticsData, setAnalyticsData] = useState(null);

useEffect(() => {
  const load = async () => {
    const data = await api.analytics.getDashboard();
    setAnalyticsData(data);
  };
  load();
}, []);`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">👥 Customer Management</h3>
              <p className="text-sm text-gray-600 mb-2">
                File: <code className="bg-gray-100 px-2 py-1 rounded">/src/app/pages/internal/Operations.tsx</code>
              </p>
              <pre className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto">
{`const [customers, setCustomers] = useState([]);

const loadCustomers = async () => {
  const data = await api.customers.list();
  setCustomers(data);
};

const createCustomer = async (customerData) => {
  await api.customers.create(customerData);
  loadCustomers(); // Refresh list
};`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">🛍️ Order Management</h3>
              <p className="text-sm text-gray-600 mb-2">
                File: <code className="bg-gray-100 px-2 py-1 rounded">/src/app/pages/OrderTracking.tsx</code>
              </p>
              <pre className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto">
{`const [orders, setOrders] = useState([]);

const loadOrders = async () => {
  const data = await api.orders.list({ status: 'pending' });
  setOrders(data);
};

const updateOrderStatus = async (orderId, newStatus) => {
  await api.orders.updateStatus(orderId, newStatus);
  loadOrders(); // Refresh
};`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">🚗 Driver Management</h3>
              <p className="text-sm text-gray-600 mb-2">
                Use for delivery tracking and driver assignment
              </p>
              <pre className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto">
{`const assignDriverToOrder = async (driverId, orderId) => {
  const { driver, order } = await api.drivers.assign(driverId, orderId);
  console.log('Driver assigned:', driver);
  console.log('Order updated:', order);
};`}
              </pre>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-lg mb-4">🔗 Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/internal/analytics" className="text-blue-600 hover:underline">
                → Analytics Dashboard
              </Link>
              <Link to="/internal/operations" className="text-blue-600 hover:underline">
                → Operations Management
              </Link>
              <Link to="/test-backend" className="text-blue-600 hover:underline">
                → Backend Test Page
              </Link>
              <Link to="/" className="text-blue-600 hover:underline">
                → Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
