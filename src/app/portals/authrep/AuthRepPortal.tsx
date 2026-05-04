import { Link } from "react-router";

export function AuthRepPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Authorized Representative Portal</span>
              <span className="ml-4 px-3 py-1 bg-indigo-700 rounded text-sm">Tier 2 - MFA Required</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/authrep" className="hover:text-indigo-200">Dashboard</Link>
              <Link to="/authrep/brands" className="hover:text-indigo-200">Brands</Link>
              <Link to="/authrep/supervisors" className="hover:text-indigo-200">Supervisors</Link>
              <Link to="/authrep/financials" className="hover:text-indigo-200">Financials</Link>
              <Link to="/authrep/approvals" className="hover:text-indigo-200">Approvals</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authorized Representative Dashboard</h1>
          <p className="text-gray-600 mb-6">Brand-level operations and strategic oversight</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="font-bold text-lg mb-2">Active Brands</h3>
              <p className="text-3xl font-bold text-indigo-600">3</p>
              <p className="text-sm text-gray-600 mt-2">Ghetto Eats, Chic-on-Chain, GoldKey</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-2">Supervisors</h3>
              <p className="text-3xl font-bold text-purple-600">8</p>
              <p className="text-sm text-gray-600 mt-2">Regional oversight</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Total Locations</h3>
              <p className="text-3xl font-bold text-green-600">45</p>
              <p className="text-sm text-gray-600 mt-2">Across all brands</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-blue-600">7</p>
              <p className="text-sm text-gray-600 mt-2">Requires action</p>
            </div>
          </div>

          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>High-Level Access:</strong> This portal has brand-wide authority. All actions are logged and audited. MFA required.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Authorized Representative Capabilities</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Oversee all brand operations (Ghetto Eats, Chic-on-Chain, GoldKey)</li>
              <li>✓ Manage supervisors and approve regional strategies</li>
              <li>✓ Review and approve brand-level pricing and promotions</li>
              <li>✓ Access consolidated financial reports</li>
              <li>✓ Approve high-value refunds and exceptions</li>
              <li>✓ Configure brand-level loyalty and service rules</li>
              <li>✓ Escalate critical issues to Owner</li>
              <li>✓ Approve new location openings</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
