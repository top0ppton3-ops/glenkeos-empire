import { Link } from 'react-router';

export default function ManagerPortal() {
  const signOut = () => {
    // Sign out functionality
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Manager Portal</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/manager" className="hover:text-green-200">Dashboard</Link>
              <Link to="/manager/orders" className="hover:text-green-200">Orders</Link>
              <Link to="/manager/staff" className="hover:text-green-200">Staff</Link>
              <Link to="/manager/menus" className="hover:text-green-200">Menus</Link>
              <Link to="/manager/metrics" className="hover:text-green-200">Metrics</Link>
              <button onClick={signOut} className="hover:text-green-200">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Manager Dashboard</h1>
          <p className="text-gray-600 mb-6">Location operations control center</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg mb-2">Active Orders</h3>
              <p className="text-3xl font-bold text-green-600">18</p>
              <p className="text-sm text-gray-600 mt-2">2 ready for pickup</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Staff On Duty</h3>
              <p className="text-3xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600 mt-2">All positions filled</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h3 className="font-bold text-lg mb-2">Today's Revenue</h3>
              <p className="text-3xl font-bold text-yellow-600">$3,240</p>
              <p className="text-sm text-gray-600 mt-2">+12% vs yesterday</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-2">Menu Items</h3>
              <p className="text-3xl font-bold text-purple-600">42</p>
              <p className="text-sm text-gray-600 mt-2">3 sold out</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
