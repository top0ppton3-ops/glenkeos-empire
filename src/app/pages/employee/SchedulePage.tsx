import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function SchedulePage() {
  const schedule = [
    { day: 'Monday', date: 'May 5', shift: '4:00 PM - 12:00 AM', hours: 8, location: 'Downtown' },
    { day: 'Wednesday', date: 'May 7', shift: '5:00 PM - 1:00 AM', hours: 8, location: 'Midtown' },
    { day: 'Friday', date: 'May 9', shift: '4:00 PM - 12:00 AM', hours: 8, location: 'Downtown' },
    { day: 'Saturday', date: 'May 10', shift: '6:00 PM - 2:00 AM', hours: 8, location: 'Airport' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Schedule</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">This Week</h2>
        </div>

        <div className="space-y-4">
          {schedule.map((shift, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-bold">{shift.day}, {shift.date}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {shift.shift}
                  </div>
                  <span>•</span>
                  <span>{shift.hours} hours</span>
                  <span>•</span>
                  <span>{shift.location}</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Request Change
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
        <h3 className="font-bold mb-2">Total Hours This Week</h3>
        <p className="text-3xl font-bold text-blue-600">32 hours</p>
      </div>
    </div>
  );
}
