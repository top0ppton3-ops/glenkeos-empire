import { Link } from "react-router";

export function OwnerPortal() {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-black text-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Owner Portal</span>
              <span className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm">Tier 1 - Full Authority - MFA Required</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/owner" className="hover:text-white">Dashboard</Link>
              <Link to="/owner/empire" className="hover:text-white">Empire Overview</Link>
              <Link to="/owner/financials" className="hover:text-white">Financials</Link>
              <Link to="/owner/strategy" className="hover:text-white">Strategy</Link>
              <Link to="/owner/approvals" className="hover:text-white">Approvals</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-[#D4AF37]">
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-4">GlenKeos Empire Command Center</h1>
          <p className="text-gray-300 mb-6">Complete operational authority across all brands, divisions, and locations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg border-2 border-[#D4AF37]">
              <h3 className="font-bold text-lg mb-2 text-white">Total Revenue</h3>
              <p className="text-3xl font-bold text-[#D4AF37]">$8.2M</p>
              <p className="text-sm text-gray-300 mt-2">YTD across all brands</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border-2 border-blue-400">
              <h3 className="font-bold text-lg mb-2 text-white">Active Locations</h3>
              <p className="text-3xl font-bold text-blue-300">45</p>
              <p className="text-sm text-gray-300 mt-2">3 brands operating</p>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border-2 border-green-400">
              <h3 className="font-bold text-lg mb-2 text-white">Total Staff</h3>
              <p className="text-3xl font-bold text-green-300">387</p>
              <p className="text-sm text-gray-300 mt-2">Full empire headcount</p>
            </div>

            <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-lg border-2 border-red-400">
              <h3 className="font-bold text-lg mb-2 text-white">Critical Alerts</h3>
              <p className="text-3xl font-bold text-red-300">2</p>
              <p className="text-sm text-gray-300 mt-2">Requires immediate attention</p>
            </div>
          </div>

          <div className="mt-8 bg-red-900 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">
                  <strong>MAXIMUM AUTHORITY:</strong> This portal has unrestricted access to all systems, data, and operations. Every action is permanently logged and audited. Multi-factor authentication enforced.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-[#D4AF37]">Brand Health</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Ghetto Eats</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Chic-on-Chain</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>GoldKey</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-[#D4AF37]">Owner Capabilities</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>✓ Full empire oversight</li>
                <li>✓ Strategic planning authority</li>
                <li>✓ Financial control</li>
                <li>✓ Brand creation/retirement</li>
                <li>✓ Executive appointments</li>
                <li>✓ System configuration</li>
                <li>✓ Emergency overrides</li>
              </ul>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-[#D4AF37]">Pending Decisions</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-yellow-900 p-3 rounded border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-200">New Brand Proposal</p>
                  <p className="text-gray-300">Luxury seafood concept</p>
                </div>
                <div className="bg-blue-900 p-3 rounded border-l-4 border-blue-500">
                  <p className="font-bold text-blue-200">Expansion Plan</p>
                  <p className="text-gray-300">15 new locations Q3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
