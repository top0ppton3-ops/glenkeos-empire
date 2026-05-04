import React, { useState, useEffect } from 'react';
import { GovernancePortalService } from '../../../services/portals/GovernancePortalService';

interface ComplianceEvent {
  id: string;
  event_type: 'tax_record' | 'audit_log' | 'policy_change' | 'regulatory_filing' | 'data_export';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  user_id?: string;
  affected_table?: string;
  metadata?: any;
}

interface ComplianceMetric {
  category: string;
  total_events: number;
  last_audit: string;
  status: 'compliant' | 'review_needed' | 'non_compliant';
}

export default function ComplianceDashboard() {
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const complianceEvents = await GovernancePortalService.getComplianceEvents();

      setEvents([
        {
          id: '1',
          event_type: 'tax_record',
          description: 'Q1 2026 tax calculation completed',
          severity: 'info',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          event_type: 'audit_log',
          description: 'Complete audit trail exported for regulatory review',
          severity: 'info',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          user_id: 'exec-001',
        },
        {
          id: '3',
          event_type: 'policy_change',
          description: 'Updated privacy policy requires acknowledgment',
          severity: 'warning',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: '4',
          event_type: 'regulatory_filing',
          description: 'Annual compliance report submitted to regulatory body',
          severity: 'info',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
        },
      ]);

      setMetrics([
        {
          category: 'Financial Records',
          total_events: 1240,
          last_audit: new Date(Date.now() - 2592000000).toISOString(),
          status: 'compliant',
        },
        {
          category: 'Data Protection',
          total_events: 89,
          last_audit: new Date(Date.now() - 1296000000).toISOString(),
          status: 'compliant',
        },
        {
          category: 'Tax Compliance',
          total_events: 456,
          last_audit: new Date(Date.now() - 604800000).toISOString(),
          status: 'compliant',
        },
        {
          category: 'Employee Records',
          total_events: 234,
          last_audit: new Date(Date.now() - 7776000000).toISOString(),
          status: 'review_needed',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      compliant: 'bg-green-100 text-green-800',
      review_needed: 'bg-yellow-100 text-yellow-800',
      non_compliant: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter((e) => e.event_type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading compliance dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600">Regulatory oversight and compliance monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">{metric.category}</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{metric.total_events}</div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${getStatusColor(metric.status)}`}>
                {metric.status.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">
                Last audit: {new Date(metric.last_audit).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-2">
          {['all', 'tax_record', 'audit_log', 'policy_change', 'regulatory_filing'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All Events' : type.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Compliance Events</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.event_type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="text-gray-900 mb-2">{event.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
