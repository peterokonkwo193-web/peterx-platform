import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import PlanCard from '../components/investments/PlanCard';
import InvestmentModal from '../components/investments/InvestmentModal';
import InvestmentDashboard from '../components/investments/InvestmentDashboard';
import InvestmentAIAssistant from '../components/investments/InvestmentAIAssistant';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getInvestments } from '../lib/db';
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
  const { profile, loading: supabaseLoading } = useSupabaseData();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleComplete = () => {
    fetchInvestments();
    // Refresh page data if needed or rely on local state
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-[1600px] mx-auto pb-20 px-4 md:px-8">
        
        {/* Header */}
        <header className="flex flex-col gap-4 pt-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Institutional Alpha
             </div>
             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Protocol Yield v4.2</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none"
          >
            Capital <span className="text-primary italic">Allocation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-zinc-500 max-w-2xl font-medium leading-relaxed"
          >
            Deploy assets into verified institutional-grade strategies. Our secondary liquidity pool ensures maximum capital efficiency with zero-latency execution.
          </motion.p>
        </header>

        {/* Plan Grid */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
        >
          {INVESTMENT_PLANS.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onInvest={handleInvestClick}
              isRecommended={plan.recommended}
            />
          ))}
        </motion.div>

        {/* Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-20 border-t border-white/5"
        >
           <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Protocol Dashboard</h2>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2">Real-time settlement monitoring</p>
              </div>
              <div className="flex gap-4">
                 <div className="text-right">
                    <span className="text-[9px] text-zinc-600 font-black uppercase block">Cluster Health</span>
                    <span className="text-xs font-black text-success uppercase">Optimal</span>
                 </div>
              </div>
           </header>
           
           {loading ? (
             <div className="h-64 flex items-center justify-center">
                <div className="relative">
                   <div className="w-12 h-12 border-4 border-primary/10 rounded-full"></div>
                   <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
             </div>
           ) : (
             <InvestmentDashboard investments={investments} />
           )}
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
          />
        )}
      </AnimatePresence>

      <InvestmentAIAssistant />
    </DashboardLayout>
  );
};

export default Investments;
