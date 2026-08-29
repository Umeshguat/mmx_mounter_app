import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_BASE_URL = 'https://api.mymediaxchange.in/api';

const DEVICE_ID_STORAGE_KEY = 'mmx_device_id';
const API_KEY_STORAGE_KEY = 'mmx_api_key';
const USER_PROFILE_STORAGE_KEY = 'mmx_user_profile';

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

export async function getApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(API_KEY_STORAGE_KEY);
}

export async function setApiKey(apikey: string): Promise<void> {
  await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apikey);
}

export async function clearApiKey(): Promise<void> {
  await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
}

export type UserProfile = {
  name: string;
  mobile?: string;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(USER_PROFILE_STORAGE_KEY);
}

/**
 * Every authenticated request to the MMX API must carry the stored apikey
 * in the "auth" header.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const apikey = await getApiKey();
  return apikey ? { auth: apikey } : {};
}

/**
 * Shared response contract used across the MMX API: { returncode, returnmessage,
 * returndata: { error, errorcode, message, ...payload } }. Parses the response and
 * throws with the server's message when the call or the endpoint reports failure.
 */
async function parseApiResponse<T = any>(response: Response, fallbackErrorMessage: string): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(fallbackErrorMessage);
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    throw new Error(fallbackErrorMessage);
  }

  const returndata = body?.returndata;
  const success = response.ok && body?.returncode === '0' && returndata?.error === false;

  if (!success) {
    const message = returndata?.message || body?.returnmessage || fallbackErrorMessage;
    throw new Error(message);
  }

  return body as T;
}

export type LoginResult = {
  apikey: string;
  name: string;
  mobile?: string;
  loginUserType: string;
  raw: unknown;
};

export async function loginRequest(
  username: string,
  password: string,
  loginusertype: number
): Promise<LoginResult> {
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
        loginusertype,
      }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and the API URL.');
  }

  const body = await parseApiResponse(response, 'Username and password not correct');
  const returndata = body.returndata;

  await setApiKey(returndata.apikey);

  const name = returndata.mounter_name || returndata.vendor_name || returndata.name;
  const mobile = returndata.mobile;

  await setUserProfile({ name, mobile });

  return {
    apikey: returndata.apikey,
    name,
    mobile,
    loginUserType: String(returndata.loginusertype),
    raw: body,
  };
}

export type SelectableVendor = {
  vendorId: number;
  vendorName: string;
};

export async function getSelectableVendors(): Promise<SelectableVendor[]> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/selectvendor`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load vendors. Please try again.');
  const list = body.returndata?.data ?? [];

  return list.map((item: any) => ({
    vendorId: item.vendorid,
    vendorName: item.vendorname,
  }));
}

export type JobProviderDashboardResult = {
  vendorId: number;
  mountingWorklistCount: number;
  mountingRemovalCount: number;
  mounterAssignedCount: number;
  raw: unknown;
};

export async function getJobProviderDashboard(vendorId: string | number): Promise<JobProviderDashboardResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/jobproviderdashboard?vendorid=${vendorId}`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load dashboard. Please try again.');
  const returndata = body.returndata;

  return {
    vendorId: returndata.vendorid,
    mountingWorklistCount: returndata.mounting_worklist_count,
    mountingRemovalCount: returndata.mounting_removal_count,
    mounterAssignedCount: returndata.mounter_assigned_count,
    raw: body,
  };
}

export type MounterDashboardResult = {
  todayWorkCount: number;
  pendingWorkCount: number;
  mountingRemovalCount: number;
  pendingMountingRemovalCount: number;
  advanceWorkCount: number;
  raw: unknown;
};

export async function getMounterDashboard(): Promise<MounterDashboardResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/mounterdashboard`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load dashboard. Please try again.');
  const returndata = body.returndata;

  return {
    todayWorkCount: returndata.today_work_count,
    pendingWorkCount: returndata.pending_work_count,
    mountingRemovalCount: returndata.mounting_removal_count,
    pendingMountingRemovalCount: returndata.pending_mounting_removal_count,
    advanceWorkCount: returndata.advance_work_count,
    raw: body,
  };
}
