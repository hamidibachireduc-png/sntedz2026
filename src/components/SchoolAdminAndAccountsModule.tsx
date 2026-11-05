import React, { useState, useRef } from 'react';
import {
  Shield,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  Printer,
  CheckCircle2,
  FolderKanban,
  Utensils,
} from 'lucide-react';
import { Teacher, AssignedGroup, rankDisplayTitle, specDisplayTitle, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface StaffAccount {
  id: string;
  teacherId: string;
  username: string;
  accessPin: string;
  roleLabel: 'مدير المؤسسة (صلاحية كاملة)' | 'مدير مساعد / ناظر' | 'أستاذ(ة) مكون / منسق' | 'أستاذ(ة) تعليم ابتدائي';
  permissions: string[];
  active: boolean;
}

interface SchoolAdminAndAccountsModuleProps {
  subTab: 'accounts' | 'school_admin' | 'backup';
  setSubTab: (tab: 'accounts' | 'school_admin' | 'backup') => void;
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  teachers: Teacher[];
  groups: AssignedGroup[];
  logoUrl: string;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetAllData: () => void;
  backupMessage: string | null;
  onNavigateSection?: (sec: 'canteen_budget' | 'director_bag') => void;
}

export default function SchoolAdminAndAccountsModule({
  subTab,
  setSubTab,
  institution,
  teachers,
  logoUrl,
  onExportBackup,
  onImportBackup,
  onResetAllData,
  backupMessage,
  onNavigateSection,
}: SchoolAdminAndAccountsModuleProps) {
  const [customPins, setCustomPins] = useState<Record<string, string>>({});
  const [disabledAccounts, setDisabledAccounts] = useState<Record<string, boolean>>({});
  const sheetRef = useRef<HTMLDivElement>(null);

  const generateNewPin = (tId: string) => {
    const randomPin = String(Math.floor(100000 + Math.random() * 900000));
    setCustomPins((prev) => ({ ...prev, [tId]: randomPin }));
  };

  const toggleAccountActive = (tId: string) => {
    setDisabledAccounts((prev) => ({ ...prev, [tId]: !prev[tId] }));
  };

  const exportTeachersCSV = () => {
    const headers = ['الرقم', 'الاسم واللقب', 'الرتبة (25-54)', 'التخصص', 'تاريخ التنصيب', 'الوضعية'];
    const rows = teachers.map((t, idx) => [
      idx + 1,
      `"${t.name}"`,
      `"${rankDisplayTitle(t.rank)}"`,
      `"${specDisplayTitle(t.spec)}"`,
      t.installDate || '2018-09-01',
      t.status || 'ناشط',
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قائمة_الأساتذة_${institution.school}_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('accounts')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'accounts' || subTab === 'school_admin'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>1. التحكم بحسابات الموظفين والصلاحيات</span>
          </button>

          <button
            onClick={() => setSubTab('backup')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'backup'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>2. قسم الحفظ والاستيراد والنسخ الاحتياطي</span>
          </button>

          {onNavigateSection && (
            <>
              <button
                onClick={() => onNavigateSection('director_bag')}
                className="px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 bg-slate-100 text-[#094d22] hover:bg-emerald-50 border border-emerald-200"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>انتقال إلى السجلات الـ 12 والبريد الإداري (حقيبة المدير) ←</span>
              </button>
              <button
                onClick={() => onNavigateSection('canteen_budget')}
                className="px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 bg-slate-100 text-[#d91424] hover:bg-rose-50 border border-rose-200"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>انتقال إلى قسم المطعم المدرسي المستقل ←</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(
                sheetRef.current,
                `قائمة_حسابات_الموظفين_${institution.school}`,
                'landscape'
              )
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تحميل PDF</span>
          </button>
          <button
            onClick={() =>
              triggerPrintOrPdf(`قائمة_حسابات_الموظفين_${institution.school}`, sheetRef.current)
            }
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القائمة (A4)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: التحكم بحسابات الموظفين */}
      {(subTab === 'accounts' || subTab === 'school_admin') && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-black text-[#094d22] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#117a37]" />
                <span>إدارة حسابات الموظفين وصلاحيات الولوج للفضاءات الرقمية (المدير · الناظر · الأساتذة)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                توليد رموز الدخول الفردية (PIN)، ضبط مستوى الصلاحيات لكل أستاذ حسب رتبته في المرسوم 25-54، وتفعيل أو تعليق الحساب
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">الموظف / الأستاذ(ة)</th>
                  <th className="py-2.5 px-3">الرتبة (المرسوم 25-54)</th>
                  <th className="py-2.5 px-3">معرف الحساب (Username)</th>
                  <th className="py-2.5 px-3">رمز الدخول السري (PIN)</th>
                  <th className="py-2.5 px-3">الصلاحيات الممنوحة</th>
                  <th className="py-2.5 px-3">حالة الحساب</th>
                  <th className="py-2.5 px-3">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Director Main Account Row */}
                <tr className="bg-[#e8f5e9]/50">
                  <td className="py-2.5 px-3 font-black text-[#094d22]">{institution.directorName}</td>
                  <td className="py-2.5 px-3 font-extrabold text-[#d91424]">مدير المدرسة الابتدائية</td>
                  <td className="py-2.5 px-3 font-mono font-bold tabular-nums">dir.snte.2026</td>
                  <td className="py-2.5 px-3 font-mono font-black text-[#094d22] tabular-nums">
                    {customPins['director'] || '202654'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700">
                    تحكم كلي: الإسناد الآلي · التوقيت · المجالس · السجلات الـ 12 · الحسابات
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-[#117a37]">مفعل (مدير النظام)</td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => generateNewPin('director')}
                      className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer"
                    >
                      توليد رمز جديد
                    </button>
                  </td>
                </tr>

                {/* Teachers Accounts */}
                {teachers.map((t, idx) => {
                  const isActive = !disabledAccounts[t.id];
                  const pin = customPins[t.id] || String(255400 + (idx + 1) * 17);
                  const username = `ens.${idx + 1}.snte`;
                  const perms =
                    t.rank === 'مميز'
                      ? 'فضاء الأستاذ + تنسيق الندوات + حجز النقاط + طباعة التوقيت'
                      : 'فضاء الأستاذ + حجز النقاط والمواظبة + طباعة التوقيت';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{t.name}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{rankDisplayTitle(t.rank)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums">{username}</td>
                      <td className="py-2.5 px-3 font-mono font-black text-[#d91424] tabular-nums">{pin}</td>
                      <td className="py-2.5 px-3 text-slate-600">{perms}</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={isActive ? 'text-[#117a37]' : 'text-[#d91424]'}>
                          {isActive ? 'حساب نشط' : 'معلق مؤقتاً'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <button
                          onClick={() => generateNewPin(t.id)}
                          className="bg-[#117a37] hover:bg-[#094d22] text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          تجديد الرمز
                        </button>
                        <button
                          onClick={() => toggleAccountActive(t.id)}
                          className={`text-[11px] font-bold px-2 py-1 rounded cursor-pointer ${
                            isActive
                              ? 'bg-red-100 text-[#d91424] hover:bg-red-200'
                              : 'bg-emerald-100 text-[#117a37] hover:bg-emerald-200'
                          }`}
                        >
                          {isActive ? 'تعليق' : 'تفعيل'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: قسم الحفظ والاستيراد والنسخ الاحتياطي */}
      {subTab === 'backup' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#094d22]">
              مركز الحفظ الآلي والاستيراد والنسخ الاحتياطي الشامل (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              يتم حفظ جميع تعديلاتك تلقائياً على المتصفح، ويمكنك تصدير قاعدة بيانات المؤسسة كاملة في ملف خارجي (JSON / CSV) أو استيرادها في أي حاسوب آخر
            </p>
          </div>

          {backupMessage && (
            <div className="bg-[#e8f5e9] border border-[#117a37] text-[#094d22] p-3 rounded-lg text-xs font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#117a37]" />
              <span>{backupMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Export JSON & CSV */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-sm font-black text-[#094d22] mb-1">1. تصدير وحفظ النسخة الاحتياطية</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تحميل ملف نسخة احتياطية شاملة (`.json`) يتضمن بيانات المدرسة، الأساتذة، الأفواج، الإسناد، المطعم، المجالس، والزيارات، أو تصدير جدول الأساتذة بصيغة Excel/CSV.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={onExportBackup}
                  className="w-full py-2.5 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل النسخة الاحتياطية الشاملة (JSON)</span>
                </button>
                <button
                  onClick={exportTeachersCSV}
                  className="w-full py-2 bg-white border border-[#117a37] text-[#094d22] hover:bg-[#e8f5e9] font-extrabold text-xs rounded-lg cursor-pointer transition"
                >
                  📊 تصدير قائمة الأساتذة والرتب (CSV)
                </button>
              </div>
            </div>

            {/* Card 2: Import JSON */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-sm font-black text-[#094d22] mb-1">2. استيراد واستعادة البيانات</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  اختر ملف نسخة احتياطية (`.json`) سبق حفظه من منصة المدير لاسترجاع كافة الجداول والأقسام والأساتذة والمحاضر فوراً.
                </p>
              </div>
              <label className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-center">
                <Upload className="w-4 h-4" />
                <span>اختيار ملف للاستيراد (JSON)</span>
                <input type="file" accept=".json,application/json" onChange={onImportBackup} className="hidden" />
              </label>
            </div>

            {/* Card 3: Reset to Default */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-sm font-black text-[#d91424] mb-1">3. إعادة الضبط للوضع النموذجي</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  إرجاع بيانات المنصة إلى البيانات النموذجية الافتراضية (10 أساتذة بجميع التخصصات والرتب و 10 أقسام مسندة).
                </p>
              </div>
              <button
                onClick={onResetAllData}
                className="w-full py-2.5 bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الضبط للبيانات الافتراضية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Official Accounts Sheet (Always present so Print/PDF always works) */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
            </div>
            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">قائمة الحسابات الرقمية وبيانات الولوج للهيئة التربوية</span>
                </div>
              </div>
            </div>
            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>المدير(ة) : {institution.directorName}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          <table className="timetable-grid mt-2">
            <thead>
              <tr className="hours-header">
                <th style={{ width: '45px' }}>الرقم</th>
                <th>اسم ولقب الأستاذ(ة)</th>
                <th>الرتبة (المرسوم 25-54)</th>
                <th>معرف المستخدم</th>
                <th>رمز الولوج (PIN)</th>
                <th>الفضاء المخصص</th>
                <th style={{ width: '140px' }}>توقيع الاستلام</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, idx) => (
                <tr key={t.id}>
                  <td className="font-bold tabular-nums py-1.5">{idx + 1}</td>
                  <td className="font-extrabold text-right px-2">{t.name}</td>
                  <td className="font-bold">{rankDisplayTitle(t.rank)}</td>
                  <td className="font-mono font-bold tabular-nums">{`ens.${idx + 1}.snte`}</td>
                  <td className="font-mono font-black text-[#d91424] tabular-nums">
                    {customPins[t.id] || String(255400 + (idx + 1) * 17)}
                  </td>
                  <td className="font-bold text-[#094d22]">منصة الأساتذة والناظر والمدير</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer-signatures mt-6">
            <div>إمضاء الناظر / المدير المساعد</div>
            <div>إمضاء وختم السيد(ة) المدير(ة)</div>
            <div>الأرشيف الرقمي للمؤسسة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
