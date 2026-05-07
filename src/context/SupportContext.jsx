import React, { createContext, useContext, useState } from 'react';
import SupportChat from '../components/investments/SupportChat';

const SupportContext = createContext();

export const SupportProvider = ({ children }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportPlan, setSupportPlan] = useState(null);

  const openSupport = (plan = null) => {
    setSupportPlan(plan);
    setIsSupportOpen(true);
  };

  const closeSupport = () => {
    setIsSupportOpen(false);
    setSupportPlan(null);
  };

  return (
    <SupportContext.Provider value={{ openSupport }}>
      {children}
      
      {/* Global Floating Support Button */}
      <div className="fixed bottom-28 right-6 md:bottom-8 md:right-8 z-[1000]">
        <button 
          onClick={() => openSupport()}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-black shadow-[0_0_30px_rgba(196,164,124,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Institutional Support"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">contact_support</span>
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Support</span>
          </div>
        </button>
      </div>

      <SupportChat 
        isOpen={isSupportOpen} 
        onClose={closeSupport} 
        initialPlan={supportPlan} 
      />
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
