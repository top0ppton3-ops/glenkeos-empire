import React from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function EarningsPage() {
  const earnings = {
    thisWeek: 487.50,
    thisMonth: 1850.00,
    ytd: 15420.00,
    hourlyRate: 15.00,
  };

  const recentPayments = [
    { period: 'Apr 26 - May 2', hours: 32, amount: 480.00, status: 'paid', date: 'May 3' },
    { period: 'Apr 19 - Apr 25', hours: 35, amount: 525.00, status: 'paid', date: 'Apr 26' },
    { period: 'Apr 12 - Apr 18', hours: 28, amount: 420.00, status: 'paid', date: 'Apr 19' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">This Week</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">${earnings.thisWeek.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">${earnings.thisMonth.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Year to Date</h3>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">${earnings.ytd.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        <div className="space-y-3">
          {recentPayments.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="font-bold">{payment.period}</h3>
                <p className="text-sm text-gray-600">{payment.hours} hours worked</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${payment.amount.toFixed(2)}</p>
                <p className="text-sm text-green-600 capitalize">{payment.status} on {payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-bold mb-2">Hourly Rate</h3>
        <p className="text-2xl font-bold text-blue-600">${earnings.hourlyRate.toFixed(2)}/hour</p>
      </div>
    </div>
  );
}
