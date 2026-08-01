import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute({ isAuthenticated, allowedRoles, children }) {
  const { currentUser } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to default home page according to their role
    if (currentUser.role === 'user') {
      return <Navigate to="/user" replace />;
    } else if (currentUser.role === 'technician') {
      return <Navigate to="/technician" replace />;
    } else if (currentUser.role === 'supervisor') {
      return <Navigate to="/supervisor" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
