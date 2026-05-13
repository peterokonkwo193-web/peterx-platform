import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { signIn, signUp, signInWithOAuth, resetPassword } from '../lib/auth';
import { useSupport } from '../context/SupportContext';
import { cn } from '../utils/cn';

const Login = ({ isSignUp = false }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { openSupport } = useSupport();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isForgotPassword) {
        await resetPassword(identifier);
        setSuccess('Password reset link sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        if (!fullName) {
          throw new Error('Please enter your full name.');
        }
        await signUp(identifier, password, fullName, experienceLevel);
        setSuccess('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        await signIn(identifier, password);
        navigate('/investments');
      }
    } catch (err) {
      // Friendly error mapping
      let message = err.message;
      if (message === 'Invalid login credentials') message = 'Invalid credentials. Please try again.';
      if (message === 'User already registered') message = 'An account with this identifier already exists.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Ethereal Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px]"></div>
      
      {/* Support Trigger */}
      <button 
        onClick={() => openSupport()}
        className="fixed top-8 right-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all group backdrop-blur-xl"
      >
        <span className="material-symbols-outlined text-primary text-sm group-hover:rotate-12 transition-transform">contact_support</span>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Protocol Support</span>
      </button>
      
      <main className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-12 px-8 py-12 z-10">
        {/* Brand Side */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">shield</span>
               </div>
               <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Equity Citadel</h1>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1">Institutional Liquidity Terminal</p>
               </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
              The <span className="text-primary">Standard</span> for Modern Asset Management.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              Access premium liquidity, secure custody, and advanced trading protocols through our crystal-glass interface.
            </p>
            
            <div className="flex items-center gap-8 pt-8">
               <div className="space-y-1">
                  <span className="block text-2xl font-black text-white">$4.2B+</span>
                  <span className="block text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Protocol TVL</span>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div className="space-y-1">
                  <span className="block text-2xl font-black text-white">99.9%</span>
                  <span className="block text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Node Uptime</span>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div className="space-y-1">
                  <span className="block text-2xl font-black text-white">24/7</span>
                  <span className="block text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Clearance</span>
               </div>
            </div>
          </div>
        </div>

        {/* Auth Card Side */}
        <div className="flex items-center justify-center">
          <Card className="citadel-card w-full max-w-md p-10 relative overflow-hidden" glass>
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                {isSignUp ? 'Create Account' : 'Access Terminal'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
                {isSignUp ? 'Create your professional account' : 'Verify credentials to enter environment'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Full Legal Name</label>
                    <div className="relative group bg-white/5 border border-white/10 rounded-xl focus-within:border-primary transition-all duration-300">
                      <input 
                        className="w-full bg-transparent border-none text-white text-sm py-4 px-5 focus:ring-0 placeholder:text-zinc-700 font-mono" 
                        placeholder="John Doe" 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Experience Tier</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExperienceLevel('Beginner')}
                        className={cn(
                          "py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          experienceLevel === 'Beginner' 
                            ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(252,213,53,0.3)]" 
                            : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                        )}
                      >
                        Are you new to crypto?
                      </button>
                      <button
                        type="button"
                        onClick={() => setExperienceLevel('Expert')}
                        className={cn(
                          "py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          experienceLevel === 'Expert' 
                            ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(252,213,53,0.3)]" 
                            : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                        )}
                      >
                        Expert in crypto
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Email Address</label>
                <div className="relative group bg-white/5 border border-white/10 rounded-xl focus-within:border-primary transition-all duration-300">
                  <input 
                    className="w-full bg-transparent border-none text-white text-sm py-4 px-5 focus:ring-0 placeholder:text-zinc-700 font-mono" 
                    placeholder="Enter your email" 
                    type="email" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secret Key</label>
                    {!isSignUp && (
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group bg-white/5 border border-white/10 rounded-xl focus-within:border-primary transition-all duration-300">
                    <input 
                      className="w-full bg-transparent border-none text-white text-sm py-4 px-5 focus:ring-0 placeholder:text-zinc-700 font-mono" 
                      placeholder="••••••••" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isForgotPassword}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-xl">
                  <span className="material-symbols-outlined text-error text-sm">error</span>
                  <p className="text-error text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-xl">
                  <span className="material-symbols-outlined text-success text-sm">verified</span>
                  <p className="text-success text-[10px] font-black uppercase tracking-widest">{success}</p>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl"
                disabled={loading}
              >
                {loading ? 'Validating Protocol...' : (isForgotPassword ? 'Reset Security Key' : (isSignUp ? 'Initialize Account' : 'Authenticate Entry'))}
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#0a0a0a] text-zinc-600 font-black text-[9px] tracking-widest uppercase">Quick Connect</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton label="Google" onClick={() => signInWithOAuth('google')} />
              <SocialButton label="Apple" onClick={() => signInWithOAuth('apple')} />
            </div>

            <div className="mt-10 text-center">
              {isForgotPassword ? (
                <button 
                  onClick={() => setIsForgotPassword(false)}
                  className="text-zinc-400 font-bold hover:text-white transition-colors text-[10px] uppercase tracking-widest"
                >
                  Return to Terminal
                </button>
              ) : (
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {isSignUp ? 'Already have an account?' : "New here?"}
                  <Link 
                    className="text-primary font-black hover:text-white transition-colors ml-2" 
                    to={isSignUp ? "/login" : "/signup"}
                  >
                    {isSignUp ? 'Login' : 'Create Account'}
                  </Link>
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

const SocialButton = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all group backdrop-blur-xl"
  >
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
  </button>
);

export default Login;
