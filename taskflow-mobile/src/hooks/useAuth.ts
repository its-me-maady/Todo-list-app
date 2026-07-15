import { useState, useEffect, useCallback } from 'react';
import { AuthSession, loadSession, saveSession, clearSession } from '../utils/authStorage';
import { api } from '../utils/api';

interface AuthResponse {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
    };
  };
}

let globalSession: AuthSession | null = null;
let listeners: Array<(session: AuthSession | null) => void> = [];
let isAuthLoadedGlobal = false;
let loadedListeners: Array<(loaded: boolean) => void> = [];

function setGlobalSession(session: AuthSession | null) {
  globalSession = session;
  listeners.forEach(l => l(session));
}

function setGlobalLoaded(loaded: boolean) {
  isAuthLoadedGlobal = loaded;
  loadedListeners.forEach(l => l(loaded));
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(globalSession);
  const [isAuthLoaded, setIsAuthLoaded] = useState(isAuthLoadedGlobal);

  useEffect(() => {
    const sListener = (s: AuthSession | null) => setSession(s);
    const lListener = (l: boolean) => setIsAuthLoaded(l);
    listeners.push(sListener);
    loadedListeners.push(lListener);
    return () => {
      listeners = listeners.filter(l => l !== sListener);
      loadedListeners = loadedListeners.filter(l => l !== lListener);
    };
  }, []);

  useEffect(() => {
    async function initAuth() {
      const storedSession = await loadSession();
      if (storedSession) {
        setGlobalSession(storedSession);
      }
      setGlobalLoaded(true);
    }
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const newSession = { token: res.data.token, user: res.data.user };
    await saveSession(newSession);
    setGlobalSession(newSession);
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    // 1. Register on the backend
    await api.post('/auth/register', { email, password });
    
    // 2. Automatically log in the user after successful registration
    await login(email, password);
  }, [login]);

  const logout = useCallback(async (): Promise<void> => {
    await clearSession();
    setGlobalSession(null);
  }, []);

  // Internal helper to clear session if backend returns 401
  const forceLogout = useCallback(async (): Promise<void> => {
    await clearSession();
    setGlobalSession(null);
  }, []);

  return {
    isAuthLoaded,
    isLoggedIn: session !== null,
    user: session?.user ?? null,
    token: session?.token ?? null,
    login,
    register,
    logout,
    forceLogout, // Used by useTasks when receiving a 401 from backend
  };
}
