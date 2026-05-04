import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const OnboardingTour = ({ profile }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || 'Trader';
  const isExpert = profile?.experience_level === 'Expert';

  const TOUR_STEPS = [
    {
      target: 'header-welcome',
      title: `Hi ${firstName}! Welcome to Equity Citadel Associates`,
      content: isExpert 
        ? "We've optimized your terminal for advanced institutional-grade trading. Let's verify your layout."
        : "Welcome to the future of finance! We'll help you navigate your first digital asset trades.",
      position: 'bottom'
    },
    {
      target: 'balance-card',
      title: 'Your Liquidity',
      content: isExpert
        ? "Monitor your cross-protocol value and PNL metrics in real-time."
        : "This is your vault. You can see how much money you have and how it grows every day.",
      position: 'bottom'
    },
    {
      target: 'deposit-btn',
      title: 'Quick Funding',
      content: "Ready to move capital? Securely deposit fiat or crypto into your institutional vault.",
      position: 'left'
    },
    {
      target: 'live-chart',
      title: 'Professional Charting',
      content: isExpert
        ? "Our high-performance candlestick engine supports technical analysis with sub-second price feeds."
        : "This chart shows you the live price. Green means the price is going up, red means it is going down!",
      position: 'top'
    },
    {
      target: 'market-search',
      title: 'Market Explorer',
      content: "Instantly search and analyze over 10,000+ assets across the global ecosystem.",
      position: 'left'
    }
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`Equity Citadel Associates_tour_completed_${profile?.id}`);
    if (!hasSeenTour && profile) {
      setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 1500);
    }
  }, [profile]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(`Equity Citadel Associates_tour_completed_${profile?.id}`, 'true');
  };

  if (!isVisible || currentStep === -1) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Backdrop Highlight Effect */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
          onClick={handleComplete}
        />

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute z-[110] w-full max-w-sm p-6 bg-surface border border-primary/30 rounded-2xl shadow-2xl pointer-events-auto"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <button onClick={handleComplete} className="text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-secondary text-sm leading-relaxed mb-6">
            {step.content}
          </p>

          <div className="flex gap-3">
            <Button 
              variant="primary" 
              className="flex-1 py-2 text-xs font-bold"
              onClick={handleNext}
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Start Trading' : 'Next Step'}
            </Button>
            {currentStep < TOUR_STEPS.length - 1 && (
              <Button 
                variant="ghost" 
                className="text-xs"
                onClick={handleComplete}
              >
                Skip
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
