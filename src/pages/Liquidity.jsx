import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const Liquidity = () => {
  const { formatPrice } = useCurrency();
  const [tvl, setTvl] = useState(12480500); // Mock TVL

  // Simulated live updates for TVL
  useEffect(() => {
    const interval = setInterval(() => {
      setTvl(prev => prev + (Math.random() * 100 - 40));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Value Locked (TVL)', value: formatPrice(tvl), icon: 'account_balance' },
    { label: 'Protocol Efficiency', value: '99.98%', icon: 'bolt' },
    { label: 'Multi-Sig Clearance', value: 'Level 4', icon: 'verified_user' },
    { label: 'Active Settlement Nodes', value: '24/24', icon: 'hub' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto py-12 md:py-24 px-4 md:px-8 space-y-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-bold text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Protocol Core</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Healthy</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter uppercase leading-[0.9]">Liquidity <span className="text-primary italic">Pools</span></h1>
            <p className="text-zinc-500 text-lg max-w-xl font-medium leading-relaxed uppercase tracking-tight">The backbone of our settlement engine. Verified capital reserves ensuring zero-slippage institutional execution.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="p-8 citadel-card border-white/5 bg-white/[0.02] relative overflow-hidden group" glass glow>
              <div className="absolute -right-4 -bottom-4 text-6xl font-black text-white/[0.02] group-hover:text-primary/[0.05] transition-colors">{stat.icon}</div>
              <div className="flex flex-col gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-all">
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">{stat.label}</span>
                  <span className="text-2xl font-bold text-white tracking-tighter">{stat.value}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2 p-10 md:p-16 citadel-card bg-primary/5 border-primary/10 relative overflow-hidden group" glass>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div className="max-w-2xl relative z-10 space-y-10">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tighter uppercase leading-tight">Institutional <br/><span className="text-primary italic">Settlement Layer</span></h3>
                <p className="text-zinc-500 text-lg font-medium leading-relaxed uppercase tracking-tight">Our secondary liquidity pools provide a multi-layered security buffer for all capital allocations. By maintaining high-volume TVL, we ensure that every client can enter and exit strategies with 100% protocol efficiency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-2">
                   <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Protocol Protection</h4>
                   <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight leading-relaxed">Multi-Sig custodial storage across three distinct geological zones ensures absolute safety of the pool capital.</p>
                </div>
                <div className="space-y-2">
                   <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Settlement Speed</h4>
                   <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight leading-relaxed">Trades are routed through the liquidity pools to bypass traditional exchange latency, achieving sub-10ms execution.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-10 citadel-card bg-white/[0.02] border-white/5 flex flex-col justify-between" glass glow>
             <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Node Distribution</h3>
                   <span className="material-symbols-outlined text-primary">hub</span>
                </div>

                <div className="space-y-6">
                   <NodeBar label="North America" percent={42} />
                   <NodeBar label="European Union" percent={38} />
                   <NodeBar label="Asia Pacific" percent={15} />
                   <NodeBar label="Middle East" percent={5} />
                </div>
             </div>

             <div className="mt-10 p-6 bg-black/40 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                   <span className="material-symbols-outlined text-success text-sm">shield</span>
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Protection</span>
                </div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Liquidity is protected by our Tier-4 AI monitoring system, detecting and neutralizing protocol risks in real-time.</p>
             </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const NodeBar = ({ label, percent }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
      <span className="text-zinc-600">{label}</span>
      <span className="text-white">{percent}%</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(252,213,53,0.3)]"
      ></motion.div>
    </div>
  </div>
);

export default Liquidity;
