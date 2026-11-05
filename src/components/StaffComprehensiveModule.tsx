import React, { useState } from 'react';
import {
  Users,
  Award,
  FileCheck,
  Scale,
  AlertCircle,
  ClipboardCheck,
  Printer,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Teacher,
  AssignedGroup,
  MODELS,
  rankDisplayTitle,
  specDisplayTitle,
  OFFICIAL_AUTHOR_SIGNATURE,
} from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface RendementScore {
  teacherId: string;
  assiduity: number; // /10 المواظبة والانضباط
  initiative: number; // /15 الفعالية والمبادرة البيداغوجية
  councils: number; // /10 المشاركة في الندوات والمجالس
  relations: number; // /5 العلاقة المهنية والتواصل
  unjustifiedAbsences: number; // أيام الغياب
}

export interface AnnualAdminEval {
  teacherId: string;
  ethics: number; // /4 أخلاقيات المهنة
  punctuality: number; // /4 المواظبة
  appearance: number; // /4 الهندام والسلوك
  instructions: number; // /4 تنفيذ التعليمات
  teamwork: number; // /4 روح التعاون
  paceProposal: 'الوتيرة الدنيا' | 'الوتيرة المتوسطة' | 'الوتيرة القصوى';
  directorOpinion: string;
}

export interface SurplusDiagnosticRow {
  teacherId: string;
  diplomaPoints: number; // الشهادة
  echelon: number; // الدرجة
  generalSeniorityYears: number; // الأقدمية العامة
  schoolSeniorityYears: number; // الأقدمية في المدرسة
  inspectorScore: number; // نقطة التفتيش /20
  familyPoints: number; // الحالة العائلية
}

export interface AbsenceInquiryRecord {
  id: string;
  teacherId: string;
  date: string;
  period: string;
  type: 'غياب يوم كامل بدون إشعار مسبق' | 'غياب عن الفترة المسائية' | 'تأخر صباحي متكرر' | 'عدم حضور ندوة تربوية';
  employeeReply: string;
  directorDecision: 'تبرير مقبول (ظرف قاهر)' | 'إنذار شفوي مع التذكير بالواجب' | 'خصم من الراتب والمنحة (خدمة غير منجزة)';
}

export interface ClassVisitRecord {
  id: string;
  teacherId: string;
  date: string;
  timeSlot: string;
  subject: string;
  lessonTitle: string;
  docsStatus: string;
  pedagogicalFlow: string;
  studentInteraction: string;
  directorGuidance: string;
  overallRating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول يحتاج مرافقة';
}

export type StaffSubTab =
  | 'registry'
  | 'rendement'
  | 'annual_eval'
  | 'surplus_scale'
  | 'absence_inquiry'
  | 'class_visit';

interface StaffComprehensiveModuleProps {
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  groups: AssignedGroup[];
  logoUrl: string;
  onGoToTimetable: () => void;
  rendementScores: Record<string, RendementScore>;
  setRendementScores: React.Dispatch<React.SetStateAction<Record<string, RendementScore>>>;
  annualEvals: Record<string, AnnualAdminEval>;
  setAnnualEvals: React.Dispatch<React.SetStateAction<Record<string, AnnualAdminEval>>>;
  surplusData: Record<string, SurplusDiagnosticRow>;
  setSurplusData: React.Dispatch<React.SetStateAction<Record<string, SurplusDiagnosticRow>>>;
  inquiries: AbsenceInquiryRecord[];
  setInquiries: React.Dispatch<React.SetStateAction<AbsenceInquiryRecord[]>>;
  classVisits: ClassVisitRecord[];
  setClassVisits: React.Dispatch<React.SetStateAction<ClassVisitRecord[]>>;
}

