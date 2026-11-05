import React, { useState, useRef } from 'react';
import { ClipboardList, Printer, Download, Building2, Users, HeartHandshake, GraduationCap } from 'lucide-react';
import {
  Teacher,
  AssignedGroup,
  MODELS,
  rankDisplayTitle,
  specDisplayTitle,
  OFFICIAL_AUTHOR_SIGNATURE,
} from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface SchoolInfrastructureInfo {
  schoolCode: string;
  openingYear: string;
  shiftSystem: 'دوام واحد' | 'دوامين';
  totalAreaM2: number;
  builtAreaM2: number;
  standardRooms: number;
  usedRooms: number;
  prepRooms: number;
  itLibraryRooms: number;
  canteenAvailable: 'نعم (مطعم مدمج)' | 'لا';
  canteenCapacity: number;
  sportsField: 'نعم' | 'لا';
  sanitaryBlocksBoys: number;
  sanitaryBlocksGirls: number;
  heatingType: string;
  internetConnected: 'متصل (ألياف بصرية / ADSL)' | 'غير متصل';
  waterElectricity: string;
}

export interface SolidarityStatsInfo {
  schoolGrant5000Applied: number;
  schoolGrant5000Approved: number;
  freeBooksBeneficiaries: number;
  schoolTransportBeneficiaries: number;
  udsExaminedStudents: number;
  vaccinatedStudents: number;
  chronicIllnessStudents: number;
  parentsAssocActive: string;
  culturalSportsClubsMembers: number;
}

export const INITIAL_INFRASTRUCTURE: SchoolInfrastructureInfo = {
  schoolCode: '03011408',
  openingYear: '1994',
  shiftSystem: 'دوام واحد',
  totalAreaM2: 3450,
  builtAreaM2: 1280,
  standardRooms: 10,
  usedRooms: 6,
  prepRooms: 1,
  itLibraryRooms: 1,
  canteenAvailable: 'نعم (مطعم مدمج)',
  canteenCapacity: 200,
  sportsField: 'نعم',
  sanitaryBlocksBoys: 6,
  sanitaryBlocksGirls: 6,
  heatingType: 'تدفئة مركزية بالغاز الطبيعي (شغالة 100%)',
  internetConnected: 'متصل (ألياف بصرية / ADSL)',
  waterElectricity: 'كهرباء + مياه صالحة للشرب + خزان مائي احتياطي',
};

export const INITIAL_SOLIDARITY_STATS: SolidarityStatsInfo = {
  schoolGrant5000Applied: 94,
  schoolGrant5000Approved: 88,
  freeBooksBeneficiaries: 112,
  schoolTransportBeneficiaries: 35,
  udsExaminedStudents: 192,
  vaccinatedStudents: 64,
  chronicIllnessStudents: 5,
  parentsAssocActive: 'معتمدة ونشطة (الجمعية المحلية لأولياء التلاميذ)',
  culturalSportsClubsMembers: 76,
};

interface BriefInquiryRegistryModuleProps {
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
  canteenBeneficiariesCount: number;
}

