import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { vendors, type Vendor } from '../data/mockData';
import {
  clearApiKey,
  clearUserProfile,
  getUserProfile,
  loginRequest,
  setSessionInvalidHandler,
  type LoginResult,
  type UserProfile,
} from '../services/api';

type AppState = {
  isLoading: boolean;
  isLoggedIn: boolean;
  vendor: Vendor | null;
  userProfile: UserProfile | null;
  login: (username: string, password: string, loginType: number) => Promise<LoginResult>;
  logout: () => Promise<void>;
  selectVendor: (vendor: Vendor) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'mmx_session';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), getUserProfile()])
      .then(([raw, profile]) => {
        if (raw) {
          const saved = JSON.parse(raw);
          setIsLoggedIn(!!saved.isLoggedIn);
          setVendor(saved.vendor ?? null);
        }
        setUserProfileState(profile);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = async (next: { isLoggedIn: boolean; vendor: Vendor | null }) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const login = async (username: string, password: string, loginType: number) => {
    const result = await loginRequest(username, password, loginType);
    setIsLoggedIn(true);
    setUserProfileState({ name: result.name, mobile: result.mobile, loginUserType: result.loginUserType });
    await persist({ isLoggedIn: true, vendor });
    return result;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setVendor(null);
    setUserProfileState(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await clearApiKey();
    await clearUserProfile();
  };

  // Guards against every in-flight request tripping this at once (e.g. a
  // screen firing several API calls in parallel) — only the first one should
  // actually force the logout + navigation.
  const forcingLogoutRef = useRef(false);

  useEffect(() => {
    setSessionInvalidHandler(() => {
      if (forcingLogoutRef.current) return;
      forcingLogoutRef.current = true;
      logout()
        .catch(() => {})
        .finally(() => {
          router.replace('/login');
          forcingLogoutRef.current = false;
          Alert.alert(
            'Logged out',
            'Your session ended — this account may have been logged in from another device. Please log in again.'
          );
        });
    });
    return () => setSessionInvalidHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectVendor = async (nextVendor: Vendor) => {
    setVendor(nextVendor);
    await persist({ isLoggedIn, vendor: nextVendor });
  };

  const value = useMemo(
    () => ({ isLoading, isLoggedIn, vendor, userProfile, login, logout, selectVendor }),
    [isLoading, isLoggedIn, vendor, userProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { vendors };
