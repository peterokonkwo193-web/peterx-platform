import { supabase } from './supabase';

export const signUp = async (identifier, password, fullName, experienceLevel) => {
  const isEmail = identifier.includes('@');
  const credentials = isEmail ? { email: identifier, password } : { phone: identifier, password };
  
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        full_name: fullName,
        experience_level: experienceLevel
      }
    }
  });
  if (error) throw error;
  return data;
};

export const signIn = async (identifier, password) => {
  const isEmail = identifier.includes('@');
  const credentials = isEmail ? { email: identifier, password } : { phone: identifier, password };
  
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
};

export const signInWithOAuth = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });
  if (error) throw error;
  return data;
};
