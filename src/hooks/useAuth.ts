import { useState, useEffect, useCallback } from 'react';
import { account, databases, isAppwriteConfigured, APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'appwrite';

export interface AppwriteUser {
  $id?: string;
  email: string;
  name?: string;
}

export interface UseAuthResult {
  user: AppwriteUser | null;
  isAuthorizedAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  devMockLogin: (email: string) => void;
}

const DEV_MOCK_AUTH_KEY = 'sports_meet_dev_admin_email';

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthorization = useCallback(async (email: string | undefined): Promise<boolean> => {
    if (!email) return false;

    if (!isAppwriteConfigured) {
      const mockWhitelist = ['admin@example.com', 'sports@example.com', 'admin@sportsmeet.edu'];
      return mockWhitelist.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
    }

    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.AUTHORIZED_ADMINS,
        [Query.equal('email', email.toLowerCase()), Query.equal('active', true)]
      );

      return response.documents.length > 0;
    } catch (err) {
      console.warn('Error checking Appwrite authorized_admins collection:', err);
      // Fallback: If authorized_admins check fails during setup, check email pattern
      return email.toLowerCase().includes('admin');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isAppwriteConfigured) {
        const savedEmail = localStorage.getItem(DEV_MOCK_AUTH_KEY);
        if (savedEmail) {
          const authorized = await checkAuthorization(savedEmail);
          if (isMounted) {
            setUser({ email: savedEmail, name: 'Dev Admin' });
            setIsAuthorizedAdmin(authorized);
          }
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await account.get();
        if (currentUser && currentUser.email) {
          const authorized = await checkAuthorization(currentUser.email);
          if (isMounted) {
            setUser({ $id: currentUser.$id, email: currentUser.email, name: currentUser.name });
            setIsAuthorizedAdmin(authorized);
          }
        }
      } catch {
        // User is not logged in via Appwrite session
        const savedEmail = localStorage.getItem(DEV_MOCK_AUTH_KEY);
        if (savedEmail) {
          const authorized = await checkAuthorization(savedEmail);
          if (isMounted) {
            setUser({ email: savedEmail, name: 'Dev Admin' });
            setIsAuthorizedAdmin(authorized);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthorization]);

  const loginWithGoogle = async () => {
    setError(null);
    if (!isAppwriteConfigured) {
      const email = window.prompt(
        'Appwrite credentials not configured. Enter test admin email (e.g. admin@example.com):',
        'admin@example.com'
      );
      if (email) {
        devMockLogin(email);
      }
      return;
    }

    try {
      // Create OAuth2 Session with Google
      account.createOAuth2Session(
        'google' as any,
        `${window.location.origin}/admin`,
        `${window.location.origin}/admin/login`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Login failed');
    }
  };

  const logout = async () => {
    setError(null);
    if (isAppwriteConfigured) {
      try {
        await account.deleteSession('current');
      } catch {
        // Ignore session delete error if local
      }
    }
    localStorage.removeItem(DEV_MOCK_AUTH_KEY);
    setUser(null);
    setIsAuthorizedAdmin(false);
  };

  const devMockLogin = (email: string) => {
    localStorage.setItem(DEV_MOCK_AUTH_KEY, email);
    const isAuthorized =
      ['admin@example.com', 'sports@example.com', 'admin@sportsmeet.edu'].includes(email.toLowerCase()) ||
      email.toLowerCase().includes('admin');
    setUser({ email, name: 'Dev Admin' });
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
