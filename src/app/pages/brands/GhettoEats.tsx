import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";

export function GhettoEats() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, storesData] = await Promise.all([
        api.orders.list({ brand: 'ghetto-eats', limit: 5 }),
        api.stores.list({ brand: 'ghetto-eats' })
      ]);
      setOrders(ordersData.orders || []);
      setStores(storesData.stores || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setOrders([]);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const activeDrivers = stores.filter(d => d.status === 'ACTIVE' || d.status === 'ONLINE');
  const onDeliveryDrivers = stores.filter(d => d.status === 'ON_DELIVERY');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950">
      {/* Header */}
      <header className="bg-blue-950/50 border-b border-blue-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-blue-400 hover:text-blue-300">
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-400">Ghetto Eats</h1>
                <p className="text-blue-300">Fast Delivery & Street Food</p>
              </div>
            </div>
            <Link to="/internal/operations">
              <Button variant="primary" className="bg-blue-600 hover:bg-blue-500">
                Operations Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-950/50 border-blue-700 p-4">
            <div className="text-blue-400 text-sm">Active Deliveries</div>
            <div className="text-3xl font-bold text-blue-300">{orders.filter(o => o.status === 'IN_TRANSIT').length}</div>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-4">
            <div className="text-blue-400 text-sm">Online Drivers</div>
            <div className="text-3xl font-bold text-blue-300">{activeDrivers.length}</div>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-4">
            <div className="text-blue-400 text-sm">On Delivery</div>
            <div className="text-3xl font-bold text-blue-300">{onDeliveryDrivers.length}</div>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-4">
            <div className="text-blue-400 text-sm">Total Orders</div>
            <div className="text-3xl font-bold text-blue-300">{orders.length}</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Orders */}
          <Card className="bg-blue-950/50 border-blue-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-400">Active Deliveries</h2>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                  Live
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-blue-300">
                  <p>No active deliveries</p>
                  <Button
                    onClick={() => api.orders.create({
                      customer_id: 'test-customer',
                      store_id: 'store-002',
                      items: [{ name: 'Street Tacos', price: 1200, quantity: 3 }],
                      total_amount: 3600,
                      delivery_address: '123 Main St, City, ST 12345'
                    }).then(loadData)}
                    className="mt-4 bg-blue-600 hover:bg-blue-500"
                  >
                    Create Test Order
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          🚚
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-blue-300">Order #{order.id?.slice(0, 8)}</p>
                              <p className="text-sm text-blue-400">${(order.total_amount / 100).toFixed(2)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'DELIVERED' ? 'bg-emerald-600 text-white' :
                              order.status === 'IN_TRANSIT' ? 'bg-blue-600 text-white' :
                              order.status === 'PENDING' ? 'bg-amber-600 text-white' :
                              'bg-slate-600 text-white'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          {order.delivery_address && (
                            <p className="text-xs text-blue-400 mt-2">📍 {order.delivery_address}</p>
                          )}
                          <p className="text-xs text-blue-500 mt-1">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {order.driver_id && (
                        <div className="mt-3 pt-3 border-t border-blue-700">
                          <p className="text-xs text-blue-400">
                            Driver: <span className="font-semibold">{order.driver_name || order.driver_id}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Driver Fleet */}
          <Card className="bg-blue-950/50 border-blue-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Driver Fleet</h2>
              {stores.length === 0 ? (
                <div className="text-center py-12 text-blue-300">
                  <p>No drivers available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stores.map((driver) => (
                    <div key={driver.id} className="p-3 bg-blue-900/30 rounded-lg border border-blue-700 flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        driver.status === 'ACTIVE' || driver.status === 'ONLINE' ? 'bg-emerald-500' :
                        driver.status === 'ON_DELIVERY' ? 'bg-blue-500' :
                        'bg-slate-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-300 text-sm">{driver.name || `Driver #${driver.id?.slice(0, 6)}`}</p>
                        <p className="text-xs text-blue-400">{driver.vehicle_type || 'Vehicle'}</p>
                      </div>
                      <span className="text-xs text-blue-400">
                        {driver.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="bg-blue-950/50 border-blue-700 p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-semibold text-blue-300">Live Map</h3>
            <p className="text-xs text-blue-400 mt-2">Track deliveries</p>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold text-blue-300">Drivers</h3>
            <p className="text-xs text-blue-400 mt-2">Manage fleet</p>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-semibold text-blue-300">Orders</h3>
            <p className="text-xs text-blue-400 mt-2">Order management</p>
          </Card>
          <Card className="bg-blue-950/50 border-blue-700 p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-blue-300">Analytics</h3>
            <p className="text-xs text-blue-400 mt-2">Performance metrics</p>
          </Card>
        </div>
      </div>
    </div>
  );
}