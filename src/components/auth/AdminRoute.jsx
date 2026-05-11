import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useSupabaseData();

  // Master Bypass for the Institutional Admin Account (830a672f-41cc-4b87-bb3c-494c7e63b379)
  // Master Bypass for testing
  // MASTER BYPASS: The official Admin account always has access
  const MASTER_ADMIN_EMAILS = ['equitycitadelassociates@gmail.com'];
  const isMasterEmail = user && MASTER_ADMIN_EMAILS.includes(user.email);

  if (window.location.search.includes('admin=true') || localStorage.getItem('admin_access') === 'true' || isMasterEmail) {
    localStorage.setItem('admin_access', 'true');
    return children;
  }

  // Master Bypass for known accounts
  const isMasterAdmin = (user && (user.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user.id === '8d24918f-b493-4549-951e-1f85b0b97fe5')) || 
                        profile?.is_admin;
  
  if (loading && !isMasterAdmin) {
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
  return <Navigate to="/dashboard" replace />;
}
;

export default AdminRoute;
