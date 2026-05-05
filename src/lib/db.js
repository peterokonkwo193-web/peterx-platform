import { supabase } from './supabase';

// Profiles
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfileBalance = async (userId, newBalance) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ usd_balance: newBalance })
    .eq('id', userId);
  if (error) throw error;
  return data;
};

// Portfolios
export const getPortfolio = async (userId) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const updatePortfolio = async (userId, symbol, amount, averagePrice) => {
  const { data, error } = await supabase
    .from('portfolios')
    .upsert({ user_id: userId, symbol, amount, average_price: averagePrice }, { onConflict: 'user_id,symbol' });
  if (error) throw error;
  return data;
};

// Watchlist
export const getWatchlist = async (userId) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const addToWatchlist = async (userId, symbol) => {
  const { data, error } = await supabase
    .from('watchlist')
    .upsert({ user_id: userId, symbol }, { onConflict: 'user_id,symbol' });
  if (error) throw error;
  return data;
};

export const removeFromWatchlist = async (userId, symbol) => {
  const { data, error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('symbol', symbol);
  if (error) throw error;
  return data;
};

// Transactions
export const createTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData]);
  if (error) throw error;
  return data;
};

export const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Alerts
export const createAlert = async (alertData) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alertData]);
  if (error) throw error;
  return data;
};

export const getAlerts = async (userId) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deleteAlert = async (alertId) => {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId);
  if (error) throw error;
};

// Futures Trading
export const openFuturesPosition = async (positionData) => {
  const { data, error } = await supabase
    .from('futures_positions')
    .insert([positionData]);
  if (error) throw error;
  return data;
};

export const getFuturesPositions = async (userId) => {
  const { data, error } = await supabase
    .from('futures_positions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_open', true);
  if (error) throw error;
  return data;
};

export const closeFuturesPosition = async (positionId, exitPrice, pnl) => {
  const { data, error } = await supabase
    .from('futures_positions')
    .update({ is_open: false, updated_at: new Date() })
    .eq('id', positionId);
  if (error) throw error;
  return data;
};

// Institutional Staking
export const stakeAssets = async (stakingData) => {
  const { data, error } = await supabase
    .from('staking_positions')
    .insert([stakingData]);
  if (error) throw error;
  return data;
};

export const getStakingPositions = async (userId) => {
  const { data, error } = await supabase
    .from('staking_positions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const claimStakingRewards = async (positionId, amount) => {
  const { data, error } = await supabase
    .from('staking_positions')
    .update({ rewards_accumulated: 0, updated_at: new Date() })
    .eq('id', positionId);
  if (error) throw error;
  return data;
};
// Investment System
export const createInvestment = async (investmentData) => {
  const { data, error } = await supabase
    .from('investments')
    .insert([investmentData]);
  if (error) throw error;
  return data;
};

export const getInvestments = async (userId) => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateInvestmentStatus = async (investmentId, status) => {
  const { data, error } = await supabase
    .from('investments')
    .update({ status, updated_at: new Date() })
    .eq('id', investmentId);
  if (error) throw error;
  return data;
};
