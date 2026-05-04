/**
 * Driver Location Tracking Service
 */

import { apiClient } from './client';

export interface DriverLocation {
  driver_id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  updated_at: string;
}

export interface UpdateLocationRequest {
  driver_id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export const trackingService = {
  /**
   * Update driver location
   */
  updateLocation: async (data: UpdateLocationRequest): Promise<{ success: boolean; location: DriverLocation }> => {
    return apiClient.post('/update-driver-location', data);
  },

  /**
   * Get current driver location
   */
  getLocation: async (driverId: string): Promise<{ location: DriverLocation }> => {
    return apiClient.get(`/get-driver-location?driver_id=${driverId}`);
  }
};
