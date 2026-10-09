import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from './CommonComponents';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking atelier credentials..." size="large" />;
  }

  if (!user) {
    // If attempting to access admin routes, redirect to admin login
    if (allowedRoles.includes('admin') || allowedRoles.includes('staff')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
}
