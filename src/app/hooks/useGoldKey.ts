/**
 * GoldKey Booking Hooks
 */

import { useQuery, useMutation, type UseQueryOptions } from "./useAPI";
import { goldkeyService } from "../services/api/goldkey";

export function useGoldKeyBookings(customerId: string, options?: UseQueryOptions) {
  return useQuery(
    () => goldkeyService.getBookings(customerId),
    { ...options, enabled: !!customerId && (options?.enabled ?? true) }
  );
}

export function useGoldKeyBooking(bookingId: string, options?: UseQueryOptions) {
  return useQuery(
    () => goldkeyService.getBooking(bookingId),
    { ...options, enabled: !!bookingId && (options?.enabled ?? true) }
  );
}

export function useCreateGoldKeyBooking() {
  return useMutation<any, any>(
    (bookingData) => goldkeyService.createBooking(bookingData)
  );
}
