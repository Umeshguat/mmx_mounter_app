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
  loginUserType: string;
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
  const loginUserType = String(returndata.loginusertype);

  await setUserProfile({ name, mobile, loginUserType });

  return {
    apikey: returndata.apikey,
    name,
    mobile,
    loginUserType,
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

export type JobProviderWorklistType = 'mounting_worklist' | 'mounting_removal' | 'mounter_assigned';

export type JobProviderWorklistResult = {
  items: any[];
  count: number;
  page: number;
  totalPages: number;
};

export async function getJobProviderWorklist(
  type: JobProviderWorklistType,
  vendorId: string | number,
  page = 1
): Promise<JobProviderWorklistResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/app-api/field/jobproviderworklist?type=${type}&vendorid=${vendorId}&page=${page}`,
      { method: 'GET', headers: { ...authHeaders } }
    );
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load worklist. Please try again.');
  const returndata = body.returndata;

  return {
    items: returndata[type] ?? [],
    count: returndata[`${type}_count`] ?? 0,
    page: returndata.page ?? 1,
    totalPages: returndata.total_pages ?? 1,
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

export type MounterWorklistType = 'today' | 'pending' | 'advance' | 'mounting_removal' | 'pending_mounting_removal';

const MOUNTER_WORKLIST_DATA_KEY: Record<MounterWorklistType, string> = {
  today: 'today_work',
  pending: 'pending_work',
  advance: 'advance_work',
  mounting_removal: 'mounting_removal',
  pending_mounting_removal: 'pending_mounting_removal',
};

export type MounterWorklistResult = {
  items: any[];
  count: number;
  page: number;
  totalPages: number;
};

export async function getMounterWorklist(type: MounterWorklistType, page = 1): Promise<MounterWorklistResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/mounterworklist?type=${type}&page=${page}`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load worklist. Please try again.');
  const returndata = body.returndata;
  const dataKey = MOUNTER_WORKLIST_DATA_KEY[type];

  return {
    items: returndata[dataKey] ?? [],
    count: returndata[`${dataKey}_count`] ?? 0,
    page: returndata.page ?? 1,
    totalPages: returndata.total_pages ?? 1,
  };
}

export async function getTaskDetail(cartId: string | number): Promise<any> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/task/${cartId}`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load task details. Please try again.');
  return body.returndata?.data ?? body.returndata;
}

export type FieldMounter = {
  mounterId: number;
  mounterName: string;
  username: string;
  mobile: string;
  address: string;
};

export async function getMounters(): Promise<FieldMounter[]> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/mounterlist`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load mounters. Please try again.');
  const list = body.returndata?.data ?? [];

  return list.map((item: any) => ({
    mounterId: item.mounter_id,
    mounterName: item.mounter_name,
    username: item.username,
    mobile: item.mobile,
    address: item.address,
  }));
}

export type AssignMounterResult = {
  cartId: number;
  mounterId: number;
  mounterName: string;
};

/**
 * Job-provider hands a cart from their own mounting worklist/removal bucket
 * to one of their own mounters. Matches POST /field/task/:cartId/assign-mounter.
 */
export async function assignMounter(cartId: string | number, mounterId: string | number): Promise<AssignMounterResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/task/${cartId}/assign-mounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ mounter_id: mounterId }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not assign mounter. Please try again.');
  const returndata = body.returndata;

  return {
    cartId: returndata.cart_id,
    mounterId: returndata.mounter_id,
    mounterName: returndata.mounter_name,
  };
}

export type TaskPhoto = {
  photoId: number;
  imageUrl: string;
};

export type TaskUpdateResult = {
  cartId: number;
  cartStatus: string;
  mountingPhotosUploaded: number;
  mountingPhotos: TaskPhoto[];
  removalPhotosUploaded: number;
  removalPhotos: TaskPhoto[];
};

export type TaskPhotoUpload = {
  uri: string;
};

// SDK 57's networking stack throws "Unsupported FormDataPart implementation"
// for the classic RN `{ uri, name, type }` object literal, so read each local
// file into a real Blob first (RN's fetch() supports reading file:// URIs)
// and append that instead — a Blob part is universally supported.
async function appendTaskPhotos(form: FormData, field: string, photos: TaskPhotoUpload[]) {
  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    const extMatch = /\.(\w+)$/.exec(photo.uri);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const fileResponse = await fetch(photo.uri);
    const blob = await fileResponse.blob();
    form.append(field, blob, `${field}-${index}.${ext}`);
  }
}

/**
 * Mounter completes a task: uploads mounting and/or removal photos with a
 * remark. Matches POST /field/task/:cartId/update — at least one of
 * mountingPhotos/removalPhotos is required by the server.
 */
export async function updateTask(
  cartId: string | number,
  params: { remarks: string; mountingPhotos?: TaskPhotoUpload[]; removalPhotos?: TaskPhotoUpload[] }
): Promise<TaskUpdateResult> {
  const authHeaders = await getAuthHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    const form = new FormData();
    form.append('remarks', params.remarks);
    await appendTaskPhotos(form, 'mounting_photos', params.mountingPhotos ?? []);
    await appendTaskPhotos(form, 'removal_photos', params.removalPhotos ?? []);

    response = await fetch(`${API_BASE_URL}/app-api/field/task/${cartId}/update`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Upload timed out after 60s. Try again on a stronger connection.');
    }
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    throw new Error(`Could not reach the server (${detail}). Check your connection and try again.`);
  } finally {
    clearTimeout(timeout);
  }

  const body = await parseApiResponse(response, 'Could not update task. Please try again.');
  const returndata = body.returndata;

  return {
    cartId: returndata.cart_id,
    cartStatus: returndata.cart_status,
    mountingPhotosUploaded: returndata.mounting_photos_uploaded ?? 0,
    mountingPhotos: (returndata.mounting_photos ?? []).map((p: any) => ({ photoId: p.photo_id, imageUrl: p.image_url })),
    removalPhotosUploaded: returndata.removal_photos_uploaded ?? 0,
    removalPhotos: (returndata.removal_photos ?? []).map((p: any) => ({ photoId: p.photo_id, imageUrl: p.image_url })),
  };
}
