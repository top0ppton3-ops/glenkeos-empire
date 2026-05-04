import React, { useState } from 'react';
import RegionalMetrics from './components/RegionalMetrics';
import ManagerOversight from './components/ManagerOversight';

type SupervisorView = 'metrics' | 'managers';

export default function SupervisorPortal() {
  const [currentView, setCurrentView] = useState<SupervisorView>('metrics');
  const [supervisorName] = useState('Supervisor User');

  const renderView = () => {
    switch (currentView) {
      case 'metrics':
        return <RegionalMetrics />;
      case 'managers':
        return <ManagerOversight />;
      default:
        return <RegionalMetrics />;
    }
  };

  const navItems: { id: SupervisorView; label: string; icon: string }[] = [
    { id: 'metrics', label: 'Regional Metrics', icon: '📊' },
    { id: 'managers', label: 'Manager Oversight', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👔</div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Supervisor Portal</div>
                  <div className="text-xs text-gray-600">{supervisorName}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>{renderView()}</main>
    </div>
  );
}
