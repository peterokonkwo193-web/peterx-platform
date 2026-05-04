import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getTransactions, updateProfileBalance, createTransaction, updatePortfolio } from '../lib/db';
import { useMarketData } from '../hooks/useMarketData';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const STATIC_COINS = [
  { symbol: 'USD', name: 'US Dollar', type: 'fiat', image: 'https://cdn-icons-png.flaticon.com/512/197/197374.png', color: 'from-blue-500/20' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', color: 'from-orange-500/20' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: 'from-indigo-500/20' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', color: 'from-teal-500/20' },
  { symbol: 'USDT', name: 'Tether', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/325/small/tether.png', color: 'from-success/20' },
  { symbol: 'PI', name: 'Pi Network', type: 'crypto', image: 'https://minepi.com/wp-content/uploads/2021/11/logo-pi-600.png', color: 'from-primary/20' }
];

const NETWORKS = {
  'USD': ['Bank Transfer (ACH)', 'Wire Transfer', 'Instant Card'],
  'BTC': ['Bitcoin (BTC)', 'Lightning Network', 'BNB Smart Chain (BEP20)', 'Ethereum (ERC20)'],
  'ETH': ['Ethereum (ERC20)', 'Arbitrum One', 'Optimism', 'Polygon', 'BNB Smart Chain (BEP20)', 'Base'],
  'SOL': ['Solana (SOL)', 'BNB Smart Chain (BEP20)'],
  'USDT': ['Tron (TRC20)', 'Ethereum (ERC20)', 'BNB Smart Chain (BEP20)', 'Polygon', 'Solana', 'Arbitrum One', 'Optimism', 'Avalanche C-Chain'],
  'USDC': ['Ethereum (ERC20)', 'Solana', 'Polygon', 'Arbitrum One', 'Optimism', 'Base', 'Tron (TRC20)', 'BNB Smart Chain (BEP20)'],
  'PI': ['Pi Network Mainnet', 'BNB Smart Chain (BEP20)']
};

const getNetworkForCoin = (symbol) => {
  if (NETWORKS[symbol]) return NETWORKS[symbol];
  return [
    `${symbol} Mainnet`, 
    'BNB Smart Chain (BEP20)', 
    'Ethereum (ERC20)',
    'Tron (TRC20)',
    'Polygon',
    'Solana',
    'Arbitrum One'
  ];
};

const Wallet = () => {
  const { user, profile, portfolio, loading: dataLoading, error: supabaseError } = useSupabaseData();
  const { marketData } = useMarketData();
  const { currency, formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Verification, 3: Success

  // Build dynamic coins list
  const dynamicCoins = React.useMemo(() => {
    const marketCoins = (marketData || []).map(c => ({
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      type: 'crypto',
      image: c.image,
      color: 'from-primary/10'
    }));
    
    const allCoins = [...STATIC_COINS];
    marketCoins.forEach(mc => {
      if (!allCoins.find(c => c.symbol === mc.symbol)) {
        allCoins.push(mc);
      }
    });
    return allCoins;
  }, [marketData]);

  // Modal States
  const [actionModal, setActionModal] = useState(null); // 'Deposit' | 'Withdraw' | null
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      getTransactions(user.id).then(setTransactions);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setSelectedNetwork(getNetworkForCoin(selectedCoin)[0]);
    setAmount('');
    setAddress('');
    setStep(1);
  }, [selectedCoin, actionModal]);

  const handleAction = async () => {
    if (!user) return;
    
    if (step === 1) {
       if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount");
       if ((actionModal === 'Withdraw' || actionModal === 'Transfer') && !address) return alert("Please enter destination address or ID");
       setStep(2);
       return;
    }

    setProcessing(true);
    const numAmount = parseFloat(amount || 0);

    try {
      if (actionModal === 'Withdraw' || actionModal === 'Transfer') {
        if (selectedCoin === 'USD') {
          if (parseFloat(profile?.usd_balance || 0) < numAmount) throw new Error('Insufficient USD balance');
          await updateProfileBalance(user.id, parseFloat(profile.usd_balance) - numAmount);
        } else {
          const asset = portfolio.find(p => p.symbol === selectedCoin);
          const currentAssetAmount = asset ? parseFloat(asset.amount) : 0;
          if (currentAssetAmount < numAmount) throw new Error(`Insufficient ${selectedCoin} balance`);
          await updatePortfolio(user.id, selectedCoin, currentAssetAmount - numAmount, asset?.average_price || 0);
        }
      } else if (actionModal === 'Deposit') {
        const depositAmt = numAmount;
        if (selectedCoin === 'USD') {
          await updateProfileBalance(user.id, parseFloat(profile?.usd_balance || 0) + depositAmt);
        } else {
          const asset = portfolio.find(p => p.symbol === selectedCoin);
          const currentAssetAmount = asset ? parseFloat(asset.amount) : 0;
          await updatePortfolio(user.id, selectedCoin, currentAssetAmount + depositAmt, asset?.average_price || 0);
        }
      }

      await createTransaction({
        user_id: user.id,
        asset: selectedCoin,
        type: actionModal,
        amount: numAmount,
        value: 0,
        status: 'Completed'
      });

      const updatedTx = await getTransactions(user.id);
      setTransactions(updatedTx);
      setStep(3);
    } catch (error) {
      alert(error.message);
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  if (dataLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
             <div className="w-24 h-24 border-8 border-primary/10 rounded-full"></div>
             <div className="absolute inset-0 w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(252,213,53,0.3)]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-16 relative max-w-7xl mx-auto pb-20">
        
        {/* TOP TICKER: THE ALIVE FEELING */}
        <div className="flex bg-zinc-950 border-y border-white/5 h-10 items-center overflow-hidden -mx-12 mb-10">
           <div className="flex gap-12 animate-marquee whitespace-nowrap px-12 items-center">
              {[...Array(5)].map((_, i) => (
                 <React.Fragment key={i}>
                    <div className="flex items-center gap-3">
                       <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Protocol Sync: 0.{Math.floor(Math.random() * 999)}ms</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">BTC/USDT: $64,242.10</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest">Live Node: HK-42</span>
                    </div>
                 </React.Fragment>
              ))}
           </div>
        </div>

        {/* HERO SECTION: THE BOLD BALANCE */}
        <header className="relative py-28 px-16 rounded-[60px] bg-zinc-950 border border-white/10 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)]">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[180px] -z-10 animate-pulse transition-all duration-[3000ms]"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success/10 blur-[120px] -z-10"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <div className="flex items-center gap-5">
                    <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Tier 4 Institutional</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-success rounded-full animate-ping"></span>
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Secure Ledger Connected</span>
                    </div>
                 </div>
                 <div>
                    <h1 className="text-[120px] font-black text-white tracking-tighter leading-none mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                       {formatPrice((profile?.usd_balance || 0) * currency.rate).split('.')[0]}
                       <span className="text-5xl text-zinc-700 ml-1">.{formatPrice((profile?.usd_balance || 0) * currency.rate).split('.')[1] || '00'}</span>
                    </h1>
                    <div className="flex items-center gap-8">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Portfolio Velocity</span>
                          <span className="text-xl font-black text-success tracking-tighter">+18.42% (24H)</span>
                       </div>
                       <div className="w-px h-10 bg-white/10"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Reserve Currency</span>
                          <span className="text-xl font-black text-white tracking-tighter">{currency.code} Quantum</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                 <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setActionModal('Deposit')} 
                    className="group cursor-pointer p-10 rounded-[48px] bg-white/[0.03] border border-white/5 hover:border-success/60 hover:bg-success/[0.08] transition-all duration-700 shadow-3xl flex flex-col items-center text-center relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-3xl bg-success text-black flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_20px_50px_rgba(14,203,129,0.4)] relative z-10">
                       <span className="material-symbols-outlined text-4xl font-black">south_west</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] relative z-10">Deposit</h3>
                    <p className="text-[10px] text-zinc-500 font-black mt-3 uppercase tracking-widest relative z-10">Asset Ingress</p>
                 </motion.div>

                 <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setActionModal('Transfer')} 
                    className="group cursor-pointer p-10 rounded-[48px] bg-white/[0.03] border border-white/5 hover:border-primary/60 hover:bg-primary/[0.08] transition-all duration-700 shadow-3xl flex flex-col items-center text-center relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-3xl bg-primary text-black flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_20px_50px_rgba(252,213,53,0.4)] relative z-10">
                       <span className="material-symbols-outlined text-4xl font-black">sync_alt</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] relative z-10">Transfer</h3>
                    <p className="text-[10px] text-zinc-500 font-black mt-3 uppercase tracking-widest relative z-10">Internal Protocol</p>
                 </motion.div>

                 <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setActionModal('Withdraw')} 
                    className="group cursor-pointer p-10 rounded-[48px] bg-white/[0.03] border border-white/5 hover:border-error/60 hover:bg-error/[0.08] transition-all duration-700 shadow-3xl flex flex-col items-center text-center relative overflow-hidden lg:col-span-1 md:col-span-2"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-error/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-3xl bg-white/10 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-white/20 relative z-10">
                       <span className="material-symbols-outlined text-4xl font-black">north_east</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] relative z-10">Withdraw</h3>
                    <p className="text-[10px] text-zinc-500 font-black mt-3 uppercase tracking-widest relative z-10">Asset Egress</p>
                 </motion.div>
              </div>
           </div>
        </header>

        {/* ASSET MATRIX: THE CATCHY LIST */}
        <div className="space-y-8">
           <div className="flex justify-between items-end px-6">
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Protocol Holdings</h2>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Cross-Chain Managed Assets</p>
              </div>
              <div className="flex gap-4">
                 <div className="h-10 px-6 bg-zinc-900 border border-white/5 rounded-full flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">All Nodes Synced</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {/* PRIMARY ASSET: USDT */}
              <Card className="p-8 border-success/20 bg-success/5 relative group overflow-hidden" glass glow>
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                 <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center text-white shadow-lg">
                       <span className="material-symbols-outlined text-2xl font-black">payments</span>
                    </div>
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Stablecoin</span>
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Available</h3>
                    <p className="text-4xl font-black text-white tracking-tighter mb-4">{(profile?.usd_balance || 0).toLocaleString()}<span className="text-lg ml-1">USDT</span></p>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[85%] bg-success rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>
                 </div>
              </Card>

              {portfolio.map((asset) => {
                 const coin = dynamicCoins.find(c => c.symbol === asset.symbol);
                 return (
                    <Card key={asset.id} className={cn("p-8 border-white/5 hover:border-white/20 transition-all group relative overflow-hidden")} glass>
                       <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity -z-10", coin?.color || 'from-primary/5')}></div>
                       <div className="flex justify-between items-start mb-10 relative z-10">
                          <img src={coin?.image} alt={asset.symbol} className="w-12 h-12 rounded-2xl shadow-xl border border-white/10 p-1 bg-zinc-950" />
                          <div className="text-right">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{asset.symbol} Index</span>
                             <span className="text-xs font-black text-primary">Active</span>
                          </div>
                       </div>
                       <div className="relative z-10">
                          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Institutional Quantum</h3>
                          <p className="text-4xl font-black text-white tracking-tighter mb-4">{parseFloat(asset.amount).toFixed(4)}</p>
                          <div className="flex gap-2">
                             <button onClick={() => { setSelectedCoin(asset.symbol); setActionModal('Withdraw'); }} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all">Withdraw</button>
                             <button onClick={() => { setSelectedCoin(asset.symbol); setActionModal('Deposit'); }} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm font-black">add</span>
                             </button>
                          </div>
                       </div>
                    </Card>
                 );
              })}

              {/* EMPTY SLOT ADD BUTTON */}
              <div className="group cursor-pointer border-2 border-dashed border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all hover:bg-primary/5 min-h-[250px]">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                    <span className="material-symbols-outlined text-2xl font-black">add</span>
                 </div>
                 <h3 className="text-sm font-black text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">Integrate New Asset</h3>
                 <p className="text-[9px] text-zinc-700 font-bold mt-1 uppercase">10,000+ Protocols Available</p>
              </div>
           </div>
        </div>

        {/* TRANSACTION LEDGER: THE CATCHY TABLE */}
        <Card className="p-0 overflow-hidden shadow-2xl border-white/5" glass>
           <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-xl">history</span>
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase">Audit Ledger</h2>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Immutable Protocol History</p>
                 </div>
              </div>
              <Button variant="outline" className="px-8 py-3 text-[10px] font-black border-zinc-800">Export Certificate</Button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-zinc-950 font-black text-[10px] text-zinc-600 uppercase tracking-[0.3em] border-b border-white/5">
                    <tr>
                       <th className="px-10 py-6">Protocol Type</th>
                       <th className="px-10 py-6">Asset Quantum</th>
                       <th className="px-10 py-6">Status Index</th>
                       <th className="px-10 py-6 text-right">Verification Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {transactions.map((tx) => (
                       <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-6 flex items-center gap-4">
                             <span className={cn(
                                "material-symbols-outlined text-sm p-2 rounded-xl border shadow-inner",
                                tx.type === 'Deposit' ? "bg-success/10 text-success border-success/20" : 
                                tx.type === 'Transfer' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                                "bg-error/10 text-error border-error/20"
                             )}>
                                {tx.type === 'Deposit' ? 'south_west' : tx.type === 'Transfer' ? 'swap_horiz' : 'north_east'}
                             </span>
                             <span className="font-black text-zinc-300 uppercase tracking-widest">{tx.type} Execution</span>
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-2">
                                <span className="font-black text-white text-base">{parseFloat(tx.amount).toFixed(4)}</span>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{tx.asset}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <span className="px-4 py-1.5 rounded-full bg-success/10 text-success text-[9px] font-black uppercase tracking-widest border border-success/20">
                                {tx.status} Verified
                             </span>
                          </td>
                          <td className="px-10 py-6 text-right text-zinc-600 font-bold">
                             {new Date(tx.created_at).toLocaleString()}
                          </td>
                       </tr>
                    ))}
                    {transactions.length === 0 && (
                       <tr><td colSpan="4" className="py-24 text-center text-zinc-800 italic font-black uppercase tracking-[0.5em] text-[10px]">No Protocol Audit Logs Found</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>

        {/* Action Modal - Binance/Bybit Style */}
        <AnimatePresence>
           {actionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setActionModal(null)}
                 />
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#1e2329] rounded-2xl shadow-2xl overflow-hidden text-zinc-100 font-sans"
                 >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#181a20]">
                       <h2 className="text-xl font-medium">
                          {actionModal === 'Deposit' && 'Deposit Crypto'}
                          {actionModal === 'Withdraw' && 'Withdraw Crypto'}
                          {actionModal === 'Transfer' && 'Internal Transfer'}
                       </h2>
                       <button onClick={() => setActionModal(null)} className="text-zinc-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-xl">close</span>
                       </button>
                    </div>

                    <div className="p-6">
                       {step === 1 && (
                          <div className="space-y-6">
                             {/* 1. Select Coin */}
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">1. Select Coin</label>
                                <div className="relative">
                                   <select 
                                      value={selectedCoin} 
                                      onChange={(e) => setSelectedCoin(e.target.value)}
                                      className="w-full bg-[#2b3139] border border-transparent rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#FCD535] hover:bg-[#323942] transition-colors"
                                   >
                                      {dynamicCoins.map(c => (
                                         <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                                      ))}
                                   </select>
                                   <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_more</span>
                                </div>
                             </div>

                             {/* 2. Withdraw/Transfer Target Input */}
                             {(actionModal === 'Withdraw' || actionModal === 'Transfer') && (
                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-zinc-400">
                                      {actionModal === 'Withdraw' ? '2. Send to' : '2. Recipient UID / Email'}
                                   </label>
                                   <input 
                                      type="text"
                                      value={address}
                                      onChange={(e) => setAddress(e.target.value)}
                                      placeholder={actionModal === 'Withdraw' ? "Enter withdrawal address" : "Enter Equity Citadel Associates Pay ID"}
                                      className="w-full bg-[#2b3139] border border-transparent rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FCD535] hover:bg-[#323942] transition-colors"
                                   />
                                </div>
                             )}

                             {/* 2/3. Select Network (Deposit/Withdraw only) */}
                             {actionModal !== 'Transfer' && (
                                <div className="space-y-2">
                                   <label className="text-sm font-medium text-zinc-400">
                                      {actionModal === 'Deposit' ? '2. Deposit Network' : '3. Select Network'}
                                   </label>
                                   <div className="relative">
                                      <select 
                                         value={selectedNetwork} 
                                         onChange={(e) => setSelectedNetwork(e.target.value)}
                                         className="w-full bg-[#2b3139] border border-transparent rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#FCD535] hover:bg-[#323942] transition-colors"
                                      >
                                         {getNetworkForCoin(selectedCoin).map(net => (
                                            <option key={net} value={net}>{net}</option>
                                         ))}
                                      </select>
                                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_more</span>
                                   </div>
                                   {actionModal === 'Withdraw' && (
                                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                         <span>Network Fee: ~0.00 {selectedCoin}</span>
                                         <span>Arrival Time: ~5 mins</span>
                                      </div>
                                   )}
                                </div>
                             )}

                             {/* DEPOSIT ADDRESS & QR (Deposit Only) */}
                             {actionModal === 'Deposit' && (
                                <div className="pt-4 border-t border-white/5 space-y-4">
                                   <label className="text-sm font-medium text-zinc-400">3. Deposit Address</label>
                                   <div className="flex flex-col items-center gap-6">
                                      <div className="bg-white p-2 rounded-xl shadow-sm">
                                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user?.id}`} alt="QR Code" className="w-32 h-32" />
                                      </div>
                                      <div className="w-full space-y-2">
                                         <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                            <span>Address</span>
                                         </div>
                                         <div className="w-full bg-[#2b3139] rounded-lg px-4 py-3 flex items-center justify-between">
                                            <span className="text-sm text-zinc-300 truncate font-mono select-all pr-4">{user?.id}</span>
                                            <button 
                                               onClick={() => { navigator.clipboard.writeText(user?.id); alert('Address copied'); }}
                                               className="text-[#FCD535] hover:text-[#FCD535]/80 transition-colors shrink-0"
                                            >
                                               <span className="material-symbols-outlined text-sm">content_copy</span>
                                            </button>
                                         </div>
                                         <p className="text-xs text-zinc-500 flex items-start gap-2 bg-yellow-500/10 p-3 rounded-lg text-yellow-600/90">
                                            <span className="material-symbols-outlined text-sm shrink-0">info</span>
                                            Send only {selectedCoin} to this deposit address. Sending coin or token other than {selectedCoin} to this address may result in the loss of your deposit.
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             )}

                             {/* 3/4. Amount Input (Withdraw/Transfer only) */}
                             {(actionModal === 'Withdraw' || actionModal === 'Transfer') && (
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                   <div className="flex justify-between items-end">
                                      <label className="text-sm font-medium text-zinc-400">
                                         {actionModal === 'Withdraw' ? '4. Withdrawal Amount' : '3. Transfer Amount'}
                                      </label>
                                      <span className="text-xs text-zinc-500">Available: {parseFloat(profile?.usd_balance || 0).toLocaleString()} {selectedCoin}</span>
                                   </div>
                                   <div className="relative">
                                      <input 
                                         type="number"
                                         value={amount}
                                         onChange={(e) => setAmount(e.target.value)}
                                         placeholder="0.00"
                                         className="w-full bg-[#2b3139] border border-transparent rounded-lg pl-4 pr-20 py-3 text-white focus:outline-none focus:border-[#FCD535] hover:bg-[#323942] transition-colors"
                                      />
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                         <span className="text-sm font-medium text-zinc-400">{selectedCoin}</span>
                                         <button onClick={() => setAmount(profile?.usd_balance)} className="text-[#FCD535] text-xs font-medium hover:text-[#FCD535]/80">Max</button>
                                      </div>
                                   </div>
                                </div>
                             )}

                             {/* Actions */}
                             {(actionModal === 'Withdraw' || actionModal === 'Transfer') && (
                                <button 
                                   onClick={handleAction} 
                                   className="w-full bg-[#FCD535] text-black font-medium py-3 rounded-lg hover:bg-[#FCD535]/90 transition-colors disabled:opacity-50 mt-4"
                                >
                                   {actionModal === 'Withdraw' ? 'Withdraw' : 'Transfer'}
                                </button>
                             )}
                          </div>
                       )}

                       {/* Security Verification Step */}
                       {step === 2 && (
                          <div className="space-y-8 py-6">
                             <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-[#FCD535]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FCD535]">
                                   <span className="material-symbols-outlined text-3xl">verified_user</span>
                                </div>
                                <h3 className="text-xl font-medium">Security Verification</h3>
                                <p className="text-sm text-zinc-400">Please confirm this transaction to proceed.</p>
                             </div>
                             
                             <div className="bg-[#2b3139] p-4 rounded-lg space-y-3 text-sm">
                                <div className="flex justify-between">
                                   <span className="text-zinc-500">Amount</span>
                                   <span className="font-medium">{amount} {selectedCoin}</span>
                                </div>
                                <div className="flex justify-between">
                                   <span className="text-zinc-500">To</span>
                                   <span className="font-medium truncate ml-8">{address}</span>
                                </div>
                             </div>

                             <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 bg-[#2b3139] text-white py-3 rounded-lg font-medium hover:bg-[#323942] transition-colors">Cancel</button>
                                <button onClick={handleAction} disabled={processing} className="flex-1 bg-[#FCD535] text-black py-3 rounded-lg font-medium hover:bg-[#FCD535]/90 transition-colors flex justify-center items-center gap-2">
                                   {processing ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : 'Confirm'}
                                </button>
                             </div>
                          </div>
                       )}

                       {/* Success Step */}
                       {step === 3 && (
                          <div className="space-y-6 text-center py-8">
                             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                             </div>
                             <div className="space-y-2">
                                <h3 className="text-2xl font-medium">Request Submitted</h3>
                                <p className="text-sm text-zinc-400 max-w-[250px] mx-auto">Your {actionModal.toLowerCase()} request has been successfully submitted and is processing.</p>
                             </div>
                             <div className="pt-4">
                                <button onClick={() => setActionModal(null)} className="w-full bg-[#2b3139] text-white font-medium py-3 rounded-lg hover:bg-[#323942] transition-colors">Complete</button>
                             </div>
                          </div>
                       )}
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;
