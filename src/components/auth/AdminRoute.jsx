import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useSupabaseData();

  // Master Bypass for the Institutional Admin Account (830a672f-41cc-4b87-bb3c-494c7e63b379)
  const isMasterAdmin = (user && (user.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5')) || profile?.is_admin;
  
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

  // Flicker Protection: If we have a user but isMasterAdmin is briefly false (during profile load), wait.
  // However, since we check user.id directly, this is usually instant.
  if (user && (user.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5')) {
    return children;
  }

  // Final check for non-admin redirection
  if (!isMasterAdmin) {
    // Only redirect if loading is completely finished and we are SURE it's not the admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
