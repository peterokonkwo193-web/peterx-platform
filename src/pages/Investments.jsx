import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import PlanCard from '../components/investments/PlanCard';
import InvestmentModal from '../components/investments/InvestmentModal';
import InvestmentDashboard from '../components/investments/InvestmentDashboard';
import { useSupport } from '../context/SupportContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getInvestments } from '../lib/db';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const INVESTMENT_PLANS = [
  {
    id: 'starter',
    name: 'Starter Protocol',
    range: 1000,
    duration: 7,
    roi: 12,
    icon: 'rocket_launch',
    features: ['Low latency entry', 'Weekly settlement', 'Standard liquidity pool']
  },
  {
    id: 'silver',
    name: 'Silver Strategic',
    range: 5000,
    duration: 14,
    roi: 25,
    icon: 'verified',
    features: ['Enhanced yield curve', 'Bi-weekly settlement', 'Priority support']
  },
  {
    id: 'gold',
    name: 'Gold Institutional',
    range: 10000,
    duration: 21,
    roi: 45,
    icon: 'account_balance',
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
    features: ['Whale-grade liquidity', 'VIP concierge', 'Zero termination fees']
  }
];

const Investments = () => {
  const { profile, refreshData, loading: supabaseLoading } = useSupabaseData();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const { openSupport } = useSupport();

  const fetchInvestments = async () => {
    if (!profile) return;
    try {
      const data = await getInvestments(profile.id);
      setInvestments(data || []);
    } catch (err) {
      console.error('Failed to fetch investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [profile]);

  const navigate = useNavigate();
  const handleInvestClick = (plan) => {
    navigate('/deposit');
  };

  const handleComplete = () => {
    fetchInvestments();
    if (refreshData) refreshData();
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto py-8 md:py-24 px-4 md:px-8 space-y-12 md:space-y-16">
        
        {/* INSTITUTIONAL HUD */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 px-4 md:px-0">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Investments</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Active</span>
                 </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">Investment <span className="text-primary italic">Plans</span></h1>
           </div>
           <p className="text-zinc-500 text-lg max-w-2xl font-medium leading-relaxed uppercase tracking-tight">Deploy sovereign capital into verified institutional-grade managed strategies with multi-sig clearance.</p>
           
           <div className="flex flex-wrap gap-6 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none p-8 citadel-card bg-primary/5 border-primary/10 min-w-[320px] relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform"></div>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Managed Liquidity</span>
                 <div className="flex items-baseline gap-4 relative z-10">
                    <span className="text-3xl font-black text-white tracking-tighter leading-none">{formatPrice(investments?.reduce((a,b) => a + parseFloat(b.amount), 0) || 0)}</span>
                    <div className="flex items-center gap-1 text-success">
                       <span className="material-symbols-outlined text-xs font-black">verified</span>
                       <span className="text-[10px] font-black tracking-widest uppercase">Secured</span>
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* STRATEGY GRID */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Verified Allocation Channels</h2>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={{
               hidden: { opacity: 0 },
               visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.1 }
               }
             }}
             className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-4 md:px-0"
           >
             {INVESTMENT_PLANS.map((plan) => (
               <PlanCard 
                 key={plan.id} 
                 plan={plan} 
                 onInvest={() => handleInvestClick(plan)}
                 onSupport={() => openSupport(plan)}
                 isRecommended={plan.recommended}
               />
             ))}
           </motion.div>
        </div>

        {/* IMMUTABLE SETTLEMENT DASHBOARD */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-16 md:pt-24 border-t border-white/5"
        >
           <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Active <span className="text-primary italic">Investments</span></h2>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Track your earnings in real-time</p>
               </div>
               <div className="flex gap-6 p-4 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-xl">
                  <div className="text-right px-4 border-r border-white/10">
                     <span className="text-[9px] text-zinc-700 font-black uppercase block mb-1">Status</span>
                     <span className="text-xs font-black text-white uppercase tracking-widest">Running</span>
                  </div>
                  <div className="text-right px-4">
                     <span className="text-[9px] text-zinc-700 font-black uppercase block mb-1">Strategy</span>
                     <span className="text-xs font-black text-success uppercase tracking-widest">Optimized</span>
                  </div>
               </div>
           </header>
           
           <Card className="p-0 citadel-card shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden" glass glow>
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                   <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/5 rounded-full"></div>
                      <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(252,213,53,0.3)]"></div>
                   </div>
                </div>
              ) : (
                <InvestmentDashboard investments={investments} />
              )}
           </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedPlan && (
          <InvestmentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            plan={selectedPlan}
            profile={profile}
            onComplete={handleComplete}
            refreshData={refreshData}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Investments;
