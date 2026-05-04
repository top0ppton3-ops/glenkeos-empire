import { useState, useEffect, createContext, useContext } from 'react';
import { OrderBoard } from './components/OrderBoard';
import { BookingBoard } from './components/BookingBoard';
import { PricingEditor } from './components/PricingEditor';
import { RefundApprovals } from './components/RefundApprovals';
import { InventoryManager } from './components/InventoryManager';

// Context for manager's location and real-time updates
interface ManagerContextType {
  locationId: string;
  locationName: string;
  brandId: string;
  managerId: string;
  managerName: string;
  notifications: Notification[];
  refreshTrigger: number;
}

interface Notification {
  id: string;
  type: 'order' | 'booking' | 'refund' | 'support';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const ManagerContext = createContext<ManagerContextType>({
  locationId: 'downtown',
  locationName: 'Downtown Location',
  brandId: 'ghetto-eats',
  managerId: 'mock-manager-id',
  managerName: 'John Manager',
  notifications: [],
  refreshTrigger: 0,
});

export const useManagerContext = () => useContext(ManagerContext);

type ViewType = 'dashboard' | 'orders' | 'bookings' | 'menu' | 'pricing' | 'inventory' | 'staff' | 'issues' | 'metrics';

export default function ManagerPortal() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock manager context - in production, get from auth
  const managerContext: ManagerContextType = {
    locationId: 'downtown',
    locationName: 'Downtown Location',
    brandId: 'ghetto-eats',
    managerId: 'mock-manager-id',
    managerName: 'John Manager',
    notifications,
    refreshTrigger,
  };

  // Load notifications on mount and poll for updates
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    // In production, fetch from backend
    // For now, generate mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        title: 'New Order',
        message: 'Order #1234 received - requires confirmation',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/manager/orders',
      },
      {
        id: '2',
        type: 'refund',
        title: 'Refund Request',
        message: '$42.50 refund pending your approval',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/manager/issues',
      },
      {
        id: '3',
        type: 'booking',
        title: 'New Booking',
        message: 'GoldKey booking for tonight - needs confirmation',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/manager/bookings',
      },
    ];

    setNotifications(mockNotifications);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);
    if (notification.type === 'order') setCurrentView('orders');
    if (notification.type === 'booking') setCurrentView('bookings');
    if (notification.type === 'refund') setCurrentView('issues');
    setShowNotifications(false);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { id: 'orders', label: 'Orders', icon: '📦', badge: unreadCount > 0 ? String(unreadCount) : null },
    { id: 'bookings', label: 'Bookings', icon: '📅', badge: null },
    { id: 'menu', label: 'Menu Control', icon: '🍔', badge: null },
    { id: 'pricing', label: 'Pricing & Promos', icon: '💰', badge: null },
    { id: 'inventory', label: 'Inventory', icon: '📋', badge: null },
    { id: 'staff', label: 'Staff & Shifts', icon: '👥', badge: null, disabled: true },
    { id: 'issues', label: 'Issues & Refunds', icon: '🔧', badge: null },
    { id: 'metrics', label: 'Metrics', icon: '📈', badge: null, disabled: true },
  ];

  return (
    <ManagerContext.Provider value={managerContext}>
      <div className="h-screen flex bg-gray-100">
        {/* Sidebar */}
        <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            {!sidebarCollapsed && (
              <div className="mb-2">
                <h1 className="text-xl font-bold">Manager Portal</h1>
                <p className="text-xs text-gray-400">{managerContext.locationName}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full px-2 py-1 bg-gray-800 rounded text-sm hover:bg-gray-700"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setCurrentView(item.id as ViewType)}
                disabled={item.disabled}
                className={`w-full flex items-center px-3 py-3 mb-1 rounded transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : item.disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.disabled && (
                      <span className="text-xs text-gray-500">Soon</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            {!sidebarCollapsed && (
              <div className="text-xs text-gray-400">
                <p className="font-medium text-white mb-1">{managerContext.managerName}</p>
                <p>Manager ID: {managerContext.managerId.slice(0, 8)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {managerContext.locationName} - {managerContext.brandId}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={triggerRefresh}
                className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                title="Refresh data"
              >
                🔄
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-3 border-b">
                      <h3 className="font-bold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm text-center">No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full p-3 text-left border-b hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">{notification.title}</span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="h-8 border-l border-gray-300"></div>
              <button
                onClick={() => alert('Help & Support')}
                className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                title="Help"
              >
                ❓
              </button>
              <button
                onClick={() => alert('Logout')}
                className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {currentView === 'dashboard' && (
              <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-2">🚧 Dashboard Under Construction</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    The metrics dashboard is being built. For now, use the navigation to access:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCurrentView('orders')}
                      className="px-4 py-3 bg-white border rounded hover:bg-gray-50 text-left"
                    >
                      <span className="text-xl mr-2">📦</span>
                      <strong>Orders</strong> - Manage active orders
                    </button>
                    <button
                      onClick={() => setCurrentView('bookings')}
                      className="px-4 py-3 bg-white border rounded hover:bg-gray-50 text-left"
                    >
                      <span className="text-xl mr-2">📅</span>
                      <strong>Bookings</strong> - GoldKey appointments
                    </button>
                    <button
                      onClick={() => setCurrentView('menu')}
                      className="px-4 py-3 bg-white border rounded hover:bg-gray-50 text-left"
                    >
                      <span className="text-xl mr-2">🍔</span>
                      <strong>Menu</strong> - Update availability
                    </button>
                    <button
                      onClick={() => setCurrentView('issues')}
                      className="px-4 py-3 bg-white border rounded hover:bg-gray-50 text-left"
                    >
                      <span className="text-xl mr-2">🔧</span>
                      <strong>Issues</strong> - Handle refunds
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Pending Actions</div>
                    <div className="text-3xl font-bold text-orange-600">{unreadCount}</div>
                    <div className="text-xs text-gray-500 mt-1">Requires attention</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Active Orders</div>
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-500 mt-1">In progress</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Revenue Today</div>
                    <div className="text-3xl font-bold text-green-600">$2,450</div>
                    <div className="text-xs text-gray-500 mt-1">+12% vs yesterday</div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'orders' && <OrderBoard key={refreshTrigger} />}
            {currentView === 'bookings' && <BookingBoard key={refreshTrigger} />}
            {currentView === 'menu' && <InventoryManager key={refreshTrigger} />}
            {currentView === 'pricing' && <PricingEditor key={refreshTrigger} />}
            {currentView === 'inventory' && <InventoryManager key={refreshTrigger} />}
            {currentView === 'issues' && <RefundApprovals key={refreshTrigger} />}

            {currentView === 'staff' && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h2 className="text-2xl font-bold mb-2">Staff Management</h2>
                  <p className="text-gray-600 mb-4">Coming Soon</p>
                  <p className="text-sm text-gray-500">
                    This module will allow you to manage staff schedules, assignments, and performance.
                  </p>
                </div>
              </div>
            )}

            {currentView === 'metrics' && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <h2 className="text-2xl font-bold mb-2">Metrics Dashboard</h2>
                  <p className="text-gray-600 mb-4">Coming Soon</p>
                  <p className="text-sm text-gray-500">
                    This module will provide detailed analytics on revenue, orders, and performance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerContext.Provider>
  );
}
