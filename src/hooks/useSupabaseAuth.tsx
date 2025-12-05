import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);
        setError(null);

        // Handle OAuth callback
        if (event === 'SIGNED_IN' && session) {
          // Check if this is an OAuth sign in
          if (session.user.app_metadata?.provider === 'google') {
            console.log('Google OAuth sign in successful');
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }

        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setError(error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err as AuthError);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, error };
};
