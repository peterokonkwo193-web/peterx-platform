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
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'verifications' | 'payouts' | 'audit' | 'portfolio'
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
              <h1 className="text-4xl font-black text-white tracking-tighter">Command Terminal</h1>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { label: 'Total Accounts', val: users.length, color: 'text-primary', icon: 'group' },
                { label: 'Protocol TVL', val: formatPrice(treasuryMetrics.totalBalance), color: 'text-white', icon: 'account_balance_wallet' },
                { label: 'Pending Payouts', val: pendingPayouts.length, color: 'text-error', icon: 'payments' },
                { label: 'Active Nodes', val: '14/14', color: 'text-success', icon: 'hub' },
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
            { id: 'users', label: 'User Directory', color: 'primary' },
            { id: 'verifications', label: 'Funding Requests', color: 'success', count: pendingTransactions.length },
            { id: 'payouts', label: 'Payout Signatures', color: 'error', count: pendingPayouts.length },
            { id: 'portfolio', label: 'Global Registry', color: 'zinc-400' },
            { id: 'audit', label: 'Audit Ledger', color: 'primary' },
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
                    <th className="px-6 py-4">Institutional User</th>
                    <th className="px-6 py-4">Internal ID</th>
                    <th className="px-6 py-4">Mark Price Balance</th>
                    <th className="px-6 py-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] text-primary font-black uppercase">
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="block font-black text-white">{u.full_name || 'Anonymous'}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{u.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-white font-bold">{formatPrice(u.usd_balance || 0)}</td>
                      <td className="px-6 py-4 text-right text-zinc-600">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'verifications' && (
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Asset/Type</th>
                    <th className="px-6 py-4">Protocol Hash</th>
                    <th className="px-6 py-4 text-right">Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                  {pendingTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-black">{tx.profiles?.full_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-success/10 text-success rounded text-[9px] font-black uppercase border border-success/20">{tx.asset} • {tx.type}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{tx.client_tx_id || 'INTERNAL'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <input 
                            type="number"
                            placeholder="Amt"
                            className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-primary"
                            value={verifyAmount[tx.id] || ''}
                            onChange={(e) => setVerifyAmount({ ...verifyAmount, [tx.id]: e.target.value })}
                          />
                          <button onClick={() => handleVerify(tx.id, 'Completed')} className="p-1.5 bg-success/10 text-success rounded-lg border border-success/20 hover:bg-success hover:text-black transition-all">
                             <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </DashboardLayout>
  );
};

export default Admin;
