/**
 * Ops Metrics Data Hooks
 */

import { useQuery, type UseQueryOptions } from "./useAPI";
import { metricsService } from "../services/api/metrics";

export function useOpsMetrics(storeId?: string, options?: UseQueryOptions) {
  return useQuery(
    () => metricsService.getOpsMetrics(storeId),
    { ...options, refetchInterval: options?.refetchInterval || 30000 } // Default 30s refresh
  );
}
