/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarClock,
  School,
  FileCheck2,
  Printer,
  Scale,
  TrendingUp,
  Users,
  BookOpen,
  Briefcase,
  Calculator,
  KeyRound,
  Download,
  LayoutDashboard,
  FileSpreadsheet,
  BookOpenCheck,
  BarChart3,
  Utensils,
  ClipboardList,
  Landmark,
} from 'lucide-react';
import {
  MODELS,
  INITIAL_TEACHERS,
  INITIAL_GROUPS,
  Teacher,
  AssignedGroup,
  createSnteLogoDataUrl,
  rankDisplayTitle,
  specDisplayTitle,
  rankWeight,
  levelWeight,
  OFFICIAL_AUTHOR_SIGNATURE,
} from './data/timetableModels';
import AutomatedTimetableSystem from './components/AutomatedTimetableSystem';
import PerformanceControlModule, { TeacherEvaluation } from './components/PerformanceControlModule';
import CouncilsModule, { CouncilMeeting, INITIAL_COUNCIL_MEETINGS } from './components/CouncilsModule';
import LegislationAndBagModule from './components/LegislationAndBagModule';
import SalaryAndPromotionSimulator from './components/SalaryAndPromotionSimulator';
import SchoolAdminAndAccountsModule from './components/SchoolAdminAndAccountsModule';
import StaffComprehensiveModule, {
  RendementScore,
  AnnualAdminEval,
  SurplusDiagnosticRow,
  AbsenceInquiryRecord,
  ClassVisitRecord,
} from './components/StaffComprehensiveModule';
import SchoolExamsAndBooksModule, {
  ExamScheduleDay,
  BookInventoryRow,
  TabletInventoryItem,
  INITIAL_EXAM_DAYS,
  INITIAL_BOOKS_INVENTORY,
  INITIAL_TABLETS_INVENTORY,
} from './components/SchoolExamsAndBooksModule';
import SchoolCanteenBudgetModule, {
  CanteenBudgetConfig,
  DailyMealRecord,
  INITIAL_CANTEEN_CONFIG,
  INITIAL_DAILY_MEALS,
} from './components/SchoolCanteenBudgetModule';
import BriefInquiryRegistryModule from './components/BriefInquiryRegistryModule';
import OrdonnateurFinancialModule, { SchoolStage } from './components/OrdonnateurFinancialModule';
import { exportElementToPDF, triggerPrintOrPdf } from './utils/printAndPdf';

export type SectionId =
  | 'dashboard'
  | 'ordonnateur'
  | 'brief_inquiry'
  | 'canteen_budget'
  | 'timetable'
  | 'staff'
  | 'performance'
  | 'exams'
  | 'books_tablets'
  | 'councils'
  | 'legislation'
  | 'director_bag'
  | 'simulator'
  | 'admin_accounts'
  | 'pedagogical'
  | 'documents'
  | 'backup';

const DEFAULT_INSTITUTION = {
  wilaya: 'الأغواط',
  district: 'الأغواط 01',
  school: 'الشهيد أحمد بن عبد الرزاق',
  year: '2026 / 2027',
  directorName: 'أ. حميدي البشير',
};

const INITIAL_INQUIRIES: AbsenceInquiryRecord[] = [
  {
    id: 'inq1',
    teacherId: 't5',
    date: '2026-10-18',
    period: '08:00 إلى 15:00',
    type: 'غياب يوم كامل بدون إشعار مسبق',
    employeeReply: 'وعكة صحية طارئة مرفقة بشهادة طبية لمدة 24 ساعة.',
    directorDecision: 'تبرير مقبول (ظرف قاهر)',
  },
];

const INITIAL_CLASS_VISITS: ClassVisitRecord[] = [
  {
    id: 'cv1',
    teacherId: 't1',
    date: '2026-10-12',
    timeSlot: '08:30 - 09:30',
    subject: 'اللغة العربية — فهم المنطوق وتعبير شفوي',
    lessonTitle: 'التضامن والتعاون في الحي (س1)',
    docsStatus: 'الكراس اليومي محين، المذكرات منظمة ومطابقة للتدرج السنوي، دفتر المناداة مضبوط.',
    pedagogicalFlow: 'انطلاق محفز، تدرج منهجي سليم في بناء التعلمات، واستعمال هادف للسبورة والمشاهد.',
    studentInteraction: 'مشاركة فعالة للتلاميذ مع تشجيع الفئات المتعثرة ومراقبة النطق السليم.',
    directorGuidance: 'تحكم ممتاز في تسيير الفوج وتطبيق بيداغوجيا المقاربة بالكفاءات.',
    overallRating: 'ممتاز',
  },
  {
    id: 'cv2',
    teacherId: 't5',
    date: '2026-10-21',
    timeSlot: '10:15 - 11:15',
    subject: 'الرياضيات — درس وتطبيقات',
    lessonTitle: 'الأعداد إلى 999 (س3)',
    docsStatus: 'الوثائق التربوية حاضرة ومؤشرة بانتظام.',
    pedagogicalFlow: 'بناء جيد لمراحل الدرس مع احترام الحيز الزمني لكل وضعية.',
    studentInteraction: 'تفاعل إيجابي على الألواح وكراس المحاولات.',
    directorGuidance: 'توصية بتعزيز استعمال الوسائل الملموسة في مرحلة الانطلاق.',
    overallRating: 'جيد جداً',
  },
];

