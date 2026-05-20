import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useMarketData } from '../hooks/useMarketData';
import { createTransaction } from '../lib/db';
import { cn } from '../utils/cn';

import { STATIC_COINS, NETWORKS, VAULT_ADDRESSES } from '../lib/constants';

const Deposit = () => {
  const { user, profile } = useSupabaseData();
  const { marketData } = useMarketData();
  const [selectedCoin, setSelectedCoin] = useState(STATIC_COINS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txRef, setTxRef] = useState('');

  useEffect(() => {
    setTxRef(`DEP-${Math.random().toString(36).toUpperCase().slice(2, 10)}`);
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      const networks = NETWORKS[selectedCoin.symbol] || [`${selectedCoin.symbol} Mainnet`];
      setSelectedNetwork(networks[0]);
    }
  }, [selectedCoin]);

  const getVaultAddress = () => {
    if (selectedCoin.symbol === 'USDT') {
      if (selectedNetwork.includes('TRC20')) return VAULT_ADDRESSES.USDT.TRC20;
      if (selectedNetwork.includes('ERC20')) return VAULT_ADDRESSES.USDT.ERC20;
      if (selectedNetwork.includes('BEP20')) return VAULT_ADDRESSES.USDT.BEP20;
      return VAULT_ADDRESSES.USDT.TRC20;
    }
    return VAULT_ADDRESSES[selectedCoin.symbol] || VAULT_ADDRESSES.ETH;
  };

  const handleCopy = () => {
    const addr = getVaultAddress();
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    
    // Capture amount from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const amount = parseFloat(urlParams.get('amount') || 0);

    try {
      await createTransaction({
        user_id: user.id,
        asset: selectedCoin.symbol,
        type: 'Deposit',
        amount: amount,
        value: amount, // Also set value to amount
        status: 'Pending Verification',
        client_tx_id: txRef
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-12 md:py-20 px-4 md:px-8">
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <div className="px-4 py-1 bg-primary/10 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-xl">Deposit Flow</div>
             <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Protocol v4.0.2 Active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Funding <span className="text-primary">Gateway</span></h1>
          <p className="text-zinc-600 mt-4 text-sm max-w-xl font-medium leading-relaxed uppercase tracking-tight opacity-80">Securely deposit capital into the institutional vaults below.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Progress Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <StepIndicator number={1} title="Select Asset" active={step === 1} completed={step > 1} />
            <StepIndicator number={2} title="Transfer Funds" active={step === 2} completed={step > 2} />
            <StepIndicator number={3} title="Await Confirmation" active={step === 3} completed={step > 3} />
            
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4 hidden lg:block">
               <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Network Status</h4>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">Synchronized</span>
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-bold">Average time: 4-12 confirmations.</p>
            </div>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-8">
            <Card className="p-6 md:p-12 citadel-card shadow-2xl relative overflow-hidden" glass>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Select Asset</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {STATIC_COINS.map(coin => (
                          <button
                            key={coin.symbol}
                            onClick={() => setSelectedCoin(coin)}
                            className={cn(
                              "flex items-center gap-4 p-5 rounded-2xl border transition-all group",
                              selectedCoin.symbol === coin.symbol 
                                ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(252,213,53,0.15)]" 
                                : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"
                            )}
                          >
                            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-xl" />
                            <div className="text-left">
                              <p className="text-sm font-black text-white uppercase tracking-tight">{coin.symbol}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{coin.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Select Network</label>
                      <div className="grid grid-cols-1 gap-3">
                        {(NETWORKS[selectedCoin.symbol] || []).map(net => (
                          <button
                            key={net}
                            onClick={() => setSelectedNetwork(net)}
                            className={cn(
                              "w-full flex items-center justify-between p-5 rounded-2xl border transition-all",
                              selectedNetwork === net 
                                ? "bg-white/10 border-white/20 text-white" 
                                : "bg-transparent border-white/5 text-zinc-600 hover:text-white"
                            )}
                          >
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{net}</span>
                            {selectedNetwork === net && <span className="material-symbols-outlined text-primary text-sm shadow-[0_0_10px_rgba(252,213,53,0.5)]">verified</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="primary" 
                      className="w-full py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl"
                      onClick={() => setStep(2)}
                    >
                      Next Step
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10 flex flex-col items-center text-center"
                  >
                    <div className="p-8 bg-white rounded-[40px] shadow-2xl relative group">
                      <div className="absolute inset-0 bg-primary/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getVaultAddress()}`} 
                        alt="Deposit QR" 
                        className="w-40 h-40 md:w-52 md:h-52 relative z-10"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                       <div className="px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-xl">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Reference: {txRef}</span>
                       </div>
                       {new URLSearchParams(window.location.search).get('amount') && (
                         <div className="px-6 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl backdrop-blur-xl">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Amount: ${new URLSearchParams(window.location.search).get('amount')}</span>
                         </div>
                       )}
                    </div>

                    <div className="w-full space-y-6">
                      <div className="text-left space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Wallet Address</label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex-1 w-full bg-black/60 p-5 rounded-2xl border border-white/5 font-mono text-[11px] text-zinc-400 break-all select-all shadow-inner">
                            {getVaultAddress()}
                          </div>
                          <button 
                            onClick={handleCopy}
                            className="w-full sm:w-auto p-5 bg-primary text-black rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(252,213,53,0.3)]"
                          >
                            <span className="material-symbols-outlined text-lg">{copied ? 'verified' : 'content_copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-error/5 border border-error/20 rounded-[32px] flex items-start gap-5 text-left backdrop-blur-xl">
                        <span className="material-symbols-outlined text-error text-2xl">security_update_warning</span>
                        <p className="text-[10px] text-error font-black leading-relaxed uppercase tracking-widest opacity-80">
                          IMPORTANT: Send only {selectedCoin.symbol} via the {selectedNetwork} network. Sending other assets will result in loss of funds.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest border-white/10"
                        onClick={() => setStep(1)}
                      >
                        Go Back
                      </Button>
                      <Button 
                        variant="primary" 
                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl"
                        onClick={handleConfirm}
                        loading={loading}
                      >
                        Confirm Deposit
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 flex flex-col items-center text-center space-y-10"
                  >
                    <div className="w-28 h-28 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary relative">
                      <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-[32px] animate-spin"></div>
                      <span className="material-symbols-outlined text-5xl">sync</span>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Processing <span className="text-primary italic">Deposit</span></h3>
                      <div className="inline-block px-6 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl mb-4">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reference: <span className="text-white">{txRef}</span></span>
                      </div>
                      <p className="text-zinc-500 text-base max-w-md mx-auto font-medium leading-relaxed uppercase tracking-tight">
                        Your deposit is being processed. Your balance will update once confirmed.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="px-16 py-5 text-[10px] font-black uppercase tracking-widest border-white/10"
                      onClick={() => window.location.href = '/wallet'}
                    >
                      Go to Wallet
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StepIndicator = ({ number, title, active, completed }) => (
  <div className={cn(
    "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500",
    active ? "bg-primary text-black border-primary shadow-xl scale-[1.05]" : 
    completed ? "bg-success/10 border-success/30 text-success" : 
    "bg-white/5 border-white/5 text-zinc-600"
  )}>
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
      active ? "bg-black text-white" : 
      completed ? "bg-success text-white" : 
      "bg-zinc-800 text-zinc-500"
    )}>
      {completed ? <span className="material-symbols-outlined text-xs">check</span> : number}
    </div>
    <span className="text-[11px] font-black uppercase tracking-widest">{title}</span>
  </div>
);

export default Deposit;
