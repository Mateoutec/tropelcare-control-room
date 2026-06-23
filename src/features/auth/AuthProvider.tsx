import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { setTokenGetter } from '../../api/client';
import { tokenStorage } from '../../lib/storage';
import type { LoginRequest, UserDto } from '../../types/api';

interface AuthContextValue {
  status: 'checking' | 'authenticated' | 'anonymous';
  user: UserDto | null;
  token: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [status, setStatus] = useState<AuthContextValue['status']>('checking');
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    setTokenGetter(() => tokenStorage.get());
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await api.login(payload);
    tokenStorage.set(response.token);
    setToken(response.token);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    const existingToken = tokenStorage.get();
    if (!existingToken) {
      setStatus('anonymous');
      return;
    }

    const controller = new AbortController();
    setStatus('checking');
    api
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setToken(existingToken);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        logout();
      });

    return () => controller.abort();
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({ status, user, token, login, logout }), [login, logout, status, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
