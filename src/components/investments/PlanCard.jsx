import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { cn } from '../../utils/cn';
import { useCurrency } from '../../context/CurrencyContext';

const PlanCard = ({ plan, onInvest, onSupport, isRecommended = false }) => {
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      <Card 
        className={cn(
          "p-8 flex flex-col h-full transition-all duration-500 group relative overflow-hidden border-0",
          isRecommended 
            ? "bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-[0_0_80px_rgba(252,213,53,0.15)] ring-1 ring-primary/40" 
            : "bg-white/[0.02] hover:bg-white/[0.04] ring-1 ring-white/10 hover:ring-white/20"
        )}
        glass
      >
        {/* Animated Glow Effect for Recommended */}
        {isRecommended && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-all duration-700 animate-pulse"></div>
        )}

        {/* Support Link */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSupport(plan);
          }}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-zinc-500 hover:text-primary transition-all duration-300 group/support"
          title="Contact Support"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover/support:opacity-100 transition-opacity">Support</span>
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover/support:border-primary/50 group-hover/support:bg-primary/10">
            <span className="material-symbols-outlined text-[14px]">contact_support</span>
          </div>
        </button>

        {isRecommended && (
          <div className="absolute top-14 right-4 z-20">
            <div className="bg-primary text-black text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-2xl flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[10px] animate-spin-slow">star</span>
              Tier 1 Recommended
            </div>
          </div>
        )}

        <div className="mb-10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-2xl",
              isRecommended 
                ? "bg-primary/30 border-primary/40 shadow-primary/20 rotate-3 group-hover:rotate-0" 
                : "bg-zinc-950 border-white/10 group-hover:border-white/30"
            )}>
              <span className={cn(
                "material-symbols-outlined text-2xl transition-transform duration-500 group-hover:scale-110", 
                isRecommended ? "text-primary drop-shadow-[0_0_8px_rgba(252,213,53,0.5)]" : "text-zinc-500"
              )}>
                {plan.icon || 'payments'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none">{plan.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={cn("w-1 h-1 rounded-full", i < (isRecommended ? 5 : 3) ? "bg-primary" : "bg-zinc-800")}></div>
                   ))}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Protocol Confidence</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <span className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em] block mb-1">Capital Requirement</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tighter">
                  {formatPrice(plan.range)}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest ml-1">Minimum</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Horizon</span>
                <span className="text-xs font-black text-white uppercase">{plan.duration} Days</span>
              </div>
              <div className="p-3 bg-success/5 border border-success/20 rounded-xl flex flex-col gap-1">
                <span className="text-[8px] text-success/60 font-black uppercase tracking-widest">Yield Curve</span>
                <span className="text-xs font-black text-success uppercase">+{plan.roi}% ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Preview visualization */}
        <div className="mb-8 relative z-10 px-1">
           <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Growth Forecast</span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">+{plan.roi}%</span>
           </div>
           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${plan.roi}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className={cn(
                  "h-full rounded-full shadow-[0_0_10px_rgba(252,213,53,0.3)]",
                  isRecommended ? "bg-primary" : "bg-zinc-400"
                )}
              ></motion.div>
           </div>
        </div>

        <div className="mt-auto relative z-10 pt-8 border-t border-white/5 space-y-6">
          <ul className="space-y-3.5">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wide group/li">
                <span className={cn(
                  "material-symbols-outlined text-[16px] transition-colors",
                  isRecommended ? "text-primary" : "text-zinc-700 group-hover/li:text-zinc-400"
                )}>check_circle</span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="relative overflow-hidden rounded-xl">
             <Button 
               variant={isRecommended ? "primary" : "secondary"} 
               className={cn(
                 "w-full py-4.5 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative z-10",
                 isRecommended ? "shadow-primary/20" : "bg-white/5 border-white/10 hover:bg-white/10"
               )}
               onClick={() => onInvest(plan)}
             >
               Allocate Capital
             </Button>
             {isRecommended && (
               <motion.div 
                 animate={{ x: ['-100%', '200%'] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-20 pointer-events-none"
               />
             )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PlanCard;
