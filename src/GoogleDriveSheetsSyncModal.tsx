import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  syncDirectFromGoogleSheets,
  OFFICIAL_SHEET_ID,
  OFFICIAL_SHEET_EDIT_URL,
  OFFICIAL_DRIVE_FOLDER_URL,
} from './googleSheetsLiveSync';

// ============================================================================
// 1. إعدادات Firebase ودوال المزامنة مع Google Drive & Sheets
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBS7XsliuZ-ckNo4xWDn4ynsPxOnWdsmwM",
  authDomain: "sntedz2022.firebaseapp.com",
  projectId: "sntedz2022",
  storageBucket: "sntedz2022.firebasestorage.app",
  messagingSenderId: "527050734664",
  appId: "1:527050734664:web:c95b2116fd388b25b9ec7d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.appdata');
provider.addScope('https://www.googleapis.com/auth/drive.activity');
provider.addScope('https://www.googleapis.com/auth/drive.activity.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.photos.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.scripts');
provider.addScope('https://www.googleapis.com/auth/drive.meet.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.install');
provider.addScope('https://www.googleapis.com/auth/drive.apps.readonly');

export const TARGET_FOLDER_ID = '1NFsugrAW9aP8a7THKy4pY4EIwHQzBZaQ';
export const TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}?usp=sharing`;

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم يتم استلام مفتاح الولوج (OAuth Access Token)');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.warn('Google Sign-in Notice:', error?.message || error?.code);
    } else {
      console.error('Google Sign-in Error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const requestGisToken = (): Promise<{ accessToken: string; email?: string }> => {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services غير متاح في المتصفح حالياً'));
      return;
    }
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: '1036791266067-ma8bpt8rr9djbn0ocb0p3645mi5p47sj.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            cachedAccessToken = response.access_token;
            resolve({ accessToken: response.access_token });
          } else {
            reject(new Error('لم يتم استلام مفتاح الولوج'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || err?.type || 'فشلت نافذة المصادقة أو تم حظرها'));
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (e: any) {
      reject(e);
    }
  });
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveSheetFile {
  id: string;
  name: string;
  mimeType?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
}

export const listFolderSpreadsheets = async (token: string): Promise<DriveSheetFile[]> => {
  const query = `'${TARGET_FOLDER_ID}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink)&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.files || [];
};

export const createSpreadsheetInFolder = async (
  token: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<{ spreadsheetId: string; webViewLink: string }> => {
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title, mimeType: 'application/vnd.google-apps.spreadsheet', parents: [TARGET_FOLDER_ID] }),
  });
  if (!createRes.ok) throw new Error('فشل إنشاء جدول البيانات');
  const fileData = await createRes.json();
  const spreadsheetId = fileData.id;

  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const metaData = await metaRes.json();
  const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ range: `${firstSheetTitle}!A1`, majorDimension: 'ROWS', values: [headers, ...rows] }),
  });

  return { spreadsheetId, webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` };
};

export const uploadJsonToFolder = async (token: string, filename: string, dataObject: any): Promise<{ fileId: string; webViewLink: string }> => {
  const metadata = { name: filename, mimeType: 'application/json', parents: [TARGET_FOLDER_ID] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(dataObject, null, 2)], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!res.ok) throw new Error('فشل رفع الملف');
  const fileData = await res.json();
  return { fileId: fileData.id, webViewLink: `https://drive.google.com/file/d/${fileData.id}/view` };
};

export const readSpreadsheetValues = async (token: string, spreadsheetId: string): Promise<{ headers: string[]; rows: string[][] }> => {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!metaRes.ok) throw new Error('فشل الاتصال بجدول البيانات');
  const metaData = await metaRes.json();
  const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!valRes.ok) throw new Error('فشل استرجاع البيانات');
  const valData = await valRes.json();
  const values: string[][] = valData.values || [];
  if (values.length === 0) return { headers: [], rows: [] };
  return { headers: values[0] || [], rows: values.slice(1) || [] };
};

export const normalizeArabicTitle = (t: string) => {
  return (t || '')
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[ةه]/g, 'ه')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/\s*-\s*snte.*$/i, '')
    .replace(/الـ\s*\d+/g, '')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ');
};

export const findMatchingSpreadsheet = (files: DriveSheetFile[], titles: string[]): DriveSheetFile | undefined => {
  const normTargets = titles.map(normalizeArabicTitle);

  // 1. Exact name match first
  for (const t of titles) {
    const f = files.find(file => file.name.trim() === t.trim() && file.mimeType === 'application/vnd.google-apps.spreadsheet');
    if (f) return f;
  }

  // 2. Normalized match (handles 'قاعده' vs 'قاعدة', 'الـ 72', ' - SNTE الموحد')
  for (const nt of normTargets) {
    const f = files.find(file => {
      if (file.mimeType !== 'application/vnd.google-apps.spreadsheet') return false;
      const nfn = normalizeArabicTitle(file.name);
      return nfn === nt || nfn.includes(nt) || nt.includes(nfn);
    });
    if (f) return f;
  }

  return undefined;
};

export const detectFileType = (fileName: string): 'members' | 'finances' | 'minutes' | 'accounts' | 'grievances' | 'package' => {
  const norm = normalizeArabicTitle(fileName);
  if (fileName.endsWith('.json') || norm.includes('package')) return 'package';
  if (norm.includes('منخرط') || norm.includes('قاعده') || norm.includes('قاعدة')) return 'members';
  if (norm.includes('مالي') || norm.includes('اشتراك')) return 'finances';
  if (norm.includes('محاضر') || norm.includes('تنصيب') || norm.includes('جمعيات')) return 'minutes';
  if (norm.includes('هياكل') || norm.includes('امانات') || norm.includes('دليل')) return 'accounts';
  if (norm.includes('نزاع') || norm.includes('عرائض') || norm.includes('انشغال')) return 'grievances';
  return 'members';
};

