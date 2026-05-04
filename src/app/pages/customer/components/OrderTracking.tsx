import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { getOrderWithSnapshots } from '../../../services/api/snapshots';

interface OrderSnapshot {
  menuItemId: string;
  itemName: string;
  basePrice: number;
  selectedOptions: Array<{ name: string; price: number }>;
  finalPrice: number;
  quantity: number;
  pricingRulesApplied: Array<{ ruleName: string; adjustment: number }>;
  snapshotTimestamp: string;
}

interface OrderDetails {
  id: string;
  order_number: string;
  brand_id: string;
  location_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string | null;
  delivery_method: 'delivery' | 'pickup';
  special_instructions: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  promo_discount: number;
  total_amount: number;
  created_at: string;
  estimated_ready_time: string | null;
  items: OrderSnapshot[];
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '🎉' },
];

const deliverySteps = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
  { key: 'completed', label: 'Delivered', icon: '✅' },
];

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
    // Poll for updates every 15 seconds
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      const data = await getOrderWithSnapshots(orderId);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'We could not find this order.'}</p>
          <Link to="/customer" className="text-blue-600 hover:text-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const steps = order.delivery_method === 'delivery' ? deliverySteps : statusSteps;
  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/customer" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.order_number}</h1>
              <p className="text-gray-600">
                Placed {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded font-medium ${
                isCancelled ? 'bg-red-100 text-red-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {isCancelled ? 'Cancelled' : order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Customer</p>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-gray-600">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">{order.delivery_method === 'delivery' ? 'Delivery Address' : 'Pickup Location'}</p>
              <p className="font-medium">
                {order.delivery_method === 'delivery' ? order.delivery_address : 'Location Address Here'}
              </p>
            </div>
          </div>

          {order.special_instructions && (
            <div className="mt-4 bg-yellow-50 p-3 rounded">
              <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
              <p className="text-sm text-yellow-700">{order.special_instructions}</p>
            </div>
          )}

          {order.estimated_ready_time && (
            <div className="mt-4 bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-800">
                Estimated {order.delivery_method === 'delivery' ? 'Delivery' : 'Ready'} Time:
              </p>
              <p className="text-sm text-blue-700">
                {new Date(order.estimated_ready_time).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Order Status Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div
                className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
                style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {/* Steps */}
              <div className="space-y-8">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="relative flex items-center">
                      {/* Icon Circle */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                        isCompleted ? 'bg-blue-600 border-blue-600' :
                        'bg-white border-gray-300'
                      }`}>
                        <span className="text-2xl">{step.icon}</span>
                      </div>

                      {/* Label */}
                      <div className="ml-4 flex-1">
                        <p className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">In progress...</p>
                        )}
                      </div>

                      {/* Checkmark for completed */}
                      {isCompleted && !isCurrent && (
                        <div className="text-green-600">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Items with Snapshots */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>

          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.quantity}x {item.itemName}</h3>
                    {item.selectedOptions.length > 0 && (
                      <ul className="text-sm text-gray-600 ml-4 mt-1">
                        {item.selectedOptions.map((opt, optIdx) => (
                          <li key={optIdx}>
                            • {opt.name} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.pricingRulesApplied.length > 0 && (
                      <div className="text-xs text-green-600 ml-4 mt-1">
                        {item.pricingRulesApplied.map((rule, ruleIdx) => (
                          <div key={ruleIdx}>
                            ✓ {rule.ruleName}: {rule.adjustment > 0 ? '+' : ''}${rule.adjustment.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      ${item.finalPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Snapshot from {new Date(item.snapshotTimestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
            )}
            {order.promo_discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo Discount</span>
                <span>-${order.promo_discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-medium mb-2">Need Help?</p>
          <p>Contact the restaurant at {order.customer_phone} or use the chat support below.</p>
        </div>
      </div>
    </div>
  );
}
