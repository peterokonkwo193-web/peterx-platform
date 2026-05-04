import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getMarketData } from '../lib/prices';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const Markets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, formatPrice } = useCurrency();

  useEffect(() => {
    const fetchMarkets = async () => {
      const data = await getMarketData();
      setMarkets(data);
      setLoading(false);
    };
    fetchMarkets();
    const timer = setInterval(fetchMarkets, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(252,213,53,0.5)]"></span>
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Live Protocol Feed</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Global Asset Indices</h1>
            <p className="text-sm text-zinc-500 font-medium">Real-time data powered by institutional-grade liquidity providers.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 flex flex-col items-end">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Base Currency</span>
                <span className="text-sm font-bold text-primary">{currency.name}</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {markets.slice(0, 3).map((coin) => {
            const priceChange = coin.price_change_percentage_24h || 0;
            const currentPrice = (coin.current_price || 0) * currency.rate;
            return (
              <Card key={coin.id} className="p-8 relative overflow-hidden group shadow-2xl" glass glow>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 p-2 shadow-inner">
                      <img src={coin.image} alt={coin.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight">{coin.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{coin.symbol} Protocol</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-black font-mono shadow-sm",
                    priceChange < 0 ? 'bg-error/20 text-error' : 'bg-success/20 text-success'
                  )}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Mark Price</span>
                   <p className="text-3xl font-black text-white tracking-tighter font-mono">{formatPrice(coin.current_price)}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="overflow-hidden shadow-2xl border border-white/5" glass>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 font-black text-[10px] text-zinc-500 uppercase tracking-[0.3em] sticky top-0 z-10 backdrop-blur-md border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">Asset Index</th>
                  <th className="px-8 py-5">Market Value</th>
                  <th className="px-8 py-5 text-center">24h Performance</th>
                  <th className="px-8 py-5">Market Capitalization</th>
                  <th className="px-8 py-5 text-right">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {markets.map((coin) => {
                  const priceChange = coin.price_change_percentage_24h || 0;
                  const marketCap = (coin.market_cap || 0) * currency.rate;
                  return (
                    <tr key={coin.id} className="hover:bg-white/10 transition-all group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shadow-lg" />
                          <div>
                            <span className="font-black text-white block tracking-tighter text-sm">{coin.symbol.toUpperCase()}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase">{coin.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-white text-sm">{formatPrice(coin.current_price)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg font-black text-[10px]",
                          priceChange < 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                        )}>
                          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-8 py-5 text-zinc-500 font-bold">
                        {currency.symbol}{(marketCap / 1e9).toFixed(2)}B
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="secondary" size="sm" className="py-1.5 px-6 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all border-zinc-800 hover:bg-primary hover:text-black hover:border-primary shadow-xl">
                          Trade
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Markets;
