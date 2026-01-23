import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('is_banned, ban_reason, ban_expires_at')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!error && data?.is_banned) {
            if (!data.ban_expires_at || new Date(data.ban_expires_at) > new Date()) {
              await supabase.auth.signOut();
              alert(`Vaš nalog je banovan. Razlog: ${data.ban_reason || 'Kršenje pravila'}`);
              setUser(null);
              return;
            }
          }
        }
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (emailOrNickname: string, password: string) => {
    let email = emailOrNickname;

    // Check if input is nickname (no @ symbol)
    if (!emailOrNickname.includes('@')) {
      // Call edge function to get email by nickname
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-email-by-nickname`;
        const headers = {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ nickname: emailOrNickname })
        });

        if (!response.ok) {
          return { error: { message: 'Korisnik sa ovim nadimkom ne postoji' } };
        }

        const data = await response.json();
        email = data.email;
      } catch (err) {
        return { error: { message: 'Greška pri preuzimanju email-a korisnika' } };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
