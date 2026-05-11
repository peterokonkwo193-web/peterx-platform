import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import Card from '../common/Card';
import { useCurrency } from '../../context/CurrencyContext';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Protocol',
    range: 1000,
    duration: 7,
    roi: 12,
    icon: 'rocket_launch',
    color: 'from-blue-500/20',
    features: ['Fast entry', 'Weekly payouts', 'Secure pool']
  },
  {
    id: 'silver',
    name: 'Silver Strategic',
    range: 5000,
    duration: 14,
    roi: 25,
    icon: 'verified',
    color: 'from-zinc-500/20',
    features: ['Higher returns', 'Bi-weekly payouts', 'Priority support']
  },
  {
    id: 'gold',
    name: 'Gold Institutional',
    range: 10000,
    duration: 21,
    roi: 45,
    icon: 'account_balance',
    color: 'from-primary/20',
    features: ['Max efficiency', 'Low risk balancing', 'Direct support'],
    recommended: true
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    range: 15000,
    duration: 30,
    roi: 75,
    icon: 'diamond',
    color: 'from-pink-500/20',
    features: ['Elite liquidity', 'VIP support', 'No fees']
  }
];

const InvestmentPlans = ({ onSupport }) => {
  const { formatPrice } = useCurrency();

  return (
    <section className="py-20 md:py-48 px-4 md:px-6 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Decor - Reduced on mobile */}
      <div className="hidden md:block absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse"></div>
      <div className="hidden md:block absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16 md:mb-32 space-y-4 md:space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] block"
          >
            Live Investments
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-[72px] font-bold text-white tracking-tighter leading-tight md:leading-[0.9] uppercase"
          >
            Investment <span className="text-primary italic">Yield</span> Strategies
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-3xl mx-auto font-medium text-base md:text-xl leading-relaxed"
          >
            Invest your funds into expert-managed strategies with guaranteed security and fast payouts.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-full"
            >
              <Card 
                className={cn(
                  "h-full p-5 md:p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-700 border shadow-2xl",
                  plan.recommended ? "border-primary/40 bg-primary/5" : "border-white/5 bg-white/[0.02]"
                )} 
                glass
              >
                {/* Protocol Info Overlay */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* CARD HEADER */}
                <div className="flex justify-between items-center w-full mb-6 relative z-30">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSupport(plan);
                    }}
                    className="flex items-center gap-2 group/support backdrop-blur-xl"
                    title="Contact Support"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/support:border-primary/50 group-hover/support:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-[16px] text-zinc-500 group-hover/support:text-primary transition-colors">contact_support</span>
                    </div>
                  </button>

                  {plan.recommended && (
                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 backdrop-blur-xl rounded-lg shadow-[0_0_15px_rgba(252,213,53,0.1)]">
                      <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Recommended</span>
                    </div>
                  )}
                </div>

                <div className="relative z-10 w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-white/[0.03] flex items-center justify-center mb-4 md:mb-6 border border-white/5 group-hover:border-primary/40 transition-all group-hover:bg-primary/5 group-hover:scale-110">
                  <span className="material-symbols-outlined text-xl md:text-2xl text-zinc-600 group-hover:text-primary transition-colors">
                    {plan.icon}
                  </span>
                </div>

                <h3 className="relative z-10 text-lg font-bold text-white uppercase tracking-tight mb-3">
                  {plan.name}
                </h3>
                
                <div className="relative z-10 flex flex-col items-center mb-5 md:mb-8">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-2">Projected Profit</span>
                  <span className="text-2xl md:text-3xl font-bold text-primary tracking-tighter shadow-primary/20 drop-shadow-2xl">+{plan.roi}%</span>
                </div>

                <div className="relative z-10 w-full p-4 bg-black/40 border border-white/5 rounded-xl mb-6 md:mb-8 space-y-3 backdrop-blur-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Duration</span>
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">{plan.duration} Days</span>
                  </div>
                  <div className="h-px bg-white/5 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Min Deposit</span>
                    <span className="text-[10px] text-white font-bold tracking-widest font-mono">{formatPrice(plan.range)}</span>
                  </div>
                </div>

                <ul className="relative z-10 space-y-5 mb-12 text-left w-full px-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-4 text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors leading-tight">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">verified</span>
                      <span className="uppercase tracking-widest">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/deposit" 
                  className="relative z-10 w-full py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] text-white hover:bg-primary hover:text-black hover:border-primary transition-all shadow-2xl group-hover:scale-105 text-center"
                >
                  Invest Now
                </Link>
                
                {/* Background Text Decor */}
                <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-white/[0.01] pointer-events-none select-none tracking-tighter">
                   {plan.roi}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
