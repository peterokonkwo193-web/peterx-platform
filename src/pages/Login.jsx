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
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Ethereal Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
      
      {/* Support Button (Connected to Global) */}
      <button 
        onClick={() => openSupport()}
        className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all group"
      >
        <span className="material-symbols-outlined text-primary text-sm group-hover:animate-pulse">contact_support</span>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-primary transition-colors">Support</span>
      </button>
      
      <main className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-stack-lg px-6 py-stack-lg z-10">
        {/* Brand Side */}
        <div className="hidden lg:flex flex-col justify-center space-y-stack-md">
          <div className="mb-stack-lg">
            <span className="font-display text-display text-on-surface tracking-tighter">Equity Citadel</span>
            <p className="font-label-caps text-label-caps text-secondary mt-stack-xs tracking-[0.2em]">INSTITUTIONAL GRADE TRADING</p>
          </div>
          <div className="space-y-stack-md">
            <h1 className="font-h1 text-h1 text-primary-fixed-dim max-w-md">Seamless entry into the digital asset ecosystem.</h1>
            <p className="font-body-lg text-body-lg text-outline max-w-sm">Experience elite security and liquidity with our glassmorphic interface designed for clarity.</p>
          </div>
        </div>

        {/* Auth Card Side */}
        <div className="flex items-center justify-center">
          <Card className="glass-card inner-glow w-full max-w-md rounded-xl p-10 shadow-2xl border border-outline/10" glass={false}>
            <div className="mb-stack-md">
              <h2 className="font-h2 text-h2 text-on-surface">{isSignUp ? 'Create Account' : 'Welcome back'}</h2>
              <p className="font-body-md text-body-md text-outline">
                {isSignUp ? 'Join the future of finance' : 'Sign in to manage your portfolio'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-primary-container block uppercase tracking-widest text-[10px]">Full Name</label>
                    <div className="relative group input-glow bg-surface-container-low border border-outline-variant rounded-xl transition-all duration-300">
                      <input 
                        className="w-full bg-transparent border-none text-on-surface font-body-md py-3 px-4 focus:ring-0 placeholder:text-outline/30" 
                        placeholder="John Doe" 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-primary-container block uppercase tracking-widest text-[10px]">Crypto Experience</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExperienceLevel('Beginner')}
                        className={cn(
                          "py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                          experienceLevel === 'Beginner' 
                            ? "bg-primary text-black border-primary" 
                            : "bg-surface-container-low border-outline-variant text-secondary hover:border-primary/50"
                        )}
                      >
                        New to Crypto
                      </button>
                      <button
                        type="button"
                        onClick={() => setExperienceLevel('Expert')}
                        className={cn(
                          "py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                          experienceLevel === 'Expert' 
                            ? "bg-primary text-black border-primary" 
                            : "bg-surface-container-low border-outline-variant text-secondary hover:border-primary/50"
                        )}
                      >
                        Expert Trader
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-primary-container block uppercase tracking-widest text-[10px]">Email or Phone Number</label>
                <div className="relative group input-glow bg-surface-container-low border border-outline-variant rounded-xl transition-all duration-300">
                  <input 
                    className="w-full bg-transparent border-none text-on-surface font-body-md py-3 px-4 focus:ring-0 placeholder:text-outline/30" 
                    placeholder="Email or +1234567890" 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest text-[10px]">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-semibold text-secondary hover:text-primary transition-colors uppercase tracking-wider"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group input-glow bg-surface-container-low border border-outline-variant rounded-xl transition-all duration-300">
                    <input 
                      className="w-full bg-transparent border-none text-on-surface font-body-md py-3 px-4 focus:ring-0 placeholder:text-outline/30" 
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
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <span className="material-symbols-outlined text-rose-500 text-sm">error</span>
                  <p className="text-rose-400 text-xs font-semibold">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <span className="material-symbols-outlined text-success text-sm">check_circle</span>
                  <p className="text-success text-xs font-semibold">{success}</p>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-sm font-bold"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Login'))}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#161416] text-outline font-label-caps text-[10px] tracking-widest uppercase">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton label="Google" onClick={() => signInWithOAuth('google')} />
              <SocialButton label="Apple" onClick={() => signInWithOAuth('apple')} />
            </div>

            <div className="mt-8 text-center">
              {isForgotPassword ? (
                <button 
                  onClick={() => setIsForgotPassword(false)}
                  className="text-secondary font-semibold hover:text-primary transition-colors text-sm"
                >
                  Back to Login
                </button>
              ) : (
                <p className="font-body-md text-sm text-outline">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <Link 
                    className="text-secondary font-semibold hover:text-primary transition-colors ml-2" 
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
    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant hover:bg-white/5 transition-colors group"
  >
    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</span>
  </button>
);

export default Login;
