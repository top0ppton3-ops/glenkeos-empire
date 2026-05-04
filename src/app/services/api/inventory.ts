/**
 * Inventory Service API Client
 */

import { supabaseAPI } from "./supabaseAPI";
import type {
  InventoryItem,
  AdjustInventoryRequest,
  AdjustInventoryResponse
} from "../../types/backend";

export const inventoryService = {
  async getInventoryItems(params?: {
    store_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: InventoryItem[]; total: number }> {
    const result = await supabaseAPI.inventory.list({
      store_id: params?.store_id
    });

    // Transform to match expected InventoryItem type
    const items = result.items.map((item: any) => ({
      item_id: item.item_id,
      store_id: item.store_id,
      item_name: item.item_name,
      quantity: item.quantity,
      threshold_low: item.threshold_low || 10,
      threshold_critical: item.threshold_critical || 5,
      unit: item.unit || 'units',
      status: item.quantity <= 0 ? 'OUT_OF_STOCK' :
              item.quantity <= (item.threshold_critical || 5) ? 'CRITICAL' :
              item.quantity <= (item.threshold_low || 10) ? 'LOW' : 'OK',
      last_updated: item.updated_at
    }));

    return { items, total: items.length };
  },

  async getInventoryItem(itemId: string): Promise<InventoryItem> {
    const result = await supabaseAPI.inventory.list({});
    const item = result.items.find((i: any) => i.item_id === itemId);

    if (!item) {
      throw new Error(`Inventory item ${itemId} not found`);
    }

    return {
      item_id: item.item_id,
      store_id: item.store_id,
      item_name: item.item_name,
      quantity: item.quantity,
      threshold_low: item.threshold_low || 10,
      threshold_critical: item.threshold_critical || 5,
      unit: item.unit || 'units',
      status: item.quantity <= 0 ? 'OUT_OF_STOCK' :
              item.quantity <= (item.threshold_critical || 5) ? 'CRITICAL' :
              item.quantity <= (item.threshold_low || 10) ? 'LOW' : 'OK',
      last_updated: item.updated_at
    };
  },

  async adjustInventory(
    itemId: string,
    data: AdjustInventoryRequest
  ): Promise<AdjustInventoryResponse> {
    const operation = data.operation || 'set';
    const quantity = data.quantity;

    const updated = await supabaseAPI.inventory.updateQuantity(
      itemId,
      quantity,
      operation
    );

    return {
      item_id: updated.item_id,
      new_quantity: updated.quantity,
      operation,
      timestamp: updated.updated_at
    };
  }
};
