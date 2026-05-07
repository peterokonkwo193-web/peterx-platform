import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../context/CurrencyContext';
import { stakeAssets, claimStakingRewards, updateProfileBalance } from '../lib/db';
import { cn } from '../utils/cn';

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
      <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-2 py-0.5 bg-primary/20 rounded text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20">Protocol Yield</span>
               <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Mainnet Governance Active</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Institutional Staking</h1>
            <p className="text-sm text-zinc-500 font-medium">Secure your assets in the Equity Citadel protocol and earn high-fidelity yields.</p>
          </div>
          <Card className="px-8 py-4 border border-primary/20 shadow-2xl" glass>
             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Protocol Total Value Locked</span>
             <span className="text-2xl font-black text-white tracking-tighter">{formatPrice(calculateTotalTVL() + 124200000)}</span>
          </Card>
        </header>

        {/* ACTIVE STAKES ODOMETER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <Card className="p-6 border border-white/5 shadow-xl relative overflow-hidden" glass>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Total Staked Value</span>
              <p className="text-3xl font-black text-white tracking-tighter">{formatPrice(stakingPositions?.reduce((a,b) => a + parseFloat(b.amount), 0) || 0)}</p>
           </Card>
           <Card className="p-6 border border-white/5 shadow-xl" glass>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Accumulated Yield</span>
              <div className="flex items-end gap-2">
                 <p className="text-3xl font-black text-success tracking-tighter font-mono">+{formatPrice(124.50)}</p>
                 <span className="text-[10px] font-black text-success/60 mb-1.5 animate-pulse">TICKING</span>
              </div>
           </Card>
           <Card className="p-6 border border-white/5 shadow-xl" glass>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Active Positions</span>
              <p className="text-3xl font-black text-white tracking-tighter">{stakingPositions?.length || 0}</p>
           </Card>
           <Card className="p-6 border border-white/5 shadow-xl" glass>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Protocol APR</span>
              <p className="text-3xl font-black text-primary tracking-tighter">12.42%</p>
           </Card>
        </div>

        {/* STAKING POOLS */}
        <div className="space-y-6">
           <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] px-2">Available Institutional Pools</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STAKING_POOLS.map(pool => (
                 <Card key={pool.asset} className="p-8 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer" glass onClick={() => setSelectedPool(pool)}>
                    <div className="flex justify-between items-start mb-8">
                       <div className={cn("w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-2xl shadow-inner", pool.color)}>
                          <span className="material-symbols-outlined text-3xl">{pool.icon}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Variable APR</span>
                          <span className="text-2xl font-black text-success tracking-tighter">{pool.apr}%</span>
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight mb-1">{pool.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">Tier 4 Verification Required</p>
                    <Button variant="outline" className="w-full py-3 font-black text-[10px] uppercase tracking-widest group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">Select Pool</Button>
                 </Card>
              ))}
           </div>
        </div>

        {/* ACTIVE POSITIONS TABLE */}
        <Card className="overflow-hidden border border-white/5 shadow-2xl" glass>
           <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Active Protocol Stakes</h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-[11px] font-mono">
                 <thead className="bg-white/5 text-zinc-500 font-black uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-5">Asset</th>
                       <th className="px-8 py-5">Staked Amount</th>
                       <th className="px-8 py-5 text-center">Protocol APR</th>
                       <th className="px-8 py-5">Unlock Date</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-8 py-5 text-right">Yield</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {stakingPositions?.map(pos => (
                       <tr key={pos.id} className="hover:bg-white/5 transition-all">
                          <td className="px-8 py-5 font-black text-white">{pos.asset}</td>
                          <td className="px-8 py-5 text-zinc-300 font-bold">{parseFloat(pos.amount).toLocaleString()} {pos.asset}</td>
                          <td className="px-8 py-5 text-center">
                             <span className="px-3 py-1 bg-success/10 text-success rounded-lg font-black">{pos.apr}%</span>
                          </td>
                          <td className="px-8 py-5 text-zinc-500">{new Date(pos.unlock_at).toLocaleDateString()}</td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-primary font-black uppercase tracking-tighter">ACCUMULATING</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right text-success font-black">+{formatPrice(0.42)}</td>
                       </tr>
                    ))}
                    {(!stakingPositions || stakingPositions.length === 0) && (
                       <tr><td colSpan="6" className="py-20 text-center text-zinc-700 italic font-black uppercase tracking-widest text-[9px]">No Active Staking Protocol Instances Found</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>

      {/* Staking Modal */}
      <AnimatePresence>
         {selectedPool && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPool(null)} />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
                  <Card className="p-10 border border-primary/20 shadow-2xl" glass>
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                           <div className={cn("w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-xl", selectedPool.color)}>
                              <span className="material-symbols-outlined">{selectedPool.icon}</span>
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-white tracking-tighter">{selectedPool.name}</h3>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedPool.apr}% Annual Percentage Rate</p>
                           </div>
                        </div>
                        <button onClick={() => setSelectedPool(null)} className="text-zinc-600 hover:text-white transition-colors">
                           <span className="material-symbols-outlined">close</span>
                        </button>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Amount to Stake ({selectedPool.asset})</label>
                           <div className="relative">
                              <input 
                                 type="number" 
                                 value={amount} 
                                 onChange={(e) => setAmount(e.target.value)}
                                 className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-primary transition-all"
                                 placeholder={`Min ${selectedPool.min}`}
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Lock Duration</label>
                           <div className="grid grid-cols-4 gap-2">
                              {[30, 90, 180, 365].map(days => (
                                 <button 
                                    key={days} 
                                    onClick={() => setLockPeriod(days)}
                                    className={cn("py-3 rounded-xl border text-[10px] font-black uppercase transition-all", lockPeriod === days ? "bg-primary text-black border-primary" : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10")}
                                 >
                                    {days}D
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-[10px] font-bold">
                           <div className="flex justify-between items-center">
                              <span className="text-zinc-600 uppercase">Estimated Daily Yield</span>
                              <span className="text-primary font-mono">{formatPrice(((parseFloat(amount || 0) * (selectedPool.apr / 100)) / 365))}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-zinc-600 uppercase">Protocol Unlock Date</span>
                              <span className="text-zinc-300 font-mono">
                                 {new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </span>
                           </div>
                        </div>

                        <Button 
                           variant="primary" 
                           className="w-full py-5 font-black uppercase tracking-[0.3em] shadow-2xl"
                           onClick={handleStake}
                           disabled={executing || !amount || parseFloat(amount) < selectedPool.min}
                        >
                           {executing ? 'Securing Protocol...' : `Commit ${selectedPool.asset} to Vault`}
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
