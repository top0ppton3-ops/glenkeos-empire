import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/core/Card";
import { Button } from "../../components/core/Button";
import { Loader } from "../../components/feedback/Loader";
import { Link } from "react-router";
import { ShoppingCart, Truck, Package, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export function CorporateOperations() {
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, driversData, inventoryData] = await Promise.all([
        api.orders.list({ limit: 10 }),
        api.drivers.list({ limit: 10 }),
        api.inventory.list({ limit: 10 })
      ]);
      setOrders(ordersData.orders || ordersData || []);
      setDrivers(driversData.drivers || driversData || []);
      setInventory(inventoryData.items || inventoryData || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const activeDrivers = drivers.filter(d => d.status === 'ACTIVE' || d.status === 'ONLINE');
  const onDeliveryDrivers = drivers.filter(d => d.status === 'ON_DELIVERY');
  const lowStockItems = inventory.filter(i => i.quantity <= (i.threshold_low || 10));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-blue-950/20 border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-blue-400" />
            <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">LIVE</span>
          </div>
          <div className="text-3xl font-bold text-blue-300">{activeOrders.length}</div>
          <div className="text-sm text-blue-400">Active Orders</div>
        </Card>

        <Card className="p-6 bg-emerald-950/20 border-emerald-700">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-emerald-400" />
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-300">{activeDrivers.length}</div>
          <div className="text-sm text-emerald-400">Drivers Online</div>
        </Card>

        <Card className="p-6 bg-amber-950/20 border-amber-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-amber-400" />
            <span className="text-xs px-2 py-1 bg-amber-600 text-white rounded">{onDeliveryDrivers.length}</span>
          </div>
          <div className="text-3xl font-bold text-amber-300">{onDeliveryDrivers.length}</div>
          <div className="text-sm text-amber-400">On Delivery</div>
        </Card>

        <Card className="p-6 bg-red-950/20 border-red-700">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <Package className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-300">{lowStockItems.length}</div>
          <div className="text-sm text-red-400">Low Stock Items</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/corporate/operations/orders">
          <Card className="p-6 text-center cursor-pointer hover:border-blue-500 transition-colors border-slate-700">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold text-slate-200">View All Orders</h3>
            <p className="text-xs text-slate-400 mt-2">Manage orders</p>
          </Card>
        </Link>

        <Link to="/corporate/operations/kitchen">
          <Card className="p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors border-slate-700">
            <Clock className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Kitchen Display</h3>
            <p className="text-xs text-slate-400 mt-2">KDS system</p>
          </Card>
        </Link>

        <Link to="/corporate/operations/drivers">
          <Card className="p-6 text-center cursor-pointer hover:border-amber-500 transition-colors border-slate-700">
            <Truck className="w-10 h-10 mx-auto mb-3 text-amber-400" />
            <h3 className="font-semibold text-slate-200">Driver Fleet</h3>
            <p className="text-xs text-slate-400 mt-2">Manage drivers</p>
          </Card>
        </Link>

        <Link to="/corporate/operations/inventory">
          <Card className="p-6 text-center cursor-pointer hover:border-red-500 transition-colors border-slate-700">
            <Package className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <h3 className="font-semibold text-slate-200">Inventory</h3>
            <p className="text-xs text-slate-400 mt-2">Stock management</p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Recent Orders</h2>
            <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">AUTO-REFRESH</span>
          </div>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 bg-slate-800/50 rounded border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-300">#{order.id?.slice(0, 8)}</p>
                      <p className="text-sm text-slate-400">${(order.total_amount / 100).toFixed(2)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'PENDING' ? 'bg-amber-600 text-white' :
                      order.status === 'IN_PREP' ? 'bg-blue-600 text-white' :
                      order.status === 'IN_TRANSIT' ? 'bg-purple-600 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active Drivers */}
        <Card className="p-6 border-slate-700">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Active Drivers</h2>
          {activeDrivers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No drivers online</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDrivers.slice(0, 5).map((driver) => (
                <div key={driver.id} className="p-3 bg-slate-800/50 rounded border border-slate-700 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    driver.status === 'ON_DELIVERY' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-300 text-sm">{driver.name || `Driver #${driver.id?.slice(0, 6)}`}</p>
                    <p className="text-xs text-slate-400">{driver.vehicle_type || 'Vehicle'}</p>
                  </div>
                  <span className="text-xs text-slate-400">{driver.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="p-6 border-red-700 bg-red-950/10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-red-300">Low Stock Alerts</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {lowStockItems.slice(0, 6).map((item) => (
              <div key={item.id} className="p-3 bg-slate-800/50 rounded border border-red-700">
                <p className="font-semibold text-slate-300 text-sm">{item.name || `Item #${item.id}`}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-red-400">Stock: {item.quantity}</span>
                  <span className="text-xs px-2 py-1 bg-red-600 text-white rounded">LOW</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
