/**
 * GoldKey Booking API Service
 */

import { apiClient } from './client';

export interface GoldKeyBooking {
  booking_id: string;
  customer_id: string;
  service_type: 'black_truck' | 'pool_party' | 'event_25_plus' | 'live_event' | 'concierge';
  package_tier: 'standard' | 'premium' | 'elite';
  date: string;
  start_time: string;
  end_time: string;
  pickup_location?: string;
  dropoff_location?: string;
  party_size: number;
  preferences: {
    music?: string;
    vibe?: string;
    notes?: string;
  };
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimated_price: number;
  final_price?: number;
  assigned_staff?: string[];
  created_at: string;
  updated_at: string;
}

export const goldkeyService = {
  /**
   * Create a new GoldKey booking
   */
  async createBooking(bookingData: {
    service_type: string;
    package_tier: string;
    date: string;
    start_time: string;
    end_time: string;
    pickup_location?: string;
    dropoff_location?: string;
    party_size: number;
    preferences: any;
  }): Promise<GoldKeyBooking> {
    const response = await apiClient.post<{ booking: GoldKeyBooking }>('create-goldkey-booking', bookingData);
    return response.booking;
  },

  /**
   * Get bookings for a customer
   */
  async getBookings(customerId: string): Promise<GoldKeyBooking[]> {
    const response = await apiClient.get<{ bookings: GoldKeyBooking[] }>('get-goldkey-bookings', {
      customer_id: customerId
    });
    return response.bookings || [];
  },

  /**
   * Get a single booking by ID
   */
  async getBooking(bookingId: string): Promise<GoldKeyBooking> {
    const response = await apiClient.get<{ booking: GoldKeyBooking }>('get-goldkey-booking', {
      booking_id: bookingId
    });
    return response.booking;
  },

  /**
   * Update booking status
   */
  async updateStatus(bookingId: string, status: string, finalPrice?: number): Promise<GoldKeyBooking> {
    const response = await apiClient.post<{ booking: GoldKeyBooking }>('update-goldkey-booking', {
      booking_id: bookingId,
      status,
      final_price: finalPrice
    });
    return response.booking;
  }
};
