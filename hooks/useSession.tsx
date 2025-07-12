import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { isProductionLike, envLog } from '../utils/environment';

interface Session {
  accessToken: string | null;
  userId: string | null;
  firstName: string | null;
  isLoading: boolean;
}

interface SessionContextValue extends Session {
  setAccessToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setFirstName: (firstName: string | null) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({ accessToken: null, userId: null, firstName: null, isLoading: true });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // In staging/production environments, always start with fresh session
        if (isProductionLike()) {
          envLog('Staging environment detected - clearing any existing session data');
          await storage.removeItem('access_token');
          await storage.removeItem('user_id');
          await storage.removeItem('first_name');
          setSession({ accessToken: null, userId: null, firstName: null, isLoading: false });
          return;
        }

        // Development: restore existing session
        const token = await storage.getItem('access_token');
        const userId = await storage.getItem('user_id');
        const firstName = await storage.getItem('first_name');
        setSession({ accessToken: token, userId: userId, firstName: firstName, isLoading: false });
      } catch (e) {
        console.error("Failed to restore session", e);
        setSession({ accessToken: null, userId: null, firstName: null, isLoading: false });
      }
    };

    restoreSession();
  }, []);

  const setAccessToken = async (token: string | null) => {
    if (token) {
      await storage.setItem('access_token', token);
    } else {
      await storage.removeItem('access_token');
    }
    setSession(prev => ({ ...prev, accessToken: token, isLoading: false }));
  };

  const setUserId = async (userId: string | null) => {
    if (userId) {
      await storage.setItem('user_id', userId);
    } else {
      await storage.removeItem('user_id');
    }
    setSession(prev => ({ ...prev, userId: userId }));
  };

  const setFirstName = async (firstName: string | null) => {
    if (firstName) {
      await storage.setItem('first_name', firstName);
    } else {
      await storage.removeItem('first_name');
    }
    setSession(prev => ({ ...prev, firstName: firstName }));
  };

  const signOut = async () => {
    await storage.removeItem('access_token');
    await storage.removeItem('user_id');
    await storage.removeItem('first_name');
    setSession({ accessToken: null, userId: null, firstName: null, isLoading: false });
  };

  return (
    <SessionContext.Provider value={{ ...session, setAccessToken, setUserId, setFirstName, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 