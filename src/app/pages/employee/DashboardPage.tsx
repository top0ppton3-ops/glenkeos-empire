import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Package, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  shift_status: 'clocked_in' | 'clocked_out' | 'on_break';
  hours_today: number;
  earnings_today: number;
  orders_completed: number;
  current_assignment?: Assignment;
  recent_assignments: Assignment[];
}

interface Assignment {
  id: string;
  type: 'delivery' | 'kitchen' | 'counter';
  status: 'pending' | 'active' | 'completed';
  order_number?: string;
  customer_name?: string;
  items?: string[];
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClock ingIn] = useState(false);

  useEffect(() => {
    loadDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/employee/dashboard');
      // const data = await response.json();

      const mockStats: DashboardStats = {
        shift_status: 'clocked_in',
        hours_today: 6.5,
        earnings_today: 97.50,
        orders_completed: 14,
        current_assignment: {
          id: 'a1',
          type: 'delivery',
          status: 'active',
          order_number: 'GE-2024-001234',
          customer_name: 'Sarah Johnson',
          items: ['Hot Wings 10pc', 'French Fries'],
          priority: 'high',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        recent_assignments: [
          {
            id: 'a2',
            type: 'delivery',
            status: 'completed',
            order_number: 'GE-2024-001233',
            customer_name: 'Mike Davis',
            priority: 'medium',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'a3',
            type: 'delivery',
            status: 'completed',
            order_number: 'GE-2024-001232',
            customer_name: 'Lisa Chen',
            priority: 'low',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async () => {
    setClock ingIn(true);
    try {
      // TODO: API call to clock in/out
      // await fetch('/api/employee/clock', { method: 'POST', body: JSON.stringify({ action: ... }) });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      loadDashboard();
    } finally {
      setClock ingIn(false);
    }
  };

  const getPriorityColor = (priority: Assignment['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your shift overview.</p>
        </div>
        <button
          onClick={handleClockAction}
          disabled={clockingIn}
          className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
            stats.shift_status === 'clocked_in'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Clock className="w-5 h-5" />
          {clockingIn ? 'Processing...' : stats.shift_status === 'clocked_in' ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Shift Status</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold capitalize">{stats.shift_status.replace('_', ' ')}</p>
          {stats.shift_status === 'clocked_in' && (
            <p className="text-sm text-gray-600 mt-1">Active for {stats.hours_today}h</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Hours Today</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{stats.hours_today.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mt-1">Regular hours</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Earnings</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">${stats.earnings_today.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">Today's total</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Orders</h3>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{stats.orders_completed}</p>
          <p className="text-sm text-gray-600 mt-1">Completed today</p>
        </div>
      </div>

      {/* Current Assignment */}
      {stats.current_assignment && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Current Assignment</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(stats.current_assignment.priority)}`}>
              {stats.current_assignment.priority} priority
            </span>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{stats.current_assignment.order_number}</h3>
                <p className="text-gray-700">Deliver to: {stats.current_assignment.customer_name}</p>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                {stats.current_assignment.type}
              </span>
            </div>

            {stats.current_assignment.items && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <ul className="space-y-1">
                  {stats.current_assignment.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium">
                View Details
              </button>
              <button className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Assignments</h2>
        <div className="space-y-3">
          {stats.recent_assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  assignment.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {assignment.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{assignment.order_number}</p>
                  <p className="text-sm text-gray-600">{assignment.customer_name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(assignment.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition">
          <Package className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">View All Assignments</h3>
          <p className="text-sm text-gray-600">See your full assignment list</p>
        </button>
        <button className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition">
          <Clock className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">View Schedule</h3>
          <p className="text-sm text-gray-600">Check your upcoming shifts</p>
        </button>
        <button className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition">
          <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-1">View Earnings</h3>
          <p className="text-sm text-gray-600">See your pay details</p>
        </button>
      </div>
    </div>
  );
}
