import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { signOut } from '../../lib/auth';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { cn } from '../../utils/cn';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useSupabaseData();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sections = [
    {
      title: 'Exchange',
      items: [
        { name: 'Terminal', path: '/trade', icon: 'terminal' },
        { name: 'Markets', path: '/markets', icon: 'monitoring' },
      ]
    },
    {
      title: 'Institutional',
      items: [
        { name: 'Vault', path: '/wallet', icon: 'account_balance_wallet' },
        { name: 'Protocol Staking', path: '/staking', icon: 'token' },
        { name: 'Investment Plans', path: '/investments', icon: 'monitoring' },
        { name: 'Liquidity Pool', path: '/liquidity', icon: 'water_drop' },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { name: 'Settings', path: '/settings', icon: 'settings' },
        { name: 'Verification', path: '/settings?tab=verification', icon: 'verified_user' },
      ]
    }
  ];

  if (profile?.is_admin) {
    sections.push({
      title: 'Admin Control',
      items: [
        { name: 'Dashboard', path: '/admin', icon: 'admin_panel_settings' },
      ]
    });
  }

  return (
    <aside className="bg-black/60 backdrop-blur-3xl fixed left-0 top-20 h-[calc(100vh-80px)] w-72 border-r border-white/5 flex flex-col pt-10 z-40 hidden lg:flex custom-scrollbar overflow-y-auto shadow-[20px_0_100px_rgba(0,0,0,0.5)]">
      <div className="flex-1 space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="px-6">
            <h3 className="px-4 text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-4">{section.title}</h3>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3 rounded-2xl font-sans text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 group relative overflow-hidden',
                      isActive 
                        ? 'bg-primary/10 text-primary shadow-2xl ring-1 ring-primary/20' 
                        : 'text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-200'
                    )}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(252,213,53,0.8)]"></div>}
                    <span className={cn(
                      "material-symbols-outlined text-xl transition-all duration-500",
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(252,213,53,0.4)]" : "text-zinc-700 group-hover:text-zinc-300"
                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 mt-auto space-y-8 border-t border-white/5 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-[80px] font-black text-white/[0.01] pointer-events-none select-none tracking-tighter">OS</div>
        
        <div className="p-6 rounded-[28px] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/10 relative z-10 group cursor-default">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(252,213,53,0.6)]"></span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tier 4 Verified</span>
             </div>
             <span className="text-[10px] text-zinc-600 font-bold uppercase">92% Health</span>
          </div>
          <div className="h-1.5 bg-black rounded-full mb-4 overflow-hidden border border-white/5 p-[1px] shadow-inner">
             <div className="h-full w-4/5 bg-primary rounded-full shadow-[0_0_15px_rgba(252,213,53,0.5)] transition-all duration-1000 group-hover:w-full"></div>
          </div>
          <p className="text-[10px] text-zinc-600 font-black leading-tight uppercase tracking-widest">Latency: <span className="text-zinc-200">12ms</span></p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 font-sans text-[11px] font-black tracking-[0.4em] uppercase text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-500 rounded-2xl border border-transparent hover:border-rose-500/20 group/logout"
        >
          <span className="material-symbols-outlined text-xl transition-transform group-hover/logout:-translate-x-1">logout</span>
          Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
