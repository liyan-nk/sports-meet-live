import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UseAuthResult {
  user: User | { email: string; user_metadata?: { name?: string } } | null;
  isAuthorizedAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  // Dev mode login helper when running without real Supabase backend
  devMockLogin: (email: string) => void;
}

const DEV_MOCK_AUTH_KEY = 'sports_meet_dev_admin_email';

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | { email: string; user_metadata?: { name?: string } } | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthorization = useCallback(async (email: string | undefined): Promise<boolean> => {
    if (!email) return false;

    if (!isSupabaseConfigured || !supabase) {
      // In local mock mode, allow any test email containing 'admin' or listed in mock whitelist
      const mockWhitelist = ['admin@example.com', 'sports@example.com', 'admin@sportsmeet.edu'];
      return mockWhitelist.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
    }

    try {
      const { data, error: dbError } = await supabase
        .from('authorized_admins')
        .select('active')
        .ilike('email', email)
        .eq('active', true)
        .maybeSingle();

      if (dbError) {
        console.warn('Error checking authorized_admins table:', dbError.message);
        return false;
      }

      return Boolean(data && data.active);
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        // Mock Auth check from localStorage in local dev mode
        const savedEmail = localStorage.getItem(DEV_MOCK_AUTH_KEY);
        if (savedEmail) {
          const authorized = await checkAuthorization(savedEmail);
          if (isMounted) {
            setUser({ email: savedEmail, user_metadata: { name: 'Dev Admin' } });
            setIsAuthorizedAdmin(authorized);
          }
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAuthorized = await checkAuthorization(session.user.email);
          if (isMounted) {
            setUser(session.user);
            setIsAuthorizedAdmin(isAuthorized);
          }
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Auth initialization failed');
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Listen for Supabase auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const isAuthorized = await checkAuthorization(session.user.email);
          if (isMounted) {
            setUser(session.user);
            setIsAuthorizedAdmin(isAuthorized);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setIsAuthorizedAdmin(false);
            setIsLoading(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthorization]);

  const loginWithGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Prompt for dev email if Supabase environment variables aren't set
      const email = window.prompt('Supabase credentials not configured yet. Enter test admin email (e.g. admin@example.com):', 'admin@example.com');
      if (email) {
        devMockLogin(email);
      }
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  };

  const logout = async () => {
    setError(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEV_MOCK_AUTH_KEY);
    }
    setUser(null);
    setIsAuthorizedAdmin(false);
  };

  const devMockLogin = (email: string) => {
    localStorage.setItem(DEV_MOCK_AUTH_KEY, email);
    const isAuthorized = ['admin@example.com', 'sports@example.com', 'admin@sportsmeet.edu'].includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
    setUser({ email, user_metadata: { name: 'Dev Admin' } });
    setIsAuthorizedAdmin(isAuthorized);
    setIsLoading(false);
  };

  return {
    user,
    isAuthorizedAdmin,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    devMockLogin,
  };
}
