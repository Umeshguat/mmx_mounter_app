import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { vendors, type Vendor } from '../data/mockData';

type AppState = {
  isLoading: boolean;
  isLoggedIn: boolean;
  vendor: Vendor | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectVendor: (vendor: Vendor) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'mmx_session';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          setIsLoggedIn(!!saved.isLoggedIn);
          setVendor(saved.vendor ?? null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = async (next: { isLoggedIn: boolean; vendor: Vendor | null }) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const login = async (_username: string, _password: string) => {
    setIsLoggedIn(true);
    await persist({ isLoggedIn: true, vendor });
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setVendor(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const selectVendor = async (nextVendor: Vendor) => {
    setVendor(nextVendor);
    await persist({ isLoggedIn, vendor: nextVendor });
  };

  const value = useMemo(
    () => ({ isLoading, isLoggedIn, vendor, login, logout, selectVendor }),
    [isLoading, isLoggedIn, vendor]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { vendors };
