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
    setTxRef(`EC-${Math.random().toString(36).toUpperCase().slice(2, 10)}`);
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
    try {
      await createTransaction({
        user_id: user.id,
        asset: selectedCoin.symbol,
        type: 'Deposit',
        amount: 0,
        value: 0,
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
      <div className="max-w-5xl mx-auto py-12 md:py-20 px-8">
        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
             <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Institutional Bridge</div>
             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Protocol v4.0 Active</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">Institutional <span className="text-primary">Clearance</span></h1>
          <p className="text-zinc-500 mt-6 text-lg max-w-2xl font-medium leading-relaxed">Initialize your sovereign capital allocation by depositing assets into the Equity Citadel verified multi-sig vaults.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Progress Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <StepIndicator number={1} title="Select Strategy Asset" active={step === 1} completed={step > 1} />
            <StepIndicator number={2} title="Transfer to Vault" active={step === 2} completed={step > 2} />
            <StepIndicator number={3} title="Await Settlement" active={step === 3} completed={step > 3} />
            
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
               <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Clearance Status</h4>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">Network Synchronized</span>
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-bold">Average settlement time: 4-12 network confirmations across institutional nodes.</p>
            </div>
          </div>

          {/* Main Interface */}
          <div className="md:col-span-8">
            <Card className="p-12 citadel-card shadow-2xl relative overflow-hidden" glass>
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
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Target Digital Asset</label>
                      <div className="grid grid-cols-2 gap-4">
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
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Settlement Network</label>
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
                      Authorize Clearance Gateway
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
                        className="w-52 h-52 relative z-10"
                      />
                    </div>

                    <div className="px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-xl">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol Session: {txRef}</span>
                    </div>

                    <div className="w-full space-y-6">
                      <div className="text-left space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Verified Institutional Vault Address</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-black/60 p-5 rounded-2xl border border-white/5 font-mono text-[11px] text-zinc-400 break-all select-all shadow-inner">
                            {getVaultAddress()}
                          </div>
                          <button 
                            onClick={handleCopy}
                            className="p-5 bg-primary text-black rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(252,213,53,0.3)]"
                          >
                            <span className="material-symbols-outlined text-lg">{copied ? 'verified' : 'content_copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-error/5 border border-error/20 rounded-[32px] flex items-start gap-5 text-left backdrop-blur-xl">
                        <span className="material-symbols-outlined text-error text-2xl">security_update_warning</span>
                        <p className="text-[10px] text-error font-black leading-relaxed uppercase tracking-widest opacity-80">
                          CRITICAL: Deploy {selectedCoin.symbol} only via the {selectedNetwork} protocol. Cross-chain errors will result in permanent capital liquidation within the clearance node.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full pt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest border-white/10"
                        onClick={() => setStep(1)}
                      >
                        Change Protocol
                      </Button>
                      <Button 
                        variant="primary" 
                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl"
                        onClick={handleConfirm}
                        loading={loading}
                      >
                        Confirm Transfer
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
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Settlement <span className="text-primary italic">In Progress</span></h3>
                      <div className="inline-block px-6 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl mb-4">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol Reference: <span className="text-white">{txRef}</span></span>
                      </div>
                      <p className="text-zinc-500 text-base max-w-md mx-auto font-medium leading-relaxed">
                        Your capital is being synchronized across the {selectedNetwork} institutional nodes. Status will update to 'Cleared' upon final validation.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="px-16 py-5 text-[10px] font-black uppercase tracking-widest border-white/10"
                      onClick={() => window.location.href = '/wallet'}
                    >
                      Return to Command Center
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
