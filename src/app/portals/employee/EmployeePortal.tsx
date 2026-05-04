import { Link } from 'react-router';

export default function EmployeePortal() {
  const signOut = () => {
    // Sign out functionality
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Employee Portal</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/employee" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/employee/assignments" className="hover:text-blue-200">Assignments</Link>
              <Link to="/employee/schedule" className="hover:text-blue-200">Schedule</Link>
              <Link to="/employee/earnings" className="hover:text-blue-200">Earnings</Link>
              <button onClick={signOut} className="hover:text-blue-200">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Employee Dashboard</h1>
          <p className="text-gray-600 mb-6">View assignments, schedule, and earnings</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Today's Assignments</h3>
              <p className="text-3xl font-bold text-blue-600">5</p>
              <p className="text-sm text-gray-600 mt-2">Active deliveries</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Hours This Week</h3>
              <p className="text-3xl font-bold text-green-600">32</p>
              <p className="text-sm text-gray-600 mt-2">8 hours remaining</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h3 className="font-bold text-lg mb-2">Earnings (Week)</h3>
              <p className="text-3xl font-bold text-yellow-600">$840</p>
              <p className="text-sm text-gray-600 mt-2">+$120 tips</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
