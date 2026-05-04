/**
 * Drivers Data Hooks
 */

import { useQuery, type UseQueryOptions } from "./useAPI";
import { driversService } from "../services/api";
import type { DriverStatus } from "../types/backend";

export function useDrivers(
  params?: {
    status?: DriverStatus;
    limit?: number;
    offset?: number;
  },
  options?: UseQueryOptions
) {
  return useQuery(
    () => driversService.getDrivers(params),
    options
  );
}

export function useDriver(driverId: string, options?: UseQueryOptions) {
  return useQuery(
    () => driversService.getDriver(driverId),
    { ...options, enabled: !!driverId && (options?.enabled ?? true) }
  );
}
