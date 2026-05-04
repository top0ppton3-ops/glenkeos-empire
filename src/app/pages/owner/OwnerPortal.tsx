import React, { useState } from 'react';
import EmpireStats from './components/EmpireStats';
import BrandHealth from './components/BrandHealth';

type OwnerView = 'stats' | 'health';

export default function OwnerPortal() {
  const [currentView, setCurrentView] = useState<OwnerView>('stats');
  const [ownerName] = useState('Glen Keos');

  const renderView = () => {
    switch (currentView) {
      case 'stats':
        return <EmpireStats />;
      case 'health':
        return <BrandHealth />;
      default:
        return <EmpireStats />;
    }
  };

  const navItems: { id: OwnerView; label: string; icon: string }[] = [
    { id: 'stats', label: 'Empire Stats', icon: '📊' },
    { id: 'health', label: 'Brand Health', icon: '❤️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👑</div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Owner Portal</div>
                  <div className="text-xs text-gray-600">{ownerName} • Full Authority</div>
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
