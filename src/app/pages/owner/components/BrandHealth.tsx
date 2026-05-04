import React, { useState, useEffect } from 'react';
import { OwnerPortalService } from '../../../services/portals/OwnerPortalService';

interface BrandHealthMetric {
  brand_id: string;
  brand_name: string;
  health_score: number;
  revenue_health: number;
  operational_health: number;
  customer_health: number;
  staff_health: number;
  critical_alerts: number;
  warnings: number;
  status: 'excellent' | 'good' | 'fair' | 'critical';
}

interface Alert {
  id: string;
  brand_id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'revenue' | 'operations' | 'staff' | 'customer';
  message: string;
  timestamp: string;
}

export default function BrandHealth() {
  const [brandMetrics, setBrandMetrics] = useState<BrandHealthMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandHealth();
  }, []);

  const loadBrandHealth = async () => {
    try {
      const healthData = await OwnerPortalService.getBrandHealth();
      const alertsData = await OwnerPortalService.getCriticalAlerts();

      setBrandMetrics([
        {
          brand_id: 'ghetto-eats',
          brand_name: 'Ghetto Eats',
          health_score: 92,
          revenue_health: 95,
          operational_health: 90,
          customer_health: 93,
          staff_health: 89,
          critical_alerts: 1,
          warnings: 3,
          status: 'excellent',
        },
        {
          brand_id: 'chic-on-chain',
          brand_name: 'Chic-on-Chain',
          health_score: 88,
          revenue_health: 90,
          operational_health: 86,
          customer_health: 91,
          staff_health: 85,
          critical_alerts: 0,
          warnings: 5,
          status: 'good',
        },
        {
          brand_id: 'goldkey',
          brand_name: 'GoldKey',
          health_score: 75,
          revenue_health: 72,
          operational_health: 78,
          customer_health: 80,
          staff_health: 70,
          critical_alerts: 2,
          warnings: 8,
          status: 'fair',
        },
      ]);

      setAlerts([
        {
          id: '1',
          brand_id: 'ghetto-eats',
          type: 'critical',
          category: 'operations',
          message: 'Downtown location reported equipment failure - immediate attention required',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          brand_id: 'goldkey',
          type: 'critical',
          category: 'revenue',
          message: 'Revenue down 15% vs last month - trend analysis needed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '3',
          brand_id: 'goldkey',
          type: 'critical',
          category: 'staff',
          message: 'Staff turnover rate exceeds 25% - retention strategy required',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: '4',
          brand_id: 'chic-on-chain',
          type: 'warning',
          category: 'customer',
          message: 'Customer satisfaction dipped below target in 2 locations',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading brand health:', error);
      setLoading(false);
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAlertColor = (type: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 border-red-500 text-red-800',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      info: 'bg-blue-100 border-blue-500 text-blue-800',
    };
    return colors[type] || 'bg-gray-100 border-gray-500 text-gray-800';
  };

  const filteredAlerts = selectedBrand
    ? alerts.filter((a) => a.brand_id === selectedBrand)
    : alerts;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading brand health...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Brand Health Dashboard</h1>
          <p className="text-gray-600">Monitor the health and performance of all brands</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {brandMetrics.map((brand) => (
            <div
              key={brand.brand_id}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                selectedBrand === brand.brand_id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedBrand(brand.brand_id === selectedBrand ? null : brand.brand_id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{brand.brand_name}</h3>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${getStatusColor(brand.status)}`}>
                    {brand.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Health Score</div>
                  <div className={`text-4xl font-bold ${getHealthColor(brand.health_score)}`}>
                    {brand.health_score}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Revenue</span>
                    <span className={`font-semibold ${getHealthColor(brand.revenue_health)}`}>
                      {brand.revenue_health}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getHealthBgColor(brand.revenue_health)}`}
                      style={{ width: `${brand.revenue_health}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Operations</span>
                    <span className={`font-semibold ${getHealthColor(brand.operational_health)}`}>
                      {brand.operational_health}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getHealthBgColor(brand.operational_health)}`}
                      style={{ width: `${brand.operational_health}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer</span>
                    <span className={`font-semibold ${getHealthColor(brand.customer_health)}`}>
                      {brand.customer_health}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getHealthBgColor(brand.customer_health)}`}
                      style={{ width: `${brand.customer_health}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Staff</span>
                    <span className={`font-semibold ${getHealthColor(brand.staff_health)}`}>
                      {brand.staff_health}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getHealthBgColor(brand.staff_health)}`}
                      style={{ width: `${brand.staff_health}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-red-600 font-semibold">{brand.critical_alerts}</span>
                  <span className="text-gray-600 ml-1">critical</span>
                </div>
                <div>
                  <span className="text-yellow-600 font-semibold">{brand.warnings}</span>
                  <span className="text-gray-600 ml-1">warnings</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedBrand ? `${brandMetrics.find(b => b.brand_id === selectedBrand)?.brand_name} Alerts` : 'All Alerts'}
            </h2>
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Show All Brands
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No alerts</div>
            ) : (
              filteredAlerts.map((alert) => (
                <div key={alert.id} className={`p-6 border-l-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-xs font-semibold uppercase">{alert.type}</div>
                        <div className="text-xs text-gray-600">{alert.category.toUpperCase()}</div>
                      </div>
                      <div className="text-gray-900 mb-2">{alert.message}</div>
                      <div className="text-xs text-gray-500">
                        {brandMetrics.find(b => b.brand_id === alert.brand_id)?.brand_name} • {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
