/**
 * Real-time Inventory Hook
 * Subscribes to inventory changes via Supabase Realtime
 */

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase/client";
import { inventoryService } from "../services/api";
import type { InventoryItem } from "../types/backend";
import { toast } from "react-hot-toast";

interface UseRealtimeInventoryOptions {
  storeId?: string;
  enabled?: boolean;
}

export function useRealtimeInventory(options: UseRealtimeInventoryOptions = {}) {
  const { storeId, enabled = true } = options;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Initial fetch
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const result = await inventoryService.getInventoryItems({
          store_id: storeId,
        });
        if (isMounted) {
          setItems(result.items);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Failed to fetch inventory:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    // Set up real-time subscription
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Focus on quantity updates
          schema: 'public',
          table: 'inventory_items',
          filter: storeId ? `store_id=eq.${storeId}` : undefined,
        },
        (payload) => {
          console.log('Inventory change detected:', payload);

          const updatedItem = payload.new as any;

          setItems(prev =>
            prev.map(item =>
              item.item_id === updatedItem.item_id
                ? {
                    ...item,
                    quantity: updatedItem.quantity,
                    status: updatedItem.quantity <= 0 ? 'OUT_OF_STOCK' :
                            updatedItem.quantity <= (updatedItem.threshold_critical || 5) ? 'CRITICAL' :
                            updatedItem.quantity <= (updatedItem.threshold_low || 10) ? 'LOW' : 'OK',
                    last_updated: updatedItem.updated_at
                  }
                : item
            )
          );

          // Show alert for stockouts or critical inventory
          if (updatedItem.quantity <= 0) {
            toast.error(`${updatedItem.item_name} is OUT OF STOCK`, {
              duration: 5000,
            });
          } else if (updatedItem.quantity <= (updatedItem.threshold_critical || 5)) {
            toast(`${updatedItem.item_name} is critically low (${updatedItem.quantity} left)`, {
              icon: '⚠️',
              duration: 4000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime inventory subscription status:', status);
      });

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [storeId, enabled]);

  return {
    items,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await inventoryService.getInventoryItems({ store_id: storeId });
        setItems(result.items);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
  };
}
