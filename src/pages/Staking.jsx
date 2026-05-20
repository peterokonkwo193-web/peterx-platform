import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../context/CurrencyContext';
import { stakeAssets, claimStakingRewards, updateProfileBalance } from '../lib/db';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import { sendProfitEmail } from '../utils/email';

const STAKING_POOLS = [
  { asset: 'BTC', name: 'Bitcoin Institutional', icon: 'currency_bitcoin', apr: 6.5, color: 'text-primary', min: 0.1 },
  { asset: 'ETH', name: 'Ethereum Beacon', icon: 'eth', apr: 8.2, color: 'text-secondary', min: 1.0 },
  { asset: 'SOL', name: 'Solana Validator', icon: 'wb_sunny', apr: 12.4, color: 'text-sky-400', min: 10.0 },
  { asset: 'USDT', name: 'Tether Protocol', icon: 'payments', apr: 15.0, color: 'text-success', min: 1000 },
];

const Staking = () => {
  const { user, profile, stakingPositions, loading: dataLoading } = useSupabaseData();
  const { currency, formatPrice } = useCurrency();
  const [selectedPool, setSelectedPool] = useState(null);
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(30);
  const [executing, setExecuting] = useState(false);

  const calculateTotalTVL = () => {
    return (stakingPositions?.reduce((acc, pos) => acc + (parseFloat(pos.amount) || 0), 0) || 0) * 45000; // Mock TVL calc (USD)
  };

  const handleStake = async () => {
    if (!user || !amount || !selectedPool) return;
    setExecuting(true);
    try {
      const numAmount = parseFloat(amount);
      const usdBalance = parseFloat(profile?.usd_balance || 0);
      
      // For demo, we assume all staking is in USD value equivalent for the balance check
      if (numAmount > usdBalance) throw new Error('Insufficient Institutional Liquidity');

      const unlockAt = new Date();
      unlockAt.setDate(unlockAt.getDate() + lockPeriod);

      await stakeAssets({
        user_id: user.id,
        asset: selectedPool.asset,
        amount: numAmount,
        apr: selectedPool.apr,
        lock_period: lockPeriod,
        unlock_at: unlockAt,
      });

      await updateProfileBalance(user.id, usdBalance - numAmount);

      // Dispatch automated staking confirmation email directly to the client
      if (profile?.email) {
        try {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('usd_balance')
            .eq('id', user.id)
            .single();

          // Fetch other active plans to keep the summary complete
          const { data: activeInvestments } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'Active');

          const { data: activeStaking } = await supabase
            .from('staking_positions')
            .select('*')
            .eq('user_id', user.id);

          const investmentSummary = activeInvestments && activeInvestments.length > 0
            ? activeInvestments.map(inv => 
                `• Strategy: ${inv.plan_name || 'Standard Plan'} | Capital: ${formatPrice(inv.amount)} | Expected Return: +${formatPrice(inv.expected_profit)} | Horizon: ${new Date(inv.end_date).toLocaleDateString()}`
              ).join('\n')
            : 'No active institutional investment plans configured.';

          const stakingSummary = activeStaking && activeStaking.length > 0
            ? activeStaking.map(st => 
                `• Staked Pool: ${st.asset} Pool | Staked Settlement: ${st.amount} ${st.asset} | Epoch APR: ${st.apr}% | Unlock: ${new Date(st.unlock_at).toLocaleDateString()}`
              ).join('\n')
            : `• Staked Pool: ${selectedPool.asset} Pool | Staked Settlement: ${numAmount} ${selectedPool.asset} | Epoch APR: ${selectedPool.apr}% | Unlock: ${unlockAt.toLocaleDateString()}`;

          const fullActivePlansSummary = `${investmentSummary}\n\nStaking Ledger Position:\n${stakingSummary}`;

          await sendProfitEmail({
            to_email: profile.email,
            to_name: profile.full_name,
            amount: `-${formatPrice(numAmount)} (Sovereign Yield Stake Allocation)`,
            new_balance: formatPrice(updatedProfile?.usd_balance || 0),
            active_plans_summary: fullActivePlansSummary
          });
        } catch (emailErr) {
          console.error('[Staking] Failed to dispatch staking confirmation email:', emailErr);
        }
      }

      alert(`${selectedPool.asset} staked successfully for ${lockPeriod} days.`);
      setAmount('');
      setSelectedPool(null);
    } catch (error) {
      alert('Staking Error: ' + error.message);
    } finally {
      setExecuting(false);
    }
  };

  if (dataLoading) {
    return (
      <DashboardLayout>
         <div className="flex items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-primary/10 rounded-full border-t-primary animate-spin"></div>
         </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto py-12 md:py-24 px-8 space-y-16">
        
        {/* INSTITUTIONAL HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Yield Protocol v4.0</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Validator Network: Active</span>
                 </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">Sovereign <span className="text-primary italic">Yield</span></h1>
           </div>
           
           <Card className="p-8 citadel-card bg-primary/5 border-primary/10 min-w-[340px] relative overflow-hidden group" glass glow>
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform"></div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Total Protocol TVL</span>
              <div className="flex items-baseline gap-4 relative z-10">
                 <span className="text-3xl font-black text-white tracking-tighter leading-none">{formatPrice(calculateTotalTVL() + 124200000)}</span>
                 <div className="flex items-center gap-1 text-success">
                    <span className="material-symbols-outlined text-xs font-black">lock</span>
                    <span className="text-[10px] font-black tracking-widest uppercase">Verified</span>
                 </div>
              </div>
           </Card>
        </header>

        {/* YIELD ODOMETERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
              { label: 'Staked Value', val: formatPrice(stakingPositions?.reduce((a,b) => a + parseFloat(b.amount), 0) || 0), color: 'text-white' },
              { label: 'Accrued Rewards', val: `+${formatPrice(124.50)}`, color: 'text-success', sub: 'TICKING' },
              { label: 'Protocol Positions', val: stakingPositions?.length || 0, color: 'text-white' },
              { label: 'Average APR', val: '12.42%', color: 'text-primary' },
           ].map((stat, i) => (
              <Card key={i} className="p-8 citadel-card shadow-2xl relative overflow-hidden" glass>
                 <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl"></div>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">{stat.label}</span>
                 <div className="flex items-end gap-3">
                    <p className={cn("text-3xl font-black tracking-tighter leading-none", stat.color)}>{stat.val}</p>
                    {stat.sub && <span className="text-[9px] font-black text-success/50 mb-1 animate-pulse">{stat.sub}</span>}
                 </div>
              </Card>
           ))}
        </div>

        {/* POOL SELECTION MATRIX */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Available Institutional Pools</h2>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STAKING_POOLS.map(pool => (
                 <Card key={pool.asset} className="p-10 citadel-card border-white/5 hover:border-primary/40 group cursor-pointer transition-all relative overflow-hidden" glass onClick={() => setSelectedPool(pool)}>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-10 relative z-10">
                       <div className={cn("w-16 h-16 rounded-[24px] bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110", pool.color)}>
                          <span className="material-symbols-outlined text-4xl font-black">{pool.icon}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-1">Variable APR</span>
                          <span className="text-3xl font-black text-success tracking-tighter leading-none">{pool.apr}%</span>
                       </div>
                    </div>
                    <div className="relative z-10 space-y-2">
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{pool.name}</h3>
                       <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Sovereign Node v4.0</p>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
                       <Button variant="outline" className="w-full py-4 font-black text-[10px] uppercase tracking-[0.3em] group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all shadow-2xl">Initialize Stake</Button>
                    </div>
                 </Card>
              ))}
           </div>
        </div>

        {/* IMMUTABLE LEDGER */}
        <Card className="overflow-hidden citadel-card shadow-2xl" glass glow>
           <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <div className="space-y-1">
                 <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Active Ledger</h2>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Protocol Position Real-Time Feed</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Synchronizing...</span>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-[11px] font-mono">
                 <thead className="bg-black text-zinc-700 font-black uppercase tracking-[0.4em] border-b border-white/5">
                    <tr>
                       <th className="px-10 py-6">Protocol Asset</th>
                       <th className="px-10 py-6">Staked Settlement</th>
                       <th className="px-10 py-6 text-center">Epoch APR</th>
                       <th className="px-10 py-6">Unlock Horizon</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6 text-right">Yield Tick</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {stakingPositions?.map(pos => (
                       <tr key={pos.id} className="hover:bg-white/[0.02] transition-all group">
                          <td className="px-10 py-5">
                             <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(252,213,53,0.4)]"></span>
                                <span className="font-black text-white text-base tracking-tighter uppercase">{pos.asset}</span>
                             </div>
                          </td>
                          <td className="px-10 py-5 text-zinc-400 font-black text-base tracking-tighter">{parseFloat(pos.amount).toLocaleString()} <span className="text-zinc-700">{pos.asset}</span></td>
                          <td className="px-10 py-5 text-center">
                             <span className="px-4 py-1.5 bg-success/10 text-success rounded-xl font-black text-[10px] uppercase border border-success/10">{pos.apr}%</span>
                          </td>
                          <td className="px-10 py-5 text-zinc-500 font-bold uppercase tracking-widest">{new Date(pos.unlock_at).toLocaleDateString()}</td>
                          <td className="px-10 py-5">
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-primary font-black text-[10px] uppercase tracking-widest">Accumulating</span>
                             </div>
                          </td>
                          <td className="px-10 py-5 text-right text-success font-black text-base tracking-tighter">+{formatPrice(0.42)}</td>
                       </tr>
                    ))}
                    {(!stakingPositions || stakingPositions.length === 0) && (
                       <tr><td colSpan="6" className="py-24 text-center text-zinc-800 italic font-black uppercase tracking-[0.5em] text-[10px]">No Active Protocol Instances Found</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>

      {/* EXECUTION MODAL */}
      <AnimatePresence>
         {selectedPool && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPool(null)} />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-2xl">
                  <Card className="p-12 citadel-card border-primary/20 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden" glass glow>
                     <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
                     <div className="flex justify-between items-start mb-12 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className={cn("w-20 h-20 rounded-[32px] bg-zinc-950 border border-white/10 flex items-center justify-center text-3xl shadow-2xl", selectedPool.color)}>
                              <span className="material-symbols-outlined text-4xl font-black">{selectedPool.icon}</span>
                           </div>
                           <div>
                              <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-3">{selectedPool.name}</h3>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] text-success font-black uppercase tracking-[0.3em]">{selectedPool.apr}% Annual Yield</span>
                                 <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                                 <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Sovereign Node v4.0</span>
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setSelectedPool(null)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-all border border-white/5 hover:border-white/10">
                           <span className="material-symbols-outlined text-2xl font-black">close</span>
                        </button>
                     </div>

                     <div className="space-y-10 relative z-10">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block ml-1">Liquidity Amount ({selectedPool.asset})</label>
                           <div className="relative group">
                              <input 
                                 type="number" 
                                 value={amount} 
                                 onChange={(e) => setAmount(e.target.value)}
                                 className="w-full bg-black/60 border border-white/10 rounded-3xl px-10 py-8 text-2xl font-black text-white outline-none focus:border-primary transition-all shadow-inner tracking-tighter placeholder:text-zinc-900"
                                 placeholder={`0.00 ${selectedPool.asset}`}
                              />
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-xl">MIN: {selectedPool.min}</div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block ml-1">Lock Duration Horizon</label>
                           <div className="grid grid-cols-4 gap-4">
                              {[30, 90, 180, 365].map(days => (
                                 <button 
                                    key={days} 
                                    onClick={() => setLockPeriod(days)}
                                    className={cn("py-5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group", lockPeriod === days ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(252,213,53,0.3)]" : "bg-black/40 text-zinc-600 border-white/5 hover:border-white/10 hover:text-white")}
                                 >
                                    {days} Days
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] block">Epoch Yield</span>
                              <span className="text-xl font-black text-primary tracking-tighter font-mono">{formatPrice(((parseFloat(amount || 0) * (selectedPool.apr / 100)) / 365))}</span>
                           </div>
                           <div className="space-y-2 text-right">
                              <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] block">Unlock Horizon</span>
                              <span className="text-xl font-black text-white tracking-tighter font-mono">
                                 {new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </span>
                           </div>
                        </div>

                        <Button 
                           variant="primary" 
                           className="w-full py-8 rounded-3xl font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_20px_60px_rgba(252,213,53,0.4)] transition-all hover:scale-[1.02]"
                           onClick={handleStake}
                           disabled={executing || !amount || parseFloat(amount) < selectedPool.min}
                        >
                           {executing ? 'Securing Protocol...' : `Authorize ${selectedPool.asset} Allocation`}
                        </Button>
                     </div>
                  </Card>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Staking;
