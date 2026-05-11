import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CandlestickChart from '../components/CandlestickChart';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useLivePrices } from '../hooks/useLivePrices';
import { useMarketData } from '../hooks/useMarketData';
import { useCurrency } from '../context/CurrencyContext';
import { openFuturesPosition, closeFuturesPosition, updateProfileBalance } from '../lib/db';
import { cn } from '../utils/cn';

const TradingTerminal = () => {
  const { user, profile, futuresPositions, loading: dataLoading } = useSupabaseData();
  const { prices, loading: pricesLoading } = useLivePrices();
  const { marketData, loading: marketLoading } = useMarketData();
  const { currency, formatPrice } = useCurrency();
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradingMode, setTradingMode] = useState('spot'); // 'spot' or 'futures'
  const [tradeType, setTradeType] = useState('buy'); // buy/long, sell/short
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState('');
  const [executing, setExecuting] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [assetSearch, setAssetSearch] = useState('');

  const loading = dataLoading || pricesLoading || marketLoading;

  // Set default asset
  useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedAsset) {
      const btc = marketData.find(c => c.symbol.toLowerCase() === 'btc') || marketData[0];
      setSelectedAsset(btc);
    }
  }, [marketData, selectedAsset]);

  // Generate Mock Chart Data
  useEffect(() => {
    if (selectedAsset) {
      const basePrice = selectedAsset.current_price;
      const data = [];
      let time = Math.floor(Date.now() / 1000) - (50 * 60);

      for (let i = 0; i < 50; i++) {
        const open = basePrice + (Math.random() * (basePrice * 0.01) - (basePrice * 0.005));
        const close = open + (Math.random() * (basePrice * 0.01) - (basePrice * 0.005));
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.002);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.002);

        data.push({ time, open, high, low, close });
        time += 60;
      }
      setChartData(data);
    }
  }, [selectedAsset]);

  // Live Ticking
  useEffect(() => {
    if (chartData.length === 0) return;
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const last = { ...newData[newData.length - 1] };
        const change = last.close * (Math.random() * 0.001 - 0.0005);
        last.close += change;
        if (last.close > last.high) last.high = last.close;
        if (last.close < last.low) last.low = last.close;
        newData[newData.length - 1] = last;
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [chartData.length]);

  const currentPrice = selectedAsset?.current_price || 0;
  
  const calculateLiquidation = () => {
    if (tradingMode !== 'futures') return 0;
    const price = currentPrice;
    if (tradeType === 'buy') { // Long
      return price * (1 - (1 / leverage) + 0.05); // 5% maintenance margin
    } else { // Short
      return price * (1 + (1 / leverage) - 0.05);
    }
  };

  const liqPrice = calculateLiquidation();

  const handleTrade = async () => {
    if (!user || !amount || !selectedAsset) return;
    setExecuting(true);
    
    try {
      const numAmount = parseFloat(amount);
      const entryPriceUsd = selectedAsset.current_price;
      const totalPositionValueUsd = numAmount * entryPriceUsd;
      const marginRequiredUsd = tradingMode === 'futures' ? totalPositionValueUsd / leverage : totalPositionValueUsd;
      
      const usdBalance = parseFloat(profile?.usd_balance || 0);
      if (marginRequiredUsd > usdBalance) throw new Error('Insufficient Account Balance');

      if (tradingMode === 'futures') {
        const liqPriceUsd = tradeType === 'buy' 
          ? entryPriceUsd * (1 - (1 / leverage) + 0.05)
          : entryPriceUsd * (1 + (1 / leverage) - 0.05);

        await openFuturesPosition({
          user_id: user.id,
          symbol: selectedAsset.symbol.toUpperCase(),
          type: tradeType === 'buy' ? 'Long' : 'Short',
          leverage: leverage,
          entry_price: entryPriceUsd,
          amount: numAmount,
          margin: marginRequiredUsd,
          liquidation_price: liqPriceUsd
        });

        await updateProfileBalance(user.id, usdBalance - marginRequiredUsd);
        alert(`Professional ${leverage}x ${tradeType === 'buy' ? 'Long' : 'Short'} opened successfully.`);
      } else {
        // Spot Logic (simplified for this update)
        alert('Spot execution active.');
      }
      setAmount('');
    } catch (error) {
      alert('Execution Error: ' + error.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
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
      <div className="flex flex-col h-[calc(100vh-100px)] -mt-6">
        {/* Terminal Header */}
        <header className="h-auto md:h-16 py-4 md:py-0 px-4 md:px-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between bg-zinc-950/80 backdrop-blur-xl md:-mx-12 z-20 gap-4 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <img src={selectedAsset?.image} className="w-6 h-6 rounded-full" alt="" />
              <h2 className="text-sm md:text-lg font-black text-white tracking-tighter uppercase">{selectedAsset?.symbol}/USDT</h2>
            </div>
            <div className="flex gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-l border-white/10 pl-4 md:pl-8">
               <button onClick={() => setTradingMode('spot')} className={cn("pb-1 border-b-2 transition-all", tradingMode === 'spot' ? "border-primary text-primary" : "border-transparent text-zinc-500")}>Spot</button>
               <button onClick={() => setTradingMode('futures')} className={cn("pb-1 border-b-2 transition-all", tradingMode === 'futures' ? "border-primary text-primary" : "border-transparent text-zinc-500")}>Futures</button>
            </div>
          </div>
          <div className="flex justify-between w-full md:w-auto gap-6 md:gap-10 items-center">
             <div className="text-right">
                <span className="text-[8px] md:text-[9px] text-zinc-600 font-black uppercase block">Mark Price</span>
                <span className={cn("text-sm md:text-lg font-black font-mono", selectedAsset?.price_change_percentage_24h >= 0 ? "text-success" : "text-error")}>
                  {formatPrice(currentPrice)}
                </span>
             </div>
             <div className="text-right border-l border-white/10 pl-6 md:pl-10">
                <span className="text-[8px] md:text-[9px] text-zinc-600 font-black uppercase block">24h Change</span>
                <span className={cn("text-xs md:text-sm font-black font-mono", selectedAsset?.price_change_percentage_24h >= 0 ? "text-success" : "text-error")}>
                  {selectedAsset?.price_change_percentage_24h?.toFixed(2)}%
                </span>
             </div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-12 -mx-12 overflow-hidden">
          {/* Order Book */}
          <section className="col-span-12 lg:col-span-2 border-r border-white/5 bg-zinc-950/30 flex flex-col p-4 overflow-hidden">
             <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Live Order Book</h3>
             <div className="flex-1 font-mono text-[9px] space-y-0.5">
                <div className="text-error opacity-60 flex flex-col-reverse">
                   {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex justify-between py-1 px-1 hover:bg-error/5 transition-colors">
                        <span>{(currentPrice + (i * 0.2)).toFixed(2)}</span>
                        <span className="text-zinc-500">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                   ))}
                </div>
                <div className="py-4 text-center border-y border-white/5 my-2">
                   <span className="text-base font-black text-white">{formatPrice(currentPrice)}</span>
                </div>
                <div className="text-success opacity-60">
                   {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex justify-between py-1 px-1 hover:bg-success/5 transition-colors">
                        <span>{(currentPrice - (i * 0.2)).toFixed(2)}</span>
                        <span className="text-zinc-500">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Chart & Positions */}
          <section className="col-span-12 lg:col-span-7 flex flex-col bg-background">
             <div className="flex-1 p-4 relative">
                <Card className="w-full h-full p-0 overflow-hidden border border-white/5 shadow-2xl" glass>
                   <CandlestickChart data={chartData} />
                </Card>
             </div>
             {/* Positions Panel */}
             <div className="h-64 border-t border-white/5 bg-zinc-950/50 p-6 overflow-hidden flex flex-col">
                <div className="flex gap-6 border-b border-white/10 mb-4 pb-2">
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-widest border-b-2 border-primary pb-2">Open Positions ({futuresPositions?.length || 0})</h3>
                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pb-2">Order History</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                   <table className="w-full text-left text-[11px] font-mono">
                      <thead className="text-zinc-600 font-black uppercase tracking-widest sticky top-0 bg-zinc-950 z-10">
                         <tr>
                            <th className="pb-3">Market</th>
                            <th className="pb-3 text-center">Type</th>
                            <th className="pb-3 text-center">Leverage</th>
                            <th className="pb-3 text-right">Entry</th>
                            <th className="pb-3 text-right">Mark</th>
                            <th className="pb-3 text-right">Liq. Price</th>
                            <th className="pb-3 text-right">Unrealized PNL</th>
                            <th className="pb-3 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody>
                         {futuresPositions?.map(pos => {
                            const pnlUsd = pos.type === 'Long' 
                              ? (selectedAsset?.current_price - pos.entry_price) * pos.amount * pos.leverage
                              : (pos.entry_price - selectedAsset?.current_price) * pos.amount * pos.leverage;
                            const pnlPercent = (pnlUsd / pos.margin) * 100;
                            
                            return (
                               <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                  <td className="py-4 font-black text-white">{pos.symbol}</td>
                                  <td className="py-4 text-center">
                                     <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", pos.type === 'Long' ? "bg-success/20 text-success" : "bg-error/20 text-error")}>{pos.type}</span>
                                  </td>
                                  <td className="py-4 text-center text-zinc-400 font-black">{pos.leverage}x</td>
                                  <td className="py-4 text-right text-zinc-300">{formatPrice(pos.entry_price)}</td>
                                  <td className="py-4 text-right text-zinc-300">{formatPrice(currentPrice)}</td>
                                  <td className="py-4 text-right text-error font-bold">{formatPrice(pos.liquidation_price)}</td>
                                  <td className={cn("py-4 text-right font-black", pnlUsd >= 0 ? "text-success" : "text-error")}>
                                     {pnlUsd >= 0 ? '+' : ''}{formatPrice(pnlUsd)} ({pnlPercent.toFixed(2)}%)
                                  </td>
                                  <td className="py-4 text-right">
                                     <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Close</button>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </section>

          {/* Trade Execution */}
          <section className="col-span-12 lg:col-span-3 border-l border-white/5 bg-zinc-950/40 p-6 space-y-6">
             <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                <button 
                  onClick={() => setTradeType('buy')}
                  className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", tradeType === 'buy' ? "bg-primary text-black" : "text-zinc-600")}
                >
                  {tradingMode === 'futures' ? 'Long' : 'Buy'}
                </button>
                <button 
                  onClick={() => setTradeType('sell')}
                  className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", tradeType === 'sell' ? "bg-error text-white" : "text-zinc-600")}
                >
                  {tradingMode === 'futures' ? 'Short' : 'Sell'}
                </button>
             </div>

             {tradingMode === 'futures' && (
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cross Leverage</span>
                     <span className="text-sm font-black text-primary font-mono">{leverage}x</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" step="1" 
                    value={leverage} 
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="grid grid-cols-5 gap-1">
                     {[1, 10, 25, 50, 100].map(l => (
                        <button key={l} onClick={() => setLeverage(l)} className="py-1 rounded bg-white/5 text-[9px] font-black text-zinc-600 hover:text-primary transition-all">{l}x</button>
                     ))}
                  </div>
               </div>
             )}

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Size Amount ({selectedAsset?.symbol})</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white outline-none focus:border-primary transition-all"
                        placeholder="0.00"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase">{selectedAsset?.symbol}</span>
                   </div>
                </div>

                {tradingMode === 'futures' && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 text-[10px] font-bold">
                     <div className="flex justify-between items-center">
                        <span className="text-zinc-600 uppercase">Est. Liquidation Price</span>
                        <span className="text-error font-mono">{formatPrice(liqPrice)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-zinc-600 uppercase">Margin Required</span>
                        <span className="text-zinc-300 font-mono">{formatPrice((parseFloat(amount || 0) * currentPrice) / leverage)}</span>
                     </div>
                  </div>
                )}

                <Button 
                  variant={tradeType === 'buy' ? 'primary' : 'outline'} 
                  className={cn("w-full py-5 text-xs font-black uppercase tracking-[0.3em] shadow-2xl", tradeType === 'sell' && "border-error text-error hover:bg-error hover:text-white")}
                  onClick={handleTrade}
                  disabled={executing || !amount}
                >
                  {executing ? 'Processing...' : `Execute ${tradeType === 'buy' ? 'Long' : 'Short'} Position`}
                </Button>
             </div>

             <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest text-center leading-relaxed">
                 Equity Citadel Platform Fee: <span className="text-zinc-400">0.01% Maker / 0.02% Taker</span>
             </div>
          </section>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default TradingTerminal;