export const syncSpreadsheetInPlace = async (
  token: string,
  title: string,
  aliases: string[] = [],
  headers: string[],
  rows: (string | number)[][],
  primaryKeyIndex: number = 0,
  secondaryKeyIndex: number = -1,
  tertiaryKeyIndex: number = -1
) => {
  const files = await listFolderSpreadsheets(token);
  const existingFile = findMatchingSpreadsheet(files, [title, ...aliases]);
  
  let spreadsheetId = '';
  let existingRows: string[][] = [];
  let existingHeaders: string[] = [];

  if (existingFile) {
    spreadsheetId = existingFile.id;
    const currentData = await readSpreadsheetValues(token, spreadsheetId);
    existingHeaders = currentData.headers;
    existingRows = currentData.rows;
  } else {
    const created = await createSpreadsheetInFolder(token, title, headers, []);
    spreadsheetId = created.spreadsheetId;
    existingHeaders = headers;
  }

  // 1. الاحتفاظ الكامل بالبيانات السابقة دون تعديل أي قيمة قديمة في الشيت
  const existingKeySet = new Set<string>();
  existingRows.forEach(r => {
    const k1 = (primaryKeyIndex > -1 && r[primaryKeyIndex]) ? String(r[primaryKeyIndex]).trim().toLowerCase() : '';
    const k2 = (secondaryKeyIndex > -1 && r[secondaryKeyIndex]) ? String(r[secondaryKeyIndex]).trim().toLowerCase() : '';
    const k3 = (tertiaryKeyIndex > -1 && r[tertiaryKeyIndex]) ? String(r[tertiaryKeyIndex]).trim().toLowerCase() : '';
    if (k1) existingKeySet.add(k1);
    if (k2) existingKeySet.add(k2);
    if (k3) existingKeySet.add(k3);
  });

  // 2. استخراج وإضافة القيم الجديدة فقط التي لا توجد في الشيت
  const newRowsToAdd: (string | number)[][] = [];
  rows.forEach(r => {
    const k1 = (primaryKeyIndex > -1 && r[primaryKeyIndex]) ? String(r[primaryKeyIndex]).trim().toLowerCase() : '';
    const k2 = (secondaryKeyIndex > -1 && r[secondaryKeyIndex]) ? String(r[secondaryKeyIndex]).trim().toLowerCase() : '';
    const k3 = (tertiaryKeyIndex > -1 && r[tertiaryKeyIndex]) ? String(r[tertiaryKeyIndex]).trim().toLowerCase() : '';

    const alreadyExists = (k1 && existingKeySet.has(k1)) || (k2 && existingKeySet.has(k2)) || (k3 && existingKeySet.has(k3));
    if (!alreadyExists) {
      newRowsToAdd.push(r);
      if (k1) existingKeySet.add(k1);
      if (k2) existingKeySet.add(k2);
      if (k3) existingKeySet.add(k3);
    }
  });

  // في حال لم تكن هناك قيم جديدة، نترك الشيت دون أي مساس
  if (newRowsToAdd.length === 0 && existingRows.length > 0) {
    return {
      spreadsheetId,
      mergedRows: existingRows,
      totalCount: existingRows.length,
      existingCount: existingRows.length,
      addedCount: 0,
      modified: false,
    };
  }

  // 3. الدمج التراكمي: الصفوف القديمة بالكامل دون تغيير يليها الصفوف الجديدة المضافة
  const finalHeaders = existingHeaders.length > 0 ? existingHeaders : headers;
  const finalRows = [...existingRows, ...newRowsToAdd];

  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, { headers: { Authorization: `Bearer ${token}` } });
  const metaData = await metaRes.json();
  const sheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A2:ZZ:clear`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ range: `${sheetTitle}!A1`, majorDimension: 'ROWS', values: [finalHeaders, ...finalRows] }),
  });

  if (!updateRes.ok) throw new Error('فشل تحديث الشيت المدمج');

  return {
    spreadsheetId,
    mergedRows: finalRows,
    totalCount: finalRows.length,
    existingCount: existingRows.length,
    addedCount: newRowsToAdd.length,
    modified: true,
  };
};

export const uploadOrUpdateJsonInFolder = async (token: string, filename: string, dataObject: any) => {
  const files = await listFolderSpreadsheets(token);
  const existingFile = files.find(f => f.name === filename && f.mimeType === 'application/json');

  let mergedData = dataObject;

  if (existingFile) {
    try {
      const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (downloadRes.ok) {
        const remotePackage = await downloadRes.json();
        const rData = remotePackage.data || {};
        const lData = dataObject.data || {};

        // Merge members additively (keep remote intact, append new local)
        const memMap = new Map<string, any>();
        (rData.members || []).forEach((m: any) => {
          const k = m.nationalId || m.id || m.membershipCardNo;
          if (k) memMap.set(String(k).toLowerCase(), m);
        });
        (lData.members || []).forEach((m: any) => {
          const k = m.nationalId || m.id || m.membershipCardNo;
          if (k && !memMap.has(String(k).toLowerCase())) {
            memMap.set(String(k).toLowerCase(), m);
          }
        });

        // Merge minutes additively
        const minMap = new Map<string, any>();
        (rData.minutes || []).forEach((m: any) => {
          const k = m.id || m.biometricCode || m.minuteNumber;
          if (k) minMap.set(String(k).toLowerCase(), m);
        });
        (lData.minutes || []).forEach((m: any) => {
          const k = m.id || m.biometricCode || m.minuteNumber;
          if (k && !minMap.has(String(k).toLowerCase())) {
            minMap.set(String(k).toLowerCase(), m);
          }
        });

        // Merge accounts additively
        const accMap = new Map<string, any>();
        (rData.accounts || []).forEach((a: any) => {
          const k = a.id || a.username || a.wilayaCode;
          if (k) accMap.set(String(k).toLowerCase(), a);
        });
        (lData.accounts || []).forEach((a: any) => {
          const k = a.id || a.username || a.wilayaCode;
          if (k && !accMap.has(String(k).toLowerCase())) {
            accMap.set(String(k).toLowerCase(), a);
          }
        });

        // Merge finances additively
        const finMap = new Map<string, any>();
        (rData.finances || []).forEach((f: any) => {
          const k = f.transactionNo || f.id;
          if (k) finMap.set(String(k).toLowerCase(), f);
        });
        (lData.finances || []).forEach((f: any) => {
          const k = f.transactionNo || f.id;
          if (k && !finMap.has(String(k).toLowerCase())) {
            finMap.set(String(k).toLowerCase(), f);
          }
        });

        // Merge grievances additively
        const griMap = new Map<string, any>();
        (rData.grievances || []).forEach((g: any) => {
          const k = g.ticketNo || g.id;
          if (k) griMap.set(String(k).toLowerCase(), g);
        });
        (lData.grievances || []).forEach((g: any) => {
          const k = g.ticketNo || g.id;
          if (k && !griMap.has(String(k).toLowerCase())) {
            griMap.set(String(k).toLowerCase(), g);
          }
        });

        mergedData = {
          ...remotePackage,
          lastSync: new Date().toISOString(),
          data: {
            ...rData,
            members: Array.from(memMap.values()),
            minutes: Array.from(minMap.values()),
            accounts: Array.from(accMap.values()),
            finances: Array.from(finMap.values()),
            grievances: Array.from(griMap.values()),
            circulars: rData.circulars || lData.circulars || [],
            archives: rData.archives || lData.archives || [],
          }
        };
      }
    } catch (e) {
      console.warn('Could not read existing remote JSON package for merging, using local data', e);
    }

    await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  return uploadJsonToFolder(token, filename, mergedData);
};


// ============================================================================
// 2. مكون واجهة المستخدم (النافذة Modal)
// ============================================================================

export interface GoogleDriveSheetsSyncProps {
  isOpen: boolean;
  onClose: () => void;
  members: any[];
  minutes: any[];
  accounts: any[];
  finances: any[];
  grievances: any[];
  circulars: any[];
  archives: any[];
  onImportMembers?: (imported: any[]) => void;
  onImportMinutes?: (imported: any[]) => void;
  onImportAccounts?: (imported: any[]) => void;
  onImportFinances?: (imported: any[]) => void;
  onImportAll?: (allData: any) => void;
}

export const GoogleDriveSheetsSyncModal: React.FC<GoogleDriveSheetsSyncProps> = ({
  isOpen,
  onClose,
  members,
  minutes,
  accounts,
  finances,
  grievances,
  circulars,
  archives,
  onImportMembers,
  onImportFinances,
  onImportAccounts,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [folderFiles, setFolderFiles] = useState<DriveSheetFile[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'export' | 'import' | 'portable'>('all');
  const [confirmImportFile, setConfirmImportFile] = useState<DriveSheetFile | null>(null);
  const [importType, setImportType] = useState<'members' | 'finances' | 'minutes' | 'accounts' | 'grievances' | 'all'>('members');
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDomainUnauthorized, setIsDomainUnauthorized] = useState(false);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedParentDomain, setCopiedParentDomain] = useState(false);
  const [showManualTokenInput, setShowManualTokenInput] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [isDirectSyncing, setIsDirectSyncing] = useState(false);
  const [lastDirectSync, setLastDirectSync] = useState<string | null>(() => localStorage.getItem('snte_last_sheets_sync'));

  const handleExecuteDirectLiveSync = async () => {
    setIsDirectSyncing(true);
    setStatusMessage({ type: 'info', text: 'جاري الاتصال المباشر والفوري بجدول Google Sheets الرسمي وسحب السجلات...' });
    try {
      const res = await syncDirectFromGoogleSheets();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 تمت المزامنة المباشرة بنجاح بدون نوافذ منبثقة! تم استيراد وتحديث ${res.membersImported} منخرطاً و ${res.minutesImported} محضراً من الشيت الحي.`,
        });
        setLastDirectSync(res.timestamp);
        try {
          const freshMembersRaw = localStorage.getItem('snte_members_v3');
          if (freshMembersRaw && onImportMembers) {
            onImportMembers(JSON.parse(freshMembersRaw));
          }
        } catch {
          // ignore
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: `فشلت المزامنة المباشرة: ${res.error || 'تعذر الاتصال بالشيت'}`,
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `حدث خطأ أثناء المزامنة: ${e?.message || 'تعذر استرجاع البيانات'}`,
      });
    } finally {
      setIsDirectSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initAuth(
        (u, t) => { setToken(t); setUserEmail(u.email); loadFolderFiles(t); },
        () => { setToken(null); setUserEmail(null); }
      );
    }
  }, [isOpen]);

  const loadFolderFiles = async (authToken: string) => {
    try {
      setIsLoading(true);
      const files = await listFolderSpreadsheets(authToken);
      setFolderFiles(files);
    } catch (err: any) {
      console.warn('Could not list folder files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري تسجيل الدخول عبر Google للربط مع Drive & Sheets...' });
    setIsDomainUnauthorized(false);
    setIsPopupBlocked(false);
    try {
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setUserEmail(res.user.email);
        setStatusMessage({ type: 'success', text: `تم الربط بنجاح بحساب: ${res.user.email}` });
        await loadFolderFiles(res.accessToken);
        return;
      }
    } catch (err: any) {
      const isUnauthDomain = err?.code === 'auth/unauthorized-domain' || err?.message?.includes('auth/unauthorized-domain');
      const isPopup = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup') || err?.message?.includes('blocked');
      if (isUnauthDomain) {
        setIsDomainUnauthorized(true);
        setStatusMessage({
          type: 'error',
          text: `فشل تسجيل الدخول: نطاق العمل (${window.location.hostname}) غير مصرح به في Firebase (auth/unauthorized-domain). راجع إرشادات إضافة النطاق أدناه أو استخدم خيار GIS / الرمز المباشر.`,
        });
      } else if (isPopup) {
        setIsPopupBlocked(true);
        setStatusMessage({
          type: 'error',
          text: 'تم حظر النافذة المنبثقة من قبل المتصفح. يُرجى السماح بالنوافذ المنبثقة أو استخدام خيار إدخال الرمز مباشرة.',
        });
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setStatusMessage({ type: 'info', text: 'تم إغلاق نافذة تسجيل الدخول من قبل المستخدم.' });
      } else {
        setStatusMessage({ type: 'error', text: `فشل تسجيل الدخول: ${err.message || 'تم إلغاء العملية'}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGisSignIn = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري فتح نافذة المصادقة المباشرة عبر Google Identity Services...' });
    setIsDomainUnauthorized(false);
    setIsPopupBlocked(false);
    try {
      const gisRes = await requestGisToken();
      if (gisRes?.accessToken) {
        setToken(gisRes.accessToken);
        setUserEmail(gisRes.email || 'حساب Google متصل');
        setStatusMessage({ type: 'success', text: 'تم الربط بنجاح عبر خدمة Google OAuth المباشرة!' });
        await loadFolderFiles(gisRes.accessToken);
        setIsDomainUnauthorized(false);
      }
    } catch (gisErr: any) {
      console.warn('GIS OAuth notice:', gisErr);
      const isPopup = gisErr?.message?.includes('popup') || gisErr?.message?.includes('blocked') || gisErr?.message?.includes('window');
      if (isPopup) {
        setIsPopupBlocked(true);
      }
      setStatusMessage({
        type: 'error',
        text: `تعذر إتمام المصادقة عبر Google GIS: ${gisErr?.message || 'تم حظر النافذة المنبثقة'}. يرجى السماح بالنوافذ المنبثقة من شريط العنوان أو استخدام إدخال مفتاح OAuth أدناه.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyManualToken = async () => {
    const t = manualTokenInput.trim();
    if (!t) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري التحقق من مفتاح الوصول والاتصال بمجلد Drive...' });
    try {
      setToken(t);
      cachedAccessToken = t;
      setUserEmail('مفتاح OAuth مباشر (نشط)');
      await loadFolderFiles(t);
      setStatusMessage({ type: 'success', text: '✅ تم تفعيل مفتاح الوصول بنجاح وتحميل ملفات المجلد المشترك!' });
      setIsDomainUnauthorized(false);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `المفتاح غير صالح أو منتهي الصلاحية: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFinances = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري مزامنة الملف المالي...' });
    try {
      const canonicalTitle = 'الملف المالي والاشتراكات النقابية (50-50)';
      const aliases = ['الملف المالي والاشتراكات النقابية (50-50) - SNTE الموحد', 'الملف المالي', 'سجل الاشتراكات والمالية'];
      const headers = ['معرف المعاملة', 'رقم الوصل الرسمي', 'التاريخ', 'رمز الولاية', 'اسم الولاية', 'نوع العملية المالية', 'المبلغ الإجمالي (دج)', 'الاتجاه', 'حصة الأمانة الولائية (50%)', 'حصة الأمانة الوطنية (50%)', 'المسؤول عن التسجيل', 'البيان والشرح', 'رقم سند التحويل / القبض'];
      const rows = finances.map((f) => {
        const total = Number(f.amount) || 0;
        const half = Math.round(total / 2);
        return [f.id || '', f.transactionNo || '', f.date || '', f.wilayaCode || '', f.wilayaName || '', f.type || 'اشتراك سنوي (100 دج)', total, f.direction || 'إيراد', half, half, f.recordedBy || 'أمين المالية', f.description || '', f.receiptNumber || ''];
      });
      const res = await syncSpreadsheetInPlace(token, canonicalTitle, aliases, headers, rows, 0, 1);
      setStatusMessage({
        type: 'success',
        text: `✅ تمت مزامنة الملف المالي بنجاح! تم الحفاظ على السجلات السابقة (${res.existingCount}) وإضافة (${res.addedCount}) معاملة جديدة. الإجمالي: ${res.totalCount}.`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل مزامنة الملف المالي: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMembers = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري مزامنة قاعدة بيانات المنخرطين...' });
    try {
      const canonicalTitle = 'قاعده بيانات المنخرطين';
      const aliases = ['قاعدة بيانات المنخرطين', 'قاعدة بيانات المنخرطين - SNTE الموحدة', 'سجل المنخرطين', 'قاعده بيانات المنخرطين - SNTE الموحدة'];
      const headers = ['معرف المنخرط', 'الاسم واللقب', 'الجنس', 'رقم التعريف الوطني NIN', 'رقم الضمان الاجتماعي', 'رقم بطاقة الانخراط', 'الولاية', 'البلدية', 'المؤسسة التعليمية', 'الطور التعليمي', 'الرتبة المهنية', 'الصفة النقابية', 'رقم الهاتف', 'البريد الإلكتروني', 'حالة الاشتراك (100 دج)', 'تاريخ الانخراط', 'رابط الصورة الشخصية', 'كود البصمة الإلكترونية'];
      const rows = members.map((m) => [m.id || '', m.fullName || '', m.gender || '', m.nationalId || '', m.socialSecurityNo || '', m.membershipCardNo || '', m.wilayaName || '', m.municipalName || '', m.institutionName || '', m.tier || '', m.jobPosition || '', m.unionRole || '', m.phone || '', m.email || '', m.duesStatus || 'مدفوع', m.joinDate || new Date().toISOString().split('T')[0], m.avatarUrl || '', m.biometricFingerprintCode || '']);
      const res = await syncSpreadsheetInPlace(token, canonicalTitle, aliases, headers, rows, 3, 5, 0);
      setStatusMessage({
        type: 'success',
        text: `✅ تمت مزامنة قاعدة بيانات المنخرطين بنجاح! تم الحفاظ على ${res.existingCount} منخرط سابقين وإضافة ${res.addedCount} منخرط جديد دون أي تعديل على القيم القديمة. الإجمالي: ${res.totalCount}.`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل مزامنة المنخرطين: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMinutes = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري مزامنة سجل محاضر التنصيب...' });
    try {
      const canonicalTitle = 'سجل محاضر التنصيب والجمعيات العامة';
      const aliases = ['سجل محاضر التنصيب والجمعيات العامة - SNTE الموحد', 'محاضر التنصيب والجمعيات العامة', 'محاضر التنصيب'];
      const headers = ['معرف المحضر', 'رقم المحضر الرسمي', 'عنوان المحضر', 'نوع المحضر', 'المستوى', 'الولاية', 'البلدية', 'المؤسسة', 'التاريخ', 'إجمالي أعضاء الجمعية', 'عدد الحضور', 'اكتمال النصاب', 'المشرف على التنصيب', 'حالة الاعتماد', 'رقم البصمة الإلكترونية', 'رابط المحضر في Google Drive'];
      const rows = minutes.map((m) => [m.id || '', m.minuteNumber || '', m.title || '', m.type || '', m.level || '', m.wilayaName || '', m.municipalName || '', m.institutionName || '', m.date || '', m.totalVoters || 0, m.presentCount || 0, m.isQuorumMet ? 'مستوفٍ للنصاب' : 'غير مكتمل النصاب', m.supervisorName || '', m.status || 'معتمد رسمياً', m.electronicStamp || '', m.driveUrl || '']);
      const res = await syncSpreadsheetInPlace(token, canonicalTitle, aliases, headers, rows, 0, 1, 14);
      setStatusMessage({
        type: 'success',
        text: `✅ تمت مزامنة سجل المحاضر بنجاح! تم الحفاظ على ${res.existingCount} محضر وإضافة ${res.addedCount} محضر جديد. الإجمالي: ${res.totalCount}.`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل المزامنة: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAccounts = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري مزامنة دليل الهياكل النقابية والأمانات...' });
    try {
      const canonicalTitle = 'دليل الهياكل النقابية والأمانات الولائية والبلدية';
      const aliases = ['دليل الهياكل النقابية والأمانات الـ 72 - SNTE الموحد', 'دليل الهياكل النقابية والأمانات', 'دليل الهياكل النقابية'];
      const headers = [
        'معرف الهيكل',
        'اسم الهيكل النقابي المؤسساتي',
        'السلم النقابي',
        'رمز الولاية',
        'اسم الولاية',
        'البلدية',
        'مكان المقر ان وجد',
        'الأمين العام المكلف بالعهدة',
        'الصفة والمسؤولية',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'اسم المستخدم للدخول',
        'كلمة المرور الرسمية',
        'الحالة التنظيمية'
      ];
      const rows = accounts.map((a) => [
        a.id || '',
        a.structureName || a.title || '',
        a.level || '',
        a.wilayaCode || '',
        a.wilayaName || '',
        a.municipalName || '',
        a.headquarters || a.institutionName || '',
        a.sgName || a.name || '',
        a.title || a.role || '',
        a.phone || '',
        a.email || '',
        a.username || '',
        a.password || '',
        a.status || 'نشط'
      ]);
      const res = await syncSpreadsheetInPlace(token, canonicalTitle, aliases, headers, rows, 0, 3, 11);
      setStatusMessage({
        type: 'success',
        text: `✅ تمت مزامنة دليل الهياكل بنجاح! الحفاظ على ${res.existingCount} هيكل وإضافة ${res.addedCount} هيكل جديد. الإجمالي: ${res.totalCount}.`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل المزامنة: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportGrievances = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري مزامنة سجل النزاعات والعرائض...' });
    try {
      const canonicalTitle = 'سجل النزاعات والعرائض والانشغالات المهنية';
      const aliases = ['سجل النزاعات والعرائض والانشغالات المهنية - SNTE الموحد', 'سجل النزاعات والعرائض', 'سجل النزاعات'];
      const headers = ['معرف النزاع', 'رقم الملف', 'الموضوع', 'التصنيف', 'الولاية', 'البلدية', 'المؤسسة التربوية', 'الشاكي / الفرع', 'الهاتف', 'تاريخ الإيداع', 'درجة الاستعجال', 'الحالة', 'الإجراء المتخذ'];
      const rows = grievances.map((g) => [g.id || '', g.ticketNo || '', g.subject || '', g.category || '', g.wilayaName || '', g.municipalName || '', g.institutionName || '', g.complainantName || '', g.complainantPhone || '', g.dateFiled || '', g.priority || 'عادي', g.status || 'قيد المعالجة', g.actionTaken || '']);
      const res = await syncSpreadsheetInPlace(token, canonicalTitle, aliases, headers, rows, 0, 1);
      setStatusMessage({
        type: 'success',
        text: `✅ تمت مزامنة سجل النزاعات بنجاح! تم الحفاظ على ${res.existingCount} وإضافة ${res.addedCount} عريضة جديدة. الإجمالي: ${res.totalCount}.`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل المزامنة: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAllToDriveFolder = async () => {
    if (!token) return;
    setIsLoading(true);
    setUploadProgress('جاري المزامنة التراكمية الشاملة لكافة الملفات الـ 6...');
    try {
      setUploadProgress('1/6: جاري تحديث الحزمة السحابية الشاملة snte_complete_database_package.json...');
      await uploadOrUpdateJsonInFolder(token, 'snte_complete_database_package.json', { app: 'SNTE Portal', data: { members, minutes, accounts, finances, grievances, circulars, archives } });
      
      setUploadProgress('2/6: جاري مزامنة قاعده بيانات المنخرطين في Google Sheets...');
      await handleExportMembers();
      
      setUploadProgress('3/6: جاري مزامنة سجل محاضر التنصيب والجمعيات العامة...');
      await handleExportMinutes();
      
      setUploadProgress('4/6: جاري مزامنة دليل الهياكل النقابية والأمانات...');
      await handleExportAccounts();
      
      setUploadProgress('5/6: جاري مزامنة الملف المالي والاشتراكات (50-50)...');
      await handleExportFinances();
      
      setUploadProgress('6/6: جاري مزامنة سجل النزاعات والعرائض والانشغالات...');
      await handleExportGrievances();
      
      setStatusMessage({
        type: 'success',
        text: `🎉 تمت المزامنة التراكمية لكافة الجداول والملفات الـ 6 في Google Drive بنجاح مع إضافة القيم الجديدة وحفظ القيم القديمة كاملة!`,
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشلت المزامنة الشاملة: ${err.message}` });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const handleDownloadOfflinePackage = () => {
    const masterPackage = { app: 'SNTE Portal', data: { members, minutes, accounts, finances, grievances, circulars, archives } };
    const blob = new Blob([JSON.stringify(masterPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snte_master_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // دالة الاستيراد التراكمية: استخراج الأعمدة وإضافة الجديد فقط دون تعديل أو مساس بالبيانات القديمة
  // ============================================================================
  const executeImport = async () => {
    if (!confirmImportFile || !token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `جاري فحص واستيراد البيانات التراكمية من: ${confirmImportFile.name}...` });
    try {
      const isJsonPackage = confirmImportFile.name.endsWith('.json') || confirmImportFile.mimeType === 'application/json';

      if (isJsonPackage) {
        // قراءة حزمة JSON مباشرة من Drive
        const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${confirmImportFile.id}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!downloadRes.ok) throw new Error('تعذر تحميل ملف الحزمة JSON');
        const pkg = await downloadRes.json();
        const data = pkg.data || {};

        let addedMem = 0;
        let addedMin = 0;
        let addedFin = 0;
        let addedAcc = 0;
        let addedGri = 0;

        // 1. المنخرطين
        if (Array.isArray(data.members) && data.members.length > 0) {
          const rawExisting = localStorage.getItem('snte_members_v3');
          const existingMem: any[] = rawExisting ? JSON.parse(rawExisting) : [];
          const keySet = new Set<string>();
          existingMem.forEach(m => {
            if (m.id) keySet.add(String(m.id).trim().toLowerCase());
            if (m.nationalId) keySet.add(String(m.nationalId).trim().toLowerCase());
            if (m.membershipCardNo) keySet.add(String(m.membershipCardNo).trim().toLowerCase());
          });
          const toAdd: any[] = [];
          data.members.forEach((m: any) => {
            const k1 = m.id ? String(m.id).trim().toLowerCase() : '';
            const k2 = m.nationalId ? String(m.nationalId).trim().toLowerCase() : '';
            const k3 = m.membershipCardNo ? String(m.membershipCardNo).trim().toLowerCase() : '';
            const exists = (k1 && keySet.has(k1)) || (k2 && keySet.has(k2)) || (k3 && keySet.has(k3));
            if (!exists) {
              toAdd.push(m);
              if (k1) keySet.add(k1);
              if (k2) keySet.add(k2);
              if (k3) keySet.add(k3);
            }
          });
          if (toAdd.length > 0) {
            const merged = [...existingMem, ...toAdd];
            localStorage.setItem('snte_members_v3', JSON.stringify(merged));
            addedMem = toAdd.length;
            if (onImportMembers) onImportMembers(merged);
            window.dispatchEvent(new CustomEvent('snte-members-updated'));
          }
        }

        // 2. المحاضر
        if (Array.isArray(data.minutes) && data.minutes.length > 0) {
          const rawExisting = localStorage.getItem('snte_minutes_v3');
          const existingMin: any[] = rawExisting ? JSON.parse(rawExisting) : [];
          const minKeySet = new Set<string>();
          existingMin.forEach(m => {
            if (m.id) minKeySet.add(String(m.id).trim().toLowerCase());
            if (m.minuteNumber) minKeySet.add(String(m.minuteNumber).trim().toLowerCase());
          });
          const toAddMin: any[] = [];
          data.minutes.forEach((m: any) => {
            const k1 = m.id ? String(m.id).trim().toLowerCase() : '';
            const k2 = m.minuteNumber ? String(m.minuteNumber).trim().toLowerCase() : '';
            if ((!k1 || !minKeySet.has(k1)) && (!k2 || !minKeySet.has(k2))) {
              toAddMin.push(m);
              if (k1) minKeySet.add(k1);
              if (k2) minKeySet.add(k2);
            }
          });
          if (toAddMin.length > 0) {
            const mergedMin = [...existingMin, ...toAddMin];
            localStorage.setItem('snte_minutes_v3', JSON.stringify(mergedMin));
            addedMin = toAddMin.length;
            window.dispatchEvent(new CustomEvent('snte-minutes-updated'));
          }
        }

        // 3. المالية
        if (Array.isArray(data.finances) && data.finances.length > 0) {
          const rawExisting = localStorage.getItem('snte_finances');
          const existingFin: any[] = rawExisting ? JSON.parse(rawExisting) : [];
          const finKeySet = new Set<string>();
          existingFin.forEach(f => {
            if (f.id) finKeySet.add(String(f.id).trim().toLowerCase());
            if (f.transactionNo) finKeySet.add(String(f.transactionNo).trim().toLowerCase());
          });
          const toAddFin: any[] = [];
          data.finances.forEach((f: any) => {
            const k1 = f.id ? String(f.id).trim().toLowerCase() : '';
            const k2 = f.transactionNo ? String(f.transactionNo).trim().toLowerCase() : '';
            if ((!k1 || !finKeySet.has(k1)) && (!k2 || !finKeySet.has(k2))) {
              toAddFin.push(f);
              if (k1) finKeySet.add(k1);
              if (k2) finKeySet.add(k2);
            }
          });
          if (toAddFin.length > 0) {
            const mergedFin = [...existingFin, ...toAddFin];
            localStorage.setItem('snte_finances', JSON.stringify(mergedFin));
            addedFin = toAddFin.length;
            if (onImportFinances) onImportFinances(mergedFin);
            window.dispatchEvent(new CustomEvent('snte-finances-updated'));
          }
        }

        // 4. الهياكل
        if (Array.isArray(data.accounts) && data.accounts.length > 0) {
          const rawExisting = localStorage.getItem('snte_accounts_v3') || localStorage.getItem('snte_structures_db');
          let existingAcc: any[] = [];
          try {
            if (rawExisting) {
              const p = JSON.parse(rawExisting);
              existingAcc = Array.isArray(p) ? p : (p.accounts || []);
            }
          } catch {}
          const accKeySet = new Set<string>();
          existingAcc.forEach(a => {
            if (a.id) accKeySet.add(String(a.id).trim().toLowerCase());
            if (a.username) accKeySet.add(String(a.username).trim().toLowerCase());
          });
          const toAddAcc: any[] = [];
          data.accounts.forEach((a: any) => {
            const k1 = a.id ? String(a.id).trim().toLowerCase() : '';
            const k2 = a.username ? String(a.username).trim().toLowerCase() : '';
            if ((!k1 || !accKeySet.has(k1)) && (!k2 || !accKeySet.has(k2))) {
              toAddAcc.push(a);
              if (k1) accKeySet.add(k1);
              if (k2) accKeySet.add(k2);
            }
          });
          if (toAddAcc.length > 0) {
            const mergedAcc = [...existingAcc, ...toAddAcc];
            localStorage.setItem('snte_accounts_v3', JSON.stringify(mergedAcc));
            localStorage.setItem('snte_structures_db', JSON.stringify({ accounts: mergedAcc, wilayas: [] }));
            addedAcc = toAddAcc.length;
            if (onImportAccounts) onImportAccounts(mergedAcc);
            window.dispatchEvent(new CustomEvent('snte-structures-updated'));
          }
        }

        // 5. النزاعات
        if (Array.isArray(data.grievances) && data.grievances.length > 0) {
          const rawExisting = localStorage.getItem('snte_grievances');
          const existingGri: any[] = rawExisting ? JSON.parse(rawExisting) : [];
          const griKeySet = new Set<string>();
          existingGri.forEach(g => {
            if (g.id) griKeySet.add(String(g.id).trim().toLowerCase());
            if (g.ticketNo) griKeySet.add(String(g.ticketNo).trim().toLowerCase());
          });
          const toAddGri: any[] = [];
          data.grievances.forEach((g: any) => {
            const k1 = g.id ? String(g.id).trim().toLowerCase() : '';
            const k2 = g.ticketNo ? String(g.ticketNo).trim().toLowerCase() : '';
            if ((!k1 || !griKeySet.has(k1)) && (!k2 || !griKeySet.has(k2))) {
              toAddGri.push(g);
              if (k1) griKeySet.add(k1);
              if (k2) griKeySet.add(k2);
            }
          });
          if (toAddGri.length > 0) {
            const mergedGri = [...existingGri, ...toAddGri];
            localStorage.setItem('snte_grievances', JSON.stringify(mergedGri));
            addedGri = toAddGri.length;
            window.dispatchEvent(new CustomEvent('snte-grievances-updated'));
          }
        }

        setStatusMessage({
          type: 'success',
          text: `🎉 تم استيراد الحزمة الشاملة تراكمياً دون تعديل أي بيانات سابقة! تم إضافة: ${addedMem} منخرط، ${addedMin} محضر، ${addedFin} معاملة، ${addedAcc} هيكل، ${addedGri} عريضة.`
        });
        setConfirmImportFile(null);
        return;
      }

      // معالجة جداول بيانات Google Sheets
      const { headers, rows } = await readSpreadsheetValues(token, confirmImportFile.id);
      const detected = detectFileType(confirmImportFile.name);

      if (detected === 'members') {
        const rawExisting = localStorage.getItem('snte_members_v3');
        const existingMem: any[] = rawExisting ? JSON.parse(rawExisting) : [];
        const keySet = new Set<string>();
        existingMem.forEach(m => {
          if (m.id) keySet.add(String(m.id).trim().toLowerCase());
          if (m.nationalId) keySet.add(String(m.nationalId).trim().toLowerCase());
          if (m.membershipCardNo) keySet.add(String(m.membershipCardNo).trim().toLowerCase());
        });

        const idIdx = headers.findIndex(h => h.includes('معرف'));
        const nameIdx = headers.findIndex(h => h.includes('الاسم') || h.includes('اللقب'));
        const genderIdx = headers.findIndex(h => h.includes('الجنس'));
        const ninIdx = headers.findIndex(h => h.includes('التعريف الوطني') || h.includes('NIN'));
        const ssIdx = headers.findIndex(h => h.includes('الضمان'));
        const cardIdx = headers.findIndex(h => h.includes('بطاقة'));
        const wilayaIdx = headers.findIndex(h => h.includes('الولاية'));
        const muniIdx = headers.findIndex(h => h.includes('البلدية'));
        const instIdx = headers.findIndex(h => h.includes('المؤسسة') || h.includes('المقر'));
        const tierIdx = headers.findIndex(h => h.includes('الطور'));
        const rankIdx = headers.findIndex(h => h.includes('الرتبة'));
        const roleIdx = headers.findIndex(h => h.includes('الصفة') || h.includes('المهمة'));
        const phoneIdx = headers.findIndex(h => h.includes('الهاتف'));
        const emailIdx = headers.findIndex(h => h.includes('البريد'));
        const duesIdx = headers.findIndex(h => h.includes('الاشتراك'));
        const dateIdx = headers.findIndex(h => h.includes('تاريخ'));
        const avatarIdx = headers.findIndex(h => h.includes('الصورة'));
        const bioIdx = headers.findIndex(h => h.includes('البصمة'));

        const newMembersToAdd: any[] = [];
        rows.forEach((r, idx) => {
          const fullName = nameIdx >= 0 ? r[nameIdx]?.trim() : (r[1]?.trim() || '');
          if (!fullName) return;

          const nin = ninIdx >= 0 ? r[ninIdx]?.trim() : (r[3]?.trim() || '');
          const cardNo = cardIdx >= 0 ? r[cardIdx]?.trim() : (r[5]?.trim() || '');
          const id = idIdx >= 0 ? r[idIdx]?.trim() : (r[0]?.trim() || `imp-mem-${idx + 1}`);

          const k1 = id ? id.toLowerCase() : '';
          const k2 = nin ? nin.toLowerCase() : '';
          const k3 = cardNo ? cardNo.toLowerCase() : '';

          const exists = (k1 && keySet.has(k1)) || (k2 && keySet.has(k2)) || (k3 && keySet.has(k3));
          if (!exists) {
            const member = {
              id: id || `snte-mem-${Date.now()}-${idx}`,
              fullName,
              gender: genderIdx >= 0 ? r[genderIdx]?.trim() || 'ذكر' : 'ذكر',
              nationalId: nin,
              socialSecurityNo: ssIdx >= 0 ? r[ssIdx]?.trim() || '' : '',
              membershipCardNo: cardNo || `SNTE-${new Date().getFullYear()}-${String(existingMem.length + newMembersToAdd.length + 1).padStart(4, '0')}`,
              wilayaName: wilayaIdx >= 0 ? r[wilayaIdx]?.trim() || '' : '',
              municipalName: muniIdx >= 0 ? r[muniIdx]?.trim() || '' : '',
              institutionName: instIdx >= 0 ? r[instIdx]?.trim() || '' : '',
              tier: tierIdx >= 0 ? r[tierIdx]?.trim() || '' : '',
              jobPosition: rankIdx >= 0 ? r[rankIdx]?.trim() || '' : '',
              unionRole: roleIdx >= 0 ? r[roleIdx]?.trim() || 'عضو منخرط' : 'عضو منخرط',
              phone: phoneIdx >= 0 ? r[phoneIdx]?.trim() || '' : '',
              email: emailIdx >= 0 ? r[emailIdx]?.trim() || '' : '',
              duesStatus: duesIdx >= 0 ? r[duesIdx]?.trim() || 'مدفوع' : 'مدفوع',
              joinDate: dateIdx >= 0 ? r[dateIdx]?.trim() || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              avatarUrl: avatarIdx >= 0 ? r[avatarIdx]?.trim() || '' : '',
              biometricFingerprintCode: bioIdx >= 0 ? r[bioIdx]?.trim() || '' : '',
              isSyncedWithGoogleSheets: true,
            };
            newMembersToAdd.push(member);
            if (k1) keySet.add(k1);
            if (k2) keySet.add(k2);
            if (k3) keySet.add(k3);
          }
        });

        if (newMembersToAdd.length > 0) {
          const merged = [...existingMem, ...newMembersToAdd];
          localStorage.setItem('snte_members_v3', JSON.stringify(merged));
          if (onImportMembers) onImportMembers(merged);
          window.dispatchEvent(new CustomEvent('snte-members-updated'));
          setStatusMessage({
            type: 'success',
            text: `✅ تم استيراد وإضافة ${newMembersToAdd.length} منخرط جديد بنجاح دون تعديل المنخرطين السابقين (${existingMem.length} منخرط)! الإجمالي: ${merged.length}.`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `جميع المنخرطين في الشيت (${rows.length}) مسجلون مسبقاً في النظام. لم يتم تغيير أي سجل قديم.`
          });
        }
      } else if (detected === 'finances') {
        const rawExisting = localStorage.getItem('snte_finances');
        const existingFin: any[] = rawExisting ? JSON.parse(rawExisting) : [];
        const finKeySet = new Set<string>();
        existingFin.forEach(f => {
          if (f.id) finKeySet.add(String(f.id).trim().toLowerCase());
          if (f.transactionNo) finKeySet.add(String(f.transactionNo).trim().toLowerCase());
        });

        const idIdx = headers.findIndex(h => h.includes('معرف'));
        const transIdx = headers.findIndex(h => h.includes('الوصل') || h.includes('المعاملة'));
        const dateIdx = headers.findIndex(h => h.includes('التاريخ'));
        const codeIdx = headers.findIndex(h => h.includes('رمز الولاية'));
        const wilayaIdx = headers.findIndex(h => h.includes('اسم الولاية'));
        const typeIdx = headers.findIndex(h => h.includes('نوع'));
        const amountIdx = headers.findIndex(h => h.includes('المبلغ'));
        const dirIdx = headers.findIndex(h => h.includes('الاتجاه'));
        const recByIdx = headers.findIndex(h => h.includes('المسؤول'));
        const descIdx = headers.findIndex(h => h.includes('البيان'));

        const newFinancesToAdd: any[] = [];
        rows.forEach((r, idx) => {
          const id = idIdx >= 0 ? r[idIdx]?.trim() : (r[0]?.trim() || `fin-imp-${idx + 1}`);
          const transNo = transIdx >= 0 ? r[transIdx]?.trim() : (r[1]?.trim() || '');
          const k1 = id ? id.toLowerCase() : '';
          const k2 = transNo ? transNo.toLowerCase() : '';

          if ((!k1 || !finKeySet.has(k1)) && (!k2 || !finKeySet.has(k2))) {
            const total = amountIdx >= 0 ? Number(r[amountIdx]) || 0 : 0;
            newFinancesToAdd.push({
              id: id || `fin-${Date.now()}-${idx}`,
              transactionNo: transNo || `TRX-${Date.now()}-${idx}`,
              date: dateIdx >= 0 ? r[dateIdx]?.trim() || '' : '',
              wilayaCode: codeIdx >= 0 ? r[codeIdx]?.trim() || '' : '',
              wilayaName: wilayaIdx >= 0 ? r[wilayaIdx]?.trim() || '' : '',
              type: typeIdx >= 0 ? r[typeIdx]?.trim() || 'اشتراك سنوي (100 دج)' : 'اشتراك سنوي (100 دج)',
              amount: total,
              direction: dirIdx >= 0 ? r[dirIdx]?.trim() || 'إيراد' : 'إيراد',
              wilayaShare: Math.round(total / 2),
              nationalShare: Math.round(total / 2),
              recordedBy: recByIdx >= 0 ? r[recByIdx]?.trim() || 'أمين المالية' : 'أمين المالية',
              description: descIdx >= 0 ? r[descIdx]?.trim() || '' : '',
            });
            if (k1) finKeySet.add(k1);
            if (k2) finKeySet.add(k2);
          }
        });

        if (newFinancesToAdd.length > 0) {
          const merged = [...existingFin, ...newFinancesToAdd];
          localStorage.setItem('snte_finances', JSON.stringify(merged));
          if (onImportFinances) onImportFinances(merged);
          window.dispatchEvent(new CustomEvent('snte-finances-updated'));
          setStatusMessage({
            type: 'success',
            text: `✅ تم استيراد وإضافة ${newFinancesToAdd.length} معاملة مالية جديدة بنجاح دون تعديل المعاملات السابقة!`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `جميع المعاملات المالية في الشيت مسجلة مسبقاً. لم يتم تغيير أي سجل قديم.`
          });
        }
      } else if (detected === 'minutes') {
        const rawExisting = localStorage.getItem('snte_minutes_v3');
        const existingMin: any[] = rawExisting ? JSON.parse(rawExisting) : [];
        const minKeySet = new Set<string>();
        existingMin.forEach(m => {
          if (m.id) minKeySet.add(String(m.id).trim().toLowerCase());
          if (m.minuteNumber) minKeySet.add(String(m.minuteNumber).trim().toLowerCase());
        });

        const idIdx = headers.findIndex(h => h.includes('معرف'));
        const noIdx = headers.findIndex(h => h.includes('رقم المحضر'));
        const titleIdx = headers.findIndex(h => h.includes('عنوان'));
        const typeIdx = headers.findIndex(h => h.includes('نوع'));
        const levelIdx = headers.findIndex(h => h.includes('المستوى'));
        const wilayaIdx = headers.findIndex(h => h.includes('الولاية'));
        const dateIdx = headers.findIndex(h => h.includes('التاريخ'));

        const newMinToAdd: any[] = [];
        rows.forEach((r, idx) => {
          const id = idIdx >= 0 ? r[idIdx]?.trim() : (r[0]?.trim() || `min-imp-${idx + 1}`);
          const minNo = noIdx >= 0 ? r[noIdx]?.trim() : (r[1]?.trim() || '');
          const k1 = id ? id.toLowerCase() : '';
          const k2 = minNo ? minNo.toLowerCase() : '';

          if ((!k1 || !minKeySet.has(k1)) && (!k2 || !minKeySet.has(k2))) {
            newMinToAdd.push({
              id: id || `min-${Date.now()}-${idx}`,
              minuteNumber: minNo || `PV-${Date.now()}-${idx}`,
              title: titleIdx >= 0 ? r[titleIdx]?.trim() || 'محضر رسمي' : 'محضر رسمي',
              type: typeIdx >= 0 ? r[typeIdx]?.trim() || 'محضر تنصيب' : 'محضر تنصيب',
              level: levelIdx >= 0 ? r[levelIdx]?.trim() || 'ولائي' : 'ولائي',
              wilayaName: wilayaIdx >= 0 ? r[wilayaIdx]?.trim() || '' : '',
              date: dateIdx >= 0 ? r[dateIdx]?.trim() || '' : '',
              status: 'معتمد رسمياً',
            });
            if (k1) minKeySet.add(k1);
            if (k2) minKeySet.add(k2);
          }
        });

        if (newMinToAdd.length > 0) {
          const merged = [...existingMin, ...newMinToAdd];
          localStorage.setItem('snte_minutes_v3', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('snte-minutes-updated'));
          setStatusMessage({
            type: 'success',
            text: `✅ تم استيراد وإضافة ${newMinToAdd.length} محضر رسمي جديد بنجاح دون تعديل المحاضر القديمة!`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `جميع المحاضر في الشيت مسجلة مسبقاً. لم يتم تغيير أي سجل.`
          });
        }
      } else if (detected === 'accounts') {
        const rawExisting = localStorage.getItem('snte_accounts_v3') || localStorage.getItem('snte_structures_db');
        let existingAcc: any[] = [];
        try {
          if (rawExisting) {
            const p = JSON.parse(rawExisting);
            existingAcc = Array.isArray(p) ? p : (p.accounts || []);
          }
        } catch {}

        const accKeySet = new Set<string>();
        existingAcc.forEach(a => {
          if (a.id) accKeySet.add(String(a.id).trim().toLowerCase());
          if (a.username) accKeySet.add(String(a.username).trim().toLowerCase());
        });

        const idIdx = headers.findIndex(h => h.includes('معرف'));
        const levelIdx = headers.findIndex(h => h.includes('السلم'));
        const wilayaCodeIdx = headers.findIndex(h => h.includes('رمز الولاية'));
        const wilayaNameIdx = headers.findIndex(h => h.includes('اسم الولاية'));
        const sgNameIdx = headers.findIndex(h => h.includes('الأمين العام'));
        const phoneIdx = headers.findIndex(h => h.includes('الهاتف'));
        const emailIdx = headers.findIndex(h => h.includes('البريد'));
        const usernameIdx = headers.findIndex(h => h.includes('اسم المستخدم'));
        const passIdx = headers.findIndex(h => h.includes('المرور'));
        const statusIdx = headers.findIndex(h => h.includes('الحالة'));

        const newAccountsToAdd: any[] = [];
        const updatedWilayasCache: any[] = [];

        rows.forEach(r => {
          const id = idIdx >= 0 ? r[idIdx] || '' : '';
          const level = levelIdx >= 0 ? r[levelIdx] || '' : '';
          let rawWilayaCode = wilayaCodeIdx >= 0 ? r[wilayaCodeIdx] || '' : '';
          const wilayaName = wilayaNameIdx >= 0 ? r[wilayaNameIdx] || '' : '';
          const sgName = sgNameIdx >= 0 ? r[sgNameIdx] || '' : '';
          const phone = phoneIdx >= 0 ? r[phoneIdx] || '' : '';
          const email = emailIdx >= 0 ? r[emailIdx] || '' : '';
          const username = usernameIdx >= 0 ? r[usernameIdx] || '' : '';
          const password = passIdx >= 0 ? r[passIdx] || '' : '';
          const status = statusIdx >= 0 ? r[statusIdx] || 'نشط' : 'نشط';

          let cleanWilayaCode = rawWilayaCode.replace('wilaya-', '').replace('ولاية-', '').trim();
          if (cleanWilayaCode.length === 1 && !cleanWilayaCode.includes('-')) {
            cleanWilayaCode = cleanWilayaCode.padStart(2, '0');
          }

          const k1 = id ? id.toLowerCase() : '';
          const k2 = username ? username.toLowerCase() : '';

          if ((!k1 || !accKeySet.has(k1)) && (!k2 || !accKeySet.has(k2))) {
            if (username && password) {
              newAccountsToAdd.push({
                id: id || `acc-${Date.now()}`,
                level,
                wilayaCode: cleanWilayaCode,
                wilayaName,
                username,
                password,
                role: level.includes('وطني') ? 'NATIONAL_SG' : 'WILAYA_SG',
                sgName,
                status,
              });
              if (k1) accKeySet.add(k1);
              if (k2) accKeySet.add(k2);
            }
          }

          if (level.includes('ولائي') && cleanWilayaCode) {
            updatedWilayasCache.push({
              code: cleanWilayaCode,
              sgName,
              phone,
              email,
              status,
              username,
              password,
            });
          }
        });

        if (newAccountsToAdd.length > 0) {
          const mergedAcc = [...existingAcc, ...newAccountsToAdd];
          localStorage.setItem('snte_accounts_v3', JSON.stringify(mergedAcc));
          localStorage.setItem('snte_structures_db', JSON.stringify({ accounts: mergedAcc, wilayas: updatedWilayasCache }));
          if (onImportAccounts) onImportAccounts(mergedAcc);
          window.dispatchEvent(new CustomEvent('snte-structures-updated'));
          setStatusMessage({
            type: 'success',
            text: `✅ تم استيراد وإضافة ${newAccountsToAdd.length} حساب هيكل جديد بنجاح دون المساس بالبيانات القديمة!`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `جميع حسابات الهياكل في الشيت مسجلة مسبقاً. لم يتم تغيير أي حساب.`
          });
        }
      } else if (detected === 'grievances') {
        const rawExisting = localStorage.getItem('snte_grievances');
        const existingGri: any[] = rawExisting ? JSON.parse(rawExisting) : [];
        const griKeySet = new Set<string>();
        existingGri.forEach(g => {
          if (g.id) griKeySet.add(String(g.id).trim().toLowerCase());
          if (g.ticketNo) griKeySet.add(String(g.ticketNo).trim().toLowerCase());
        });

        const idIdx = headers.findIndex(h => h.includes('معرف'));
        const ticketIdx = headers.findIndex(h => h.includes('رقم الملف') || h.includes('الملف'));
        const subIdx = headers.findIndex(h => h.includes('الموضوع'));
        const catIdx = headers.findIndex(h => h.includes('التصنيف'));
        const wilayaIdx = headers.findIndex(h => h.includes('الولاية'));
        const compIdx = headers.findIndex(h => h.includes('الشاكي'));
        const phoneIdx = headers.findIndex(h => h.includes('الهاتف'));
        const dateIdx = headers.findIndex(h => h.includes('تاريخ'));

        const newGriToAdd: any[] = [];
        rows.forEach((r, idx) => {
          const id = idIdx >= 0 ? r[idIdx]?.trim() : (r[0]?.trim() || `gri-imp-${idx + 1}`);
          const ticketNo = ticketIdx >= 0 ? r[ticketIdx]?.trim() : (r[1]?.trim() || '');
          const k1 = id ? id.toLowerCase() : '';
          const k2 = ticketNo ? ticketNo.toLowerCase() : '';

          if ((!k1 || !griKeySet.has(k1)) && (!k2 || !griKeySet.has(k2))) {
            newGriToAdd.push({
              id: id || `gri-${Date.now()}-${idx}`,
              ticketNo: ticketNo || `GR-${Date.now()}-${idx}`,
              subject: subIdx >= 0 ? r[subIdx]?.trim() || 'عريضة مهنية' : 'عريضة مهنية',
              category: catIdx >= 0 ? r[catIdx]?.trim() || 'انشغال مهني' : 'انشغال مهني',
              wilayaName: wilayaIdx >= 0 ? r[wilayaIdx]?.trim() || '' : '',
              complainantName: compIdx >= 0 ? r[compIdx]?.trim() || '' : '',
              complainantPhone: phoneIdx >= 0 ? r[phoneIdx]?.trim() || '' : '',
              dateFiled: dateIdx >= 0 ? r[dateIdx]?.trim() || '' : '',
              status: 'قيد المعالجة',
            });
            if (k1) griKeySet.add(k1);
            if (k2) griKeySet.add(k2);
          }
        });

        if (newGriToAdd.length > 0) {
          const merged = [...existingGri, ...newGriToAdd];
          localStorage.setItem('snte_grievances', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('snte-grievances-updated'));
          setStatusMessage({
            type: 'success',
            text: `✅ تم استيراد وإضافة ${newGriToAdd.length} عريضة نزاع جديدة بنجاح دون تعديل القديمة!`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `جميع العرائض والنزاعات في الشيت مسجلة مسبقاً. لم يتم تغيير أي سجل.`
          });
        }
      }

      setConfirmImportFile(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الاستيراد: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-emerald-800/30 max-h-[92vh] flex flex-col font-['Cairo',sans-serif]">
        
        <div className="bg-gradient-to-r from-[#003d1e] via-[#005a2b] to-[#004d26] text-white p-5 flex items-center justify-between border-b border-white/10">
          <h3 className="text-lg font-black mt-0.5">منظومة المزامنة اللحظية (Google Drive & Sheets)</h3>
          <button onClick={onClose} className="text-white hover:text-red-300 p-1.5 cursor-pointer">✕</button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {statusMessage && (
            <div className={`p-3 rounded-2xl border font-bold flex justify-between ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-red-50 text-red-900 border-red-300'}`}>
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)}>✕</button>
            </div>
          )}

          {/* بطاقة المزامنة المباشرة الفورية مع Google Sheets دون نوافذ منبثقة */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#004d26] to-emerald-900 text-white p-5 rounded-3xl border-2 border-emerald-400/60 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      مزامنة مباشرة وفورية (بدون نوافذ منبثقة)
                    </span>
                    <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                      Google Sheets Live CSV
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white mt-1">
                    المزامنة المباشرة مع جدول بيانات قوقل شيتس الرسمي (373 سجلاً حياً)
                  </h4>
                  <p className="text-[11px] text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                    تتصل هذه الخدمة فورياً بقاعدة بيانات الشيت الرسمي التابع للأمانة الوطنية، وتسحب المنخرطين والمحاضر والهياكل مباشرة دون الحاجة لترخيص Firebase أو التعرض لحظر النوافذ المنبثقة.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleExecuteDirectLiveSync}
                  disabled={isDirectSyncing}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className={isDirectSyncing ? 'animate-spin text-base' : 'text-base'}>🔄</span>
                  <span>{isDirectSyncing ? 'جاري المزامنة...' : 'مزامنة مباشرة الآن'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-600/40 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-200">
                <span>آخر مزامنة ناجحة:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {lastDirectSync ? new Date(lastDirectSync).toLocaleString('ar-DZ') : 'لم تتم بعد'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={OFFICIAL_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/20 transition-all flex items-center gap-1 font-bold"
                >
                  <span>📊</span>
                  <span>عرض الشيت على Google ↗</span>
                </a>
                <a
                  href={OFFICIAL_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/20 transition-all flex items-center gap-1 font-bold"
                >
                  <span>📁</span>
                  <span>مجلد Drive المشترك ↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-gray-500 block">حالة الاتصال بحساب Google:</span>
              {token ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-black text-emerald-800 text-sm">{userEmail}</span>
                </div>
              ) : (
                <span className="text-gray-500 font-bold">غير متصل</span>
              )}
            </div>
            {token ? (
              <button onClick={async () => { await googleLogout(); setToken(null); }} className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold cursor-pointer transition-colors">
                تسجيل الخروج
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>🔐</span>
                  <span>تسجيل الدخول عبر Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleGisSignIn}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Google GIS المباشر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualTokenInput(!showManualTokenInput)}
                  className="px-3 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                  title="إدخال رمز الوصول يدوياً"
                >
                  <span>🔑</span>
                  <span>رمز OAuth يدوي</span>
                </button>
              </div>
            )}
          </div>

          {/* تنبيه حظر النوافذ المنبثقة من قبل المتصفح */}
          {isPopupBlocked && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0">🚫</span>
                <div>
                  <h4 className="font-black text-xs text-amber-900">
                    تم حظر النافذة المنبثقة (Pop-up Blocked) من قبل إعدادات المتصفح:
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    لحماية تصفحك، قد يمنع المتصفح فتح نوافذ تسجيل الدخول المنبثقة داخل إطار التطبيق. يمكنك:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-amber-900 mt-1 space-y-1 font-bold">
                    <li>الضغط على أيقونة النافذة المنبثقة (Popup icon) في أعلى شريط عنوان المتصفح واختيار "السماح دائماً بالنوافذ المنبثقة".</li>
                    <li>أو استخدام زر <strong>"🔑 رمز OAuth يدوي"</strong> المتاح أعلاه للصق رمز الوصول والمزامنة فوراً دون نوافذ منبثقة.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* صندوق حل خطأ النطاق غير المصرح به (auth/unauthorized-domain) */}
          {isDomainUnauthorized && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3.5 animate-in fade-in">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                  <h4 className="font-black text-sm text-amber-900">
                    حل مشكلة فشل تسجيل الدخول: Firebase Error (auth/unauthorized-domain)
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    النطاق الذي يعمل عليه التطبيق حالياً غير مضاف إلى قائمة <strong>Authorized Domains (النطاقات المصرح بها)</strong> في مشروع Firebase. يمكنك حل المشكلة في 30 ثانية باتباع الخطوات التالية:
                  </p>
                </div>
              </div>

              {/* النطاق المطلوب إضافته مع زر نسخ */}
              <div className="bg-white/95 p-3.5 rounded-xl border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    1. النطاق المطلوب إضافته في إعدادات Firebase:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 3000);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{copiedDomain ? '✅ تم النسخ إلى الحافظة' : '📋 نسخ اسم النطاق'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="bg-amber-100 text-amber-950 font-mono px-3 py-2 rounded-lg text-xs font-black border border-amber-300 flex-1 select-all break-all" dir="ltr">
                    {window.location.hostname}
                  </code>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-600">
                  <span>💡 نصيحة إضافية: يُنصح أيضاً بإضافة النطاق الأب:</span>
                  <code className="bg-gray-100 font-mono font-bold px-2 py-0.5 rounded border text-gray-800" dir="ltr">run.app</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('run.app');
                      setCopiedParentDomain(true);
                      setTimeout(() => setCopiedParentDomain(false), 3000);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-black text-[11px] cursor-pointer"
                  >
                    {copiedParentDomain ? '✅ تم نسخ run.app' : '(نسخ)'}
                  </button>
                </div>
              </div>

              {/* خطوات الإضافة في Firebase Console */}
              <div className="bg-white/95 p-3.5 rounded-xl border border-amber-300 text-xs space-y-2">
                <span className="font-black text-gray-900 block">2. خطوات التفعيل في وحدة تحكم Firebase (تستغرق ثوانٍ معدودة):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-[11px] leading-relaxed pr-1">
                  <li>افتح وحدة تحكم Firebase: <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-black">console.firebase.google.com ↗</a></li>
                  <li>اختر مشروعك: <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">sntedz2022</span> أو <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">gen-lang-client-0117368802</span></li>
                  <li>انتقل إلى قسم <strong>Authentication (المصادقة)</strong> من القائمة الجانبية.</li>
                  <li>اضغط على تبويب <strong>Settings (الإعدادات)</strong> بالأعلى.</li>
                  <li>في قسم <strong>Authorized domains (النطاقات المصرح بها)</strong> اضغط على <strong>Add domain (إضافة نطاق)</strong>.</li>
                  <li>الصق النطاق المنسوخ أعلاه واضغط <strong>Save (حفظ)</strong>. ثم أعد المحاولة فوراً!</li>
                </ol>
              </div>

              {/* بديل مباشر: إدخال Access Token يدوياً أو التصدير بدون مصادقة */}
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowManualTokenInput(!showManualTokenInput)}
                  className="text-emerald-800 hover:text-emerald-950 font-black underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🔑</span>
                  <span>أو أدخل مفتاح OAuth Access Token يدوياً للمزامنة الفورية الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* نموذج إدخال Access Token اليدوي */}
          {showManualTokenInput && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 space-y-2 animate-in fade-in">
              <label className="block text-xs font-black text-emerald-900">
                🔑 إدخال مفتاح OAuth Access Token يدوياً (للمزامنة المباشرة الفورية):
              </label>
              <p className="text-[11px] text-emerald-800">
                يمكنك لصق رمز الولوج (يبدأ بـ ya29...) من Google OAuth Playground أو أي جلسة معتمدة للاتصال المباشر:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  placeholder="ألصق رمز ya29.a0..."
                  className="flex-1 bg-white border border-emerald-400 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleApplyManualToken}
                  disabled={isLoading || !manualTokenInput.trim()}
                  className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  تفعيل المفتاح
                </button>
              </div>
            </div>
          )}

          <div className="p-5 rounded-3xl bg-amber-500 text-black flex justify-between items-center">
             <div>
                <h4 className="font-black text-lg">المزامنة التراكمية الذكية لكافة الجداول</h4>
                {uploadProgress && <div className="text-xs bg-black text-amber-300 p-1 rounded mt-1">{uploadProgress}</div>}
             </div>
             <button onClick={handleUploadAllToDriveFolder} disabled={!token || isLoading} className="px-6 py-3 bg-[#004d26] text-white font-black rounded-2xl cursor-pointer">مزامنة كافة الشيتات معاً 🔄</button>
          </div>

          <div className="flex gap-2 border-b pb-2">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'all' ? 'bg-[#006633] text-white' : 'bg-gray-100'}`}>مزامنة الشيتات (تصدير)</button>
            <button onClick={() => setActiveTab('import')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'import' ? 'bg-[#006633] text-white' : 'bg-gray-100'}`}>استيراد البيانات</button>
          </div>

          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-[11px] text-emerald-950 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <span className="font-bold">
                    سياسة المزامنة المعتمدة: <strong>إضافة السجلات الجديدة فقط دون تغيير أو حذف أي قيمة قديمة في شيتات Google</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadOfflinePackage}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>💾</span>
                  <span>تنزيل نسخة احتياطية محلية (JSON)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. قاعدة بيانات المنخرطين */}
                <div className="p-4 border-2 border-emerald-600/30 bg-emerald-50/40 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-600 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Google Sheets</span>
                      <span className="text-emerald-700 font-mono font-bold text-[11px]">{members.length} منخرط</span>
                    </div>
                    <h4 className="font-black text-sm text-emerald-950 mb-1">قاعده بيانات المنخرطين</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      سجل المنخرطين، أرقام NIN، أرقام بطاقات الانخراط، المؤسسات التعليمية والرتب.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportMembers}
                    disabled={!token || isLoading}
                    className="w-full bg-[#006633] hover:bg-[#004d26] disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>مزامنة المنخرطين (إضافة الجديد)</span>
                  </button>
                </div>

                {/* 2. سجل محاضر التنصيب */}
                <div className="p-4 border-2 border-blue-600/30 bg-blue-50/40 rounded-2xl shadow-xs flex flex-col justify-between hover:border-blue-600 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-blue-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Google Sheets</span>
                      <span className="text-blue-700 font-mono font-bold text-[11px]">{minutes.length} محضر</span>
                    </div>
                    <h4 className="font-black text-sm text-blue-950 mb-1">سجل محاضر التنصيب والجمعيات العامة</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      المحاضر الرسمية للجمعيات العامة، النصاب القانوني، البصمة الرقمية والاعتمادات.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportMinutes}
                    disabled={!token || isLoading}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>مزامنة المحاضر (إضافة الجديد)</span>
                  </button>
                </div>

                {/* 3. دليل الهياكل النقابية */}
                <div className="p-4 border-2 border-purple-600/30 bg-purple-50/40 rounded-2xl shadow-xs flex flex-col justify-between hover:border-purple-600 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-purple-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Google Sheets</span>
                      <span className="text-purple-700 font-mono font-bold text-[11px]">{accounts.length} هيكل</span>
                    </div>
                    <h4 className="font-black text-sm text-purple-950 mb-1">دليل الهياكل النقابية والأمانات الولائية والبلدية</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      الأمانات الولائية، المكاتب البلدية، الفروع، الأمناء العامون وبيانات الاتصال.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportAccounts}
                    disabled={!token || isLoading}
                    className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>مزامنة الهياكل (إضافة الجديد)</span>
                  </button>
                </div>

                {/* 4. الملف المالي والاشتراكات (50-50) */}
                <div className="p-4 border-2 border-amber-600/30 bg-amber-50/40 rounded-2xl shadow-xs flex flex-col justify-between hover:border-amber-600 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">Google Sheets</span>
                      <span className="text-amber-800 font-mono font-bold text-[11px]">{finances.length} معاملة</span>
                    </div>
                    <h4 className="font-black text-sm text-amber-950 mb-1">الملف المالي والاشتراكات النقابية (50-50)</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      سجل اشتراكات المنخرطين (100 دج)، الحصة الولائية (50%)، والحصة الوطنية (50%).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportFinances}
                    disabled={!token || isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>مزامنة المالية (إضافة الجديد)</span>
                  </button>
                </div>

                {/* 5. سجل النزاعات والعرائض */}
                <div className="p-4 border-2 border-rose-600/30 bg-rose-50/40 rounded-2xl shadow-xs flex flex-col justify-between hover:border-rose-600 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Google Sheets</span>
                      <span className="text-rose-700 font-mono font-bold text-[11px]">{grievances.length} ملف</span>
                    </div>
                    <h4 className="font-black text-sm text-rose-950 mb-1">سجل النزاعات والعرائض والانشغالات المهنية</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      عرائض الموظفين، شكاوى الفروع النقابية، والقرارات المتخذة للمتابعة القانونية.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportGrievances}
                    disabled={!token || isLoading}
                    className="w-full bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>مزامنة النزاعات (إضافة الجديد)</span>
                  </button>
                </div>

                {/* 6. الحزمة الشاملة snte_complete_database_package.json */}
                <div className="p-4 border-2 border-slate-700/30 bg-slate-50 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">JSON Package</span>
                      <span className="text-slate-700 font-mono font-bold text-[11px]">حزمة موحدة شاملة</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 mb-1" dir="ltr">snte_complete_database_package.json</h4>
                    <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                      تضمين كافة بيانات المنظومة في ملف مركزي واحد داخل مجلد Google Drive المشترك.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token) return;
                      setIsLoading(true);
                      setStatusMessage({ type: 'info', text: 'جاري تحديث الحزمة السحابية الشاملة...' });
                      try {
                        await uploadOrUpdateJsonInFolder(token, 'snte_complete_database_package.json', { app: 'SNTE Portal', data: { members, minutes, accounts, finances, grievances, circulars, archives } });
                        setStatusMessage({ type: 'success', text: '✅ تم تحديث الحزمة السحابية الشاملة snte_complete_database_package.json بنجاح!' });
                        await loadFolderFiles(token);
                      } catch (e: any) {
                        setStatusMessage({ type: 'error', text: `فشل رفع الحزمة: ${e.message}` });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={!token || isLoading}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📦</span>
                    <span>مزامنة الحزمة الشاملة (JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-black text-sm text-gray-900">الملفات المتوفرة في مجلد Google Drive المشترك:</h4>
                  <p className="text-[11px] text-gray-500">
                    عند اختيار أي ملف، سيتم دمجه تراكمياً بإضافة السجلات الجديدة فقط إلى النظام المحلي دون المساس بالسجلات القديمة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => token && loadFolderFiles(token)}
                  disabled={!token || isLoading}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>🔄</span>
                  <span>تحديث قائمة الملفات</span>
                </button>
              </div>

              {folderFiles.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-500">
                  {token ? 'لم يتم العثور على ملفات متطابقة في المجلد المشترك حالياً.' : 'يرجى تسجيل الدخول بحساب Google لعرض ملفات المجلد المشترك.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {folderFiles.map((file) => {
                    const detectedType = detectFileType(file.name);
                    const typeLabels: Record<string, { label: string; color: string }> = {
                      members: { label: 'قاعدة المنخرطين', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                      finances: { label: 'الملف المالي (50-50)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                      minutes: { label: 'سجل المحاضر', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                      accounts: { label: 'دليل الهياكل النقابية', color: 'bg-purple-100 text-purple-900 border-purple-300' },
                      grievances: { label: 'سجل النزاعات والعرائض', color: 'bg-rose-100 text-rose-900 border-rose-300' },
                      package: { label: 'حزمة JSON الشاملة', color: 'bg-slate-200 text-slate-900 border-slate-400' },
                    };
                    const badge = typeLabels[detectedType] || { label: 'ملف بيانات', color: 'bg-gray-100 text-gray-800 border-gray-300' };

                    return (
                      <div
                        key={file.id}
                        className="p-3.5 border border-gray-200 hover:border-emerald-500 bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">
                            {file.mimeType?.includes('spreadsheet') ? '📊' : '📦'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-xs text-gray-900">{file.name}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                              ID: {file.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-[11px] transition-colors"
                            >
                              عرض ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmImportFile(file);
                              setImportType(detectedType === 'package' ? 'all' : detectedType);
                            }}
                            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <span>📥</span>
                            <span>استيراد تراكمي</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {confirmImportFile && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white p-6 rounded-3xl text-center max-w-md w-full shadow-2xl border border-emerald-800/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mx-auto">
                  📥
                </div>
                <div>
                  <h4 className="font-black text-base text-gray-900">تأكيد الاستيراد التراكمي الذكي</h4>
                  <p className="text-xs text-emerald-800 font-bold mt-1 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                    {confirmImportFile.name}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-[11px] text-amber-950 text-right space-y-1">
                  <span className="font-black block">🛡️ ضمان الحفاظ على البيانات:</span>
                  <p className="leading-relaxed">
                    سيقوم النظام بقراءة الملف ومقارنته بالسجلات المحلية، ثم إضافة القيم والسجلات الجديدة فقط دون حذف أو تعديل أي سجل قديم محفوظ سابقاً.
                  </p>
                </div>

                <div className="flex gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmImportFile(null)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={executeImport}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl font-black text-xs cursor-pointer shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{isLoading ? 'جاري الاستيراد...' : 'تأكيد الاستيراد التراكمي'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
