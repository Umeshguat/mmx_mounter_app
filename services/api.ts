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
  // Distinguishes the two loginUserType "12" accounts from each other:
  // "1" = Monitor, "0" (or anything else) = job-provider (other vendor).
  // Absent for mounter accounts (loginUserType "13").
  accountType?: string;
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

// Set by AppProvider so this module (which AppContext already depends on, so
// it can't import AppContext back) can trigger a forced logout + redirect to
// login the moment the server reports the session was invalidated — e.g. the
// same account logging in from another device.
let onSessionInvalid: (() => void) | null = null;

export function setSessionInvalidHandler(handler: (() => void) | null): void {
  onSessionInvalid = handler;
}

// The backend doesn't expose a dedicated errorcode for this case (at least
// none confirmed so far), so this matches on the message text itself.
function isSessionInvalidMessage(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('another device') ||
    normalized.includes('logged in from') ||
    normalized.includes('session expired') ||
    normalized.includes('session has expired') ||
    normalized.includes('invalid session')
  );
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
    if (isSessionInvalidMessage(message)) {
      onSessionInvalid?.();
    }
    throw new Error(message);
  }

  return body as T;
}

export type LoginResult = {
  apikey: string;
  name: string;
  mobile?: string;
  loginUserType: string;
  accountType?: string;
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
  // Only meaningful when loginUserType is "12" (Monitor and "other vendor"
  // job-provider accounts share that same loginusertype, so this is the
  // field that actually tells them apart — see returndata.type in the API).
  const accountType = returndata.type !== undefined ? String(returndata.type) : undefined;

  await setUserProfile({ name, mobile, loginUserType, accountType });

  return {
    apikey: returndata.apikey,
    name,
    mobile,
    loginUserType,
    accountType,
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
  pendingMountingWorklistCount: number;
  mountingRemovalCount: number;
  pendingMountingRemovalCount: number;
  advanceWorkCount: number;
  mounterAssignedCount: number;
  mountingRemovalAssignedCount: number;
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
    mountingWorklistCount: returndata.mounting_worklist_count ?? 0,
    pendingMountingWorklistCount: returndata.mounting_pending_worklist_count ?? 0,
    mountingRemovalCount: returndata.mounting_removal_count ?? 0,
    pendingMountingRemovalCount: returndata.mounting_pending_removal_count ?? 0,
    advanceWorkCount: returndata.advance_work_count ?? 0,
    mounterAssignedCount: returndata.mounter_assigned_count ?? 0,
    mountingRemovalAssignedCount: returndata.mounting_removal_assigned_count ?? 0,
    raw: body,
  };
}

export type JobProviderWorklistType =
  | 'mounting_worklist'
  | 'mounting_pending_worklist'
  | 'mounting_removal'
  | 'mounting_pending_removal'
  | 'advance_work'
  | 'mounter_assigned'
  | 'mounting_removal_assigned';

export type JobProviderWorklistResult = {
  items: any[];
  count: number;
  page: number;
  totalPages: number;
};

