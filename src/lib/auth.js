import { supabase } from './supabase';

export const signUp = async (email, password, fullName, experienceLevel) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        experience_level: experienceLevel
      }
    }
  });
  if (error) throw error;
  
  if (data?.user) {
    try {
      await supabase
        .from('profiles')
        .update({ email: email })
        .eq('id', data.user.id);
    } catch (err) {
      console.warn('[SignUp Auth] Client-side profile email sync deferred:', err);
    }
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
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
