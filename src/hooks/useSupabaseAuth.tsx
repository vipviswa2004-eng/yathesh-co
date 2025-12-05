import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile with role information
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Query profile table joined with roles table
      const { data, error } = await supabase
        .from('profile')
        .select(`
          id,
          role_id,
          roles:role_id (
            id,
            name
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          user_id: userId,
          email: userEmail,
          role_id: null,
          role_name: null,
        });
        return;
      }

      if (data) {
        // Handle the joined roles data - could be object or array depending on relationship
        const rolesData = data.roles as unknown;
        let roleName: string | null = null;
        
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          roleName = rolesData[0]?.name || null;
        } else if (rolesData && typeof rolesData === 'object' && 'name' in rolesData) {
          roleName = (rolesData as { name: string }).name;
        }
        
        setProfile({
          user_id: userId,
          email: userEmail,
          role_id: data.role_id,
          role_name: roleName,
        });
      } else {
        setProfile({
          user_id: userId,
          email: userEmail,
          role_id: null,
          role_name: null,
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfile({
        user_id: userId,
        email: userEmail,
        role_id: null,
        role_name: null,
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);
        setError(null);

        // Fetch profile after auth state change (using setTimeout to avoid deadlock)
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email || '');
          }, 0);
        } else {
          setProfile(null);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setProfile(null);
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
          
          // Fetch profile for existing session
          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email || '');
          }
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

  return { user, session, loading, error, profile };
};
