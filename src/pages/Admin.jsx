import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const Admin = () => {
  const { profile, loading: authLoading } = useSupabaseData();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'verifications' | 'audit'
  const [auditLogs, setAuditLogs] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [verifyAmount, setVerifyAmount] = useState({});
  const [loading, setLoading] = useState(true);
  const [treasuryMetrics, setTreasuryMetrics] = useState({ totalBalance: 0, avgBalance: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!profile?.is_admin) {
        navigate('/dashboard'); 
        return;
      }
      fetchData();
    }
  }, [profile, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAllUsers(), 
      fetchPendingTransactions(),
      fetchAuditLogs()
    ]);
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles:admin_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, profiles(full_name)')
        .eq('status', 'Pending Verification')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPendingTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
      
      // Calculate Treasury Metrics
      const total = data.reduce((sum, u) => sum + (parseFloat(u.usd_balance) || 0), 0);
      setTreasuryMetrics({
        totalBalance: total,
        avgBalance: data.length > 0 ? total / data.length : 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleVerify = async (txId, status) => {
    setProcessingId(txId);
    try {
      const amount = parseFloat(verifyAmount[txId] || 0);
      const { error } = await supabase.rpc('verify_transaction', {
        p_transaction_id: txId,
        p_amount: amount,
        p_status: status
      });

      if (error) throw error;
      
      // Refresh data
      await fetchData();
      alert(`Transaction ${status} successfully.`);
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#1e2329] px-6 py-3 rounded-xl border border-white/5">
              <span className="material-symbols-outlined text-primary">group</span>
              <div>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Users</span>
                <span className="block text-xl font-black text-white">{users.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#1e2329] px-6 py-3 rounded-xl border border-white/5 shadow-inner">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              <div>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol TVL</span>
                <span className="block text-xl font-black text-white">{formatPrice(treasuryMetrics.totalBalance)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#1e2329] px-6 py-3 rounded-xl border border-white/5">
              <span className="material-symbols-outlined text-success">account_balance</span>
              <div>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pending Funding</span>
                <span className="block text-xl font-black text-white">{pendingTransactions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === 'users' ? "text-primary" : "text-zinc-500 hover:text-white"
            )}
          >
            User Directory
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('verifications')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === 'verifications' ? "text-success" : "text-zinc-500 hover:text-white"
            )}
          >
            Pending Verifications
            {pendingTransactions.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-success text-black text-[9px] rounded-md">{pendingTransactions.length}</span>
            )}
            {activeTab === 'verifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-success"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === 'audit' ? "text-primary" : "text-zinc-500 hover:text-white"
            )}
          >
            Audit Ledger
            {activeTab === 'audit' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === 'portfolio' ? "text-secondary" : "text-zinc-500 hover:text-white"
            )}
          >
            Global Registry
            {activeTab === 'portfolio' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary"></div>}
          </button>
        </div>

        <Card className="p-0 overflow-hidden border-white/5" glass>
          <div className="p-6 border-b border-white/5 bg-[#1e2329] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">
              {activeTab === 'users' && 'Registered Institutional Users'}
              {activeTab === 'verifications' && 'Institutional Funding Requests'}
              {activeTab === 'audit' && 'System Audit Protocol Logs'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
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
                        {formatPrice(u.usd_balance || 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'verifications' ? (
              <table className="w-full text-left">
                <thead className="bg-[#181a20] text-xs text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Tx ID</th>
                    <th className="px-6 py-4">Requested Date</th>
                    <th className="px-6 py-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {pendingTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-medium text-zinc-200">{tx.profiles?.full_name || 'Trader'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-black text-white">{tx.asset}</span>
                          <span className="text-zinc-500 text-[10px] uppercase font-bold">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-zinc-500 text-[10px]">{tx.client_tx_id || tx.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <input 
                            type="number"
                            placeholder="Amount"
                            className="w-24 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white"
                            value={verifyAmount[tx.id] || ''}
                            onChange={(e) => setVerifyAmount({ ...verifyAmount, [tx.id]: e.target.value })}
                          />
                          <button 
                            disabled={processingId === tx.id}
                            onClick={() => handleVerify(tx.id, 'Completed')}
                            className="p-2 bg-success text-black rounded hover:scale-105 transition-transform disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button 
                            disabled={processingId === tx.id}
                            onClick={() => handleVerify(tx.id, 'Rejected')}
                            className="p-2 bg-rose-500/20 text-rose-500 rounded hover:bg-rose-500/30 transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-zinc-500">No pending verifications.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === 'portfolio' ? (
              <table className="w-full text-left">
                <thead className="bg-[#181a20] text-xs text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Protocol Asset</th>
                    <th className="px-6 py-4">Total Aggregate Supply</th>
                    <th className="px-6 py-4 text-right">Market Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-mono">
                  <tr>
                    <td className="px-6 py-8 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">BTC</span>
                       <span className="text-white font-bold tracking-widest">Bitcoin Protocol</span>
                    </td>
                    <td className="px-6 py-8 text-zinc-200">142.428 BTC</td>
                    <td className="px-6 py-8 text-right text-primary font-black">{formatPrice(9254200)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-8 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black">ETH</span>
                       <span className="text-white font-bold tracking-widest">Ethereum Network</span>
                    </td>
                    <td className="px-6 py-8 text-zinc-200">1,842.10 ETH</td>
                    <td className="px-6 py-8 text-right text-secondary font-black">{formatPrice(4605250)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#181a20] text-xs text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Admin</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-zinc-200 font-bold">{log.profiles?.full_name || 'System Admin'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-black text-primary border border-primary/20">{log.action_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-500 text-[10px] truncate max-w-[300px] block">
                          {JSON.stringify(log.details)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-500 text-[10px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-zinc-500 uppercase tracking-widest text-[10px] font-black">No audit logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
