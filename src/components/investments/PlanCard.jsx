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
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -16, scale: 1.02 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      <Card 
        className={cn(
          "p-10 flex flex-col h-full transition-all duration-700 group relative overflow-hidden border-0 shadow-2xl",
          isRecommended 
            ? "bg-gradient-to-br from-primary/10 via-white/[0.02] to-transparent ring-1 ring-primary/30" 
            : "bg-white/[0.02] hover:bg-white/[0.05] ring-1 ring-white/5 hover:ring-white/20"
        )}
        glass
      >
        {/* INSTITUTIONAL HUD DECOR */}
        {isRecommended && (
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
        )}
        <div className="absolute -left-10 -bottom-10 text-[100px] font-black text-white/[0.01] pointer-events-none select-none tracking-tighter uppercase leading-none">ALPHA</div>

        {/* SUPPORT PROTOCOL */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSupport(plan);
          }}
          className="absolute top-6 right-6 z-30 flex items-center gap-2 text-zinc-600 hover:text-primary transition-all duration-300 group/support"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-0 group-hover/support:opacity-100 transition-all translate-x-2 group-hover/support:translate-x-0">Enquire</span>
          <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover/support:border-primary/50 group-hover/support:bg-primary group-hover/support:text-black transition-all shadow-2xl">
            <span className="material-symbols-outlined text-xl font-black">support_agent</span>
          </div>
        </button>

        {isRecommended && (
          <div className="absolute top-8 left-10 z-20">
            <div className="bg-primary/10 border border-primary/20 backdrop-blur-xl text-primary text-[8px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-xl shadow-2xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Strategic Priority
            </div>
          </div>
        )}

        <div className="mb-12 mt-4 relative z-10">
          <div className="flex items-center gap-6 mb-10">
            <div className={cn(
              "w-20 h-20 rounded-[28px] flex items-center justify-center border transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
              isRecommended 
                ? "bg-primary/20 border-primary/40 shadow-primary/10 rotate-6 group-hover:rotate-0" 
                : "bg-zinc-900 border-white/5 group-hover:border-white/20"
            )}>
              <span className={cn(
                "material-symbols-outlined text-4xl transition-transform duration-700 group-hover:scale-110", 
                isRecommended ? "text-primary drop-shadow-[0_0_15px_rgba(252,213,53,0.5)]" : "text-zinc-700 group-hover:text-white"
              )}>
                {plan.icon || 'hub'}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-2">{plan.name}</h3>
              <div className="flex items-center gap-3">
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < (isRecommended ? 5 : 3) ? "bg-primary shadow-[0_0_8px_rgba(252,213,53,0.4)]" : "bg-zinc-800")}></div>
                    ))}
                 </div>
                 <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Protocol Confidence</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="relative">
              <span className="text-[10px] text-zinc-700 uppercase font-black tracking-[0.4em] block mb-3">Capital Requirement</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-white tracking-tighter leading-none">
                  {formatPrice(plan.range)}
                </span>
                <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">Minimum</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2 shadow-inner group-hover:border-white/10 transition-all">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Execution Horizon</span>
                <span className="text-base font-black text-white uppercase tracking-tighter">{plan.duration} Days</span>
              </div>
              <div className="p-5 bg-success/5 border border-success/10 rounded-2xl flex flex-col gap-2 shadow-inner group-hover:border-success/20 transition-all">
                <span className="text-[9px] text-success/60 font-black uppercase tracking-[0.3em]">Strategic ROI</span>
                <span className="text-base font-black text-success uppercase tracking-tighter">+{plan.roi}% Epoch</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROI FORECAST MATRIX */}
        <div className="mb-12 relative z-10">
           <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">Yield Forecast</span>
              <span className="text-xs font-black text-zinc-400 font-mono tracking-tighter">+{plan.roi}% CURVE</span>
           </div>
           <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5 p-[1px] shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${plan.roi}%` }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  "h-full rounded-full relative",
                  isRecommended ? "bg-primary shadow-[0_0_20px_rgba(252,213,53,0.5)]" : "bg-zinc-600 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                )}
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </motion.div>
           </div>
        </div>

        <div className="mt-auto relative z-10 pt-10 border-t border-white/5 space-y-10">
          <ul className="space-y-4">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-4 text-[11px] text-zinc-500 font-black uppercase tracking-widest group/li">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isRecommended ? "bg-primary shadow-[0_0_8px_rgba(252,213,53,0.5)]" : "bg-zinc-800 group-hover/li:bg-zinc-400"
                )}></div>
                {feature}
              </li>
            ))}
          </ul>

          <div className="relative">
             <Button 
               variant={isRecommended ? "primary" : "outline"} 
               className={cn(
                 "w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-500 relative z-10 shadow-2xl",
                 isRecommended ? "shadow-primary/30" : "bg-white/[0.02] border-white/10 hover:border-primary hover:text-primary hover:bg-primary/5"
               )}
               onClick={() => onInvest(plan)}
             >
               Allocate Protocol
             </Button>
             {isRecommended && (
               <motion.div 
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="absolute -inset-1 bg-primary/20 blur-xl rounded-3xl pointer-events-none"
               />
             )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PlanCard;
