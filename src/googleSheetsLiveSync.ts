import { WILAYAS_LIST } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';

export const OFFICIAL_SHEET_ID = '12uBmhUooldZDPDIF4pcag8LZTPUIoNM4jc7ZvCrGi_w';
export const OFFICIAL_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${OFFICIAL_SHEET_ID}/gviz/tq?tqx=out:csv`;
export const OFFICIAL_SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${OFFICIAL_SHEET_ID}/edit`;
export const OFFICIAL_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/1NFsugrAW9aP8a7THKy4pY4EIwHQzBZaQ`;

export interface LiveSyncResult {
  success: boolean;
  totalRows: number;
  membersImported: number;
  minutesImported: number;
  wilayasFound: number;
  timestamp: string;
  error?: string;
}

/**
 * Standard CSV parser handling quotes, commas, and newlines correctly
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle \r\n
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    lines.push(currentRow);
  }

  return lines;
}

/**
 * Find wilaya match from location text (e.g. "ولاية: الجلفة", "ولاية تيزي وزو", "الأغواط", "17")
 */
export function resolveWilayaFromLocation(locationText: string): { code: string; name: string } {
  if (!locationText) return { code: '16', name: 'الجزائر' };

  const cleaned = locationText
    .replace(/^ولاية\s*[:\-]?\s*/, '')
    .replace(/^بلدية\s*[:\-]?\s*/, '')
    .replace(/^دائرة\s*[:\-]?\s*/, '')
    .trim();

  // Try exact or contains match in WILAYAS_LIST
  const found = WILAYAS_LIST.find((w) => {
    const wNameClean = w.name.trim();
    return (
      cleaned === wNameClean ||
      cleaned.includes(wNameClean) ||
      wNameClean.includes(cleaned) ||
      cleaned === w.code ||
      w.code === locationText.trim()
    );
  });

  if (found) {
    return { code: found.code, name: found.name };
  }

  return { code: '16', name: cleaned || 'الجزائر' };
}

/**
 * Perform live direct sync from Google Sheets without requiring OAuth popups or external credentials
 */
export async function syncDirectFromGoogleSheets(): Promise<LiveSyncResult> {
  try {
    const response = await fetch(OFFICIAL_SHEET_CSV_URL, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`تعذر الاتصال بجدول البيانات (رمز الاستجابة: ${response.status})`);
    }

    const csvData = await response.text();
    const rows = parseCSV(csvData);

    if (rows.length < 2) {
      throw new Error('ملف الشيت فارغ أو لا يحتوي على بيانات صالحة.');
    }

    const header = rows[0];
    const dataRows = rows.slice(1);

    // Identify column indices flexibly
    const dateIdx = header.findIndex((h) => h.includes('تاريخ') || h.includes('Date'));
    const docTypeIdx = header.findIndex((h) => h.includes('نوع الوثيقة') || h.includes('Type'));
    const locationIdx = header.findIndex((h) => h.includes('الولاية') || h.includes('المؤسسة') || h.includes('المقر'));
    const nameIdx = header.findIndex((h) => h.includes('الاسم') || h.includes('اللقب') || h.includes('Name'));
    const rankIdx = header.findIndex((h) => h.includes('الرتبة') || h.includes('Rank'));
    const ninIdx = header.findIndex((h) => h.includes('NIN') || h.includes('التعريف الوطني'));
    const ssIdx = header.findIndex((h) => h.includes('الضمان الاجتماعي') || h.includes('Social'));
    const roleIdx = header.findIndex((h) => h.includes('المهمة') || h.includes('الصفة') || h.includes('الدور'));
    const workplaceIdx = header.findIndex((h) => h.includes('مكان العمل') || h.includes('المؤسسة'));
    const phoneIdx = header.findIndex((h) => h.includes('الهاتف') || h.includes('Phone'));
    const bioIdx = header.findIndex((h) => h.includes('البصمة') || h.includes('الاليكترونية') || h.includes('Bio'));

    const parsedMembers: MemberData[] = [];
    const minutesMap = new Map<string, any>();
    const foundWilayasSet = new Set<string>();

    dataRows.forEach((row, index) => {
      const fullName = (nameIdx !== -1 ? row[nameIdx] : row[4])?.trim();
      if (!fullName) return; // skip empty rows

      const docDate = (dateIdx !== -1 ? row[dateIdx] : row[0])?.trim() || '2026-10-23';
      const docType = (docTypeIdx !== -1 ? row[docTypeIdx] : row[1])?.trim() || 'محضر تنصيب رسمي';
      const location = (locationIdx !== -1 ? row[locationIdx] : row[2])?.trim() || '';
      const rank = (rankIdx !== -1 ? row[rankIdx] : row[5])?.trim() || 'إطار تربوي';
      const nin = (ninIdx !== -1 ? row[ninIdx] : row[6])?.trim() || '';
      const ssNo = (ssIdx !== -1 ? row[ssIdx] : row[7])?.trim() || '';
      const hierarchyRole = (roleIdx !== -1 ? row[roleIdx] : row[8])?.trim() || 'عضو منخرط';
      const workplace = (workplaceIdx !== -1 ? row[workplaceIdx] : row[9])?.trim() || 'مؤسسة تربوية';
      const phone = (phoneIdx !== -1 ? row[phoneIdx] : row[10])?.trim() || '';
      const bioCode = (bioIdx !== -1 ? row[bioIdx] : row[11])?.trim() || `BIO-${index + 1}`;

      const { code: wilayaCode, name: wilayaName } = resolveWilayaFromLocation(location);
      foundWilayasSet.add(wilayaCode);

      const memberId = nin ? `snte-nin-${nin}` : `snte-sheet-${index + 1}`;
      const cardNo = `SNTE-2026-${String(index + 1).padStart(4, '0')}`;

      const member: MemberData = {
        id: memberId,
        fullName,
        nationalId: nin || `1985${wilayaCode}01${String(index + 1).padStart(8, '0')}`,
        socialSecurityNo: ssNo || `85${wilayaCode}${String(index + 1).padStart(6, '0')}`,
        membershipCardNo: cardNo,
        birthDate: '1985-05-15',
        birthPlace: wilayaName,
        wilayaCode,
        wilayaName,
        municipalName: location.includes('بلدية') ? location.replace(/.*بلدية\s*[:\-]?\s*/, '').trim() : 'المقر',
        institutionName: workplace,
        rank,
        workplace,
        phone,
        email: phone ? `${phone.replace(/\s+/g, '')}@snte.dz` : '',
        hierarchyRole,
        biometricFingerprintCode: bioCode,
        status: 'نشط (معتمد رسمياً - شيت قوقل الحي)',
        membershipStatus: 'active',
        registrationTimestamp: new Date(docDate).getTime() || Date.now(),
        temporaryExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
        duesPaid: true,
        activatedBy: 'مزامنة مباشرة مع Google Sheets',
        activatedAt: docDate,
        joinDate: docDate,
      };

      parsedMembers.push(member);

      // Collect minutes group
      const minuteKey = `${docDate}_${wilayaCode}_${docType}_${bioCode}`;
      if (!minutesMap.has(minuteKey)) {
        minutesMap.set(minuteKey, {
          id: `min-${bioCode || index}`,
          title: `${docType} - ولاية ${wilayaName}`,
          type: docType,
          date: docDate,
          wilayaCode,
          wilayaName,
          biometricCode: bioCode,
          membersCount: 0,
          members: [],
          status: 'معتمد ومؤرشف',
        });
      }
      const minuteGroup = minutesMap.get(minuteKey);
      minuteGroup.membersCount++;
      minuteGroup.members.push({ fullName, rank, hierarchyRole, phone });
    });

    // Merge members with existing localStorage (100% Additive: Do not alter existing values)
    const rawExisting = localStorage.getItem('snte_members_v3');
    const existingList: MemberData[] = rawExisting ? JSON.parse(rawExisting) : [];
    const membersMap = new Map<string, MemberData>();

    // 1. Keep ALL existing members intact (never change old values)
    existingList.forEach((m) => {
      const key = (m.nationalId || m.id || m.membershipCardNo || '').trim().toLowerCase();
      if (key) membersMap.set(key, m);
    });

    // 2. Only add NEW members that do NOT exist yet
    let newMembersAddedCount = 0;
    parsedMembers.forEach((m) => {
      const key = (m.nationalId || m.id || m.membershipCardNo || '').trim().toLowerCase();
      if (key && !membersMap.has(key)) {
        membersMap.set(key, m);
        newMembersAddedCount++;
      }
    });

    const finalMembers = Array.from(membersMap.values());
    localStorage.setItem('snte_members_v3', JSON.stringify(finalMembers));

    // Merge minutes with existing localStorage (100% Additive: Do not alter existing minutes)
    const rawExistingMinutes = localStorage.getItem('snte_minutes_v3');
    const existingMinutes: any[] = rawExistingMinutes ? JSON.parse(rawExistingMinutes) : [];
    const minutesMapFinal = new Map<string, any>();

    // Keep existing minutes intact
    existingMinutes.forEach((min) => {
      const key = (min.id || min.biometricCode || min.minuteNumber || min.title || '').trim().toLowerCase();
      if (key) minutesMapFinal.set(key, min);
    });

    // Only add new minutes
    let newMinutesAddedCount = 0;
    Array.from(minutesMap.values()).forEach((min) => {
      const key = (min.id || min.biometricCode || min.title || '').trim().toLowerCase();
      if (key && !minutesMapFinal.has(key)) {
        minutesMapFinal.set(key, min);
        newMinutesAddedCount++;
      }
    });

    const finalMinutes = Array.from(minutesMapFinal.values());
    localStorage.setItem('snte_minutes_v3', JSON.stringify(finalMinutes));

    const nowIso = new Date().toISOString();
    localStorage.setItem('snte_last_sheets_sync', nowIso);
    localStorage.setItem('snte_live_sheet_records_count', String(parsedMembers.length));

    // Dispatch system events
    window.dispatchEvent(new CustomEvent('snte-members-updated', { detail: { count: finalMembers.length } }));
    window.dispatchEvent(new CustomEvent('snte-minutes-updated', { detail: { count: finalMinutes.length } }));
    window.dispatchEvent(
      new CustomEvent('snte-data-synced', {
        detail: {
          membersCount: parsedMembers.length,
          minutesCount: finalMinutes.length,
          timestamp: nowIso,
        },
      })
    );

    return {
      success: true,
      totalRows: dataRows.length,
      membersImported: parsedMembers.length,
      minutesImported: finalMinutes.length,
      wilayasFound: foundWilayasSet.size,
      timestamp: nowIso,
    };
  } catch (error: any) {
    console.error('Error during direct Google Sheets live sync:', error);
    return {
      success: false,
      totalRows: 0,
      membersImported: 0,
      minutesImported: 0,
      wilayasFound: 0,
      timestamp: new Date().toISOString(),
      error: error?.message || 'فشل الاتصال بالشيت المباشر',
    };
  }
}
