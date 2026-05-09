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
  let time = Math.floor(Date.now() / 1000) - (50 * 60);

  for (let i = 0; i < 50; i++) {
    const open = basePrice + (Math.random() * (basePrice * 0.01) - (basePrice * 0.005));
    const close = open + (Math.random() * (basePrice * 0.01) - (basePrice * 0.005));
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.002);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.002);

    data.push({
      time: time,
      open,
      high,
      low,
      close,
    });
    time += 60;
  }
  return data;
};

const StatMini = ({ label, val, color = "text-white" }) => (
  <div className="group">
    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1 group-hover:text-zinc-400 transition-colors">{label}</span>
    <span className={cn("text-xs font-bold font-mono", color)}>{val || '---'}</span>
  </div>
);

const NewsItem = ({ title, time, source }) => (
  <div className="group cursor-pointer p-4 rounded-xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
     <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] text-primary uppercase font-black tracking-widest">{source}</span>
        <span className="text-[9px] text-zinc-600 font-bold">{time}</span>
     </div>
     <p className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors leading-relaxed">{title}</p>
  </div>
);

const Dashboard = () => {
  const { profile, portfolio, loading: supabaseLoading, error: supabaseError } = useSupabaseData();
  const { prices, loading: pricesLoading } = useLivePrices();
  const { marketData, loading: marketLoading } = useMarketData();
  const { currency, formatPrice } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChartCoin, setSelectedChartCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedChartCoin) {
      const btc = marketData.find(c => c.symbol.toLowerCase() === 'btc') || marketData[0];
      setSelectedChartCoin(btc);
    }
  }, [marketData, selectedChartCoin]);

  useEffect(() => {
    if (selectedChartCoin) {
      setChartData(generateMockOHLC(selectedChartCoin.current_price));
    }
  }, [selectedChartCoin]);

  useEffect(() => {
    const fetchInv = async () => {
      if (profile) {
        const data = await getInvestments(profile.id);
        setInvestments(data || []);
      }
    };
    fetchInv();
  }, [profile]);

  useEffect(() => {
    if (chartData.length === 0) return;

    const tickInterval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        const lastCandle = { ...newData[lastIndex] };
        
        const volatility = 0.0005;
        const change = lastCandle.close * (Math.random() * volatility - volatility / 2);
        lastCandle.close += change;
        
        if (lastCandle.close > lastCandle.high) lastCandle.high = lastCandle.close;
        if (lastCandle.close < lastCandle.low) lastCandle.low = lastCandle.close;
        
        newData[lastIndex] = lastCandle;
        return newData;
      });
    }, 2000);

    return () => clearInterval(tickInterval);
  }, [chartData.length]);

  const calculatePortfolioValue = () => {
    if (!prices || !portfolio) return 0;
    const idMap = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana' };
    const assetValue = portfolio.reduce((acc, asset) => {
      const cgId = idMap[asset.symbol];
      const price = prices[cgId]?.usd || 0;
      return acc + (parseFloat(asset.amount) * price);
    }, 0);
    return parseFloat(profile?.usd_balance || 0) + assetValue;
  };

  const filteredMarketData = useMemo(() => {
    if (!marketData) return [];
    if (!searchQuery) return marketData;
    const q = searchQuery.toLowerCase();
    return marketData.filter(coin => 
      coin.symbol.toLowerCase().includes(q) || 
      coin.name.toLowerCase().includes(q)
    );
  }, [marketData, searchQuery]);

  const loading = supabaseLoading || pricesLoading || marketLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
      <div className="max-w-[1600px] mx-auto py-12 md:py-20 px-8 space-y-12">
        
        {/* INSTITUTIONAL HUD */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Protocol v4.2 Command</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Global Mainnet: Online</span>
                 </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">Mission <span className="text-primary italic">Control</span></h1>
           </div>
           
           <div className="flex flex-wrap gap-6 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none p-8 citadel-card bg-primary/5 border-primary/10 min-w-[320px] relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform"></div>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Portfolio Settlement</span>
                 <div className="flex items-baseline gap-4 relative z-10">
                    <span className="text-4xl font-black text-white tracking-tighter leading-none">{formatPrice(portfolioValue)}</span>
                    <div className="flex items-center gap-1 text-success">
                       <span className="material-symbols-outlined text-sm font-black">trending_up</span>
                       <span className="text-sm font-black tracking-tighter">+8.42%</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   onClick={() => window.location.href = '/deposit'}
                   className="p-8 citadel-card bg-primary text-black flex items-center justify-center shadow-[0_20px_50px_rgba(252,213,53,0.3)] transition-all group"
                 >
                    <span className="material-symbols-outlined text-3xl font-black group-hover:rotate-90 transition-transform">add</span>
                 </motion.button>
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   onClick={() => setIsTransferOpen(true)}
                   className="p-8 citadel-card bg-white/[0.03] border border-white/5 hover:border-white/20 text-white flex items-center justify-center transition-all group"
                 >
                    <span className="material-symbols-outlined text-3xl font-black group-hover:scale-110 transition-transform">sync_alt</span>
                 </motion.button>
              </div>
           </div>
        </header>

        {/* TERMINAL MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
           
           {/* EXECUTION CHARTS */}
           <div className="md:col-span-12 xl:col-span-9 space-y-10">
              <Card className="p-10 h-[650px] citadel-card flex flex-col relative overflow-hidden" glass glow>
                 <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 p-2 shadow-2xl">
                          <img src={selectedChartCoin?.image} alt="" className="w-full h-full object-contain" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{selectedChartCoin?.symbol.toUpperCase()}<span className="text-zinc-700 ml-1">/USDT</span></h2>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{selectedChartCoin?.name} Protocol</span>
                             <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                             <span className="text-[10px] text-primary font-black uppercase tracking-widest">Sovereign Asset</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-4xl font-black text-white tracking-tighter leading-none mb-2">{formatPrice(selectedChartCoin?.current_price)}</p>
                       <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", selectedChartCoin?.price_change_percentage_24h < 0 ? "bg-error/10 text-error border-error/10" : "bg-success/10 text-success border-success/10")}>
                          {selectedChartCoin?.price_change_percentage_24h > 0 ? '+' : ''}{selectedChartCoin?.price_change_percentage_24h?.toFixed(2)}% <span className="text-zinc-600 ml-1">24H</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex-1 bg-black/60 rounded-[32px] overflow-hidden border border-white/5 relative group shadow-inner">
                    <CandlestickChart data={chartData} />
                    <div className="absolute top-6 right-6 flex gap-3 p-1.5 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl">
                       {['1H', '4H', '1D', '1W'].map(t => (
                          <button key={t} className="px-4 py-2 rounded-xl text-[10px] font-black text-zinc-600 hover:text-white hover:bg-white/5 border border-transparent transition-all uppercase tracking-widest">{t}</button>
                       ))}
                    </div>
                 </div>
              </Card>

              {/* LIQUIDITY FLOW MATRIX */}
              <Card className="p-0 citadel-card overflow-hidden shadow-2xl" glass>
                 <div className="p-10 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-white/[0.01]">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">Market Intelligence</h3>
                       <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Real-Time Cross-Chain Telemetry</p>
                    </div>
                    <div className="relative group">
                       <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-700 group-focus-within:text-primary transition-colors">search</span>
                       <input 
                         type="text" 
                         placeholder="INTELLIGENCE FILTER..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[11px] text-white font-black outline-none focus:border-primary/50 w-full md:w-80 tracking-widest placeholder:text-zinc-800 transition-all shadow-inner"
                       />
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-black text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] border-b border-white/5">
                          <tr>
                             <th className="px-10 py-6">Protocol Asset</th>
                             <th className="px-10 py-6">Mark Settlement</th>
                             <th className="px-10 py-6">Epoch Volatility</th>
                             <th className="px-10 py-6">Capitalization</th>
                             <th className="px-10 py-6 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                          {filteredMarketData.slice(0, 10).map((coin) => (
                             <tr key={coin.id} className="hover:bg-white/[0.02] cursor-pointer group transition-colors" onClick={() => setSelectedChartCoin(coin)}>
                                <td className="px-10 py-5">
                                   <div className="flex items-center gap-4">
                                      <img src={coin.image} className="w-8 h-8 rounded-lg grayscale group-hover:grayscale-0 transition-all" />
                                      <div>
                                         <span className="text-white font-black text-base tracking-tighter">{coin.symbol.toUpperCase()}</span>
                                         <span className="text-[9px] text-zinc-600 font-bold block uppercase tracking-widest">{coin.name} Protocol</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-5 text-white font-black text-base tracking-tighter">{formatPrice(coin.current_price)}</td>
                                <td className="px-10 py-5">
                                   <span className={cn("px-3 py-1 rounded-lg font-black text-[10px] uppercase border", coin.price_change_percentage_24h < 0 ? "bg-error/10 text-error border-error/10" : "bg-success/10 text-success border-success/10")}>
                                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                                   </span>
                                </td>
                                <td className="px-10 py-5 text-zinc-500 font-black">{formatPrice(coin.market_cap / 1e9)}B</td>
                                <td className="px-10 py-5 text-right">
                                   <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 py-2.5 text-[9px] font-black border-zinc-800 uppercase tracking-widest transition-all hover:bg-primary hover:text-black hover:border-primary">Execute</Button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>

           {/* SIDEBAR PROTOCOLS */}
           <div className="md:col-span-12 xl:col-span-3 space-y-10">
              {/* ORDER DEPTH ENGINE */}
              <Card className="h-[480px] p-0 citadel-card overflow-hidden flex flex-col" glass glow>
                 <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Order Depth v4.0</span>
                    <div className="flex gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    </div>
                 </div>
                 <div className="flex-1 overflow-hidden p-4 font-mono text-[10px] space-y-0.5">
                    {[...Array(8)].map((_, i) => (
                       <div key={`ask-${i}`} className="flex justify-between py-1.5 px-3 relative group hover:bg-error/10 cursor-pointer rounded-lg transition-colors">
                          <div className="absolute right-0 top-0 bottom-0 bg-error/5 rounded-lg" style={{ width: `${Math.random() * 80}%` }}></div>
                          <span className="text-error font-black relative z-10 tracking-tighter">{(selectedChartCoin?.current_price + (i * 0.1)).toFixed(2)}</span>
                          <span className="text-zinc-600 relative z-10 font-bold">{(Math.random() * 2).toFixed(4)}</span>
                       </div>
                    ))}
                    <div className="bg-white/[0.03] py-5 px-6 my-4 border-y border-white/5 text-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <span className="text-2xl font-black text-white tracking-tighter relative z-10">{formatPrice(selectedChartCoin?.current_price || 0)}</span>
                    </div>
                    {[...Array(8)].map((_, i) => (
                       <div key={`bid-${i}`} className="flex justify-between py-1.5 px-3 relative group hover:bg-success/10 cursor-pointer rounded-lg transition-colors">
                          <div className="absolute right-0 top-0 bottom-0 bg-success/5 rounded-lg" style={{ width: `${Math.random() * 80}%` }}></div>
                          <span className="text-success font-black relative z-10 tracking-tighter">{(selectedChartCoin?.current_price - (i * 0.1)).toFixed(2)}</span>
                          <span className="text-zinc-600 relative z-10 font-bold">{(Math.random() * 2).toFixed(4)}</span>
                       </div>
                    ))}
                 </div>
              </Card>

              {/* IMMUTABLE EXECUTION LOGS */}
              <Card className="h-[464px] p-0 citadel-card overflow-hidden flex flex-col" glass>
                 <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Execution Streams</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] custom-scrollbar">
                    {[...Array(15)].map((_, i) => (
                       <div key={i} className="flex justify-between p-3 rounded-xl bg-black/40 border border-white/5 group hover:border-white/20 transition-all">
                          <div className="flex items-center gap-3">
                             <span className={cn("font-black px-2 py-0.5 rounded text-[8px] tracking-widest", i % 3 === 0 ? "bg-error/10 text-error" : "bg-success/10 text-success")}>{i % 3 === 0 ? 'SELL' : 'BUY'}</span>
                             <span className="text-zinc-500 font-bold">{(selectedChartCoin?.symbol || 'BTC').toUpperCase()}</span>
                          </div>
                          <span className="text-white font-black tracking-tighter">{(Math.random() * 0.5).toFixed(4)}</span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>
      </div>
      
      {/* INSTITUTIONAL OVERLAYS */}
      <AnimatePresence>
        {isVerificationOpen && (
          <IdentityVerification 
            profile={profile} 
            isOpen={isVerificationOpen} 
            onClose={() => setIsVerificationOpen(false)}
            onComplete={() => window.location.reload()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransferOpen && (
          <TransferModal 
            profile={profile} 
            isOpen={isTransferOpen} 
            onClose={() => setIsTransferOpen(false)}
            onComplete={() => window.location.reload()}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Dashboard;
