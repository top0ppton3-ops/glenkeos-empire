/**
 * Loyalty Data Hooks
 */

import { useQuery, type UseQueryOptions } from "./useAPI";
import { loyaltyService } from "../services/api/loyalty";

export function useLoyaltyAccount(customerId: string, options?: UseQueryOptions) {
  return useQuery(
    () => loyaltyService.getAccount(customerId),
    { ...options, enabled: !!customerId && (options?.enabled ?? true) }
  );
}

export function useLoyaltyTransactions(customerId: string, options?: UseQueryOptions) {
  return useQuery(
    () => loyaltyService.getTransactions(customerId),
    { ...options, enabled: !!customerId && (options?.enabled ?? true) }
  );
}
