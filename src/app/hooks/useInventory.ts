/**
 * Inventory Data Hooks
 */

import { useQuery, useMutation, type UseQueryOptions } from "./useAPI";
import { inventoryService } from "../services/api";
import type { AdjustInventoryRequest } from "../types/backend";

export function useInventory(
  params?: {
    store_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
  options?: UseQueryOptions
) {
  return useQuery(
    () => inventoryService.getInventoryItems(params),
    options
  );
}

export function useInventoryItem(itemId: string, options?: UseQueryOptions) {
  return useQuery(
    () => inventoryService.getInventoryItem(itemId),
    { ...options, enabled: !!itemId && (options?.enabled ?? true) }
  );
}

export function useAdjustInventory() {
  return useMutation<any, { itemId: string; data: AdjustInventoryRequest }>(
    ({ itemId, data }) => inventoryService.adjustInventory(itemId, data)
  );
}