export default function BriefInquiryRegistryModule({
  institution,
  teachers,
  groups,
  logoUrl,
  canteenBeneficiariesCount,
}: BriefInquiryRegistryModuleProps) {
  const [subTab, setSubTab] = useState<'infra' | 'students_age' | 'staff_dist' | 'solidarity'>('infra');
  const [infra, setInfra] = useState<SchoolInfrastructureInfo>(INITIAL_INFRASTRUCTURE);
  const [solidarity, setSolidarity] = useState<SolidarityStatsInfo>(INITIAL_SOLIDARITY_STATS);
  const sheetRef = useRef<HTMLDivElement>(null);

  const arabicClassGroups = groups.filter((g) => ['prep', '1', '2', '3', '4', '5'].includes(g.level));
  const totalBoys = arabicClassGroups.reduce((a, g) => a + (g.boys || 0), 0);
  const totalGirls = arabicClassGroups.reduce((a, g) => a + (g.girls || 0), 0);
  const totalStudents = totalBoys + totalGirls;
  const totalRepeaters = arabicClassGroups.reduce((a, g) => a + (g.repeaters || 0), 0);
  const avgClassDensity =
    arabicClassGroups.length > 0 ? (totalStudents / arabicClassGroups.length).toFixed(1) : '0';

  // Rank counts
  const rankDist = {
    distinguished: teachers.filter((t) => t.rank === 'مميز').length,
    class2: teachers.filter((t) => t.rank === 'قسم ثان').length,
    class1: teachers.filter((t) => t.rank === 'قسم أول').length,
    base: teachers.filter((t) => t.rank === 'تعليم ابتدائي').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#117a37]" />
            <span>سجل الاستقصاء الوجيز والإحصاء المدرسي الشامل (Enquête Sommaire — {institution.year})</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            الوثيقة الإحصائية الرسمية الشاملة للهياكل المادية، التعداد العمري للتلاميذ، تأطير الأساتذة (25-54)، والتضامن المدرسي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(
                sheetRef.current,
                `سجل_الاستقصاء_الوجيز_${institution.school}`,
                'landscape'
              )
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل سجل الاستقصاء الوجيز (PDF)</span>
          </button>

          <button
            onClick={() =>
              triggerPrintOrPdf(`سجل_الاستقصاء_الوجيز_${institution.school}`, sheetRef.current)
            }
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل الرسمي (A4)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2">
        {[
          {
            id: 'infra',
            label: '1. البطاقة الهيكلية والمرافق المادية',
            icon: <Building2 className="w-3.5 h-3.5" />,
          },
          {
            id: 'students_age',
            label: '2. إحصاء التلاميذ والأفواج وهرم الأعمار',
            icon: <GraduationCap className="w-3.5 h-3.5" />,
          },
          {
            id: 'staff_dist',
            label: '3. تأطير الموظفين والهيئة التربوية (25-54)',
            icon: <Users className="w-3.5 h-3.5" />,
          },
          {
            id: 'solidarity',
            label: '4. التضامن المدرسي (منحة 5000 دج · المطعم · الصحة)',
            icon: <HeartHandshake className="w-3.5 h-3.5" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as typeof subTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === tab.id
                ? 'bg-[#117a37] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Quick KPI Summary Strip */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">رمز المؤسسة ونظام الدوام</div>
          <div className="text-lg font-black text-[#094d22] mt-1 tabular-nums">{infra.schoolCode}</div>
          <div className="text-[11px] text-slate-600 mt-1">
            {infra.shiftSystem} · تأسست سنة {infra.openingYear}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">الحجرات الدراسية المستغلة</div>
          <div className="text-lg font-black text-[#117a37] mt-1 tabular-nums">
            {infra.usedRooms} / {infra.standardRooms} حجرات
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            متوسط الكثافة: {avgClassDensity} تلميذ/فوج
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">التعداد العام للتلاميذ</div>
          <div className="text-lg font-black text-[#d91424] mt-1 tabular-nums">{totalStudents} تلميذ</div>
          <div className="text-[11px] text-slate-600 mt-1">
            ذكور: {totalBoys} · إناث: {totalGirls} · معيدون: {totalRepeaters}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">المستفيدون من منحة 5000 دج</div>
          <div className="text-lg font-black text-[#094d22] mt-1 tabular-nums">
            {solidarity.schoolGrant5000Approved} / {solidarity.schoolGrant5000Applied}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            مجانية الكتاب: {solidarity.freeBooksBeneficiaries} تلميذ
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">التغطية الصحية والإطعام</div>
          <div className="text-lg font-black text-[#117a37] mt-1 tabular-nums">
            {canteenBeneficiariesCount} مستفيد بالمطعم
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            فحص طبي (UDS): {solidarity.udsExaminedStudents} تلميذ
          </div>
        </div>
      </div>

      {/* Interactive Editor for Active SubTab */}
      {subTab === 'infra' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22] border-b border-slate-200 pb-2.5">
            تحديث معطيات البطاقة الهيكلية والمادية للمؤسسة (تظهر مباشرة في سجل الاستقصاء الوجيز)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرمز الإحصائي للمؤسسة</label>
              <input
                type="text"
                value={infra.schoolCode}
                onChange={(e) => setInfra({ ...infra, schoolCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">سنة الافتتاح الرسمي</label>
              <input
                type="text"
                value={infra.openingYear}
                onChange={(e) => setInfra({ ...infra, openingYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المساحة الإجمالية (م²)</label>
              <input
                type="number"
                value={infra.totalAreaM2}
                onChange={(e) => setInfra({ ...infra, totalAreaM2: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المساحة المبنية (م²)</label>
              <input
                type="number"
                value={infra.builtAreaM2}
                onChange={(e) => setInfra({ ...infra, builtAreaM2: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">إجمالي الحجرات العادية</label>
              <input
                type="number"
                value={infra.standardRooms}
                onChange={(e) => setInfra({ ...infra, standardRooms: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الحجرات المستغلة فعلياً</label>
              <input
                type="number"
                value={infra.usedRooms}
                onChange={(e) => setInfra({ ...infra, usedRooms: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">وضعية التدفئة المدرسية</label>
              <input
                type="text"
                value={infra.heatingType}
                onChange={(e) => setInfra({ ...infra, heatingType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">طاقة استيعاب المطعم المدرسي</label>
              <input
                type="number"
                value={infra.canteenCapacity}
                onChange={(e) => setInfra({ ...infra, canteenCapacity: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {subTab === 'solidarity' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22] border-b border-slate-200 pb-2.5">
            تحديث إحصائيات التضامن المدرسي، الصحة المدرسية، والنشاطات المكملة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ملفات المنحة الخاصة (5000 دج) المودعة</label>
              <input
                type="number"
                value={solidarity.schoolGrant5000Applied}
                onChange={(e) =>
                  setSolidarity({ ...solidarity, schoolGrant5000Applied: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المستفيدون المقبولون في منحة 5000 دج</label>
              <input
                type="number"
                value={solidarity.schoolGrant5000Approved}
                onChange={(e) =>
                  setSolidarity({ ...solidarity, schoolGrant5000Approved: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-[#117a37] tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المستفيدون من مجانية الكتاب المدرسي</label>
              <input
                type="number"
                value={solidarity.freeBooksBeneficiaries}
                onChange={(e) =>
                  setSolidarity({ ...solidarity, freeBooksBeneficiaries: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">التلاميذ المفحوصون طبياً (UDS)</label>
              <input
                type="number"
                value={solidarity.udsExaminedStudents}
                onChange={(e) =>
                  setSolidarity({ ...solidarity, udsExaminedStudents: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Printable A4 Landscape Sheet for Brief Inquiry Registry (سجل الاستقصاء الوجيز) */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مفتشية التعليم الابتدائي — مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
              <div>الرمز الإحصائي : {infra.schoolCode}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    سجل الاستقصاء الوجيز والبطاقة الإحصائية الشاملة للمؤسسة (Enquête Sommaire)
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>نظام الدوام : {infra.shiftSystem}</div>
              <div>المدير(ة) : {institution.directorName}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          {/* Section 1: الهياكل المادية والمرافق */}
          <div className="text-xs font-black text-[#094d22] mb-1 mt-1">
            أولاً: البطاقة الهيكلية والمادية للمدرسة الابتدائية
          </div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>سنة الفتح</th>
                <th>المساحة الكلية / المبنية</th>
                <th>الحجرات العادية / المستغلة</th>
                <th>قاعة التحضيري / الإعلام</th>
                <th>المطعم المدرسي (طاقة الاستيعاب)</th>
                <th>المرافق الصحية (ذ / إ)</th>
                <th>وضعية التدفئة المدرسية</th>
                <th>الربط بالأنترنت</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="tabular-nums font-bold">{infra.openingYear}</td>
                <td className="tabular-nums font-bold">
                  {infra.totalAreaM2} م² / {infra.builtAreaM2} م²
                </td>
                <td className="tabular-nums font-black text-[#094d22]">
                  {infra.standardRooms} حجرات ({infra.usedRooms} مستغلة)
                </td>
                <td className="tabular-nums font-bold">
                  {infra.prepRooms} تحضيري / {infra.itLibraryRooms} مكتبة وإعلام
                </td>
                <td className="font-bold text-[#117a37]">
                  {infra.canteenAvailable} ({infra.canteenCapacity} وجبة)
                </td>
                <td className="tabular-nums font-bold">
                  {infra.sanitaryBlocksBoys} ذكور / {infra.sanitaryBlocksGirls} إناث
                </td>
                <td className="font-bold">{infra.heatingType}</td>
                <td className="font-bold">{infra.internetConnected}</td>
              </tr>
            </tbody>
          </table>

          {/* Section 2: تعداد التلاميذ والأفواج التربوية */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <div className="text-xs font-black text-[#094d22] mb-1">
                ثانياً: توزيع التلاميذ والأفواج حسب المستويات والجنس والإعادة
              </div>
              <table className="timetable-grid">
                <thead>
                  <tr className="hours-header">
                    <th>المستوى التعليمي</th>
                    <th>سنة الميلاد المرجعية</th>
                    <th>الذكور</th>
                    <th>الإناث</th>
                    <th>المجموع</th>
                    <th>المعيدون</th>
                  </tr>
                </thead>
                <tbody>
                  {arabicClassGroups.map((grp, idx) => {
                    const m = MODELS[grp.level];
                    const b = grp.boys || 0;
                    const g = grp.girls || 0;
                    const refBirthYear = 2021 - idx;
                    return (
                      <tr key={grp.id}>
                        <td className="font-extrabold py-1">{m?.levelTitle}</td>
                        <td className="tabular-nums font-bold">{refBirthYear}</td>
                        <td className="tabular-nums font-bold">{b}</td>
                        <td className="tabular-nums font-bold">{g}</td>
                        <td className="tabular-nums font-black text-[#d91424]">{b + g}</td>
                        <td className="tabular-nums font-bold">{grp.repeaters || 0}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#e8f5e9] font-black">
                    <td colSpan={2} className="py-1">
                      المجموع العام ({arabicClassGroups.length} أفواج)
                    </td>
                    <td className="tabular-nums">{totalBoys}</td>
                    <td className="tabular-nums">{totalGirls}</td>
                    <td className="tabular-nums text-[#d91424]">{totalStudents}</td>
                    <td className="tabular-nums">{totalRepeaters}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: تأطير الأساتذة (25-54) والتضامن المدرسي */}
            <div className="space-y-2">
              <div>
                <div className="text-xs font-black text-[#094d22] mb-1">
                  ثالثاً: توزيع الهيئة التربوية حسب رتب المرسوم التنفيذي 25-54
                </div>
                <table className="timetable-grid">
                  <thead>
                    <tr className="hours-header">
                      <th>أستاذ مميز (ص 15)</th>
                      <th>أستاذ قسم ثانٍ (ص 14)</th>
                      <th>أستاذ قسم أول (ص 13)</th>
                      <th>أستاذ تعليم ابتدائي (ص 12)</th>
                      <th>المجموع العام للأساتذة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1.5 font-black text-[#d91424] tabular-nums">
                        {rankDist.distinguished}
                      </td>
                      <td className="py-1.5 font-black text-[#117a37] tabular-nums">
                        {rankDist.class2}
                      </td>
                      <td className="py-1.5 font-black text-[#0284c7] tabular-nums">
                        {rankDist.class1}
                      </td>
                      <td className="py-1.5 font-black text-slate-800 tabular-nums">
                        {rankDist.base}
                      </td>
                      <td className="py-1.5 font-black bg-[#e8f5e9] text-[#094d22] tabular-nums">
                        {teachers.length} أساتذة ({teachers.filter((t) => t.spec === 'arabic').length} ع +{' '}
                        {teachers.filter((t) => t.spec !== 'arabic').length} لغات وبدنية)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div className="text-xs font-black text-[#094d22] mb-1">
                  رابعاً: حصيلة التضامن المدرسي، الإطعام، والصحة المدرسية (UDS)
                </div>
                <table className="timetable-grid">
                  <thead>
                    <tr className="hours-header">
                      <th>منحة 5000 دج (مقبول/مودع)</th>
                      <th>مجانية الكتاب المدرسي</th>
                      <th>المستفيدون من المطعم</th>
                      <th>الفحص الطبي (UDS)</th>
                      <th>النقل المدرسي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1.5 font-black text-[#094d22] tabular-nums">
                        {solidarity.schoolGrant5000Approved} / {solidarity.schoolGrant5000Applied}
                      </td>
                      <td className="py-1.5 font-black text-[#117a37] tabular-nums">
                        {solidarity.freeBooksBeneficiaries} تلميذ
                      </td>
                      <td className="py-1.5 font-black text-[#d91424] tabular-nums">
                        {canteenBeneficiariesCount} تلميذ
                      </td>
                      <td className="py-1.5 font-bold tabular-nums">
                        {solidarity.udsExaminedStudents} تلميذ ({solidarity.vaccinatedStudents} ملقح)
                      </td>
                      <td className="py-1.5 font-bold tabular-nums">
                        {solidarity.schoolTransportBeneficiaries} تلميذ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-black p-2 bg-[#f8fafc] text-[11px] font-bold">
                • قائمة التخصصات المسندة:{' '}
                {teachers.map((t) => `${t.name} (${specDisplayTitle(t.spec)})`).join(' — ')}
              </div>
            </div>
          </div>

          <div className="footer-signatures mt-4">
            <div>إحصاء وضبط الأمانة الإدارية</div>
            <div>إمضاء وختم السيد(ة) مدير(ة) المدرسة</div>
            <div>تأشيرة السيد(ة) مفتش(ة) التعليم الابتدائي</div>
          </div>
        </div>
      </div>
    </div>
  );
}
