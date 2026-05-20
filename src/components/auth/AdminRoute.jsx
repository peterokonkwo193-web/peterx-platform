import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useSupabaseData();

  // MASTER BYPASS: The official Institutional Admin account ONLY
  const MASTER_ADMIN_EMAILS = ['equitycitadelassociates@gmail.com'];
  const isMasterAdmin = user && MASTER_ADMIN_EMAILS.includes(user.email);

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

  // Strict enforcement: Only the master admin email has access to this route
  if (isMasterAdmin) {
    return children;
  }

  // If not the master admin, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
