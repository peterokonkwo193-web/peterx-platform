import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DesktopBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'UTC'
  });

  return (
    <div className="fixed top-0 w-full h-8 bg-[#05070a] border-b border-white/5 z-[60] flex items-center justify-between px-6 overflow-hidden select-none">
      {/* Left: Node Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Institutional Node: <span className="text-zinc-300">HK-42</span></span>
        </div>
        <div className="h-3 w-px bg-white/10 hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Network Load: <span className="text-primary">12.4%</span></span>
        </div>
      </div>

      {/* Center: Global Metrics */}
      <div className="hidden lg:flex items-center gap-12">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">S&P 500</span>
          <span className="text-[9px] font-bold text-success font-mono">5,204.34 (+0.42%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">DXY</span>
          <span className="text-[9px] font-bold text-error font-mono">104.12 (-0.12%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">GOLD</span>
          <span className="text-[9px] font-bold text-primary font-mono">$2,342.10</span>
        </div>
      </div>

      {/* Right: Time & System */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">UTC</span>
          <span className="text-[10px] font-bold text-zinc-300 font-mono tracking-widest">{formattedTime}</span>
        </div>
        <div className="h-3 w-px bg-white/10"></div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">System:</span>
          <span className="text-[9px] font-black text-success uppercase tracking-widest">Operational</span>
        </div>
      </div>
    </div>
  );
};

export default DesktopBar;
