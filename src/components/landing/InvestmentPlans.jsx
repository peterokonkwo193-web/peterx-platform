import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
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
    features: ['Low latency entry', 'Weekly settlement', 'Standard liquidity pool']
  },
  {
    id: 'silver',
    name: 'Silver Strategic',
    range: 5000,
    duration: 14,
    roi: 25,
    icon: 'verified',
    color: 'from-zinc-500/20',
    features: ['Enhanced yield curve', 'Bi-weekly settlement', 'Priority support']
  },
  {
    id: 'gold',
    name: 'Gold Institutional',
    range: 10000,
    duration: 21,
    roi: 45,
    icon: 'account_balance',
    color: 'from-primary/20',
    features: ['Maximum efficiency', 'Custom risk balancing', 'Direct API access'],
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
    features: ['Whale-grade liquidity', 'VIP concierge', 'Zero termination fees']
  }
];

const InvestmentPlans = ({ onSupport }) => {
  const { formatPrice } = useCurrency();

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-black text-primary uppercase tracking-[0.4em] block"
          >
            Capital Allocation Protocol
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[48px] md:text-[64px] font-black text-white tracking-tighter leading-none"
          >
            Institutional <span className="text-primary italic">Yield</span> Strategies
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg"
          >
            Deploy assets into verified institutional-grade strategies with guaranteed liquidity and precision settlement.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "group relative p-1 rounded-[40px] transition-all duration-700 hover:scale-[1.02]",
                plan.recommended ? "bg-gradient-to-br from-primary/50 via-primary/10 to-transparent" : "bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="h-full bg-[#0a0c10] rounded-[39px] p-10 flex flex-col items-center text-center relative overflow-hidden">
                {/* Glow Effect */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", plan.color)}></div>
                
                {/* Support Link */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSupport(plan);
                  }}
                  className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-zinc-600 hover:text-primary transition-all duration-300 group/support"
                  title="Contact Support"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/support:border-primary/50 group-hover/support:bg-primary/10">
                    <span className="material-symbols-outlined text-[16px]">contact_support</span>
                  </div>
                </button>

                {plan.recommended && (
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-primary rounded-full z-20">
                    <span className="text-[9px] font-black text-black uppercase tracking-widest">Recommended</span>
                  </div>
                )}

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary/50 transition-colors group-hover:bg-primary/10">
                  <span className="material-symbols-outlined text-4xl text-zinc-400 group-hover:text-primary transition-colors">
                    {plan.icon}
                  </span>
                </div>

                <h3 className="relative z-10 text-2xl font-black text-white uppercase tracking-tight mb-2">
                  {plan.name}
                </h3>
                
                <div className="relative z-10 flex items-center gap-2 mb-8">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target ROI</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">+{plan.roi}%</span>
                </div>

                <div className="relative z-10 w-full p-6 bg-white/[0.02] border border-white/5 rounded-3xl mb-8 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Duration</span>
                    <span className="text-white font-black uppercase tracking-widest">{plan.duration} Days</span>
                  </div>
                  <div className="h-[1px] bg-white/5 w-full"></div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Min Allocation</span>
                    <span className="text-white font-black tracking-widest">{formatPrice(plan.range)}</span>
                  </div>
                </div>

                <ul className="relative z-10 space-y-4 mb-10 text-left w-full">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                      <span className="material-symbols-outlined text-success text-[16px]">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/deposit" 
                  className="relative z-10 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl"
                >
                  Authorize Allocation
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
