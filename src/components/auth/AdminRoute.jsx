import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { profile, loading } = useSupabaseData();

  // Master Bypass for the Institutional Admin Account (2e3db981-410b-401f-800b-a8971c09a574)
  const { user } = useSupabaseData();
  const isMasterAdmin = profile?.is_admin || (user && user.id === '2e3db981-410b-401f-800b-a8971c09a574');
  
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

  if (!user && !isMasterAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (!isMasterAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
