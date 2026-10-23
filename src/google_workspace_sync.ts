import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Provider with requested scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Target Google Drive Folder ID provided by the user
export const TARGET_FOLDER_ID = '1NFsugrAW9aP8a7THKy4pY4EIwHQzBZaQ';
export const TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}?usp=sharing`;

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize listener
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

// Sign in with Google to get access token for Drive & Sheets
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم يتم استلام مفتاح الولوج (OAuth Access Token)');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ----------------------------------------------------
// Google Drive & Sheets Operations
// ----------------------------------------------------

export interface DriveSheetFile {
  id: string;
  name: string;
  mimeType?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
}

// List all Google Sheets and files inside the designated folder
export const listFolderSpreadsheets = async (token: string): Promise<DriveSheetFile[]> => {
  const query = `'${TARGET_FOLDER_ID}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink)&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.warn('Folder files query warning:', err);
    return [];
  }

  const data = await res.json();
  return data.files || [];
};

// Create a new Spreadsheet inside the folder with initial data
export const createSpreadsheetInFolder = async (
  token: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<{ spreadsheetId: string; webViewLink: string }> => {
  // 1. Create file in folder via Drive API
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [TARGET_FOLDER_ID],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل إنشاء جدول البيانات في Google Drive');
  }

  const fileData = await createRes.json();
  const spreadsheetId = fileData.id;

  // 2. Fetch spreadsheet metadata to get the first sheet's title
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const metaData = await metaRes.json();
  const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  // 3. Write data to sheet
  const values = [headers, ...rows];
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${firstSheetTitle}!A1`,
        majorDimension: 'ROWS',
        values: values,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    console.warn('Could not populate initial rows:', err);
  }

  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  return { spreadsheetId, webViewLink };
};

// Upload JSON package directly to Google Drive folder
export const uploadJsonToFolder = async (
  token: string,
  filename: string,
  dataObject: any
): Promise<{ fileId: string; webViewLink: string }> => {
  const metadata = {
    name: filename,
    mimeType: 'application/json',
    parents: [TARGET_FOLDER_ID]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(dataObject, null, 2)], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل رفع ملف حزمة التثبيت إلى المجلد');
  }

  const fileData = await res.json();
  return {
    fileId: fileData.id,
    webViewLink: `https://drive.google.com/file/d/${fileData.id}/view`
  };
};

// Read all values from a spreadsheet
export const readSpreadsheetValues = async (
  token: string,
  spreadsheetId: string
): Promise<{ headers: string[]; rows: string[][] }> => {
  // 1. Get sheet title
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل الاتصال بجدول البيانات');
  }
  const metaData = await metaRes.json();
  const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  // 2. Read values
  const valRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!valRes.ok) {
    const err = await valRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل استرجاع البيانات من الجدول');
  }

  const valData = await valRes.json();
  const values: string[][] = valData.values || [];

  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  return {
    headers: values[0] || [],
    rows: values.slice(1) || [],
  };
};
