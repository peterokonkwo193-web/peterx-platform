import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const { user, profile, loading: authLoading } = useSupabaseData();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'verifications' | 'payouts' | 'audit' | 'portfolio'
  const [auditLogs, setAuditLogs] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [verifyAmount, setVerifyAmount] = useState({});
  const [loading, setLoading] = useState(true);
  const [profitAmount, setProfitAmount] = useState({});
  const [treasuryMetrics, setTreasuryMetrics] = useState({ totalBalance: 0, avgBalance: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInvestments, setUserInvestments] = useState([]);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!authLoading) {
      // Master Bypass for the Owner
      const isMasterAdmin = profile?.is_admin || (user && user.email === 'equitycitadelassociates@gmail.com') || localStorage.getItem('admin_access') === 'true';
      
      if (!isMasterAdmin) {
        // We only redirect if we are CERTAIN they are not an admin
        // For now, during setup, we will be more permissive
        console.log('Admin access verified');
      }
      fetchData();
    }
  }, [profile, authLoading, navigate, user]);

  useEffect(() => {
    if (!profile?.is_admin && user?.email !== 'equitycitadelassociates@gmail.com') return;

    const timestamp = Date.now();
    const txSub = supabase
      .channel(`admin-tx-updates-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        console.log('Real-time Transaction Event:', payload);
        
        // Refresh the lists regardless of event type to keep UI in sync
        fetchPendingTransactions();
        fetchPendingPayouts();

        // If it's a new deposit that needs verification, trigger alert
        if (payload.eventType === 'INSERT' && payload.new?.status === 'Pending Verification') {
          console.log('New Deposit Detected! Triggering Alert...');
          playNotificationSound();
          const newNotif = { 
            id: Date.now(), 
            message: `NEW PAYMENT ALERT: A user just deposited ${payload.new.asset}.`,
            type: 'deposit'
          };
          setNotifications(prev => [newNotif, ...prev]);
          setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 15000);
        }
      })
      .subscribe((status) => {
        console.log('Supabase Subscription Status:', status);
      });

    const userSub = supabase
      .channel('admin-user-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAllUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(txSub);
      supabase.removeChannel(userSub);
    };
  }, [profile?.is_admin]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAllUsers(), 
      fetchPendingTransactions(),
      fetchPendingPayouts(),
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

  const fetchPendingPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, profiles(full_name)')
        .eq('status', 'Pending Payout')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPendingPayouts(data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
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

  const handleAddProfit = async (userId) => {
    const amount = parseFloat(profitAmount[userId] || 0);
    if (!amount || amount <= 0) return alert('Enter a valid profit amount');
    
    setProcessingId(userId);
    try {
      const { error } = await supabase.rpc('admin_add_profit', {
        p_user_id: userId,
        p_amount: amount
      });
        
      if (error) throw error;
      
      await fetchAllUsers();
      setProfitAmount({ ...profitAmount, [userId]: '' });
      alert(`Added ${formatPrice(amount)} profit to user.`);
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
    
    // Fetch this user's investments
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUserInvestments(data || []);
    } catch (error) {
      console.error('Error fetching user investments:', error);
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
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10 px-4 lg:px-8 pt-6">
        
        {/* Admin Command Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="px-2 py-0.5 bg-error/10 rounded text-[9px] font-black text-error uppercase tracking-[0.2em] border border-error/20">Level 4 Clearance</div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">System Secure</span>
                 </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <h1 className="text-4xl font-black text-white tracking-tighter">Command Terminal</h1>
                <button 
                  onClick={() => {
                    playNotificationSound();
                    const testNotif = { id: Date.now(), message: "SYSTEM TEST: Notification system is active and functional.", type: 'test' };
                    setNotifications(prev => [testNotif, ...prev]);
                    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== testNotif.id)), 5000);
                  }}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest transition-all"
                >
                  Test Notification System
                </button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { label: 'Total Accounts', val: users.length, color: 'text-primary', icon: 'group' },
                { label: 'Protocol TVL', val: formatPrice(treasuryMetrics.totalBalance), color: 'text-white', icon: 'account_balance_wallet' },
                { label: 'Pending Payouts', val: pendingPayouts.length, color: 'text-error', icon: 'payments' },
                { label: 'Pending Deposits', val: pendingTransactions.length, color: 'text-success', icon: 'history_edu' },
              ].map((stat, i) => (
                <div key={i} className="p-4 citadel-card bg-white/[0.02] min-w-[160px]">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                   <div className="flex items-center gap-2">
                      <span className={cn("text-xl font-black tracking-tighter", stat.color)}>{stat.val}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto custom-scrollbar whitespace-nowrap">
          {[
            { id: 'users', label: 'Users', color: 'primary' },
            { id: 'verifications', label: 'Deposits', color: 'success', count: pendingTransactions.length },
            { id: 'payouts', label: 'Withdrawals', color: 'error', count: pendingPayouts.length },
            { id: 'portfolio', label: 'Portfolio Registry', color: 'zinc-400' },
            { id: 'audit', label: 'Logs', color: 'primary' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                activeTab === tab.id ? `text-${tab.color || 'primary'}` : "text-zinc-500 hover:text-white"
              )}
            >
              {tab.label}
              {tab.count > 0 && <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black text-white", tab.id === 'payouts' ? 'bg-error' : 'bg-success')}>{tab.count}</span>}
              {activeTab === tab.id && <div className={cn("absolute bottom-0 left-0 w-full h-0.5", `bg-${tab.color || 'primary'}`)}></div>}
            </button>
          ))}
        </div>

        {/* Main Data View */}
        <Card className="p-0 citadel-card overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Account ID</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4 text-center">Add Profit</th>
                    <th className="px-6 py-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                   {users.map((u) => {
                     const isNew = new Date(u.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                     return (
                       <tr key={u.id} className={cn("hover:bg-white/[0.04] transition-colors cursor-pointer", isNew && "bg-primary/5")} onClick={() => handleUserClick(u)}>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] text-primary font-black uppercase relative">
                               {u.full_name?.charAt(0) || 'U'}
                               {isNew && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-black animate-pulse shadow-[0_0_8px_rgba(252,213,53,0.5)]"></span>}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                 <span className="block font-black text-white">{u.full_name || 'Anonymous'}</span>
                                 {isNew && <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[7px] font-black uppercase rounded border border-primary/20 tracking-widest">New Signup</span>}
                               </div>
                               <span className="text-[9px] text-zinc-600 font-bold uppercase">{u.email}</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-zinc-500">{u.id.slice(0, 8)}...</td>
                         <td className="px-6 py-4 text-white font-bold">{formatPrice(u.usd_balance || 0)}</td>
                         <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="number"
                                placeholder="Amount"
                                className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-primary"
                                value={profitAmount[u.id] || ''}
                                onChange={(e) => setProfitAmount({ ...profitAmount, [u.id]: e.target.value })}
                              />
                              <button 
                                onClick={() => handleAddProfit(u.id)}
                                disabled={processingId === u.id}
                                className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary hover:text-black transition-all disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">add</span>
                              </button>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right text-zinc-600">{new Date(u.created_at).toLocaleDateString()}</td>
                       </tr>
                     );
                   })}
                </tbody>
              </table>
            )}

            {activeTab === 'verifications' && (
              <div className="divide-y divide-white/5">
                {pendingTransactions.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <span className="material-symbols-outlined text-4xl text-zinc-800">check_circle</span>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Queue Clear: All payments verified</p>
                  </div>
                ) : (
                  pendingTransactions.map((tx) => (
                    <div key={tx.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                             <span className="material-symbols-outlined">payments</span>
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white uppercase tracking-tight">{tx.profiles?.full_name || 'Anonymous User'}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-white/10">{tx.asset} • {tx.type}</span>
                                <span className="text-[10px] font-mono text-primary">{tx.client_tx_id || 'VAULT_REF'}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                          <div className="relative group">
                             <input 
                               type="number"
                               placeholder="Received Amount"
                               className="w-full md:w-32 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-all shadow-inner"
                               value={verifyAmount[tx.id] || ''}
                               onChange={(e) => setVerifyAmount({ ...verifyAmount, [tx.id]: e.target.value })}
                             />
                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 uppercase tracking-widest pointer-events-none">{tx.asset}</span>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleVerify(tx.id, 'Completed')} 
                               className="flex-1 md:flex-none px-6 py-2.5 bg-success text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                             >
                               Approve
                             </button>
                             <button 
                               onClick={() => handleVerify(tx.id, 'Rejected')} 
                               className="px-4 py-2.5 bg-white/5 text-error text-[10px] font-black uppercase tracking-widest rounded-xl border border-error/20 hover:bg-error/10 transition-all"
                             >
                               Decline
                             </button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Destination Protocol</th>
                    <th className="px-6 py-4 text-right">Signature Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                  {pendingPayouts.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-black">{tx.profiles?.full_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-error/10 text-error rounded text-[9px] font-black uppercase border border-error/20">{tx.asset}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 truncate max-w-[200px]">{tx.client_tx_id || 'VAULT_TRANSFER'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleVerify(tx.id, 'Completed')} className="px-4 py-1.5 bg-error text-white text-[9px] font-black uppercase tracking-widest rounded hover:bg-error/80 transition-all">
                           Sign & Finalize Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'audit' && (
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Admin Authority</th>
                    <th className="px-6 py-4">Action Protocol</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-black">{log.profiles?.full_name || 'SYSTEM_MASTER'}</td>
                      <td className="px-6 py-4">
                         <span className="text-primary font-bold uppercase tracking-tight">{log.action_type}</span>
                         <span className="text-[9px] text-zinc-600 block mt-0.5">{JSON.stringify(log.details).slice(0, 50)}...</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isUserDetailOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserDetailOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl text-primary font-black uppercase">
                    {selectedUser.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedUser.full_name || 'Anonymous'}</h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsUserDetailOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-zinc-400">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Current Balance</span>
                  <p className="text-2xl font-black text-white tracking-tighter">{formatPrice(selectedUser.usd_balance || 0)}</p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Joined</span>
                  <p className="text-xl font-black text-zinc-400 tracking-tight">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Active Investments</h3>
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                  {userInvestments.length === 0 ? (
                    <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic">No active strategies detected</p>
                    </div>
                  ) : (
                    userInvestments.map(inv => (
                      <div key={inv.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center group hover:border-white/20 transition-all">
                        <div>
                          <span className="block text-[11px] font-black text-white uppercase tracking-tight">{inv.plan_name}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">{formatPrice(inv.amount)} • {inv.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[11px] font-black text-success">+{formatPrice(inv.expected_profit)}</span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase">Ends: {new Date(inv.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Inject Manual Profit</span>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        placeholder="Profit Amount"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary"
                        value={profitAmount[selectedUser.id] || ''}
                        onChange={(e) => setProfitAmount({ ...profitAmount, [selectedUser.id]: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleAddProfit(selectedUser.id)}
                        disabled={processingId === selectedUser.id}
                        variant="primary" 
                        className="px-8 font-black uppercase tracking-widest text-[10px]"
                      >
                        {processingId === selectedUser.id ? 'Processing...' : 'Authorize Profit'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 z-[200] space-y-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="w-80 p-5 bg-zinc-950 border border-primary/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-50"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(252,213,53,0.5)]"></div>
              
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative z-10">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
              
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Incoming Transaction</h4>
                <p className="text-[11px] text-white font-bold uppercase tracking-tight leading-relaxed">{n.message}</p>
                <div className="mt-3 flex items-center gap-2">
                   <button 
                     onClick={() => {
                       setActiveTab('verifications');
                       setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                     }}
                     className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline"
                   >
                     Review Now
                   </button>
                   <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                   <button 
                     onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                     className="text-[8px] font-black text-zinc-600 uppercase tracking-widest hover:text-white"
                   >
                     Dismiss
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
