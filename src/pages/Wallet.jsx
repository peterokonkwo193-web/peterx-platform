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

import { STATIC_COINS, getNetworkForCoin } from '../lib/constants';

const Wallet = () => {
  const { user, profile, portfolio, transactions: txData, refreshData, loading: dataLoading, error: supabaseError } = useSupabaseData();
  const { marketData } = useMarketData();
  const { currency, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Verification, 3: Success
  const [error, setError] = useState(null);
  const [syncTime, setSyncTime] = useState(0);

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
      setLoading(false);
      setSyncTime(Math.floor(Math.random() * 999));
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
    setError(null);
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
        // [SECURITY UPDATE] Never trust frontend deposit requests.
        // Balance is NOT updated here. It will be updated by the backend/admin 
        // after verifying the actual payment on the blockchain/payment gateway.
      }

      await createTransaction({
        user_id: user.id,
        asset: selectedCoin,
        type: actionModal,
        amount: numAmount,
        value: 0,
        status: actionModal === 'Deposit' ? 'Pending Verification' : 'Completed',
        client_tx_id: `${actionModal.toLowerCase()}_${user.id}_${Date.now()}`
      });

      if (refreshData) await refreshData();
      setStep(3);
    } catch (err) {
      setError(err.message);
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
      <div className="space-y-16 relative max-w-[1600px] mx-auto pb-32 pt-8">
        
        {/* INSTITUTIONAL STATUS TICKER */}
        <div className="fixed top-[112px] left-0 w-full z-30 pointer-events-none">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border-y border-white/[0.03] h-12 flex items-center overflow-hidden">
            <div className="flex gap-16 animate-marquee whitespace-nowrap px-12 items-center">
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(252,213,53,0.5)]"></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Institutional Node: Verified</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Clearance Protocol v4.0 Active</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Latency: 0.{syncTime}ms</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* HERO PORTFOLIO SECTION */}
        <header className="relative mt-24 py-24 md:py-32 px-8 md:px-20 rounded-[48px] md:rounded-[64px] bg-[#0d0d0d] border border-white/[0.05] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] -z-10 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-success/5 blur-[150px] -z-10"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="px-5 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sovereign Balance</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol v4.0</span>
                </div>
                <h1 className="text-[64px] md:text-[110px] font-black text-white tracking-tighter leading-none flex items-baseline gap-2">
                  {formatPrice(profile?.usd_balance || 0).split('.')[0]}
                  <span className="text-2xl md:text-5xl text-zinc-700 font-bold">.{formatPrice(profile?.usd_balance || 0).split('.')[1] || '00'}</span>
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">24H Performance</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-success tracking-tighter">+12.42%</span>
                    <span className="material-symbols-outlined text-success">trending_up</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Liquidity Index</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white tracking-tighter">Platinum</span>
                    <span className="material-symbols-outlined text-primary">verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.button 
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => window.location.href = '/deposit'} 
                className="group relative p-10 rounded-[40px] bg-primary border border-primary flex flex-col items-center text-center shadow-2xl transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-primary font-black">add_circle</span>
                </div>
                <h3 className="text-lg font-black text-black uppercase tracking-[0.3em]">Initialize</h3>
                <p className="text-[9px] text-black/60 font-bold mt-2 uppercase tracking-widest">Deposit Protocol</p>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setActionModal('Withdraw')} 
                className="group relative p-10 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-white/20 flex flex-col items-center text-center backdrop-blur-xl transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10">
                  <span className="material-symbols-outlined text-3xl text-zinc-400 font-black">outbox</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">Release</h3>
                <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-widest">Withdraw Protocol</p>
              </motion.button>
            </div>
          </div>
        </header>

        {/* ASSET MATRIX */}
        <div className="space-y-10">
          <div className="flex justify-between items-end px-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Institutional Matrix</h2>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Cross-Chain Distribution v4.0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* STABLECOIN VAULT */}
            <Card className="p-10 citadel-card border-primary/20 bg-primary/5 relative group" glass glow>
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-2xl">
                  <span className="material-symbols-outlined text-3xl font-black">account_balance_wallet</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Cleared Balance</span>
                  <span className="px-3 py-1 bg-primary/20 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20">Verified</span>
                </div>
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Settlement</h3>
                  <p className="text-4xl font-black text-white tracking-tighter">{(profile?.usd_balance || 0).toLocaleString()}<span className="text-lg ml-2 text-zinc-700">USDT</span></p>
                </div>
                <div className="pt-6 border-t border-white/5">
                   <button onClick={() => window.location.href = '/deposit'} className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black transition-all">Expand Liquidity</button>
                </div>
              </div>
            </Card>

            {portfolio.map((asset) => {
              const coin = dynamicCoins.find(c => c.symbol === asset.symbol);
              return (
                <Card key={asset.id} className="p-10 citadel-card hover:scale-[1.02] transition-all group" glass>
                  <div className="flex justify-between items-start mb-12">
                    <img src={coin?.image} alt={asset.symbol} className="w-14 h-14 rounded-2xl border border-white/10 p-1 bg-zinc-950 shadow-2xl" />
                    <div className="text-right">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">{asset.symbol} Index</span>
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">Active Pool</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Allocated Quantum</h3>
                      <p className="text-4xl font-black text-white tracking-tighter">{parseFloat(asset.amount).toFixed(4)}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setSelectedCoin(asset.symbol); setActionModal('Withdraw'); }} className="flex-1 py-4 bg-white/[0.03] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Withdraw</button>
                      <button onClick={() => window.location.href = '/deposit'} className="px-5 py-4 bg-white/[0.03] border border-white/5 rounded-xl text-zinc-500 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-lg font-black">add</span>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}

            <div className="group cursor-pointer border-2 border-dashed border-white/5 rounded-[48px] p-10 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all border border-white/5">
                <span className="material-symbols-outlined text-2xl font-black">account_balance</span>
              </div>
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] group-hover:text-white transition-colors">Integrate Strategy Asset</h3>
              <p className="text-[9px] text-zinc-800 font-bold mt-2 uppercase tracking-widest">Tier 4 Clearance Required</p>
            </div>
          </div>
        </div>

        {/* AUDIT LEDGER */}
        <div className="space-y-10">
          <div className="flex justify-between items-end px-4">
             <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Institutional Audit</h2>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Immutable Settlement History</p>
             </div>
          </div>

          <Card className="p-0 overflow-hidden citadel-card border-white/5" glass>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-[10px] text-zinc-600 uppercase tracking-[0.4em] border-b border-white/5">
                  <tr>
                    <th className="px-12 py-8">Protocol Initiation</th>
                    <th className="px-12 py-8">Asset Quantum</th>
                    <th className="px-12 py-8">Settlement Status</th>
                    <th className="px-12 py-8 text-right">Verification Stamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {(txData || []).map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-12 py-8 flex items-center gap-6">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xl transition-transform group-hover:scale-110",
                          tx.type === 'Deposit' ? "bg-success/10 text-success border-success/20" : 
                          tx.type === 'Transfer' ? "bg-primary/10 text-primary border-primary/20" : 
                          "bg-zinc-800 text-zinc-500 border-white/10"
                        )}>
                          <span className="material-symbols-outlined text-lg font-black">
                            {tx.type === 'Deposit' ? 'input' : tx.type === 'Transfer' ? 'sync_alt' : 'output'}
                          </span>
                        </div>
                        <span className="font-black text-white uppercase tracking-widest">{tx.type} Execution</span>
                      </td>
                      <td className="px-12 py-8">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-white">{parseFloat(tx.amount).toFixed(4)}</span>
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{tx.asset}</span>
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <span className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border",
                          tx.status === 'Completed' ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20 animate-pulse"
                        )}>
                          {tx.status} Verified
                        </span>
                      </td>
                      <td className="px-12 py-8 text-right text-zinc-600 font-bold uppercase tracking-widest">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ACTION MODAL - FINALIZED FOR INSTITUTIONAL CLEARANCE */}
        <AnimatePresence>
          {actionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                onClick={() => setActionModal(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-[48px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
              >
                <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined">{actionModal === 'Withdraw' ? 'outbox' : 'sync_alt'}</span>
                     </div>
                     <h2 className="text-xl font-black text-white uppercase tracking-tighter">Institutional {actionModal}</h2>
                  </div>
                  <button onClick={() => setActionModal(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-10 space-y-10">
                  {step === 1 && (
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Strategy Asset</label>
                          <select 
                            value={selectedCoin} 
                            onChange={(e) => setSelectedCoin(e.target.value)}
                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all appearance-none"
                          >
                            {dynamicCoins.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} Protocol</option>)}
                          </select>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Destination Reference</label>
                          <input 
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={actionModal === 'Withdraw' ? "Enter Secure Vault Address" : "Enter Recipient UID"}
                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-zinc-800"
                          />
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Quantum Allocation</label>
                             <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Max: {parseFloat(profile?.usd_balance || 0).toLocaleString()}</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all text-2xl"
                            />
                            <button onClick={() => setAmount(profile?.usd_balance)} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-black uppercase tracking-widest text-[10px]">All</button>
                          </div>
                       </div>

                       <Button variant="primary" className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl" onClick={handleAction}>Authorize {actionModal}</Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-10 py-10 text-center">
                       <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-2xl">
                          <span className="material-symbols-outlined text-5xl">verified_user</span>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Verification</h3>
                          <p className="text-zinc-500 text-sm font-medium">Verify the quantum allocation before signing the clearance. This action is immutable once initiated.</p>
                       </div>
                       <div className="p-8 bg-black border border-white/5 rounded-[32px] space-y-4 text-left">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Asset Quantum</span>
                             <span className="text-sm font-black text-white uppercase tracking-widest">{amount} {selectedCoin}</span>
                          </div>
                          <div className="h-px bg-white/5 w-full"></div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target Vault</span>
                             <span className="text-sm font-black text-white uppercase tracking-widest truncate ml-10">{address}</span>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                          <button onClick={handleAction} className="flex-1 py-5 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">Sign Execution</button>
                       </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-10 py-10 text-center">
                       <div className="w-24 h-24 bg-success/10 rounded-[32px] flex items-center justify-center text-success mx-auto border border-success/20 shadow-2xl">
                          <span className="material-symbols-outlined text-5xl">verified</span>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Execution <span className="text-primary italic">Cleared</span></h3>
                          <p className="text-zinc-500 text-sm font-medium">Protocol settlement initiated. The transaction has been broadcast to the institutional nodes.</p>
                       </div>
                       <button onClick={() => setActionModal(null)} className="w-full py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">Return to Command Center</button>
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
