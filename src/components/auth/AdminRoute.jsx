import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useSupabaseData();

  // Master Bypass for the Institutional Admin Account (8d24918f-b493-4549-951e-1f85b0b97fe5)
  const isMasterAdmin = (user && user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') || profile?.is_admin;
  
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

  // If the user is the Master Admin, allow entry immediately
  if (user && user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') {
    return children;
  }

  // Fallback for other admins or redirection for non-admins
  if (!isMasterAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
