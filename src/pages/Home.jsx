import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Navbar from '../components/layout/Navbar';
import { useLivePrices } from '../hooks/useLivePrices';
import CandlestickChart from '../components/CandlestickChart';
import { cn } from '../utils/cn';

const Home = () => {
  const { prices } = useLivePrices();
  const [activities, setActivities] = useState([]);

  // Generate live activities
  useEffect(() => {
    const assets = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC'];
    const actions = ['New Investment:', 'Institutional Withdrawal:', 'Tier 4 Verification:'];
    
    const interval = setInterval(() => {
      const isVerification = Math.random() > 0.8;
      const amount = (Math.random() * 5000000 + 10000).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
      { id: 1, text: 'New Investment: $1,250,000.00 into BTC Vault' },
      { id: 2, text: 'Tier 4 Verification: Approved' },
      { id: 3, text: 'Institutional Withdrawal: $450,000.00 from ETH Pool' },
      { id: 4, text: 'New Investment: $8,400,000.00 into SOL Vault' }
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
    <div className="relative min-h-screen bg-background text-on-background overflow-x-hidden font-body-md">
      <Navbar />
      
      {/* LIVE MARKET TICKER */}
      <div className="fixed top-20 w-full bg-surface/80 backdrop-blur-md border-b border-white/5 py-2 z-40 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee flex gap-12 items-center px-4">
          {prices && Object.entries(prices).map(([id, p], idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="font-bold text-xs text-zinc-300 uppercase">{id.slice(0, 4)}</span>
              <span className={cn("text-xs font-mono", p.usd_24h_change >= 0 ? "text-success" : "text-error")}>
                ${parseFloat(p.usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={cn("text-[10px]", p.usd_24h_change >= 0 ? "text-success/80" : "text-error/80")}>
                {p.usd_24h_change >= 0 ? '+' : ''}{parseFloat(p.usd_24h_change).toFixed(2)}%
              </span>
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {prices && Object.entries(prices).map(([id, p], idx) => (
             <div key={`dup-${idx}`} className="flex items-center gap-3">
              <span className="font-bold text-xs text-zinc-300 uppercase">{id.slice(0, 4)}</span>
              <span className={cn("text-xs font-mono", p.usd_24h_change >= 0 ? "text-success" : "text-error")}>
                ${parseFloat(p.usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={cn("text-[10px]", p.usd_24h_change >= 0 ? "text-success/80" : "text-error/80")}>
                {p.usd_24h_change >= 0 ? '+' : ''}{parseFloat(p.usd_24h_change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="relative pt-28">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-5xl space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-surface/50 border border-white/10 backdrop-blur-md mb-4 shadow-xl">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--color-primary)]"></span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Protocol Active</span>
            </div>
            
            <h1 className="text-[60px] md:text-[90px] font-black leading-[1.05] tracking-tight text-white">
               Trade with the <span className="text-primary italic">Elite.</span><br/>
               Profit with <span className="text-zinc-400">Precision.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed">
              Equity Citadel Associates is the world's premier institutional-grade broker. Access deep liquidity, extreme leverage, and zero-latency execution. Engineered for professional profitability.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Link to="/signup">
                <Button size="lg" className="px-12 py-6 text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(196,164,124,0.3)] hover:scale-105 transition-all bg-primary text-black hover:bg-primary-fixed">
                   Secure Your Seat
                </Button>
              </Link>
              <Link to="/trade">
                <Button size="lg" variant="outline" className="px-12 py-6 text-sm font-black uppercase tracking-[0.2em] border-outline hover:bg-surface-variant transition-all">
                   Explore Terminal
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Interactive Price Board */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 w-full max-w-6xl"
          >
            <Card className="p-1 border border-outline/50 bg-surface/30 rounded-[32px] shadow-2xl backdrop-blur-xl">
               <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline/50 p-8">
                  <StatItem label="Daily Volume" val="$14.2B+" sub="Institutional Grade" />
                  <StatItem label="Execution Time" val="0.02ms" sub="Ultra-Low Latency" />
                  <StatItem label="Active Liquidity" val="99.99%" sub="Uptime Guaranteed" />
                  <StatItem label="Protocol Fee" val="0.01%" sub="Industry Leading" />
               </div>
            </Card>
          </motion.div>
        </section>

        {/* 4-STEP PROTOCOL: THE ONBOARDING JOURNEY */}
        <section className="py-32 px-6 bg-surface/20 relative border-y border-outline/30">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24 space-y-4">
                 <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">The Onboarding Protocol</span>
                 <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Your Path to Elite Profit</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                 <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-outline to-transparent hidden md:block -z-10"></div>
                 
                 <StepCard 
                    number="01" title="Register" desc="Create your institutional vault account in 30 seconds with military-grade encryption." icon="person_add" 
                 />
                 <StepCard 
                    number="02" title="Verify" desc="Complete tier-4 verification to unlock deep liquidity and extreme futures access." icon="verified_user" 
                 />
                 <StepCard 
                    number="03" title="Fund" desc="Deposit assets instantly via our secure multi-sig gateway with zero fees." icon="account_balance_wallet" 
                 />
                 <StepCard 
                    number="04" title="Trade" desc="Execute professional strategies on the terminal with zero-latency precision." icon="terminal" 
                 />
              </div>
           </div>
        </section>

        {/* PROFIT ENGINE: LIVE CHART PREVIEW */}
        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                 <div className="space-y-4">
                    <span className="text-[11px] font-black text-secondary uppercase tracking-[0.4em]">Advanced Infrastructure</span>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">Built to Maximize Your <span className="text-primary italic">Yield.</span></h2>
                 </div>
                 
                 <div className="space-y-8">
                    <BenefitItem icon="trending_up" title="High-Frequency Engine" desc="Amplify your market exposure with our secure futures engine, designed for institutional high-frequency strategies." />
                    <BenefitItem icon="token" title="Real-Time Staking Rewards" desc="Earn up to 15.4% APR on your idle assets with our automated beacon-chain staking protocol." />
                    <BenefitItem icon="hub" title="Universal Liquidity" desc="One account, infinite access. Trade Spot, Futures, and Options across global markets." />
                 </div>

                 <Link to="/signup" className="inline-block">
                    <Button size="lg" className="px-10 py-5 font-black uppercase tracking-widest shadow-2xl bg-primary text-black hover:bg-primary-fixed">
                       Start Profiting Today
                    </Button>
                 </Link>
              </motion.div>

              <div className="relative">
                 <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full"></div>
                 <Card className="border border-outline/50 rounded-[24px] shadow-2xl overflow-hidden group bg-surface/50 backdrop-blur-xl h-[500px]">
                    {/* Live Chart Preview */}
                    <div className="h-full pointer-events-none p-4 pb-0">
                       <CandlestickChart data={mockChartData} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-8 left-8 p-6 bg-background/80 backdrop-blur-md border border-outline/50 rounded-2xl max-w-xs pointer-events-none">
                       <p className="text-xs font-medium text-zinc-300 mb-2 italic">"The latency is unmatched. It's the only platform we use for our high-frequency institutional desk."</p>
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Head of Trading, Citadel Capital</p>
                    </div>
                 </Card>
              </div>
           </div>
        </section>

        {/* LIVE ACTIVITY FEED */}
        <section className="py-20 px-6 bg-surface/30 border-y border-outline/30 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] -z-10 pointer-events-none"></div>
           <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-bold text-white tracking-tight">Live Network Activity</h3>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_var(--color-success)]"></span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-success">Syncing...</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <AnimatePresence>
                    {activities.slice(0, 6).map((activity, i) => (
                       <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          className="bg-surface/50 border border-outline/50 rounded-xl p-4 flex items-center gap-4"
                       >
                          <div className={cn(
                             "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                             activity.text.includes('Investment') ? 'bg-success/10 text-success' :
                             activity.text.includes('Withdrawal') ? 'bg-error/10 text-error' :
                             'bg-primary/10 text-primary'
                          )}>
                             <span className="material-symbols-outlined text-sm">
                                {activity.text.includes('Investment') ? 'south_west' :
                                 activity.text.includes('Withdrawal') ? 'north_east' :
                                 'verified_user'}
                             </span>
                          </div>
                          <div>
                             <p className="text-xs font-medium text-white">{activity.text.split(':')[0]}:</p>
                             <p className="text-xs font-bold text-zinc-400">{activity.text.split(':')[1]}</p>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-40 px-6 relative text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[150px] -z-10 rounded-full"></div>
           <Card className="max-w-4xl mx-auto p-16 md:p-24 rounded-[40px] border border-outline/50 relative overflow-hidden shadow-2xl bg-surface/50 backdrop-blur-xl">
              <div className="relative z-10 space-y-8">
                 <h2 className="text-[48px] md:text-[64px] font-black text-white tracking-tight leading-none">The Future of Finance is <span className="text-primary italic">Here.</span></h2>
                 <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto">Join the elite institutions who have already upgraded their infrastructure to Equity Citadel Associates.</p>
                 <div className="pt-8">
                    <Link to="/signup">
                       <Button size="lg" className="px-14 py-6 text-sm font-black uppercase tracking-[0.2em] shadow-2xl bg-primary text-black hover:bg-primary-fixed">Create Elite Account</Button>
                    </Link>
                 </div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-8">Fully Compliant • Institutional Security • 24/7 VIP Support</p>
              </div>
           </Card>
        </section>
      </main>

      <footer className="bg-surface/20 py-20 px-12 border-t border-outline/30 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-4">
            <span className="text-xl font-black tracking-tight text-white uppercase">EQUITY CITADEL ASSOCIATES</span>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-sm">Redefining institutional digital asset infrastructure. Secure. Fast. Infinite.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline/30 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <p>© 2024 Equity Citadel Associates. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-all">Privacy</a>
            <a href="#" className="hover:text-white transition-all">Terms</a>
            <a href="#" className="hover:text-white transition-all">Risk Disclosure</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ label, val, sub }) => (
  <div className="flex flex-col items-center text-center px-4">
     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">{label}</span>
     <p className="text-4xl font-black text-white tracking-tight mb-1">{val}</p>
     <p className="text-[10px] font-medium text-primary uppercase tracking-widest">{sub}</p>
  </div>
);

const StepCard = ({ number, title, desc, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="relative p-8 rounded-[24px] bg-surface/30 border border-outline/30 hover:border-primary/50 transition-all group backdrop-blur-md shadow-lg"
  >
     <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all">
        <span className="material-symbols-outlined">{icon}</span>
     </div>
     <span className="text-4xl font-black text-white/5 absolute top-8 right-8">{number}</span>
     <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
     <p className="text-sm text-zinc-400 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const BenefitItem = ({ icon, title, desc }) => (
  <div className="flex gap-6 items-start">
     <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-zinc-300">{icon}</span>
     </div>
     <div className="space-y-1">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div>
    <h4 className="text-[10px] font-bold text-zinc-400 mb-6 uppercase tracking-[0.2em]">{title}</h4>
    <ul className="space-y-3 text-xs font-medium text-zinc-500">
      {links.map(link => (
        <li key={link}><a className="hover:text-primary transition-colors" href="#">{link}</a></li>
      ))}
    </ul>
  </div>
);

export default Home;
