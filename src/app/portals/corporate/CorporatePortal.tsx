import { Link } from 'react-router';

export function CorporatePortal() {
  const signOut = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Corporate Portal</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/portal/corporate" className="hover:text-gray-300">Dashboard</Link>
              <Link to="/portal/corporate/brands" className="hover:text-gray-300">Brands</Link>
              <Link to="/portal/corporate/analytics" className="hover:text-gray-300">Analytics</Link>
              <Link to="/portal/corporate/finance" className="hover:text-gray-300">Finance</Link>
              <Link to="/portal/corporate/compliance" className="hover:text-gray-300">Compliance</Link>
              <button onClick={signOut} className="hover:text-gray-300">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Corporate Dashboard</h1>
          <p className="text-gray-600 mb-6">Brand-level operations and strategic oversight</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Active Brands</h3>
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-sm text-gray-600 mt-2">Ghetto Eats, Chic-on-Chain, GoldKey</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Total Locations</h3>
              <p className="text-3xl font-bold text-green-600">45</p>
              <p className="text-sm text-gray-600 mt-2">Across all brands</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h3 className="font-bold text-lg mb-2">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-yellow-600">$2.8M</p>
              <p className="text-sm text-gray-600 mt-2">+15% vs last month</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
