import React, { createContext, useContext, useMemo, useState } from 'react';
import { useMockStore } from '../hooks/useMockStore';
import { Role, User } from '../types/traceability';
import { users } from '../data/mockData';

interface AppContextValue {
  user: User | null;
  role: Role | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  store: ReturnType<typeof useMockStore>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const store = useMockStore();

  const login = async (email: string, _password: string, role: Role) => {
    const match = users.find((item) => item.email === email && item.role === role);
    if (!match) {
      throw new Error('Invalid credentials');
    }
    setUser(match);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      login,
      logout,
      store,
    }),
    [user, store],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
