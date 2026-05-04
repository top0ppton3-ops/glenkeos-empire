import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";

export function ChicOnChain() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, storesData] = await Promise.all([
        api.orders.list({ brand: 'chic-on-chain', limit: 5 }),
        api.stores.list({ brand: 'chic-on-chain' })
      ]);
      setOrders(ordersData.orders || []);
      setStores(storesData.stores || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Show empty state instead of failing
      setOrders([]);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-950">
      {/* Header */}
      <header className="bg-emerald-950/50 border-b border-emerald-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-emerald-400 hover:text-emerald-300">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-emerald-400">Chic-on-Chain</h1>
                <p className="text-emerald-300">Premium Restaurant Operations</p>
              </div>
            </div>
            <Link to="/internal/operations">
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500">
                Operations Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="bg-emerald-950/50 border-emerald-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-emerald-400 mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-emerald-300">
                  <p>No orders yet</p>
                  <Button
                    onClick={() => api.orders.create({
                      customer_id: 'test-customer',
                      store_id: 'store-001',
                      items: [{ name: 'Premium Steak', price: 4500, quantity: 1 }],
                      total_amount: 4500
                    }).then(loadData)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-500"
                  >
                    Create Test Order
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-emerald-300">Order #{order.id?.slice(0, 8)}</p>
                          <p className="text-sm text-emerald-400">${(order.total_amount / 100).toFixed(2)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'DELIVERED' ? 'bg-emerald-600 text-white' :
                          order.status === 'PENDING' ? 'bg-amber-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Restaurant Locations */}
          <Card className="bg-emerald-950/50 border-emerald-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-emerald-400 mb-6">Restaurant Locations</h2>
              {stores.length === 0 ? (
                <div className="text-center py-12 text-emerald-300">
                  <p>No locations available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-2xl">
                          🍽️
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-300">{store.name}</h3>
                          <p className="text-sm text-emerald-400">{store.address}</p>
                          <p className="text-xs text-emerald-500 mt-1">
                            {store.city}, {store.state} {store.postal_code}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          store.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                        }`}>
                          {store.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="bg-emerald-950/50 border-emerald-700 p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-emerald-300">Analytics</h3>
            <p className="text-xs text-emerald-400 mt-2">View detailed metrics</p>
          </Card>
          <Card className="bg-emerald-950/50 border-emerald-700 p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-semibold text-emerald-300">Menu</h3>
            <p className="text-xs text-emerald-400 mt-2">Manage menu items</p>
          </Card>
          <Card className="bg-emerald-950/50 border-emerald-700 p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold text-emerald-300">Staff</h3>
            <p className="text-xs text-emerald-400 mt-2">Manage team</p>
          </Card>
          <Card className="bg-emerald-950/50 border-emerald-700 p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-semibold text-emerald-300">Settings</h3>
            <p className="text-xs text-emerald-400 mt-2">Configure platform</p>
          </Card>
        </div>
      </div>
    </div>
  );
}