import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CandlestickChart from '../components/CandlestickChart';
import WidgetErrorBoundary from '../components/common/WidgetErrorBoundary';
import IdentityVerification from '../components/dashboard/IdentityVerification';
import TransferModal from '../components/dashboard/TransferModal';
import OnboardingTour from '../components/common/OnboardingTour';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useLivePrices } from '../hooks/useLivePrices';
import { useMarketData } from '../hooks/useMarketData';
import { useCurrency } from '../context/CurrencyContext';
import { getInvestments } from '../lib/db';
import { cn } from '../utils/cn';

// Helper functions and sub-components
const generateMockOHLC = (basePrice) => {
  const data = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 100; i >= 0; i--) {
    const open = currentPrice + (Math.random() - 0.5) * 50;
    const close = open + (Math.random() - 0.5) * 100;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    data.push({ time: now - i * 3600, open, high, low, close });
    currentPrice = close;
  }
  return data;
};

const StatItem = ({ label, val, sub, color = "text-white" }) => (
  <div className="space-y-2 p-2">
    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className={cn("text-2xl font-black tracking-tighter", color)}>{val}</span>
      {sub && <span className="text-[10px] font-bold text-zinc-700 uppercase">{sub}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile, portfolio, transactions, loading: dataLoading, error: supabaseError } = useSupabaseData();
  const { prices } = useLivePrices();
  const { marketData, loading: marketLoading } = useMarketData();
  const { currency, formatPrice } = useCurrency();
  const [selectedChartCoin, setSelectedChartCoin] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedChartCoin) {
      setSelectedChartCoin(marketData[0]);
    }
  }, [marketData, selectedChartCoin]);

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

  const chartData = useMemo(() => {
    return generateMockOHLC(selectedChartCoin?.current_price || 50000);
  }, [selectedChartCoin]);

  if (dataLoading || marketLoading) {
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
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 md:gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Live Status</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Global: Online</span>
                 </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase leading-[0.9]">My <span className="text-primary italic">Dashboard</span></h1>
           </div>
           
            <div className="flex flex-wrap gap-4 md:gap-6 w-full lg:w-auto">
               <div className="flex-1 lg:flex-none p-6 md:p-8 citadel-card bg-white/[0.02] border border-white/5 min-w-[250px] md:min-w-[300px] relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] group-hover:scale-150 transition-transform"></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Total Balance</span>
                  <div className="flex items-baseline gap-4 relative z-10">
                     <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter leading-none">{formatPrice(portfolioValue)}</span>
                     <div className="flex items-center gap-1 text-success">
                        <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
                        <span className="text-sm font-bold tracking-tighter">+8.42%</span>
                     </div>
                  </div>
               </div>

               <div className="flex-1 lg:flex-none p-6 md:p-8 citadel-card bg-primary/5 border-primary/10 min-w-[250px] md:min-w-[300px] relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform"></div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-3">Profit Earnings</span>
                  <div className="flex items-baseline gap-4 relative z-10">
                     <span className="text-3xl md:text-4xl font-bold text-success tracking-tighter leading-none">+{formatPrice(calculateTotalProfit())}</span>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live</span>
                     </div>
                  </div>
               </div>

              <div className="flex gap-4">
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   onClick={() => window.location.href = '/deposit'}
                   className="p-6 md:p-8 citadel-card bg-primary text-black flex items-center justify-center shadow-[0_20px_50px_rgba(252,213,53,0.3)] transition-all group"
                 >
                    <span className="material-symbols-outlined text-3xl font-black group-hover:rotate-90 transition-transform">add</span>
                 </motion.button>
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   onClick={() => setIsTransferOpen(true)}
                   className="p-6 md:p-8 citadel-card bg-white/[0.03] border border-white/5 hover:border-white/20 text-white flex items-center justify-center transition-all group"
                 >
                    <span className="material-symbols-outlined text-3xl font-black group-hover:scale-110 transition-transform">sync_alt</span>
                 </motion.button>
              </div>
           </div>
        </header>

        {/* MARKET DATA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
           
           {/* MARKET CHARTS */}
           <div className="md:col-span-12 xl:col-span-9 space-y-8 md:space-y-10">
              <Card className="p-5 md:p-10 h-auto md:h-[650px] citadel-card flex flex-col relative overflow-hidden" glass glow>
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 relative z-10 gap-6">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/10 p-2 shadow-2xl">
                          <img src={selectedChartCoin?.image} alt="" className="w-full h-full object-contain" />
                       </div>
                       <div>
                          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">{selectedChartCoin?.symbol.toUpperCase()}<span className="text-zinc-700 ml-1">/USDT</span></h2>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{selectedChartCoin?.name}</span>
                             <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                             <span className="text-[10px] text-primary font-black uppercase tracking-widest">Active</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-center md:text-right w-full md:w-auto">
                       <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2">{formatPrice(selectedChartCoin?.current_price)}</p>
                       <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", selectedChartCoin?.price_change_percentage_24h < 0 ? "bg-error/10 text-error border-error/10" : "bg-success/10 text-success border-success/10")}>
                          {selectedChartCoin?.price_change_percentage_24h > 0 ? '+' : ''}{selectedChartCoin?.price_change_percentage_24h?.toFixed(2)}% <span className="text-zinc-600 ml-1">24H</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 min-h-[300px] bg-black/60 rounded-[32px] overflow-hidden border border-white/5 relative group shadow-inner">
                    <CandlestickChart data={chartData} />
                 </div>
              </Card>

              {/* ASSET REGISTRY */}
              <Card className="p-0 citadel-card overflow-hidden shadow-2xl" glass>
                 <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead className="bg-white/[0.02] text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5">
                          <tr>
                             <th className="px-10 py-6">Asset</th>
                             <th className="px-10 py-6">Price</th>
                             <th className="px-10 py-6">24h Change</th>
                             <th className="px-10 py-6">Market Cap</th>
                             <th className="px-10 py-6 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {marketData?.slice(0, 8).map((coin) => (
                             <tr key={coin.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-10 py-5">
                                   <div className="flex items-center gap-4">
                                      <img src={coin.image} alt="" className="w-8 h-8 rounded-lg grayscale group-hover:grayscale-0 transition-all" />
                                      <div>
                                         <span className="block font-black text-white text-sm uppercase tracking-tight">{coin.symbol}</span>
                                         <span className="text-[9px] text-zinc-600 font-bold uppercase">{coin.name}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-5 text-white font-black text-base tracking-tighter">{formatPrice(coin.current_price)}</td>
                                <td className="px-10 py-5">
                                   <span className={cn("text-xs font-black uppercase tracking-widest", coin.price_change_percentage_24h < 0 ? "text-error" : "text-success")}>
                                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                                   </span>
                                </td>
                                <td className="px-10 py-5 text-zinc-500 font-black">{formatPrice(coin.market_cap / 1e9)}B</td>
                                <td className="px-10 py-5 text-right">
                                   <button 
                                     onClick={() => setSelectedChartCoin(coin)}
                                     className="px-6 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary hover:border-primary/40 transition-all"
                                   >
                                      Analyze
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>

           {/* SIDEBAR WIDGETS */}
           <div className="md:col-span-12 xl:col-span-3 space-y-10">
              {/* ASSET DISTRIBUTION */}
              <Card className="h-auto md:h-[480px] p-6 citadel-card overflow-hidden flex flex-col" glass glow>
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Allocation</h3>
                    <span className="material-symbols-outlined text-zinc-700 text-sm">pie_chart</span>
                 </div>
                 <div className="flex-1 flex flex-col justify-center items-center relative py-8">
                    <div className="w-48 h-48 rounded-full border-[12px] border-white/5 relative flex items-center justify-center">
                       <div className="absolute inset-0 rounded-full border-t-[12px] border-primary shadow-[0_0_30px_rgba(252,213,53,0.2)]"></div>
                       <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Mark Price</span>
                          <span className="text-2xl font-black text-white tracking-tighter relative z-10">{formatPrice(selectedChartCoin?.current_price || 0)}</span>
                       </div>
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-6 w-full">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Primary Asset</span>
                          <span className="text-xs font-black text-white uppercase tracking-tight">BTC Ledger</span>
                       </div>
                       <div className="space-y-1 text-right">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Secondary</span>
                          <span className="text-xs font-black text-white uppercase tracking-tight">USDT Vault</span>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* RECENT ACTIVITY */}
              <Card className="h-auto md:h-[464px] p-6 citadel-card overflow-hidden flex flex-col" glass>
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Ledger Activity</h3>
                    <span className="material-symbols-outlined text-zinc-700 text-sm">history</span>
                 </div>
                 <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    {transactions?.slice(0, 10).map((tx, i) => (
                       <Link key={i} to="/wallet" className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl group hover:bg-white/[0.03] transition-all hover:border-primary/20 active:scale-95">
                          <div className="flex items-center gap-4">
                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", tx.type === 'Deposit' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error')}>
                                <span className="material-symbols-outlined text-lg">{tx.type === 'Deposit' ? 'south_west' : 'north_east'}</span>
                             </div>
                             <div>
                                <span className="block text-[11px] font-black text-white uppercase tracking-tight">{tx.type}</span>
                                <span className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={cn("block text-[11px] font-black font-mono", tx.status === 'Pending Verification' ? 'text-primary' : 'text-white')}>
                               {tx.status === 'Pending Verification' ? 'VERIFYING...' : formatPrice(tx.amount)}
                             </span>
                             <span className={cn("text-[8px] font-black uppercase tracking-widest", tx.status === 'Pending Verification' ? 'text-primary animate-pulse' : 'text-zinc-600')}>{tx.status}</span>
                          </div>
                       </Link>
                    ))}
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
