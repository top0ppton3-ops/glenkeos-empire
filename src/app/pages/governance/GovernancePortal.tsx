import React, { useState } from 'react';
import ComplianceDashboard from './components/ComplianceDashboard';
import TaxRecordsViewer from './components/TaxRecordsViewer';

type GovernanceView = 'compliance' | 'tax';

export default function GovernancePortal() {
  const [currentView, setCurrentView] = useState<GovernanceView>('compliance');
  const [governanceName] = useState('Governance User');

  const renderView = () => {
    switch (currentView) {
      case 'compliance':
        return <ComplianceDashboard />;
      case 'tax':
        return <TaxRecordsViewer />;
      default:
        return <ComplianceDashboard />;
    }
  };

  const navItems: { id: GovernanceView; label: string; icon: string }[] = [
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'tax', label: 'Tax Records', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📜</div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Governance Portal</div>
                  <div className="text-xs text-gray-600">{governanceName} • Read-Only Access</div>
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
