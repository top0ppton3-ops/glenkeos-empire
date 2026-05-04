import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { getOrderWithSnapshots } from '../../../services/api/snapshots';

interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  selectedOptions: Array<{ name: string; price: number }>;
  finalPrice: number;
  specialInstructions: string | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  estimated_ready_time: string | null;
  special_instructions: string | null;
  items: OrderItem[];
}

type OrderFilter = 'active' | 'ready' | 'completed' | 'all';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  preparing: 'bg-orange-100 text-orange-800 border-orange-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export function OrderBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('active');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadOrders();

    if (autoRefresh) {
      const interval = setInterval(loadOrders, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh]);

  const loadOrders = async () => {
    try {
      // Mock location ID - in production, get from manager's assigned location
      const locationId = 'mock-location-id';

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            quantity,
            snapshot
          )
        `)
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'active') {
        query = query.in('status', ['pending', 'confirmed', 'preparing']);
      } else if (filter === 'ready') {
        query = query.in('status', ['ready', 'out_for_delivery']);
      } else if (filter === 'completed') {
        query = query.in('status', ['completed', 'cancelled']);
      }

      const { data, error } = await query.limit(50);

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.length > 0) {
        // Transform to Order format
        const transformedOrders = data.map((order: any) => ({
          id: order.id,
          order_number: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          delivery_method: order.delivery_method,
          delivery_address: order.delivery_address,
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          estimated_ready_time: order.estimated_ready_time,
          special_instructions: order.special_instructions,
          items: order.order_items?.map((item: any) => ({
            id: item.id,
            menuItemId: item.menu_item_id,
            itemName: item.snapshot?.itemName || 'Unknown Item',
            quantity: item.quantity,
            selectedOptions: item.snapshot?.selectedOptions || [],
            finalPrice: item.snapshot?.finalPrice || 0,
            specialInstructions: item.snapshot?.specialInstructions,
          })) || [],
        }));

        setOrders(transformedOrders);
      } else {
        // Mock orders for demo
        setOrders(generateMockOrders());
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Use mock data on error
      setOrders(generateMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = (): Order[] => {
    const now = Date.now();
    return [
      {
        id: '1',
        order_number: 'ORD-1001',
        customer_name: 'Sarah Johnson',
        customer_phone: '(555) 123-4567',
        delivery_method: 'delivery',
        delivery_address: '123 Main St, Apt 4B',
        status: 'preparing',
        total_amount: 42.50,
        created_at: new Date(now - 15 * 60 * 1000).toISOString(),
        estimated_ready_time: new Date(now + 10 * 60 * 1000).toISOString(),
        special_instructions: 'Extra napkins please',
        items: [
          {
            id: 'item-1',
            menuItemId: 'menu-1',
            itemName: 'Burger Deluxe',
            quantity: 2,
            selectedOptions: [{ name: 'Extra Cheese', price: 1.50 }],
            finalPrice: 14.50,
            specialInstructions: null,
          },
          {
            id: 'item-2',
            menuItemId: 'menu-2',
            itemName: 'French Fries',
            quantity: 1,
            selectedOptions: [{ name: 'Large', price: 2.00 }],
            finalPrice: 5.50,
            specialInstructions: null,
          },
        ],
      },
      {
        id: '2',
        order_number: 'ORD-1002',
        customer_name: 'Mike Chen',
        customer_phone: '(555) 987-6543',
        delivery_method: 'pickup',
        delivery_address: null,
        status: 'confirmed',
        total_amount: 28.75,
        created_at: new Date(now - 5 * 60 * 1000).toISOString(),
        estimated_ready_time: new Date(now + 20 * 60 * 1000).toISOString(),
        special_instructions: null,
        items: [
          {
            id: 'item-3',
            menuItemId: 'menu-3',
            itemName: 'Caesar Salad',
            quantity: 1,
            selectedOptions: [{ name: 'Add Chicken', price: 4.00 }],
            finalPrice: 12.50,
            specialInstructions: 'No croutons',
          },
        ],
      },
      {
        id: '3',
        order_number: 'ORD-1003',
        customer_name: 'Emma Davis',
        customer_phone: '(555) 456-7890',
        delivery_method: 'delivery',
        delivery_address: '456 Oak Ave',
        status: 'ready',
        total_amount: 65.20,
        created_at: new Date(now - 25 * 60 * 1000).toISOString(),
        estimated_ready_time: new Date(now - 2 * 60 * 1000).toISOString(),
        special_instructions: 'Call on arrival',
        items: [
          {
            id: 'item-4',
            menuItemId: 'menu-4',
            itemName: 'Family Meal Deal',
            quantity: 1,
            selectedOptions: [],
            finalPrice: 55.00,
            specialInstructions: null,
          },
        ],
      },
    ];
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error && error.code !== 'PGRST116') throw error;

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // In production, would trigger notification to customer
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const getTimeSince = (dateString: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  };

  const getOrdersByStatus = () => {
    return orders.reduce((acc, order) => {
      if (!acc[order.status]) acc[order.status] = [];
      acc[order.status].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
  };

  const ordersByStatus = getOrdersByStatus();
  const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
  const readyCount = orders.filter(o => ['ready', 'out_for_delivery'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Order Board</h1>
            <p className="text-sm text-gray-600">Real-time order management</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'active' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All ({orders.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Order List */}
        <div className="w-2/3 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id ? 'ring-2 ring-blue-600' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{getTimeSince(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm font-bold mt-1">${order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      order.delivery_method === 'delivery' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {order.delivery_method === 'delivery' ? '🚗 Delivery' : '🏃 Pickup'}
                    </span>
                    <span className="text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Panel */}
        <div className="w-1/3 bg-white border-l overflow-y-auto p-6">
          {selectedOrder ? (
            <div>
              <h2 className="text-xl font-bold mb-4">{selectedOrder.order_number}</h2>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Customer</h3>
                <p className="text-sm">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                {selectedOrder.delivery_address && (
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.delivery_address}</p>
                )}
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="mb-6 bg-yellow-50 p-3 rounded">
                  <h3 className="font-medium text-sm mb-1">Special Instructions</h3>
                  <p className="text-sm">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.quantity}x {item.itemName}</span>
                        <span>${(item.finalPrice * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.selectedOptions.length > 0 && (
                        <ul className="text-xs text-gray-600 ml-4 mt-1">
                          {item.selectedOptions.map((opt, idx) => (
                            <li key={idx}>• {opt.name}</li>
                          ))}
                        </ul>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-yellow-700 mt-1">⚠️ {item.specialInstructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      ✓ Confirm
                    </button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                      className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'ready')}
                      className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      ✓ Mark Ready
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && selectedOrder.delivery_method === 'delivery' && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'out_for_delivery')}
                      className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      🚗 Out for Delivery
                    </button>
                  )}
                  {(['ready', 'out_for_delivery'].includes(selectedOrder.status)) && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'completed')}
                      className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      ✓ Complete
                    </button>
                  )}
                  {!['completed', 'cancelled'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 col-span-2"
                    >
                      ✕ Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                🖨️ Print Receipt
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
