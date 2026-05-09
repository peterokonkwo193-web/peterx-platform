import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import { cn } from '../../utils/cn';
import { VAULT_ADDRESSES } from '../../lib/constants';

const ASSETS = [
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', icon: 'payments', color: 'text-success' },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', icon: 'currency_bitcoin', color: 'text-primary' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', icon: 'eth', color: 'text-secondary' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', icon: 'wb_sunny', color: 'text-sky-400' },
  { id: 'gbp', symbol: 'GBP', name: 'British Pound', icon: 'currency_pound', color: 'text-zinc-400' },
];

const TransferModal = ({ profile, isOpen, onClose, onComplete }) => {
  const { formatPrice } = useCurrency();
  const [type, setType] = useState('send'); // send, receive
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error

  const isAdmin = profile?.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || profile?.id === '8d24918f-b493-4549-951e-1f85b0b97fe5';

  const getVaultAddress = (symbol) => {
    const addr = VAULT_ADDRESSES[symbol];
    if (typeof addr === 'object') return addr.TRC20; // Default to TRC20 for USDT
    return addr || profile?.id;
  };

  const handleTransfer = async () => {
    if (!amount || (type === 'send' && !walletId)) return;
    setLoading(true);
    setStatus('processing');

    try {
      if (type === 'send') {
        const numAmount = parseFloat(amount);
        if (numAmount > profile.usd_balance) throw new Error('Insufficient institutional liquidity.');

        if (isAdmin) {
          // Admin Direct Withdrawal logic
          const { error } = await supabase
            .from('profiles')
            .update({ usd_balance: profile.usd_balance - numAmount })
            .eq('id', profile.id);
          if (error) throw error;
        } else {
          // Client Payout Request logic
          const { error } = await supabase
            .from('transactions')
            .insert({
              user_id: profile.id,
              type: 'Withdrawal',
              asset: selectedAsset.symbol,
              amount: numAmount,
              status: 'Pending Payout',
              client_tx_id: walletId // Storing destination wallet here
            });
          if (error) throw error;
        }
      }

      setStatus('success');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Transfer error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="p-8 border border-primary/20 shadow-2xl relative overflow-hidden" glass>
          <div className="absolute top-0 right-0 p-6">
             <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>

          <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setType('send')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] border transition-all ${type === 'send' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(252,213,53,0.3)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'}`}
              >
                {isAdmin ? 'Withdrawal' : 'Request Payout'}
              </button>
              <button 
                onClick={() => setType('receive')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] border transition-all ${type === 'receive' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(252,213,53,0.3)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'}`}
              >
                Deposit
              </button>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
               <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-success text-3xl">verified</span>
               </div>
               <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Protocol Verified</h3>
               <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Transaction hashed and secured on-chain.</p>
            </div>
          ) : (
            <div className="space-y-6">
               {/* Asset Selector */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Institutional Asset</label>
                  <div className="grid grid-cols-3 gap-2">
                     {ASSETS.map(asset => (
                        <button 
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${selectedAsset.id === asset.id ? 'bg-white/10 border-primary shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                           <span className={cn("material-symbols-outlined text-xl mb-1", asset.color)}>{asset.icon}</span>
                           <span className="text-[9px] font-black uppercase">{asset.symbol}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {type === 'send' ? (
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Recipient Institutional Address</label>
                       <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-sm">alternate_email</span>
                          <input 
                            type="text"
                            placeholder="Enter Wallet ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all font-mono text-white"
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Transfer Amount ({selectedAsset.symbol})</label>
                       <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-sm">payments</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all font-mono text-white"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                       </div>
                       <div className="flex justify-between text-[10px] uppercase tracking-widest font-black px-1">
                          <span className="text-zinc-600">Max Liquidity</span>
                          <span className="text-primary">{formatPrice(profile?.usd_balance || 0)}</span>
                       </div>
                    </div>
                    {status === 'error' && (
                      <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-center">
                         <p className="text-[10px] font-black text-error uppercase tracking-widest">Transfer Failed: Insufficient Authority</p>
                      </div>
                    )}
                    <Button 
                      variant="primary" 
                      className="w-full py-4 font-black uppercase tracking-[0.3em] shadow-2xl"
                      onClick={handleTransfer}
                      disabled={loading || !amount || !walletId}
                    >
                      {loading ? 'Processing Protocol...' : isAdmin ? `Finalize ${selectedAsset.symbol} Withdrawal` : `Submit Payout Request`}
                    </Button>
                 </div>
               ) : (
                 <div className="space-y-8 text-center py-4">
                    <div>
                       <div className="w-48 h-48 bg-white p-4 rounded-3xl mx-auto mb-6 shadow-[0_0_40px_rgba(252,213,53,0.2)]">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getVaultAddress(selectedAsset.symbol)}`} 
                            alt="Vault QR" 
                            className="w-full h-full"
                          />
                       </div>
                       <h3 className="text-xs font-black text-white mb-2 uppercase tracking-[0.3em]">Institutional {selectedAsset.symbol} Vault</h3>
                       <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 group overflow-hidden">
                          <code className="flex-1 text-[10px] text-zinc-500 font-mono break-all font-bold text-left">{getVaultAddress(selectedAsset.symbol)}</code>
                          <button 
                            className="text-primary hover:text-white transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(getVaultAddress(selectedAsset.symbol));
                              alert('Institutional Vault Address copied to clipboard');
                            }}
                          >
                             <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                       </div>
                    </div>
                    {selectedAsset.symbol === 'USDT' && (
                       <div className="flex justify-center gap-4">
                          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-zinc-500 uppercase">TRC20</div>
                          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-zinc-500 uppercase">ERC20</div>
                          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-zinc-500 uppercase">BEP20</div>
                       </div>
                    )}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                       <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] leading-relaxed">
                          Secure Gateway Active. All {selectedAsset.name} deposits are subject to tier-4 verification.
                       </p>
                    </div>
                 </div>
               )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default TransferModal;
