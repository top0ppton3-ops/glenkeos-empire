/**
 * Orders Data Hooks
 */

import { useQuery, useMutation, type UseQueryOptions } from "./useAPI";
import { ordersService } from "../services/api";
import type {
  Order,
  UpdateOrderStatusRequest,
  AssignDriverRequest
} from "../types/backend";

export function useOrders(
  params?: {
    status?: string;
    store_id?: string;
    limit?: number;
    offset?: number;
  },
  options?: UseQueryOptions
) {
  return useQuery(
    () => ordersService.getOrders(params),
    options
  );
}

export function useOrder(orderId: string, options?: UseQueryOptions) {
  return useQuery(
    () => ordersService.getOrder(orderId),
    { ...options, enabled: !!orderId && (options?.enabled ?? true) }
  );
}

export function useUpdateOrderStatus() {
  return useMutation<any, { orderId: string; data: UpdateOrderStatusRequest }>(
    ({ orderId, data }) => ordersService.updateOrderStatus(orderId, data)
  );
}

export function useAssignDriver() {
  return useMutation<any, { orderId: string; data: AssignDriverRequest }>(
    ({ orderId, data }) => ordersService.assignDriver(orderId, data)
  );
}

export function useCancelOrder() {
  return useMutation<any, { orderId: string; reason: string }>(
    ({ orderId, reason }) => ordersService.cancelOrder(orderId, reason)
  );
}
