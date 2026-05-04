/**
 * Orders API Service
 */

import { apiClient } from './client';
import type { Order, UpdateOrderStatusRequest, AssignDriverRequest } from '../../types/backend';

export const ordersService = {
  /**
   * Get all orders with optional filters
   */
  async getOrders(params?: {
    status?: string;
    store_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const queryParams: Record<string, string> = {};

    if (params?.status) queryParams.status = params.status;
    if (params?.store_id) queryParams.store_id = params.store_id;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    const response = await apiClient.get<{ orders: Order[] }>('get-orders', queryParams);
    return response.orders || [];
  },

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<{ order: Order }>('get-order', { order_id: orderId });
    return response.order;
  },

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    brand_id: string;
    store_id: string;
    customer_id: string;
    order_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
    items: Array<{
      product_id: string;
      quantity: number;
      customizations?: any[];
      special_instructions?: string;
    }>;
    delivery_address?: any;
    special_instructions?: string;
    tip?: number;
  }): Promise<Order> {
    const response = await apiClient.post<{ order: Order }>('create-order', orderData);
    return response.order;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiClient.post<{ order: Order }>('update-order-status', {
      order_id: orderId,
      ...data
    });
    return response.order;
  },

  /**
   * Assign driver to order
   */
  async assignDriver(orderId: string, data: AssignDriverRequest): Promise<Order> {
    const response = await apiClient.post<{ order: Order }>('assign-driver', {
      order_id: orderId,
      driver_id: data.driver_id
    });
    return response.order;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiClient.post<{ order: Order }>('cancel-order', {
      order_id: orderId,
      reason
    });
    return response.order;
  }
};
