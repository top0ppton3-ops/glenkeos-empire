import { Link } from "react-router";

export function SupervisorPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Supervisor Portal</span>
              <span className="ml-4 px-3 py-1 bg-purple-700 rounded text-sm">Tier 3 - MFA Required</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/supervisor" className="hover:text-purple-200">Dashboard</Link>
              <Link to="/supervisor/locations" className="hover:text-purple-200">Locations</Link>
              <Link to="/supervisor/managers" className="hover:text-purple-200">Managers</Link>
              <Link to="/supervisor/operations" className="hover:text-purple-200">Operations</Link>
              <Link to="/supervisor/reports" className="hover:text-purple-200">Reports</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supervisor Dashboard</h1>
          <p className="text-gray-600 mb-6">Multi-location oversight and management operations</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-2">Locations Under Supervision</h3>
              <p className="text-3xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600 mt-2">Across 3 regions</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Active Managers</h3>
              <p className="text-3xl font-bold text-green-600">18</p>
              <p className="text-sm text-gray-600 mt-2">All locations staffed</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Today's Operations</h3>
              <p className="text-3xl font-bold text-blue-600">247</p>
              <p className="text-sm text-gray-600 mt-2">Active orders/bookings</p>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Multi-Factor Authentication Required:</strong> This portal requires MFA for all access. Tier 3 clearance active.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Supervisor Capabilities</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Oversee multiple locations across assigned regions</li>
              <li>✓ Manage and evaluate location managers</li>
              <li>✓ Approve location-level operational decisions</li>
              <li>✓ Review cross-location analytics and performance</li>
              <li>✓ Escalate issues to Authorized Representative</li>
              <li>✓ Enforce brand standards across locations</li>
              <li>✓ Access regional financial summaries</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
