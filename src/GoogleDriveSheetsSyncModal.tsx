import React, { useState, useEffect } from 'react';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  initAuth,
  listFolderSpreadsheets,
  createSpreadsheetInFolder,
  uploadJsonToFolder,
  readSpreadsheetValues,
  DriveSheetFile,
  TARGET_FOLDER_ID,
  TARGET_FOLDER_URL
} from './google_workspace_sync';

interface GoogleDriveSheetsSyncProps {
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
  onImportMinutes,
  onImportAccounts,
  onImportFinances,
  onImportAll,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [folderFiles, setFolderFiles] = useState<DriveSheetFile[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'export' | 'import' | 'portable'>('all');
  const [confirmImportFile, setConfirmImportFile] = useState<DriveSheetFile | null>(null);
  const [importType, setImportType] = useState<'members' | 'finances' | 'minutes' | 'accounts' | 'all'>('members');
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Check auth on open
  useEffect(() => {
    if (isOpen) {
      initAuth(
        (u, t) => {
          setToken(t);
          setUserEmail(u.email);
          loadFolderFiles(t);
        },
        () => {
          setToken(null);
          setUserEmail(null);
        }
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
    setStatusMessage({ type: 'info', text: 'جاري تسجيل الدخول عبر Google...' });
    try {
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setUserEmail(res.user.email);
        setStatusMessage({ type: 'success', text: `تم الربط بنجاح بحساب: ${res.user.email}` });
        await loadFolderFiles(res.accessToken);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل تسجيل الدخول: ${err.message || 'تم إلغاء العملية'}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Export Finances (الملف المالي)
  const handleExportFinances = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري إنشاء جدول الملف المالي والاشتراكات في Google Sheets...' });
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const title = `الملف المالي والاشتراكات النقابية (50-50) - SNTE - ${dateStr}`;
      const headers = [
        'معرف المعاملة',
        'رقم الوصل الرسمي',
        'التاريخ',
        'رمز الولاية',
        'اسم الولاية',
        'نوع العملية المالية',
        'المبلغ الإجمالي (دج)',
        'الاتجاه',
        'حصة الأمانة الولائية (50%)',
        'حصة الأمانة الوطنية (50%)',
        'المسؤول عن التسجيل',
        'البيان والشرح',
        'رقم سند التحويل / القبض'
      ];

      const rows = finances.map((f) => {
        const total = Number(f.amount) || 0;
        const half = Math.round(total / 2);
        return [
          f.id || '',
          f.transactionNo || '',
          f.date || '',
          f.wilayaCode || '',
          f.wilayaName || '',
          f.type || 'اشتراك سنوي (100 دج)',
          total,
          f.direction || 'إيراد',
          half,
          half,
          f.recordedBy || 'أمين المالية',
          f.description || '',
          f.receiptNumber || ''
        ];
      });

      await createSpreadsheetInFolder(token, title, headers, rows);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ ${finances.length} سند ومعاملة مالية بنجاح في Google Sheets داخل الفولدر!`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Export Members
  const handleExportMembers = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري إنشاء جدول بيانات المنخرطين في Google Sheets...' });
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const title = `قاعدة بيانات المنخرطين - SNTE - ${dateStr}`;
      const headers = [
        'معرف المنخرط',
        'الاسم واللقب',
        'الجنس',
        'رقم التعريف الوطني NIN',
        'رقم الضمان الاجتماعي',
        'رقم بطاقة الانخراط',
        'الولاية',
        'البلدية',
        'المؤسسة التعليمية',
        'الطور التعليمي',
        'الرتبة المهنية',
        'الصفة النقابية',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'حالة الاشتراك (100 دج)',
        'تاريخ الانخراط'
      ];

      const rows = members.map((m) => [
        m.id || '',
        m.fullName || '',
        m.gender || '',
        m.nationalId || '',
        m.socialSecurityNo || '',
        m.membershipCardNo || '',
        m.wilayaName || '',
        m.municipalName || '',
        m.institutionName || '',
        m.tier || '',
        m.jobPosition || '',
        m.unionRole || '',
        m.phone || '',
        m.email || '',
        m.duesStatus || 'مدفوع',
        m.joinDate || dateStr
      ]);

      await createSpreadsheetInFolder(token, title, headers, rows);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ ${members.length} منخرط بنجاح في Google Sheets داخل المجلد المحدد!`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Export Minutes
  const handleExportMinutes = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري إنشاء جدول بيانات المحاضر الرسمية في Google Sheets...' });
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const title = `سجل محاضر التنصيب والجمعيات العامة - SNTE - ${dateStr}`;
      const headers = [
        'معرف المحضر',
        'رقم المحضر الرسمي',
        'عنوان المحضر',
        'نوع المحضر',
        'المستوى',
        'الولاية',
        'البلدية',
        'المؤسسة',
        'التاريخ',
        'إجمالي أعضاء الجمعية',
        'عدد الحضور',
        'اكتمال النصاب',
        'المشرف على التنصيب',
        'حالة الاعتماد',
        'رقم البصمة الإلكترونية',
        'رابط المحضر في Google Drive'
      ];

      const rows = minutes.map((m) => [
        m.id || '',
        m.minuteNumber || '',
        m.title || '',
        m.type || '',
        m.level || '',
        m.wilayaName || '',
        m.municipalName || '',
        m.institutionName || '',
        m.date || '',
        m.totalVoters || 0,
        m.presentCount || 0,
        m.isQuorumMet ? 'مستوفٍ للنصاب' : 'غير مكتمل النصاب',
        m.supervisorName || '',
        m.status || 'معتمد رسمياً',
        m.electronicStamp || '',
        m.driveUrl || ''
      ]);

      await createSpreadsheetInFolder(token, title, headers, rows);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ ${minutes.length} محضر رسمي بنجاح في Google Sheets!`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Export Accounts & Wilayas
  const handleExportAccounts = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري تصدير دليل الهياكل الولائية والأمانات في Google Sheets...' });
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const title = `دليل الهياكل النقابية والأمانات الولائية والبلدية - SNTE - ${dateStr}`;
      const headers = [
        'معرف الهيكل',
        'اسم الهيكل النقابي المؤسساتي',
        'السلم النقابي',
        'رمز الولاية',
        'اسم الولاية',
        'البلدية',
        'المؤسسة',
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
        a.level === 'national' ? '1. وطني' : a.level === 'wilaya' ? '2. ولائي (72)' : a.level === 'municipal' ? '3. بلدي' : '4. فرع مؤسسة',
        a.wilayaCode || '',
        a.wilayaName || '',
        a.municipalName || '',
        a.institutionName || '',
        a.name || '',
        a.title || '',
        a.phone || '',
        a.email || '',
        a.username || (a.wilayaCode ? `wilaya-${a.wilayaCode}` : a.id),
        a.password || (a.wilayaCode ? `snte2026@${a.wilayaCode}` : 'snte2026'),
        a.status || 'نشط'
      ]);

      await createSpreadsheetInFolder(token, title, headers, rows);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ دليل ${accounts.length} هيكل نقابي بنجاح في Google Sheets!`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Export Grievances
  const handleExportGrievances = async () => {
    if (!token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري إنشاء جدول سجل النزاعات في Google Sheets...' });
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const title = `سجل النزاعات والعرائض والانشغالات المهنية - SNTE - ${dateStr}`;
      const headers = [
        'معرف النزاع',
        'رقم الملف',
        'الموضوع',
        'التصنيف',
        'الولاية',
        'البلدية',
        'المؤسسة التربوية',
        'الشاكي / الفرع',
        'الهاتف',
        'تاريخ الإيداع',
        'درجة الاستعجال',
        'الحالة',
        'الإجراء المتخذ'
      ];

      const rows = grievances.map((g) => [
        g.id || '',
        g.ticketNo || '',
        g.subject || '',
        g.category || '',
        g.wilayaName || '',
        g.municipalName || '',
        g.institutionName || '',
        g.complainantName || '',
        g.complainantPhone || '',
        g.dateFiled || '',
        g.priority || 'عادي',
        g.status || 'قيد المعالجة',
        g.actionTaken || ''
      ]);

      await createSpreadsheetInFolder(token, title, headers, rows);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ ${grievances.length} ملف نزاع وعريضة بنجاح في Google Sheets!`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Master One-Click Sync All (رفع كل قواعد البيانات الشاملة دفعة واحدة)
  const handleUploadAllToDriveFolder = async () => {
    if (!token) return;
    setIsLoading(true);
    setUploadProgress('1/6: رفع حزمة التثبيت المستقلة الشاملة (JSON)...');
    try {
      const dateStr = new Date().toISOString().split('T')[0];

      // Step 1: Upload Master JSON Package
      const masterPackage = {
        app: 'SNTE Digital Portal',
        exportedAt: new Date().toISOString(),
        version: '3.0.0',
        folderId: TARGET_FOLDER_ID,
        membersCount: members.length,
        minutesCount: minutes.length,
        accountsCount: accounts.length,
        financesCount: finances.length,
        grievancesCount: grievances.length,
        circularsCount: circulars.length,
        data: {
          members,
          minutes,
          accounts,
          finances,
          grievances,
          circulars,
          archives
        }
      };

      await uploadJsonToFolder(token, `snte_complete_database_package_${dateStr}.json`, masterPackage);

      // Step 2: Financial Sheet
      setUploadProgress('2/6: إنشاء شيت الملف المالي والاشتراكات (50%/50%)...');
      await handleExportFinances();

      // Step 3: Members Sheet
      setUploadProgress('3/6: إنشاء شيت قاعدة بيانات المنخرطين...');
      await handleExportMembers();

      // Step 4: Minutes Sheet
      setUploadProgress('4/6: إنشاء شيت سجل المحاضر الرسمية...');
      await handleExportMinutes();

      // Step 5: Secretariats Sheet
      setUploadProgress('5/6: إنشاء شيت دليل الهياكل والأمانات الـ 72...');
      await handleExportAccounts();

      // Step 6: Grievances Sheet
      setUploadProgress('6/6: إنشاء شيت النزاعات والعرائض المهنية...');
      await handleExportGrievances();

      setStatusMessage({
        type: 'success',
        text: `🎉 تم بنجاح رفع وتحديث كافة قواعد البيانات الـ 6 وحزمة التثبيت الشاملة في الفولدر! موقعك الآن جاهز للتنصيب الفوري على أي استضافة أو صفحة.`
      });
      await loadFolderFiles(token);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `فشل الرفع الشامل: ${err.message}` });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  // Download local backup package
  const handleDownloadOfflinePackage = () => {
    const masterPackage = {
      app: 'SNTE Digital Portal',
      exportedAt: new Date().toISOString(),
      version: '3.0.0',
      data: {
        members,
        minutes,
        accounts,
        finances,
        grievances,
        circulars,
        archives
      }
    };

    const blob = new Blob([JSON.stringify(masterPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snte_master_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeImport = async () => {
    if (!confirmImportFile || !token) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `جاري قراءة البيانات من "${confirmImportFile.name}"...` });
    try {
      const { headers, rows } = await readSpreadsheetValues(token, confirmImportFile.id);
      if (rows.length === 0) {
        throw new Error('الملف فارغ ولا يحتوي على سجلات بيانات.');
      }

      if (importType === 'members') {
        const imported = rows.map((r, idx) => ({
          id: r[0] || `imp-mem-${Date.now()}-${idx}`,
          fullName: r[1] || 'منخرط غير مسمى',
          gender: r[2] || 'ذكر',
          nationalId: r[3] || '',
          socialSecurityNo: r[4] || '',
          membershipCardNo: r[5] || `SNTE-2026-${String(idx + 1).padStart(4, '0')}`,
          wilayaName: r[6] || 'الجزائر',
          municipalName: r[7] || '',
          institutionName: r[8] || '',
          tier: r[9] || 'التعليم المتوسط',
          jobPosition: r[10] || 'أستاذ',
          unionRole: r[11] || 'عضو منخرط',
          phone: r[12] || '',
          email: r[13] || '',
          duesStatus: r[14] || 'مدفوع',
          joinDate: r[15] || new Date().toISOString().split('T')[0]
        }));

        if (onImportMembers) onImportMembers(imported);
        setStatusMessage({
          type: 'success',
          text: `تم استيراد ${imported.length} منخرط بنجاح ودمجهم في قاعدة البيانات!`
        });
      } else if (importType === 'finances') {
        const imported = rows.map((r, idx) => ({
          id: r[0] || `imp-fin-${Date.now()}-${idx}`,
          transactionNo: r[1] || `وصل-${idx + 1}`,
          date: r[2] || new Date().toISOString().split('T')[0],
          wilayaCode: r[3] || '01',
          wilayaName: r[4] || 'أدرار',
          type: r[5] || 'اشتراك سنوي (100 دج)',
          amount: Number(r[6]) || 0,
          direction: r[7] || 'إيراد',
          recordedBy: r[10] || 'أمين المالية',
          description: r[11] || '',
          receiptNumber: r[12] || ''
        }));

        if (onImportFinances) onImportFinances(imported);
        setStatusMessage({
          type: 'success',
          text: `تم استيراد ${imported.length} سند مالي بنجاح وتحديث السجلات المالية!`
        });
      } else if (importType === 'accounts') {
        const imported = rows.map((r, idx) => ({
          id: r[0] || `imp-acc-${idx}`,
          structureName: r[1] || '',
          level: r[2]?.includes('ولائي') ? 'wilaya' : r[2]?.includes('بلدي') ? 'municipal' : r[2]?.includes('فرع') ? 'school' : 'national',
          wilayaCode: r[3] || '',
          wilayaName: r[4] || '',
          municipalName: r[5] || '',
          institutionName: r[6] || '',
          name: r[7] || '',
          title: r[8] || '',
          phone: r[9] || '',
          email: r[10] || '',
          username: r[11] || '',
          password: r[12] || '',
          status: r[13] || 'نشط'
        }));

        if (onImportAccounts) onImportAccounts(imported);
        setStatusMessage({
          type: 'success',
          text: `تم استيراد ${imported.length} هيكل نقابي بنجاح وتحديث بيانات المكلفين!`
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-emerald-800/30 max-h-[92vh] flex flex-col text-right font-['Cairo',sans-serif]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003d1e] via-[#005a2b] to-[#004d26] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 p-2 flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-amber-400 text-black px-2.5 py-0.5 rounded-full uppercase">
                  ربط وتثبيت قواعد البيانات الشاملة
                </span>
                <span className="text-xs text-emerald-200 font-bold">Google Sheets & Drive</span>
              </div>
              <h3 className="text-lg font-black mt-0.5">منظومة رفع واستيراد كافة قواعد بيانات SNTE لتسهيل التنصيب على أي استضافة</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dedicated Folder Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200 p-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap text-xs font-bold text-amber-950">
          <div className="flex items-center gap-2">
            <span className="text-base">📁</span>
            <span>المجلد السحابي المعتمد:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-amber-300 font-mono text-[11px] text-[#006633]">
              {TARGET_FOLDER_ID}
            </code>
          </div>
          <a
            href={TARGET_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <span>فتح المجلد في Google Drive</span>
            <span>↗</span>
          </a>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-900 border-red-300'
                  : 'bg-blue-50 text-blue-900 border-blue-300'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
          )}

          {/* Google Auth Status Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-2 border border-gray-200 shadow-xs flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 block">حالة الاتصال بحساب Google:</span>
                {token ? (
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-700 text-sm">{userEmail}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ متصل ومصرح للمزامنة السحابية
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 font-bold">غير متصل - يلزم تسجيل الدخول لمنح إذن الكتابة داخل المجلد</span>
                )}
              </div>
            </div>

            <div>
              {token ? (
                <button
                  onClick={async () => {
                    await googleLogout();
                    setToken(null);
                    setUserEmail(null);
                    setStatusMessage({ type: 'info', text: 'تم تسجيل الخروج من Google' });
                  }}
                  className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all cursor-pointer"
                >
                  تسجيل الخروج
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>تسجيل الدخول عبر Google للربط</span>
                  <span>←</span>
                </button>
              )}
            </div>
          </div>

          {/* Master One-Click Sync Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black shadow-lg border-2 border-amber-600/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black bg-black text-amber-300 px-2.5 py-0.5 rounded-full uppercase">
                الرفع والتثبيت السريع
              </span>
              <h4 className="text-base font-black">🚀 رفع كافة قواعد البيانات إلى الفولدر بنقرة واحدة (Full Master Sync)</h4>
              <p className="text-xs font-bold text-amber-950">
                يشمل: الملف المالي (50-50)، المنخرطين، المحاضر، الهياكل الـ 72، النزاعات، وحزمة التثبيت المستقلة (JSON).
              </p>
              {uploadProgress && (
                <div className="p-2 bg-black/80 text-amber-300 rounded-xl font-mono text-[11px] animate-pulse">
                  {uploadProgress}
                </div>
              )}
            </div>

            <button
              onClick={handleUploadAllToDriveFolder}
              disabled={!token || isLoading}
              className="px-6 py-3 bg-[#004d26] hover:bg-[#003d1e] disabled:bg-gray-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/40 transform hover:scale-[1.02]"
            >
              <span>بدء الرفع الشامل لكل القواعد</span>
              <span>⚡</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#006633] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 كل قواعد البيانات المتاحة (6)
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'import' ? 'bg-[#006633] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📥 استيرداد وتثبيت من الشيتات ({folderFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('portable')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'portable' ? 'bg-[#006633] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💾 حزمة التثبيت الذاتي لأي استضافة (JSON)
            </button>
          </div>

          {/* Tab 1: All Databases Export */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <p className="text-gray-600 font-medium">
                يمكنك أيضاً إنشاء وتحديث أي قاعدة بيانات منفردة كشيت Google Sheets داخل المجلد:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Finance (الملف المالي) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 hover:border-amber-500 transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black mb-2 text-xl">
                      💰
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-gray-900">الملف المالي والاشتراكات</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">50% / 50%</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      سندات القبض، الاشتراكات (100 دج)، وتوزيع الحصص القانوني: 50% للأمانات الولائية و50% للأمانة الوطنية ({finances.length} سند).
                    </p>
                  </div>
                  <button
                    onClick={handleExportFinances}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-black font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>إنشاء شيت الملف المالي</span>
                    <span>💵</span>
                  </button>
                </div>

                {/* 2. Members */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006633] transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black mb-2 text-xl">
                      👥
                    </div>
                    <h4 className="font-black text-sm text-gray-900">قاعدة بيانات المنخرطين</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      سجلات المنخرطين ({members.length} منخرط) متضمنة أرقام NIN، الضمان، المؤسسات، وبطاقات العضوية.
                    </p>
                  </div>
                  <button
                    onClick={handleExportMembers}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-[#006633] hover:bg-[#004d26] disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>إنشاء شيت المنخرطين</span>
                    <span>📊</span>
                  </button>
                </div>

                {/* 3. Minutes */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006633] transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black mb-2 text-xl">
                      📜
                    </div>
                    <h4 className="font-black text-sm text-gray-900">سجل المحاضر الرسمية</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      محاضر التنصيب والجمعيات العامة الـ 23 مع تفاصيل النصاب، البصمات، وروابط PDF على Drive.
                    </p>
                  </div>
                  <button
                    onClick={handleExportMinutes}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-[#006633] hover:bg-[#004d26] disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>إنشاء شيت المحاضر</span>
                    <span>📑</span>
                  </button>
                </div>

                {/* 4. Accounts & Secretariats */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006633] transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black mb-2 text-xl">
                      🏛️
                    </div>
                    <h4 className="font-black text-sm text-gray-900">دليل الهياكل والأمانات الـ 72</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      الأمانات الولائية الـ 72، البلدية، ومكاتب الفروع ({accounts.length} هيكل) مع المكلفين بالعهدة وبيانات الدخول.
                    </p>
                  </div>
                  <button
                    onClick={handleExportAccounts}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-[#006633] hover:bg-[#004d26] disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>إنشاء شيت الهياكل</span>
                    <span>🏛️</span>
                  </button>
                </div>

                {/* 5. Grievances */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006633] transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-black mb-2 text-xl">
                      ⚖️
                    </div>
                    <h4 className="font-black text-sm text-gray-900">سجل النزاعات والعرائض</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      ملفات النزاعات المهنية المرفوعة من فروع المؤسسات والعرائض الموجهة لمديريات التربية ومفتشيات العمل.
                    </p>
                  </div>
                  <button
                    onClick={handleExportGrievances}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-[#006633] hover:bg-[#004d26] disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>إنشاء شيت النزاعات</span>
                    <span>⚖️</span>
                  </button>
                </div>

                {/* 6. Statutes & Legal Bank */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#006633] transition-all space-y-3 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black mb-2 text-xl">
                      📚
                    </div>
                    <h4 className="font-black text-sm text-gray-900">بنك النصوص التشريعية</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      مواد القانون الأساسي الـ 95، مواد النظام الداخلي الـ 155، وميثاق أخلاقيات العمل النقابي المطابق للقانون 23-02.
                    </p>
                  </div>
                  <button
                    onClick={handleExportAccounts}
                    disabled={!token || isLoading}
                    className="w-full py-2.5 px-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>مزامنة بنك القوانين</span>
                    <span>📖</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Import / Restore */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 font-medium">
                  الملفات والجداول المتوفرة حالياً داخل الفولدر للاستيرداد الفوري:
                </p>
                {token && (
                  <button
                    onClick={() => loadFolderFiles(token)}
                    className="text-[#006633] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>تحديث القائمة</span>
                    <span>🔄</span>
                  </button>
                )}
              </div>

              {folderFiles.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-3xl block">📄</span>
                  <h4 className="font-bold text-gray-700">لم يتم العثور على ملفات داخل الفولدر بعد</h4>
                  <p className="text-gray-500 text-[11px]">
                    اضغط على "بدء الرفع الشامل لكل القواعد" أعلاه لإنشاء ورفع كامل الملفات إلى الفولدر في ثوانٍ.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {folderFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 transition-all flex items-center justify-between gap-3 flex-wrap shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                          {file.name.includes('.json') ? '📦' : '📊'}
                        </div>
                        <div>
                          <strong className="text-gray-900 font-black block">{file.name}</strong>
                          <span className="text-[10px] text-gray-400 font-medium">
                            آخر تعديل: {new Date(file.modifiedTime).toLocaleString('ar-DZ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-1"
                        >
                          <span>معاينة في Drive</span>
                          <span>↗</span>
                        </a>

                        <button
                          onClick={() => {
                            setConfirmImportFile(file);
                            if (file.name.includes('المالي')) setImportType('finances');
                            else if (file.name.includes('المنخرطين')) setImportType('members');
                            else if (file.name.includes('الهياكل')) setImportType('accounts');
                            else setImportType('members');
                          }}
                          className="px-3.5 py-1.5 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl font-black flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>استيرداد وتثبيت</span>
                          <span>📥</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Portable Package (لتسهيل التنصيب على أي استضافة أو صفحة قوقل) */}
          {activeTab === 'portable' && (
            <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200">
              <div className="space-y-1">
                <span className="text-[10px] font-black bg-[#006633] text-white px-2.5 py-0.5 rounded-full uppercase">
                  التنصيب السريع والنقل الذاتي
                </span>
                <h4 className="font-black text-sm text-gray-900">حزمة التثبيت المستقلة الشاملة (Universal Portable Package)</h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  هذه الحزمة تضم كامل سجلات الموقع (المنخرطين، المحاضر، الهياكل الـ 72، المالية، النزاعات، والمناشير) في ملف واحد جاهز. تتيح لك تشغيل وتنصيب الموقع فوراً على:
                </p>
                <ul className="list-disc list-inside text-[11px] text-gray-700 font-bold space-y-0.5 pt-1">
                  <li>صفحات ومواقع قوقل (Google Sites / Firebase Hosting).</li>
                  <li>أي استضافة ويب خاصة (cPanel, Plesk, VPS, Cloud).</li>
                  <li>الاستضافات السحابية المجانية (GitHub Pages, Vercel, Netlify).</li>
                  <li>التشغيل دون اتصال بالإنترنت (Offline Mode).</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-emerald-200 flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={handleDownloadOfflinePackage}
                  className="px-5 py-2.5 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>💾 تنزيل ملف الحزمة الكاملة إلى جهازك (.json)</span>
                </button>

                <button
                  onClick={handleUploadAllToDriveFolder}
                  disabled={!token || isLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-black rounded-xl font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>☁️ رفع الحزمة مباشرة إلى فولدر Google Drive</span>
                </button>
              </div>
            </div>
          )}

          {/* Explicit Confirmation Dialog for Import */}
          {confirmImportFile && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-300 space-y-4 text-right font-['Cairo',sans-serif]">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto">
                  ⚠️
                </div>
                <h4 className="text-center font-black text-base text-gray-900">
                  تأكيد استيرداد وتحديث قاعدة البيانات
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed text-center">
                  أنت بصدد استيرداد السجلات من جدول: <br />
                  <strong className="text-[#006633]">{confirmImportFile.name}</strong>
                  <br />
                  سيتم دمج وتحديث البيانات فوراً في المنظومة.
                </p>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 text-xs">نوع السجلات المستوردة:</label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-bold bg-gray-50 text-xs"
                  >
                    <option value="finances">الملف المالي والاشتراكات (50%/50%)</option>
                    <option value="members">سجلات المنخرطين (Members Database)</option>
                    <option value="accounts">دليل الهياكل والأمانات (Secretariats & Accounts)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setConfirmImportFile(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={executeImport}
                    disabled={isLoading}
                    className="px-5 py-2 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl font-black shadow-md cursor-pointer"
                  >
                    تأكيد وبدء الاستيرداد
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
