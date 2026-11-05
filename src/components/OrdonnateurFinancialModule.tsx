import React, { useState, useRef } from 'react';
import {
  Landmark,
  FileCheck2,
  Printer,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
  Coins,
  Receipt,
  BookOpen,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export type SchoolStage = 'primary' | 'middle' | 'high';

export interface BudgetChapterRow {
  id: string;
  chapterCode: string;
  chapterTitle: string;
  articleTitle: string;
  allocatedAmountDzd: number;
  committedAmountDzd: number; // الملتزم به
  mandatedAmountDzd: number; // المأمور بصرفه (الحوالات)
  notes: string;
}

export interface OrdonnateurOrderRecord {
  id: string;
  docType: 'سند طلب (Bon de Commande)' | 'حوالة دفع (Mandat de Paiement)' | 'شهادة خدمة منجزة';
  refNumber: string;
  date: string;
  chapterCode: string;
  supplierOrBeneficiary: string;
  subject: string;
  amountDzd: number;
  bursarVisaStatus: 'مؤشر من المقتصد ومسدد' | 'قيد المراقبة والتصفية' | 'محرر من الآمر بالصرف';
}

const INITIAL_BUDGET_CHAPTERS: BudgetChapterRow[] = [
  {
    id: 'ch1',
    chapterCode: 'الباب 21 - المادة 01',
    chapterTitle: 'التغذية والإطعام (النظام نصف الداخلي)',
    articleTitle: 'شراء المواد الغذائية وتموين المطعم',
    allocatedAmountDzd: 4800000,
    committedAmountDzd: 3250000,
    mandatedAmountDzd: 2980000,
    notes: 'اعتماد الدولة + مساهمة العائلات في النظام نصف الداخلي',
  },
  {
    id: 'ch2',
    chapterCode: 'الباب 22 - المادة 01',
    chapterTitle: 'الأعباء الإضافية ومصاريف التسيير العام',
    articleTitle: 'الكهرباء والغاز والماء والهاتف والأنترنت',
    allocatedAmountDzd: 1450000,
    committedAmountDzd: 980000,
    mandatedAmountDzd: 920000,
    notes: 'تسديد فواتير سونلغاز والجزائرية للمياه واتصالات الجزائر',
  },
  {
    id: 'ch3',
    chapterCode: 'الباب 23 - المادة 02',
    chapterTitle: 'الوسائل البيداغوجية والتعليمية والمخابر',
    articleTitle: 'لوازم التجارب المخبرية، الورق، الطباشير، وأجهزة الإعلام الآلي',
    allocatedAmountDzd: 950000,
    committedAmountDzd: 740000,
    mandatedAmountDzd: 710000,
    notes: 'تجهيز مخابر العلوم والفيزياء والإعلام الآلي والنسخ',
  },
  {
    id: 'ch4',
    chapterCode: 'الباب 24 - المادة 01',
    chapterTitle: 'صيانة وتصليح المباني والتجهيزات المدرسية',
    articleTitle: 'صيانة المراجل والتدفئة المركزية، الزجاج، المساكة، والإنارة',
    allocatedAmountDzd: 1200000,
    committedAmountDzd: 890000,
    mandatedAmountDzd: 850000,
    notes: 'أشغال الصيانة الدورية قبل فصل الشتاء',
  },
  {
    id: 'ch5',
    chapterCode: 'الباب 27 - المادة 01',
    chapterTitle: 'النشاطات الثقافية والرياضية والجوائز التشجيعية',
    articleTitle: 'تكريم المتفوقين في الامتحانات الرسمية والأنشطة اللاصفية',
    allocatedAmountDzd: 350000,
    committedAmountDzd: 180000,
    mandatedAmountDzd: 150000,
    notes: 'تشجيع التلاميذ المتفوقين والنوادي التربوية',
  },
];

const INITIAL_ORDONNATEUR_ORDERS: OrdonnateurOrderRecord[] = [
  {
    id: 'ord1',
    docType: 'سند طلب (Bon de Commande)',
    refNumber: 'BC-2026/041',
    date: '2026-10-12',
    chapterCode: 'الباب 23 - المادة 02',
    supplierOrBeneficiary: 'مؤسسة التجهيز المكتبي والمخبري والعلمي',
    subject: 'اقتناء محاليل وكواشف مخبرية لمخبر العلوم الطبيعية والفيزياء + 60 رزمة ورق A4',
    amountDzd: 185000,
    bursarVisaStatus: 'مؤشر من المقتصد ومسدد',
  },
  {
    id: 'ord2',
    docType: 'حوالة دفع (Mandat de Paiement)',
    refNumber: 'MP-2026/088',
    date: '2026-10-20',
    chapterCode: 'الباب 21 - المادة 01',
    supplierOrBeneficiary: 'ممون المواد الغذائية العامة واللحوم (النظام نصف الداخلي)',
    subject: 'تسديد فاتورة تموين النظام نصف الداخلي لشهر أكتوبر 2026 بناءً على شهادة الخدمة المنجزة',
    amountDzd: 640000,
    bursarVisaStatus: 'مؤشر من المقتصد ومسدد',
  },
  {
    id: 'ord3',
    docType: 'شهادة خدمة منجزة',
    refNumber: 'SF-2026/052',
    date: '2026-10-28',
    chapterCode: 'الباب 24 - المادة 01',
    supplierOrBeneficiary: 'مؤسسة الصيانة الحرارية والتدفئة المعتمدة',
    subject: 'معاينة وإشهاد بإنجاز أشغال صيانة وتجريب شبكة التدفئة المركزية بالحجرات والمخابر',
    amountDzd: 210000,
    bursarVisaStatus: 'قيد المراقبة والتصفية',
  },
];

type OrdonnateurOfficialDocType =
  | 'budget_summary_sheet'
  | 'signature_specimen'
  | 'bon_commande_doc'
  | 'mandat_paiement_doc'
  | 'caisse_audit_pv';

interface OrdonnateurFinancialModuleProps {
  schoolStage: SchoolStage;
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  logoUrl: string;
  onSwitchStage?: (stage: SchoolStage) => void;
}

export default function OrdonnateurFinancialModule({
  schoolStage,
  institution,
  logoUrl,
  onSwitchStage,
}: OrdonnateurFinancialModuleProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const [subTab, setSubTab] = useState<
    'overview_chapters' | 'orders_mandates' | 'official_docs' | 'legal_documentation'
  >('overview_chapters');

  // Ordonnateur & Bursar Identity Metadata
  const [bursarName, setBursarName] = useState<string>('السيد: بوعلام قاسمي (مقتصد رئيسي)');
  const [treasuryAccountNumber, setTreasuryAccountNumber] = useState<string>('RIP 008-03001-12457890-44');
  const [taxNifNumber, setTaxNifNumber] = useState<string>('099603019845120');
  const [accreditationRef, setAccreditationRef] = useState<string>('مقرر الاعتماد رقم 214/م.ت/2026');

  // Budget Chapters State
  const [chapters, setChapters] = useState<BudgetChapterRow[]>(INITIAL_BUDGET_CHAPTERS);

  // Orders & Mandates State
  const [orders, setOrders] = useState<OrdonnateurOrderRecord[]>(INITIAL_ORDONNATEUR_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(INITIAL_ORDONNATEUR_ORDERS[0].id);

  // New Order Form State
  const [newDocType, setNewDocType] =
    useState<OrdonnateurOrderRecord['docType']>('سند طلب (Bon de Commande)');
  const [newRefNum, setNewRefNum] = useState('BC-2026/042');
  const [newDate, setNewDate] = useState('2026-11-05');
  const [newChapterCode, setNewChapterCode] = useState(INITIAL_BUDGET_CHAPTERS[0].chapterCode);
  const [newSupplier, setNewSupplier] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newAmount, setNewAmount] = useState<number>(125000);

  // Official Printable Document Selection
  const [selectedPrintDoc, setSelectedPrintDoc] =
    useState<OrdonnateurOfficialDocType>('budget_summary_sheet');

  const stageTitle =
    schoolStage === 'high'
      ? 'التعليم الثانوي (ثانوية)'
      : schoolStage === 'middle'
      ? 'التعليم المتوسط (متوسطة)'
      : 'التعليم الابتدائي (مدرسة ابتدائية)';

  const councilName =
    schoolStage === 'high'
      ? 'مجلس التوجيه والتسيير (COG)'
      : 'مجلس التربية والتسيير (CEG)';

  const totalAllocated = chapters.reduce((s, c) => s + c.allocatedAmountDzd, 0);
  const totalCommitted = chapters.reduce((s, c) => s + c.committedAmountDzd, 0);
  const totalMandated = chapters.reduce((s, c) => s + c.mandatedAmountDzd, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalCommitted);
  const executionRate =
    totalAllocated > 0 ? Number(((totalMandated / totalAllocated) * 100).toFixed(1)) : 0;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleUpdateChapterAmount = (
    id: string,
    field: 'allocatedAmountDzd' | 'committedAmountDzd' | 'mandatedAmountDzd',
    val: string
  ) => {
    const num = Math.max(0, Number(val) || 0);
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: num } : c)));
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.trim() || !newSubject.trim()) return;
    const item: OrdonnateurOrderRecord = {
      id: 'ord_' + Date.now(),
      docType: newDocType,
      refNumber: newRefNum.trim() || `ORD-${orders.length + 1}`,
      date: newDate,
      chapterCode: newChapterCode,
      supplierOrBeneficiary: newSupplier.trim(),
      subject: newSubject.trim(),
      amountDzd: Math.max(0, Number(newAmount) || 0),
      bursarVisaStatus: 'محرر من الآمر بالصرف',
    };
    setOrders((prev) => [item, ...prev]);
    setSelectedOrderId(item.id);
    setNewSupplier('');
    setNewSubject('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#094d22] text-white text-[11px] font-black">
              صفة الآمر بالصرف الرئيسي (Ordonnateur Principal)
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
              القانون 23-07 للمحاسبة العمومية + المرسوم 25-54
            </span>
          </div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2 mt-1.5">
            <Landmark className="w-5 h-5 text-[#117a37]" />
            <span>
              منظومة الآمر بالصرف والتسيير المالي والمادي والتوثيق المحاسبي — {stageTitle}
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            توثيق صلاحيات مدير المتوسطة / الثانوية بصفته الآمر بالصرف للميزانية، متابعة الأبواب المالية، سندات الطلب، حوالات الدفع، ومراقبة الصندوق مع المقتصد
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(
                sheetRef.current,
                `وثيقة_الآمر_بالصرف_${selectedPrintDoc}_${institution.school}`,
                'landscape'
              )
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل وثيقة الآمر بالصرف (PDF)</span>
          </button>

          <button
            onClick={() =>
              triggerPrintOrPdf(
                `وثيقة_الآمر_بالصرف_${selectedPrintDoc}_${institution.school}`,
                sheetRef.current
              )
            }
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوثيقة الرسمية (A4)</span>
          </button>
        </div>
      </div>

      {/* Note if user is viewing in Primary Mode */}
      {schoolStage === 'primary' && (
        <div className="no-print bg-amber-50 border-2 border-amber-400 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-black text-amber-950 text-sm">
              تنبيه تنظيمي: أنت تستعرض حالياً المنصة في نمط «التعليم الابتدائي»
            </div>
            <p className="text-amber-900 font-semibold">
              في التعليم المتوسط والثانوي تتمتع المؤسسة بالاستقلال المالي ويكتسب المدير صفة «الآمر بالصرف الرئيسي» لميزانية التسيير بمعية المسير المالي (المقتصد). يمكنك التبديل الفوري إلى الطور المتوسط أو الثانوي لتفعيل كافة خصائصهما.
            </p>
          </div>
          {onSwitchStage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSwitchStage('middle')}
                className="px-3.5 py-2 rounded-lg bg-[#094d22] text-white font-black cursor-pointer"
              >
                التحويل إلى الطور المتوسط (CEM)
              </button>
              <button
                onClick={() => onSwitchStage('high')}
                className="px-3.5 py-2 rounded-lg bg-[#d91424] text-white font-black cursor-pointer"
              >
                التحويل إلى الطور الثانوي (Lycée)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ordonnateur Official Identity Strip */}
      <div className="no-print bg-gradient-to-l from-[#073818] via-[#094d22] to-[#117a37] text-white rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-lg border border-white/15">
            <label className="block text-yellow-200 font-bold mb-1">الآمر بالصرف الرئيسي (المدير):</label>
            <div className="font-black text-sm">{institution.directorName}</div>
            <input
              type="text"
              value={accreditationRef}
              onChange={(e) => setAccreditationRef(e.target.value)}
              className="mt-1.5 w-full bg-black/25 border border-white/20 rounded px-2 py-1 text-[11px] font-bold text-white"
            />
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/15">
            <label className="block text-yellow-200 font-bold mb-1">المحاسب العمومي (المقتصد / المسير المالي):</label>
            <input
              type="text"
              value={bursarName}
              onChange={(e) => setBursarName(e.target.value)}
              className="w-full bg-white text-slate-900 rounded px-2.5 py-1.5 font-black text-xs"
            />
            <div className="text-[10px] text-emerald-100 mt-1">مبدأ الفصل بين الآمر بالصرف والمحاسب (القانون 23-07)</div>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/15">
            <label className="block text-yellow-200 font-bold mb-1">رقم حساب الخزينة العمومية (Trésor):</label>
            <input
              type="text"
              value={treasuryAccountNumber}
              onChange={(e) => setTreasuryAccountNumber(e.target.value)}
              className="w-full bg-white text-slate-900 rounded px-2.5 py-1.5 font-black text-xs tabular-nums"
            />
            <div className="text-[10px] text-emerald-100 mt-1">خزينة ولاية {institution.wilaya}</div>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/15">
            <label className="block text-yellow-200 font-bold mb-1">الرقم الجبائي للمؤسسة (NIF) ومجلس التسيير:</label>
            <input
              type="text"
              value={taxNifNumber}
              onChange={(e) => setTaxNifNumber(e.target.value)}
              className="w-full bg-white text-slate-900 rounded px-2.5 py-1.5 font-black text-xs tabular-nums"
            />
            <div className="text-[10px] text-emerald-100 mt-1">الهيئة المداولة: {councilName}</div>
          </div>
        </div>
      </div>

      {/* 4 Sub-Tabs for Ordonnateur Module */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2">
        {[
          {
            id: 'overview_chapters',
            label: '1. أبواب وفصول الميزانية (الالتزام · التصفية · الأمر بالصرف)',
            icon: <Coins className="w-4 h-4" />,
          },
          {
            id: 'orders_mandates',
            label: '2. سجل سندات الطلب وحوالات الدفع وشهادات الخدمة المنجزة',
            icon: <Receipt className="w-4 h-4" />,
          },
          {
            id: 'official_docs',
            label: '3. نماذج وثائق ومحاضر الآمر بالصرف الجاهزة للطباعة (05 وثائق)',
            icon: <FileCheck2 className="w-4 h-4" />,
          },
          {
            id: 'legal_documentation',
            label: '4. التوثيق التشريعي والمحاسبي لصفة الآمر بالصرف (القانون 23-07)',
            icon: <BookOpen className="w-4 h-4" />,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as typeof subTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-1.5 ${
              subTab === t.id
                ? 'bg-[#094d22] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Summary Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">إجمالي الاعتمادات المفتوحة بالميزانية</div>
          <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">
            {totalAllocated.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-600 mt-1">موزعة على {chapters.length} أبواب ومواد مالية</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">النفقات الملتزم بها (Engagements)</div>
          <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {totalCommitted.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-600 mt-1">بموجب سندات طلب وعقود مؤشرة</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">النفقات المأمور بصرفها (Mandatements)</div>
          <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">
            {totalMandated.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-[#117a37] font-bold mt-1 tabular-nums">
            نسبة تنفيذ الميزانية: {executionRate}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">الرصيد المتاح للالتزام (Crédits Disponibles)</div>
          <div className="text-2xl font-black text-[#d91424] mt-1 tabular-nums">
            {totalRemaining.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-600 mt-1">مراقب آلياً لعدم تجاوز الاعتماد المفتوح</div>
        </div>
      </div>

      {/* SUB-TAB 1: أبواب وفصول الميزانية */}
      {subTab === 'overview_chapters' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#094d22]">
                جدول متابعة تنفيذ أبواب وفصول ميزانية المؤسسة (المرحلة الإدارية للآمر بالصرف)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يمارس المدير كآمر بالصرف ثلاث صلاحيات حصرية في النفقات: (1) الالتزام بالنفقة، (2) تصفية النفقة بعد معاينة الخدمة المنجزة، (3) إصدار الأمر بالصرف (حوالة الدفع)
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPrintDoc('budget_summary_sheet');
                triggerPrintOrPdf(`جدول_تنفيذ_الميزانية_${institution.school}`, sheetRef.current);
              }}
              className="bg-[#094d22] text-white text-xs font-black px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة وضعية تنفيذ الأبواب</span>
            </button>
          </div>

          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                <th className="py-2.5 px-3">الباب والمادة</th>
                <th className="py-2.5 px-3">عنوان الفصل والنفقة</th>
                <th className="py-2.5 px-3 text-center">الاعتماد المفتوح (دج)</th>
                <th className="py-2.5 px-3 text-center">الملتزم به (دج)</th>
                <th className="py-2.5 px-3 text-center">المأمور بصرفه (دج)</th>
                <th className="py-2.5 px-3 text-center">الرصيد المتبقي (دج)</th>
                <th className="py-2.5 px-3">ملاحظات التنفيذ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chapters.map((ch) => {
                const rem = Math.max(0, ch.allocatedAmountDzd - ch.committedAmountDzd);
                return (
                  <tr key={ch.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-black text-[#d91424] whitespace-nowrap">
                      {ch.chapterCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-slate-900">{ch.chapterTitle}</div>
                      <div className="text-[11px] text-slate-500">{ch.articleTitle}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step={10000}
                        value={ch.allocatedAmountDzd}
                        onChange={(e) =>
                          handleUpdateChapterAmount(ch.id, 'allocatedAmountDzd', e.target.value)
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded font-black text-center text-[#094d22] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step={10000}
                        value={ch.committedAmountDzd}
                        onChange={(e) =>
                          handleUpdateChapterAmount(ch.id, 'committedAmountDzd', e.target.value)
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded font-bold text-center text-amber-800 tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step={10000}
                        value={ch.mandatedAmountDzd}
                        onChange={(e) =>
                          handleUpdateChapterAmount(ch.id, 'mandatedAmountDzd', e.target.value)
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded font-bold text-center text-[#117a37] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900 tabular-nums">
                      {rem.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-semibold">{ch.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 2: سجل سندات الطلب وحوالات الدفع */}
      {subTab === 'orders_mandates' && (
        <div className="no-print space-y-5">
          <form
            onSubmit={handleAddOrder}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
          >
            <h3 className="text-sm font-black text-[#094d22] border-b border-slate-100 pb-2.5">
              تحرير سند طلب جديد أو حوالة دفع أو شهادة خدمة منجزة بتوقيع الآمر بالصرف
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">طبيعة السند المحاسبي:</label>
                <select
                  value={newDocType}
                  onChange={(e) =>
                    setNewDocType(e.target.value as OrdonnateurOrderRecord['docType'])
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                >
                  <option value="سند طلب (Bon de Commande)">سند طلب (Bon de Commande)</option>
                  <option value="حوالة دفع (Mandat de Paiement)">حوالة دفع (Mandat de Paiement)</option>
                  <option value="شهادة خدمة منجزة">شهادة خدمة منجزة (Service Fait)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم السند / الحوالة:</label>
                <input
                  type="text"
                  value={newRefNum}
                  onChange={(e) => setNewRefNum(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ التحرير:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الباب والمادة في الميزانية:</label>
                <select
                  value={newChapterCode}
                  onChange={(e) => setNewChapterCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.chapterCode}>
                      {c.chapterCode} ({c.chapterTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الممون / المستفيد:</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  placeholder="اسم المؤسسة أو الممون..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">موضوع الالتزام / النفقة بالتفصيل:</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="تفاصيل التوريد أو الأشغال أو الخدمة..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ الإجمالي (دج):</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-black text-[#094d22] tabular-nums"
                  />
                  <button
                    type="submit"
                    className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إصدار</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
            <h4 className="text-sm font-black text-[#094d22] mb-3">
              دفتر السندات والحوالات الصادرة عن السيد(ة) المدير(ة) بصفته الآمر بالصرف
            </h4>
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">الرقم والتاريخ</th>
                  <th className="py-2.5 px-3">نوع الوثيقة المحاسبية</th>
                  <th className="py-2.5 px-3">الباب المالي</th>
                  <th className="py-2.5 px-3">الممون / المستفيد</th>
                  <th className="py-2.5 px-3">موضوع النفقة</th>
                  <th className="py-2.5 px-3 text-center">المبلغ (دج)</th>
                  <th className="py-2.5 px-3 text-center">حالة التأشيرة والتسديد</th>
                  <th className="py-2.5 px-3 text-center">طباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`cursor-pointer ${
                      selectedOrderId === ord.id ? 'bg-[#e8f5e9]/70 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 tabular-nums whitespace-nowrap">
                      <div className="font-black text-[#d91424]">{ord.refNumber}</div>
                      <div className="text-[11px] text-slate-500">{ord.date}</div>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-[#094d22]">{ord.docType}</td>
                    <td className="py-2.5 px-3 font-bold whitespace-nowrap">{ord.chapterCode}</td>
                    <td className="py-2.5 px-3 font-bold">{ord.supplierOrBeneficiary}</td>
                    <td className="py-2.5 px-3">{ord.subject}</td>
                    <td className="py-2.5 px-3 text-center font-black text-[#117a37] tabular-nums whitespace-nowrap">
                      {ord.amountDzd.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-black">
                        {ord.bursarVisaStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedOrderId(ord.id);
                            setSelectedPrintDoc(
                              ord.docType.includes('سند') ? 'bon_commande_doc' : 'mandat_paiement_doc'
                            );
                            setTimeout(() => {
                              triggerPrintOrPdf(`${ord.refNumber}_${institution.school}`, sheetRef.current);
                            }, 100);
                          }}
                          className="px-2 py-1 bg-[#094d22] text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          طباعة السند
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setOrders((prev) => prev.filter((x) => x.id !== ord.id));
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: نماذج وثائق ومحاضر الآمر بالصرف الجاهزة للطباعة */}
      {subTab === 'official_docs' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22]">
            اختر الوثيقة الرسمية للآمر بالصرف لمعاينتها في الورقة القياسية A4 أسفله وطباعتها أو تحميلها PDF:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {(
              [
                {
                  id: 'budget_summary_sheet',
                  label: '1. كشف وضعية تنفيذ أبواب الميزانية',
                },
                {
                  id: 'signature_specimen',
                  label: '2. بطاقة اعتماد توقيع الآمر بالصرف لدى الخزينة',
                },
                {
                  id: 'bon_commande_doc',
                  label: '3. سند طلب رسمي (Bon de Commande)',
                },
                {
                  id: 'mandat_paiement_doc',
                  label: '4. حوالة دفع وشهادة الخدمة المنجزة',
                },
                {
                  id: 'caisse_audit_pv',
                  label: '5. محضر مراقبة وتوقيف الصندوق مع المقتصد',
                },
              ] as const
            ).map((docItem) => (
              <button
                key={docItem.id}
                onClick={() => setSelectedPrintDoc(docItem.id)}
                className={`p-3 rounded-xl border text-right font-extrabold text-xs cursor-pointer transition ${
                  selectedPrintDoc === docItem.id
                    ? 'bg-[#e8f5e9] border-2 border-[#117a37] text-[#094d22]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {docItem.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: التوثيق التشريعي والمحاسبي لصفة الآمر بالصرف */}
      {subTab === 'legal_documentation' && (
        <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-[#094d22] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#117a37]" />
              <span>1. الأساس القانوني لصفة الآمر بالصرف في المتوسط والثانوي</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200">
              بموجب القانون رقم 23-07 المؤرخ في 21 يونيو 2023 المتعلق بقواعد المحاسبة العمومية والتسيير المالي، والمرسوم التنفيذي 25-54، يُعد مدير المتوسطة ومدير الثانوية «آمراً بالصرف رئيسياً» (Ordonnateur Principal) لميزانية المؤسسة المتمتعة بالشخصية المعنوية والاستقلال المالي.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-semibold">
              <li>
                <b>إثبات وتصفية الإيرادات:</b> إصدار سندات التحصيل لإيرادات المؤسسة (حقوق التسجيل، النظام نصف الداخلي، إعانات الدولة).
              </li>
              <li>
                <b>الالتزام بالنفقات (Engagement):</b> إبرام سندات الطلب والصفقات في حدود الاعتمادات المالية المفتوحة في كل باب.
              </li>
              <li>
                <b>التصفية (Liquidation):</b> التحقق من وجود الدين وضبط مبلغه بدقة بعد الإشهاد الكتابي بـ «الخدمة المنجزة» (Service Fait).
              </li>
              <li>
                <b>الأمر بالصرف (Ordonnancement / Mandatement):</b> تحرير وتوقيع حوالات الدفع الموجهة للمحاسب العمومي (المقتصد) لتسديدها.
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-[#d91424] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d91424]" />
              <span>2. مبدأ الفصل بين الآمر بالصرف والمحاسب العمومي والرقابة الدورية</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200">
              تتنافى وظيفة الآمر بالصرف (المدير) مع وظيفة المحاسب العمومي (المقتصد / المسير المالي)، فلا يجوز للمدير قبض الأموال نقداً أو مسك الصندوق مباشرة، كما لا يجوز للمقتصد الالتزام بنفقة دون أمر وتوقيع المدير.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-semibold">
              <li>
                <b>اعتماد التوقيع:</b> يودع المدير لدى خزينة الولاية ولدى المقتصد بطاقة نموذج التوقيع الرسمي مرفقة بمقرر التعيين ومحضر التنصيب.
              </li>
              <li>
                <b>مراقبة الصندوق:</b> يقوم المدير دورياً وفجائياً بتوقيف حسابات الصندوق ومطابقة الرصيد الدفتري مع السيولة النقدية وحساب الخزينة.
              </li>
              <li>
                <b>عرض الميزانية والحساب المالي:</b> يعرض المدير مشروع الميزانية والحساب المالي السنوي على {councilName} للمداولة قبل إرساله للوصاية.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Official Printable A4 Landscape Sheet */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>المؤسسة : {institution.school} ({stageTitle})</div>
              <div>الرقم الجبائي (NIF) : {taxNifNumber}</div>
              <div>حساب الخزينة : {treasuryAccountNumber}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية — مصلحة التسيير المالي والمادي</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    {selectedPrintDoc === 'budget_summary_sheet' &&
                      'كشف وضعية تنفيذ أبواب وفصول الميزانية (الآمر بالصرف الرئيسي)'}
                    {selectedPrintDoc === 'signature_specimen' &&
                      'بطاقة إيداع واعتماد نموذج توقيع الآمر بالصرف الرئيسي لدى الخزينة العمومية'}
                    {selectedPrintDoc === 'bon_commande_doc' &&
                      `سند طلب رسمي للتوريد أو الأشغال (${selectedOrder?.refNumber || ''})`}
                    {selectedPrintDoc === 'mandat_paiement_doc' &&
                      `حوالة دفع وأمر بالصرف وشهادة الخدمة المنجزة (${selectedOrder?.refNumber || ''})`}
                    {selectedPrintDoc === 'caisse_audit_pv' &&
                      'محضر مراقبة وتوقيف الصندوق والمحاسبة المالية للمؤسسة'}
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة المالية : 2026 ({institution.year})</div>
              <div>الآمر بالصرف : {institution.directorName}</div>
              <div>المحاسب العمومي : {bursarName}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          {selectedPrintDoc === 'budget_summary_sheet' && (
            <table className="timetable-grid mt-2">
              <thead>
                <tr className="hours-header">
                  <th>الباب والمادة</th>
                  <th>عنوان الفصل والنفقة</th>
                  <th>الاعتماد المفتوح (دج)</th>
                  <th>الملتزم به (دج)</th>
                  <th>المأمور بصرفه (دج)</th>
                  <th>الرصيد المتبقي (دج)</th>
                  <th>الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((ch) => (
                  <tr key={ch.id}>
                    <td className="font-black text-[#d91424] py-2">{ch.chapterCode}</td>
                    <td className="font-bold text-right px-2">{ch.chapterTitle} — {ch.articleTitle}</td>
                    <td className="font-bold tabular-nums">{ch.allocatedAmountDzd.toLocaleString('ar-DZ')}</td>
                    <td className="font-bold tabular-nums">{ch.committedAmountDzd.toLocaleString('ar-DZ')}</td>
                    <td className="font-bold text-[#117a37] tabular-nums">{ch.mandatedAmountDzd.toLocaleString('ar-DZ')}</td>
                    <td className="font-black tabular-nums">
                      {Math.max(0, ch.allocatedAmountDzd - ch.committedAmountDzd).toLocaleString('ar-DZ')}
                    </td>
                    <td className="text-right px-2 text-[11px]">{ch.notes}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black">
                  <td colSpan={2} className="py-2">المجموع العام لميزانية التسيير</td>
                  <td className="tabular-nums">{totalAllocated.toLocaleString('ar-DZ')} دج</td>
                  <td className="tabular-nums">{totalCommitted.toLocaleString('ar-DZ')} دج</td>
                  <td className="text-[#117a37] tabular-nums">{totalMandated.toLocaleString('ar-DZ')} دج</td>
                  <td className="text-[#d91424] tabular-nums">{totalRemaining.toLocaleString('ar-DZ')} دج</td>
                  <td>نسبة التنفيذ: {executionRate}%</td>
                </tr>
              </tbody>
            </table>
          )}

          {selectedPrintDoc === 'signature_specimen' && (
            <div className="border-2 border-black p-5 mt-3 space-y-4 text-xs bg-white">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-black font-bold">
                <div>اسم ولقب الآمر بالصرف الرئيسي: {institution.directorName}</div>
                <div>الصفة القانونية: مدير {institution.school} ({stageTitle})</div>
                <div>مرجع التعيين والاعتماد: {accreditationRef}</div>
                <div>رقم الحساب الجاري بالخزينة: {treasuryAccountNumber}</div>
              </div>
              <p className="leading-relaxed font-semibold">
                عملاً بأحكام القانون 23-07 المتعلق بقواعد المحاسبة العمومية والتسيير المالي، يودع السيد(ة) مدير(ة) المؤسسة بصفته(ها) الآمر بالصرف الرئيسي نموذج توقيعه(ها) وختمه(ها) الرسمي المعتمد لإمضاء حوالات الدفع، سندات الطلب، وكشوف الالتزام المالي.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="border-2 border-dashed border-black p-6 text-center min-h-[120px]">
                  <div className="font-black text-[#094d22] mb-2">نموذج التوقيع الخطي للآمر بالصرف (المدير):</div>
                  <div className="text-slate-400 mt-6">............................................................</div>
                </div>
                <div className="border-2 border-dashed border-black p-6 text-center min-h-[120px]">
                  <div className="font-black text-[#d91424] mb-2">بصمة الختم الرسمي للمؤسسة والآمر بالصرف:</div>
                  <div className="text-slate-400 mt-6">............................................................</div>
                </div>
              </div>
            </div>
          )}

          {(selectedPrintDoc === 'bon_commande_doc' || selectedPrintDoc === 'mandat_paiement_doc') &&
            selectedOrder && (
              <div className="border-2 border-black p-5 mt-3 space-y-3 text-xs bg-white">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-black font-bold">
                  <div>نوع السند: {selectedOrder.docType}</div>
                  <div>رقم السند: {selectedOrder.refNumber}</div>
                  <div>تاريخ الإصدار: {selectedOrder.date}</div>
                  <div>الباب والمادة: {selectedOrder.chapterCode}</div>
                  <div>الممون / الدائن: {selectedOrder.supplierOrBeneficiary}</div>
                  <div className="text-[#d91424] font-black">
                    المبلغ الإجمالي: {selectedOrder.amountDzd.toLocaleString('ar-DZ')} دج
                  </div>
                </div>
                <div className="border border-black p-3">
                  <div className="font-black text-[#094d22] mb-1">بيان وموضوع النفقة / التوريد بالتفصيل:</div>
                  <p className="font-bold leading-relaxed">{selectedOrder.subject}</p>
                </div>
                <div className="border border-black p-3 bg-emerald-50/40 font-bold">
                  <b>إشهاد الآمر بالصرف بالخدمة المنجزة والأمر بالدفع: </b>
                  يشهد السيد(ة) مدير(ة) المؤسسة (الآمر بالصرف) أن التوريدات / الأشغال المذكورة أعلاه قد أُنجزت واستُلمت طبقاً للمواصفات، ويأمر السيد المحاسب العمومي (المقتصد) بدفع مبلغ ({selectedOrder.amountDzd.toLocaleString('ar-DZ')} دج) لفائدة المستفيد المذكور.
                </div>
              </div>
            )}

          {selectedPrintDoc === 'caisse_audit_pv' && (
            <div className="border-2 border-black p-5 mt-3 space-y-3 text-xs bg-white leading-relaxed">
              <p className="font-bold">
                في يومنا هذا، قام السيد(ة) <b>{institution.directorName}</b> بصفته(ها) الآمر بالصرف الرئيسي للمؤسسة، بمعية السيد(ة) <b>{bursarName}</b> (المحاسب العمومي / المقتصد)، بإجراء مراقبة وتوقيف لحسابات الصندوق والدفاتر المحاسبية:
              </p>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-black font-bold">
                <div>مجموع الإيرادات المقبوضة: {totalAllocated.toLocaleString('ar-DZ')} دج</div>
                <div>مجموع النفقات المسددة: {totalMandated.toLocaleString('ar-DZ')} دج</div>
                <div className="text-[#094d22]">الرصيد الدفتري المطابق للخزينة: {(totalAllocated - totalMandated).toLocaleString('ar-DZ')} دج</div>
              </div>
              <p className="font-semibold">
                بعد التدقيق في سجل الصندوق اليومي، دفتر الحساب الجاري بالخزينة، والحوالات المسددة، لوحظ تطابق تام بين الأرصدة المحاسبية والموجودات الفعلية دون تسجيل أي تحفظ.
              </p>
            </div>
          )}

          <div className="footer-signatures mt-6">
            <div>تأشيرة المحاسب العمومي (المقتصد)</div>
            <div>إمضاء وختم الآمر بالصرف الرئيسي (المدير)</div>
            <div>مصادقة مصالح الخزينة / الوصاية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
