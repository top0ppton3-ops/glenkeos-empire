/**
 * Real-time Orders Hook
 * Subscribes to order changes via Supabase Realtime
 */

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase/client";
import { ordersService } from "../services/api";
import type { Order } from "../types/backend";
import { toast } from "react-hot-toast";

interface UseRealtimeOrdersOptions {
  storeId?: string;
  status?: string;
  enabled?: boolean;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { storeId, status, enabled = true } = options;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Initial fetch
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await ordersService.getOrders({
          store_id: storeId,
          status,
        });
        if (isMounted) {
          setOrders(result.orders);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Failed to fetch orders:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
          filter: storeId ? `store_id=eq.${storeId}` : undefined,
        },
        (payload) => {
          console.log('Order change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as any;

            // Transform to Order type
            const transformedOrder: Order = {
              order_id: newOrder.id,
              customer_id: newOrder.customer_id,
              store_id: newOrder.store_id || newOrder.tenant_id,
              status: newOrder.status,
              items: [],
              pricing: {
                subtotal: (newOrder.total_amount || 0) - (newOrder.tax_amount || 0) - (newOrder.delivery_fee || 0),
                tax: newOrder.tax_amount || 0,
                fees: newOrder.delivery_fee || 0,
                total: newOrder.total_amount || 0,
                currency: 'USD'
              },
              delivery: {
                mode: 'DRIVER',
                address: typeof newOrder.delivery_address === 'string'
                  ? newOrder.delivery_address
                  : `${newOrder.delivery_address?.street || ''}, ${newOrder.delivery_address?.city || ''}`.trim(),
                eta: newOrder.estimated_delivery_time || ''
              },
              risk: { score: 0, flags: [] },
              compliance: { flags: [] },
              timestamps: {
                created_at: newOrder.created_at,
                updated_at: newOrder.updated_at,
                sla_at: newOrder.estimated_delivery_time || newOrder.created_at
              }
            };

            setOrders(prev => [transformedOrder, ...prev]);
            toast.success(`New order #${newOrder.id.substring(0, 8)}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as any;

            setOrders(prev =>
              prev.map(order =>
                order.order_id === updatedOrder.id
                  ? {
                      ...order,
                      status: updatedOrder.status,
                      timestamps: {
                        ...order.timestamps,
                        updated_at: updatedOrder.updated_at
                      }
                    }
                  : order
              )
            );
            toast(`Order #${updatedOrder.id.substring(0, 8)} updated`, {
              icon: '🔄',
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as any;
            setOrders(prev => prev.filter(order => order.order_id !== deletedOrder.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [storeId, status, enabled]);

  return {
    orders,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await ordersService.getOrders({ store_id: storeId, status });
        setOrders(result.orders);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
  };
}
