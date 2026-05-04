import React, { useState, useEffect } from 'react';
import { AuthRepPortalService } from '../../../services/portals/AuthRepPortalService';

interface LocationStats {
  location_id: string;
  location_name: string;
  address: string;
  manager_name: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
  staff_count: number;
  active_issues: number;
  performance_score: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
}

export default function MultiLocationOversight() {
  const [selectedBrand, setSelectedBrand] = useState<string>('ghetto-eats');
  const [locations, setLocations] = useState<LocationStats[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);

  const brands = [
    { id: 'ghetto-eats', name: 'Ghetto Eats' },
    { id: 'chic-on-chain', name: 'Chic-on-Chain' },
    { id: 'goldkey', name: 'GoldKey' },
  ];

  useEffect(() => {
    loadLocations();
  }, [selectedBrand]);

  const loadLocations = async () => {
    try {
      const stats = await AuthRepPortalService.getBrandStats(selectedBrand);

      setLocations([
        {
          location_id: 'downtown',
          location_name: 'Downtown',
          address: '123 Main St',
          manager_name: 'Sarah Johnson',
          revenue: 68000,
          orders: 820,
          avg_order_value: 82.93,
          staff_count: 10,
          active_issues: 2,
          performance_score: 95,
          status: 'excellent',
        },
        {
          location_id: 'uptown',
          location_name: 'Uptown',
          address: '456 Oak Ave',
          manager_name: 'Mike Chen',
          revenue: 62000,
          orders: 760,
          avg_order_value: 81.58,
          staff_count: 9,
          active_issues: 1,
          performance_score: 92,
          status: 'excellent',
        },
        {
          location_id: 'westside',
          location_name: 'Westside',
          address: '789 Pine Rd',
          manager_name: 'Lisa Rodriguez',
          revenue: 58000,
          orders: 710,
          avg_order_value: 81.69,
          staff_count: 8,
          active_issues: 3,
          performance_score: 88,
          status: 'good',
        },
        {
          location_id: 'eastside',
          location_name: 'Eastside',
          address: '321 Elm St',
          manager_name: 'David Kim',
          revenue: 55000,
          orders: 680,
          avg_order_value: 80.88,
          staff_count: 8,
          active_issues: 4,
          performance_score: 86,
          status: 'good',
        },
        {
          location_id: 'southside',
          location_name: 'Southside',
          address: '654 Maple Dr',
          manager_name: 'Jessica Brown',
          revenue: 45000,
          orders: 580,
          avg_order_value: 77.59,
          staff_count: 8,
          active_issues: 7,
          performance_score: 72,
          status: 'needs_attention',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      needs_attention: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalRevenue = locations.reduce((sum, loc) => sum + loc.revenue, 0);
  const totalOrders = locations.reduce((sum, loc) => sum + loc.orders, 0);
  const avgPerformance = locations.reduce((sum, loc) => sum + loc.performance_score, 0) / (locations.length || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading location oversight...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Location Oversight</h1>
            <p className="text-gray-600">Monitor performance across all brand locations</p>
          </div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Brand Revenue</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-500 mt-1">{locations.length} locations</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900">{formatNumber(totalOrders)}</div>
            <div className="text-sm text-gray-500 mt-1">Across all locations</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Performance</div>
            <div className={`text-3xl font-bold ${getPerformanceColor(avgPerformance)}`}>
              {avgPerformance.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Brand average</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {locations.map((location) => (
              <div
                key={location.location_id}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedLocation?.location_id === location.location_id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{location.location_name}</h3>
                    <div className="text-sm text-gray-600">{location.address}</div>
                    <div className="text-sm text-gray-600 mt-1">Manager: {location.manager_name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(location.status)}`}>
                      {location.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(location.performance_score)}`}>
                      {location.performance_score}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Revenue</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(location.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Orders</div>
                    <div className="text-lg font-bold text-gray-900">{formatNumber(location.orders)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">AOV</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(location.avg_order_value)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Staff</div>
                    <div className="text-lg font-bold text-gray-900">{location.staff_count}</div>
                  </div>
                </div>

                {location.active_issues > 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">
                      ⚠️ {location.active_issues} active issue{location.active_issues > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            {selectedLocation ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location Details</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-semibold text-gray-900">{selectedLocation.location_name}</div>
                    <div className="text-sm text-gray-600">{selectedLocation.address}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Manager</div>
                    <div className="font-semibold text-gray-900">{selectedLocation.manager_name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(selectedLocation.performance_score)}`}>
                      {selectedLocation.performance_score}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Revenue</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(selectedLocation.revenue)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Orders</div>
                    <div className="text-xl font-bold text-gray-900">{formatNumber(selectedLocation.orders)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Staff Count</div>
                    <div className="text-xl font-bold text-gray-900">{selectedLocation.staff_count}</div>
                  </div>
                  {selectedLocation.active_issues > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-xs text-yellow-700">Active Issues</div>
                      <div className="text-xl font-bold text-yellow-800">{selectedLocation.active_issues}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    View Full Report
                  </button>
                  <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Contact Manager
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a location to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
