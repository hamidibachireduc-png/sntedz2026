/**
 * SNTE External Google Sheets Live Synchronization Manager
 * إدارة المزامنة المباشرة مع شيتات قوقل الخارجية وفصل البيانات عن التخزين بالاستضافة
 */

import {
  TARGET_FOLDER_ID,
  createSpreadsheetInFolder,
  readSpreadsheetValues,
  listFolderSpreadsheets,
  getAccessToken,
  DriveSheetFile
} from './google_workspace_sync';

export const MASTER_SHEET_NAME = 'SNTE_2026_Master_Database_الأسنتيو';

export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  errorMessage: string | null;
  recordCounts: {
    members: number;
    minutes: number;
    accounts: number;
    finances: number;
  };
}

const SYNC_META_KEY = 'snte_google_sheets_sync_meta_v1';

export const getSyncMetadata = (): { spreadsheetId: string | null; lastSync: string | null } => {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    return raw ? JSON.parse(raw) : { spreadsheetId: null, lastSync: null };
  } catch {
    return { spreadsheetId: null, lastSync: null };
  }
};

export const saveSyncMetadata = (spreadsheetId: string, lastSync: string) => {
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify({ spreadsheetId, lastSync }));
  } catch (e) {
    console.error('Failed to save sync metadata', e);
  }
};

/**
 * Push current local records into external Google Sheets, ensuring separation from hosting
 */
export const pushAllDataToGoogleSheets = async (
  token: string,
  data: {
    members: any[];
    minutes: any[];
    accounts: any[];
    finances: any[];
    grievances?: any[];
  }
): Promise<{ spreadsheetId: string; webViewLink: string }> => {
  // 1. Prepare members sheet
  const memberHeaders = [
    'معرف المنخرط',
    'رقم بطاقة الانخراط',
    'الاسم واللقب',
    'رقم التعريف الوطني NIN',
    'رقم الضمان الاجتماعي',
    'الولاية',
    'رمز الولاية',
    'البلدية',
    'مؤسسة العمل',
    'الرتبة',
    'مكان العمل',
    'تاريخ الميلاد',
    'الهاتف',
    'البريد الإلكتروني',
    'تاريخ الانخراط',
    'حالة الحساب'
  ];

  const memberRows = data.members.map((m) => [
    m.id || '',
    m.membershipCardNo || '',
    m.fullName || '',
    m.nationalId || '',
    m.socialSecurityNo || '',
    m.wilayaName || '',
    m.wilayaCode || '',
    m.municipalName || '',
    m.institutionName || '',
    m.rank || '',
    m.workplace || '',
    m.birthDate || '',
    m.phone || '',
    m.email || '',
    m.joinDate || '',
    m.status || 'نشط'
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const title = `${MASTER_SHEET_NAME}_${timestamp}`;

  const result = await createSpreadsheetInFolder(token, title, memberHeaders, memberRows);
  saveSyncMetadata(result.spreadsheetId, new Date().toLocaleString('ar-DZ'));

  return result;
};

/**
 * Fetch records from an external Google Sheet and update state
 */
export const pullMembersFromGoogleSheet = async (
  token: string,
  spreadsheetId: string
): Promise<any[]> => {
  const result = await readSpreadsheetValues(token, spreadsheetId);
  const rows = result.rows || [];
  if (rows.length === 0) return [];

  return rows.map((r: string[], idx: number) => ({
    id: r[0] || `mem-gs-${idx}-${Date.now()}`,
    membershipCardNo: r[1] || `SNTE-2026-${String(idx + 1).padStart(4, '0')}`,
    fullName: r[2] || `منخرط ${idx + 1}`,
    nationalId: r[3] || '',
    socialSecurityNo: r[4] || '',
    wilayaName: r[5] || 'الجزائر',
    wilayaCode: r[6] || '16',
    municipalName: r[7] || '',
    institutionName: r[8] || '',
    rank: r[9] || 'أستاذ',
    workplace: r[10] || '',
    birthDate: r[11] || '',
    phone: r[12] || '',
    email: r[13] || '',
    joinDate: r[14] || new Date().toISOString().split('T')[0],
    status: r[15] || 'نشط'
  }));
};
