import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useLivePrices } from '../hooks/useLivePrices';
import { useMarketData } from '../hooks/useMarketData';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const TradingTerminal = () => {
  const { marketData, loading: marketLoading } = useMarketData();
  const { prices, loading: pricesLoading } = useLivePrices();
  const { formatPrice } = useCurrency();
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const loading = marketLoading || pricesLoading;

  // Set default asset
  useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedAsset) {
      setSelectedAsset(marketData[0]);
    }
  }, [marketData, selectedAsset]);

  const filteredAssets = marketData?.filter(asset => 
    asset.name.toLowerCase().includes(assetSearch.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(assetSearch.toLowerCase())
  );

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
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        
        {/* Terminal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl shadow-inner">Market Data Node</div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Feed: Live</span>
                 </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Global <span className="text-primary italic">Market</span> Registry</h1>
           </div>

           <div className="relative w-full md:w-96 group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                placeholder="SEARCH ASSET CLASS..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all shadow-2xl"
              />
           </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence mode="popLayout">
              {filteredAssets?.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Card 
                    className={cn(
                      "group p-8 citadel-card border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/20 transition-all relative overflow-hidden cursor-pointer",
                      selectedAsset?.id === asset.id && "border-primary/40 bg-primary/5"
                    )}
                    glass
                    onClick={() => setSelectedAsset(asset)}
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                     </div>

                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 border border-white/10 p-2.5 shadow-2xl group-hover:scale-110 transition-transform">
                           <img src={asset.image} alt={asset.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-white tracking-tighter uppercase leading-none">{asset.symbol}<span className="text-zinc-700 ml-0.5">/USDT</span></h3>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2">{asset.name}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest block">Live Exchange Price</span>
                              <span className="text-2xl font-black text-white tracking-tighter font-mono">{formatPrice(asset.current_price)}</span>
                           </div>
                           <div className={cn(
                             "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mb-1",
                             asset.price_change_percentage_24h >= 0 ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                           )}>
                              {asset.price_change_percentage_24h > 0 ? '+' : ''}{asset.price_change_percentage_24h?.toFixed(2)}%
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                           <div>
                              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Market Cap</span>
                              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-tight">{formatPrice(asset.market_cap / 1e9)}B</span>
                           </div>
                           <div className="text-right">
                              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Volume 24H</span>
                              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-tight">{formatPrice(asset.total_volume / 1e6)}M</span>
                           </div>
                        </div>
                     </div>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {filteredAssets?.length === 0 && (
          <div className="py-32 text-center space-y-4">
             <span className="material-symbols-outlined text-zinc-800 text-6xl">search_off</span>
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">No Asset Matching Protocol Query</p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TradingTerminal;
