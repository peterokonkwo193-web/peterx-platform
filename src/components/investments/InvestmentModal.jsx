import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Card from '../common/Card';
import { executeInvestment } from '../../lib/db';
import { useCurrency } from '../../context/CurrencyContext';

const InvestmentModal = ({ isOpen, onClose, plan, profile, onComplete, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  const isInsufficient = profile?.usd_balance < plan.range;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isInsufficient) {
        throw new Error('Insufficient Balance');
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      const investmentData = {
        user_id: profile.id,
        plan_name: plan.name,
        amount: plan.range,
        duration_days: plan.duration,
        expected_profit: (plan.range * plan.roi) / 100,
        end_date: endDate.toISOString(),
        client_tx_id: `inv_${profile.id}_${Date.now()}`
      };

      // 1. Execute Investment Transactionally via RPC
      await executeInvestment(investmentData);

      // 2. Refresh data immediately to sync UI
      if (refreshData) await refreshData();

      onComplete();
      onClose();
    } catch (err) {
      setError(err.message || 'Institutional protocol execution failed. Please check liquidity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 border-primary/20 shadow-[0_0_50px_rgba(252,213,53,0.1)]" glass>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Confirm Protocol Allocation</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Selected Strategy</span>
                <span className="text-sm font-black text-primary">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Principal Amount</span>
                <span className="text-xl font-black text-white">{formatPrice(plan.range)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Expected ROI ({plan.roi}%)</span>
                <span className="text-sm font-black text-success">+{formatPrice((plan.range * plan.roi) / 100)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                Funds will be locked for <span className="text-primary font-black">{plan.duration} days</span>. 
                Early termination is not supported for institutional-grade strategies.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-[10px] text-error font-black uppercase tracking-widest">{error}</p>
                </div>
                {error === 'Insufficient Balance' && (
                  <Button 
                    variant="primary" 
                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest bg-error text-white hover:bg-error/90 border-error/20"
                    onClick={() => {
                      onClose();
                      navigate('/wallet');
                    }}
                  >
                    Deposit Funds Now
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-4 font-black uppercase tracking-widest" onClick={onClose}>
                Abort
              </Button>
              {isInsufficient ? (
                <Button 
                  variant="primary" 
                  className="flex-1 py-4 font-black uppercase tracking-widest bg-zinc-800 text-white hover:bg-zinc-700"
                  onClick={() => {
                    onClose();
                    navigate('/wallet');
                  }}
                >
                  Deposit Funds
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  className="flex-1 py-4 font-black uppercase tracking-widest"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Execute Investment'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default InvestmentModal;