export default function App() {
  const [schoolStage, setSchoolStage] = useState<SchoolStage>(() => {
    try {
      const saved = localStorage.getItem('snte_director_stage_2026');
      if (saved === 'primary' || saved === 'middle' || saved === 'high') return saved;
    } catch {
      // ignore
    }
    return 'primary';
  });
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<'accounts' | 'school_admin' | 'backup'>('accounts');
  const [logoUrl, setLogoUrl] = useState<string>(() => createSnteLogoDataUrl());
  const [fontFamily, setFontFamily] = useState<string>("'Cairo', sans-serif");
  const [fontSize, setFontSize] = useState<string>('13px');
  const [assignPolicy, setAssignPolicy] = useState<string>('by_rank');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const dashboardPdfRef = useRef<HTMLDivElement>(null);

  const handleStageSwitch = (nextStage: SchoolStage) => {
    setSchoolStage(nextStage);
    try {
      localStorage.setItem('snte_director_stage_2026', nextStage);
    } catch {
      // ignore
    }
    // في التعليم المتوسط والثانوي، التوقيت الآلي من اختصاص الناظر / مستشار التربية وليس المدير
    if (nextStage !== 'primary' && activeSection === 'timetable') {
      setActiveSection('ordonnateur');
    }
  };

  const stageLabels: Record<
    SchoolStage,
    {
      shortName: string;
      institutionPrefix: string;
      directorTitle: string;
      inspectorateTitle: string;
      timetableNote: string;
    }
  > = {
    primary: {
      shortName: 'الطور الابتدائي',
      institutionPrefix: 'المدرسة الابتدائية',
      directorTitle: 'مدير المدرسة الابتدائية',
      inspectorateTitle: 'مفتشية التعليم الابتدائي',
      timetableNote: 'منظومة التوقيت الآلي والإسناد مفعلة (من اختصاص مدير الابتدائي)',
    },
    middle: {
      shortName: 'الطور المتوسط (متوسطة)',
      institutionPrefix: 'المتوسطة',
      directorTitle: 'مدير المتوسطة — آمر بالصرف رئيسي',
      inspectorateTitle: 'مفتشية التعليم المتوسط',
      timetableNote: 'التوقيت الآلي مخفي في المتوسطة (من اختصاص مستشار التربية) · صفة الآمر بالصرف مفعلة',
    },
    high: {
      shortName: 'الطور الثانوي (ثانوية)',
      institutionPrefix: 'الثانوية',
      directorTitle: 'مدير الثانوية — آمر بالصرف رئيسي',
      inspectorateTitle: 'مفتشية التربية الوطنية',
      timetableNote: 'التوقيت الآلي مخفي في الثانوية (من اختصاص الناظر) · صفة الآمر بالصرف مفعلة',
    },
  };

  const currentStageMeta = stageLabels[schoolStage];

  const [institution, setInstitution] = useState(() => {
    try {
      const saved = localStorage.getItem('snte_director_inst_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_INSTITUTION;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_teachers_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TEACHERS;
  });

  const [groups, setGroups] = useState<AssignedGroup[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_groups_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_GROUPS;
  });

  const [evaluations, setEvaluations] = useState<Record<string, TeacherEvaluation>>(() => {
    try {
      const saved = localStorage.getItem('snte_director_evals_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [councilMeetings, setCouncilMeetings] = useState<CouncilMeeting[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_councils_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_COUNCIL_MEETINGS;
  });

  // New Staff Comprehensive States
  const [rendementScores, setRendementScores] = useState<Record<string, RendementScore>>(() => {
    try {
      const saved = localStorage.getItem('snte_director_rendement_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [annualEvals, setAnnualEvals] = useState<Record<string, AnnualAdminEval>>(() => {
    try {
      const saved = localStorage.getItem('snte_director_annual_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [surplusData, setSurplusData] = useState<Record<string, SurplusDiagnosticRow>>(() => {
    try {
      const saved = localStorage.getItem('snte_director_surplus_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [inquiries, setInquiries] = useState<AbsenceInquiryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_inquiries_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_INQUIRIES;
  });

  const [classVisits, setClassVisits] = useState<ClassVisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_classvisits_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLASS_VISITS;
  });

  // New Exams & Books/Tablets States
  const [examDays, setExamDays] = useState<ExamScheduleDay[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_exams_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_EXAM_DAYS;
  });

  const [booksInventory, setBooksInventory] = useState<BookInventoryRow[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_books_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BOOKS_INVENTORY;
  });

  const [tabletsInventory, setTabletsInventory] = useState<TabletInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_tablets_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TABLETS_INVENTORY;
  });

  // Canteen Budget & Daily Meals States
  const [canteenConfig, setCanteenConfig] = useState<CanteenBudgetConfig>(() => {
    try {
      const saved = localStorage.getItem('snte_director_canteen_cfg_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CANTEEN_CONFIG;
  });

  const [dailyMeals, setDailyMeals] = useState<DailyMealRecord[]>(() => {
    try {
      const saved = localStorage.getItem('snte_director_daily_meals_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DAILY_MEALS;
  });

  // Official Document sub-tab in 'documents' section
  const [activeDocType, setActiveDocType] = useState<'assignment_pv' | 'duty_roster' | 'school_card'>('assignment_pv');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('snte_director_inst_2026', JSON.stringify(institution));
      localStorage.setItem('snte_director_teachers_2026', JSON.stringify(teachers));
      localStorage.setItem('snte_director_groups_2026', JSON.stringify(groups));
      localStorage.setItem('snte_director_evals_2026', JSON.stringify(evaluations));
      localStorage.setItem('snte_director_councils_2026', JSON.stringify(councilMeetings));
      localStorage.setItem('snte_director_rendement_2026', JSON.stringify(rendementScores));
      localStorage.setItem('snte_director_annual_2026', JSON.stringify(annualEvals));
      localStorage.setItem('snte_director_surplus_2026', JSON.stringify(surplusData));
      localStorage.setItem('snte_director_inquiries_2026', JSON.stringify(inquiries));
      localStorage.setItem('snte_director_classvisits_2026', JSON.stringify(classVisits));
      localStorage.setItem('snte_director_exams_2026', JSON.stringify(examDays));
      localStorage.setItem('snte_director_books_2026', JSON.stringify(booksInventory));
      localStorage.setItem('snte_director_tablets_2026', JSON.stringify(tabletsInventory));
      localStorage.setItem('snte_director_canteen_cfg_2026', JSON.stringify(canteenConfig));
      localStorage.setItem('snte_director_daily_meals_2026', JSON.stringify(dailyMeals));
    } catch {
      // ignore
    }
  }, [
    institution,
    teachers,
    groups,
    evaluations,
    councilMeetings,
    rendementScores,
    annualEvals,
    surplusData,
    inquiries,
    classVisits,
    examDays,
    booksInventory,
    tabletsInventory,
    canteenConfig,
    dailyMeals,
  ]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setLogoUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const runFairAssignment = (
    policyOverride?: string,
    currentTeachers: Teacher[] = teachers,
    currentGroups: AssignedGroup[] = groups
  ) => {
    const policy = policyOverride || assignPolicy;
    const arabLevels = ['prep', '1', '2', '3', '4', '5'];
    const arabTeachers = currentTeachers.filter((t) => t.spec === 'arabic');

    const nextGroups = currentGroups.map((g) => ({ ...g }));
    const arabGroups = nextGroups.filter((g) => arabLevels.includes(g.level));

    if (policy === 'normal') {
      arabGroups.forEach((grp, idx) => {
        if (arabTeachers[idx]) grp.teacherId = arabTeachers[idx].id;
      });
    } else {
      const sortedTeachers = [...arabTeachers].sort((a, b) => rankWeight(a.rank) - rankWeight(b.rank));
      const sortedGroups = [...arabGroups].sort((a, b) => levelWeight(b.level, policy) - levelWeight(a.level, policy));
      sortedGroups.forEach((grp, idx) => {
        if (sortedTeachers[idx]) grp.teacherId = sortedTeachers[idx].id;
      });
    }

    const specMap: Record<string, Teacher['spec']> = {
      fr: 'french',
      en: 'english',
      tz: 'amazigh',
      pe: 'pe',
    };
    nextGroups.forEach((grp) => {
      const targetSpec = specMap[grp.level];
      if (targetSpec) {
        const spTeacher = currentTeachers.find((t) => t.spec === targetSpec);
        if (spTeacher && !grp.teacherId) grp.teacherId = spTeacher.id;
      }
    });

    setGroups(nextGroups);
  };

  const handleExportBackup = () => {
    const payload = {
      version: '2026.25.54',
      exportedAt: new Date().toISOString(),
      schoolStage,
      institution,
      teachers,
      groups,
      evaluations,
      councilMeetings,
      rendementScores,
      annualEvals,
      surplusData,
      inquiries,
      classVisits,
      examDays,
      booksInventory,
      tabletsInventory,
      canteenConfig,
      dailyMeals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_منصة_المدير_${institution.school.replace(/\s+/g, '_')}_2026.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage('تم تصدير وتحميل ملف النسخة الاحتياطية الشاملة بنجاح.');
    setTimeout(() => setBackupMessage(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || '{}'));
        if (parsed.schoolStage === 'primary' || parsed.schoolStage === 'middle' || parsed.schoolStage === 'high') {
          setSchoolStage(parsed.schoolStage);
        }
        if (parsed.institution) setInstitution(parsed.institution);
        if (Array.isArray(parsed.teachers)) setTeachers(parsed.teachers);
        if (Array.isArray(parsed.groups)) setGroups(parsed.groups);
        if (parsed.evaluations) setEvaluations(parsed.evaluations);
        if (Array.isArray(parsed.councilMeetings)) setCouncilMeetings(parsed.councilMeetings);
        if (parsed.rendementScores) setRendementScores(parsed.rendementScores);
        if (parsed.annualEvals) setAnnualEvals(parsed.annualEvals);
        if (parsed.surplusData) setSurplusData(parsed.surplusData);
        if (Array.isArray(parsed.inquiries)) setInquiries(parsed.inquiries);
        if (Array.isArray(parsed.classVisits)) setClassVisits(parsed.classVisits);
        if (Array.isArray(parsed.examDays)) setExamDays(parsed.examDays);
        if (Array.isArray(parsed.booksInventory)) setBooksInventory(parsed.booksInventory);
        if (Array.isArray(parsed.tabletsInventory)) setTabletsInventory(parsed.tabletsInventory);
        if (parsed.canteenConfig) setCanteenConfig(parsed.canteenConfig);
        if (Array.isArray(parsed.dailyMeals)) setDailyMeals(parsed.dailyMeals);
        setBackupMessage('تم استيراد واستعادة كافة بيانات المدرسة والأساتذة والتوقيت بنجاح!');
        setTimeout(() => setBackupMessage(null), 4000);
      } catch {
        setBackupMessage('تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من صحة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    setInstitution(DEFAULT_INSTITUTION);
    setTeachers(INITIAL_TEACHERS);
    setGroups(INITIAL_GROUPS);
    setEvaluations({});
    setCouncilMeetings(INITIAL_COUNCIL_MEETINGS);
    setRendementScores({});
    setAnnualEvals({});
    setSurplusData({});
    setInquiries(INITIAL_INQUIRIES);
    setClassVisits(INITIAL_CLASS_VISITS);
    setExamDays(INITIAL_EXAM_DAYS);
    setBooksInventory(INITIAL_BOOKS_INVENTORY);
    setTabletsInventory(INITIAL_TABLETS_INVENTORY);
    setCanteenConfig(INITIAL_CANTEEN_CONFIG);
    setDailyMeals(INITIAL_DAILY_MEALS);
    setBackupMessage('تمت استعادة البيانات النموذجية الافتراضية للمؤسسة بنجاح.');
    setTimeout(() => setBackupMessage(null), 4000);
  };

  // Comprehensive Statistics for Main Dashboard
  const arabicClassGroups = groups.filter((g) => ['prep', '1', '2', '3', '4', '5'].includes(g.level));
  const totalBoys = arabicClassGroups.reduce((acc, g) => acc + (g.boys || 0), 0);
  const totalGirls = arabicClassGroups.reduce((acc, g) => acc + (g.girls || 0), 0);
  const totalStudents = totalBoys + totalGirls;
  const totalRepeaters = arabicClassGroups.reduce((acc, g) => acc + (g.repeaters || 0), 0);
  const assignedCount = groups.filter((g) => Boolean(g.teacherId)).length;
  const assignmentPercent = Math.round((assignedCount / Math.max(1, groups.length)) * 100);
  const totalWeeklyHours = groups.reduce((acc, g) => acc + (MODELS[g.level]?.arabicActualHours || 16), 0);

  const distinguishedCount = teachers.filter((t) => t.rank === 'مميز').length;
  const class2Count = teachers.filter((t) => t.rank === 'قسم ثان').length;
  const class1Count = teachers.filter((t) => t.rank === 'قسم أول').length;
  const primaryCount = teachers.filter((t) => t.rank === 'تعليم ابتدائي').length;

  // Books & Tablets stats
  const totalBookSetsReceived = booksInventory.reduce((a, b) => a + b.receivedSets, 0);
  const totalBookSetsDistributed = booksInventory.reduce((a, b) => a + b.freeDistributed + b.soldSets, 0);
  const booksDistPercent = Math.round((totalBookSetsDistributed / Math.max(1, totalBookSetsReceived)) * 100);
  const totalBooksRevenue = booksInventory.reduce((a, b) => a + b.soldSets * b.packPriceDzd, 0);

  const totalTabletsReceived = tabletsInventory
    .filter((t) => t.equipmentName.includes('لوحات'))
    .reduce((a, b) => a + b.receivedQty, 0);
  const totalTabletsWorking = tabletsInventory
    .filter((t) => t.equipmentName.includes('لوحات'))
    .reduce((a, b) => a + b.workingQty, 0);
  const tabletsWorkingPercent = Math.round((totalTabletsWorking / Math.max(1, totalTabletsReceived)) * 100);

  // Canteen & Daily Meals stats
  const totalCanteenMealsServed = dailyMeals.reduce((sum, m) => sum + m.actualBeneficiaries, 0);
  const avgDailyCanteenBeneficiaries =
    dailyMeals.length > 0 ? Math.round(totalCanteenMealsServed / dailyMeals.length) : 0;
  const totalCanteenCostConsumed = dailyMeals.reduce(
    (sum, m) => sum + m.actualBeneficiaries * m.unitCostDzd,
    0
  );
  const remainingCanteenBudget = Math.max(0, canteenConfig.allocatedBudgetDzd - totalCanteenCostConsumed);
  const canteenAttendancePercent =
    canteenConfig.registeredStudentsCount > 0
      ? Math.min(100, Math.round((avgDailyCanteenBeneficiaries / canteenConfig.registeredStudentsCount) * 100))
      : 0;

  const handleUpdateGroupCounts = (
    groupId: string,
    field: 'boys' | 'girls' | 'repeaters' | 'room',
    val: string | number
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (field === 'room') return { ...g, room: String(val) };
        const num = Math.max(0, Number(val) || 0);
        return { ...g, [field]: num };
      })
    );
  };

  const ALL_WORKSPACE_SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'الداشبورد الإحصائي الشامل', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    ...(schoolStage !== 'primary'
      ? [
          {
            id: 'ordonnateur' as SectionId,
            label: 'صفة الآمر بالصرف والميزانية والتوثيق المحاسبي',
            icon: <Landmark className="w-3.5 h-3.5 text-amber-300" />,
          },
        ]
      : []),
    { id: 'brief_inquiry', label: 'سجل الاستقصاء الوجيز', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    {
      id: 'canteen_budget',
      label:
        schoolStage === 'primary'
          ? 'قسم المطعم المدرسي وحاسبة الوجبات'
          : 'النظام نصف الداخلي وحاسبة الوجبات',
      icon: <Utensils className="w-3.5 h-3.5" />,
    },
    ...(schoolStage === 'primary'
      ? [
          {
            id: 'timetable' as SectionId,
            label: 'منظومة التوقيت الآلي',
            icon: <CalendarClock className="w-3.5 h-3.5" />,
          },
        ]
      : []),
    { id: 'staff', label: 'قسم الموظفين (المردودية · الفائض · الزيارات)', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'director_bag', label: 'حقيبة المدير والسجلات الـ 12 (الصادر والوارد)', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'performance', label: 'لوحة الأداء التربوي', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'exams', label: 'قسم الاختبارات المدرسية', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: 'books_tablets', label: 'الكتب المدرسية والتابلات', icon: <BookOpenCheck className="w-3.5 h-3.5" /> },
    { id: 'councils', label: 'قسم المجالس', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'legislation', label: 'التشريع والمهام', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'محاكي الترقية والرواتب والدرجات', icon: <Calculator className="w-3.5 h-3.5" /> },
    ...(schoolStage === 'primary'
      ? [
          {
            id: 'ordonnateur' as SectionId,
            label: 'توثيق الآمر بالصرف (المتوسط/الثانوي)',
            icon: <Landmark className="w-3.5 h-3.5" />,
          },
        ]
      : []),
    { id: 'admin_accounts', label: 'حسابات الموظفين', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'pedagogical', label: 'الخريطة التربوية والأفواج', icon: <School className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'المناوبة والمحاضر', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 'backup', label: 'قسم الحفظ والاستيراد', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (5 Single-Line Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="no-print bg-[#073818] text-white border-b-4 border-[#e6b85c] px-4 lg:px-8 py-3 flex items-center justify-between gap-8 sticky top-0 z-30 shadow-md">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('dashboard');
          }}
          className="text-base lg:text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0"
        >
          منصة المدير الرقمية · S.N.T.E
        </a>

        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-extrabold">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              activeSection === 'dashboard' || activeSection === 'brief_inquiry'
                ? 'text-[#fef08a] border-[#e6b85c]'
                : 'text-white/85 border-transparent hover:text-white'
            }`}
          >
            الداشبورد والاستقصاء
          </button>

          {schoolStage === 'primary' ? (
            <button
              onClick={() => setActiveSection('timetable')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
                activeSection === 'timetable'
                  ? 'text-[#fef08a] border-[#e6b85c]'
                  : 'text-white/85 border-transparent hover:text-white'
              }`}
            >
              منظومة التوقيت الآلي
            </button>
          ) : (
            <button
              onClick={() => setActiveSection('ordonnateur')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
                activeSection === 'ordonnateur'
                  ? 'text-[#fef08a] border-[#e6b85c]'
                  : 'text-amber-200 border-transparent hover:text-white'
              }`}
            >
              الآمر بالصرف والميزانية
            </button>
          )}

          <button
            onClick={() => setActiveSection('staff')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              activeSection === 'staff'
                ? 'text-[#fef08a] border-[#e6b85c]'
                : 'text-white/85 border-transparent hover:text-white'
            }`}
          >
            قسم الموظفين
          </button>
          <button
            onClick={() => setActiveSection('canteen_budget')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              activeSection === 'canteen_budget' || activeSection === 'exams' || activeSection === 'books_tablets'
                ? 'text-[#fef08a] border-[#e6b85c]'
                : 'text-white/85 border-transparent hover:text-white'
            }`}
          >
            المطعم والاختبارات والكتب
          </button>
          <button
            onClick={() => setActiveSection('director_bag')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              activeSection === 'director_bag' || activeSection === 'simulator' || activeSection === 'admin_accounts'
                ? 'text-[#fef08a] border-[#e6b85c]'
                : 'text-white/85 border-transparent hover:text-white'
            }`}
          >
            حقيبة المدير والسجلات الـ 12
          </button>
        </nav>

        <div className="shrink-0">
          <button
            onClick={() => triggerPrintOrPdf(`وثيقة_منصة_المدير_${institution.school}`)}
            className="px-3.5 py-2 text-xs font-extrabold text-white bg-[#d91424] hover:bg-[#9e0b17] border border-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الوثيقة</span>
          </button>
        </div>
      </header>

      {/* Educational Stage Switcher Bar (الابتدائي · المتوسط · الثانوي) */}
      <div className="no-print bg-[#0f172a] text-white border-b border-slate-700">
        <div className="max-w-[1560px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-amber-300">الطور التعليمي المعتمد بالمنصة:</span>
            {(
              [
                { id: 'primary', label: 'الطور الابتدائي (مدرسة ابتدائية)' },
                { id: 'middle', label: 'الطور المتوسط (متوسطة — آمر بالصرف)' },
                { id: 'high', label: 'الطور الثانوي (ثانوية — آمر بالصرف)' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => handleStageSwitch(st.id)}
                className={`px-3 py-1 rounded-lg font-extrabold cursor-pointer transition ${
                  schoolStage === st.id
                    ? 'bg-[#e6b85c] text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
            <span>الخصوصية التنظيمية للطور:</span>
            <span className="text-white">{currentStageMeta.timetableNote}</span>
          </div>
        </div>
      </div>

      {/* Secondary Workspace Section Switcher */}
      <div className="no-print bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1560px] mx-auto px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto">
          {ALL_WORKSPACE_SECTIONS.map((sec) => {
            const isActive =
              activeSection === sec.id ||
              (sec.id === 'backup' && activeSection === 'admin_accounts' && adminSubTab === 'backup');
            return (
              <button
                key={sec.id}
                onClick={() => {
                  if (sec.id === 'backup') {
                    setAdminSubTab('backup');
                    setActiveSection('admin_accounts');
                  } else if (sec.id === 'admin_accounts') {
                    if (adminSubTab === 'backup') setAdminSubTab('accounts');
                    setActiveSection('admin_accounts');
                  } else {
                    setActiveSection(sec.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#117a37] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 py-5">
        {/* SECTION: صفة الآمر بالصرف والتسيير المالي والتوثيق المحاسبي (للمتوسط والثانوي) */}
        {activeSection === 'ordonnateur' && (
          <OrdonnateurFinancialModule
            schoolStage={schoolStage}
            institution={institution}
            logoUrl={logoUrl}
            onSwitchStage={handleStageSwitch}
          />
        )}

        {/* SECTION: سجل الاستقصاء الوجيز */}
        {activeSection === 'brief_inquiry' && (
          <BriefInquiryRegistryModule
            institution={institution}
            teachers={teachers}
            groups={groups}
            logoUrl={logoUrl}
            canteenBeneficiariesCount={canteenConfig.registeredStudentsCount}
          />
        )}

        {/* SECTION: قسم المطعم المدرسي المستقل والشامل */}
        {activeSection === 'canteen_budget' && (
          <SchoolCanteenBudgetModule
            schoolStage={schoolStage}
            institution={institution}
            logoUrl={logoUrl}
            totalSchoolStudents={totalStudents}
            canteenConfig={canteenConfig}
            setCanteenConfig={setCanteenConfig}
            dailyMeals={dailyMeals}
            setDailyMeals={setDailyMeals}
          />
        )}

        {/* SECTION: منظومة التوقيت الآلي (خاص بالطور الابتدائي فقط لأنها في المتوسط والثانوي من اختصاص الناظر / مستشار التربية) */}
        {activeSection === 'timetable' && schoolStage === 'primary' && (
          <AutomatedTimetableSystem
            institution={institution}
            setInstitution={setInstitution}
            teachers={teachers}
            setTeachers={setTeachers}
            groups={groups}
            setGroups={setGroups}
            logoUrl={logoUrl}
            onLogoUpload={handleLogoUpload}
            assignPolicy={assignPolicy}
            setAssignPolicy={setAssignPolicy}
            runFairAssignment={runFairAssignment}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}

        {/* SECTION: قسم الموظفين الشامل (المردودية · التقييم السنوي · تشخيص الفائض · الاستفسار عن الغياب · زيارة القسم) */}
        {activeSection === 'staff' && (
          <StaffComprehensiveModule
            institution={institution}
            teachers={teachers}
            setTeachers={setTeachers}
            groups={groups}
            logoUrl={logoUrl}
            onGoToTimetable={() =>
              setActiveSection(schoolStage === 'primary' ? 'timetable' : 'ordonnateur')
            }
            rendementScores={rendementScores}
            setRendementScores={setRendementScores}
            annualEvals={annualEvals}
            setAnnualEvals={setAnnualEvals}
            surplusData={surplusData}
            setSurplusData={setSurplusData}
            inquiries={inquiries}
            setInquiries={setInquiries}
            classVisits={classVisits}
            setClassVisits={setClassVisits}
          />
        )}

        {/* SECTION: قسم الاختبارات المدرسية */}
        {activeSection === 'exams' && (
          <SchoolExamsAndBooksModule
            mode="exams"
            institution={institution}
            teachers={teachers}
            groups={groups}
            logoUrl={logoUrl}
            examDays={examDays}
            setExamDays={setExamDays}
            booksInventory={booksInventory}
            setBooksInventory={setBooksInventory}
            tabletsInventory={tabletsInventory}
            setTabletsInventory={setTabletsInventory}
          />
        )}

        {/* SECTION: قسم الكتب المدرسية والتابلات */}
        {activeSection === 'books_tablets' && (
          <SchoolExamsAndBooksModule
            mode="books_tablets"
            institution={institution}
            teachers={teachers}
            groups={groups}
            logoUrl={logoUrl}
            examDays={examDays}
            setExamDays={setExamDays}
            booksInventory={booksInventory}
            setBooksInventory={setBooksInventory}
            tabletsInventory={tabletsInventory}
            setTabletsInventory={setTabletsInventory}
          />
        )}

        {/* SECTION: لوحة التحكم في الأداء التربوي */}
        {activeSection === 'performance' && (
          <PerformanceControlModule
            institution={institution}
            teachers={teachers}
            groups={groups}
            evaluations={evaluations}
            setEvaluations={setEvaluations}
            logoUrl={logoUrl}
          />
        )}

        {/* SECTION: قسم المجالس التربوية والإدارية */}
        {activeSection === 'councils' && (
          <CouncilsModule
            institution={institution}
            teachers={teachers}
            meetings={councilMeetings}
            setMeetings={setCouncilMeetings}
            logoUrl={logoUrl}
          />
        )}

        {/* SECTION: قسم التشريع والمهام */}
        {activeSection === 'legislation' && (
          <LegislationAndBagModule
            mode="legislation"
            institution={institution}
            teachers={teachers}
            logoUrl={logoUrl}
          />
        )}

        {/* SECTION: حقيبة وثائق المدير */}
        {activeSection === 'director_bag' && (
          <LegislationAndBagModule
            mode="bag"
            institution={institution}
            teachers={teachers}
            logoUrl={logoUrl}
          />
        )}

        {/* SECTION: محاكي الترقية والأقدمية والرواتب والدرجات */}
        {activeSection === 'simulator' && (
          <SalaryAndPromotionSimulator
            institution={institution}
            teachers={teachers}
            logoUrl={logoUrl}
          />
        )}

        {/* SECTION: الإدارة المدرسية والتحكم بحسابات الموظفين + الحفظ والاستيراد */}
        {(activeSection === 'admin_accounts' || activeSection === 'backup') && (
          <SchoolAdminAndAccountsModule
            subTab={activeSection === 'backup' ? 'backup' : adminSubTab}
            setSubTab={(t) => {
              setAdminSubTab(t);
              setActiveSection('admin_accounts');
            }}
            institution={institution}
            teachers={teachers}
            groups={groups}
            logoUrl={logoUrl}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetAllData={handleResetAllData}
            backupMessage={backupMessage}
            onNavigateSection={(sec) => setActiveSection(sec)}
          />
        )}

        {/* SECTION: لوح داشبورد إحصائي شامل لكل الأقسام في القسم الرئيسي */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Director Hero Banner */}
            <div className="no-print bg-gradient-to-l from-[#073818] via-[#117a37] to-[#d91424] text-white rounded-xl p-6 border-b-4 border-[#e6b85c] shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-full border-3 border-[#e6b85c] p-1 flex items-center justify-center shrink-0 shadow-lg">
                  <img src={logoUrl} alt="SNTE Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-yellow-200 mb-1">
                    النقابة الوطنية لعمال التربية (S.N.T.E) · {currentStageMeta.shortName} · {currentStageMeta.directorTitle}
                  </div>
                  <h1 className="text-xl md:text-2xl font-black">
                    منصة المدير الرقمية ({currentStageMeta.institutionPrefix}: {institution.school})
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/95 font-bold">
                    <span>مديرية التربية لولاية: {institution.wilaya}</span>
                    <span>·</span>
                    <span>{currentStageMeta.inspectorateTitle}: {institution.district}</span>
                    <span>·</span>
                    <span>السنة الدراسية: {institution.year}</span>
                    <span>·</span>
                    <span className="text-yellow-200">{OFFICIAL_AUTHOR_SIGNATURE}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() =>
                    exportElementToPDF(
                      dashboardPdfRef.current,
                      `التقرير_الإحصائي_والرسوم_البيانية_${institution.school}`,
                      'landscape'
                    )
                  }
                  className="bg-[#e6b85c] hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل المؤشرات والرسوم البيانية (PDF)</span>
                </button>
                <button
                  onClick={() =>
                    triggerPrintOrPdf(
                      `التقرير_الإحصائي_والرسوم_البيانية_${institution.school}`,
                      dashboardPdfRef.current
                    )
                  }
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/60 font-extrabold text-xs px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الداشبورد الإحصائي (A4)</span>
                </button>
              </div>
            </div>

            {/* TOP STATISTICAL KPI STRIP (6 Master Indicators) */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              <div
                onClick={() => setActiveSection('staff')}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
              >
                <div className="text-[11px] font-bold text-slate-500">الهيئة التربوية (25-54)</div>
                <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">{teachers.length} أستاذ</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  مميز: {distinguishedCount} · ث: {class2Count} · أ: {class1Count} · ب: {primaryCount}
                </div>
              </div>

              {schoolStage === 'primary' ? (
                <div
                  onClick={() => setActiveSection('timetable')}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
                >
                  <div className="text-[11px] font-bold text-slate-500">التوقيت الآلي والإسناد</div>
                  <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">{assignmentPercent}%</div>
                  <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                    {assignedCount}/{groups.length} أقسام · {totalWeeklyHours} سا/أسبوع
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setActiveSection('ordonnateur')}
                  className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#094d22] transition"
                >
                  <div className="text-[11px] font-black text-amber-900">صفة الآمر بالصرف والميزانية</div>
                  <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">8,750,000 دج</div>
                  <div className="text-[11px] text-slate-700 font-bold mt-1">
                    تنفيذ الأبواب والحوالات ومراقبة الصندوق
                  </div>
                </div>
              )}

              <div
                onClick={() => setActiveSection('brief_inquiry')}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
              >
                <div className="text-[11px] font-bold text-slate-500">التعداد العام (الاستقصاء الوجيز)</div>
                <div className="text-2xl font-black text-[#d91424] mt-1 tabular-nums">{totalStudents} تلميذ</div>
                <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                  ذكور: {totalBoys} · إناث: {totalGirls} · معيدون: {totalRepeaters}
                </div>
              </div>

              <div
                onClick={() => setActiveSection('canteen_budget')}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
              >
                <div className="text-[11px] font-bold text-slate-500">المطعم المدرسي والوجبات</div>
                <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">
                  {avgDailyCanteenBeneficiaries} مستفيد/يوم
                </div>
                <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                  المستهلك: {totalCanteenCostConsumed.toLocaleString('ar-DZ')} دج ({canteenAttendancePercent}%)
                </div>
              </div>

              <div
                onClick={() => setActiveSection('books_tablets')}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
              >
                <div className="text-[11px] font-bold text-slate-500">الكتب والتابلات الرقمية</div>
                <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">
                  {booksDistPercent}% · {totalTabletsWorking}/{totalTabletsReceived}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                  الكتب: {totalBooksRevenue.toLocaleString('ar-DZ')} دج · التابلات: {tabletsWorkingPercent}%
                </div>
              </div>

              <div
                onClick={() => setActiveSection('director_bag')}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-[#117a37] transition"
              >
                <div className="text-[11px] font-bold text-slate-500">السجلات الـ 12 والمجالس</div>
                <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                  12 سجلاً رسمياً
                </div>
                <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                  {classVisits.length} زيارات · {councilMeetings.length} مجالس · {inquiries.length} استفسار
                </div>
              </div>
            </div>

            {/* COMPREHENSIVE STATISTICAL DASHBOARD FOR ALL SECTIONS */}
            <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-black text-[#094d22] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#117a37]" />
                    <span>لوحة الإحصائيات التحليلية والرسوم البيانية الشاملة لجميع أقسام المنصة ({institution.year})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مؤشرات حية متزامنة مع قسم الموظفين، التوقيت الآلي، المطعم المدرسي، الاستقصاء الوجيز، الأداء التربوي، والكتب والتابلات
                  </p>
                </div>

                <button
                  onClick={() =>
                    exportElementToPDF(
                      dashboardPdfRef.current,
                      `التقرير_الإحصائي_والرسوم_البيانية_${institution.school}`,
                      'landscape'
                    )
                  }
                  className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف PDF لكافة المؤشرات والرسوم البيانية</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Statistical Chart 1: توزيع الأساتذة حسب رتب المرسوم 25-54 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#094d22]">1. توزيع الأساتذة حسب رتب المرسوم 25-54</h3>
                    <button
                      onClick={() => setActiveSection('staff')}
                      className="text-[11px] font-extrabold text-[#117a37] hover:underline cursor-pointer"
                    >
                      قسم الموظفين ←
                    </button>
                  </div>

                  {[
                    { label: 'أستاذ مميز (الصنف 15)', count: distinguishedCount, color: 'bg-[#d91424]' },
                    { label: 'أستاذ قسم ثانٍ (الصنف 14)', count: class2Count, color: 'bg-[#117a37]' },
                    { label: 'أستاذ قسم أول (الصنف 13)', count: class1Count, color: 'bg-[#0284c7]' },
                    { label: 'أستاذ تعليم ابتدائي (الصنف 12)', count: primaryCount, color: 'bg-slate-600' },
                  ].map((r) => {
                    const pct = Math.round((r.count / Math.max(1, teachers.length)) * 100);
                    return (
                      <div key={r.label} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{r.label}</span>
                          <span className="tabular-nums">
                            {r.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className={`${r.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Statistical Chart 2: كثافة الأفواج التربوية وتعداد التلاميذ */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#094d22]">2. التعداد والكثافة حسب الأفواج التربوية</h3>
                    <button
                      onClick={() => setActiveSection('brief_inquiry')}
                      className="text-[11px] font-extrabold text-[#117a37] hover:underline cursor-pointer"
                    >
                      سجل الاستقصاء الوجيز ←
                    </button>
                  </div>

                  <div className="space-y-2">
                    {arabicClassGroups.map((grp) => {
                      const m = MODELS[grp.level];
                      const count = (grp.boys || 0) + (grp.girls || 0);
                      const pct = Math.min(100, Math.round((count / 40) * 100));
                      return (
                        <div key={grp.id} className="space-y-0.5 text-xs">
                          <div className="flex justify-between font-bold">
                            <span>{m?.levelTitle}</span>
                            <span className="tabular-nums">
                              {count} تلميذ (ذ: {grp.boys || 0} / إ: {grp.girls || 0})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#117a37] h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statistical Chart 3: مؤشرات الأقسام الإدارية والبيداغوجية */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#094d22]">3. مؤشرات الجاهزية والرقابة في الأقسام</h3>
                    <button
                      onClick={() => setActiveSection('performance')}
                      className="text-[11px] font-extrabold text-[#117a37] hover:underline cursor-pointer"
                    >
                      الأداء التربوي ←
                    </button>
                  </div>

                  {[
                    { label: 'تغطية منظومة التوقيت الآلي والإسناد', val: `${assignmentPercent}%`, bar: assignmentPercent },
                    { label: 'متوسط تنفيذ المناهج والتدرجات السنوية', val: '88%', bar: 88 },
                    { label: 'نسبة النجاح والتحكم العامة للتلاميذ (≥5/10)', val: '84%', bar: 84 },
                    { label: 'نسبة توزيع الكتب المدرسية (المجانية والبيع)', val: `${booksDistPercent}%`, bar: booksDistPercent },
                    { label: 'جاهزية اللوحات الرقمية (التابلات وعربات الشحن)', val: `${tabletsWorkingPercent}%`, bar: tabletsWorkingPercent },
                    { label: 'نسبة حضور المستفيدين في المطعم المدرسي', val: `${canteenAttendancePercent}%`, bar: canteenAttendancePercent },
                  ].map((ind) => (
                    <div key={ind.label} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{ind.label}</span>
                        <span className="text-[#d91424] font-black tabular-nums">{ind.val}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#094d22] h-full rounded-full" style={{ width: `${ind.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Navigation Cards to All Sections */}
            <div className="no-print grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {schoolStage === 'primary' ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#094d22] mb-1.5">01. منظومة التوقيت الآلي</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      إعداد جداول التوقيت الأسبوعي والإسناد الآلي حسب الرتبة مع تحميل PDF A4 أفقي.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('timetable')}
                    className="w-full py-2 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    فتح منظومة التوقيت الآلي
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#094d22] mb-1.5">
                      01. صفة الآمر بالصرف والميزانية
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">
                      متابعة أبواب الميزانية، سندات الطلب، حوالات الدفع، ومراقبة الصندوق (التوقيت من اختصاص الناظر/المستشار).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('ordonnateur')}
                    className="w-full py-2 bg-[#094d22] hover:bg-[#117a37] text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    فتح قسم الآمر بالصرف والميزانية
                  </button>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#094d22] mb-1.5">02. سجل الاستقصاء الوجيز</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    الإحصاء المدرسي الشامل للهياكل المادية، التعداد العمري للتلاميذ، تأطير الأساتذة، والتضامن المدرسي.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('brief_inquiry')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                >
                  فتح سجل الاستقصاء الوجيز
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#094d22] mb-1.5">03. قسم المطعم المدرسي الشامل</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    قسم مستقل للميزانية، الوجبات اليومية، المستفيدين، جرد المخزون الغذائي، والرقابة الصحية والطبق الشاهد.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('canteen_budget')}
                  className="w-full py-2 bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                >
                  فتح قسم المطعم المدرسي
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#094d22] mb-1.5">
                    04. حقيبة المدير والسجلات الـ 12
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    السجلات الـ 12 الرسمية (الصادر، الوارد، الصحة المدرسية، التواصل والتبليغ، الشركاء...) والمحاضر الإدارية.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('director_bag')}
                  className="w-full py-2 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                >
                  فتح السجلات الـ 12 والحقيبة
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#094d22] mb-1.5">
                    05. الموظفون والاختبارات والكتب
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    تنقيط المردودية (/40)، التقييم السنوي، تشخيص الفائض، الزيارات الصفية، الاختبارات، والكتب والتابلات.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveSection('staff')}
                    className="py-2 bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    قسم الموظفين
                  </button>
                  <button
                    onClick={() => setActiveSection('books_tablets')}
                    className="py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    الكتب والتابلات
                  </button>
                </div>
              </div>
            </div>

            {/* Official Printable & PDF Exportable A4 Landscape Sheet for the Statistical Dashboard */}
            <div className="sheet-scroll-container">
              <div ref={dashboardPdfRef} className="a4-landscape-page" dir="rtl">
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
                          التقرير الإحصائي الشامل ومؤشرات لوحة القيادة التربوية والإدارية
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

                {/* Printable KPI Summary Row */}
                <div className="grid grid-cols-6 gap-2 my-2 text-center text-[11px] font-black">
                  <div className="border border-black p-1.5 bg-[#f8fafc]">
                    <div>الهيئة التربوية (25-54)</div>
                    <div className="text-xs text-[#094d22] tabular-nums">{teachers.length} أستاذ</div>
                  </div>
                  <div className="border border-black p-1.5 bg-[#f8fafc]">
                    <div>التوقيت الآلي والإسناد</div>
                    <div className="text-xs text-[#117a37] tabular-nums">
                      {assignmentPercent}% ({totalWeeklyHours} سا)
                    </div>
                  </div>
                  <div className="border border-black p-1.5 bg-[#fff1f2]">
                    <div>التعداد العام للتلاميذ</div>
                    <div className="text-xs text-[#d91424] tabular-nums">
                      {totalStudents} (ذ:{totalBoys}/إ:{totalGirls})
                    </div>
                  </div>
                  <div className="border border-black p-1.5 bg-[#f0fdf4]">
                    <div>المطعم المدرسي</div>
                    <div className="text-xs text-[#094d22] tabular-nums">
                      {avgDailyCanteenBeneficiaries} مستفيد ({canteenAttendancePercent}%)
                    </div>
                  </div>
                  <div className="border border-black p-1.5 bg-[#f8fafc]">
                    <div>توزيع الكتاب المدرسي</div>
                    <div className="text-xs text-[#094d22] tabular-nums">
                      {booksDistPercent}% ({totalBooksRevenue.toLocaleString('ar-DZ')} دج)
                    </div>
                  </div>
                  <div className="border border-black p-1.5 bg-[#f8fafc]">
                    <div>جاهزية التابلات الرقمية</div>
                    <div className="text-xs text-[#117a37] tabular-nums">
                      {totalTabletsWorking}/{totalTabletsReceived} ({tabletsWorkingPercent}%)
                    </div>
                  </div>
                </div>

                {/* Printable Charts & Visual Progress Bars Grid */}
                <div className="grid grid-cols-3 gap-3 my-2 text-[11px]">
                  <div className="border border-black p-2 bg-white space-y-1.5">
                    <div className="font-black text-[#094d22] border-b border-black pb-1">
                      1. الرسم البياني لتوزيع رتب المرسوم 25-54
                    </div>
                    {[
                      { label: 'أستاذ مميز (ص15)', count: distinguishedCount, color: 'bg-[#d91424]' },
                      { label: 'أستاذ قسم ثانٍ (ص14)', count: class2Count, color: 'bg-[#117a37]' },
                      { label: 'أستاذ قسم أول (ص13)', count: class1Count, color: 'bg-[#0284c7]' },
                      { label: 'أستاذ تعليم ابتدائي (ص12)', count: primaryCount, color: 'bg-slate-700' },
                    ].map((r) => {
                      const pct = Math.round((r.count / Math.max(1, teachers.length)) * 100);
                      return (
                        <div key={r.label} className="space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span>{r.label}</span>
                            <span className="tabular-nums">
                              {r.count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded overflow-hidden border border-slate-400">
                            <div className={`${r.color} h-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-black p-2 bg-white space-y-1">
                    <div className="font-black text-[#094d22] border-b border-black pb-1">
                      2. الرسم البياني لكثافة الأفواج التربوية
                    </div>
                    {arabicClassGroups.map((grp) => {
                      const m = MODELS[grp.level];
                      const count = (grp.boys || 0) + (grp.girls || 0);
                      const pct = Math.min(100, Math.round((count / 40) * 100));
                      return (
                        <div key={grp.id} className="space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span>{m?.levelTitle}</span>
                            <span className="tabular-nums">{count} تلميذ</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden border border-slate-400">
                            <div className="bg-[#117a37] h-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-black p-2 bg-white space-y-1">
                    <div className="font-black text-[#094d22] border-b border-black pb-1">
                      3. مؤشرات الجاهزية والرقابة البيداغوجية
                    </div>
                    {[
                      { label: 'الإسناد الآلي للتوقيت', val: `${assignmentPercent}%`, bar: assignmentPercent },
                      { label: 'تنفيذ المناهج والتدرجات', val: '88%', bar: 88 },
                      { label: 'نسبة التحكم والنجاح (≥5/10)', val: '84%', bar: 84 },
                      { label: 'توزيع الكتاب المدرسي', val: `${booksDistPercent}%`, bar: booksDistPercent },
                      { label: 'جاهزية اللوحات الرقمية', val: `${tabletsWorkingPercent}%`, bar: tabletsWorkingPercent },
                      { label: 'حضور المطعم المدرسي', val: `${canteenAttendancePercent}%`, bar: canteenAttendancePercent },
                    ].map((ind) => (
                      <div key={ind.label} className="space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span>{ind.label}</span>
                          <span className="text-[#d91424] font-black tabular-nums">{ind.val}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden border border-slate-400">
                          <div className="bg-[#094d22] h-full" style={{ width: `${ind.bar}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Table of Current Assignment in Printable Dashboard */}
                <table className="timetable-grid mt-1">
                  <thead>
                    <tr className="hours-header">
                      <th style={{ width: '35px' }}>#</th>
                      <th>المستوى / التخصص</th>
                      <th>الحجرة / الأفواج</th>
                      <th>الأستاذ(ة) المسند له</th>
                      <th>الرتبة (المرسوم 25-54)</th>
                      <th>التعداد (ذكور / إناث)</th>
                      <th>الحجم الساعي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((grp, index) => {
                      const model = MODELS[grp.level];
                      const teacher = teachers.find((t) => t.id === grp.teacherId);
                      return (
                        <tr key={grp.id}>
                          <td className="font-bold tabular-nums py-0.5">{index + 1}</td>
                          <td className="font-extrabold text-[#094d22]">{model?.levelTitle || grp.level}</td>
                          <td>{grp.room}</td>
                          <td className="font-bold">{teacher ? teacher.name : 'غير مسند'}</td>
                          <td>{teacher ? rankDisplayTitle(teacher.rank) : '—'}</td>
                          <td className="tabular-nums font-bold">
                            {grp.boys !== undefined ? `${(grp.boys || 0) + (grp.girls || 0)} تلميذ` : 'أفواج مشتركة'}
                          </td>
                          <td className="font-bold text-[#d91424] tabular-nums">
                            {model ? `${model.arabicActualHours} سا` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="footer-signatures mt-3">
                  <div>إحصاء الأمانة التربوية</div>
                  <div>إمضاء وختم السيد(ة) مدير(ة) المدرسة</div>
                  <div>تأشيرة السيد(ة) مفتش(ة) التعليم الابتدائي</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: الخريطة التربوية وتعداد التلاميذ */}
        {activeSection === 'pedagogical' && (
          <div className="space-y-5">
            <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#094d22]">
                  الخريطة التربوية والبطاقة الفنية للمدرسة الابتدائية ({institution.school})
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  تعديل مباشر لتعداد التلاميذ (ذكور / إناث / معيدون) وتخصيص الحجرات الدراسية لكل فوج تربوي
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold">
                <span className="text-slate-700">مجموع الذكور: {totalBoys}</span>
                <span>·</span>
                <span className="text-slate-700">مجموع الإناث: {totalGirls}</span>
                <span>·</span>
                <span className="text-[#d91424]">المجموع العام: {totalStudents} تلميذ(ة)</span>
                <button
                  onClick={() =>
                    exportElementToPDF(null, `الخريطة_التربوية_${institution.school}`, 'landscape')
                  }
                  className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل PDF</span>
                </button>
                <button
                  onClick={() => triggerPrintOrPdf(`الخريطة_التربوية_${institution.school}`)}
                  className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الخريطة (A4)</span>
                </button>
              </div>
            </div>

            <div className="sheet-scroll-container">
              <div className="a4-landscape-page" dir="rtl">
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
                        <span className="main-doc-title">الخريطة التربوية وتعداد التلاميذ حسب الأفواج</span>
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
                      <th>المستوى التعليمي</th>
                      <th>الحجرة الدراسية</th>
                      <th>الأستاذ(ة) المشرف(ة)</th>
                      <th>عدد الذكور</th>
                      <th>عدد الإناث</th>
                      <th>مجموع الفوج</th>
                      <th>عدد المعيدين</th>
                      <th>الحجم الساعي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arabicClassGroups.map((grp) => {
                      const model = MODELS[grp.level];
                      const teacher = teachers.find((t) => t.id === grp.teacherId);
                      const boys = grp.boys || 0;
                      const girls = grp.girls || 0;
                      const total = boys + girls;
                      return (
                        <tr key={grp.id}>
                          <td className="py-2 px-3 font-extrabold text-slate-900">{model?.levelTitle}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={grp.room}
                              onChange={(e) => handleUpdateGroupCounts(grp.id, 'room', e.target.value)}
                              className="w-36 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-center"
                            />
                          </td>
                          <td className="py-2 px-3 font-bold text-[#094d22]">
                            {teacher ? `${teacher.name} (${rankDisplayTitle(teacher.rank)})` : 'غير مسند'}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={boys}
                              onChange={(e) => handleUpdateGroupCounts(grp.id, 'boys', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold tabular-nums text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={girls}
                              onChange={(e) => handleUpdateGroupCounts(grp.id, 'girls', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold tabular-nums text-center"
                            />
                          </td>
                          <td className="py-2 px-3 font-black text-[#d91424] tabular-nums">{total} تلميذ</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={grp.repeaters || 0}
                              onChange={(e) => handleUpdateGroupCounts(grp.id, 'repeaters', e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold tabular-nums text-center"
                            />
                          </td>
                          <td className="py-2 px-3 font-bold text-[#094d24] tabular-nums">
                            {model?.arabicActualHours} سا
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#e8f5e9] font-black">
                      <td colSpan={3} className="py-2">
                        المجموع العام للمؤسسة
                      </td>
                      <td className="tabular-nums">{totalBoys}</td>
                      <td className="tabular-nums">{totalGirls}</td>
                      <td className="tabular-nums text-[#d91424]">{totalStudents} تلميذ</td>
                      <td className="tabular-nums">{totalRepeaters}</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>

                <div className="footer-signatures mt-6">
                  <div>الأمانة التربوية</div>
                  <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                  <div>مصادقة السيد(ة) مفتش(ة) المقاطعة</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: المناوبة والوثائق الرسمية للمدير */}
        {activeSection === 'documents' && (
          <div className="space-y-4">
            <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveDocType('assignment_pv')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                    activeDocType === 'assignment_pv'
                      ? 'bg-[#117a37] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  1. محضر الإسناد التربوي الرسمي (المرسوم 25-54)
                </button>
                <button
                  onClick={() => setActiveDocType('duty_roster')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                    activeDocType === 'duty_roster'
                      ? 'bg-[#117a37] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  2. جدول الحراسة والمناوبة اليومية في الساحة
                </button>
                <button
                  onClick={() => setActiveDocType('school_card')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                    activeDocType === 'school_card'
                      ? 'bg-[#117a37] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  3. بطاقة التنظيم التربوي وإحصاء التلاميذ
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    exportElementToPDF(null, `محضر_${activeDocType}_${institution.school}`, 'landscape')
                  }
                  className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل PDF</span>
                </button>
                <button
                  onClick={() => triggerPrintOrPdf(`محضر_${activeDocType}_${institution.school}`)}
                  className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوثيقة الرسمية (A4)</span>
                </button>
              </div>
            </div>

            <div className="sheet-scroll-container">
              <div className="a4-landscape-page" dir="rtl">
                <div className="sheet-header-grid">
                  <div className="sheet-right-col">
                    <div>مديرية التربية لولاية : {institution.wilaya}</div>
                    <div>مفتشية التعليم الابتدائي</div>
                    <div>مقاطعة : {institution.district}</div>
                    <div>المدرسة الابتدائية : {institution.school}</div>
                  </div>

                  <div className="sheet-center-col">
                    <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                    <div className="min-heading">وزارة التربية الوطنية</div>
                    <div className="title-frame-with-logo">
                      <img src={logoUrl} alt="SNTE" />
                      <div className="title-frame-text">
                        <span className="main-doc-title">
                          {activeDocType === 'assignment_pv'
                            ? 'محضر الإسناد التربوي وتوزيع المهام البيداغوجية'
                            : activeDocType === 'duty_roster'
                            ? 'جدول الحراسة اليومية والمناوبة التربوية الأسبوعية'
                            : 'بطاقة التنظيم التربوي والتعداد العام للتلاميذ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sheet-left-col">
                    <div>السنة الدراسية : {institution.year}</div>
                    <div>المدير(ة) : {institution.directorName}</div>
                    <div>المرجع القانوني : المرسوم التنفيذي 25-54</div>
                    <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
                  </div>
                </div>

                {activeDocType === 'assignment_pv' && (
                  <div>
                    <table className="timetable-grid mt-2">
                      <thead>
                        <tr className="hours-header">
                          <th style={{ width: '45px' }}>الرقم</th>
                          <th>اسم ولقب الأستاذ(ة)</th>
                          <th>الرتبة (المرسوم 25-54)</th>
                          <th>التخصص</th>
                          <th>المستوى / اللغة المسندة</th>
                          <th>الحجرة / الأفواج</th>
                          <th>الحجم الساعي</th>
                          <th style={{ width: '130px' }}>إمضاء الأستاذ(ة)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map((g, i) => {
                          const m = MODELS[g.level];
                          const t = teachers.find((x) => x.id === g.teacherId);
                          return (
                            <tr key={g.id}>
                              <td className="font-bold tabular-nums py-1.5">{i + 1}</td>
                              <td
                                className="font-extrabold text-right px-2"
                                contentEditable
                                suppressContentEditableWarning
                              >
                                {t ? t.name : '.........................'}
                              </td>
                              <td className="font-bold">{t ? rankDisplayTitle(t.rank) : '—'}</td>
                              <td>{t ? specDisplayTitle(t.spec) : '—'}</td>
                              <td className="font-extrabold text-[#094d22]">{m?.levelTitle}</td>
                              <td contentEditable suppressContentEditableWarning>{g.room}</td>
                              <td className="font-bold text-[#d91424] tabular-nums">{m?.arabicActualHours} سا</td>
                              <td></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDocType === 'duty_roster' && (
                  <div>
                    <table className="timetable-grid mt-2">
                      <thead>
                        <tr className="hours-header">
                          <th style={{ width: '100px' }}>الأيام</th>
                          <th>الدخول الصباحي (07:50 - 08:00)</th>
                          <th>فترة الاستراحة الصباحية (09:30 - 09:45)</th>
                          <th>الدخول المسائي (12:50 - 13:00)</th>
                          <th>الخروج المسائي (15:00)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((dayName, dIdx) => {
                          const t1 = teachers[(dIdx * 2) % Math.max(1, teachers.length)];
                          const t2 = teachers[(dIdx * 2 + 1) % Math.max(1, teachers.length)];
                          const t3 = teachers[(dIdx * 2 + 2) % Math.max(1, teachers.length)];
                          return (
                            <tr key={dayName}>
                              <td className="day-col-cell py-2.5">{dayName}</td>
                              <td className="font-bold py-2.5" contentEditable suppressContentEditableWarning>
                                {t1?.name || '—'} + {t2?.name || '—'}
                              </td>
                              <td
                                className="font-bold py-2.5 bg-[#f0fdf4]"
                                contentEditable
                                suppressContentEditableWarning
                              >
                                {t1?.name || '—'} + {t3?.name || '—'}
                              </td>
                              <td className="font-bold py-2.5" contentEditable suppressContentEditableWarning>
                                {dIdx === 2
                                  ? 'نصف يوم راحة بيداغوجية (الثلاثاء مساءً)'
                                  : `${t2?.name || '—'} + ${t3?.name || '—'}`}
                              </td>
                              <td
                                className="font-bold py-2.5 bg-[#fff1f2]"
                                contentEditable
                                suppressContentEditableWarning
                              >
                                {dIdx === 2
                                  ? 'الخروج على الساعة 11:15'
                                  : `كافة أساتذة الأفواج المسائية (${t1?.name || ''})`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDocType === 'school_card' && (
                  <div>
                    <table className="timetable-grid mt-2">
                      <thead>
                        <tr className="hours-header">
                          <th>المستوى الدراسي</th>
                          <th>الحجرة الدراسية</th>
                          <th>الأستاذ(ة) المسؤول(ة)</th>
                          <th>الذكور</th>
                          <th>الإناث</th>
                          <th>المجموع</th>
                          <th>المعيدون</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arabicClassGroups.map((g) => {
                          const m = MODELS[g.level];
                          const t = teachers.find((x) => x.id === g.teacherId);
                          const b = g.boys || 0;
                          const gr = g.girls || 0;
                          return (
                            <tr key={g.id}>
                              <td className="font-extrabold py-1.5">{m?.levelTitle}</td>
                              <td>{g.room}</td>
                              <td className="font-bold text-[#094d22]">{t ? t.name : 'غير مسند'}</td>
                              <td className="tabular-nums font-bold">{b}</td>
                              <td className="tabular-nums font-bold">{gr}</td>
                              <td className="tabular-nums font-black text-[#d91424]">{b + gr}</td>
                              <td className="tabular-nums">{g.repeaters || 0}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#e8f5e9] font-black">
                          <td colSpan={3} className="py-2">
                            المجموع العام للمؤسسة
                          </td>
                          <td className="tabular-nums">{totalBoys}</td>
                          <td className="tabular-nums">{totalGirls}</td>
                          <td className="tabular-nums text-[#d91424]">{totalStudents}</td>
                          <td className="tabular-nums">{totalRepeaters}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="footer-signatures mt-6">
                  <div>إمضاء ممثل الأساتذة</div>
                  <div>إمضاء وختم السيد(ة) المدير(ة)</div>
                  <div>مصادقة السيد(ة) مفتش(ة) المقاطعة</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-600 font-bold">
        منصة المدير الرقمية الشاملة للتعليم الابتدائي — منظومة التوقيت الأسبوعي والإسناد العادل (نظام الدوام الواحد) ·{' '}
        <span className="text-[#094d22] font-extrabold">{OFFICIAL_AUTHOR_SIGNATURE}</span> · النقابة الوطنية لعمال التربية (S.N.T.E)
      </footer>
    </div>
  );
}
