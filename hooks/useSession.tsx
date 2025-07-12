import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { isProductionLike, envLog } from '../utils/environment';

interface Session {
  accessToken: string | null;
  userId: string | null;
  isLoading: boolean;
}

interface SessionContextValue extends Session {
  setAccessToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({ accessToken: null, userId: null, isLoading: true });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // In staging/production environments, always start with fresh session
        if (isProductionLike()) {
          envLog('Staging environment detected - clearing any existing session data');
          await storage.removeItem('access_token');
          await storage.removeItem('user_id');
          setSession({ accessToken: null, userId: null, isLoading: false });
          return;
        }

        // Development: restore existing session
        const token = await storage.getItem('access_token');
        const userId = await storage.getItem('user_id');
        setSession({ accessToken: token, userId: userId, isLoading: false });
      } catch (e) {
        console.error("Failed to restore session", e);
        setSession({ accessToken: null, userId: null, isLoading: false });
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

  const signOut = async () => {
    await storage.removeItem('access_token');
    await storage.removeItem('user_id');
    setSession({ accessToken: null, userId: null, isLoading: false });
  };

  return (
    <SessionContext.Provider value={{ ...session, setAccessToken, setUserId, signOut }}>
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