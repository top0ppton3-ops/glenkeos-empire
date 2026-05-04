import React, { useState, useEffect } from 'react';
import { GovernancePortalService } from '../../../services/portals/GovernancePortalService';

interface TaxRecord {
  year: number;
  quarter: number;
  total_revenue: number;
  total_tax: number;
  tax_rate: number;
  filing_status: 'pending' | 'filed' | 'paid';
  due_date: string;
  filed_date?: string;
}

export default function TaxRecordsViewer() {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);

  const years = [2024, 2025, 2026];

  useEffect(() => {
    loadTaxRecords();
  }, [selectedYear]);

  const loadTaxRecords = async () => {
    try {
      const records = await GovernancePortalService.getTaxRecords(selectedYear);

      setTaxRecords([
        {
          year: 2026,
          quarter: 1,
          total_revenue: 525000,
          total_tax: 42000,
          tax_rate: 8.0,
          filing_status: 'paid',
          due_date: '2026-04-15',
          filed_date: '2026-04-10',
        },
        {
          year: 2025,
          quarter: 4,
          total_revenue: 498000,
          total_tax: 39840,
          tax_rate: 8.0,
          filing_status: 'paid',
          due_date: '2026-01-15',
          filed_date: '2026-01-12',
        },
        {
          year: 2025,
          quarter: 3,
          total_revenue: 512000,
          total_tax: 40960,
          tax_rate: 8.0,
          filing_status: 'paid',
          due_date: '2025-10-15',
          filed_date: '2025-10-10',
        },
        {
          year: 2025,
          quarter: 2,
          total_revenue: 478000,
          total_tax: 38240,
          tax_rate: 8.0,
          filing_status: 'paid',
          due_date: '2025-07-15',
          filed_date: '2025-07-11',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading tax records:', error);
      setLoading(false);
    }
  };

  const exportTaxRecords = () => {
    const csvHeader = 'Year,Quarter,Revenue,Tax,Tax Rate,Status,Due Date,Filed Date\n';
    const csvRows = taxRecords
      .map((r) =>
        [
          r.year,
          `Q${r.quarter}`,
          r.total_revenue.toFixed(2),
          r.total_tax.toFixed(2),
          `${r.tax_rate}%`,
          r.filing_status,
          r.due_date,
          r.filed_date || 'N/A',
        ].join(',')
      )
      .join('\n');

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-records-${selectedYear}.csv`;
    a.click();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      filed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecords = taxRecords.filter((r) => r.year === selectedYear);
  const yearTotal = filteredRecords.reduce((sum, r) => sum + r.total_tax, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading tax records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tax Records</h1>
            <p className="text-gray-600">View and export tax records for regulatory compliance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={exportTaxRecords}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Tax Paid ({selectedYear})</div>
          <div className="text-4xl font-bold text-gray-900">{formatCurrency(yearTotal)}</div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax Rate</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Filed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">Q{record.quarter} {record.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                    {formatCurrency(record.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                    {formatCurrency(record.total_tax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {record.tax_rate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.filing_status)}`}>
                      {record.filing_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(record.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.filed_date ? new Date(record.filed_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
