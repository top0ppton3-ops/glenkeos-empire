import React, { useState } from 'react';
import { Package, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const assignments = [
    {
      id: '1',
      type: 'delivery',
      status: 'active',
      order_number: 'GE-2024-001234',
      customer: 'Sarah Johnson',
      address: '123 Main St, Atlanta GA',
      items: 2,
      priority: 'high',
      time: '10 mins ago',
    },
    {
      id: '2',
      type: 'delivery',
      status: 'pending',
      order_number: 'GE-2024-001235',
      customer: 'Mike Davis',
      address: '456 Oak Ave, Atlanta GA',
      items: 3,
      priority: 'medium',
      time: '5 mins ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{assignment.order_number}</h3>
                <p className="text-gray-600">{assignment.customer}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                assignment.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {assignment.priority}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{assignment.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-4 h-4" />
                <span className="text-sm">{assignment.items} items</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{assignment.time}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View Details
              </button>
              {assignment.status === 'active' && (
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
