import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useMarketData } from '../hooks/useMarketData';
import { createTransaction } from '../lib/db';
import { cn } from '../utils/cn';

const STATIC_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', color: 'from-orange-500/20' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: 'from-indigo-500/20' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', color: 'from-teal-500/20' },
  { symbol: 'USDT', name: 'Tether', type: 'crypto', image: 'https://assets.coingecko.com/coins/images/325/small/tether.png', color: 'from-success/20' },
  { symbol: 'PI', name: 'Pi Network', type: 'crypto', image: 'https://minepi.com/wp-content/uploads/2021/11/logo-pi-600.png', color: 'from-primary/20' }
];

const NETWORKS = {
  'BTC': ['Bitcoin (BTC)', 'Lightning Network', 'BNB Smart Chain (BEP20)'],
  'ETH': ['Ethereum (ERC20)', 'Arbitrum One', 'Optimism', 'Polygon', 'Base'],
  'SOL': ['Solana (SOL)', 'BNB Smart Chain (BEP20)'],
  'USDT': ['Tron (TRC20)', 'Ethereum (ERC20)', 'BNB Smart Chain (BEP20)', 'Polygon', 'Solana'],
  'PI': ['Pi Network Mainnet', 'BNB Smart Chain (BEP20)']
};

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
    // Generate a unique reference for this deposit session
    setTxRef(`REF-${Math.random().toString(36).toUpperCase().slice(2, 10)}`);
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      const networks = NETWORKS[selectedCoin.symbol] || [`${selectedCoin.symbol} Mainnet`];
      setSelectedNetwork(networks[0]);
    }
  }, [selectedCoin]);

  const handleCopy = () => {
    const addr = "0x" + Math.random().toString(16).slice(2, 12) + "..." + Math.random().toString(16).slice(2, 6);
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
      <div className="max-w-4xl mx-auto py-8 md:py-12 px-6">
        <header className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <div className="px-3 py-1 bg-primary/10 rounded-full text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20">Institutional Gateway</div>
             <span className="text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Secure Asset Ingress</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">Institutional <span className="text-primary italic">Deposit</span></h1>
          <p className="text-zinc-500 mt-4 text-sm md:text-base font-medium">Initialize your capital allocation by depositing assets into your secure institutional vault.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Progress Sidebar */}
          <div className="md:col-span-4 space-y-4">
            <StepIndicator number={1} title="Select Asset" active={step === 1} completed={step > 1} />
            <StepIndicator number={2} title="Transfer Assets" active={step === 2} completed={step > 2} />
            <StepIndicator number={3} title="Await Verification" active={step === 3} completed={step > 3} />
          </div>

          {/* Main Interface */}
          <div className="md:col-span-8">
            <Card className="p-8 shadow-2xl relative overflow-hidden" glass>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Choose Digital Asset</label>
                      <div className="grid grid-cols-2 gap-4">
                        {STATIC_COINS.map(coin => (
                          <button
                            key={coin.symbol}
                            onClick={() => setSelectedCoin(coin)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                              selectedCoin.symbol === coin.symbol 
                                ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(252,213,53,0.1)]" 
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                          >
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div className="text-left">
                              <p className="text-sm font-black text-white uppercase">{coin.symbol}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase">{coin.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Network</label>
                      <div className="space-y-2">
                        {(NETWORKS[selectedCoin.symbol] || []).map(net => (
                          <button
                            key={net}
                            onClick={() => setSelectedNetwork(net)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                              selectedNetwork === net 
                                ? "bg-white/10 border-white/20 text-white" 
                                : "bg-transparent border-white/5 text-zinc-500 hover:text-white"
                            )}
                          >
                            <span className="text-xs font-bold uppercase tracking-widest">{net}</span>
                            {selectedNetwork === net && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="primary" 
                      className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em]"
                      onClick={() => setStep(2)}
                    >
                      Generate Gateway
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex flex-col items-center text-center"
                  >
                    <div className="p-6 bg-white rounded-3xl shadow-2xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${txRef}`} 
                        alt="Deposit QR" 
                        className="w-48 h-48"
                      />
                    </div>

                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Session Reference: {txRef}</span>
                    </div>

                    <div className="w-full space-y-4">
                      <div className="text-left">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personal {selectedCoin.symbol} Deposit Address</label>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-zinc-950 p-4 rounded-xl border border-white/10 font-mono text-[10px] text-zinc-400 break-all select-all">
                            0x{Math.random().toString(16).slice(2, 12)}...{Math.random().toString(16).slice(2, 8)}
                          </div>
                          <button 
                            onClick={handleCopy}
                            className="p-4 bg-primary text-black rounded-xl hover:scale-105 transition-transform"
                          >
                            <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4 text-left">
                        <span className="material-symbols-outlined text-yellow-500 text-lg">warning</span>
                        <p className="text-[10px] text-yellow-500/80 font-bold leading-relaxed uppercase">
                          Important: Ensure you are sending {selectedCoin.symbol} via the {selectedNetwork} network. Sending any other asset or using a different network will result in permanent loss of funds.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => setStep(1)}
                      >
                        Change Asset
                      </Button>
                      <Button 
                        variant="primary" 
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                        onClick={handleConfirm}
                        loading={loading}
                      >
                        I've Transferred
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success relative">
                      <div className="absolute inset-0 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
                      <span className="material-symbols-outlined text-5xl">hourglass_empty</span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Verification <span className="text-primary italic">Pending</span></h3>
                      <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-xl mb-4">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reference ID: <span className="text-white">{txRef}</span></span>
                      </div>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                        Our institutional node is currently verifying your transfer on the {selectedNetwork}. Please provide your Reference ID to support if verification takes longer than 24 hours.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="px-12 py-4 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => window.location.href = '/wallet'}
                    >
                      Return to Vault
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
