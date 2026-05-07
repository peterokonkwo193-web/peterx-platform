import React, { useState, useEffect, useMemo } from 'react';
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
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 shadow-[0_0_20px_rgba(252,213,53,0.1)] rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
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
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  return (
    <DashboardLayout>
      <OnboardingTour profile={profile} />
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* BROKER HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="px-2 py-0.5 bg-primary/20 rounded text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20">Institutional Broker</div>
                 <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Protocol Version 4.2.1-Mainnet</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">Command Center</h1>
           </div>
           <div className="flex gap-4">
              <div className="flex flex-col items-end px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mark-to-Market Liquidity</span>
                 <span className="text-xl font-black text-white tracking-tighter">{formatPrice(portfolioValue)}</span>
              </div>
           </div>
        </header>

        {/* TOP ROW: PORTFOLIO & NEWS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12 lg:col-span-8">
            <WidgetErrorBoundary>
              <Card className="h-[400px] p-8 relative overflow-hidden group/card shadow-2xl" glass>
                <div className="absolute top-0 right-0 p-8 flex flex-col items-end z-20">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1.5">Network Status</span>
                    <div className="px-4 py-1.5 bg-success/10 border border-success/30 rounded-full text-[10px] text-success font-black uppercase tracking-tighter flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                       Verified Tier 4 Elite
                    </div>
                </div>

                <div className="flex justify-between items-start mb-8 relative z-20">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1 block">Institutional Global Liquidity</span>
                    <h2 className="text-6xl font-black mt-1 tracking-tighter text-white">
                      {formatPrice(portfolioValue)}
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                       <div className="px-2 py-0.5 bg-success/20 rounded text-[10px] font-bold text-success font-mono">+12.4%</div>
                       <span className="text-xs text-zinc-500 font-bold tracking-wide uppercase">PNL Today: <span className="text-success font-black">{formatPrice(1242.10)}</span></span>
                    </div>
                  </div>
                </div>
                
                <div className="h-44 w-full mt-2 relative z-10">
                   <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0 80 Q 20 75, 40 50 T 60 40 T 80 20 T 100 10" fill="none" stroke="var(--primary)" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(252,213,53,0.5)]" />
                      <path d="M0 80 Q 20 75, 40 50 T 60 40 T 80 20 T 100 10 L 100 100 L 0 100 Z" fill="url(#pnlGradient)" />
                      <defs>
                        <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5 relative z-20">
                   <StatMini label="Spot Balance" val={formatPrice(profile?.usd_balance || 0)} />
                   <StatMini label="Invested Funds" val={formatPrice(totalInvested)} color="text-secondary" />
                   <StatMini label="Unrealized PNL" val={`+${formatPrice(842.00)}`} color="text-success" />
                   <div className="flex flex-col gap-2 relative z-10">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTransferOpen(true);
                        }}
                      >
                        Transfer Assets
                      </Button>
                      <StatMini label="Margin Usage" val="0.00%" color="text-zinc-600" />
                   </div>
                </div>
              </Card>
            </WidgetErrorBoundary>
          </div>

          <div className="md:col-span-12 lg:col-span-4">
            <WidgetErrorBoundary>
              <Card className="h-[400px] flex flex-col p-0 overflow-hidden shadow-2xl" glass>
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                         <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Intelligence Stream</h2>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500 font-mono">LIVE FEED</span>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                   <NewsItem title="SEC hints at new crypto framework for institutional traders" time="2m ago" source="Reuters" />
                   <NewsItem title="Bitcoin hash rate hits new all-time high amid network upgrades" time="14m ago" source="Bloomberg" />
                   <NewsItem title="Ethereum L2 adoption spikes 40% in Q1 according to Equity Citadel analysis" time="45m ago" source="X-Analytics" />
                   <NewsItem title="Institutional inflows into Solana ETFs reach record levels" time="1h ago" source="Financial Times" />
                </div>
              </Card>
            </WidgetErrorBoundary>
          </div>
        </div>

        {/* MIDDLE ROW: CHART & ORDER BOOK */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-12 xl:col-span-9">
              <WidgetErrorBoundary>
                <AnimatePresence mode="wait">
                  {selectedChartCoin && (
                    <motion.div 
                      key={selectedChartCoin.id}
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-8 h-[650px] flex flex-col shadow-2xl" glass>
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 p-2 shadow-inner">
                              <img src={selectedChartCoin.image} alt={selectedChartCoin.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
                                {selectedChartCoin.symbol.toUpperCase()}/USD
                                <span className={cn("text-[11px] font-mono font-bold px-3 py-1 rounded-lg border", selectedChartCoin.price_change_percentage_24h < 0 ? "bg-error/10 text-error border-error/20" : "bg-success/10 text-success border-success/20")}>
                                  {selectedChartCoin.price_change_percentage_24h > 0 ? '+' : ''}{selectedChartCoin.price_change_percentage_24h?.toFixed(2)}%
                                </span>
                              </h2>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">High-Fidelity Real-time Protocol Analytics</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Mark Price</span>
                            <span className="text-4xl font-mono font-black block text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(252,213,53,0.3)]">
                              {formatPrice(selectedChartCoin.current_price)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 bg-zinc-950/80 rounded-2xl overflow-hidden border border-white/10 shadow-inner relative group">
                          <CandlestickChart data={chartData} />
                          <div className="absolute bottom-8 right-8 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                             <h1 className="text-4xl font-black italic tracking-tighter">EQUITY CITADEL TERMINAL</h1>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </WidgetErrorBoundary>
           </div>

           <div className="md:col-span-12 xl:col-span-3">
              <WidgetErrorBoundary>
                 <Card className="h-[650px] flex flex-col p-0 overflow-hidden shadow-2xl" glass>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                       <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Order Depth</h2>
                       <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                          <div className="w-2 h-2 rounded-full bg-error"></div>
                       </div>
                    </div>
                    <div className="p-4 bg-zinc-950 flex justify-between text-[10px] text-zinc-500 font-black uppercase tracking-widest border-b border-white/5">
                       <span>Price ({currency.code})</span>
                       <span>Size</span>
                       <span>Total</span>
                    </div>
                    <div className="flex-1 overflow-hidden font-mono text-[10px] py-2">
                       <div className="h-1/2 overflow-hidden flex flex-col-reverse px-2 gap-0.5">
                          {[...Array(12)].map((_, i) => (
                             <div key={`ask-${i}`} className="flex justify-between px-3 py-1.5 relative hover:bg-error/10 cursor-pointer rounded-md transition-all group/order">
                                <div className="absolute right-0 top-0 bottom-0 bg-error/5 rounded-md transition-all group-hover/order:bg-error/10" style={{ width: `${Math.random() * 80}%` }}></div>
                                <span className="text-error font-bold relative z-10">{(selectedChartCoin?.current_price * currency.rate + (i * 0.5 * currency.rate)).toFixed(2)}</span>
                                <span className="text-error font-bold relative z-10">{(selectedChartCoin?.current_price + (i * 0.5)).toFixed(2)}</span>
                                <span className="text-zinc-400 font-medium relative z-10">{(Math.random() * 2).toFixed(4)}</span>
                                <span className="text-zinc-600 font-bold relative z-10">{(Math.random() * 50).toFixed(2)}K</span>
                             </div>
                          ))}
                       </div>
                       <div className="bg-white/5 my-2 py-3 px-6 flex justify-between items-center border-y border-white/10 backdrop-blur-md">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Spread</span>
                          <span className="text-xl font-black text-white tracking-tighter">{formatPrice(selectedChartCoin?.current_price || 0)}</span>
                          <span className="text-[10px] font-mono text-zinc-500">0.02%</span>
                       </div>
                       <div className="h-1/2 overflow-hidden flex flex-col px-2 gap-0.5">
                          {[...Array(12)].map((_, i) => (
                             <div key={`bid-${i}`} className="flex justify-between px-3 py-1.5 relative hover:bg-success/10 cursor-pointer rounded-md transition-all group/order">
                                <div className="absolute right-0 top-0 bottom-0 bg-success/5 rounded-md transition-all group-hover/order:bg-success/10" style={{ width: `${Math.random() * 80}%` }}></div>
                                <span className="text-success font-bold relative z-10">{(selectedChartCoin?.current_price - (i * 0.5)).toFixed(2)}</span>
                                <span className="text-zinc-400 font-medium relative z-10">{(Math.random() * 2).toFixed(4)}</span>
                                <span className="text-zinc-600 font-bold relative z-10">{(Math.random() * 50).toFixed(2)}K</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </Card>
              </WidgetErrorBoundary>
           </div>
        </div>

        {/* BOTTOM ROW: MARKET TABLE & ACTIVITY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12 xl:col-span-8">
            <WidgetErrorBoundary>
              <Card className="p-0 overflow-hidden shadow-2xl" glass>
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-bold">Protocol Market Depth</h2>
                  <div className="relative w-full md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
                    <input 
                      type="text" 
                      placeholder="Filter all assets..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-white/5 text-zinc-500 text-[10px] uppercase tracking-wider font-bold sticky top-0 z-20 backdrop-blur-md">
                      <tr>
                        <th className="px-8 py-4">Asset</th>
                        <th className="px-8 py-4">Price ({currency.code})</th>
                        <th className="px-8 py-4">24h Volatility</th>
                        <th className="px-8 py-4">Market Cap</th>
                        <th className="px-8 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {filteredMarketData.map((coin) => (
                        <tr key={coin.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedChartCoin(coin)}>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shadow-lg" />
                              <div>
                                <span className="font-black text-white block tracking-tighter">{coin.symbol.toUpperCase()}</span>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase">{coin.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 font-bold text-white">{formatPrice(coin.current_price)}</td>
                          <td className={cn("px-8 py-4 font-bold", coin.price_change_percentage_24h < 0 ? "text-error" : "text-success")}>
                            {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                          </td>
                          <td className="px-8 py-4 text-zinc-500">{currency.symbol}{(coin.market_cap * currency.rate / 1000000000).toFixed(2)}B</td>
                          <td className="px-8 py-4 text-right">
                            <Button variant="secondary" size="sm" className="py-1 px-4 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border-zinc-800">Execute</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </WidgetErrorBoundary>
          </div>

          <div className="md:col-span-12 xl:col-span-4 space-y-6">
             <Card className="h-[600px] flex flex-col p-0 overflow-hidden shadow-2xl" glass>
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                   <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Recent Executions</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] custom-scrollbar">
                   {[...Array(15)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/10 transition-all">
                         <div className="flex items-center gap-3">
                            <div className={cn("w-1.5 h-1.5 rounded-full", i % 3 === 0 ? "bg-error animate-pulse" : "bg-success")}></div>
                            <div>
                               <span className={cn("font-black", i % 3 === 0 ? "text-error" : "text-success")}>{i % 3 === 0 ? 'SELL' : 'BUY'}</span>
                               <span className="text-zinc-500 ml-2 font-bold uppercase tracking-tight">BTC/USD</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-white font-black">0.0242 BTC</p>
                            <p className="text-zinc-600 font-bold">12:42:{10 + i}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      </div>
      
      {/* Modals & Overlays */}
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
