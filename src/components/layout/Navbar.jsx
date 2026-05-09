import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import AvatarSelector from '../dashboard/AvatarSelector';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useCurrency } from '../../context/CurrencyContext';
import { signOut } from '../../lib/auth';
import { cn } from '../../utils/cn';

const Navbar = ({ className }) => {
  const { user, profile } = useSupabaseData();
  const { currency, setCurrency, currencies, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
    <div className="fixed top-0 w-full h-8 bg-[#05070a] border-b border-white/5 z-[60] hidden md:flex items-center justify-between px-6 overflow-hidden select-none">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Load: <span className="text-primary">12.4%</span></span>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Latency: <span className="text-white">24ms</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Node: <span className="text-zinc-300">Active</span></span>
        </div>
    </div>
    <nav className={cn("bg-black/60 backdrop-blur-3xl border-b border-white/5 fixed top-0 md:top-8 w-full h-20 z-50 px-8 lg:px-12 flex items-center justify-between shadow-[0_10px_50px_rgba(0,0,0,0.5)]", className)}>
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-12">
        <Link to="/" className="flex flex-col group">
          <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">Equity Citadel</span>
          <div className="hidden md:flex items-center gap-2 mt-1">
             <span className="text-[8px] text-primary font-black tracking-[0.6em] uppercase">Trading Platform</span>
             <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
             <span className="text-[8px] text-zinc-600 font-black tracking-[0.2em] uppercase">Live</span>
          </div>
        </Link>
        
        <div className="hidden xl:flex items-center gap-4 px-5 py-2 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
           <div className="relative">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping"></div>
           </div>
           <span className="text-[10px] font-black text-success uppercase tracking-[0.3em]">Mainnet Gateway Active</span>
        </div>
      </div>

      {/* Center: Global Command Search */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-12 relative group">
        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-lg group-focus-within:text-primary transition-all group-focus-within:scale-110">command</span>
        <input 
          type="text" 
          placeholder="Search for assets or features..." 
          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-20 text-[11px] font-black tracking-widest text-white uppercase placeholder:text-zinc-800 outline-none focus:border-primary/40 focus:bg-black/60 transition-all shadow-inner focus:shadow-[0_0_30px_rgba(252,213,53,0.05)]"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
           <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black text-zinc-700 border border-white/5 uppercase tracking-tighter">Ctrl</span>
           <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black text-zinc-700 border border-white/5 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Right: User & Actions */}
      <div className="flex items-center gap-8">
        <div className="hidden sm:flex items-center gap-6 border-r border-white/5 pr-8">
           <div className="text-right space-y-1">
              <span className="text-[9px] text-zinc-700 block font-black uppercase tracking-[0.4em]">Balance</span>
              <div className="flex items-center gap-2 justify-end">
                 <span className="text-base font-black text-white tracking-tighter leading-none">{formatPrice(profile?.usd_balance || 0)}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
              </div>
           </div>
           
           <button 
             onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
             className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-primary/30 transition-all group shadow-inner"
           >
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">{currency.code}</span>
              <span className="material-symbols-outlined text-lg text-zinc-700 group-hover:text-white transition-all group-hover:rotate-180">expand_more</span>
           </button>
        </div>

        {!user ? (
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-[11px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.4em] transition-all">Login</Link>
            <Link to="/signup">
              <Button variant="primary" className="py-3 px-8 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105">Sign Up</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-5 relative group">
             <div className="text-right hidden md:block space-y-0.5">
                <span className="text-sm font-black text-white block tracking-tighter truncate max-w-[140px] uppercase">{profile?.full_name || 'Trader_Alpha'}</span>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-1 h-1 rounded-full bg-success"></div>
                   <span className="text-[9px] text-primary font-black uppercase tracking-[0.4em] opacity-80">Member</span>
                </div>
             </div>
             
             <div 
                className="w-12 h-12 rounded-[20px] bg-zinc-950 border border-white/10 p-0.5 cursor-pointer hover:border-primary transition-all overflow-hidden shadow-2xl relative group/avatar"
                onClick={() => setIsAvatarSelectorOpen(true)}
             >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10"></div>
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="" 
                  className="w-full h-full rounded-[18px] object-cover relative z-0 transition-transform group-hover/avatar:scale-110"
                />
             </div>

             {/* Profile Menu Dropdown */}
             <div className="absolute top-full right-0 mt-6 w-64 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[32px] py-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-[100] translate-y-4 group-hover:translate-y-0">
                <div className="px-8 py-4 border-b border-white/5 mb-4">
                   <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] mb-2">Protocol Identity</p>
                   <p className="text-[11px] font-black text-white truncate lowercase tracking-tighter">{user.email}</p>
                </div>
                <div className="px-3 space-y-1">
                   <Link to="/dashboard" className="flex items-center gap-4 px-5 py-3.5 text-[11px] font-black text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-2xl uppercase tracking-widest group/item">
                      <span className="material-symbols-outlined text-xl transition-transform group-hover/item:scale-110">grid_view</span> Dashboard
                   </Link>
                   {(profile?.is_admin || user?.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user?.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') && (
                     <Link to="/admin" className="flex items-center gap-4 px-5 py-3.5 text-[11px] text-primary font-black hover:bg-primary/5 transition-all rounded-2xl uppercase tracking-widest group/item">
                        <span className="material-symbols-outlined text-xl transition-transform group-hover/item:scale-110">shield_person</span> Admin Control
                     </Link>
                   )}
                   <Link to="/settings" className="flex items-center gap-4 px-5 py-3.5 text-[11px] font-black text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-2xl uppercase tracking-widest group/item">
                      <span className="material-symbols-outlined text-xl transition-transform group-hover/item:scale-110">settings_suggest</span> Management
                   </Link>
                   <div className="h-px bg-white/5 mx-5 my-4"></div>
                   <button onClick={handleLogout} className="flex items-center gap-4 w-full text-left px-5 py-3.5 text-[11px] font-black text-error hover:bg-error/5 transition-all rounded-2xl uppercase tracking-widest group/item">
                      <span className="material-symbols-outlined text-xl transition-transform group-hover/item:-translate-x-1">power_settings_new</span> Logout
                   </button>
                </div>
             </div>
          </div>
        )}

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-white transition-all hover:bg-white/10"
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-background border-b border-white/5 p-6 md:hidden z-40 shadow-2xl space-y-6"
          >
            <div className="space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">search</span>
                <input 
                  type="text" 
                  placeholder="Search currency..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCurrencies.length === 0 ? (
                  <div className="col-span-2 py-4 text-center text-xs text-zinc-500">No currencies found</div>
                ) : (
                  filteredCurrencies.map(c => (
                    <button 
                      key={c.code}
                      onClick={() => {
                        setCurrency(c);
                        setIsMobileMenuOpen(false);
                        setCurrencySearch('');
                      }}
                      className={cn(
                        "flex flex-col p-3 rounded-xl border transition-all text-left",
                        currency.code === c.code ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-zinc-400"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{c.code}</span>
                      <span className="text-[9px] opacity-50 truncate w-full">{c.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 text-center text-xs font-bold text-zinc-400 border border-white/10 rounded-xl">Login</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 text-center text-xs font-bold bg-primary text-black rounded-xl">Register</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 px-4 text-xs font-bold text-zinc-200 bg-white/5 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">dashboard</span> Dashboard
                  </Link>
                  {(profile?.is_admin || user?.id === '830a672f-41cc-4b87-bb3c-494c7e63b379' || user?.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 px-4 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm">admin_panel_settings</span> Admin Terminal
                    </Link>
                  )}
                  <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 px-4 text-xs font-bold text-zinc-200 bg-white/5 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">account_balance_wallet</span> Vault
                  </Link>
                  <button onClick={handleLogout} className="w-full py-4 px-4 text-xs font-bold text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">logout</span> Terminate Session
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