export async function getJobProviderWorklist(
  type: JobProviderWorklistType,
  vendorId: string | number,
  page = 1,
  search = ''
): Promise<JobProviderWorklistResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    response = await fetch(
      `${API_BASE_URL}/app-api/field/jobproviderworklist?type=${type}&vendorid=${vendorId}&page=${page}${searchParam}`,
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

export async function getMounterWorklist(
  type: MounterWorklistType,
  page = 1,
  search = ''
): Promise<MounterWorklistResult> {
  const authHeaders = await getAuthHeaders();
  const dataKey = MOUNTER_WORKLIST_DATA_KEY[type];

  let response: Response;
  try {
    const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    response = await fetch(
      `${API_BASE_URL}/app-api/field/mounterworklist?type=${type}&page=${page}${searchParam}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
      }
    );
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load worklist. Please try again.');
  const returndata = body.returndata;

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

export type CompleteTaskResult = {
  cartId: number;
  cartStatus: string;
};

// Only two terminal values are accepted by the server: 5 for a completed
// mounting job, 11 for a completed removal job.
export type CartCompletionStatus = 5 | 11;

/**
 * Mounter marks a task done after its photos are already uploaded (via
 * updateTask above). Matches POST /field/task/:cartId/status.
 */
export async function completeTask(
  cartId: string | number,
  remarks: string,
  cartStatus: CartCompletionStatus
): Promise<CompleteTaskResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/task/${cartId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ remarks, cart_status: cartStatus }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not mark task done. Please try again.');
  const returndata = body.returndata;

  return {
    cartId: returndata.cart_id,
    cartStatus: returndata.cart_status,
  };
}

// ---------------------------------------------------------------------------
// Monitor account APIs (returndata.type === "1" at login). A monitor is
// scoped server-side to a single vendor (returndata.ovendor_id from login),
// so unlike the job-provider endpoints above these never take a vendorid —
// the apikey alone identifies which vendor's worklist to return.
// ---------------------------------------------------------------------------

export type MonitorDashboardResult = {
  todayCount: number;
  pendingCount: number;
};

export async function getMonitorDashboard(): Promise<MonitorDashboardResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/app-api/field/monitordashboard`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load dashboard. Please try again.');
  const returndata = body.returndata;

  return {
    todayCount: returndata.today_count ?? 0,
    pendingCount: returndata.pending_count ?? 0,
  };
}

export type MonitorWorklistType = 'today' | 'pending';

export type MonitorWorklistResult = {
  items: any[];
  count: number;
  page: number;
  totalPages: number;
};

export async function getMonitorWorklist(
  page = 1,
  search = '',
  startDate?: string,
  endDate?: string,
  type?: MonitorWorklistType
): Promise<MonitorWorklistResult> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    const dateParam =
      startDate && endDate
        ? `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
        : '';
    // type=today/pending is a distinct filter mode from the apitype=1 +
    // date-range listing — mixing apitype into a type-filtered request
    // returned no data, so apitype is only sent when type isn't used.
    const baseParam = type ? `type=${encodeURIComponent(type)}` : 'apitype=1';
    response = await fetch(
      `${API_BASE_URL}/app-api/field/monitorworklist?${baseParam}&page=${page}${searchParam}${dateParam}`,
      { method: 'GET', headers: { ...authHeaders } }
    );
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load worklist. Please try again.');
  const returndata = body.returndata;
  const items = returndata.data ?? returndata.monitorworklist ?? (Array.isArray(returndata) ? returndata : []);

  return {
    items,
    count: returndata.count ?? returndata.total ?? items.length,
    page: returndata.page ?? page,
    totalPages: returndata.total_pages ?? 1,
  };
}

export type MonitorPhotoUpload = {
  uri: string;
};

export type MonitorPhotoUploadResult = {
  cartMonitorId: number;
  raw: unknown;
};

// Server-required: 0 = day, 1 = night — whether the photo was taken during
// the day or at night (relevant for lit media like LED/night-light boards).
export type DayType = 0 | 1;

/**
 * Uploads one or more photos for a monitor task. Matches
 * POST /field/monitor/:cartMonitorId/photo.
 */
export async function uploadMonitorPhoto(
  cartMonitorId: string | number,
  photos: MonitorPhotoUpload[],
  dayType: DayType,
  remarks?: string
): Promise<MonitorPhotoUploadResult> {
  const authHeaders = await getAuthHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    const form = new FormData();
    form.append('day_type', String(dayType));
    if (remarks) form.append('remarks', remarks);
    await appendTaskPhotos(form, 'photo', photos);

    response = await fetch(`${API_BASE_URL}/app-api/field/monitor/${cartMonitorId}/photo`, {
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

  const body = await parseApiResponse(response, 'Could not upload photo. Please try again.');
  const returndata = body.returndata;

  return {
    cartMonitorId: returndata.cart_monitor_id ?? Number(cartMonitorId),
    raw: body,
  };
}

export type MonitorUploadedPhotoEntry = {
  photoId: number;
  dayType: string;
  imageUrl: string;
  remarks?: string;
  addedOn?: string;
};

// One row per monitored task, with every photo uploaded for it nested
// inside — confirmed against the real monitoruploadedphotos response
// (not a flat per-photo list, as originally assumed).
export type MonitorUploadedTask = {
  cartMonitorId: number;
  cartId: number;
  orderNumber?: string;
  campaignName?: string;
  mediaId?: number;
  mediaName?: string;
  mediaCode?: string;
  width?: string;
  height?: string;
  size?: string;
  mediaType?: string;
  quantity?: number;
  displayStartDate?: string;
  displayEndDate?: string;
  addedOn?: string;
  clientName?: string;
  lightType?: string;
  uploadOn?: string;
  photos: MonitorUploadedPhotoEntry[];
};

/**
 * History of photos already uploaded via uploadMonitorPhoto, grouped by
 * task, optionally bounded by a date range. Matches
 * GET /field/monitoruploadedphotos?start_date=&end_date=.
 * Dates are passed as-is — callers format them as the backend expects
 * (e.g. YYYY-MM-DD).
 */
export async function getMonitorUploadedPhotos(
  startDate?: string,
  endDate?: string
): Promise<MonitorUploadedTask[]> {
  const authHeaders = await getAuthHeaders();

  let response: Response;
  try {
    const params = new URLSearchParams();
    params.set('start_date', startDate ?? '');
    params.set('end_date', endDate ?? '');
    response = await fetch(`${API_BASE_URL}/app-api/field/monitoruploadedphotos?${params.toString()}`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const body = await parseApiResponse(response, 'Could not load uploaded photos. Please try again.');
  const returndata = body.returndata;
  const list = returndata.data ?? (Array.isArray(returndata) ? returndata : []);

  return list.map((item: any) => ({
    cartMonitorId: item.cart_monitor_id,
    cartId: item.cart_id,
    orderNumber: item.order_number,
    campaignName: item.campaign_name,
    mediaId: item.media_id,
    mediaName: item.media_name,
    mediaCode: item.media_code,
    width: item.width,
    height: item.height,
    size: item.size,
    mediaType: item.media_type,
    quantity: item.quantity,
    displayStartDate: item.display_stdate,
    displayEndDate: item.display_endate,
    addedOn: item.added_on,
    clientName: item.client_name,
    lightType: item.light_type,
    uploadOn: item.upload_on,
    photos: (item.photos ?? []).map((p: any) => ({
      photoId: p.photo_id,
      dayType: p.day_type,
      imageUrl: p.image_url,
      remarks: p.remarks,
      addedOn: p.added_on,
    })),
  }));
}
