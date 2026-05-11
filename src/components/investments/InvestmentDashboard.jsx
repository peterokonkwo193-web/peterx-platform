import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useCurrency } from '../../context/CurrencyContext';
import { cn } from '../../utils/cn';

const InvestmentDashboard = ({ investments }) => {
  const { formatPrice } = useCurrency();
  const [now, setNow] = useState(new Date());

  // Update "now" every second for real-time tracking
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateLiveStats = (inv) => {
    const start = new Date(inv.start_date).getTime();
    const end = new Date(inv.end_date).getTime();
    const current = now.getTime();
    
    const totalDuration = end - start;
    const elapsed = Math.max(0, current - start);
    const progress = Math.min(100, (elapsed / totalDuration) * 100);
    
    const isCompleted = current >= end;
    const liveProfit = isCompleted ? inv.expected_profit : (inv.expected_profit * (progress / 100));
    
    // Time left
    const diff = end - current;
    let timeLeft = "Completed";
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    return { progress, liveProfit, timeLeft, isCompleted };
  };

  const activeInvestments = investments.filter(inv => inv.status === 'Active');
  const completedInvestments = investments.filter(inv => inv.status === 'Completed');

  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  
  // Calculate total live profit across all active investments
  const totalLiveProfit = activeInvestments.reduce((sum, inv) => {
    const { liveProfit } = calculateLiveStats(inv);
    return sum + liveProfit;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-white/5 bg-white/[0.02] relative overflow-hidden group" glass>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] block mb-1">Total Invested</span>
          <h4 className="text-2xl font-black text-white tracking-tighter">{formatPrice(totalInvested)}</h4>
        </Card>
        <Card className="p-6 border-white/5 bg-white/[0.02] relative overflow-hidden group" glass>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-success">
            <span className="material-symbols-outlined text-4xl">trending_up</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] block mb-1">Live Profit</span>
          <h4 className="text-2xl font-black text-success tracking-tighter">
            +{formatPrice(totalLiveProfit)}
            <span className="text-[10px] text-success/60 ml-2 animate-pulse">LIVE</span>
          </h4>
        </Card>
        <Card className="p-6 border-white/5 bg-white/[0.02] relative overflow-hidden group" glass>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-primary">
             <span className="material-symbols-outlined text-4xl">verified</span>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] block mb-1">Status</span>
          <h4 className="text-2xl font-black text-primary tracking-tighter">Online</h4>
        </Card>
      </div>

      {/* Active Investments */}
      <Card className="p-0 overflow-hidden border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]" glass>
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Active Plans</h3>
            <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1">Live tracking</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full border border-success/20">
                <span className="w-1 h-1 rounded-full bg-success animate-ping"></span>
                <span className="text-[8px] font-black text-success uppercase">Sync: 100%</span>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-zinc-500 text-[10px] uppercase tracking-widest font-black border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Profit</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeInvestments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                       <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse"></div>
                          <span className="material-symbols-outlined text-primary text-3xl relative z-10">rocket_launch</span>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Protocol Idle</h4>
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">No active yield strategies detected in cluster.</p>
                       </div>
                       <button 
                         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                         className="px-6 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[8px] font-bold text-white uppercase tracking-[0.3em] hover:bg-primary hover:text-black hover:border-primary transition-all shadow-2xl"
                       >
                         Initialize Strategy
                       </button>
                    </div>
                  </td>
                </tr>
              ) : (
                activeInvestments.map((inv) => {
                  const { progress, liveProfit, timeLeft, isCompleted } = calculateLiveStats(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isCompleted ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-primary animate-pulse"
                          )}></div>
                          <div>
                              <span className="text-xs font-black text-white uppercase tracking-tight block">{inv.plan_name}</span>
                              <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">ID: {inv.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] font-bold text-zinc-400">{formatPrice(inv.amount)}</td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                         <div className="flex flex-col">
                            <span className="text-success font-black">+{formatPrice(liveProfit)}</span>
                            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Target: {formatPrice(inv.expected_profit)}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                            <span className="text-zinc-500">Maturity</span>
                            <span className={cn("font-mono", isCompleted ? "text-success" : "text-white")}>{timeLeft}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <motion.div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                isCompleted ? "bg-success" : "bg-primary shadow-[0_0_12px_rgba(252,213,53,0.4)]"
                              )} 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            ></motion.div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                          isCompleted 
                            ? "bg-success/10 border-success/30 text-success" 
                            : "bg-zinc-900 border-white/10 text-zinc-500"
                        )}>
                          {isCompleted ? 'Completed' : 'Running'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* History */}
      <Card className="p-0 overflow-hidden border-white/5 opacity-60" glass>
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[10px]">
              {completedInvestments.map((inv) => (
                <tr key={inv.id} className="text-zinc-500">
                  <td className="px-6 py-4 uppercase font-black">{inv.plan_name}</td>
                  <td className="px-6 py-4">{formatPrice(inv.amount)}</td>
                  <td className="px-6 py-4 text-success">+{formatPrice(inv.expected_profit)}</td>
                  <td className="px-6 py-4 font-bold">{new Date(inv.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-success/10 border border-success/20 rounded text-success font-black uppercase">Completed</span>
                  </td>
                </tr>
              ))}
              {completedInvestments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-700 italic font-bold">No historical data in current epoch</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentDashboard;
