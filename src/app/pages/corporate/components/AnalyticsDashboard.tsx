import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface TopItem {
  item_name: string;
  orders_count: number;
  revenue: number;
}

interface LocationPerformance {
  location_id: string;
  location_name: string;
  orders_count: number;
  revenue: number;
  avg_order_value: number;
}

export default function AnalyticsDashboard() {
  const [selectedBrand, setSelectedBrand] = useState<string>('ghetto-eats');
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | '90days'>('30days');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [locationPerformance, setLocationPerformance] = useState<LocationPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const brands = [
    { id: 'ghetto-eats', name: 'Ghetto Eats' },
    { id: 'chic-on-chain', name: 'Chic-on-Chain' },
    { id: 'goldkey', name: 'GoldKey' },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedBrand, timeRange]);

  const loadAnalytics = async () => {
    try {
      const daysAgo = timeRange === 'today' ? 0 : timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // In real implementation, these would be actual database queries
      // For now, using mock data
      const mockMetrics: Metric[] = [
        { label: 'Total Revenue', value: '$45,234', change: 12.5, trend: 'up' },
        { label: 'Total Orders', value: '1,234', change: 8.3, trend: 'up' },
        { label: 'Avg Order Value', value: '$36.67', change: 3.8, trend: 'up' },
        { label: 'Active Customers', value: '892', change: -2.1, trend: 'down' },
        { label: 'New Customers', value: '145', change: 15.2, trend: 'up' },
        { label: 'Customer Retention', value: '78%', change: 5.4, trend: 'up' },
        { label: 'Avg Prep Time', value: '18min', change: -8.2, trend: 'up' },
        { label: 'Customer Satisfaction', value: '4.7/5', change: 2.1, trend: 'up' },
      ];

      const mockTopItems: TopItem[] = [
        { item_name: 'Classic Burger', orders_count: 342, revenue: 4442.58 },
        { item_name: 'Crispy Chicken', orders_count: 298, revenue: 3274.02 },
        { item_name: 'Loaded Fries', orders_count: 256, revenue: 1792.00 },
        { item_name: 'BBQ Wings', orders_count: 189, revenue: 2078.10 },
        { item_name: 'Milkshake', orders_count: 167, revenue: 1169.83 },
      ];

      const mockLocationPerformance: LocationPerformance[] = [
        {
          location_id: 'downtown',
          location_name: 'Downtown',
          orders_count: 456,
          revenue: 16789.45,
          avg_order_value: 36.82,
        },
        {
          location_id: 'midtown',
          location_name: 'Midtown',
          orders_count: 389,
          revenue: 14234.67,
          avg_order_value: 36.59,
        },
        {
          location_id: 'westside',
          location_name: 'Westside',
          orders_count: 389,
          revenue: 14209.88,
          avg_order_value: 36.53,
        },
      ];

      setMetrics(mockMetrics);
      setTopItems(mockTopItems);
      setLocationPerformance(mockLocationPerformance);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvHeader = 'Metric,Value,Change %\n';
    const csvRows = metrics.map((m) => `${m.label},${m.value},${m.change}%`).join('\n');
    const csv = csvHeader + csvRows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBrand}-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral'): string => {
    return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Brand-level performance metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {(['today', '7days', '30days', '90days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === range ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
              <div className={`text-sm font-semibold ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)} {Math.abs(metric.change)}% vs previous period
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Items</h2>
            <div className="space-y-3">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.item_name}</div>
                    <div className="text-sm text-gray-600">{item.orders_count} orders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${item.revenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location Performance</h2>
            <div className="space-y-3">
              {locationPerformance.map((location, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">{location.location_name}</div>
                    <div className="font-bold text-gray-900">${location.revenue.toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Orders:</span> {location.orders_count}
                    </div>
                    <div>
                      <span className="text-gray-500">Avg:</span> ${location.avg_order_value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">Chart visualization would go here</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Orders by Hour</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">Chart visualization would go here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
