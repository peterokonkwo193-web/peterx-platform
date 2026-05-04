import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, getPortfolio, getWatchlist } from '../lib/db';

export const useSupabaseData = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [stakingPositions, setStakingPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        setUser(currentUser);

        if (currentUser) {
          const [p, port, watch, futures, staking] = await Promise.all([
            getProfile(currentUser.id).catch(() => null),
            getPortfolio(currentUser.id).catch(() => []),
            getWatchlist(currentUser.id).catch(() => []),
            supabase.from('futures_positions').select('*').eq('user_id', currentUser.id).eq('is_open', true).then(res => res.data || []),
            supabase.from('staking_positions').select('*').eq('user_id', currentUser.id).then(res => res.data || [])
          ]);
          setProfile(p);
          setPortfolio(port || []);
          setWatchlist(watch || []);
          setFuturesPositions(futures || []);
          setStakingPositions(staking || []);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Set up listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null;
      setUser(prev => {
        if (prev?.id === newUser?.id) return prev;
        return newUser;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Use unique channel names to avoid collisions during React Strict Mode re-renders
    const timestamp = Date.now();

    const profileSub = supabase
      .channel(`profile-changes-${user.id}-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        if (payload.new) setProfile(payload.new);
      })
      .subscribe();

    const portfolioSub = supabase
      .channel(`portfolio-changes-${user.id}-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios', filter: `user_id=eq.${user.id}` }, () => {
        getPortfolio(user.id).then(data => setPortfolio(data || [])).catch(() => setPortfolio([]));
      })
      .subscribe();

    const watchlistSub = supabase
      .channel(`watchlist-changes-${user.id}-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watchlist', filter: `user_id=eq.${user.id}` }, () => {
        getWatchlist(user.id).then(data => setWatchlist(data || [])).catch(() => setWatchlist([]));
      })
      .subscribe();

    const futuresSub = supabase
      .channel(`futures-changes-${user.id}-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'futures_positions', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('futures_positions').select('*').eq('user_id', user.id).eq('is_open', true).then(res => setFuturesPositions(res.data || []));
      })
      .subscribe();

    const stakingSub = supabase
      .channel(`staking-changes-${user.id}-${timestamp}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staking_positions', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('staking_positions').select('*').eq('user_id', user.id).then(res => setStakingPositions(res.data || []));
      })
      .subscribe();

    return () => {
      // Properly remove channels to completely deregister them from the Supabase client
      supabase.removeChannel(profileSub);
      supabase.removeChannel(portfolioSub);
      supabase.removeChannel(watchlistSub);
      supabase.removeChannel(futuresSub);
      supabase.removeChannel(stakingSub);
    };
  }, [user]);

  // Admin Real-time Signup Notifications
  useEffect(() => {
    if (!profile?.is_admin) return;

    // Ask for Notification permission if available
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const timestamp = Date.now();
    const adminSub = supabase
      .channel(`admin-signup-notifications-${timestamp}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new) {
          const msg = `🔔 NEW USER REGISTRATION: ${payload.new.full_name || 'Anonymous User'} just signed up!`;
          
          // Try native notification first
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Equity Citadel Associates Admin Alert', { body: msg, icon: '/vite.svg' });
          } else {
            // Fallback to browser alert
            alert(msg);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(adminSub);
    };
  }, [profile?.is_admin]);

  return { user, profile, portfolio: portfolio || [], watchlist: watchlist || [], futuresPositions, stakingPositions, loading, error };
};
