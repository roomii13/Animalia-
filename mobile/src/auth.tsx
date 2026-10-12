import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';

const SESSION_KEY = 'animalia_session_v1';

export type AuthProfile = {
  id: string;
  username: string;
  displayName: string;
  accountType: 'person' | 'rescue_organization';
  bio: string | null;
  locality: string | null;
};

type AuthContextValue = {
  profile: AuthProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string, accountType: AuthProfile['accountType']) => Promise<void>;
  updateProfile: (input: Pick<AuthProfile, 'displayName' | 'bio' | 'locality'>) => Promise<AuthProfile>;
  signOut: () => Promise<void>;
  authenticatedRequest: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResult = { token: string; profile: AuthProfile };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const savedToken = await SecureStore.getItemAsync(SESSION_KEY).catch(() => null);
      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const result = await apiRequest<{ profile: AuthProfile }>('/api/auth/me', {}, savedToken);
        if (active) {
          setToken(savedToken);
          setProfile(result.profile);
        }
      } catch {
        await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const acceptSession = useCallback(async (result: AuthResult) => {
    await SecureStore.setItemAsync(SESSION_KEY, result.token);
    setToken(result.token);
    setProfile(result.profile);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<AuthResult>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await acceptSession(result);
  }, [acceptSession]);

  const register = useCallback(async (displayName: string, email: string, password: string, accountType: AuthProfile['accountType']) => {
    const result = await apiRequest<AuthResult>('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ displayName, email, password, accountType }),
    });
    await acceptSession(result);
  }, [acceptSession]);

  const updateProfile = useCallback(async (input: Pick<AuthProfile, 'displayName' | 'bio' | 'locality'>) => {
    if (!token) throw Object.assign(new Error('Iniciá sesión para editar tu perfil.'), { status: 401 });
    const result = await apiRequest<{ profile: AuthProfile }>('/api/profiles/me', {
      method: 'PATCH', body: JSON.stringify(input),
    }, token);
    setProfile(result.profile);
    return result.profile;
  }, [token]);

  const signOut = useCallback(async () => {
    const activeToken = token;
    setProfile(null);
    setToken(null);
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    if (activeToken) await apiRequest<void>('/api/auth/logout', { method: 'POST' }, activeToken).catch(() => {});
  }, [token]);

  const authenticatedRequest = useCallback(<T,>(path: string, options: RequestInit = {}) => {
    if (!token) throw Object.assign(new Error('Iniciá sesión para continuar.'), { status: 401 });
    return apiRequest<T>(path, options, token);
  }, [token]);

  const value = useMemo(() => ({ profile, loading, signIn, register, updateProfile, signOut, authenticatedRequest }), [profile, loading, signIn, register, updateProfile, signOut, authenticatedRequest]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
