import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  twitter: string;
  linkedin: string;
  location: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_param: username
      });

      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Check if username is available
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        return { 
          data: null, 
          error: { message: 'Username already exists' } 
        };
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            username: username
          }
        }
      });

      if (error) {
        return { data: null, error };
      }

      // Profile will be created automatically by the trigger
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    try {
      let email = usernameOrEmail;
      
      // If it doesn't contain @, it's a username, so we need to get the email
      if (!usernameOrEmail.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', usernameOrEmail)
          .single();

        if (profileError || !profileData) {
          return { data: null, error: { message: 'User not found' } };
        }

        // Get email from auth.users
        const { data: userData, error: userError } = await supabase.rpc('get_user_email_by_id', {
          user_id: profileData.id
        });

        if (userError || !userData) {
          return { data: null, error: { message: 'User not found' } };
        }

        email = userData;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out process error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { data: null, error: { message: 'Not authenticated' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    checkUsernameAvailability
  };
}
