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
    <section className="py-48 px-6 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-32 space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[12px] font-black text-primary uppercase tracking-[0.5em] block"
          >
            Capital Allocation Protocol v4.0
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[56px] md:text-[84px] font-black text-white tracking-tighter leading-[0.9] uppercase"
          >
            Institutional <span className="text-primary italic">Yield</span> Strategies
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-3xl mx-auto font-medium text-xl leading-relaxed"
          >
            Deploy assets into verified institutional-grade strategies with guaranteed deep-pool liquidity and precision cross-chain settlement.
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
                  "h-full p-10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-700 hover:scale-[1.05] border shadow-2xl",
                  plan.recommended ? "border-primary/40 bg-primary/5" : "border-white/5 bg-white/[0.02]"
                )} 
                glass
              >
                {/* Protocol Info Overlay */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Support Bridge */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSupport(plan);
                  }}
                  className="absolute top-8 left-8 z-20 flex items-center gap-2 group/support backdrop-blur-xl"
                  title="Contact Support"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/support:border-primary/50 group-hover/support:bg-primary/10 transition-all">
                    <span className="material-symbols-outlined text-[18px] text-zinc-500 group-hover/support:text-primary transition-colors">contact_support</span>
                  </div>
                </button>

                {plan.recommended && (
                  <div className="absolute top-8 right-8 px-5 py-2 bg-primary rounded-xl z-20 shadow-[0_0_15px_rgba(252,213,53,0.3)]">
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Recommended</span>
                  </div>
                )}

                <div className="relative z-10 w-24 h-24 rounded-[32px] bg-white/[0.03] flex items-center justify-center mb-10 border border-white/5 group-hover:border-primary/40 transition-all group-hover:bg-primary/5 group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined text-5xl text-zinc-600 group-hover:text-primary transition-colors">
                    {plan.icon}
                  </span>
                </div>

                <h3 className="relative z-10 text-2xl font-black text-white uppercase tracking-tight mb-3">
                  {plan.name}
                </h3>
                
                <div className="relative z-10 flex flex-col items-center mb-10">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">Projected Net Yield</span>
                  <span className="text-5xl font-black text-primary tracking-tighter shadow-primary/20 drop-shadow-2xl">+{plan.roi}%</span>
                </div>

                <div className="relative z-10 w-full p-8 bg-black/40 border border-white/5 rounded-[32px] mb-10 space-y-5 backdrop-blur-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Horizon</span>
                    <span className="text-sm text-white font-black uppercase tracking-widest">{plan.duration} Trading Days</span>
                  </div>
                  <div className="h-px bg-white/5 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Min Entry</span>
                    <span className="text-sm text-white font-black tracking-widest font-mono">{formatPrice(plan.range)}</span>
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
                  className="relative z-10 w-full py-6 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-primary hover:text-black hover:border-primary transition-all shadow-2xl group-hover:scale-105"
                >
                  Initialize Allocation
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
