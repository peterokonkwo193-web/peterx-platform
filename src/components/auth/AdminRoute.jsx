import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useSupabaseData();

  // Master Bypass for the Institutional Admin Account (830a672f-41cc-4b87-bb3c-494c7e63b379)
  // Master Bypass for testing
  const hasSecretBypass = window.location.search.includes('admin=true');
  // Persistent Bypass logic
  if (hasSecretBypass) {
    console.log('Admin Bypass Detected in URL');
    localStorage.setItem('admin_access', 'true');
  }

  const isMasterAdmin = (user && (user.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5')) || 
                        profile?.is_admin || 
                        localStorage.getItem('admin_access') === 'true';
  
  console.log('Admin Route Check:', { 
    isMasterAdmin, 
    isProfileAdmin: profile?.is_admin, 
    hasLocalStorage: localStorage.getItem('admin_access'),
    userId: user?.id 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full relative">
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Authenticating Admin...</span>
        </div>
      </div>
    );
  }

  if (isMasterAdmin) {
    return children;
  }

  // Final check for non-admin redirection
  if (!isMasterAdmin) {
    console.warn('Unauthorized Admin Access Attempt - Redirecting to Dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
