import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    session: null,
    profile: null,
    loading: true,
  });

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Error fetching profile:', error.message, 'for userId:', userId);
      return null;
    }
    console.log('Fetched profile:', data);
    return data;
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (!isMounted) return;

      let profileData = null;
      if (existingSession?.user) {
        profileData = await fetchProfile(existingSession.user.id);
      }
      if (!isMounted) return;

      setAuthState({ session: existingSession, profile: profileData, loading: false });
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  async function signUp(email, password, fullName) {
    setAuthState((prev) => ({ ...prev, loading: true }));

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return { error };
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: 'guest',
      });
      if (profileError) {
        setAuthState((prev) => ({ ...prev, loading: false }));
        return { error: profileError };
      }

      const profileData = await fetchProfile(data.user.id);
      console.log('signUp - new user id:', data.user.id, 'profile:', profileData);
      setAuthState({ session: data.session, profile: profileData, loading: false });
    }

    return { data, error: null };
  }

  async function signIn(email, password) {
    setAuthState((prev) => ({ ...prev, loading: true }));

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return { error };
    }

    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      console.log('signIn - user id:', data.user.id, 'profile:', profileData);
      setAuthState({ session: data.session, profile: profileData, loading: false });
    }

    return { data, error: null };
  }

  async function signOut() {
    setAuthState((prev) => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setAuthState({ session: null, profile: null, loading: false });
  }

  const value = {
    session: authState.session,
    profile: authState.profile,
    role: authState.profile?.role ?? null,
    loading: authState.loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}