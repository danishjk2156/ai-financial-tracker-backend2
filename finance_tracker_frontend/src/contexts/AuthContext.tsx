import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../components/Types';
import type { ReactNode } from 'react';
import { login as apiLogin, registerUser, getMe } from '../api/endpoints';
import { setToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserFromApi = async (): Promise<boolean> => {
    try {
      const me = await getMe();
      const backendUser = me.User;
      const derivedEmail = backendUser.username;
      const derivedName = backendUser.username.split('@')[0] || backendUser.username;

      setUser({
        id: backendUser.id,
        username: backendUser.username,
        email: derivedEmail,
        name: derivedName,
      });
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In backend, "username" is what we treat as email here
      const token = await apiLogin(email, password);
      setToken(token.access_token);
      const ok = await loadUserFromApi();
      return ok;
    } catch {
      setToken(null);
      setUser(null);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      // Backend only stores username + password. We pass email as username.
      await registerUser(username, password);
      // After successful registration, immediately log in
      return await login(username, password);
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Check for stored token on initial load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    loadUserFromApi().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
