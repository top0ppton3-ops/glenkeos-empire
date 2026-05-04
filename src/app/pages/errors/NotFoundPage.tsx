import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>

          {/* Brand Selector */}
          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/customer/ghetto-eats"
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Ghetto Eats
            </Link>
            <Link
              to="/customer/goldkey"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
            >
              GoldKey
            </Link>
            <Link
              to="/customer/chic-on-chain"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
            >
              Chic-on-Chain
            </Link>
          </div>

          <Link
            to="/support"
            className="block text-gray-600 hover:text-gray-900 text-sm"
          >
            Need help? Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
