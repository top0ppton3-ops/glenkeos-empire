import React, { useState, useEffect } from 'react';
import { SupervisorPortalService } from '../../../services/portals/SupervisorPortalService';

interface RegionalMetric {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  active_locations: number;
  total_staff: number;
  customer_satisfaction: number;
  on_time_delivery_rate: number;
}

interface LocationMetric {
  location_id: string;
  location_name: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
  staff_count: number;
  satisfaction: number;
  status: 'excellent' | 'good' | 'needs_attention';
}

export default function RegionalMetrics() {
  const [regionalMetrics, setRegionalMetrics] = useState<RegionalMetric | null>(null);
  const [locationMetrics, setLocationMetrics] = useState<LocationMetric[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('30days');
  const [loading, setLoading] = useState(true);
  const [supervisorId] = useState('mock-supervisor-id');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      const metrics = await SupervisorPortalService.getRegionalMetrics(supervisorId);

      setRegionalMetrics({
        total_revenue: 125450.67,
        total_orders: 3420,
        avg_order_value: 36.68,
        active_locations: 5,
        total_staff: 48,
        customer_satisfaction: 4.6,
        on_time_delivery_rate: 94.5,
      });

      setLocationMetrics([
        {
          location_id: 'downtown',
          location_name: 'Downtown',
          revenue: 45230.45,
          orders: 1234,
          avg_order_value: 36.65,
          staff_count: 12,
          satisfaction: 4.7,
          status: 'excellent',
        },
        {
          location_id: 'midtown',
          location_name: 'Midtown',
          revenue: 38920.12,
          orders: 1045,
          avg_order_value: 37.25,
          staff_count: 10,
          satisfaction: 4.6,
          status: 'excellent',
        },
        {
          location_id: 'westside',
          location_name: 'Westside',
          revenue: 28450.89,
          orders: 823,
          avg_order_value: 34.58,
          staff_count: 9,
          satisfaction: 4.2,
          status: 'needs_attention',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      needs_attention: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading regional metrics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regional Metrics</h1>
            <p className="text-gray-600">Performance overview across your supervised locations</p>
          </div>
          <div className="flex gap-2">
            {(['today', '7days', '30days'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  timeRange === range ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7days' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {regionalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-gray-900">${regionalMetrics.total_revenue.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Across {regionalMetrics.active_locations} locations</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-gray-900">{regionalMetrics.total_orders.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Avg ${regionalMetrics.avg_order_value.toFixed(2)} per order</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Customer Satisfaction</div>
              <div className="text-3xl font-bold text-gray-900">{regionalMetrics.customer_satisfaction.toFixed(1)}/5.0</div>
              <div className="text-xs text-green-600 mt-1">↑ Above target</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">On-Time Delivery</div>
              <div className="text-3xl font-bold text-gray-900">{regionalMetrics.on_time_delivery_rate}%</div>
              <div className="text-xs text-green-600 mt-1">↑ Excellent</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Performance</h2>
          <div className="space-y-4">
            {locationMetrics.map((location) => (
              <div key={location.location_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{location.location_name}</h3>
                    <div className="text-sm text-gray-600">{location.staff_count} staff members</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(location.status)}`}>
                    {location.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="text-lg font-bold text-gray-900">${location.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Orders</div>
                    <div className="text-lg font-bold text-gray-900">{location.orders}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Order</div>
                    <div className="text-lg font-bold text-gray-900">${location.avg_order_value.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                    <div className="text-lg font-bold text-gray-900">{location.satisfaction.toFixed(1)}/5</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Staff</div>
                    <div className="text-lg font-bold text-gray-900">{location.staff_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Location</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">Chart visualization would go here</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">Chart visualization would go here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
