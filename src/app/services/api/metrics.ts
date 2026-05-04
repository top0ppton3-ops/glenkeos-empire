/**
 * Metrics API Service
 */

import { apiClient } from './client';

export interface OpsMetrics {
  store_id?: string;
  active_orders: number;
  pending_orders: number;
  completed_orders_today: number;
  active_drivers: number;
  average_delivery_time: number;
  revenue_today: number;
  customer_satisfaction: number;
  updated_at: string;
}

export const metricsService = {
  /**
   * Get operational metrics for a store or all stores
   */
  async getOpsMetrics(storeId?: string): Promise<OpsMetrics> {
    const params: Record<string, string> = {};
    if (storeId) params.store_id = storeId;

    const response = await apiClient.get<{ metrics: OpsMetrics }>('get-metrics', params);
    return response.metrics;
  },

  /**
   * Get analytics data for corporate dashboard
   */
  async getAnalytics(params?: {
    brand_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const queryParams: Record<string, string> = {};

    if (params?.brand_id) queryParams.brand_id = params.brand_id;
    if (params?.start_date) queryParams.start_date = params.start_date;
    if (params?.end_date) queryParams.end_date = params.end_date;

    return apiClient.get('get-analytics', queryParams);
  }
};
