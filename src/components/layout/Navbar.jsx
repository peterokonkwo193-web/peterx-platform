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
    <nav className={cn("bg-background/80 backdrop-blur-3xl border-b border-white/5 fixed top-0 w-full h-20 z-50 px-6 md:px-12 flex items-center justify-between", className)}>
      <div className="flex items-center gap-10">
        <Link to="/" className="flex flex-col group">
          <span className="font-display text-2xl text-on-background tracking-tighter">
            Equity Citadel
          </span>
          <span className="font-label-caps text-[8px] text-primary tracking-[0.4em] uppercase -mt-1">Institutional</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[9px] font-bold text-success uppercase tracking-widest font-mono">Protocol Mainnet: Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Global Currency Switcher - Hidden on small mobile */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currency.code}</span>
            <span className="material-symbols-outlined text-sm text-zinc-500 group-hover:text-white transition-colors">language</span>
          </button>
          
          <AnimatePresence>
            {isCurrencyOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl py-2 shadow-2xl z-[60] flex flex-col max-h-[400px]">
                <div className="px-4 py-2 border-b border-white/5 space-y-2">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol Currency</span>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">search</span>
                    <input 
                      type="text" 
                      placeholder="Search currency..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {filteredCurrencies.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-zinc-500">No currencies found</div>
                  ) : (
                    filteredCurrencies.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => {
                          setCurrency(c);
                          setIsCurrencyOpen(false);
                          setCurrencySearch('');
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs transition-colors flex justify-between items-center",
                          currency.code === c.code ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-[10px] opacity-50">{c.symbol}</span>
                      </button>
                    ))
                  )}
                </div>
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
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="font-label-caps text-xs text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link to="/signup">
              <Button variant="primary" className="py-2 px-6 text-[10px]">Register</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-6 mr-6 border-r border-white/10 pr-8">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">Balance</span>
                <span className="text-sm font-bold text-zinc-200">
                  {formatPrice(profile?.usd_balance || 0)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group relative">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block truncate max-w-[100px]">{profile?.full_name || 'Trader'}</span>
                <span className={cn("text-[10px] uppercase tracking-widest font-black", profile?.is_premium ? "text-pink-200" : "text-zinc-500")}>
                  {profile?.is_premium ? 'Premium' : 'Standard'}
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
              </div>

              {/* Dropdown Menu (Simplified) */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-[60]">
                <Link to="/dashboard" className="block px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5">Dashboard</Link>
                {(profile?.is_admin || user?.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') && (
                  <Link to="/admin" className="block px-4 py-2 text-xs text-primary font-bold hover:bg-primary/5">Admin Terminal</Link>
                )}
                <Link to="/settings" className="block px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white"
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
                  {(profile?.is_admin || user?.id === '8d24918f-b493-4549-951e-1f85b0b97fe5') && (
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
