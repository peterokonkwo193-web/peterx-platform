import { Link, useLocation } from 'react-router-dom';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { cn } from '../../utils/cn';

const MobileNav = () => {
  const { user, profile, pendingAdminCount } = useSupabaseData();
  const location = useLocation();

  const isMasterAdmin = user?.email === 'equitycitadelassociates@gmail.com';

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'dashboard' },
    { name: 'Invest', path: '/investments', icon: 'monitoring' },
    { name: 'Vault', path: '/wallet', icon: 'account_balance_wallet' },
    ...(isMasterAdmin ? [{ name: 'Admin', path: '/admin', icon: 'admin_panel_settings', adminOnly: true }] : [])
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5 px-4 pt-3 pb-8 z-50 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="flex flex-col items-center gap-1.5 px-3 group"
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
              isActive ? "bg-primary text-black shadow-[0_0_15px_rgba(252,213,53,0.3)]" : "text-zinc-500 group-active:scale-90"
            )}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.adminOnly && pendingAdminCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-[8px] font-black text-white flex items-center justify-center rounded-full border border-black animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {pendingAdminCount}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest transition-colors",
              isActive ? "text-primary" : "text-zinc-600"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;
