import React, { useState } from 'react';
import { FileSpreadsheet, BookOpenCheck, Tablet, Printer, Download } from 'lucide-react';
import { Teacher, AssignedGroup, MODELS, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface ExamScheduleDay {
  day: string;
  date: string;
  morningSlot1: string;
  morningSlot2: string;
  afternoonSlot: string;
  supervisors: string;
}

export interface BookInventoryRow {
  levelKey: string;
  levelLabel: string;
  titlesCount: number;
  receivedSets: number;
  freeDistributed: number; // المجانية (معوزين + أبناء القطاع)
  soldSets: number; // الكتب المباعة
  packPriceDzd: number; // سعر المجموعة دج
}

export interface TabletInventoryItem {
  id: string;
  equipmentName: string;
  assignedClass: string;
  receivedQty: number;
  workingQty: number;
  maintenanceQty: number;
  serialRange: string;
  conditionNote: string;
}

export const INITIAL_EXAM_DAYS: ExamScheduleDay[] = [
  {
    day: 'الأحد',
    date: '2026-12-06',
    morningSlot1: 'اللغة العربية (08:15 - 09:30)',
    morningSlot2: 'التربية الإسلامية (09:45 - 10:30)',
    afternoonSlot: 'التربية المدنية (13:15 - 14:00)',
    supervisors: 'أ. حميدي البشير + أ. سعاد بن يطو',
  },
  {
    day: 'الاثنين',
    date: '2026-12-07',
    morningSlot1: 'الرياضيات (08:15 - 09:30)',
    morningSlot2: 'التربية العلمية والتكنولوجية (09:45 - 10:30)',
    afternoonSlot: 'اللغة الأمازيغية — س4/س5 (13:15 - 14:15)',
    supervisors: 'أ. عبد القادر رحماني + أ. فاطمة الزهراء عليوي',
  },
  {
    day: 'الثلاثاء',
    date: '2026-12-08',
    morningSlot1: 'اللغة الفرنسية Français — س3/س4/س5 (08:15 - 09:15)',
    morningSlot2: 'التاريخ والجغرافيا — س3/س4/س5 (09:45 - 10:45)',
    afternoonSlot: 'أمسية راحة بيداغوجية / تصحيح جماعي',
    supervisors: 'Mme. Amrani Nadia + أ. كمال بوزيد',
  },
  {
    day: 'الأربعاء',
    date: '2026-12-09',
    morningSlot1: 'اللغة الإنجليزية English — س3/س4/س5 (08:15 - 09:15)',
    morningSlot2: 'التربية الفنية والتشكيلية (09:45 - 10:30)',
    afternoonSlot: 'التربية البدنية والرياضية (13:15 - 14:45)',
    supervisors: 'Mr. Mansouri Karim + أ. بوعلام دراجي',
  },
  {
    day: 'الخميس',
    date: '2026-12-10',
    morningSlot1: 'تصحيح جماعي للمواضيع مع التلاميذ (08:00 - 09:30)',
    morningSlot2: 'تسليم أوراق الإجابة ومعاينة العلامات (09:45 - 11:15)',
    afternoonSlot: 'صب النقاط في أرضية الرقمنة (13:00 - 15:00)',
    supervisors: 'كافة أساتذة الأفواج التربوية بإشراف المدير',
  },
];

export const INITIAL_BOOKS_INVENTORY: BookInventoryRow[] = [
  { levelKey: 'prep', levelLabel: 'التربية التحضيرية (دفاتر الأنشطة)', titlesCount: 4, receivedSets: 32, freeDistributed: 18, soldSets: 12, packPriceDzd: 650 },
  { levelKey: '1', levelLabel: 'السنة الأولى ابتدائي (مجموعة كاملة)', titlesCount: 5, receivedSets: 38, freeDistributed: 22, soldSets: 14, packPriceDzd: 1050 },
  { levelKey: '2', levelLabel: 'السنة الثانية ابتدائي (مجموعة كاملة)', titlesCount: 5, receivedSets: 38, freeDistributed: 20, soldSets: 16, packPriceDzd: 1100 },
  { levelKey: '3', levelLabel: 'السنة الثالثة ابتدائي (مع الفرنسية والإنجليزية)', titlesCount: 10, receivedSets: 36, freeDistributed: 19, soldSets: 15, packPriceDzd: 2150 },
  { levelKey: '4', levelLabel: 'السنة الرابعة ابتدائي (مجموعة كاملة)', titlesCount: 11, receivedSets: 36, freeDistributed: 18, soldSets: 16, packPriceDzd: 2350 },
  { levelKey: '5', levelLabel: 'السنة الخامسة ابتدائي (مجموعة كاملة)', titlesCount: 11, receivedSets: 40, freeDistributed: 21, soldSets: 17, packPriceDzd: 2450 },
];

export const INITIAL_TABLETS_INVENTORY: TabletInventoryItem[] = [
  {
    id: 'tb1',
    equipmentName: 'لوحات إلكترونية للتلاميذ (Tablettes Élèves 10")',
    assignedClass: 'السنة الخامسة ابتدائي (حجرة 05)',
    receivedQty: 36,
    workingQty: 35,
    maintenanceQty: 1,
    serialRange: 'SN-DZ-2026-001 إلى 036',
    conditionNote: 'محملة بجميع الكتب الرقمية الرسمية — حالة ممتازة',
  },
  {
    id: 'tb2',
    equipmentName: 'لوحات إلكترونية للتلاميذ (Tablettes Élèves 10")',
    assignedClass: 'السنة الرابعة ابتدائي (حجرة 04)',
    receivedQty: 34,
    workingQty: 34,
    maintenanceQty: 0,
    serialRange: 'SN-DZ-2026-037 إلى 070',
    conditionNote: 'محملة بالكتب الرقمية — شغالة 100%',
  },
  {
    id: 'tb3',
    equipmentName: 'لوحات إلكترونية للتلاميذ (Tablettes Élèves 10")',
    assignedClass: 'السنة الثالثة ابتدائي (حجرة 03)',
    receivedQty: 34,
    workingQty: 33,
    maintenanceQty: 1,
    serialRange: 'SN-DZ-2026-071 إلى 104',
    conditionNote: 'لوحة واحدة في الصيانة الوقائية للشاشة',
  },
  {
    id: 'tb4',
    equipmentName: 'لوحات إلكترونية خاصة بالأساتذة + الخادم المحلي (Serveur)',
    assignedClass: 'أساتذة س3 / س4 / س5 + الإدارة',
    receivedQty: 4,
    workingQty: 4,
    maintenanceQty: 0,
    serialRange: 'SRV-DZ-2026-M01 إلى M04',
    conditionNote: 'مرتبطة بالسبورة التفاعلية وشبكة القسم المحلية',
  },
  {
    id: 'tb5',
    equipmentName: 'عربات الشحن والحفظ الذكية المؤمنة (Chariots de Charge)',
    assignedClass: 'الحجرات الرقمية 03 / 04 / 05',
    receivedQty: 3,
    workingQty: 3,
    maintenanceQty: 0,
    serialRange: 'CH-DZ-2026-C01 إلى C03',
    conditionNote: 'مزودة بقواطع حماية كهربائية وأقفال أمان',
  },
];

interface SchoolExamsAndBooksModuleProps {
  mode: 'exams' | 'books_tablets';
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
  examDays: ExamScheduleDay[];
  setExamDays: React.Dispatch<React.SetStateAction<ExamScheduleDay[]>>;
  booksInventory: BookInventoryRow[];
  setBooksInventory: React.Dispatch<React.SetStateAction<BookInventoryRow[]>>;
  tabletsInventory: TabletInventoryItem[];
  setTabletsInventory: React.Dispatch<React.SetStateAction<TabletInventoryItem[]>>;
}

export default function SchoolExamsAndBooksModule({
  mode,
  institution,
  teachers,
  groups,
  logoUrl,
  examDays,
  setExamDays,
  booksInventory,
  setBooksInventory,
  tabletsInventory,
  setTabletsInventory,
}: SchoolExamsAndBooksModuleProps) {
  const [selectedExamTerm, setSelectedExamTerm] = useState<'اختبارات الفصل الأول' | 'اختبارات الفصل الثاني' | 'اختبارات الفصل الثالث'>('اختبارات الفصل الأول');
  const [examReadiness, setExamReadiness] = useState<Record<string, { printed: boolean; corrected: boolean; digitized: boolean }>>({});

  const toggleReadiness = (tId: string, field: 'printed' | 'corrected' | 'digitized') => {
    const curr = examReadiness[tId] || { printed: true, corrected: true, digitized: true };
    setExamReadiness((prev) => ({
      ...prev,
      [tId]: { ...curr, [field]: !curr[field] },
    }));
  };

  if (mode === 'exams') {
    return (
      <div className="space-y-6">
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#117a37]" />
              <span>قسم تنظيم الاختبارات المدرسية والامتحانات الفصلية ({selectedExamTerm})</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              ضبط رزنامة الاختبارات الموحدة، توزيع الحراسة، متابعة طبع المواضيع وتصحيح الأوراق وصب النقاط في أرضية الرقمنة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['اختبارات الفصل الأول', 'اختبارات الفصل الثاني', 'اختبارات الفصل الثالث'] as const).map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedExamTerm(term)}
                  className={`px-3 py-1.5 rounded-md text-xs font-extrabold cursor-pointer transition whitespace-nowrap ${
                    selectedExamTerm === term ? 'bg-[#117a37] text-white' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                exportElementToPDF(null, `رزنامة_الاختبارات_${selectedExamTerm}_${institution.school}`, 'landscape')
              }
              className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تحميل PDF</span>
            </button>
            <button
              onClick={() => triggerPrintOrPdf(`رزنامة_الاختبارات_${selectedExamTerm}_${institution.school}`)}
              className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة رزنامة الاختبارات (A4)</span>
            </button>
          </div>
        </div>

        {/* Editable Exam Timetable & Teacher Digitization Tracker */}
        <div className="no-print grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 overflow-x-auto">
            <h3 className="text-sm font-black text-[#094d22]">
              ضبط وتعديل جدول سير الاختبارات الفصلية — {selectedExamTerm}
            </h3>
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                  <th className="py-2.5 px-2">اليوم والتاريخ</th>
                  <th className="py-2.5 px-2">الفترة الصباحية 1</th>
                  <th className="py-2.5 px-2">الفترة الصباحية 2</th>
                  <th className="py-2.5 px-2">الفترة المسائية</th>
                  <th className="py-2.5 px-2">الأساتذة المشرفون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {examDays.map((row, idx) => (
                  <tr key={row.day} className="hover:bg-slate-50">
                    <td className="py-2 px-2">
                      <div className="font-black text-[#d91424]">{row.day}</div>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDays((prev) => prev.map((r, i) => (i === idx ? { ...r, date: val } : r)));
                        }}
                        className="mt-1 px-1.5 py-0.5 border border-slate-300 rounded text-[11px] tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.morningSlot1}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDays((prev) => prev.map((r, i) => (i === idx ? { ...r, morningSlot1: val } : r)));
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.morningSlot2}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDays((prev) => prev.map((r, i) => (i === idx ? { ...r, morningSlot2: val } : r)));
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.afternoonSlot}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDays((prev) => prev.map((r, i) => (i === idx ? { ...r, afternoonSlot: val } : r)));
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.supervisors}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamDays((prev) => prev.map((r, i) => (i === idx ? { ...r, supervisors: val } : r)));
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold text-[#094d22]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exam Printing & Digitization Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-[#094d22]">
              متابعة سحب المواضيع والتصحيح وحجز نقاط الرقمنة
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                    <th className="py-2 px-2">الأستاذ(ة) / الفوج</th>
                    <th className="py-2 px-2 text-center">طبع المواضيع</th>
                    <th className="py-2 px-2 text-center">التصحيح</th>
                    <th className="py-2 px-2 text-center">صب الرقمنة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map((t) => {
                    const st = examReadiness[t.id] || { printed: true, corrected: true, digitized: true };
                    const grp = groups.find((g) => g.teacherId === t.id);
                    const m = grp ? MODELS[grp.level] : null;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2">
                          <div className="font-extrabold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-500">{m ? m.levelTitle : 'متخصص'}</div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={st.printed}
                            onChange={() => toggleReadiness(t.id, 'printed')}
                            className="accent-[#117a37] cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={st.corrected}
                            onChange={() => toggleReadiness(t.id, 'corrected')}
                            className="accent-[#117a37] cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={st.digitized}
                            onChange={() => toggleReadiness(t.id, 'digitized')}
                            className="accent-[#117a37] cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Printable Official Exam Schedule Sheet */}
        <div className="sheet-scroll-container">
          <div className="a4-landscape-page" dir="rtl">
            <div className="sheet-header-grid">
              <div className="sheet-right-col">
                <div>مديرية التربية لولاية : {institution.wilaya}</div>
                <div>مفتشية التعليم الابتدائي — مقاطعة : {institution.district}</div>
                <div>المدرسة الابتدائية : {institution.school}</div>
              </div>

              <div className="sheet-center-col">
                <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="min-heading">وزارة التربية الوطنية</div>
                <div className="title-frame-with-logo">
                  <img src={logoUrl} alt="SNTE" />
                  <div className="title-frame-text">
                    <span className="main-doc-title">
                      الرزنامة الرسمية لسير وحراسة {selectedExamTerm} ({institution.year})
                    </span>
                  </div>
                </div>
              </div>

              <div className="sheet-left-col">
                <div>السنة الدراسية : {institution.year}</div>
                <div>المدير(ة) : {institution.directorName}</div>
                <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
              </div>
            </div>

            <table className="timetable-grid mt-3">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '90px' }}>اليوم</th>
                  <th style={{ width: '105px' }}>التاريخ</th>
                  <th>الفترة الصباحية الأولى (08:15 - 09:30)</th>
                  <th>الفترة الصباحية الثانية (09:45 - 10:45)</th>
                  <th>الفترة المسائية (13:15 - 14:45)</th>
                  <th>الأساتذة المكلفون بالحراسة والتنظيم</th>
                </tr>
              </thead>
              <tbody>
                {examDays.map((row) => (
                  <tr key={row.day}>
                    <td className="day-col-cell py-2.5">{row.day}</td>
                    <td className="font-bold tabular-nums">{row.date}</td>
                    <td className="font-extrabold text-[#094d22]" contentEditable suppressContentEditableWarning>
                      {row.morningSlot1}
                    </td>
                    <td className="font-extrabold text-[#117a37] bg-[#f0fdf4]" contentEditable suppressContentEditableWarning>
                      {row.morningSlot2}
                    </td>
                    <td className="font-bold" contentEditable suppressContentEditableWarning>
                      {row.afternoonSlot}
                    </td>
                    <td className="font-bold text-[#d91424]" contentEditable suppressContentEditableWarning>
                      {row.supervisors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="footer-signatures mt-6">
              <div>إمضاء ممثل الأساتذة</div>
              <div>إمضاء وختم السيد(ة) المدير(ة)</div>
              <div>تأشيرة السيد(ة) مفتش(ة) المقاطعة</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODE === 'books_tablets': قسم الكتب المدرسية والتابلات
  const totalReceivedBooks = booksInventory.reduce((a, b) => a + b.receivedSets * b.titlesCount, 0);
  const totalFreeSets = booksInventory.reduce((a, b) => a + b.freeDistributed, 0);
  const totalSoldSets = booksInventory.reduce((a, b) => a + b.soldSets, 0);
  const totalSalesAmountDzd = booksInventory.reduce((a, b) => a + b.soldSets * b.packPriceDzd, 0);

  const totalTabletsReceived = tabletsInventory
    .filter((t) => t.equipmentName.includes('لوحات'))
    .reduce((a, b) => a + b.receivedQty, 0);
  const totalTabletsWorking = tabletsInventory
    .filter((t) => t.equipmentName.includes('لوحات'))
    .reduce((a, b) => a + b.workingQty, 0);

  return (
    <div className="space-y-6">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-[#117a37]" />
            <span>قسم تسيير الكتب المدرسية واللوحات الإلكترونية الرقمية (التابلات — Tablettes)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            متابعة استلام وتوزيع الكتاب المدرسي (المجانية والبيع) وجرد التجهيزات الرقمية (التابلات وعربات الشحن الذكية)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(null, `جرد_الكتب_والتابلات_${institution.school}`, 'landscape')
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تحميل PDF</span>
          </button>
          <button
            onClick={() => triggerPrintOrPdf(`جرد_الكتب_والتابلات_${institution.school}`)}
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة محضر جرد الكتب والتابلات (A4)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Books & Tablets */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">إجمالي الكتب المدرسية المستلمة</div>
          <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">{totalReceivedBooks} كتاب</div>
          <div className="text-xs text-slate-600 mt-1">موزعة على 06 مستويات تعليمية</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">المجموعات الموزعة (مجانية + مباعة)</div>
          <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">
            {totalFreeSets + totalSoldSets} مجموعة
          </div>
          <div className="text-xs text-slate-600 mt-1">
            مجانية: {totalFreeSets} · مباعة: {totalSoldSets}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">المبلغ الإجمالي المحصل من بيع الكتب</div>
          <div className="text-2xl font-black text-[#d91424] mt-1 tabular-nums">
            {totalSalesAmountDzd.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-xs text-slate-600 mt-1">يحول لحساب الديوان الوطني للمطبوعات المدرسية</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">اللوحات الإلكترونية الرقمية (التابلات)</div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {totalTabletsWorking} / {totalTabletsReceived} شغالة
          </div>
          <div className="text-xs text-slate-600 mt-1">جاهزية التابلات وعربات الشحن: {Math.round((totalTabletsWorking / Math.max(1, totalTabletsReceived)) * 100)}%</div>
        </div>
      </div>

      {/* Interactive Tables for Books & Tablets */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Books Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 overflow-x-auto">
          <h3 className="text-sm font-black text-[#094d22] flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-[#117a37]" />
            <span>1. جدول تسيير وتوزيع الكتب المدرسية ({institution.year})</span>
          </h3>
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                <th className="py-2 px-2">المستوى</th>
                <th className="py-2 px-2">العناوين</th>
                <th className="py-2 px-2">المستلم</th>
                <th className="py-2 px-2">المجانية</th>
                <th className="py-2 px-2">المباعة</th>
                <th className="py-2 px-2">المتبقي</th>
                <th className="py-2 px-2">سعر المجموعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {booksInventory.map((b, idx) => {
                const remaining = Math.max(0, b.receivedSets - b.freeDistributed - b.soldSets);
                return (
                  <tr key={b.levelKey} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-extrabold text-slate-900">{b.levelLabel}</td>
                    <td className="py-2 px-2 font-bold text-center tabular-nums">{b.titlesCount}</td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={b.receivedSets}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBooksInventory((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, receivedSets: val } : item))
                          );
                        }}
                        className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={b.freeDistributed}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBooksInventory((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, freeDistributed: val } : item))
                          );
                        }}
                        className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold text-[#117a37] tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={b.soldSets}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBooksInventory((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, soldSets: val } : item))
                          );
                        }}
                        className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold text-[#094d22] tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2 font-black text-center text-[#d91424] tabular-nums">{remaining}</td>
                    <td className="py-2 px-2 font-bold tabular-nums">{b.packPriceDzd} دج</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tablets Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 overflow-x-auto">
          <h3 className="text-sm font-black text-[#094d22] flex items-center gap-2">
            <Tablet className="w-4 h-4 text-[#d91424]" />
            <span>2. جرد ومتابعة اللوحات الإلكترونية (التابلات وعربات الشحن)</span>
          </h3>
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                <th className="py-2 px-2">التجهيز الرقمي</th>
                <th className="py-2 px-2">الفوج المخصص</th>
                <th className="py-2 px-2">المستلم</th>
                <th className="py-2 px-2">شغال</th>
                <th className="py-2 px-2">صيانة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tabletsInventory.map((tb, idx) => (
                <tr key={tb.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2">
                    <div className="font-extrabold text-slate-900">{tb.equipmentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{tb.serialRange}</div>
                  </td>
                  <td className="py-2 px-2 font-bold text-[#094d22]">{tb.assignedClass}</td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      value={tb.receivedQty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTabletsInventory((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, receivedQty: val } : item))
                        );
                      }}
                      className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      value={tb.workingQty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTabletsInventory((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, workingQty: val } : item))
                        );
                      }}
                      className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold text-[#117a37] tabular-nums"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      value={tb.maintenanceQty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTabletsInventory((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, maintenanceQty: val } : item))
                        );
                      }}
                      className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold text-[#d91424] tabular-nums"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Official Inventory Sheet for Books & Tablets */}
      <div className="sheet-scroll-container">
        <div className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مفتشية التعليم الابتدائي — مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    محضر جرد وحصيلة الكتاب المدرسي واللوحات الإلكترونية الرقمية (التابلات)
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>المدير(ة) : {institution.directorName}</div>
              <div>إجمالي اللوحات الشغالة : {totalTabletsWorking} / {totalTabletsReceived}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          <div className="text-xs font-black text-[#094d22] mb-1">أولاً — وضعية توزيع ومخزون الكتاب المدرسي:</div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>المستوى التعليمي</th>
                <th>عدد العناوين</th>
                <th>المجموعات المستلمة</th>
                <th>التوزيع المجاني</th>
                <th>المجموعات المباعة</th>
                <th>المتبقي بالمخزن</th>
                <th>سعر المجموعة</th>
                <th className="highlight-col">المبلغ المحصل (دج)</th>
              </tr>
            </thead>
            <tbody>
              {booksInventory.map((b) => {
                const rem = Math.max(0, b.receivedSets - b.freeDistributed - b.soldSets);
                const amount = b.soldSets * b.packPriceDzd;
                return (
                  <tr key={b.levelKey}>
                    <td className="font-extrabold text-right px-2">{b.levelLabel}</td>
                    <td className="tabular-nums">{b.titlesCount}</td>
                    <td className="tabular-nums">{b.receivedSets}</td>
                    <td className="tabular-nums text-[#117a37]">{b.freeDistributed}</td>
                    <td className="tabular-nums">{b.soldSets}</td>
                    <td className="tabular-nums">{rem}</td>
                    <td className="tabular-nums">{b.packPriceDzd} دج</td>
                    <td className="highlight-col tabular-nums">{amount.toLocaleString('ar-DZ')} دج</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="text-xs font-black text-[#d91424] mb-1 mt-2">
            ثانياً — جرد اللوحات الإلكترونية الرقمية (Tablettes Numériques) وتجهيزات الشحن:
          </div>
          <table className="timetable-grid">
            <thead>
              <tr className="hours-header">
                <th>بيان التجهيز الرقمي</th>
                <th>الفوج / القسم المخصص</th>
                <th>الأرقام التسلسلية للجرد</th>
                <th>الكمية المستلمة</th>
                <th>الصالحة للاستعمال</th>
                <th>في الصيانة</th>
                <th>الملاحظات التقنية</th>
              </tr>
            </thead>
            <tbody>
              {tabletsInventory.map((tb) => (
                <tr key={tb.id}>
                  <td className="font-extrabold text-right px-2 py-1">{tb.equipmentName}</td>
                  <td className="font-bold text-[#094d22]">{tb.assignedClass}</td>
                  <td className="font-mono text-[11px] tabular-nums">{tb.serialRange}</td>
                  <td className="font-bold tabular-nums">{tb.receivedQty}</td>
                  <td className="font-black text-[#117a37] tabular-nums">{tb.workingQty}</td>
                  <td className="font-bold text-[#d91424] tabular-nums">{tb.maintenanceQty}</td>
                  <td className="text-[11px]">{tb.conditionNote}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer-signatures mt-4">
            <div>إمضاء الأساتذة المستلمين</div>
            <div>إمضاء وختم السيد(ة) المدير(ة)</div>
            <div>مصادقة المصالح الاقتصادية / المفتشية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
