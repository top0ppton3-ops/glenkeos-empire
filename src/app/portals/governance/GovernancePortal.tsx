import { Link } from "react-router";

export function GovernancePortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Governance Portal</span>
              <span className="ml-4 px-3 py-1 bg-blue-600 rounded text-sm">Read-Only - MFA Required</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/governance" className="hover:text-gray-300">Dashboard</Link>
              <Link to="/governance/financials" className="hover:text-gray-300">Financials</Link>
              <Link to="/governance/audit" className="hover:text-gray-300">Audit Logs</Link>
              <Link to="/governance/compliance" className="hover:text-gray-300">Compliance</Link>
              <Link to="/governance/tax" className="hover:text-gray-300">Tax Records</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Governance & Compliance Portal</h1>
          <p className="text-gray-600 mb-6">Auditor, IRS, and Compliance Officer read-only access</p>

          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Read-Only Access:</strong> This portal provides view-only access to financial records, audit logs, and compliance data. No modifications can be made through this interface.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold text-gray-800">47,892</p>
              <p className="text-sm text-gray-600 mt-2">Last fiscal year</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Compliance Score</h3>
              <p className="text-3xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-600 mt-2">All regulatory requirements</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Audit Events</h3>
              <p className="text-3xl font-bold text-blue-600">2.1M</p>
              <p className="text-sm text-gray-600 mt-2">Complete audit trail</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Available Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Financial Statements</h3>
                <p className="text-sm text-gray-600">P&L, Balance Sheet, Cash Flow</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Tax Records</h3>
                <p className="text-sm text-gray-600">Sales tax, payroll tax, corporate filings</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-600">Complete system activity trail</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Compliance Reports</h3>
                <p className="text-sm text-gray-600">Regulatory compliance status</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Transaction History</h3>
                <p className="text-sm text-gray-600">All payment and refund records</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border hover:border-blue-500 cursor-pointer">
                <h3 className="font-bold text-gray-900">Employee Records</h3>
                <p className="text-sm text-gray-600">Payroll, hours, assignments</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Authorized Users</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Auditor:</strong> External audit firms conducting financial reviews</li>
              <li><strong>IRS Agent:</strong> Federal tax authority conducting investigations</li>
              <li><strong>Compliance Officer:</strong> Internal compliance team ensuring regulatory adherence</li>
            </ul>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Data Security:</strong> All access is logged. MFA required. No data can be modified or deleted through this portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
