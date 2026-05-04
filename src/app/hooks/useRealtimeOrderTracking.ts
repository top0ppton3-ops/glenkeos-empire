/**
 * Real-time Order Tracking with Supabase Subscriptions
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import type { Order } from '../types/backend';

export function useRealtimeOrderTracking(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Initial fetch
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order update received:', payload);
          if (payload.new) {
            setOrder(payload.new as Order);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  return { order, loading };
}

export function useRealtimeDriverLocation(driverId: string) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const subscription = supabase
      .channel(`driver:${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log('Driver location update:', payload);
          if (payload.new) {
            setLocation({
              latitude: (payload.new as any).latitude,
              longitude: (payload.new as any).longitude
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [driverId]);

  return location;
}
