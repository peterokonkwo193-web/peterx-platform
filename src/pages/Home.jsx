import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Navbar from '../components/layout/Navbar';
import DesktopBar from '../components/layout/DesktopBar';
import InvestmentPlans from '../components/landing/InvestmentPlans';
import { useSupport } from '../context/SupportContext';
import { useLivePrices } from '../hooks/useLivePrices';
import { useCurrency } from '../context/CurrencyContext';
import CandlestickChart from '../components/CandlestickChart';
import { cn } from '../utils/cn';

const Home = () => {
  const { prices } = useLivePrices();
  const { formatPrice } = useCurrency();
  const [activities, setActivities] = useState([]);
  const { openSupport } = useSupport();

  // Generate live activities
  useEffect(() => {
    const assets = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC'];
    const actions = ['New Investment:', 'Institutional Withdrawal:', 'Tier 4 Verification:'];
    
    const interval = setInterval(() => {
      const isVerification = Math.random() > 0.8;
      const amount = formatPrice(Math.random() * 5000000 + 10000);
      const asset = assets[Math.floor(Math.random() * assets.length)];
      
      let text = '';
      if (isVerification) {
        text = `New Verification: Tier ${Math.floor(Math.random() * 2) + 3} Approved`;
      } else {
        const action = actions[Math.floor(Math.random() * 2)];
        text = `${action} ${amount} into ${asset} Vault`;
      }

      setActivities(prev => {
        const newActivities = [{ id: Date.now(), text }, ...prev].slice(0, 10);
        return newActivities;
      });
    }, 3500);

    // Initial activities
    setActivities([
      { id: 1, text: `New Investment: ${formatPrice(1250000)} into BTC Vault` },
      { id: 2, text: 'Tier 4 Verification: Approved' },
      { id: 3, text: `Institutional Withdrawal: ${formatPrice(450000)} from ETH Pool` },
      { id: 4, text: `New Investment: ${formatPrice(8400000)} into SOL Vault` }
    ]);

    return () => clearInterval(interval);
  }, []);

  // Generate fake candlestick data for the preview chart
  const mockChartData = React.useMemo(() => {
    const data = [];
    let basePrice = 65000;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 100; i >= 0; i--) {
      const open = basePrice + (Math.random() - 0.5) * 500;
      const close = open + (Math.random() - 0.5) * 1000;
      const high = Math.max(open, close) + Math.random() * 300;
      const low = Math.min(open, close) - Math.random() * 300;
      data.push({
        time: now - i * 3600,
        open,
        high,
        low,
        close,
        value: Math.random() * 1000000 // For histogram
      });
      basePrice = close;
    }
    return data;
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans">
      <DesktopBar />
      <Navbar className="!top-8" />
      
      {/* LIVE MARKET TICKER */}
      <div className="fixed top-28 w-full bg-black/40 backdrop-blur-xl border-b border-white/5 py-3 z-40 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee flex gap-12 items-center px-4">
          {prices && Object.entries(prices).map(([id, p], idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-black text-[9px] text-zinc-500 uppercase tracking-widest">{id.slice(0, 4)}</span>
              <span className={cn("text-[11px] font-mono font-bold", p.usd_24h_change >= 0 ? "text-success" : "text-error")}>
                {formatPrice(p.usd)}
              </span>
              <span className={cn("text-[9px] font-black", p.usd_24h_change >= 0 ? "text-success/80" : "text-error/80")}>
                {p.usd_24h_change >= 0 ? '+' : ''}{parseFloat(p.usd_24h_change).toFixed(2)}%
              </span>
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {prices && Object.entries(prices).map(([id, p], idx) => (
             <div key={`dup-${idx}`} className="flex items-center gap-3">
              <span className="font-black text-[9px] text-zinc-500 uppercase tracking-widest">{id.slice(0, 4)}</span>
              <span className={cn("text-[11px] font-mono font-bold", p.usd_24h_change >= 0 ? "text-success" : "text-error")}>
                {formatPrice(p.usd)}
              </span>
              <span className={cn("text-[9px] font-black", p.usd_24h_change >= 0 ? "text-success/80" : "text-error/80")}>
                {p.usd_24h_change >= 0 ? '+' : ''}{parseFloat(p.usd_24h_change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="relative pt-32 md:pt-48">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[1000px] h-[300px] md:h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-6xl space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-xl mb-6 shadow-2xl">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(252,213,53,0.5)]"></span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Platform Security Level 4 Active</span>
            </div>
            
            <h1 className="text-[40px] sm:text-[60px] md:text-[110px] font-black leading-[0.95] tracking-tighter text-white">
               Trade with the <span className="text-primary">Best.</span><br/>
               Profit with <span className="text-zinc-600">Ease.</span>
            </h1>
            
            <p className="text-base md:text-2xl text-zinc-400 max-w-4xl mx-auto font-medium leading-relaxed">
              Equity Citadel is the leading platform for digital asset trading. Secure, fast, and built for your growth.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button className="w-full px-14 py-6 text-xs font-black uppercase tracking-[0.3em] shadow-2xl bg-primary text-black hover:scale-105 transition-all">
                   Open Account
                </Button>
              </Link>
              <a href="#plans" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full px-14 py-6 text-xs font-black uppercase tracking-[0.3em] border-white/10 hover:bg-white/5 transition-all">
                   View Plans
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Platform Stats Board */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-32 w-full max-w-7xl"
          >
             <Card className="p-1 citadel-card rounded-[40px] shadow-2xl relative overflow-hidden" glass>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5 p-8 md:p-12">
                   <StatItem label="Liquidity" val="$14.2B+" sub="Global Pool" />
                   <StatItem label="Fast Execution" val="0.02ms" sub="Ultra-Fast" />
                   <StatItem label="Uptime" val="99.99%" sub="Always Online" />
                   <StatItem label="Lowest Fees" val="0.005%" sub="Minimal" />
                </div>
             </Card>
          </motion.div>
        </section>

        {/* PROTOCOL JOURNEY */}
        <section className="py-48 px-6 relative">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-32 space-y-4">
                 <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em]">The Settlement Protocol</span>
                 <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Onboarding Your Assets</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
                 <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent hidden md:block -z-10"></div>
                 
                  <StepCard 
                     number="01" title="Register" desc="Create your account with secure encryption." icon="person_add" 
                  />
                  <StepCard 
                     number="02" title="Verify" desc="Verify your identity to unlock all features." icon="verified_user" 
                  />
                  <StepCard 
                     number="03" title="Fund" desc="Deposit assets instantly via our secure gateway." icon="account_balance_wallet" 
                  />
                  <StepCard 
                     number="04" title="Trade" desc="Start trading with precision and grow your funds." icon="terminal" 
                  />
              </div>
           </div>
        </section>

        {/* ALLOCATION PLANS */}
        <section id="plans" className="pb-48">
           <InvestmentPlans onSupport={openSupport} />
        </section>

        {/* PROFIT INFRASTRUCTURE */}
        <section className="py-48 px-6 bg-white/[0.01] border-y border-white/5">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                 <div className="space-y-6">
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">High-DPI Infrastructure</span>
                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">Built for <span className="text-primary italic">Yield.</span></h2>
                 </div>
                 
                 <div className="space-y-10">
                     <BenefitItem icon="trending_up" title="Fast Trading" desc="Trade at high speed with our advanced trading engine." />
                     <BenefitItem icon="token" title="Passive Income" desc="Earn up to 15.4% APR on your assets through staking." />
                     <BenefitItem icon="hub" title="Easy Transfers" desc="Move funds across global networks instantly with zero risk." />
                  </div>
 
                  <Link to="/signup" className="inline-block pt-8">
                     <Button size="lg" className="px-14 py-6 text-xs font-black uppercase tracking-[0.3em] shadow-2xl bg-primary text-black hover:scale-105 transition-all">
                        Get Started
                     </Button>
                  </Link>
              </motion.div>

              <div className="relative">
                 <div className="absolute inset-0 bg-primary/10 blur-[150px] -z-10 rounded-full"></div>
                 <Card className="citadel-card p-1 rounded-[40px] shadow-2xl overflow-hidden group h-[600px]" glass>
                    <div className="h-full pointer-events-none p-8 pb-0">
                       <CandlestickChart data={mockChartData} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-12 left-12 p-8 bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl max-w-sm pointer-events-none shadow-2xl">
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Senior Portfolio Manager</p>
                        </div>
                  </Card>
               </div>
            </div>
         </section>
 
         {/* NETWORK ACTIVITY */}
         <section className="py-24 md:py-32 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
                  <div>
                     <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Protocol Live Feed</h3>
                     <p className="text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Real-time platform activity logs</p>
                  </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-success/5 border border-success/20 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_var(--color-success)]"></span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-success">Synchronized</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AnimatePresence>
                    {activities.slice(0, 6).map((activity, i) => (
                       <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, y: -20, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-xl hover:bg-white/[0.04] transition-all"
                       >
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                             activity.text.includes('Investment') ? 'bg-success/5 text-success border-success/20' :
                             activity.text.includes('Withdrawal') ? 'bg-error/5 text-error border-error/20' :
                             'bg-primary/5 text-primary border-primary/20'
                          )}>
                             <span className="material-symbols-outlined text-sm">
                                {activity.text.includes('Investment') ? 'south_west' :
                                 activity.text.includes('Withdrawal') ? 'north_east' :
                                 'verified_user'}
                             </span>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">{activity.text.split(':')[0]}</p>
                             <p className="text-[11px] font-mono font-bold text-zinc-500 mt-0.5">{activity.text.split(':')[1]}</p>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-48 px-6 relative text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] -z-10 rounded-full"></div>
           <Card className="max-w-5xl mx-auto p-20 md:p-32 rounded-[60px] citadel-card relative overflow-hidden shadow-2xl" glass>
              <div className="relative z-10 space-y-10">
                 <h2 className="text-[56px] md:text-[84px] font-black text-white tracking-tighter leading-[0.9]">The Future of Finance is <span className="text-primary italic">Here.</span></h2>
                 <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">Join 1,400+ elite traders already leveraging the Equity Citadel infrastructure for capital growth.</p>
                 <div className="pt-10">
                    <Link to="/signup">
                       <Button className="px-16 py-7 text-xs font-black uppercase tracking-[0.4em] shadow-2xl bg-primary text-black hover:scale-110 transition-all">Create Account Now</Button>
                    </Link>
                 </div>
                 <div className="flex justify-center items-center gap-8 pt-8">
                    {['Fully Compliant', 'Multi-Sig Custody', '24/7 VIP Support'].map(tag => (
                       <span key={tag} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{tag}</span>
                    ))}
                 </div>
              </div>
           </Card>
        </section>
      </main>

      <footer className="bg-black/40 py-32 px-12 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="md:col-span-2 space-y-8">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">shield</span>
               </div>
               <span className="text-2xl font-black tracking-tighter text-white uppercase">EQUITY CITADEL</span>
             </div>
             <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md">Redefining the architecture of digital wealth. Our multi-layer infrastructure provides the security, speed, and liquidity required for the modern trading era.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 md:col-span-2">
             <FooterColumn title="Protocol" links={['Liquidity', 'Yield Terminal', 'Audit Logs', 'Clearance']} />
             <FooterColumn title="Company" links={['About', 'Security', 'Regulatory', 'Support']} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          <p>© 2024 Equity Citadel Associates. All rights reserved.</p>
          <div className="flex items-center gap-10">
            <a href="#" className="hover:text-primary transition-all">Privacy</a>
            <a href="#" className="hover:text-primary transition-all">Terms</a>
            <a href="#" className="hover:text-primary transition-all">Risk</a>
            <Link to="/admin" className="text-primary hover:text-white transition-all border-l border-white/10 pl-10">Admin Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ label, val, sub }) => (
  <div className="flex flex-col items-center text-center px-6">
     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">{label}</span>
     <p className="text-5xl font-black text-white tracking-tighter mb-2">{val}</p>
     <p className="text-[10px] font-black text-primary uppercase tracking-widest">{sub}</p>
  </div>
);

const StepCard = ({ number, title, desc, icon }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="relative p-10 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group backdrop-blur-xl shadow-2xl"
  >
     <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
     </div>
     <span className="text-5xl font-black text-white/5 absolute top-10 right-10 group-hover:text-primary/10 transition-colors">{number}</span>
     <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">{title}</h3>
     <p className="text-sm text-zinc-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const BenefitItem = ({ icon, title, desc }) => (
  <div className="flex gap-8 items-start group">
     <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-all shadow-xl">
        <span className="material-symbols-outlined text-zinc-500 group-hover:text-primary transition-colors text-3xl">{icon}</span>
     </div>
     <div className="space-y-2">
        <h3 className="text-xl font-black text-white tracking-tight uppercase">{title}</h3>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div className="space-y-8">
    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">{title}</h4>
    <ul className="space-y-4 text-[11px] font-black text-zinc-600 uppercase tracking-widest">
      {links.map(link => (
        <li key={link}><a className="hover:text-primary transition-all block" href="#">{link}</a></li>
      ))}
    </ul>
  </div>
);

export default Home;
