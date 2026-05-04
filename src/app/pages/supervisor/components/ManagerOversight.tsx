import React, { useState, useEffect } from 'react';
import { SupervisorPortalService } from '../../../services/portals/SupervisorPortalService';

interface Manager {
  id: string;
  name: string;
  email: string;
  location_id: string;
  location_name: string;
  performance_score: number;
  orders_handled: number;
  revenue_managed: number;
  avg_response_time: number;
  customer_complaints: number;
  status: 'excellent' | 'good' | 'needs_improvement';
  last_active: string;
}

export default function ManagerOversight() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [supervisorId] = useState('mock-supervisor-id');

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const managersData = await SupervisorPortalService.getSupervisedManagers(supervisorId);

      const mockManagers: Manager[] = [
        {
          id: 'mgr-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@glenkeos.com',
          location_id: 'downtown',
          location_name: 'Downtown',
          performance_score: 95,
          orders_handled: 1234,
          revenue_managed: 45230.45,
          avg_response_time: 12,
          customer_complaints: 3,
          status: 'excellent',
          last_active: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'mgr-2',
          name: 'Michael Chen',
          email: 'michael.chen@glenkeos.com',
          location_id: 'midtown',
          location_name: 'Midtown',
          performance_score: 88,
          orders_handled: 1045,
          revenue_managed: 38920.12,
          avg_response_time: 15,
          customer_complaints: 5,
          status: 'good',
          last_active: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'mgr-3',
          name: 'Lisa Rodriguez',
          email: 'lisa.rodriguez@glenkeos.com',
          location_id: 'westside',
          location_name: 'Westside',
          performance_score: 72,
          orders_handled: 823,
          revenue_managed: 28450.89,
          avg_response_time: 22,
          customer_complaints: 12,
          status: 'needs_improvement',
          last_active: new Date(Date.now() - 10800000).toISOString(),
        },
      ];

      setManagers(mockManagers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading managers:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      needs_improvement: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const filteredManagers = managers.filter((mgr) =>
    filterStatus === 'all' ? true : mgr.status === filterStatus
  );

  const sendMessage = (manager: Manager) => {
    window.location.href = `mailto:${manager.email}`;
  };

  const scheduleReview = (manager: Manager) => {
    alert(`Performance review scheduled with ${manager.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading manager oversight...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manager Oversight</h1>
          <p className="text-gray-600">Monitor and support your location managers</p>
        </div>

        <div className="mb-6 flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Managers</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="needs_improvement">Needs Improvement</option>
          </select>
        </div>

        {filteredManagers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No managers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredManagers.map((manager) => (
                <div
                  key={manager.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedManager?.id === manager.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedManager(manager)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{manager.name}</h3>
                      <div className="text-sm text-gray-600">{manager.location_name}</div>
                      <div className="text-xs text-gray-500">{manager.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(manager.status)}`}>
                        {manager.status.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(manager.performance_score)}`}>
                        {manager.performance_score}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Orders</div>
                      <div className="text-lg font-bold text-gray-900">{manager.orders_handled}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-lg font-bold text-gray-900">${manager.revenue_managed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg Response</div>
                      <div className="text-lg font-bold text-gray-900">{manager.avg_response_time}min</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Complaints</div>
                      <div className={`text-lg font-bold ${manager.customer_complaints > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {manager.customer_complaints}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last active: {new Date(manager.last_active).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              {selectedManager ? (
                <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Manager Details</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-semibold text-gray-900">{selectedManager.name}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-semibold text-gray-900">{selectedManager.location_name}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Performance Score</div>
                      <div className={`text-3xl font-bold ${getPerformanceColor(selectedManager.performance_score)}`}>
                        {selectedManager.performance_score}/100
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Orders Managed</div>
                      <div className="font-semibold text-gray-900">{selectedManager.orders_handled}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Revenue Managed</div>
                      <div className="font-semibold text-gray-900">${selectedManager.revenue_managed.toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                      <div className="font-semibold text-gray-900">{selectedManager.avg_response_time} minutes</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Customer Complaints</div>
                      <div className={`font-semibold ${selectedManager.customer_complaints > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedManager.customer_complaints}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => sendMessage(selectedManager)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                    <button
                      onClick={() => scheduleReview(selectedManager)}
                      className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Schedule Review
                    </button>
                  </div>

                  {selectedManager.status === 'needs_improvement' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-sm text-yellow-800 font-semibold">Action Required</div>
                      <div className="text-xs text-yellow-700 mt-1">
                        This manager needs additional support and training
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select a manager to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
