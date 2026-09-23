import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type SettingsState = {
  geotagPhotos: boolean;
  setGeotagPhotos: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsState | null>(null);

const STORAGE_KEY = 'mmx_geotag_photos';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [geotagPhotos, setGeotagPhotosState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved !== null) setGeotagPhotosState(saved === 'true');
    });
  }, []);

  const setGeotagPhotos = (value: boolean) => {
    setGeotagPhotosState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value));
  };

  const value = useMemo(() => ({ geotagPhotos, setGeotagPhotos }), [geotagPhotos]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
