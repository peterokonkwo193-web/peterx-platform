import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import WidgetErrorBoundary from '../components/common/WidgetErrorBoundary';
import IdentityVerification from '../components/dashboard/IdentityVerification';
import TransferModal from '../components/dashboard/TransferModal';
import OnboardingTour from '../components/common/OnboardingTour';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useLivePrices } from '../hooks/useLivePrices';
import { useCurrency } from '../context/CurrencyContext';
import { getInvestments } from '../lib/db';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { user, profile, portfolio, transactions, loading: dataLoading, error: supabaseError } = useSupabaseData();
  const { prices } = useLivePrices();
  const { currency, formatPrice } = useCurrency();
  const [investments, setInvestments] = useState([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (user) {
        const data = await getInvestments(user.id);
        setInvestments(data || []);
      }
    };
    fetchInvestments();
  }, [user]);

  const calculatePortfolioValue = () => {
    if (!profile) return 0;
    let total = parseFloat(profile.usd_balance) || 0;
    if (portfolio) {
      portfolio.forEach(item => {
        const price = prices?.[item.symbol.toLowerCase()]?.usd || 0;
        total += item.amount * price;
      });
    }
    return total;
  };

  const calculateTotalProfit = () => {
    if (!investments) return 0;
    const now = new Date().getTime();
    return investments.reduce((sum, inv) => {
      if (inv.status !== 'Active') return sum;
      const start = new Date(inv.start_date).getTime();
      const end = new Date(inv.end_date).getTime();
      const totalDuration = end - start;
      const elapsed = Math.max(0, now - start);
      const progress = Math.min(1, elapsed / totalDuration);
      return sum + (inv.expected_profit * progress);
    }, 0);
  };

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(252,213,53,0.3)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (supabaseError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-error text-5xl mb-4 animate-pulse">cloud_off</span>
          <h2 className="text-xl font-bold text-error mb-2">Connection Interrupted</h2>
          <p className="text-secondary text-sm mb-6">Unable to retrieve protocol data. Please ensure your connection is stable.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="px-8 font-bold border-error/30 text-error hover:bg-error/10">Retry Connection</Button>
        </div>
      </DashboardLayout>
    );
  }

  const portfolioValue = calculatePortfolioValue();

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto py-8 md:py-20 px-4 md:px-8 space-y-8 md:space-y-12">
        
        {/* DASHBOARD HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="px-4 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-xl">System Status</div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Master Node: Active</span>
                 </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">My <span className="text-primary italic">Portfolio</span></h1>
           </div>
           
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
               <div className="flex-1 lg:flex-none p-6 md:p-7 citadel-card bg-white/[0.02] border border-white/5 min-w-[200px] md:min-w-[260px] relative overflow-hidden group shadow-xl">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] group-hover:scale-150 transition-transform"></div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Total Balance</span>
                  <div className="flex items-baseline gap-3 relative z-10">
                     <span className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">{formatPrice(portfolioValue)}</span>
                     <div className="flex items-center gap-1 text-success">
                        <span className="text-[10px] font-black tracking-tighter">+12.4%</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => window.location.href = '/deposit'}
                    className="p-6 md:p-7 citadel-card bg-primary text-black flex items-center justify-center shadow-2xl transition-all group"
                  >
                     <span className="material-symbols-outlined text-2xl font-black group-hover:rotate-90 transition-transform">add_circle</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsTransferOpen(true)}
                    className="p-6 md:p-7 citadel-card bg-white/[0.03] border border-white/5 hover:border-white/20 text-white flex items-center justify-center transition-all group"
                  >
                     <span className="material-symbols-outlined text-2xl font-black group-hover:scale-110 transition-transform">payments</span>
                  </motion.button>
               </div>
            </div>
        </header>

        {/* CORE ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
           
            {/* INVESTMENT OVERVIEW */}
            <div className="lg:col-span-8 space-y-8">
               <Card className="p-8 md:p-12 citadel-card bg-white/[0.01] border-white/5 relative overflow-hidden" glass glow>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                     <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Investment Mix</h2>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Performance Analysis & Yield Distribution</p>
                     </div>
                     <Link to="/investments">
                        <Button variant="outline" className="text-[9px] font-black uppercase tracking-widest py-3 px-8 border-white/10 hover:bg-white/5">Manage Plans</Button>
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                     <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Active Plans</span>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black text-white tracking-tighter leading-none">{investments.filter(i => i.status === 'Active').length}</span>
                           <span className="text-[10px] font-black text-primary uppercase">Tier 4</span>
                        </div>
                     </div>
                     <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Yield Efficiency</span>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black text-success tracking-tighter leading-none">98.4%</span>
                           <span className="material-symbols-outlined text-success text-sm">trending_up</span>
                        </div>
                     </div>
                     <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">System Safety</span>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black text-white tracking-tighter leading-none">Minimal</span>
                           <span className="material-symbols-outlined text-zinc-500 text-sm">shield</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 p-8 bg-primary/5 rounded-[32px] border border-primary/10">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
                           <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-widest">Protocol Intelligence</h3>
                           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">AI-driven liquidity optimization active across all vaults.</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                           <span>Settlement Progress</span>
                           <span className="text-primary">84%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                           <div className="h-full w-4/5 bg-primary rounded-full shadow-[0_0_15px_rgba(252,213,53,0.4)]"></div>
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="p-0 citadel-card overflow-hidden shadow-xl" glass>
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                     <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Active Investment Plans</h2>
                     <Link to="/investments" className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">View All</Link>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5">
                           <tr>
                              <th className="px-8 py-5">Strategy</th>
                              <th className="px-8 py-5">Principal</th>
                              <th className="px-8 py-5">Expected ROI</th>
                              <th className="px-8 py-5 text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {investments.slice(0, 5).map((inv) => (
                              <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 group-hover:border-primary/40 transition-all shadow-xl">
                                          <span className="material-symbols-outlined text-xl">token</span>
                                       </div>
                                       <div>
                                          <span className="block font-black text-white text-[12px] uppercase tracking-tight">{inv.plan_id} Protocol</span>
                                          <span className="text-[8px] text-zinc-600 font-bold uppercase">Ends: {new Date(inv.end_date).toLocaleDateString()}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-white font-black text-sm tracking-tighter">{formatPrice(inv.amount)}</td>
                                 <td className="px-8 py-6 text-success font-black text-sm tracking-tighter">+{formatPrice(inv.expected_profit)}</td>
                                 <td className="px-8 py-6 text-right">
                                    <span className={cn("px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", inv.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20')}>
                                       {inv.status}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                           {investments.length === 0 && (
                              <tr>
                                 <td colSpan="4" className="px-8 py-12 text-center">
                                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">No Active Strategies Detected</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </Card>
            </div>

            {/* SIDEBAR ANALYTICS */}
            <div className="lg:col-span-4 space-y-10">
               {/* RECENT SETTLEMENTS */}
               <Card className="p-8 citadel-card overflow-hidden flex flex-col min-h-[400px]" glass glow>
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Transaction History</h3>
                     <span className="material-symbols-outlined text-zinc-700 text-sm">history</span>
                  </div>
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                     {transactions?.slice(0, 8).map((tx, i) => (
                        <Link key={i} to="/wallet" className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/5 rounded-3xl group hover:bg-white/[0.03] transition-all hover:border-primary/20 active:scale-95 shadow-xl">
                           <div className="flex items-center gap-5">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110", tx.type === 'Deposit' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error')}>
                                 <span className="material-symbols-outlined text-xl">{tx.type === 'Deposit' ? 'south_west' : 'north_east'}</span>
                              </div>
                              <div>
                                 <span className="block text-[11px] font-black text-white uppercase tracking-tight">{tx.type}</span>
                                 <span className="text-[8px] text-zinc-600 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className={cn("block text-[12px] font-black font-mono", tx.status === 'Pending Verification' ? 'text-primary' : 'text-white')}>
                                {tx.status === 'Pending Verification' ? 'PENDING' : formatPrice(tx.amount)}
                              </span>
                              <span className={cn("text-[8px] font-black uppercase tracking-widest", tx.status === 'Pending Verification' ? 'text-primary animate-pulse' : 'text-zinc-700')}>{tx.status}</span>
                           </div>
                        </Link>
                     ))}
                  </div>
               </Card>

               <Card className="p-8 citadel-card bg-primary/5 border-primary/10 relative overflow-hidden group shadow-2xl" glass>
                  <div className="absolute -bottom-12 -right-12 text-[140px] font-black text-white/[0.02] pointer-events-none select-none tracking-tighter">SEC</div>
                  <div className="relative z-10 space-y-6">
                     <div className="w-14 h-14 rounded-2xl bg-black border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-2xl">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Top-Level Security</h3>
                     <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase tracking-widest">Your capital is protected by Multi-Sig custody and Tier-4 protocol encryption. 100% of reserves are verified on-chain.</p>
                     <Button variant="primary" className="w-full py-4 text-[9px] font-black uppercase tracking-widest mt-6 shadow-[0_0_30px_rgba(252,213,53,0.2)]">Audit Report</Button>
                  </div>
               </Card>
            </div>
        </div>

        {/* Identity Verification Prompt */}
        {profile && !profile.is_verified && (
          <IdentityVerification />
        )}
      </div>

      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
      <OnboardingTour isActive={isTourActive} onComplete={() => setIsTourActive(false)} />
    </DashboardLayout>
  );
};

export default Dashboard;
