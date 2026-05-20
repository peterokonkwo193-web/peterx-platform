import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, getPortfolio, getWatchlist } from '../lib/db';

export const useSupabaseData = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Hardcoded Admin logic is now handled in state setters below to prevent re-render loops
  
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [stakingPositions, setStakingPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [p, port, watch, futures, staking, txs] = await Promise.all([
        getProfile(user.id).catch(() => null),
        getPortfolio(user.id).catch(() => []),
        getWatchlist(user.id).catch(() => []),
        supabase.from('futures_positions').select('*').eq('user_id', user.id).eq('is_open', true).then(res => res.data || []),
        supabase.from('staking_positions').select('*').eq('user_id', user.id).then(res => res.data || []),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50).then(res => res.data || [])
      ]);
      const profileData = p;
      if (user.email === 'equitycitadelassociates@gmail.com' && profileData) {
        profileData.is_admin = true;
      }
      setProfile(profileData);
      setPortfolio(port || []);
      setWatchlist(watch || []);
      setFuturesPositions(futures || []);
      setStakingPositions(staking || []);
      setTransactions(txs || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        setUser(currentUser);

        if (currentUser) {
          const [p, port, watch, futures, staking, txs] = await Promise.all([
            getProfile(currentUser.id).catch(() => null),
            getPortfolio(currentUser.id).catch(() => []),
            getWatchlist(currentUser.id).catch(() => []),
            supabase.from('futures_positions').select('*').eq('user_id', currentUser.id).eq('is_open', true).then(res => res.data || []),
            supabase.from('staking_positions').select('*').eq('user_id', currentUser.id).then(res => res.data || []),
            supabase.from('transactions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50).then(res => res.data || [])
          ]);
          const profileData = p;
          if (currentUser.email === 'equitycitadelassociates@gmail.com' && profileData) {
            profileData.is_admin = true;
          }
          setProfile(profileData);
          setPortfolio(port || []);
          setWatchlist(watch || []);
          setFuturesPositions(futures || []);
          setStakingPositions(staking || []);
          setTransactions(txs || []);
          
          // Force refresh if profile is missing but user exists
          if (!p && currentUser) {
            console.log("Profile missing, attempting second handshake...");
            const retryP = await getProfile(currentUser.id).catch(() => null);
            if (retryP) setProfile(retryP);
          }
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
      .channel(`profile-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          const updatedProfile = payload.new;
          if (user.email === 'equitycitadelassociates@gmail.com') updatedProfile.is_admin = true;
          setProfile(updatedProfile);
        }
      })
      .subscribe();

    const portfolioSub = supabase
      .channel(`portfolio-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios', filter: `user_id=eq.${user.id}` }, () => {
        getPortfolio(user.id).then(data => setPortfolio(data || [])).catch(() => setPortfolio([]));
      })
      .subscribe();

    const watchlistSub = supabase
      .channel(`watchlist-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watchlist', filter: `user_id=eq.${user.id}` }, () => {
        getWatchlist(user.id).then(data => setWatchlist(data || [])).catch(() => setWatchlist([]));
      })
      .subscribe();

    const futuresSub = supabase
      .channel(`futures-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'futures_positions', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('futures_positions').select('*').eq('user_id', user.id).eq('is_open', true).then(res => setFuturesPositions(res.data || []));
      })
      .subscribe();

    const stakingSub = supabase
      .channel(`staking-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staking_positions', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('staking_positions').select('*').eq('user_id', user.id).then(res => setStakingPositions(res.data || []));
      })
      .subscribe();

    const transactionsSub = supabase
      .channel(`transactions-changes-${user.id}-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50).then(res => setTransactions(res.data || []));
      })
      .subscribe();

    return () => {
      // Properly remove channels to completely deregister them from the Supabase client
      supabase.removeChannel(profileSub);
      supabase.removeChannel(portfolioSub);
      supabase.removeChannel(watchlistSub);
      supabase.removeChannel(futuresSub);
      supabase.removeChannel(stakingSub);
      supabase.removeChannel(transactionsSub);
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
      .channel(`admin-notifications-${timestamp}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new) {
          const msg = `🔔 NEW USER REGISTRATION: ${payload.new.full_name || 'Anonymous User'} just signed up!`;
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Equity Citadel Admin Alert', { body: msg });
          } else {
            console.log('New User Registered');
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        console.log('Global Admin Notif - Transaction Event:', payload);
        
        // Refresh global pending count
        supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending Verification')
          .then(({ count }) => setPendingAdminCount(count || 0));

        if (payload.eventType === 'INSERT' && payload.new?.status === 'Pending Verification') {
          const msg = `💰 NEW DEPOSIT ALERT: A user just clicked "I have sent the money" for ${payload.new.asset}. Please verify!`;
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Equity Citadel Payment Alert', { body: msg });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pending Verification')
            .then(({ count }) => setPendingAdminCount(count || 0));
        }
      });

    return () => {
      supabase.removeChannel(adminSub);
    };
  }, [profile?.is_admin]);

  return { user, profile, portfolio: portfolio || [], watchlist: watchlist || [], futuresPositions, stakingPositions, transactions, refreshData, loading, error, pendingAdminCount };
};
