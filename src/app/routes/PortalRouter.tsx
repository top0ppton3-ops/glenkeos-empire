import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPortal, getDefaultPortal, Portal } from '../types/roles';

// Portal Layouts
import CustomerPortal from '../portals/customer/CustomerPortal';
import EmployeePortal from '../portals/employee/EmployeePortal';
import ManagerPortal from '../portals/manager/ManagerPortal';
import CorporatePortal from '../portals/corporate/CorporatePortal';
import GoldKeyPortal from '../portals/goldkey/GoldKeyPortal';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Error Pages
import NotFoundPage from '../pages/errors/NotFoundPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

/**
 * Protected Route Component
 * Ensures user is authenticated and has access to the portal
 */
interface ProtectedRouteProps {
  portal: Portal;
  children: React.ReactNode;
}

function ProtectedRoute({ portal, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessPortal(user.role, portal)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Main Portal Router
 * Routes users to correct portal based on role
 */
export default function PortalRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Customer Portal */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute portal="customer">
              <CustomerPortal />
            </ProtectedRoute>
          }
        />

        {/* Employee Portal */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute portal="employee">
              <EmployeePortal />
            </ProtectedRoute>
          }
        />

        {/* Manager Portal */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute portal="manager">
              <ManagerPortal />
            </ProtectedRoute>
          }
        />

        {/* Corporate Portal */}
        <Route
          path="/corporate/*"
          element={
            <ProtectedRoute portal="corporate">
              <CorporatePortal />
            </ProtectedRoute>
          }
        />

        {/* GoldKey Portal */}
        <Route
          path="/goldkey/*"
          element={
            <ProtectedRoute portal="goldkey">
              <GoldKeyPortal />
            </ProtectedRoute>
          }
        />

        {/* Root Redirect - Send to appropriate portal based on role */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${getDefaultPortal(user.role)}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
