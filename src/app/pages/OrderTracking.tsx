import { motion } from "motion/react";
import { useParams, Link } from "react-router";
import { CheckCircle2, Package, Truck, Home, Clock, MapPin, Phone, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { supabase } from "../../../utils/supabase/client";
import { toast } from "react-hot-toast";

export function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('Fetching order:', orderId);
        const orderData = await api.orders.get(orderId);
        console.log('Order data loaded:', orderData);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up real-time subscription for order status updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order updated:', payload.new);
          setOrder(payload.new);
          toast.success('Order status updated!');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-card py-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-apollo-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-card py-12 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'Unable to find this order'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-apollo-gold text-hades-black px-6 py-3 hover:bg-apollo-gold/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Map order status to timeline steps
  const getStatusStep = (status: string) => {
    const statusMap: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 0,
      'IN_PREP': 1,
      'READY': 1,
      'ASSIGNED': 2,
      'PICKED_UP': 2,
      'OUT_FOR_DELIVERY': 2,
      'DELIVERED': 3,
      'CANCELLED': -1
    };
    return statusMap[status] ?? 0;
  };

  const currentStep = getStatusStep(order.status);

  const orderStatus = {
    current: currentStep,
    estimatedTime: order.estimated_delivery_time || "20-30 min",
    steps: [
      { icon: CheckCircle2, label: "Order Confirmed", time: order.created_at ? new Date(order.created_at).toLocaleTimeString() : '', completed: currentStep >= 0 },
      { icon: Package, label: "Kitchen Preparing", time: order.accepted_at ? new Date(order.accepted_at).toLocaleTimeString() : '', completed: currentStep >= 1 },
      { icon: Truck, label: "Out for Delivery", time: order.picked_up_at ? new Date(order.picked_up_at).toLocaleTimeString() : 'Pending', completed: currentStep >= 2 },
      { icon: Home, label: "Delivered", time: order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString() : 'Pending', completed: currentStep >= 3 }
    ]
  };

  const deliveryAddress = typeof order.delivery_address === 'string'
    ? order.delivery_address
    : `${order.delivery_address?.street}, ${order.delivery_address?.city}, ${order.delivery_address?.state} ${order.delivery_address?.zip}`;

  const customerInfo = order.customer_info || {};

  return (
    <div className="min-h-screen bg-card py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 tracking-[0.2em]" style={{ fontSize: '3rem', fontWeight: 700 }}>
            ORDER TRACKING
          </h1>
          <p className="text-lg text-muted-foreground tracking-wide">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </p>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
          {order.status === 'CANCELLED' && (
            <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 inline-block">
              ORDER CANCELLED
            </div>
          )}
        </motion.div>

        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 bg-background border-4 border-apollo-gold/30 p-8"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-apollo-gold" />
              <div className="text-xl tracking-wider" style={{ fontWeight: 600 }}>
                Estimated Arrival: {orderStatus.estimatedTime}
              </div>
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-border mx-auto" style={{ width: 'calc(100% - 4rem)' }}>
                <div
                  className="h-full bg-apollo-gold transition-all duration-1000"
                  style={{ width: `${(orderStatus.current / (orderStatus.steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Steps */}
              <div className="relative grid grid-cols-4 gap-4">
                {orderStatus.steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                        index <= orderStatus.current
                          ? 'bg-apollo-gold border-apollo-gold'
                          : 'bg-background border-border'
                      }`}
                    >
                      <step.icon
                        className={`w-6 h-6 ${
                          index <= orderStatus.current ? 'text-hades-black' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm tracking-wider mb-1 ${
                          index <= orderStatus.current ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background border-2 border-border p-6"
          >
            <h2 className="mb-6 tracking-wider flex items-center gap-3" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <MapPin className="w-5 h-5 text-apollo-gold" />
              Delivery Address
            </h2>
            <p className="text-muted-foreground mb-6">
              {deliveryAddress}
            </p>

            {order.driver && (
              <>
                <h3 className="mb-3 tracking-wider flex items-center gap-3" style={{ fontWeight: 600 }}>
                  <Truck className="w-5 h-5 text-apollo-gold" />
                  Your Driver
                </h3>
                <div className="text-muted-foreground">
                  <div className="mb-2">{order.driver.name || 'Driver assigned'}</div>
                  {order.driver.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      {order.driver.phone}
                    </div>
                  )}
                </div>
              </>
            )}

            {!order.driver && currentStep >= 1 && (
              <div className="text-muted-foreground italic">
                Driver will be assigned soon...
              </div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-background border-2 border-border p-6"
          >
            <h2 className="mb-6 tracking-wider flex items-center gap-3" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <Package className="w-5 h-5 text-apollo-gold" />
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${((order.total_amount || 0) - (order.tax_amount || 0) - (order.delivery_fee || 0)).toFixed(2)}</span>
                </div>
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>${order.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Total</span>
                <span className="text-apollo-gold">${order.total_amount.toFixed(2)}</span>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Customer Info</div>
                <div className="text-sm">
                  <div>{customerInfo.name}</div>
                  <div className="text-muted-foreground">{customerInfo.email}</div>
                  <div className="text-muted-foreground">{customerInfo.phone}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-apollo-gold hover:text-apollo-gold/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
