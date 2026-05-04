import React, { useState, useEffect } from 'react';
import { OwnerPortalService } from '../../../services/portals/OwnerPortalService';

interface EmpireStat {
  total_brands: number;
  total_locations: number;
  total_staff: number;
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  avg_order_value: number;
  revenue_growth: number;
}

interface BrandSummary {
  brand_id: string;
  brand_name: string;
  locations: number;
  revenue: number;
  orders: number;
  growth: number;
}

export default function EmpireStats() {
  const [stats, setStats] = useState<EmpireStat | null>(null);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [loading, setLoading] = useState(true);

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
  ];

  useEffect(() => {
    loadEmpireStats();
  }, [timeRange]);

  const loadEmpireStats = async () => {
    try {
      const empireStats = await OwnerPortalService.getEmpireStats();

      setStats({
        total_brands: 3,
        total_locations: 45,
        total_staff: 428,
        total_revenue: 2450000,
        total_orders: 28500,
        total_customers: 15200,
        avg_order_value: 85.96,
        revenue_growth: 18.5,
      });

      setBrands([
        {
          brand_id: 'ghetto-eats',
          brand_name: 'Ghetto Eats',
          locations: 18,
          revenue: 1200000,
          orders: 14200,
          growth: 22.3,
        },
        {
          brand_id: 'chic-on-chain',
          brand_name: 'Chic-on-Chain',
          locations: 15,
          revenue: 980000,
          orders: 11500,
          growth: 15.8,
        },
        {
          brand_id: 'goldkey',
          brand_name: 'GoldKey',
          locations: 12,
          revenue: 270000,
          orders: 2800,
          growth: 12.1,
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading empire stats:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading empire statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empire Statistics</h1>
            <p className="text-gray-600">Complete overview of the GlenKeos Empire</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Revenue</div>
                <div className="text-4xl font-bold mb-2">{formatCurrency(stats.total_revenue)}</div>
                <div className="text-sm opacity-90">+{stats.revenue_growth}% growth</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Orders</div>
                <div className="text-4xl font-bold mb-2">{formatNumber(stats.total_orders)}</div>
                <div className="text-sm opacity-90">{formatCurrency(stats.avg_order_value)} avg</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Customers</div>
                <div className="text-4xl font-bold mb-2">{formatNumber(stats.total_customers)}</div>
                <div className="text-sm opacity-90">Active customer base</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-1">Total Staff</div>
                <div className="text-4xl font-bold mb-2">{formatNumber(stats.total_staff)}</div>
                <div className="text-sm opacity-90">{stats.total_locations} locations</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Brands</div>
                <div className="text-3xl font-bold text-gray-900">{stats.total_brands}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Locations</div>
                <div className="text-3xl font-bold text-gray-900">{stats.total_locations}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Avg Order Value</div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.avg_order_value)}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Brand Performance</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {brands.map((brand) => (
                    <div key={brand.brand_id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{brand.brand_name}</h3>
                          <div className="text-sm text-gray-600">{brand.locations} locations</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Growth</div>
                          <div className="text-2xl font-bold text-green-600">+{brand.growth}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Revenue</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(brand.revenue)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Orders</div>
                          <div className="text-xl font-bold text-gray-900">{formatNumber(brand.orders)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Avg Order</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(brand.revenue / brand.orders)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
