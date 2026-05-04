import { Link } from 'react-router';
import { useState } from 'react';

export function CustomerPortal() {
  const [activeBrand, setActiveBrand] = useState<'ghetto-eats' | 'goldkey' | 'chic-on-chain'>('ghetto-eats');

  const signOut = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">GlenKeos</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveBrand('ghetto-eats')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeBrand === 'ghetto-eats'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ghetto Eats
              </button>
              <button
                onClick={() => setActiveBrand('goldkey')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeBrand === 'goldkey'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                GoldKey
              </button>
              <button
                onClick={() => setActiveBrand('chic-on-chain')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeBrand === 'chic-on-chain'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chic-on-Chain
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900">
                Orders
              </Link>
              <Link to="/" className="text-gray-700 hover:text-gray-900">
                Loyalty
              </Link>
              <button
                onClick={signOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to GlenKeos</h1>
          <p className="text-gray-600 mb-6">Your gateway to all three brands</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/ghetto-eats" className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-2 border-red-300 hover:border-red-500 transition-all">
              <h3 className="font-bold text-lg mb-2 text-red-900">Ghetto Eats</h3>
              <p className="text-sm text-gray-700">Premium food delivery</p>
            </Link>

            <Link to="/chic-on-chain" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-all">
              <h3 className="font-bold text-lg mb-2 text-blue-900">Chic-on-Chain</h3>
              <p className="text-sm text-gray-700">Upscale dining experience</p>
            </Link>

            <Link to="/goldkey" className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border-2 border-yellow-400 hover:border-yellow-600 transition-all">
              <h3 className="font-bold text-lg mb-2 text-yellow-900">GoldKey</h3>
              <p className="text-sm text-gray-700">VIP concierge services</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
