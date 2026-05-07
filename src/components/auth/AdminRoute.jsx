import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { profile, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
