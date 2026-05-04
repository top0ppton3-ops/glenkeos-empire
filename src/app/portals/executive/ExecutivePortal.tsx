import { Link } from "react-router";

export function ExecutivePortal() {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Executive IAM Portal</span>
              <span className="ml-4 px-3 py-1 bg-red-700 rounded text-sm">Executive Access - MFA Required</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/executive" className="hover:text-red-200">Dashboard</Link>
              <Link to="/executive/iam" className="hover:text-red-200">IAM Management</Link>
              <Link to="/executive/audit" className="hover:text-red-200">Audit Logs</Link>
              <Link to="/executive/security" className="hover:text-red-200">Security</Link>
              <Link to="/executive/approvals" className="hover:text-red-200">Approvals</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-red-500">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Executive IAM Command Center</h1>
          <p className="text-gray-300 mb-6">Identity & Access Management, Security Operations, High-Risk Approvals</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-lg border-2 border-red-400">
              <h3 className="font-bold text-lg mb-2 text-white">Active Users</h3>
              <p className="text-3xl font-bold text-red-300">412</p>
              <p className="text-sm text-gray-300 mt-2">Across all roles</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg border-2 border-yellow-400">
              <h3 className="font-bold text-lg mb-2 text-white">Security Alerts</h3>
              <p className="text-3xl font-bold text-yellow-300">3</p>
              <p className="text-sm text-gray-300 mt-2">Requires review</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border-2 border-blue-400">
              <h3 className="font-bold text-lg mb-2 text-white">Pending Approvals</h3>
              <p className="text-3xl font-bold text-blue-300">12</p>
              <p className="text-sm text-gray-300 mt-2">High-risk actions</p>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border-2 border-green-400">
              <h3 className="font-bold text-lg mb-2 text-white">Audit Events (24h)</h3>
              <p className="text-3xl font-bold text-green-300">8.4K</p>
              <p className="text-sm text-gray-300 mt-2">All activity logged</p>
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
                  <strong>EXECUTIVE AUTHORITY:</strong> This portal controls system access, security policies, and high-risk operations. All actions are permanently logged. MFA enforced.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-red-400">IAM Management</h2>
              <div className="space-y-3">
                <div className="bg-gray-600 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Role Management</span>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Active</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">13 roles configured</p>
                </div>
                <div className="bg-gray-600 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Permission Policies</span>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Active</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">40+ granular permissions</p>
                </div>
                <div className="bg-gray-600 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">MFA Enforcement</span>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Enabled</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Tier 3+ required</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-red-400">Security Operations</h2>
              <div className="space-y-3">
                <div className="bg-yellow-900 p-3 rounded border-l-4 border-yellow-500">
                  <p className="font-bold text-yellow-200">Unusual Login Pattern</p>
                  <p className="text-sm text-gray-300">Manager account - 3 failed attempts</p>
                </div>
                <div className="bg-blue-900 p-3 rounded border-l-4 border-blue-500">
                  <p className="font-bold text-blue-200">High-Value Refund Request</p>
                  <p className="text-sm text-gray-300">$4,200 - Awaiting approval</p>
                </div>
                <div className="bg-green-900 p-3 rounded border-l-4 border-green-500">
                  <p className="font-bold text-green-200">System Health</p>
                  <p className="text-sm text-gray-300">All services operational</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-red-400">Executive Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold text-white mb-2">Identity & Access</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>✓ Create/modify/delete user accounts</li>
                  <li>✓ Assign and revoke roles</li>
                  <li>✓ Configure permission policies</li>
                  <li>✓ Manage MFA requirements</li>
                  <li>✓ Lock/unlock accounts</li>
                </ul>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold text-white mb-2">Security & Audit</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>✓ Review complete audit logs</li>
                  <li>✓ Monitor security incidents</li>
                  <li>✓ Investigate suspicious activity</li>
                  <li>✓ Rotate security credentials</li>
                  <li>✓ Configure audit retention</li>
                </ul>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold text-white mb-2">High-Risk Approvals</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>✓ Approve global menu changes</li>
                  <li>✓ Approve global pricing changes</li>
                  <li>✓ Approve large refunds</li>
                  <li>✓ Approve system configuration</li>
                  <li>✓ Emergency overrides</li>
                </ul>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold text-white mb-2">Compliance</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>✓ Review compliance reports</li>
                  <li>✓ Export audit data</li>
                  <li>✓ Generate incident reports</li>
                  <li>✓ Configure data retention</li>
                  <li>✓ Manage regulatory access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
