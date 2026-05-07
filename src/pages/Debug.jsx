import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Card from '../components/common/Card';

const Debug = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        setProfile(p);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-background text-white p-6 flex items-center justify-center font-mono">
      <Card className="w-full max-w-2xl p-10 border-primary/20 bg-primary/5 shadow-2xl" glass>
        <div className="flex items-center gap-4 mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">terminal</span>
          <h1 className="text-xl font-black uppercase tracking-widest text-primary">Institutional Protocol Debugger</h1>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-black/40 rounded-xl border border-white/5 space-y-4">
            <div>
              <span className="text-zinc-500 uppercase font-bold block mb-1 text-[10px] tracking-widest">Session Status</span>
              <span className={`px-3 py-1 rounded text-xs font-black uppercase ${user ? 'bg-success/20 text-success' : 'bg-rose-500/20 text-rose-500'}`}>
                {user ? 'ACTIVE_SESSION' : 'NO_SESSION_DETECTED'}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 uppercase font-bold block mb-1 text-[10px] tracking-widest">Internal Protocol ID</span>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-zinc-950 p-3 rounded-lg border border-white/10 text-xs text-primary font-bold break-all select-all">
                  {user?.id || 'PENDING_AUTHENTICATION'}
                </code>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 uppercase font-bold block mb-1 text-[10px] tracking-widest">Administrative Clearance</span>
              <span className={`px-3 py-1 rounded text-xs font-black uppercase ${profile?.is_admin ? 'bg-success/20 text-success' : 'bg-rose-500/20 text-rose-500'}`}>
                {profile?.is_admin ? 'MASTER_ADMIN (Level 4)' : 'STANDARD_TRADER (Level 0)'}
              </span>
            </div>
          </div>

          {!user && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-4 items-start">
              <span className="material-symbols-outlined text-rose-500">warning</span>
              <p className="text-rose-400 text-xs leading-relaxed italic">
                "System Alert: No session detected. Please open the website in a new tab, log in, and then refresh this page."
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
             <p className="text-zinc-500 text-[10px] leading-relaxed italic">
               Instructions: Copy the "Internal Protocol ID" and paste it into the chat so I can force-elevate your account.
             </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Debug;
