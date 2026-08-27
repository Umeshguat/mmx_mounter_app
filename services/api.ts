import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_BASE_URL = 'https://mymediaxchange.in/api';

const LOGIN_USER_TYPE = 13;
const DEVICE_ID_STORAGE_KEY = 'mmx_device_id';

/**
 * Modern Android/iOS block regular apps from reading the real IMEI, so this
 * falls back to a stable per-install device identifier instead.
 */
export async function getDeviceIdentifier(): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId();
      if (androidId) return androidId;
    } else if (Platform.OS === 'ios') {
      const vendorId = await Application.getIosIdForVendorAsync();
      if (vendorId) return vendorId;
    }
  } catch {
    // fall through to generated fallback
  }

  const cached = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (cached) return cached;

  const generated = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
  return generated;
}

export type LoginResult = {
  token?: string;
  raw: unknown;
};

export async function loginRequest(username: string, password: string): Promise<LoginResult> {
  const imeinumber = await getDeviceIdentifier();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        imeinumber,
        loginusertype: LOGIN_USER_TYPE,
      }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and the API URL.');
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON response, keep body as null
  }

  if (!response.ok) {
    const message = body?.message || body?.error || `Login failed (${response.status})`;
    throw new Error(message);
  }

  return {
    token: body?.token ?? body?.data?.token,
    raw: body,
  };
}
