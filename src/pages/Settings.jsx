import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getAlerts, createAlert, deleteAlert } from '../lib/db';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../utils/cn';

const LANGUAGES = [
  { label: 'English (United States)', value: 'en-US' },
  { label: 'English (United Kingdom)', value: 'en-GB' },
  { label: 'Français (French)', value: 'fr' },
  { label: 'Español (Spanish)', value: 'es' },
  { label: 'Deutsch (German)', value: 'de' },
  { label: '简体中文 (Chinese Simplified)', value: 'zh-CN' },
  { label: '繁體中文 (Chinese Traditional)', value: 'zh-TW' },
  { label: '日本語 (Japanese)', value: 'ja' },
  { label: '한국어 (Korean)', value: 'ko' },
  { label: 'Русский (Russian)', value: 'ru' },
  { label: 'العربية (Arabic)', value: 'ar' },
  { label: 'Português (Portuguese)', value: 'pt' },
  { label: 'हिन्दी (Hindi)', value: 'hi' },
  { label: 'Türkçe (Turkish)', value: 'tr' },
  { label: 'Italiano (Italian)', value: 'it' },
  { label: 'Tiếng Việt (Vietnamese)', value: 'vi' },
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'ไทย (Thai)', value: 'th' },
  { label: 'Kiswahili (Swahili)', value: 'sw' },
  { label: 'Nederlands (Dutch)', value: 'nl' },
  { label: 'Polski (Polish)', value: 'pl' },
  { label: 'Ελληνικά (Greek)', value: 'el' },
  { label: 'עברית (Hebrew)', value: 'he' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Javanese', value: 'jv' },
  { label: 'Telugu', value: 'te' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Igbo', value: 'ig' }
];

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = useMemo(() => options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    opt.value.toLowerCase().includes(search.toLowerCase())
  ), [options, search]);

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
      <div 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex justify-between items-center cursor-pointer hover:border-primary/50 transition-all shadow-inner group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-white font-bold" : "text-zinc-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="material-symbols-outlined text-sm text-zinc-500 group-hover:text-primary transition-colors">expand_more</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-3 border-b border-white/5 bg-white/5">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-primary">search</span>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search options..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:border-primary text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar bg-zinc-900/50">
                {filteredOptions.map(opt => (
                  <div 
                    key={opt.value}
                    className={cn(
                      "px-4 py-3 text-xs cursor-pointer hover:bg-primary hover:text-black transition-all flex justify-between items-center group border-b border-white/5 last:border-0",
                      value === opt.value ? "bg-primary/20 text-primary font-bold" : "text-zinc-400"
                    )}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{opt.label}</span>
                    {value === opt.value && <span className="material-symbols-outlined text-sm">check</span>}
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="px-4 py-10 text-center text-xs text-zinc-600 italic font-medium">
                    <span className="material-symbols-outlined block mb-2 opacity-20">search_off</span>
                    No results found for "{search}"
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsTab = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold text-sm",
      active ? "bg-primary text-black shadow-[0_4px_25px_rgba(252,213,53,0.4)] scale-[1.02]" : "text-secondary hover:bg-white/5 hover:text-white"
    )}
  >
    <span className="material-symbols-outlined">{icon}</span>
    {label}
  </button>
);

const SecurityItem = ({ icon, title, desc, action }) => (
  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-primary shadow-inner">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed">{desc}</p>
      </div>
    </div>
    <div className="relative z-10">{action}</div>
  </div>
);

