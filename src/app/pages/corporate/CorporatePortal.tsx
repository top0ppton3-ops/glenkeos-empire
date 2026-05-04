import React, { useState } from 'react';
import BrandConfiguration from './components/BrandConfiguration';
import GlobalPricingRules from './components/GlobalPricingRules';
import GlobalMenuEditor from './components/GlobalMenuEditor';
import LoyaltyConfiguration from './components/LoyaltyConfiguration';
import AnalyticsDashboard from './components/AnalyticsDashboard';

type CorporateView = 'analytics' | 'menu' | 'pricing' | 'brand' | 'loyalty';

export default function CorporatePortal() {
  const [currentView, setCurrentView] = useState<CorporateView>('analytics');
  const [corporateName] = useState('Corporate User');

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'menu':
        return <GlobalMenuEditor />;
      case 'pricing':
        return <GlobalPricingRules />;
      case 'brand':
        return <BrandConfiguration />;
      case 'loyalty':
        return <LoyaltyConfiguration />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  const navItems: { id: CorporateView; label: string; icon: string }[] = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'menu', label: 'Global Menu', icon: '📋' },
    { id: 'pricing', label: 'Pricing Rules', icon: '💲' },
    { id: 'brand', label: 'Brand Config', icon: '🏢' },
    { id: 'loyalty', label: 'Loyalty Program', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏢</div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Corporate Portal</div>
                  <div className="text-xs text-gray-600">{corporateName}</div>
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
