import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import AvatarSelector from '../dashboard/AvatarSelector';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useCurrency } from '../../context/CurrencyContext';
import { signOut } from '../../lib/auth';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const { user, profile } = useSupabaseData();
  const { currency, setCurrency, currencies } = useCurrency();
  const navigate = useNavigate();
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-background/80 backdrop-blur-3xl border-b border-white/5 fixed top-0 w-full h-20 z-50 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex flex-col group">
          <span className="font-display text-2xl text-on-background tracking-tighter">
            Equity Citadel Associates
          </span>
          <span className="font-label-caps text-[8px] text-primary tracking-[0.4em] uppercase -mt-1">Institutional</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[9px] font-bold text-success uppercase tracking-widest font-mono">Protocol Mainnet: Active</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Global Currency Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currency.code}</span>
            <span className="material-symbols-outlined text-sm text-zinc-500 group-hover:text-white transition-colors">language</span>
          </button>
          
          <AnimatePresence>
            {isCurrencyOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl py-2 shadow-2xl z-[60] overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol Currency</span>
                </div>
                {currencies.map(c => (
                  <button 
                    key={c.code}
                    onClick={() => {
                      setCurrency(c);
                      setIsCurrencyOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs transition-colors flex justify-between items-center",
                      currency.code === c.code ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="font-mono text-[10px] opacity-50">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden xl:flex items-center gap-4 mr-4">
           <Link to="/wallet" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">account_balance_wallet</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Vault</span>
           </Link>
        </div>
        {!user ? (
          <div className="flex items-center gap-6">
            <Link to="/login" className="font-label-caps text-xs text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link to="/signup">
              <Button variant="primary" className="py-2 px-6 text-[10px]">Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 mr-6 border-r border-white/10 pr-8">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">Balance</span>
                <span className="text-sm font-bold text-zinc-200">
                  {currency.symbol}{ ((profile?.usd_balance || 0) * currency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group relative">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block">{profile?.full_name || 'Trader'}</span>
                <span className={cn("text-[10px] uppercase tracking-widest font-black", profile?.is_premium ? "text-pink-200" : "text-zinc-500")}>
                  {profile?.is_premium ? 'Premium Protocol' : 'Standard Tier'}
                </span>
              </div>
              <div 
                className="w-10 h-10 rounded-full border-2 border-pink-200/20 hover:border-pink-200/50 transition-all p-0.5 cursor-pointer"
                onClick={() => setIsAvatarSelectorOpen(true)}
              >
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full bg-zinc-800" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-zinc-950">
                  <span className="material-symbols-outlined text-[10px] text-black font-bold">edit</span>
                </div>
              </div>

              {/* Dropdown Menu (Simplified) */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-[60]">
                <Link to="/settings" className="block px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10">Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AvatarSelector 
        profile={profile} 
        isOpen={isAvatarSelectorOpen} 
        onClose={() => setIsAvatarSelectorOpen(false)}
        onUpdate={(newAvatar) => {
          // Real-time listener in useSupabaseData will handle the update
          // but we can provide instant feedback here if needed.
        }}
      />
    </nav>
  );
};

export default Navbar;
