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
        { name: 'Spot Trading', path: '/trade?type=spot', icon: 'swap_horiz' },
        { name: 'Futures', path: '/trade?type=futures', icon: 'trending_up' },
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
    <aside className="bg-zinc-950/60 backdrop-blur-3xl fixed left-0 top-20 h-[calc(100vh-80px)] w-64 border-r border-white/5 flex flex-col pt-8 z-40 hidden lg:flex custom-scrollbar overflow-y-auto">
      <div className="flex-1 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="px-4">
            <h3 className="px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-300 group',
                      isActive 
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(252,213,53,0.05)]' 
                        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                    )}
                  >
                    <span className={cn(
                      "material-symbols-outlined text-[18px] transition-all",
                      isActive ? "text-primary" : "text-zinc-600 group-hover:text-zinc-300"
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

      <div className="p-6 mt-auto space-y-6 border-t border-white/5 bg-white/[0.01]">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Protocol Tier 4</span>
             <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          </div>
          <div className="h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
             <div className="h-full w-4/5 bg-primary rounded-full shadow-[0_0_12px_rgba(252,213,53,0.4)]"></div>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold leading-tight">Institutional High-Frequency API: <span className="text-zinc-200">Enabled</span></p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 font-sans text-[11px] font-black tracking-widest uppercase text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 rounded-xl border border-transparent hover:border-rose-500/20"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
