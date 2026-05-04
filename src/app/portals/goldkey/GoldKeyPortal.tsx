import React from 'react';
import { Routes, Route, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

// GoldKey Pages
import DashboardPage from '../../pages/goldkey/DashboardPage';
import BookingPage from '../../pages/goldkey/BookingPage';
import BookingsHistoryPage from '../../pages/goldkey/BookingsHistoryPage';
import VIPStatusPage from '../../pages/goldkey/VIPStatusPage';

export default function GoldKeyPortal() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Luxury Gold Theme */}
      <nav className="bg-gradient-to-r from-yellow-600 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold">🔑 GoldKey VIP</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/goldkey" className="hover:text-yellow-200">Dashboard</Link>
              <Link to="/goldkey/book" className="hover:text-yellow-200">New Booking</Link>
              <Link to="/goldkey/bookings" className="hover:text-yellow-200">My Bookings</Link>
              <Link to="/goldkey/vip-status" className="hover:text-yellow-200">VIP Status</Link>
              <button onClick={signOut} className="hover:text-yellow-200">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="bookings" element={<BookingsHistoryPage />} />
          <Route path="vip-status" element={<VIPStatusPage />} />
        </Routes>
      </main>
    </div>
  );
}
