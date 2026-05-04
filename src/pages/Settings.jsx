import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getAlerts, createAlert, deleteAlert } from '../lib/db';

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

const CURRENCIES = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'NGN - Nigerian Naira', value: 'NGN' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'ZAR - South African Rand', value: 'ZAR' },
  { label: 'CHF - Swiss Franc', value: 'CHF' },
  { label: 'HKD - Hong Kong Dollar', value: 'HKD' },
  { label: 'SGD - Singapore Dollar', value: 'SGD' },
  { label: 'INR - Indian Rupee', value: 'INR' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'BRL - Brazilian Real', value: 'BRL' },
  { label: 'RUB - Russian Ruble', value: 'RUB' },
  { label: 'KRW - South Korean Won', value: 'KRW' },
  { label: 'MXN - Mexican Peso', value: 'MXN' },
  { label: 'SAR - Saudi Riyal', value: 'SAR' },
  { label: 'AED - UAE Dirham', value: 'AED' },
  { label: 'TRY - Turkish Lira', value: 'TRY' },
  { label: 'EGP - Egyptian Pound', value: 'EGP' },
  { label: 'GHS - Ghanaian Cedi', value: 'GHS' },
  { label: 'KES - Kenyan Shilling', value: 'KES' },
  { label: 'PHP - Philippine Peso', value: 'PHP' },
  { label: 'IDR - Indonesian Rupiah', value: 'IDR' },
  { label: 'THB - Thai Baht', value: 'THB' },
  { label: 'MYR - Malaysian Ringgit', value: 'MYR' },
  { label: 'VND - Vietnamese Dong', value: 'VND' },
  { label: 'ILS - Israeli Shekel', value: 'ILS' },
  { label: 'PLN - Polish Zloty', value: 'PLN' },
  { label: 'UAH - Ukrainian Hryvnia', value: 'UAH' },
  { label: 'SEK - Swedish Krona', value: 'SEK' },
  { label: 'NOK - Norwegian Krone', value: 'NOK' }
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
  const { user, profile, loading: dataLoading, error: supabaseError } = useSupabaseData();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({ symbol: 'BTC', price: '', condition: 'Above' });
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(localStorage.getItem('terminal-theme') || 'dark');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('terminal-theme', newTheme);
  };

  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'Chrome / Windows', ip: '192.168.1.42', date: 'Active Now' },
    { id: 2, name: 'Safari / iPhone 15', ip: '102.89.2.11', date: '2 hours ago' },
    { id: 3, name: 'Desktop App / Mac', ip: '192.168.1.15', date: 'Yesterday' }
  ]);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      getAlerts(user.id).then(setAlerts);
      setLoading(false);
    }
  }, [user]);

  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.price) return;
    
    try {
      await createAlert({
        user_id: user.id,
        symbol: newAlert.symbol,
        target_price: parseFloat(newAlert.price),
        condition: newAlert.condition
      });
      const updated = await getAlerts(user.id);
      setAlerts(updated);
      setNewAlert({ ...newAlert, price: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemoveDevice = (id) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
  };

  if (dataLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(252,213,53,0.1)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <h1 className="text-2xl font-bold mb-8 px-4 flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">settings</span>
             Settings
          </h1>
          <SettingsTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="person" label="Profile & Verification" />
          <SettingsTab active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="shield" label="Security Center" />
          <SettingsTab active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon="notifications" label="Market Alerts" />
          <SettingsTab active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon="code" label="API Management" />
          <SettingsTab active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} icon="tune" label="Preferences" />
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                        <span className="material-symbols-outlined text-success text-sm">verified</span>
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">
                          {profile?.verification_status === 'Verified' ? 'Level 2 Verified' : (profile?.verification_status || 'Unverified')}
                        </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-8">Identity Verification</h2>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/20 shadow-inner overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{profile?.full_name || 'Account Holder'}</h3>
                      <p className="text-sm text-secondary">{user?.email || 'Loading email...'}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">UID: {user?.id?.slice(0, 8) || '********'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-primary outline-none transition-all" defaultValue={profile?.full_name || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trust Score</label>
                      <div className="flex items-center gap-3 h-[54px] bg-white/5 border border-white/10 rounded-xl px-4">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-success w-[92%] shadow-[0_0_10px_rgba(14,203,129,0.5)]"></div>
                        </div>
                        <span className="text-xs font-bold text-success font-mono">982</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">VIP Tier</label>
                      <div className="w-full bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 rounded-xl px-4 py-4 text-sm text-primary font-bold tracking-wide">
                        Institutional Elite (Level 4)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Institutional Type</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-zinc-500" readOnly defaultValue="Personal (Individual)" />
                    </div>
                  </div>
                  <Button variant="primary" className="mt-8 py-4 px-12 text-xs font-bold shadow-lg">Update Profile</Button>
                </Card>

                <Card className="p-8 border border-success/20 bg-gradient-to-br from-success/5 to-transparent">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-2">Institutional Limits</h2>
                      <p className="text-sm text-secondary max-w-md leading-relaxed">
                        {profile?.verification_status === 'Verified' 
                          ? 'Your account is currently verified for $10M/daily withdrawal limits and unlimited deposits.'
                          : 'Verify your identity to unlock higher withdrawal limits and premium trading features.'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-success border-success/30 px-6 font-bold">View Limits</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 shadow-2xl">
                  <h2 className="text-xl font-bold mb-6">Security Center</h2>
                  <div className="space-y-4">
                    <SecurityItem 
                      icon="lock" 
                      title="Two-Factor Authentication (2FA)" 
                      desc="Recommended: Secure your account with TOTP (Google Authenticator/Authy)."
                      action={
                        <div 
                          onClick={handleToggle2FA}
                          className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${is2FAEnabled ? 'bg-primary' : 'bg-zinc-800'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${is2FAEnabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      }
                    />
                    <SecurityItem 
                      icon="password" 
                      title="Withdrawal Password" 
                      desc="Require a separate password for all fund withdrawals."
                      action={
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="font-bold px-6 border-white/20"
                          onClick={() => setIsSettingPassword(true)}
                        >
                          {isSettingPassword ? 'Update Password' : 'Set Password'}
                        </Button>
                      }
                    />
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold">Authorized Devices</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">{devices.length} Active</span>
                  </div>
                  <div className="p-8 space-y-2">
                    {devices.map(device => (
                      <div key={device.id} className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors border border-white/5 shadow-inner">
                                <span className="material-symbols-outlined">{device.name.includes('iPhone') ? 'smartphone' : 'laptop_mac'}</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{device.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1 tracking-tight">{device.ip} • {device.date}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveDevice(device.id)}
                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                          >
                            Revoke Access
                          </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'alerts' && (
              <motion.div 
                key="alerts"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Market Price Alerts</h2>
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                       Real-time Tracking
                    </span>
                  </div>

                  <form onSubmit={handleAddAlert} className="grid grid-cols-12 gap-6 mb-10 bg-surface-variant p-8 rounded-2xl border border-white/10 shadow-inner">
                    <div className="col-span-12 md:col-span-3 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol Asset</label>
                      <select 
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-primary transition-all cursor-pointer"
                        value={newAlert.symbol}
                        onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                      >
                        <option>BTC</option>
                        <option>ETH</option>
                        <option>SOL</option>
                        <option>PEPE</option>
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-3 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trigger Condition</label>
                      <select 
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-primary transition-all cursor-pointer"
                        value={newAlert.condition}
                        onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                      >
                        <option>Above</option>
                        <option>Below</option>
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                        <input 
                          type="number" 
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-4 text-xs text-white outline-none focus:border-primary transition-all font-mono" 
                          placeholder="0.00"
                          value={newAlert.price}
                          onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-end">
                      <Button type="submit" variant="primary" className="w-full py-4 text-xs font-bold shadow-lg">Set Alert</Button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                               <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
                            </div>
                            <span className="font-black text-white text-base tracking-tighter">{alert.symbol}/USD</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Condition</span>
                             <span className="text-xs text-zinc-300 font-medium">{alert.condition} Target</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Price Point</span>
                             <span className="font-mono text-primary font-bold text-sm tracking-tighter">${parseFloat(alert.target_price).toLocaleString()}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteAlert(alert.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                        <span className="material-symbols-outlined text-5xl mb-4 text-zinc-700">notifications_off</span>
                        <p className="text-zinc-500 text-sm font-medium tracking-tight">Your protocol alert stream is empty.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div 
                key="preferences"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 shadow-2xl">
                  <h2 className="text-xl font-bold mb-8">Institutional Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <SearchableSelect 
                      label="Base Fiat Currency"
                      options={CURRENCIES}
                      value={selectedCurrency}
                      onChange={setSelectedCurrency}
                      placeholder="Select Currency"
                    />
                    <SearchableSelect 
                      label="System Localization"
                      options={LANGUAGES}
                      value={selectedLanguage}
                      onChange={setSelectedLanguage}
                      placeholder="Select Language"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Terminal Interface Theme</label>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleThemeChange('dark')}
                          className={cn(
                            "flex-1 py-4 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest",
                            theme === 'dark' ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(252,213,53,0.15)]" : "border-white/10 text-secondary hover:bg-white/5"
                          )}
                        >
                          Dark Protocol
                        </button>
                        <button 
                          onClick={() => handleThemeChange('light')}
                          className={cn(
                            "flex-1 py-4 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest",
                            theme === 'light' ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(252,213,53,0.15)]" : "border-white/10 text-secondary hover:bg-white/5"
                          )}
                        >
                          Classic Light
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data Stream Precision</label>
                      <select className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-primary transition-all cursor-pointer">
                        <option value="2">Standard (2 Decimals)</option>
                        <option value="4">High (4 Decimals)</option>
                        <option value="8">Institutional (8 Decimals)</option>
                        <option value="12">Protocol Depth (12 Decimals)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                    <div className="h-6">
                      {saveSuccess && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          className="text-[10px] font-black text-success uppercase tracking-[0.3em] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">done_all</span>
                          Sync Complete
                        </motion.span>
                      )}
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="px-10 py-4 shadow-xl"
                      onClick={handleSavePreferences}
                    >
                      Save Global Preferences
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 border border-white/5 bg-zinc-900/30">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary text-base">hub</span>
                     Notification Channels
                  </h2>
                  <div className="space-y-4">
                    <SecurityItem 
                      icon="mail" 
                      title="Email Intelligence" 
                      desc="Receive weekly portfolio performance and security updates."
                      action={<div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-lg"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full shadow-inner"></div></div>}
                    />
                    <SecurityItem 
                      icon="chat" 
                      title="SMS Protocol Alerts" 
                      desc="Instant alerts for logins from new devices or large withdrawals."
                      action={<div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer border border-white/10"><div className="absolute left-1 top-1 w-4 h-4 bg-zinc-600 rounded-full shadow-sm"></div></div>}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div 
                key="api"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="p-8 shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-xl font-bold mb-2">Institutional API Keys</h2>
                        <p className="text-sm text-secondary leading-relaxed">Automate your trading with high-frequency API access. Keep keys secure.</p>
                      </div>
                      <Button variant="primary" size="sm" className="px-8 font-bold">Generate Key</Button>
                    </div>
                    <div className="p-8 bg-zinc-950 rounded-2xl border border-white/10 shadow-inner relative overflow-hidden group">
                      <div className="absolute right-0 top-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                         <span className="material-symbols-outlined text-6xl text-primary">key</span>
                      </div>
                      <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-primary/20">Active</span>
                           <span className="text-xs font-bold text-white uppercase tracking-widest">Master Execution Key</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">Last used: 2 hours ago</span>
                      </div>
                      <div className="flex gap-3 mb-8 relative z-10">
                        <code className="flex-1 bg-white/[0.03] p-4 rounded-xl text-xs font-mono text-zinc-400 border border-white/5 break-all">pk_live_********************************3f2a</code>
                        <Button variant="outline" size="sm" className="px-4 border-white/10 hover:border-primary transition-all"><span className="material-symbols-outlined text-sm">content_copy</span></Button>
                      </div>
                      <div className="flex flex-wrap gap-6 relative z-10">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success"></div><span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Spot Trading</span></div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success"></div><span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Read-Only</span></div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-error"></div><span className="text-[10px] text-error uppercase font-black tracking-widest">Withdrawals Locked</span></div>
                      </div>
                    </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </DashboardLayout>
  );
};

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default Settings;

