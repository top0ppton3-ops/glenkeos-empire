/**
 * Drivers API Service
 */

import { apiClient } from './client';
import type { DriverStatus } from '../../types/backend';

export interface Driver {
  driver_id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  current_order_id?: string;
  rating: number;
  total_deliveries: number;
  vehicle_type: string;
  license_plate: string;
  created_at: string;
  updated_at: string;
}

export const driversService = {
  /**
   * Get all drivers with optional filters
   */
  async getDrivers(params?: {
    status?: DriverStatus;
    limit?: number;
    offset?: number;
  }): Promise<Driver[]> {
    const queryParams: Record<string, string> = {};

    if (params?.status) queryParams.status = params.status;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    const response = await apiClient.get<{ drivers: Driver[] }>('get-drivers', queryParams);
    return response.drivers || [];
  },

  /**
   * Get a single driver by ID
   */
  async getDriver(driverId: string): Promise<Driver> {
    const response = await apiClient.get<{ driver: Driver }>('get-driver', { driver_id: driverId });
    return response.driver;
  },

  /**
   * Update driver location
   */
  async updateLocation(driverId: string, location: { latitude: number; longitude: number }): Promise<void> {
    await apiClient.post('update-driver-location', {
      driver_id: driverId,
      ...location
    });
  },

  /**
   * Update driver status
   */
  async updateStatus(driverId: string, status: DriverStatus): Promise<Driver> {
    const response = await apiClient.post<{ driver: Driver }>('update-driver-status', {
      driver_id: driverId,
      status
    });
    return response.driver;
  }
};
