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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        .limit(1);

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // First try to sign in with email
    let result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If email login fails, try to find user by username and use their email
    if (result.error && result.error.message.includes('Invalid login credentials')) {
      try {
        // Check if the "email" is actually a username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', email.toLowerCase())
          .limit(1)
          .maybeSingle();

        if (!profileError && profileData) {
          // Get the user's email from auth.users
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileData.id)
            .limit(1)
            .maybeSingle();

          if (!userError && userData) {
            // Get email from auth metadata or use RPC function
            const { data: authUser, error: authError } = await supabase.rpc(
              'get_user_email_by_id', 
              { user_id: profileData.id }
            );

            if (!authError && authUser) {
              result = await supabase.auth.signInWithPassword({
                email: authUser,
                password,
              });
            }
          }
        }
      } catch (usernameError) {
        console.error('Username login attempt failed:', usernameError);
      }
    }
    
    return { data: result.data, error: result.error };
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    // Check if username already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      return { data: null, error: checkError };
    }

    if (existingProfile) {
      return { 
        data: null, 
        error: { message: 'Username already exists' } as any 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName,
        }
      }
    });

    if (data.user && !error) {
      // Wait a bit for the user to be created in auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create profile with retry mechanism
      let retries = 3;
      let profileError = null;
      
      while (retries > 0) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.toLowerCase(),
          display_name: displayName,
          bio: '',
          avatar_url: '',
          website: '',
          twitter: '',
          linkedin: '',
          location: '',
        });
        
        if (!insertError) {
          profileError = null;
          break;
        }
        
        profileError = insertError;
        retries--;
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (profileError) {
        console.error('Profile creation failed:', profileError);
        // Don't return error here, let user sign in and create profile later
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        return { error };
      }
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('Sign out completed successfully');
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out process error:', error);
      return { error };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };
}