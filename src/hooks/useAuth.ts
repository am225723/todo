'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchAuthData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        setIsAdmin(data.isAdmin);
        return data.user;
      } else {
        // If 401 or error, treat as not logged in (or handle error)
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        return null;
      }
    } catch (error) {
      console.error('Error fetching auth data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await fetchAuthData();
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          router.push('/login');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
           // We need to fetch the profile and admin status again
           await fetchAuthData();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, fetchAuthData]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin,
    isClient: true,
    refreshProfile: async () => { await fetchAuthData(); },
  };
}
