import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { cn } from '../utils/cn';

const Admin = () => {
  const { profile, loading: authLoading } = useSupabaseData();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!profile?.is_admin) {
        navigate('/dashboard'); // Redirect non-admins
        return;
      }
      fetchAllUsers();
    }
  }, [profile, authLoading, navigate]);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Admin Dashboard</h1>
            <p className="text-sm text-zinc-400">Platform Overview & User Management</p>
          </div>
          <div className="flex items-center gap-4 bg-[#1e2329] px-6 py-3 rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-primary">group</span>
            <div>
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Users</span>
              <span className="block text-xl font-black text-white">{users.length}</span>
            </div>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-white/5" glass>
          <div className="p-6 border-b border-white/5 bg-[#1e2329]">
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#181a20] text-xs text-zinc-500 uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4 text-right">USD Balance</th>
                  <th className="px-6 py-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="block font-medium text-zinc-200">{u.full_name || 'Anonymous User'}</span>
                          {u.is_admin && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md mt-1 inline-block">Admin</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-zinc-500 text-xs truncate max-w-[150px] block" title={u.id}>
                        {u.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      ${parseFloat(u.usd_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-zinc-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