export default function StaffComprehensiveModule({
  institution,
  teachers,
  setTeachers,
  groups,
  logoUrl,
  onGoToTimetable,
  rendementScores,
  setRendementScores,
  annualEvals,
  setAnnualEvals,
  surplusData,
  setSurplusData,
  inquiries,
  setInquiries,
  classVisits,
  setClassVisits,
}: StaffComprehensiveModuleProps) {
  const [subTab, setSubTab] = useState<StaffSubTab>('rendement');
  const [selectedTrimester, setSelectedTrimester] = useState<'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث'>('الثلاثي الأول');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || 't1');
  const [surplusFilterSpec, setSurplusFilterSpec] = useState<string>('arabic');

  // Absence Inquiry form state
  const [inqTeacherId, setInqTeacherId] = useState<string>(teachers[0]?.id || 't1');
  const [inqDate, setInqDate] = useState<string>('2026-11-04');
  const [inqPeriod, setInqPeriod] = useState<string>('08:00 إلى 15:00');
  const [inqType, setInqType] = useState<AbsenceInquiryRecord['type']>('غياب يوم كامل بدون إشعار مسبق');
  const [inqReply, setInqReply] = useState<string>('ظرف صحي طارئ مرفق بشهادة طبية.');
  const [inqDecision, setInqDecision] = useState<AbsenceInquiryRecord['directorDecision']>('تبرير مقبول (ظرف قاهر)');
  const [activeInquiryId, setActiveInquiryId] = useState<string>(inquiries[0]?.id || '');

  // Class Visit form state
  const [visitTeacherId, setVisitTeacherId] = useState<string>(teachers[0]?.id || 't1');
  const [visitDate, setVisitDate] = useState<string>('2026-11-04');
  const [visitTime, setVisitTime] = useState<string>('08:30 - 09:30');
  const [visitSubject, setVisitSubject] = useState<string>('اللغة العربية — قراءة وفهم المنطوق');
  const [visitLesson, setVisitLesson] = useState<string>('القيم الإنسانية والوطنية في النص المنطوق');
  const [visitDocs, setVisitDocs] = useState<string>('الكراس اليومي محين، المذكرات منظمة ومطابقة للتدرج السنوي، دفتر المناداة مضبوط.');
  const [visitFlow, setVisitFlow] = useState<string>('انطلاق محفز، تدرج منهجي سليم في بناء التعلمات، واستعمال هادف للسبورة والوسائل.');
  const [visitInteraction, setVisitInteraction] = useState<string>('مشاركة فعالة للتلاميذ مع تشجيع الفئات المتعثرة ومراقبة الألواح.');
  const [visitGuidance, setVisitGuidance] = useState<string>('تثمين الجهود المبذولة مع الحرص على تنويع وضعيات التقويم المرحلي في نهاية الحصة.');
  const [visitRating, setVisitRating] = useState<ClassVisitRecord['overallRating']>('ممتاز');
  const [activeVisitId, setActiveVisitId] = useState<string>(classVisits[0]?.id || '');

  // Helpers for default values
  const getRendement = (tId: string): RendementScore => {
    if (rendementScores[tId]) return rendementScores[tId];
    return {
      teacherId: tId,
      assiduity: 10,
      initiative: 14.5,
      councils: 10,
      relations: 5,
      unjustifiedAbsences: 0,
    };
  };

  const updateRendement = (tId: string, field: keyof RendementScore, val: number) => {
    const curr = getRendement(tId);
    setRendementScores((prev) => ({
      ...prev,
      [tId]: { ...curr, [field]: val },
    }));
  };

  const calcTotalRendement = (r: RendementScore) => {
    const raw = Number(r.assiduity) + Number(r.initiative) + Number(r.councils) + Number(r.relations);
    const penalty = Number(r.unjustifiedAbsences) * 4;
    return Math.max(0, Math.min(40, Number((raw - penalty).toFixed(1))));
  };

  const getAnnualEval = (tId: string): AnnualAdminEval => {
    if (annualEvals[tId]) return annualEvals[tId];
    return {
      teacherId: tId,
      ethics: 4,
      punctuality: 4,
      appearance: 4,
      instructions: 3.75,
      teamwork: 3.75,
      paceProposal: 'الوتيرة الدنيا',
      directorOpinion: 'أستاذ(ة) كفء، منضبط ومواظب، يتحلى بروح المسؤولية والتعاون التربوي.',
    };
  };

  const updateAnnualEval = (tId: string, field: keyof AnnualAdminEval, val: string | number) => {
    const curr = getAnnualEval(tId);
    setAnnualEvals((prev) => ({
      ...prev,
      [tId]: { ...curr, [field]: val },
    }));
  };

  const calcTotalAnnual = (a: AnnualAdminEval) => {
    const sum =
      Number(a.ethics) +
      Number(a.punctuality) +
      Number(a.appearance) +
      Number(a.instructions) +
      Number(a.teamwork);
    return Math.max(0, Math.min(20, Number(sum.toFixed(2))));
  };

  const getRankPoints = (rank: Teacher['rank']) => {
    if (rank === 'مميز') return 8;
    if (rank === 'قسم ثان') return 6;
    if (rank === 'قسم أول') return 4;
    return 2;
  };

  const getSurplusRow = (t: Teacher): SurplusDiagnosticRow => {
    if (surplusData[t.id]) return surplusData[t.id];
    const installYear = Number((t.installDate || '2016-09-01').slice(0, 4)) || 2016;
    const genYears = Math.max(1, 2026 - installYear);
    return {
      teacherId: t.id,
      diplomaPoints: t.rank === 'مميز' || t.rank === 'قسم ثان' ? 5 : 4,
      echelon: Math.min(12, Math.floor(genYears / 2.5)),
      generalSeniorityYears: genYears,
      schoolSeniorityYears: Math.max(1, genYears - 2),
      inspectorScore: t.rank === 'مميز' ? 18.5 : t.rank === 'قسم ثان' ? 17.5 : 16.5,
      familyPoints: 3,
    };
  };

  const updateSurplusField = (t: Teacher, field: keyof SurplusDiagnosticRow, val: number) => {
    const curr = getSurplusRow(t);
    setSurplusData((prev) => ({
      ...prev,
      [t.id]: { ...curr, [field]: val },
    }));
  };

  const calcSurplusTotal = (t: Teacher, s: SurplusDiagnosticRow) => {
    const rankPts = getRankPoints(t.rank);
    const adminScore = calcTotalAnnual(getAnnualEval(t.id));
    const total =
      Number(s.diplomaPoints) +
      rankPts +
      Number(s.echelon) +
      Number(s.generalSeniorityYears) +
      Number(s.schoolSeniorityYears) +
      Number(s.inspectorScore) +
      adminScore +
      Number(s.familyPoints);
    return Number(total.toFixed(2));
  };

  // Filtered & sorted teachers for surplus scale
  const surplusCandidates = teachers
    .filter((t) => surplusFilterSpec === 'all' || t.spec === surplusFilterSpec)
    .map((t) => {
      const row = getSurplusRow(t);
      const total = calcSurplusTotal(t, row);
      return { teacher: t, row, total };
    })
    .sort((a, b) => b.total - a.total);

  const lowestPointTeacherId =
    surplusCandidates.length > 0 ? surplusCandidates[surplusCandidates.length - 1].teacher.id : '';

  const handleAddInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AbsenceInquiryRecord = {
      id: 'inq_' + Date.now(),
      teacherId: inqTeacherId,
      date: inqDate,
      period: inqPeriod,
      type: inqType,
      employeeReply: inqReply,
      directorDecision: inqDecision,
    };
    setInquiries((prev) => [created, ...prev]);
    setActiveInquiryId(created.id);
  };

  const handleAddClassVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ClassVisitRecord = {
      id: 'cv_' + Date.now(),
      teacherId: visitTeacherId,
      date: visitDate,
      timeSlot: visitTime,
      subject: visitSubject,
      lessonTitle: visitLesson,
      docsStatus: visitDocs,
      pedagogicalFlow: visitFlow,
      studentInteraction: visitInteraction,
      directorGuidance: visitGuidance,
      overallRating: visitRating,
    };
    setClassVisits((prev) => [created, ...prev]);
    setActiveVisitId(created.id);
  };

  const activeInquiry = inquiries.find((i) => i.id === activeInquiryId) || inquiries[0];
  const activeVisit = classVisits.find((v) => v.id === activeVisitId) || classVisits[0];
  const selectedTeacherObj = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar for Staff Department */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('rendement')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'rendement'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>1. منحة الأداء (المردودية /40)</span>
          </button>

          <button
            onClick={() => setSubTab('annual_eval')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'annual_eval'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>2. بطاقة التقييم السنوي (/20)</span>
          </button>

          <button
            onClick={() => setSubTab('surplus_scale')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'surplus_scale'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. مقياس تشخيص الفائض</span>
          </button>

          <button
            onClick={() => setSubTab('absence_inquiry')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'absence_inquiry'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>4. بطاقة الاستفسار عن الغياب</span>
          </button>

          <button
            onClick={() => setSubTab('class_visit')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'class_visit'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>5. بطاقة زيارة للقسم</span>
          </button>

          <button
            onClick={() => setSubTab('registry')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === 'registry'
                ? 'bg-[#117a37] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>6. البطاقية العامة (25-54)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              exportElementToPDF(null, `قسم_الموظفين_${subTab}_${institution.school}`, 'landscape')
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تحميل PDF</span>
          </button>
          <button
            onClick={() => triggerPrintOrPdf(`قسم_الموظفين_${subTab}_${institution.school}`)}
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوثيقة الرسمية (A4)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: قسم منحة الأداء التربوي والإداري (المردودية /40) */}
      {subTab === 'rendement' && (
        <div className="space-y-5">
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#094d22]">
                  جدول تنقيط منحة تحسن الأداء التربوي والإداري (المردودية — {selectedTrimester})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  سلم التنقيط الرسمي من 40 نقطة: المواظبة (/10) · المبادرة والفعالية (/15) · الندوات والمجالس (/10) · العلاقات المهنية (/5)
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['الثلاثي الأول', 'الثلاثي الثاني', 'الثلاثي الثالث'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTrimester(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-extrabold cursor-pointer transition ${
                      selectedTrimester === t ? 'bg-[#117a37] text-white' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                    <th className="py-2.5 px-2.5">الرقم</th>
                    <th className="py-2.5 px-2.5">اسم ولقب الأستاذ(ة)</th>
                    <th className="py-2.5 px-2.5">الرتبة (25-54)</th>
                    <th className="py-2.5 px-2.5">المواظبة (/10)</th>
                    <th className="py-2.5 px-2.5">الفعالية (/15)</th>
                    <th className="py-2.5 px-2.5">الندوات (/10)</th>
                    <th className="py-2.5 px-2.5">العلاقات (/5)</th>
                    <th className="py-2.5 px-2.5">غياب غير مبرر</th>
                    <th className="py-2.5 px-2.5">المجموع (/40)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map((t, idx) => {
                    const r = getRendement(t.id);
                    const total = calcTotalRendement(r);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-bold tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-extrabold text-slate-900">{t.name}</td>
                        <td className="py-2 px-2.5 font-bold text-slate-700">{rankDisplayTitle(t.rank)}</td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={0.5}
                            value={r.assiduity}
                            onChange={(e) => updateRendement(t.id, 'assiduity', Number(e.target.value))}
                            className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min={0}
                            max={15}
                            step={0.5}
                            value={r.initiative}
                            onChange={(e) => updateRendement(t.id, 'initiative', Number(e.target.value))}
                            className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={0.5}
                            value={r.councils}
                            onChange={(e) => updateRendement(t.id, 'councils', Number(e.target.value))}
                            className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            step={0.5}
                            value={r.relations}
                            onChange={(e) => updateRendement(t.id, 'relations', Number(e.target.value))}
                            className="w-14 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min={0}
                            max={15}
                            value={r.unjustifiedAbsences}
                            onChange={(e) => updateRendement(t.id, 'unjustifiedAbsences', Number(e.target.value))}
                            className="w-14 px-1.5 py-1 border border-slate-300 rounded text-center font-bold text-[#d91424] tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2.5 font-black text-[#117a37] text-sm tabular-nums">{total} / 40</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Official Sheet for Rendement */}
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
                        الجدول الجماعي لتنقيط منحة تحسن الأداء التربوي (المردودية) — {selectedTrimester}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sheet-left-col">
                  <div>السنة الدراسية : {institution.year}</div>
                  <div>السيد(ة) المدير(ة) : {institution.directorName}</div>
                  <div>السلم المعتمد : من 0 إلى 40 نقطة</div>
                  <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                </div>
              </div>

              <table className="timetable-grid mt-2">
                <thead>
                  <tr className="hours-header">
                    <th style={{ width: '40px' }}>الرقم</th>
                    <th>الاسم واللقب</th>
                    <th>الرتبة (المرسوم 25-54)</th>
                    <th>المواظبة والانضباط (/10)</th>
                    <th>الفعالية والمبادرة (/15)</th>
                    <th>الندوات والتنسيق (/10)</th>
                    <th>العلاقات المهنية (/5)</th>
                    <th>الغيابات</th>
                    <th>النقطة النهائية (/40)</th>
                    <th style={{ width: '130px' }}>إمضاء الموظف(ة)</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, idx) => {
                    const r = getRendement(t.id);
                    const total = calcTotalRendement(r);
                    return (
                      <tr key={t.id}>
                        <td className="font-bold tabular-nums py-1.5">{idx + 1}</td>
                        <td className="font-extrabold text-right px-2">{t.name}</td>
                        <td className="font-bold">{rankDisplayTitle(t.rank)}</td>
                        <td className="font-bold tabular-nums">{r.assiduity}</td>
                        <td className="font-bold tabular-nums">{r.initiative}</td>
                        <td className="font-bold tabular-nums">{r.councils}</td>
                        <td className="font-bold tabular-nums">{r.relations}</td>
                        <td className="font-bold text-[#d91424] tabular-nums">{r.unjustifiedAbsences}</td>
                        <td className="font-black text-[#117a37] tabular-nums">{total} / 40</td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="footer-signatures mt-5">
                <div>مصلحة تسيير نفقات المستخدمين</div>
                <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                <div>مصادقة مفتشية التعليم الابتدائي</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: بطاقة التقييم السنوي للموظف (/20) */}
      {subTab === 'annual_eval' && (
        <div className="space-y-5">
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#094d22]">
                  بطاقة التقييم والتنقيط الإداري السنوي للموظفين (النقطة الإدارية /20)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  تعتمد النقطة الإدارية السنوية في ملف الترقية في الدرجة والرتبة وفي مقياس تشخيص الفائض
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-[#094d22]">معاينة البطاقة الفردية لـ:</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({rankDisplayTitle(t.rank)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                    <th className="py-2.5 px-2">الأستاذ(ة)</th>
                    <th className="py-2.5 px-2">أخلاقيات المهنة (/4)</th>
                    <th className="py-2.5 px-2">المواظبة (/4)</th>
                    <th className="py-2.5 px-2">الهندام والسلوك (/4)</th>
                    <th className="py-2.5 px-2">تنفيذ التعليمات (/4)</th>
                    <th className="py-2.5 px-2">روح التعاون (/4)</th>
                    <th className="py-2.5 px-2">المجموع (/20)</th>
                    <th className="py-2.5 px-2">وتيرة الترقية المقترحة</th>
                    <th className="py-2.5 px-2">معاينة البطاقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map((t) => {
                    const ev = getAnnualEval(t.id);
                    const total = calcTotalAnnual(ev);
                    const isSelected = t.id === selectedTeacherId;
                    return (
                      <tr key={t.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/70' : ''}`}>
                        <td className="py-2 px-2 font-extrabold text-slate-900">{t.name}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.25}
                            value={ev.ethics}
                            onChange={(e) => updateAnnualEval(t.id, 'ethics', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.25}
                            value={ev.punctuality}
                            onChange={(e) => updateAnnualEval(t.id, 'punctuality', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.25}
                            value={ev.appearance}
                            onChange={(e) => updateAnnualEval(t.id, 'appearance', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.25}
                            value={ev.instructions}
                            onChange={(e) => updateAnnualEval(t.id, 'instructions', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.25}
                            value={ev.teamwork}
                            onChange={(e) => updateAnnualEval(t.id, 'teamwork', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 font-black text-[#117a37] tabular-nums">{total} / 20</td>
                        <td className="py-2 px-2">
                          <select
                            value={ev.paceProposal}
                            onChange={(e) =>
                              updateAnnualEval(t.id, 'paceProposal', e.target.value as AnnualAdminEval['paceProposal'])
                            }
                            className="px-2 py-1 border border-slate-300 rounded text-xs font-bold bg-white"
                          >
                            <option value="الوتيرة الدنيا">الوتيرة الدنيا</option>
                            <option value="الوتيرة المتوسطة">الوتيرة المتوسطة</option>
                            <option value="الوتيرة القصوى">الوتيرة القصوى</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => setSelectedTeacherId(t.id)}
                            className={`px-2.5 py-1 rounded text-xs font-extrabold cursor-pointer ${
                              isSelected ? 'bg-[#d91424] text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            عرض البطاقة
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Individual Annual Evaluation Card */}
          {selectedTeacherObj && (
            <div className="sheet-scroll-container">
              <div className="a4-landscape-page" dir="rtl">
                {(() => {
                  const ev = getAnnualEval(selectedTeacherObj.id);
                  const total = calcTotalAnnual(ev);
                  const grp = groups.find((g) => g.teacherId === selectedTeacherObj.id);
                  const m = grp ? MODELS[grp.level] : null;
                  return (
                    <>
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
                                بطاقة التقييم والتنقيط الإداري السنوي للموظف ({institution.year})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sheet-left-col">
                          <div>الاسم واللقب : {selectedTeacherObj.name}</div>
                          <div>الرتبة (25-54) : {rankDisplayTitle(selectedTeacherObj.rank)}</div>
                          <div>القسم المسند : {m ? m.levelTitle : 'متخصص'}</div>
                          <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                        </div>
                      </div>

                      <table className="timetable-grid mt-3">
                        <thead>
                          <tr className="hours-header">
                            <th>معايير التنقيط الإداري السنوي</th>
                            <th style={{ width: '120px' }}>السلم الأقصى</th>
                            <th style={{ width: '140px' }}>النقطة الممنوحة</th>
                            <th>ملاحظات وتقديرات الإدارة</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-extrabold text-right px-3 py-2">
                              1. الالتزام بأخلاقيات المهنة والنظام الداخلي للمؤسسة
                            </td>
                            <td className="font-bold tabular-nums">04 نقاط</td>
                            <td className="font-black text-[#117a37] tabular-nums">{ev.ethics} / 04</td>
                            <td contentEditable suppressContentEditableWarning>احترام تام لضوابط الوظيفة التربوية</td>
                          </tr>
                          <tr>
                            <td className="font-extrabold text-right px-3 py-2">
                              2. المواظبة والانضباط واحترام المواعيد الرسمية
                            </td>
                            <td className="font-bold tabular-nums">04 نقاط</td>
                            <td className="font-black text-[#117a37] tabular-nums">{ev.punctuality} / 04</td>
                            <td contentEditable suppressContentEditableWarning>حضور منتظم ودائم</td>
                          </tr>
                          <tr>
                            <td className="font-extrabold text-right px-3 py-2">
                              3. الهندام والسلوك العام داخل الجماعة التربوية
                            </td>
                            <td className="font-bold tabular-nums">04 نقاط</td>
                            <td className="font-black text-[#117a37] tabular-nums">{ev.appearance} / 04</td>
                            <td contentEditable suppressContentEditableWarning>سلوك قدوة ومظهر لائق</td>
                          </tr>
                          <tr>
                            <td className="font-extrabold text-right px-3 py-2">
                              4. تنفيذ التعليمات الإدارية والبيداغوجية ومسك الوثائق
                            </td>
                            <td className="font-bold tabular-nums">04 نقاط</td>
                            <td className="font-black text-[#117a37] tabular-nums">{ev.instructions} / 04</td>
                            <td contentEditable suppressContentEditableWarning>عناية فائقة بالوثائق الرسمية</td>
                          </tr>
                          <tr>
                            <td className="font-extrabold text-right px-3 py-2">
                              5. روح المبادرة والعمل الجماعي والمشاركة في النشاطات
                            </td>
                            <td className="font-bold tabular-nums">04 نقاط</td>
                            <td className="font-black text-[#117a37] tabular-nums">{ev.teamwork} / 04</td>
                            <td contentEditable suppressContentEditableWarning>مساهمة إيجابية في المجالس والندوات</td>
                          </tr>
                          <tr className="bg-[#e8f5e9] font-black">
                            <td className="py-2.5 text-right px-3 text-[#094d22]">
                              المجموع العام للنقطة الإدارية السنوية
                            </td>
                            <td className="tabular-nums">20 نقطة</td>
                            <td className="text-[#d91424] text-base tabular-nums">{total} / 20</td>
                            <td className="text-[#094d22]">الاقتراح للترقية: {ev.paceProposal}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="border-2 border-black p-3 mt-3 bg-slate-50 text-xs font-bold">
                        <span className="text-[#094d22] font-black">التقدير العام للسيد(ة) المدير(ة): </span>
                        <span contentEditable suppressContentEditableWarning>{ev.directorOpinion}</span>
                      </div>

                      <div className="footer-signatures mt-5">
                        <div>اطلع عليه المعني(ة) بالأمر (الإمضاء)</div>
                        <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                        <div>مصادقة السيد(ة) مفتش(ة) المقاطعة</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: مقياس تشخيص الفائض والعجز */}
      {subTab === 'surplus_scale' && (
        <div className="space-y-5">
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#094d22]">
                  مقياس تشخيص الفائض والترتيب الاستحقاقي للأساتذة (وفق المرسوم التنفيذي 25-54)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  حساب آلي لمجموع النقاط (الشهادة + الرتبة + الدرجة + الأقدمية العامة + أقدمية المؤسسة + نقطة التفتيش + النقطة الإدارية + الحالة العائلية) لتحديد الأستاذ(ة) المعني بالفائض
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-[#094d22]">تصفية حسب مادة التخصص:</label>
                <select
                  value={surplusFilterSpec}
                  onChange={(e) => setSurplusFilterSpec(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                >
                  <option value="arabic">اللغة العربية</option>
                  <option value="french">اللغة الفرنسية</option>
                  <option value="english">اللغة الإنجليزية</option>
                  <option value="amazigh">اللغة الأمازيغية</option>
                  <option value="pe">التربية البدنية</option>
                  <option value="all">جميع التخصصات</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                    <th className="py-2.5 px-2">الترتيب</th>
                    <th className="py-2.5 px-2">الأستاذ(ة)</th>
                    <th className="py-2.5 px-2">الرتبة (نقاطها)</th>
                    <th className="py-2.5 px-2">الشهادة</th>
                    <th className="py-2.5 px-2">الدرجة</th>
                    <th className="py-2.5 px-2">أقدمية عامة</th>
                    <th className="py-2.5 px-2">أقدمية بالمدرسة</th>
                    <th className="py-2.5 px-2">نقطة التفتيش</th>
                    <th className="py-2.5 px-2">نقطة إدارية</th>
                    <th className="py-2.5 px-2">عائلية</th>
                    <th className="py-2.5 px-2">المجموع العام</th>
                    <th className="py-2.5 px-2">الوضعية التشخيصية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {surplusCandidates.map(({ teacher: t, row, total }, idx) => {
                    const isSurplusCandidate =
                      surplusCandidates.length > 1 && t.id === lowestPointTeacherId;
                    const rankPts = getRankPoints(t.rank);
                    const adminScore = calcTotalAnnual(getAnnualEval(t.id));
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50 ${isSurplusCandidate ? 'bg-red-50/70' : ''}`}
                      >
                        <td className="py-2 px-2 font-black tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-2 font-extrabold text-slate-900">{t.name}</td>
                        <td className="py-2 px-2 font-bold text-[#094d22]">
                          {rankDisplayTitle(t.rank)} ({rankPts}ن)
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={row.diplomaPoints}
                            onChange={(e) => updateSurplusField(t, 'diplomaPoints', Number(e.target.value))}
                            className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={12}
                            value={row.echelon}
                            onChange={(e) => updateSurplusField(t, 'echelon', Number(e.target.value))}
                            className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={row.generalSeniorityYears}
                            onChange={(e) => updateSurplusField(t, 'generalSeniorityYears', Number(e.target.value))}
                            className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={row.schoolSeniorityYears}
                            onChange={(e) => updateSurplusField(t, 'schoolSeniorityYears', Number(e.target.value))}
                            className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.25}
                            value={row.inspectorScore}
                            onChange={(e) => updateSurplusField(t, 'inspectorScore', Number(e.target.value))}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 font-bold tabular-nums">{adminScore}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            max={5}
                            value={row.familyPoints}
                            onChange={(e) => updateSurplusField(t, 'familyPoints', Number(e.target.value))}
                            className="w-12 px-1 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 font-black text-sm text-[#117a37] tabular-nums">{total} ن</td>
                        <td className="py-2 px-2 font-extrabold">
                          {isSurplusCandidate ? (
                            <span className="text-[#d91424]">معني بالفائض (الأقل نقاطاً)</span>
                          ) : (
                            <span className="text-[#117a37]">محتفظ به في المنصب</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Official Surplus Diagnostic Sheet */}
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
                        محضر مقياس تشخيص الفائض والترتيب الاستحقاقي للأساتذة ({institution.year})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sheet-left-col">
                  <div>السنة الدراسية : {institution.year}</div>
                  <div>المدير(ة) : {institution.directorName}</div>
                  <div>المرجع : المرسوم التنفيذي 25-54</div>
                  <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                </div>
              </div>

              <table className="timetable-grid mt-2">
                <thead>
                  <tr className="hours-header">
                    <th style={{ width: '45px' }}>الترتيب</th>
                    <th>الاسم واللقب</th>
                    <th>الرتبة (25-54)</th>
                    <th>الشهادة</th>
                    <th>الدرجة</th>
                    <th>أقدمية عامة</th>
                    <th>أقدمية بالمؤسسة</th>
                    <th>نقطة التفتيش</th>
                    <th>النقطة الإدارية</th>
                    <th>عائلية</th>
                    <th>المجموع الكلي</th>
                    <th>النتيجة / التوقيع</th>
                  </tr>
                </thead>
                <tbody>
                  {surplusCandidates.map(({ teacher: t, row, total }, idx) => {
                    const isSurplusCandidate =
                      surplusCandidates.length > 1 && t.id === lowestPointTeacherId;
                    const rankPts = getRankPoints(t.rank);
                    const adminScore = calcTotalAnnual(getAnnualEval(t.id));
                    return (
                      <tr key={t.id} className={isSurplusCandidate ? 'highlight-col' : ''}>
                        <td className="font-bold tabular-nums py-1.5">{idx + 1}</td>
                        <td className="font-extrabold text-right px-2">{t.name}</td>
                        <td className="font-bold">
                          {rankDisplayTitle(t.rank)} ({rankPts}ن)
                        </td>
                        <td className="tabular-nums">{row.diplomaPoints}</td>
                        <td className="tabular-nums">{row.echelon}</td>
                        <td className="tabular-nums">{row.generalSeniorityYears}</td>
                        <td className="tabular-nums">{row.schoolSeniorityYears}</td>
                        <td className="tabular-nums">{row.inspectorScore}</td>
                        <td className="tabular-nums">{adminScore}</td>
                        <td className="tabular-nums">{row.familyPoints}</td>
                        <td className="font-black tabular-nums">{total} ن</td>
                        <td className="font-extrabold">
                          {isSurplusCandidate ? 'معني بالفائض' : 'محتفظ به'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="footer-signatures mt-5">
                <div>إمضاء الأساتذة المعنيين بالاطلاع</div>
                <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                <div>مصلحة الموظفين بمديرية التربية</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: بطاقة الاستفسار عن الغياب */}
      {subTab === 'absence_inquiry' && (
        <div className="space-y-5">
          <div className="no-print grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">
            <form
              onSubmit={handleAddInquiry}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
            >
              <h3 className="text-sm font-black text-[#d91424]">تحرير بطاقة استفسار عن غياب أو تأخر</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف / الأستاذ(ة):</label>
                <select
                  value={inqTeacherId}
                  onChange={(e) => setInqTeacherId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({rankDisplayTitle(t.rank)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الغياب / التأخر:</label>
                  <input
                    type="date"
                    value={inqDate}
                    onChange={(e) => setInqDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفترة الزمنية:</label>
                  <input
                    type="text"
                    value={inqPeriod}
                    onChange={(e) => setInqPeriod(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طبيعة الغياب / المخالفة:</label>
                <select
                  value={inqType}
                  onChange={(e) => setInqType(e.target.value as AbsenceInquiryRecord['type'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                >
                  <option value="غياب يوم كامل بدون إشعار مسبق">غياب يوم كامل بدون إشعار مسبق</option>
                  <option value="غياب عن الفترة المسائية">غياب عن الفترة المسائية</option>
                  <option value="تأخر صباحي متكرر">تأخر صباحي متكرر</option>
                  <option value="عدم حضور ندوة تربوية">عدم حضور ندوة تربوية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تبرير / رد الموظف(ة):</label>
                <input
                  type="text"
                  value={inqReply}
                  onChange={(e) => setInqReply(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">قرار السيد(ة) المدير(ة):</label>
                <select
                  value={inqDecision}
                  onChange={(e) => setInqDecision(e.target.value as AbsenceInquiryRecord['directorDecision'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                >
                  <option value="تبرير مقبول (ظرف قاهر)">تبرير مقبول (ظرف قاهر)</option>
                  <option value="إنذار شفوي مع التذكير بالواجب">إنذار شفوي مع التذكير بالواجب</option>
                  <option value="خصم من الراتب والمنحة (خدمة غير منجزة)">خصم من الراتب والمنحة (خدمة غير منجزة)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إصدار بطاقة الاستفسار وعرضها للطباعة</span>
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-[#094d22]">
                سجل بطاقات الاستفسار عن الغياب ({inquiries.length}) — انقر لعرض الوثيقة بالأسفل
              </h3>
              <div className="space-y-2">
                {inquiries.map((item) => {
                  const t = teachers.find((x) => x.id === item.teacherId);
                  const isSel = item.id === activeInquiry?.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveInquiryId(item.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-2 text-xs ${
                        isSel ? 'bg-red-50 border-[#d91424]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-black text-slate-900">
                          {t ? t.name : 'موظف'} — <span className="text-[#d91424]">{item.type}</span>
                        </div>
                        <div className="text-slate-600 mt-0.5 tabular-nums">
                          التاريخ: {item.date} ({item.period}) · القرار: {item.directorDecision}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inquiries.length > 1) {
                            setInquiries((prev) => prev.filter((x) => x.id !== item.id));
                          }
                        }}
                        className="text-slate-400 hover:text-[#d91424] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Printable Official Absence Inquiry Card */}
          {activeInquiry && (
            <div className="sheet-scroll-container">
              <div className="a4-landscape-page" dir="rtl">
                {(() => {
                  const t = teachers.find((x) => x.id === activeInquiry.teacherId) || teachers[0];
                  return (
                    <>
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
                              <span className="main-doc-title">بطاقة استفسار إداري عن غياب أو تأخر</span>
                            </div>
                          </div>
                        </div>

                        <div className="sheet-left-col">
                          <div>السنة الدراسية : {institution.year}</div>
                          <div>تاريخ التحرير : {activeInquiry.date}</div>
                          <div>المدير(ة) : {institution.directorName}</div>
                          <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                        </div>
                      </div>

                      <div className="border-2 border-black p-4 mt-3 space-y-3 text-xs leading-relaxed bg-white">
                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-black font-bold">
                          <div>الاسم واللقب: {t?.name}</div>
                          <div>الرتبة (المرسوم 25-54): {t ? rankDisplayTitle(t.rank) : ''}</div>
                          <div>التخصص: {t ? specDisplayTitle(t.spec) : ''}</div>
                        </div>

                        <div>
                          <strong className="text-[#d91424] block mb-1">1. موضوع الاستفسار الإداري:</strong>
                          <p contentEditable suppressContentEditableWarning className="font-bold">
                            لوحظ تغيبكم / تأخركم عن العمل بتاريخ: ({activeInquiry.date}) خلال الفترة ({activeInquiry.period})، بسبب: [{activeInquiry.type}]. وعليه يطلب منكم موافاتنا كتابياً بأسباب ومبررات هذا الغياب في أجل أقصاه 48 ساعة من تاريخ تبليغكم بهذا الاستفسار.
                          </p>
                        </div>

                        <div className="border border-black p-3 bg-slate-50">
                          <strong className="text-[#094d22] block mb-1">2. رد وتبرير الموظف(ة) المعني(ة):</strong>
                          <p contentEditable suppressContentEditableWarning className="font-bold min-h-[38px]">
                            {activeInquiry.employeeReply}
                          </p>
                          <div className="text-left font-bold mt-2">تاريخ وإمضاء الموظف(ة): ............................</div>
                        </div>

                        <div className="border border-black p-3 bg-[#e8f5e9]/40">
                          <strong className="text-[#094d22] block mb-1">3. قرار السيد(ة) مدير(ة) المؤسسة:</strong>
                          <p contentEditable suppressContentEditableWarning className="font-black text-[#d91424]">
                            {activeInquiry.directorDecision}
                          </p>
                        </div>
                      </div>

                      <div className="footer-signatures mt-4">
                        <div>إمضاء الموظف(ة) عند الاستلام</div>
                        <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                        <div>ملف الموظف / مصلحة المستخدمين</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: بطاقة زيارة للقسم */}
      {subTab === 'class_visit' && (
        <div className="space-y-5">
          <div className="no-print grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
            <form
              onSubmit={handleAddClassVisit}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
            >
              <h3 className="text-sm font-black text-[#094d22]">تحرير بطاقة زيارة توجيهية للقسم</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الأستاذ(ة) المزار(ة):</label>
                  <select
                    value={visitTeacherId}
                    onChange={(e) => setVisitTeacherId(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التقدير العام للزيارة:</label>
                  <select
                    value={visitRating}
                    onChange={(e) => setVisitRating(e.target.value as ClassVisitRecord['overallRating'])}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                  >
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد جداً">جيد جداً</option>
                    <option value="جيد">جيد</option>
                    <option value="مقبول يحتاج مرافقة">مقبول يحتاج مرافقة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الزيارة:</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التوقيت / الحصة:</label>
                  <input
                    type="text"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة والنشاط:</label>
                  <input
                    type="text"
                    value={visitSubject}
                    onChange={(e) => setVisitSubject(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الدرس:</label>
                  <input
                    type="text"
                    value={visitLesson}
                    onChange={(e) => setVisitLesson(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مراقبة الوثائق التربوية والتنظيم:</label>
                <input
                  type="text"
                  value={visitDocs}
                  onChange={(e) => setVisitDocs(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سير الحصة والطريقة البيداغوجية:</label>
                <input
                  type="text"
                  value={visitFlow}
                  onChange={(e) => setVisitFlow(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التوجيهات والنصائح البيداغوجية للمدير:</label>
                <input
                  type="text"
                  value={visitGuidance}
                  onChange={(e) => setVisitGuidance(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>حفظ بطاقة زيارة القسم وعرضها للطباعة</span>
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-[#094d22]">
                سجل بطاقات الزيارات الصفية المحررة ({classVisits.length}) — اختر بطاقة لمعاينتها وطباعتها
              </h3>
              <div className="space-y-2">
                {classVisits.map((cv) => {
                  const t = teachers.find((x) => x.id === cv.teacherId);
                  const isSel = cv.id === activeVisit?.id;
                  return (
                    <div
                      key={cv.id}
                      onClick={() => setActiveVisitId(cv.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-2 text-xs ${
                        isSel ? 'bg-[#e8f5e9] border-[#117a37]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-black text-slate-900">
                          {t ? t.name : 'أستاذ(ة)'} — <span className="text-[#117a37]">{cv.subject}</span> ({cv.lessonTitle})
                        </div>
                        <div className="text-slate-600 mt-0.5 tabular-nums">
                          التاريخ: {cv.date} ({cv.timeSlot}) · التقدير: <b className="text-[#d91424]">{cv.overallRating}</b>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (classVisits.length > 1) {
                            setClassVisits((prev) => prev.filter((x) => x.id !== cv.id));
                          }
                        }}
                        className="text-slate-400 hover:text-[#d91424] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Printable Class Visit Card */}
          {activeVisit && (
            <div className="sheet-scroll-container">
              <div className="a4-landscape-page" dir="rtl">
                {(() => {
                  const t = teachers.find((x) => x.id === activeVisit.teacherId) || teachers[0];
                  const grp = groups.find((g) => g.teacherId === t?.id);
                  const m = grp ? MODELS[grp.level] : null;
                  return (
                    <>
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
                              <span className="main-doc-title">بطاقة زيارة توجيهية للقسم (مرافقة بيداغوجية للمدير)</span>
                            </div>
                          </div>
                        </div>

                        <div className="sheet-left-col">
                          <div>السنة الدراسية : {institution.year}</div>
                          <div>التاريخ : {activeVisit.date} ({activeVisit.timeSlot})</div>
                          <div>الأستاذ(ة) : {t?.name} ({t ? rankDisplayTitle(t.rank) : ''})</div>
                          <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                        </div>
                      </div>

                      <table className="timetable-grid mt-2">
                        <thead>
                          <tr className="hours-header">
                            <th style={{ width: '180px' }}>محاور الملاحظة الصفية</th>
                            <th>المعاينة الميدانية والملاحظات المسجلة</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-black bg-slate-100 py-2">القسم والنشاط والموضوع</td>
                            <td className="font-extrabold text-right px-3" contentEditable suppressContentEditableWarning>
                              القسم: {m ? m.levelTitle : 'ابتدائي'} ({grp?.room || '01'}) — النشاط: {activeVisit.subject} — الموضوع: {activeVisit.lessonTitle}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-black bg-slate-100 py-2">1. الوثائق التربوية والتنظيم</td>
                            <td className="font-bold text-right px-3" contentEditable suppressContentEditableWarning>
                              {activeVisit.docsStatus}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-black bg-slate-100 py-2">2. سير الحصة والمنهجية</td>
                            <td className="font-bold text-right px-3" contentEditable suppressContentEditableWarning>
                              {activeVisit.pedagogicalFlow}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-black bg-slate-100 py-2">3. تفاعل التلاميذ والتقويم</td>
                            <td className="font-bold text-right px-3" contentEditable suppressContentEditableWarning>
                              {activeVisit.studentInteraction}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-black bg-[#e8f5e9] text-[#094d22] py-2">
                              4. التوجيهات البيداغوجية للمدير
                            </td>
                            <td
                              className="font-extrabold text-right px-3 text-[#094d22]"
                              contentEditable
                              suppressContentEditableWarning
                            >
                              {activeVisit.directorGuidance} (التقدير العام للزيارة: {activeVisit.overallRating})
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="footer-signatures mt-5">
                        <div>إمضاء الأستاذ(ة) بعد المناقشة البيداغوجية</div>
                        <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                        <div>تأشيرة السيد(ة) مفتش(ة) المقاطعة</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 6: البطاقية العامة للهيئة التربوية */}
      {subTab === 'registry' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-black text-[#094d22]">
                البطاقية الرقمية الشاملة للهيئة التربوية وفق المرسوم التنفيذي 25-54
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                ترتيب الأساتذة حسب الرتب الرسمية (أستاذ مميز، أستاذ قسم ثانٍ، أستاذ قسم أول، أستاذ تعليم ابتدائي) والوضعية الإدارية
              </p>
            </div>
            <button
              onClick={onGoToTimetable}
              className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer"
            >
              + إضافة أو تعديل إسناد الأساتذة
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">الرقم</th>
                  <th className="py-2.5 px-3">الاسم واللقب</th>
                  <th className="py-2.5 px-3">الرتبة (المرسوم 25-54)</th>
                  <th className="py-2.5 px-3">التخصص</th>
                  <th className="py-2.5 px-3">تاريخ التنصيب</th>
                  <th className="py-2.5 px-3">القسم / الأفواج المسندة</th>
                  <th className="py-2.5 px-3">الوضعية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachers.map((t, idx) => {
                  const assignedGrp = groups.find((g) => g.teacherId === t.id);
                  const model = assignedGrp ? MODELS[assignedGrp.level] : null;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold tabular-nums">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{t.name}</td>
                      <td className="py-2.5 px-3 font-bold text-[#d91424]">{rankDisplayTitle(t.rank)}</td>
                      <td className="py-2.5 px-3 text-slate-700">{specDisplayTitle(t.spec)}</td>
                      <td className="py-2.5 px-3 tabular-nums">
                        <input
                          type="date"
                          value={t.installDate || '2018-09-01'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeachers((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, installDate: val } : item))
                            );
                          }}
                          className="px-2 py-1 border border-slate-300 rounded text-xs tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#094d22]">
                        {model && assignedGrp ? `${model.levelTitle} (${assignedGrp.room})` : 'غير مسند'}
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={t.status || 'ناشط'}
                          onChange={(e) => {
                            const val = e.target.value as Teacher['status'];
                            setTeachers((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, status: val } : item))
                            );
                          }}
                          className="px-2 py-1 border border-slate-300 rounded text-xs font-bold bg-white"
                        >
                          <option value="ناشط">ناشط في المنصب</option>
                          <option value="تكوين">في تكوين بيداغوجي</option>
                          <option value="عطلة مرضية">عطلة مرضية / استخلاف</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
