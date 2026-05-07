import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { profile, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Debug log for Admin troubleshooting
  if (!profile) {
    console.warn("AdminRoute: No profile found for user. Redirecting to login...");
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!profile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