const Settings = () => {
  const { user, profile, loading: dataLoading } = useSupabaseData();
  const { currency, setCurrency, currencies, formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Account & Identity', icon: 'person' },
    { id: 'security', label: 'Security Protocols', icon: 'shield' },
    { id: 'verifications', label: 'KYC & Verification', icon: 'verified_user' },
    { id: 'notifications', label: 'Alert Streams', icon: 'notifications' },
    { id: 'api', label: 'Developer API', icon: 'code' },
    { id: 'preferences', label: 'Terminal Prefs', icon: 'tune' },
  ];

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto py-12 md:py-24 px-8 min-h-screen">
        
        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
             <div className="px-5 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/20 backdrop-blur-xl">Advanced Settings</div>
             <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Protocol v4.0 Active</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">Management <span className="text-primary italic">Suite</span></h1>
          <p className="text-zinc-500 mt-6 text-lg max-w-2xl font-medium leading-relaxed">Configure your high-security account protocols and verify identity parameters.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Settings Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-5 px-6 py-4.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group",
                      activeTab === tab.id 
                        ? "bg-primary text-black shadow-[0_20px_50px_rgba(252,213,53,0.3)]" 
                        : "text-zinc-500 hover:bg-white/[0.03] hover:text-white border border-transparent hover:border-white/5"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-2xl transition-colors", activeTab === tab.id ? "text-black" : "text-zinc-700 group-hover:text-primary")}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Security Status Widget */}
              <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Security: Level 4</span>
                 </div>
                 <div className="space-y-4">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[85%] bg-primary shadow-[0_0_10px_rgba(252,213,53,0.3)]"></div>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-relaxed font-bold uppercase tracking-widest">Enable 2FA to achieve Level 5 security status.</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Interface */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <Card className="md:col-span-8 p-12 citadel-card shadow-2xl relative overflow-hidden" glass>
                        <div className="flex items-center gap-10 mb-16 border-b border-white/5 pb-12">
                           <div className="relative group">
                              <div className="w-32 h-32 rounded-[32px] bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-primary/50 transition-all">
                                 <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} className="w-full h-full object-cover" />
                              </div>
                              <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-[0_10px_20px_rgba(252,213,53,0.4)] hover:scale-110 transition-all">
                                 <span className="material-symbols-outlined text-lg">photo_camera</span>
                              </button>
                           </div>
                           <div>
                              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{profile?.full_name || 'Protocol Holder'}</h2>
                              <p className="text-sm text-zinc-600 font-mono mt-3 uppercase tracking-widest">{user?.email}</p>
                              <div className="flex gap-3 mt-6">
                                 <span className="px-4 py-1.5 bg-success/10 text-success text-[9px] font-black uppercase tracking-widest rounded-lg border border-success/10">Identity Verified</span>
                                 <span className="px-4 py-1.5 bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">Tier 4 Account</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Full Name</label>
                            <input className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner" defaultValue={profile?.full_name} />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Account Email</label>
                            <input className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-5 text-zinc-600 font-black uppercase tracking-widest outline-none cursor-not-allowed" readOnly value={user?.email} />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Phone Number</label>
                            <input className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner" placeholder="+1 (555) 000-0000" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Country / Region</label>
                            <input className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner" defaultValue="United States" />
                          </div>
                        </div>

                        <div className="mt-16 pt-12 border-t border-white/5 flex justify-end">
                          <Button variant="primary" className="px-12 py-5 font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl">Save Changes</Button>
                        </div>
                      </Card>

                      <div className="md:col-span-4 space-y-8">
                        <Card className="p-10 citadel-card bg-primary/5 border-primary/10" glass>
                           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Account Telemetry</h3>
                           <div className="space-y-6 font-mono text-[10px]">
                              <div className="flex justify-between py-3 border-b border-white/5">
                                 <span className="text-zinc-600 uppercase">System_ID</span>
                                 <span className="text-white font-black">{user?.id.slice(0, 12)}...</span>
                              </div>
                              <div className="flex justify-between py-3 border-b border-white/5">
                                 <span className="text-zinc-600 uppercase">Clearance_Score</span>
                                 <span className="text-success font-black tracking-tighter text-sm">98.4 / 100</span>
                              </div>
                              <div className="flex justify-between py-3">
                                 <span className="text-zinc-600 uppercase">Node_Epoch</span>
                                 <span className="text-white font-black">{new Date(profile?.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </Card>

                        <div className="p-10 rounded-[40px] border border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group text-center">
                           <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center text-zinc-700 mb-6 mx-auto group-hover:bg-primary group-hover:text-black transition-all border border-white/5">
                              <span className="material-symbols-outlined text-3xl font-black">shield_person</span>
                           </div>
                           <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Advanced Verification</h4>
                           <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed font-bold uppercase tracking-widest">Upgrade to Tier 5 to unlock unlimited features.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <Card className="p-12 citadel-card shadow-2xl" glass>
                    <div className="mb-12">
                       <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Security Configuration</h2>
                       <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Account Security Toggles</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {[
                        { title: 'Two-Factor Authentication (2FA)', desc: 'Encrypt all fund releases with mandatory TOTP verification.', status: 'Highly Recommended', action: 'Enable Protocol' },
                        { title: 'Vault Whitelisting', desc: 'Restricts liquidity ingress to verified wallet addresses only.', status: 'Tier 4 Active', action: 'Manage Vaults' },
                        { title: 'Anti-Phishing Cipher', desc: 'Add a personal cryptographic code to all official updates.', status: 'Protocol Inactive', action: 'Set Cipher' },
                        { title: 'Master Access Password', desc: 'Security password updated within current epoch. Regular updates recommended.', status: 'Verified', action: 'Rotate Access' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-white/10 transition-all group">
                           <div className="space-y-2">
                              <p className="text-lg font-black text-white uppercase tracking-tight">{item.title}</p>
                              <p className="text-xs text-zinc-500 max-w-xl leading-relaxed font-medium">{item.desc}</p>
                              <div className="flex items-center gap-3 pt-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                 <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{item.status}</span>
                              </div>
                           </div>
                           <Button variant="outline" className="px-8 py-4 border-white/10 hover:border-primary text-[10px] font-black uppercase tracking-widest transition-all group-hover:scale-105">
                             {item.action}
                           </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {activeTab === 'verifications' && (
                  <Card className="p-12 citadel-card shadow-2xl" glass>
                    <div className="mb-12">
                       <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Identity Verification</h2>
                       <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Identity Parameters & Account Status</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="p-10 bg-success/5 rounded-[40px] border border-success/10 relative overflow-hidden group">
                          <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                          <div className="flex items-center gap-6 mb-8 relative z-10">
                             <div className="w-14 h-14 rounded-2xl bg-success flex items-center justify-center text-white shadow-2xl">
                                <span className="material-symbols-outlined text-3xl font-black">verified</span>
                             </div>
                             <div>
                                <p className="text-lg font-black text-white uppercase tracking-tight leading-none">Basic Identity</p>
                                <p className="text-[10px] text-success font-black uppercase tracking-[0.3em] mt-2">Protocol Cleared</p>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-success/10 relative z-10">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Tier 1 Verification Complete</span>
                             <div className="w-full py-4 bg-success text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-center shadow-2xl">Account Active</div>
                          </div>
                       </div>

                       <div className="p-10 bg-white/[0.02] rounded-[40px] border border-white/5 border-dashed relative group hover:border-primary/40 hover:bg-primary/5 transition-all">
                          <div className="flex items-center gap-6 mb-8">
                             <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-700 shadow-2xl border border-white/5 group-hover:bg-primary group-hover:text-black transition-all">
                                <span className="material-symbols-outlined text-3xl font-black">badge</span>
                             </div>
                             <div>
                                <p className="text-lg font-black text-white uppercase tracking-tight leading-none">Advanced KYC</p>
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2">Unlock Tier 5 Limits</p>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-white/5">
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Required for Capital releases {'>'} $100M</span>
                             <button className="w-full py-4 bg-white/[0.05] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black transition-all shadow-2xl">Initialize Verification</button>
                          </div>
                       </div>
                    </div>
                  </Card>
                )}

                {activeTab === 'api' && (
                  <Card className="p-12 citadel-card shadow-2xl" glass>
                    <div className="flex justify-between items-start mb-16">
                      <div className="space-y-2">
                         <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Execution API</h2>
                         <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">High-Latency Terminal Integration</p>
                      </div>
                      <Button variant="primary" className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105">Generate Master Key</Button>
                    </div>
                    <div className="p-10 bg-black/60 rounded-[40px] border border-white/5 font-mono relative overflow-hidden group">
                       <div className="absolute -right-10 -bottom-10 text-[150px] font-black text-white/[0.01] pointer-events-none select-none tracking-tighter uppercase">API</div>
                       <div className="flex justify-between mb-8 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                             <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Master_Protocol_Key_v4.0</span>
                          </div>
                          <span className="text-[9px] font-black text-success uppercase tracking-widest bg-success/10 px-3 py-1 rounded-lg">Synchronized</span>
                       </div>
                       <div className="flex gap-4 relative z-10">
                          <code className="flex-1 bg-white/[0.03] p-6 rounded-2xl text-xs text-zinc-400 break-all border border-white/5 font-mono shadow-inner">pk_live_830a672f...494c7e63b379</code>
                          <button className="p-6 bg-white/[0.05] border border-white/10 rounded-2xl text-zinc-500 hover:text-primary transition-all shadow-2xl">
                             <span className="material-symbols-outlined text-xl">content_copy</span>
                          </button>
                       </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
