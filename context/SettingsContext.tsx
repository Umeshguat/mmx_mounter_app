import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type SettingsState = {
  geotagPhotos: boolean;
  setGeotagPhotos: (value: boolean) => void;
  dateTimeStamp: boolean;
  setDateTimeStamp: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsState | null>(null);

const STORAGE_KEY = 'mmx_geotag_photos';
const DATE_TIME_STORAGE_KEY = 'mmx_date_time_stamp';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [geotagPhotos, setGeotagPhotosState] = useState(true);
  const [dateTimeStamp, setDateTimeStampState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved !== null) setGeotagPhotosState(saved === 'true');
    });
    AsyncStorage.getItem(DATE_TIME_STORAGE_KEY).then((saved) => {
      if (saved !== null) setDateTimeStampState(saved === 'true');
    });
  }, []);

  // Geotag Photos and Add Date & Time are mutually exclusive — only one
  // stamp style is burned into the photo at a time, so switching one on
  // switches the other off.
  const setGeotagPhotos = (value: boolean) => {
    setGeotagPhotosState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value));
    if (value) {
      setDateTimeStampState(false);
      AsyncStorage.setItem(DATE_TIME_STORAGE_KEY, 'false');
    }
  };

  const setDateTimeStamp = (value: boolean) => {
    setDateTimeStampState(value);
    AsyncStorage.setItem(DATE_TIME_STORAGE_KEY, String(value));
    if (value) {
      setGeotagPhotosState(false);
      AsyncStorage.setItem(STORAGE_KEY, 'false');
    }
  };

  const value = useMemo(
    () => ({ geotagPhotos, setGeotagPhotos, dateTimeStamp, setDateTimeStamp }),
    [geotagPhotos, dateTimeStamp]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
