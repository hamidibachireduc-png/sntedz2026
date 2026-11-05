import React, { useState, useRef } from 'react';
import {
  Calculator,
  TrendingUp,
  Printer,
  Download,
  Award,
  Clock,
  Landmark,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Teacher, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

interface RankConfig {
  id: string;
  label: string;
  category: number;
  baseIndex: number; // الرقم الاستدلالي القاعدي للصنف (شبكة الوظيف العمومي)
  highPostBonusIndex: number; // الرقم الاستدلالي للمنصب العالي (مدير / ناظر / مفتش)
  qualifRate: number; // نسبة تعويض التأهيل %
  docAllowance: number; // منحة التوثيق التربوي الجزافية
  mgmtBonusRate: number; // تعويض التسيير والمسؤولية الإضافي %
  nextRankId: string;
  nextRankLabel: string;
  examRequiredYears: number; // سنوات الأقدمية المطلوبة للامتحان المهني
  choiceRequiredYears: number; // سنوات الأقدمية المطلوبة للتأهيل (الاختيار)
  integrationRule2554: string; // قاعدة الإدماج في المرسوم التنفيذي 25-54
  promotionCondition: string;
  echelonIndices: number[]; // النقاط الاستدلالية الرسمية للدرجات من 1 إلى 12
}

// توليد جدول الدرجات الـ 12 بدقة وفق الشبكة الاستدلالية الرسمية (5% لكل درجة)
function buildOfficialEchelons(baseIndex: number): number[] {
  return Array.from({ length: 12 }, (_, idx) => Math.round(baseIndex * ((idx + 1) * 0.05)));
}

const RANK_CONFIGS: Record<string, RankConfig> = {
  director_cat15: {
    id: 'director_cat15',
    label: 'مدير مدرسة ابتدائية (الصنف 15 — المرسوم 25-54)',
    category: 15,
    baseIndex: 821,
    highPostBonusIndex: 205, // منصب عالي مدير مدرسة ابتدائية
    qualifRate: 45,
    docAllowance: 3000,
    mgmtBonusRate: 10,
    nextRankId: 'inspector',
    nextRankLabel: 'مفتش التعليم الابتدائي (إدارة المدارس الابتدائية أو البيداغوجيا)',
    examRequiredYears: 5,
    choiceRequiredYears: 8,
    integrationRule2554:
      'يدمج مديرو المدارس الابتدائية الممارسون في الصنف 15 مع الاحتفاظ بأقدميتهم الكاملة والمنصب العالي وفق المرسوم 25-54.',
    promotionCondition:
      'الترقية إلى رتبة مفتش التعليم الابتدائي عن طريق المسابقة المهنية بعد 5 سنوات خدمة فعلية بصفة مدير مدرسة ابتدائية أو عن طريق التأهيل بعد 8 سنوات.',
    echelonIndices: buildOfficialEchelons(821),
  },
  vice_director: {
    id: 'vice_director',
    label: 'مدير مساعد / ناظر مدرسة ابتدائية (الصنف 14)',
    category: 14,
    baseIndex: 737,
    highPostBonusIndex: 135,
    qualifRate: 45,
    docAllowance: 2500,
    mgmtBonusRate: 5,
    nextRankId: 'director_cat15',
    nextRankLabel: 'مدير مدرسة ابتدائية (الصنف 15)',
    examRequiredYears: 3,
    choiceRequiredYears: 5,
    integrationRule2554:
      'يرقى الأساتذة الرئيسيون / قسم ثانٍ المكلفون بالإدارة المساعدة ويصنفون في الصنف 14 مع تعويض المنصب العالي (135 نقطة).',
    promotionCondition:
      'الترقية إلى منصب مدير مدرسة ابتدائية عن طريق الامتحان المهني بعد 3 سنوات خدمة فعلية أو عن طريق التسجيل على قائمة التأهيل بعد 5 سنوات.',
    echelonIndices: buildOfficialEchelons(737),
  },
  مميز: {
    id: 'مميز',
    label: 'أستاذ مميز في التعليم الابتدائي (الصنف 15)',
    category: 15,
    baseIndex: 821,
    highPostBonusIndex: 0,
    qualifRate: 45,
    docAllowance: 3000,
    mgmtBonusRate: 0,
    nextRankId: 'director_cat15',
    nextRankLabel: 'مدير مدرسة ابتدائية / مفتش التعليم الابتدائي',
    examRequiredYears: 3,
    choiceRequiredYears: 5,
    integrationRule2554:
      'رتبة مستحدثة بموجب المرسوم التنفيذي 25-54 (الصنف 15) يدمج فيها الأساتذة المكونون سابقاً وحاملو الشهادات العليا والأقدمية المشترطة.',
    promotionCondition:
      'تفتح رتبة أستاذ مميز الحق المباشر في الترشح لمناصب مدير مدرسة ابتدائية أو مفتش التعليم الابتدائي.',
    echelonIndices: buildOfficialEchelons(821),
  },
  'قسم ثان': {
    id: 'قسم ثان',
    label: 'أستاذ قسم ثانٍ في التعليم الابتدائي (الصنف 14)',
    category: 14,
    baseIndex: 737,
    highPostBonusIndex: 0,
    qualifRate: 45,
    docAllowance: 2500,
    mgmtBonusRate: 0,
    nextRankId: 'مميز',
    nextRankLabel: 'أستاذ مميز في التعليم الابتدائي (الصنف 15)',
    examRequiredYears: 5,
    choiceRequiredYears: 7,
    integrationRule2554:
      'يدمج فيها الأساتذة المكونون/الرئيسيون المستوفون للشروط القانونية وفق أحكام الإدماج الانتقالية للمرسوم 25-54.',
    promotionCondition:
      'الترقية إلى رتبة أستاذ مميز (الصنف 15) بعد 5 سنوات خدمة فعلية عن طريق الامتحان المهني أو 7 سنوات عن طريق التسجيل على قائمة التأهيل.',
    echelonIndices: buildOfficialEchelons(737),
  },
  'قسم أول': {
    id: 'قسم أول',
    label: 'أستاذ قسم أول في التعليم الابتدائي (الصنف 13)',
    category: 13,
    baseIndex: 653,
    highPostBonusIndex: 0,
    qualifRate: 40,
    docAllowance: 2500,
    mgmtBonusRate: 0,
    nextRankId: 'قسم ثان',
    nextRankLabel: 'أستاذ قسم ثانٍ في التعليم الابتدائي (الصنف 14)',
    examRequiredYears: 5,
    choiceRequiredYears: 7,
    integrationRule2554:
      'يدمج فيها الأساتذة الرئيسيون سابقاً وأساتذة التعليم الابتدائي المستوفون للأقدمية القانونية وفق المرسوم 25-54.',
    promotionCondition:
      'الترقية إلى رتبة أستاذ قسم ثانٍ (الصنف 14) بعد 5 سنوات خدمة فعلية عن طريق الامتحان المهني أو 7 سنوات عن طريق التسجيل على قائمة التأهيل.',
    echelonIndices: buildOfficialEchelons(653),
  },
  'تعليم ابتدائي': {
    id: 'تعليم ابتدائي',
    label: 'أستاذ تعليم ابتدائي (الصنف 12)',
    category: 12,
    baseIndex: 578,
    highPostBonusIndex: 0,
    qualifRate: 40,
    docAllowance: 2000,
    mgmtBonusRate: 0,
    nextRankId: 'قسم أول',
    nextRankLabel: 'أستاذ قسم أول في التعليم الابتدائي (الصنف 13)',
    examRequiredYears: 4,
    choiceRequiredYears: 7,
    integrationRule2554:
      'رتبة القاعدة في سلك أساتذة التعليم الابتدائي مصنفة في الصنف 12 (الرقم الاستدلالي 578).',
    promotionCondition:
      'الترقية إلى رتبة أستاذ قسم أول (الصنف 13) بعد 4 سنوات خدمة فعلية عن طريق الامتحان المهني أو 7 سنوات عن طريق الاختيار والتأهيل.',
    echelonIndices: buildOfficialEchelons(578),
  },
  inspector: {
    id: 'inspector',
    label: 'مفتش التعليم الابتدائي / المتوسط (خارج الصنف ق1 / الصنف 16)',
    category: 16,
    baseIndex: 913,
    highPostBonusIndex: 260,
    qualifRate: 50,
    docAllowance: 3500,
    mgmtBonusRate: 15,
    nextRankId: 'inspector',
    nextRankLabel: 'مفتش عام للتربية الوطنية',
    examRequiredYears: 6,
    choiceRequiredYears: 10,
    integrationRule2554:
      'أعلى رتبة تفتيش وبيداغوجيا وإدارة وفق المرسوم التنفيذي 25-54.',
    promotionCondition: 'الترقية إلى رتبة مفتش عام للتربية الوطنية وفق الشروط التنظيمية السارية.',
    echelonIndices: buildOfficialEchelons(913),
  },
  cem_director: {
    id: 'cem_director',
    label: 'مدير متوسطة — آمر بالصرف رئيسي (الصنف 16 — المرسوم 25-54)',
    category: 16,
    baseIndex: 913,
    highPostBonusIndex: 245,
    qualifRate: 50,
    docAllowance: 3500,
    mgmtBonusRate: 12,
    nextRankId: 'inspector',
    nextRankLabel: 'مفتش التعليم المتوسط (إدارة ومالية أو بيداغوجيا)',
    examRequiredYears: 5,
    choiceRequiredYears: 8,
    integrationRule2554:
      'يصنف مدير المتوسطة في الصنف 16 مع تعويض المنصب العالي وصفة الآمر بالصرف الرئيسي لميزانية المتوسطة.',
    promotionCondition:
      'الترقية إلى رتبة مفتش التعليم المتوسط عن طريق المسابقة المهنية بعد 5 سنوات خدمة فعلية بصفة مدير متوسطة.',
    echelonIndices: buildOfficialEchelons(913),
  },
  lycee_director: {
    id: 'lycee_director',
    label: 'مدير ثانوية — آمر بالصرف رئيسي (الصنف 17 / خارج الصنف ق1 — 25-54)',
    category: 17,
    baseIndex: 990,
    highPostBonusIndex: 295,
    qualifRate: 50,
    docAllowance: 4000,
    mgmtBonusRate: 15,
    nextRankId: 'inspector',
    nextRankLabel: 'مفتش التربية الوطنية (إدارة الثانويات)',
    examRequiredYears: 5,
    choiceRequiredYears: 8,
    integrationRule2554:
      'يصنف مدير الثانوية في خارج الصنف (ق1 / الصنف 17) مع تعويض المنصب العالي وصفة الآمر بالصرف الرئيسي لميزانية الثانوية.',
    promotionCondition:
      'الترقية إلى رتبة مفتش التربية الوطنية بعد 5 سنوات خدمة فعلية بصفة مدير ثانوية.',
    echelonIndices: buildOfficialEchelons(990),
  },
  lycee_censor: {
    id: 'lycee_censor',
    label: 'ناظر ثانوية (الصنف 16 — المرسوم 25-54)',
    category: 16,
    baseIndex: 913,
    highPostBonusIndex: 185,
    qualifRate: 50,
    docAllowance: 3500,
    mgmtBonusRate: 8,
    nextRankId: 'lycee_director',
    nextRankLabel: 'مدير ثانوية (آمر بالصرف رئيسي)',
    examRequiredYears: 4,
    choiceRequiredYears: 7,
    integrationRule2554:
      'يتولى ناظر الثانوية التنسيق البيداغوجي وإعداد جداول التوقيت الأسبوعي في التعليم الثانوي تحت إشراف المدير.',
    promotionCondition:
      'الترقية إلى رتبة مدير ثانوية عن طريق الامتحان المهني بعد 4 سنوات أو التأهيل بعد 7 سنوات.',
    echelonIndices: buildOfficialEchelons(913),
  },
  cem_prof_distinguished: {
    id: 'cem_prof_distinguished',
    label: 'أستاذ مميز في التعليم المتوسط (الصنف 16 — المرسوم 25-54)',
    category: 16,
    baseIndex: 913,
    highPostBonusIndex: 0,
    qualifRate: 50,
    docAllowance: 3500,
    mgmtBonusRate: 0,
    nextRankId: 'cem_director',
    nextRankLabel: 'مدير متوسطة / مفتش التعليم المتوسط',
    examRequiredYears: 4,
    choiceRequiredYears: 6,
    integrationRule2554:
      'أعلى رتبة تدريس في الطور المتوسط بموجب المرسوم التنفيذي 25-54.',
    promotionCondition: 'تفتح الحق للترشح لمناصب مدير متوسطة أو مفتش التعليم المتوسط.',
    echelonIndices: buildOfficialEchelons(913),
  },
  lycee_prof_distinguished: {
    id: 'lycee_prof_distinguished',
    label: 'أستاذ مميز في التعليم الثانوي (الصنف 17 / ق1 — المرسوم 25-54)',
    category: 17,
    baseIndex: 990,
    highPostBonusIndex: 0,
    qualifRate: 50,
    docAllowance: 4000,
    mgmtBonusRate: 0,
    nextRankId: 'lycee_director',
    nextRankLabel: 'ناظر ثانوية / مدير ثانوية / مفتش التربية الوطنية',
    examRequiredYears: 4,
    choiceRequiredYears: 6,
    integrationRule2554:
      'أعلى رتبة تدريس في الطور الثانوي بموجب المرسوم التنفيذي 25-54.',
    promotionCondition: 'تفتح الحق للترشح لمناصب ناظر ثانوية، مدير ثانوية، أو مفتش التربية الوطنية.',
    echelonIndices: buildOfficialEchelons(990),
  },
  bursar_principal: {
    id: 'bursar_principal',
    label: 'مقتصد رئيسي — محاسب عمومي للمتوسطة/الثانوية (الصنف 14)',
    category: 14,
    baseIndex: 737,
    highPostBonusIndex: 120,
    qualifRate: 45,
    docAllowance: 2500,
    mgmtBonusRate: 10,
    nextRankId: 'inspector',
    nextRankLabel: 'مفتش التسيير المالي والمادي',
    examRequiredYears: 5,
    choiceRequiredYears: 8,
    integrationRule2554:
      'يتولى المقتصد مهام المحاسب العمومي للمؤسسة في إطار مبدأ الفصل بين الآمر بالصرف والمحاسب.',
    promotionCondition: 'الترقية إلى رتبة مفتش التسيير المالي والمادي بعد استيفاء الأقدمية القانونية.',
    echelonIndices: buildOfficialEchelons(737),
  },
};

// دالة حساب الضريبة على الدخل الإجمالي IRG وفق السلم الضريبي الجزائري الساري (مع الإعفاء حتى 30,000 دج)
function calculateAlgerianIRG(taxableNet: number): number {
  if (taxableNet <= 30000) return 0;

  // حساب الضريبة الخام حسب الشرائح الشهرية
  let rawTax = 0;
  if (taxableNet > 20000) {
    const slice1 = Math.min(taxableNet, 40000) - 20000;
    rawTax += slice1 * 0.23;
  }
  if (taxableNet > 40000) {
    const slice2 = Math.min(taxableNet, 80000) - 40000;
    rawTax += slice2 * 0.27;
  }
  if (taxableNet > 80000) {
    const slice3 = Math.min(taxableNet, 160000) - 80000;
    rawTax += slice3 * 0.30;
  }
  if (taxableNet > 160000) {
    const slice4 = Math.min(taxableNet, 320000) - 160000;
    rawTax += slice4 * 0.33;
  }
  if (taxableNet > 320000) {
    rawTax += (taxableNet - 320000) * 0.35;
  }

  // التخفيض الضريبي القانوني (Abattement 40% محصور بين 1000 دج و1500 دج شهرياً)
  const abatement = Math.min(1500, Math.max(1000, rawTax * 0.4));
  let taxAfterAbatement = Math.max(0, rawTax - abatement);

  // تخفيض إضافي للأجور الخاضعة بين 30,000 دج و 35,000 دج
  if (taxableNet > 30000 && taxableNet < 35000) {
    taxAfterAbatement = taxAfterAbatement * ((137 / 51) - (27925 / (8 * taxableNet)));
  }

  return Math.max(0, Math.round(taxAfterAbatement / 10) * 10);
}

// دالة حساب الفرق الدقيق بين تاريخين بالسنوات والأشهر والأيام
function calculateExactYMD(startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return { years: 0, months: 0, days: 0, totalMonths: 0, totalDays: 0 };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months + Math.round(days / 30);
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { years, months, days, totalMonths, totalDays };
}

interface SalaryAndPromotionSimulatorProps {
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  teachers: Teacher[];
  logoUrl: string;
}

export default function SalaryAndPromotionSimulator({
  institution,
  teachers,
  logoUrl,
}: SalaryAndPromotionSimulatorProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sub-tabs: 'payslip' | 'echelons_seniority' | 'rank_promotion' | 'retirement_cnr'
  const [activeTab, setActiveTab] = useState<
    'payslip' | 'echelons_seniority' | 'rank_promotion' | 'retirement_cnr'
  >('payslip');

  // Core Employee & Career State
  const [employeeName, setEmployeeName] = useState<string>(institution.directorName || 'حميدي البشير');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState<string>('1979-04-15');
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('director_cat15');
  const [echelon, setEchelon] = useState<number>(7);
  const [installDate, setInstallDate] = useState<string>('2009-09-01');
  const [currentRankDate, setCurrentRankDate] = useState<string>('2019-09-01');
  const [lastEchelonDate, setLastEchelonDate] = useState<string>('2024-09-01');
  const [calcRefDate, setCalcRefDate] = useState<string>('2026-11-04');

  // Seniority & Evaluation Add-ons
  const [reliquatMonths, setReliquatMonths] = useState<number>(4); // باقي الأقدمية المحتفظ بها بالأشهر
  const [reliquatDays, setReliquatDays] = useState<number>(15); // باقي الأقدمية بالأيام
  const [bonusServiceYears, setBonusServiceYears] = useState<number>(1); // سنوات الخدمة الوطنية / الاستخلاف / الجنوب
  const [adminMark, setAdminMark] = useState<number>(19.5); // النقطة الإدارية / 20
  const [inspectorMark, setInspectorMark] = useState<number>(18.5); // النقطة التربوية / 20
  const [promotionPace, setPromotionPace] = useState<'min' | 'med' | 'max'>('min');

  // Allowances & Deductions Options
  const [iepMethod, setIepMethod] = useState<'by_years_14' | 'by_echelon'>('by_years_14');
  const [childrenCount, setChildrenCount] = useState<number>(3);
  const [singleIncomeSpouse, setSingleIncomeSpouse] = useState<boolean>(true);
  const [zoneBonusPercent, setZoneBonusPercent] = useState<number>(7); // منحة المنطقة الجغرافية
  const [housingAllowance, setHousingAllowance] = useState<number>(2000); // تعويض السكن / الامتياز
  const [rendementRate, setRendementRate] = useState<number>(40);
  const [mutualDeduction, setMutualDeduction] = useState<boolean>(true); // اقتطاع التعاضدية 1%

  // Retirement Specific Options
  const [eduAgeReductionYears, setEduAgeReductionYears] = useState<number>(3); // تخفيض سن التقاعد لقطاع التربية (0 / 3 / 5 سنوات)
  const [dependentSpousePension, setDependentSpousePension] = useState<boolean>(true); // منحة الزوج المكفول في التقاعد (2500 دج)

  const handleSelectTeacherFromSchool = (tId: string) => {
    if (tId === 'director_self') {
      setEmployeeName(institution.directorName);
      setSelectedRoleKey('director_cat15');
      setEchelon(7);
      setInstallDate('2009-09-01');
      setCurrentRankDate('2019-09-01');
      setLastEchelonDate('2024-09-01');
      setGender('male');
      return;
    }
    const t = teachers.find((x) => x.id === tId);
    if (!t) return;
    setEmployeeName(t.name);
    setSelectedRoleKey(RANK_CONFIGS[t.rank] ? t.rank : 'قسم أول');
    setInstallDate(t.installDate || '2016-09-01');
    setCurrentRankDate(t.installDate || '2018-09-01');
    const years = Math.max(0, 2026 - Number((t.installDate || '2016').slice(0, 4)));
    setEchelon(Math.min(12, Math.max(1, Math.floor(years / 2.5))));
  };

  const config = RANK_CONFIGS[selectedRoleKey] || RANK_CONFIGS['director_cat15'];
  const nextRankConfig = RANK_CONFIGS[config.nextRankId] || RANK_CONFIGS['inspector'];
  const POINT_VALUE = 45; // قيمة النقطة الاستدلالية الرسمية 45 دج

  // 1. حساب الأقدمية العامة الدقيقة (بالسنة والشهر واليوم)
  const rawSeniority = calculateExactYMD(installDate, calcRefDate);
  const totalEffectiveYears = rawSeniority.years + bonusServiceYears;
  const rankSeniority = calculateExactYMD(currentRankDate, calcRefDate);
  const currentEchelonElapsed = calculateExactYMD(lastEchelonDate, calcRefDate);

  // إجمالي الأشهر المتجمعة في الدرجة الحالية شاملة باقي الأقدمية المحتفظ بها (Reliquat)
  const totalAccumulatedMonthsInEchelon =
    currentEchelonElapsed.totalMonths + reliquatMonths + Math.floor(reliquatDays / 30);

  // 2. دالة حساب مفردات الراتب لأي رتبة وأي درجة
  const computeFullSalaryFor = (targetConfig: RankConfig, targetEchelon: number) => {
    const baseSal = targetConfig.baseIndex * POINT_VALUE;
    const echIdx =
      targetEchelon > 0
        ? targetConfig.echelonIndices[Math.min(11, targetEchelon - 1)] ||
          Math.round(targetConfig.baseIndex * targetEchelon * 0.05)
        : 0;
    const echAmt = echIdx * POINT_VALUE; // تعويض الخبرة المهنية (نقاط الدرجة)
    const highPostAmt = targetConfig.highPostBonusIndex * POINT_VALUE; // تعويض المنصب العالي
    const mainPrincipalSal = baseSal + echAmt + highPostAmt; // الأجر الرئيسي

    // تعويض الخبرة البيداغوجية IEP: إما 1.4% عن كل سنة خدمة فعلية أو 4% عن كل درجة (سقف 60%)
    const iepRatePercent =
      iepMethod === 'by_years_14'
        ? Math.min(60, Number((totalEffectiveYears * 1.4).toFixed(2)))
        : Math.min(60, targetEchelon * 4);
    const iepBonusAmt = Math.round(mainPrincipalSal * (iepRatePercent / 100));

    // العلاوات البيداغوجية والتأهيل
    const qualifAmt = Math.round(mainPrincipalSal * (targetConfig.qualifRate / 100));
    const pedaSpecAmt = Math.round(mainPrincipalSal * 0.25); // التعويض البيداغوجي الخاص 25%
    const supportAmt = Math.round(mainPrincipalSal * 0.15); // الدعم المدرسي والمعالجة 15%
    const mgmtAmt = Math.round(mainPrincipalSal * (targetConfig.mgmtBonusRate / 100));
    const docAmt = targetConfig.docAllowance;
    const zoneAmt = Math.round(baseSal * (zoneBonusPercent / 100));

    const grossSubjectToSS =
      mainPrincipalSal +
      iepBonusAmt +
      qualifAmt +
      pedaSpecAmt +
      supportAmt +
      mgmtAmt +
      docAmt +
      zoneAmt;

    const ssDeduction = Math.round(grossSubjectToSS * 0.09); // الضمان الاجتماعي والتقاعد 9%
    const taxableIncome = grossSubjectToSS - ssDeduction;
    const irgDeduction = calculateAlgerianIRG(taxableIncome);
    const mutualAmt = mutualDeduction ? Math.round(grossSubjectToSS * 0.01) : 0;

    const familyAmt = childrenCount * 300 + (singleIncomeSpouse ? 800 : 0) + housingAllowance;
    const netMonthly = taxableIncome - irgDeduction - mutualAmt + familyAmt;

    // المردودية الفصلية (كل 3 أشهر)
    const rendementGross = Math.round(mainPrincipalSal * 3 * (rendementRate / 100));
    const rendementSS = Math.round(rendementGross * 0.09);
    const rendementIRG = Math.round((rendementGross - rendementSS) * 0.1); // اقتطاع ضريبي 10% للمردودية
    const rendementNet = rendementGross - rendementSS - rendementIRG;

    return {
      baseSal,
      echIdx,
      echAmt,
      highPostAmt,
      mainPrincipalSal,
      iepRatePercent,
      iepBonusAmt,
      qualifAmt,
      pedaSpecAmt,
      supportAmt,
      mgmtAmt,
      docAmt,
      zoneAmt,
      grossSubjectToSS,
      ssDeduction,
      taxableIncome,
      irgDeduction,
      mutualAmt,
      familyAmt,
      netMonthly,
      rendementGross,
      rendementNet,
      totalIndex: targetConfig.baseIndex + echIdx + targetConfig.highPostBonusIndex,
    };
  };

  const currentSalary = computeFullSalaryFor(config, echelon);
  const nextEchelon = Math.min(12, echelon + 1);
  const nextEchelonSalary = computeFullSalaryFor(config, nextEchelon);
  const nextEchelonNetGain = nextEchelonSalary.netMonthly - currentSalary.netMonthly;

  // محاكاة الراتب عند الترقية للرتبة الأعلى
  const promotedRankSalary = computeFullSalaryFor(nextRankConfig, echelon);
  const promotedRankNetGain = promotedRankSalary.netMonthly - currentSalary.netMonthly;

  // 3. حساب تاريخ استحقاق الدرجة الموالية بدقة مع خصم باقي الأقدمية (Reliquat)
  const paceRequiredMonths = promotionPace === 'min' ? 30 : promotionPace === 'med' ? 36 : 42;
  const effectiveMonthsNeededFromLastDate = Math.max(0, paceRequiredMonths - reliquatMonths);
  const nextPromotionDateObj = new Date(lastEchelonDate || '2024-09-01');
  nextPromotionDateObj.setMonth(nextPromotionDateObj.getMonth() + effectiveMonthsNeededFromLastDate);
  nextPromotionDateObj.setDate(nextPromotionDateObj.getDate() - reliquatDays);
  const nextPromotionDateStr = nextPromotionDateObj.toISOString().slice(0, 10);

  const remainingMonthsForNextEchelon = Math.max(0, paceRequiredMonths - totalAccumulatedMonthsInEchelon);
  const totalEvalScore = Number((adminMark + inspectorMark).toFixed(2)); // المجموع من 40

  // 4. حساب التقاعد ومعاش الصندوق الوطني للتقاعد CNR وفق القوانين الجديدة
  const employeeAge = calculateExactYMD(birthDate, calcRefDate);
  const baseLegalRetirementAge = gender === 'male' ? 60 : 55;
  const maternityReduction = gender === 'female' ? Math.min(3, childrenCount) : 0;
  const effectiveRetirementAge = Math.max(
    50,
    baseLegalRetirementAge - eduAgeReductionYears - maternityReduction
  );
  const yearsUntilRetirementAge = Math.max(0, effectiveRetirementAge - employeeAge.years);
  const projectedRetirementYear = new Date(calcRefDate).getFullYear() + yearsUntilRetirementAge;

  // نسبة تصفية المعاش (2.5% عن كل سنة خدمة بحد أقصى 80% أي 32 سنة)
  const pensionableYears = Math.min(32, totalEffectiveYears + rawSeniority.months / 12);
  const pensionLiquidationRate = Math.min(80, Number((pensionableYears * 2.5).toFixed(2)));

  // الأجر المرجعي للتقاعد (متوسط الأجر الخاضع للاشتراك بعد طرح الضمان الاجتماعي 9%)
  const cnrReferenceSalary = currentSalary.taxableIncome;
  const grossMonthlyPension = Math.round(cnrReferenceSalary * (pensionLiquidationRate / 100));
  const pensionSecurityDeduction = Math.round(grossMonthlyPension * 0.02); // اقتطاع 2% للمتقاعدين
  const pensionTaxable = grossMonthlyPension - pensionSecurityDeduction;
  // إعفاء/تخفيض ضريبي للمعاشات
  const pensionIRG = pensionTaxable <= 30000 ? 0 : Math.round(calculateAlgerianIRG(pensionTaxable) * 0.5);
  const spouseAllowanceCNR = dependentSpousePension ? 2500 : 0;
  const netMonthlyPension = pensionTaxable - pensionIRG + spouseAllowanceCNR;

  // منحة نهاية الخدمة والتقاعد التقريبية (الخدمات الاجتماعية + التعاضدية)
  const endOfServiceGrant = Math.round(currentSalary.netMonthly * 6.5);

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#117a37]" />
            <span>
              المحاكي الخبير للرواتب والدرجات والأقدمية وتعويض الخبرة والترقية والتقاعد (المرسوم 25-54)
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            منظومة حسابية وتشريعية دقيقة (النقطة الاستدلالية 45 دج · الشبكة الاستدلالية الكاملة للدرجات الـ 12 · الأقدمية باليوم والشهر والسنة · حساب التقاعد CNR)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(
                sheetRef.current,
                `كشف_محاكاة_الراتب_والترقية_والتقاعد_${employeeName}`,
                'landscape'
              )
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل التقرير الكامل (PDF)</span>
          </button>
          <button
            onClick={() =>
              triggerPrintOrPdf(
                `كشف_محاكاة_الراتب_والترقية_والتقاعد_${employeeName}`,
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

      {/* 4 Professional Sub-Tabs */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('payslip')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'payslip'
              ? 'bg-[#094d22] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. كشف الراتب التفصيلي وتعويض الخبرة (IEP) والمردودية</span>
        </button>

        <button
          onClick={() => setActiveTab('echelons_seniority')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'echelons_seniority'
              ? 'bg-[#117a37] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. حاسبة الأقدمية الدقيقة وشبكة الدرجات الـ 12 والوتائر</span>
        </button>

        <button
          onClick={() => setActiveTab('rank_promotion')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'rank_promotion'
              ? 'bg-[#d91424] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>3. محاكي الترقية في الرتبة والإدماج (المرسوم 25-54)</span>
        </button>

        <button
          onClick={() => setActiveTab('retirement_cnr')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'retirement_cnr'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>4. حاسبة التقاعد والمعاش الصافي (CNR) وفق القوانين الجديدة</span>
        </button>
      </div>

      {/* Main Layout: Parameter Controls Panel + Active Simulator View */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-5 items-start">
        {/* Right Sidebar: Comprehensive Employee Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-black text-[#094d22]">البيانات المهنية والإدارية للموظف(ة)</h3>
            <span className="text-[11px] font-black text-[#d91424] bg-red-50 px-2 py-0.5 rounded">
              النقطة = 45 دج
            </span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#117a37] mb-1">
              استيراد سريع من قائمة موظفي المدرسة:
            </label>
            <select
              onChange={(e) => handleSelectTeacherFromSchool(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-slate-50"
            >
              <option value="director_self">السيد(ة) المدير(ة): {institution.directorName}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.rank})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">اسم ولقب الموظف(ة):</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">الجنس:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#094d22] mb-1">
              الرتبة / المنصب الحالي (المرسوم التنفيذي 25-54):
            </label>
            <select
              value={selectedRoleKey}
              onChange={(e) => setSelectedRoleKey(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
            >
              {Object.values(RANK_CONFIGS).map((rc) => (
                <option key={rc.id} value={rc.id}>
                  {rc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">
                الدرجة الحالية (Échelon {echelon}):
              </label>
              <select
                value={echelon}
                onChange={(e) => setEchelon(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white tabular-nums"
              >
                {Array.from({ length: 13 }, (_, i) => i).map((num) => (
                  <option key={num} value={num}>
                    {num === 0
                      ? 'الدرجة 0 (متربص)'
                      : `الدرجة ${num} (+${config.echelonIndices[num - 1]} نقطة)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">وتيرة الترقية في الدرجة:</label>
              <select
                value={promotionPace}
                onChange={(e) => setPromotionPace(e.target.value as 'min' | 'med' | 'max')}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="min">الدنيا (سنتان و 6 أشهر — 30 ش)</option>
                <option value="med">المتوسطة (3 سنوات — 36 ش)</option>
                <option value="max">القصوى (3 سنوات و 6 أشهر — 42 ش)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">تاريخ الميلاد:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">تاريخ أول توظيف بالقطاع:</label>
              <input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">تاريخ التعيين في الرتبة الحالية:</label>
              <input
                type="date"
                value={currentRankDate}
                onChange={(e) => setCurrentRankDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">تاريخ سريان الدرجة ({echelon}):</label>
              <input
                type="date"
                value={lastEchelonDate}
                onChange={(e) => setLastEchelonDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>
          </div>

          {/* Reliquat & Bonus Seniority */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="text-[11px] font-black text-[#094d22]">
              باقي الأقدمية المحتفظ بها (Reliquat) وسنوات الامتياز:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">باقي الأشهر:</label>
                <input
                  type="number"
                  min={0}
                  max={29}
                  value={reliquatMonths}
                  onChange={(e) => setReliquatMonths(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">باقي الأيام:</label>
                <input
                  type="number"
                  min={0}
                  max={29}
                  value={reliquatDays}
                  onChange={(e) => setReliquatDays(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">سنوات إضافية:</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={bonusServiceYears}
                  onChange={(e) => setBonusServiceYears(Number(e.target.value))}
                  title="سنوات الخدمة الوطنية أو الجنوب أو العقود المحتسبة"
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold text-center tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* IEP & Allowances Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">طريقة حساب IEP البيداغوجي:</label>
              <select
                value={iepMethod}
                onChange={(e) => setIepMethod(e.target.value as 'by_years_14' | 'by_echelon')}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold bg-white"
              >
                <option value="by_years_14">1.40% عن كل سنة أقدمية</option>
                <option value="by_echelon">4.00% عن كل درجة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">نسبة المردودية الفصلية:</label>
              <select
                value={rendementRate}
                onChange={(e) => setRendementRate(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white tabular-nums"
              >
                <option value={40}>40% (علامة كاملة)</option>
                <option value={35}>35%</option>
                <option value={30}>30%</option>
                <option value={25}>25%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">عدد الأولاد:</label>
              <input
                type="number"
                min={0}
                max={12}
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-center tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">منحة المنطقة (%):</label>
              <input
                type="number"
                min={0}
                max={35}
                value={zoneBonusPercent}
                onChange={(e) => setZoneBonusPercent(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-center tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">منحة السكن (دج):</label>
              <input
                type="number"
                step={500}
                min={0}
                max={10000}
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-center tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={singleIncomeSpouse}
                onChange={(e) => setSingleIncomeSpouse(e.target.checked)}
                className="accent-[#117a37]"
              />
              <span>الاستفادة من منحة الأجر الوحيد (800 دج)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mutualDeduction}
                onChange={(e) => setMutualDeduction(e.target.checked)}
                className="accent-[#117a37]"
              />
              <span>اقتطاع التعاضدية لعمال التربية (1%)</span>
            </label>
          </div>
        </div>

        {/* Left Main Content Area: Dynamic Views according to Active Tab */}
        <div className="space-y-5">
          {/* Top 4 Global KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-gradient-to-br from-[#073818] to-[#117a37] text-white rounded-xl p-4 shadow">
              <div className="text-[11px] font-bold text-yellow-200">الصافي الشهري للدفع (Net)</div>
              <div className="text-2xl font-black mt-1 tabular-nums">
                {currentSalary.netMonthly.toLocaleString('ar-DZ')} دج
              </div>
              <div className="text-[11px] text-white/90 mt-1 tabular-nums">
                الصنف {config.category} · مجموع النقاط: {currentSalary.totalIndex}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">الأقدمية العامة الدقيقة</div>
              <div className="text-lg font-black text-[#094d22] mt-1 tabular-nums">
                {totalEffectiveYears} سنة و {rawSeniority.months} شهر و {rawSeniority.days} يوم
              </div>
              <div className="text-[11px] text-[#117a37] font-bold mt-1 tabular-nums">
                نسبة الخبرة IEP: {currentSalary.iepRatePercent}% (+{currentSalary.echIdx} نقطة درجة)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">استحقاق الدرجة الموالية ({nextEchelon})</div>
              <div className="text-lg font-black text-[#d91424] mt-1 tabular-nums">
                {nextPromotionDateStr}
              </div>
              <div className="text-[11px] text-slate-600 font-bold mt-1 tabular-nums">
                بزيادة صافية: +{nextEchelonNetGain.toLocaleString('ar-DZ')} دج/شهرياً
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] font-black text-amber-900">معاش التقاعد الصافي التقديري (CNR)</div>
              <div className="text-xl font-black text-[#094d22] mt-1 tabular-nums">
                {netMonthlyPension.toLocaleString('ar-DZ')} دج
              </div>
              <div className="text-[11px] text-amber-800 font-bold mt-1 tabular-nums">
                بنسبة تصفية {pensionLiquidationRate}% (سن التقاعد: {effectiveRetirementAge} سنة)
              </div>
            </div>
          </div>

          {/* TAB 1: DETAILED PAYSLIP & IEP & RENDEMENT */}
          {activeTab === 'payslip' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-black text-[#094d22]">
                    كشف الراتب الشهري المفصل وتعويض الخبرة المهنية والبيداغوجية (المرسوم 25-54)
                  </h4>
                  <p className="text-xs text-slate-500">
                    محسوب وفق قيمة النقطة الاستدلالية (45 دج) وسلم الضريبة على الدخل الإجمالي IRG المحين
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#e8f5e9] text-[#094d22] text-xs font-black tabular-nums">
                  المردودية الصافية (كل 3 أشهر): {currentSalary.rendementNet.toLocaleString('ar-DZ')} دج
                </span>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                    <th className="py-2.5 px-3">رمز العنصر وبيان الراتب / التعويض</th>
                    <th className="py-2.5 px-3">القاعدة الاستدلالية / النسبة القانونية</th>
                    <th className="py-2.5 px-3">المبلغ الخام المستحق (دج)</th>
                    <th className="py-2.5 px-3">مبلغ الاقتطاع (دج)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-extrabold text-slate-900">
                      1. الأجر القاعدي للصنف (Salaire de Base)
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      الصنف {config.category} ({config.baseIndex} نقطة × 45 دج)
                    </td>
                    <td className="py-2 px-3 font-black text-[#094d22] tabular-nums">
                      {currentSalary.baseSal.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr className="bg-emerald-50/40">
                    <td className="py-2 px-3 font-extrabold text-[#094d22]">
                      2. تعويض الخبرة المهنية — الدرجة الحالية (Échelon {echelon})
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      +{currentSalary.echIdx} نقطة استدلالية × 45 دج
                    </td>
                    <td className="py-2 px-3 font-black text-[#117a37] tabular-nums">
                      {currentSalary.echAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  {currentSalary.highPostAmt > 0 && (
                    <tr className="bg-amber-50/60">
                      <td className="py-2 px-3 font-extrabold text-amber-900">
                        3. تعويض المنصب العالي (الإدارة المدرسية / التفتيش)
                      </td>
                      <td className="py-2 px-3 font-bold tabular-nums">
                        +{config.highPostBonusIndex} نقطة استدلالية × 45 دج
                      </td>
                      <td className="py-2 px-3 font-black text-amber-900 tabular-nums">
                        {currentSalary.highPostAmt.toLocaleString('ar-DZ')}
                      </td>
                      <td className="py-2 px-3 text-slate-400">—</td>
                    </tr>
                  )}

                  <tr className="bg-slate-50 font-black">
                    <td className="py-2 px-3 text-[#094d22]">= مجموع الأجر الرئيسي (Salaire Principal)</td>
                    <td className="py-2 px-3 tabular-nums">
                      إجمالي النقاط: {currentSalary.totalIndex} نقطة
                    </td>
                    <td className="py-2 px-3 text-[#094d22] tabular-nums">
                      {currentSalary.mainPrincipalSal.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold">
                      4. تعويض الخبرة البيداغوجية (IEP Pédagogique)
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      بنسبة {currentSalary.iepRatePercent}% من الأجر الرئيسي ({totalEffectiveYears} سنة)
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      {currentSalary.iepBonusAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold">5. تعويض التأهيل (Indemnité de Qualification)</td>
                    <td className="py-2 px-3 font-bold tabular-nums">بنسبة {config.qualifRate}% من الأجر الرئيسي</td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      {currentSalary.qualifAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold">6. التعويض البيداغوجي الخاص (ISP 25%)</td>
                    <td className="py-2 px-3 font-bold tabular-nums">25% من الأجر الرئيسي</td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      {currentSalary.pedaSpecAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold">7. تعويض الدعم المدرسي والمعالجة البيداغوجية (15%)</td>
                    <td className="py-2 px-3 font-bold tabular-nums">15% من الأجر الرئيسي</td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      {currentSalary.supportAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold">
                      8. منحة التوثيق التربوي + تعويض المنطقة ({zoneBonusPercent}%) + التسيير
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">توثيق {config.docAllowance} دج + منطقة</td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      {(currentSalary.docAmt + currentSalary.zoneAmt + currentSalary.mgmtAmt).toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr className="bg-slate-100 font-black">
                    <td className="py-2 px-3 text-slate-900">الأجر الخام الخاضع للضمان الاجتماعي (Brut Imposable SS)</td>
                    <td className="py-2 px-3">وعاء الاقتطاع (100%)</td>
                    <td className="py-2 px-3 text-slate-900 tabular-nums">
                      {currentSalary.grossSubjectToSS.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr className="bg-rose-50/60">
                    <td className="py-2 px-3 font-bold text-[#d91424]">
                      9. اقتطاع الضمان الاجتماعي والتقاعد (CNAS / CNR)
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">نسبة قانونية 9%</td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                    <td className="py-2 px-3 font-black text-[#d91424] tabular-nums">
                      -{currentSalary.ssDeduction.toLocaleString('ar-DZ')}
                    </td>
                  </tr>

                  <tr className="bg-rose-50/60">
                    <td className="py-2 px-3 font-bold text-[#d91424]">
                      10. الضريبة على الدخل الإجمالي (IRG Barème) + التعاضدية
                    </td>
                    <td className="py-2 px-3 font-bold tabular-nums">
                      IRG: {currentSalary.irgDeduction.toLocaleString('ar-DZ')} دج | تعاضدية:{' '}
                      {currentSalary.mutualAmt.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                    <td className="py-2 px-3 font-black text-[#d91424] tabular-nums">
                      -{(currentSalary.irgDeduction + currentSalary.mutualAmt).toLocaleString('ar-DZ')}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-bold text-[#094d22]">
                      11. المنح العائلية ({childrenCount} أولاد) + الأجر الوحيد + منحة السكن
                    </td>
                    <td className="py-2 px-3 font-bold">غير خاضعة للاقتطاع الضريبي</td>
                    <td className="py-2 px-3 font-black text-[#117a37] tabular-nums">
                      +{currentSalary.familyAmt.toLocaleString('ar-DZ')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">—</td>
                  </tr>

                  <tr className="bg-[#e8f5e9] font-black text-sm border-t-2 border-[#117a37]">
                    <td colSpan={2} className="py-3 px-3 text-[#094d22]">
                      الراتب الشهري الصافي للدفع (Net Mensuel à Payer)
                    </td>
                    <td colSpan={2} className="py-3 px-3 text-[#117a37] text-base tabular-nums">
                      {currentSalary.netMonthly.toLocaleString('ar-DZ')} دج
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: EXACT SENIORITY & 12-ECHELON OFFICIAL GRID */}
          {activeTab === 'echelons_seniority' && (
            <div className="space-y-4">
              {/* Seniority & Paces Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-[#094d22]">
                      حساب الأقدمية الدقيقة (سنة / شهر / يوم) ومقارنة وتائر الترقية في الدرجة
                    </h4>
                    <p className="text-xs text-slate-500">
                      حساب آلي لباقي الأقدمية المحتفظ بها (Reliquat) وتحديد الوتيرة حسب مجموع النقطة الإدارية والتربوية
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-bold">النقطة الإدارية:</span>
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      max={20}
                      value={adminMark}
                      onChange={(e) => setAdminMark(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 border border-slate-300 rounded font-black text-center tabular-nums bg-white"
                    />
                    <span className="font-bold">النقطة التربوية:</span>
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      max={20}
                      value={inspectorMark}
                      onChange={(e) => setInspectorMark(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 border border-slate-300 rounded font-black text-center tabular-nums bg-white"
                    />
                    <span className="font-black text-[#117a37] tabular-nums">
                      المجموع: {totalEvalScore} / 40
                    </span>
                  </div>
                </div>

                {/* Comparison of the 3 Paces */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {(
                    [
                      {
                        key: 'min',
                        title: 'الوتيرة الدنيا (سنتان و 6 أشهر)',
                        months: 30,
                        quota: 'نسبة 4 من 10 موظفين',
                        recommended: totalEvalScore >= 36,
                      },
                      {
                        key: 'med',
                        title: 'الوتيرة المتوسطة (3 سنوات)',
                        months: 36,
                        quota: 'نسبة 4 من 10 موظفين',
                        recommended: totalEvalScore >= 30 && totalEvalScore < 36,
                      },
                      {
                        key: 'max',
                        title: 'الوتيرة القصوى (3 سنوات و 6 أشهر)',
                        months: 42,
                        quota: 'نسبة 2 من 10 موظفين',
                        recommended: totalEvalScore < 30,
                      },
                    ] as const
                  ).map((p) => {
                    const dObj = new Date(lastEchelonDate || '2024-09-01');
                    dObj.setMonth(dObj.getMonth() + Math.max(0, p.months - reliquatMonths));
                    dObj.setDate(dObj.getDate() - reliquatDays);
                    const dateStr = dObj.toISOString().slice(0, 10);
                    const isSelected = promotionPace === p.key;
                    return (
                      <div
                        key={p.key}
                        onClick={() => setPromotionPace(p.key)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                          isSelected
                            ? 'bg-[#e8f5e9] border-2 border-[#117a37] shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#094d22]">{p.title}</span>
                          {p.recommended && (
                            <span className="px-2 py-0.5 rounded bg-[#117a37] text-white text-[10px] font-black">
                              مؤهل بالنقطة ({totalEvalScore})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold">
                          المدة المطلوبة: <b>{p.months} شهراً</b> ({p.quota})
                        </div>
                        <div className="text-xs font-black text-[#d91424] tabular-nums">
                          تاريخ سريان الدرجة {nextEchelon}: {dateStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete 12-Echelon Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
                <h4 className="text-sm font-black text-[#094d22] mb-3">
                  الشبكة الاستدلالية الكاملة للدرجات الـ 12 وتعويض الخبرة المهنية للصنف {config.category} ({config.label})
                </h4>
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                      <th className="py-2 px-2.5">الدرجة (Échelon)</th>
                      <th className="py-2 px-2.5">الرقم الاستدلالي القاعدي</th>
                      <th className="py-2 px-2.5">نقاط الدرجة (الخبرة)</th>
                      <th className="py-2 px-2.5">مبلغ الخبرة المهنية الخام</th>
                      <th className="py-2 px-2.5">مجموع النقاط الاستدلالية</th>
                      <th className="py-2 px-2.5">الأجر الرئيسي الخام</th>
                      <th className="py-2 px-2.5">الراتب الصافي الشهري</th>
                      <th className="py-2 px-2.5">الوضعية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((echNum) => {
                      const sim = computeFullSalaryFor(config, echNum);
                      const isCurrent = echNum === echelon;
                      const isNext = echNum === nextEchelon && echelon < 12;
                      return (
                        <tr
                          key={echNum}
                          onClick={() => setEchelon(echNum)}
                          className={`cursor-pointer transition ${
                            isCurrent
                              ? 'bg-[#e8f5e9] font-black border-y-2 border-[#117a37]'
                              : isNext
                              ? 'bg-amber-50/80 font-bold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-2.5 font-black text-[#094d22] tabular-nums">
                            الدرجة {echNum}
                          </td>
                          <td className="py-2 px-2.5 tabular-nums">{config.baseIndex}</td>
                          <td className="py-2 px-2.5 font-bold text-[#117a37] tabular-nums">
                            +{sim.echIdx} نقطة
                          </td>
                          <td className="py-2 px-2.5 font-bold tabular-nums">
                            {sim.echAmt.toLocaleString('ar-DZ')} دج
                          </td>
                          <td className="py-2 px-2.5 font-bold tabular-nums">{sim.totalIndex}</td>
                          <td className="py-2 px-2.5 font-bold tabular-nums">
                            {sim.mainPrincipalSal.toLocaleString('ar-DZ')} دج
                          </td>
                          <td className="py-2 px-2.5 font-black text-[#094d22] tabular-nums">
                            {sim.netMonthly.toLocaleString('ar-DZ')} دج
                          </td>
                          <td className="py-2 px-2.5">
                            {isCurrent ? (
                              <span className="px-2 py-0.5 rounded bg-[#117a37] text-white text-[10px] font-black">
                                الدرجة الحالية ✓
                              </span>
                            ) : isNext ? (
                              <span className="px-2 py-0.5 rounded bg-[#d91424] text-white text-[10px] font-black tabular-nums">
                                الموالية ({nextPromotionDateStr})
                              </span>
                            ) : echNum < echelon ? (
                              <span className="text-[11px] text-slate-400">مكتسبة</span>
                            ) : (
                              <span className="text-[11px] text-slate-500">مستقبلية</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RANK PROMOTION & DECREE 25-54 INTEGRATION SIMULATOR */}
          {activeTab === 'rank_promotion' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-base font-black text-[#094d22] flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#d91424]" />
                    <span>
                      محاكي الترقية في الرتبة الأعلى وأحكام الإدماج وفق المرسوم التنفيذي 25-54
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مقارنة مالية وقانونية دقيقة بين الرتبة الحالية والرتبة الأعلى مع التحقق الآلي من استيفاء شرط الأقدمية
                  </p>
                </div>

                {/* Statutory Eligibility Check Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#094d22]">
                        1. الترقية عن طريق الامتحان المهني:
                      </span>
                      {rankSeniority.years >= config.examRequiredYears ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> مستوفٍ للشرط القانوني
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> متبقي{' '}
                          {config.examRequiredYears - rankSeniority.years} سنوات
                        </span>
                      )}
                    </div>
                    <div>
                      • الأقدمية المشترطة في الرتبة: <b>{config.examRequiredYears} سنوات خدمة فعلية</b>
                    </div>
                    <div>
                      • أقدميتك الحالية في الرتبة: <b>{rankSeniority.years} سنة و {rankSeniority.months} شهر</b>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#094d22]">
                        2. الترقية عن طريق التسجيل على قائمة التأهيل (الاختيار):
                      </span>
                      {rankSeniority.years >= config.choiceRequiredYears ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> مستوفٍ لشرط التأهيل
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> متبقي{' '}
                          {config.choiceRequiredYears - rankSeniority.years} سنوات
                        </span>
                      )}
                    </div>
                    <div>
                      • الأقدمية المشترطة للتسجيل في قائمة التأهيل: <b>{config.choiceRequiredYears} سنوات خدمة فعلية</b>
                    </div>
                    <div>
                      • الرتبة المستهدفة: <b className="text-[#d91424]">{config.nextRankLabel}</b>
                    </div>
                  </div>
                </div>

                {/* Financial Comparison Table: Current Rank vs Promoted Rank */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                        <th className="py-2.5 px-3">المؤشر المالي / المهني</th>
                        <th className="py-2.5 px-3">الوضعية في الرتبة الحالية ({config.label})</th>
                        <th className="py-2.5 px-3">الوضعية بعد الترقية ({nextRankConfig.label})</th>
                        <th className="py-2.5 px-3">الفارق المالي الصافي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-bold">الصنف والرقم الاستدلالي القاعدي</td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          الصنف {config.category} ({config.baseIndex} نقطة)
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#117a37] tabular-nums">
                          الصنف {nextRankConfig.category} ({nextRankConfig.baseIndex} نقطة)
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#117a37] tabular-nums">
                          +{nextRankConfig.baseIndex - config.baseIndex} نقطة قاعدية
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold">الأجر الرئيسي الخام (مع الدرجة {echelon})</td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          {currentSalary.mainPrincipalSal.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          {promotedRankSalary.mainPrincipalSal.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#117a37] tabular-nums">
                          +{(promotedRankSalary.mainPrincipalSal - currentSalary.mainPrincipalSal).toLocaleString('ar-DZ')} دج
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold">الراتب الشهري الصافي (Net Mensuel)</td>
                        <td className="py-2.5 px-3 font-black tabular-nums">
                          {currentSalary.netMonthly.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#117a37] tabular-nums">
                          {promotedRankSalary.netMonthly.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#d91424] tabular-nums">
                          +{promotedRankNetGain.toLocaleString('ar-DZ')} دج / شهرياً
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold">منحة المردودية الصافية (كل 3 أشهر)</td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          {currentSalary.rendementNet.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          {promotedRankSalary.rendementNet.toLocaleString('ar-DZ')} دج
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#117a37] tabular-nums">
                          +{(promotedRankSalary.rendementNet - currentSalary.rendementNet).toLocaleString('ar-DZ')} دج / فصلياً
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-emerald-50 border border-[#117a37]/30 p-3.5 rounded-lg text-xs space-y-1">
                  <div className="font-black text-[#094d22]">
                    المرجعية القانونية للإدماج والترقية في المرسوم التنفيذي 25-54:
                  </div>
                  <p className="text-slate-700 font-semibold leading-relaxed">{config.integrationRule2554}</p>
                  <p className="text-[#d91424] font-bold">{config.promotionCondition}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RETIREMENT & CNR PENSION CALCULATOR UNDER NEW LAWS */}
          {activeTab === 'retirement_cnr' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-black text-[#094d22] flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-600" />
                    <span>
                      حاسبة التقاعد ومعاش الصندوق الوطني للتقاعد (CNR) وفق القوانين الجديدة لقطاع التربية
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    حساب السن القانوني بعد التخفيض الاختياري لأسلاك التربية الوطنية (3 إلى 5 سنوات)، نسبة التصفية (2.5% عن كل سنة)، والمعاش الصافي الشهري
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-[#094d22]">تخفيض سن التقاعد لأسلاك التربية:</span>
                  <select
                    value={eduAgeReductionYears}
                    onChange={(e) => setEduAgeReductionYears(Number(e.target.value))}
                    className="px-2.5 py-1.5 border border-amber-400 rounded-lg bg-amber-50 font-black text-amber-900"
                  >
                    <option value={0}>دون تخفيض (السن العام: 60 رجال / 55 نساء)</option>
                    <option value={3}>تخفيض 3 سنوات (التدبير الخاص بأسلاك التربية)</option>
                    <option value={5}>تخفيض 5 سنوات (المناصب الشاقة / الأقدمية الكاملة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-black text-[#094d22]">1. السن القانوني وتاريخ الإحالة على التقاعد:</div>
                  <div>
                    • السن الحالي للموظف: <b>{employeeAge.years} سنة و {employeeAge.months} شهر</b>
                  </div>
                  <div>
                    • السن القانوني بعد التخفيض:{' '}
                    <b className="text-[#117a37]">{effectiveRetirementAge} سنة</b>
                    {gender === 'female' && maternityReduction > 0 && ` (شامل تخفيض ${maternityReduction} سنوات للأم العاملة)`}
                  </div>
                  <div>
                    • سنة استحقاق التقاعد المتوقعة: <b className="text-[#d91424] tabular-nums">{projectedRetirementYear}</b> (متبقي {yearsUntilRetirementAge} سنة)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-black text-[#094d22]">2. سنوات الخدمة ونسبة تصفية المعاش:</div>
                  <div>
                    • إجمالي سنوات الخدمة المحتسبة: <b>{totalEffectiveYears} سنة و {rawSeniority.months} شهر</b>
                  </div>
                  <div>
                    • معدل التصفية القانوني (2.5% لكل سنة):{' '}
                    <b className="text-[#117a37] tabular-nums">{pensionLiquidationRate}%</b> (السقف الأقصى 80% عند 32 سنة)
                  </div>
                  <div>
                    • الأجر المرجعي الخاضع للتصفية:{' '}
                    <b className="tabular-nums">{cnrReferenceSalary.toLocaleString('ar-DZ')} دج</b>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5">
                  <div className="font-black text-amber-900">3. الحصيلة المالية لمعاش التقاعد ومنحة نهاية الخدمة:</div>
                  <div>
                    • المعاش الشهري الخام: <b className="tabular-nums">{grossMonthlyPension.toLocaleString('ar-DZ')} دج</b>
                  </div>
                  <div>
                    • المعاش الصافي الشهري (CNR):{' '}
                    <b className="text-base text-[#094d22] tabular-nums">
                      {netMonthlyPension.toLocaleString('ar-DZ')} دج
                    </b>
                  </div>
                  <div>
                    • منحة التقاعد التقديرية (نهاية الخدمة):{' '}
                    <b className="text-[#d91424] tabular-nums">{endOfServiceGrant.toLocaleString('ar-DZ')} دج</b>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dependentSpousePension}
                    onChange={(e) => setDependentSpousePension(e.target.checked)}
                    className="accent-[#117a37]"
                  />
                  <span>إضافة علاوة الزوج المكفول في معاش التقاعد (+2,500 دج شهرياً)</span>
                </label>
                <span className="font-bold text-slate-600">
                  الفارق بين الراتب الحالي والمعاش الصافي:{' '}
                  <b className="text-[#d91424] tabular-nums">
                    -{(currentSalary.netMonthly - netMonthlyPension).toLocaleString('ar-DZ')} دج
                  </b>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Official A4 Landscape Sheet */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
              <div>الموظف(ة) : {employeeName}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    بطاقة الخبرة لمحاكاة الراتب والدرجة والأقدمية والترقية والتقاعد (المرسوم 25-54)
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>الرتبة : {config.label}</div>
              <div>الصنف : {config.category} — الدرجة : {echelon} (نقاط: {currentSalary.totalIndex})</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          <table className="timetable-grid mt-2">
            <thead>
              <tr className="hours-header">
                <th>الأجر القاعدي ({config.baseIndex} ن)</th>
                <th>خبرة الدرجة {echelon} (+{currentSalary.echIdx} ن)</th>
                <th>الأجر الرئيسي</th>
                <th>تعويض الخبرة IEP ({currentSalary.iepRatePercent}%)</th>
                <th>مجموع العلاوات البيداغوجية</th>
                <th>الاقتطاعات (CNAS + IRG)</th>
                <th>الراتب الشهري الصافي</th>
                <th>المردودية الصافية ({rendementRate}%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold tabular-nums py-2.5">{currentSalary.baseSal.toLocaleString('ar-DZ')} دج</td>
                <td className="font-bold text-[#117a37] tabular-nums">{currentSalary.echAmt.toLocaleString('ar-DZ')} دج</td>
                <td className="font-black tabular-nums">{currentSalary.mainPrincipalSal.toLocaleString('ar-DZ')} دج</td>
                <td className="font-bold tabular-nums">{currentSalary.iepBonusAmt.toLocaleString('ar-DZ')} دج</td>
                <td className="font-bold tabular-nums">
                  {(
                    currentSalary.qualifAmt +
                    currentSalary.pedaSpecAmt +
                    currentSalary.supportAmt +
                    currentSalary.docAmt +
                    currentSalary.zoneAmt +
                    currentSalary.familyAmt
                  ).toLocaleString('ar-DZ')}{' '}
                  دج
                </td>
                <td className="font-bold text-[#d91424] tabular-nums">
                  -{(currentSalary.ssDeduction + currentSalary.irgDeduction + currentSalary.mutualAmt).toLocaleString('ar-DZ')} دج
                </td>
                <td className="font-black text-[#094d22] text-sm tabular-nums">
                  {currentSalary.netMonthly.toLocaleString('ar-DZ')} دج
                </td>
                <td className="font-black text-[#117a37] tabular-nums">
                  {currentSalary.rendementNet.toLocaleString('ar-DZ')} دج
                </td>
              </tr>
            </tbody>
          </table>

          <table className="timetable-grid mt-3">
            <thead>
              <tr className="hours-header">
                <th>الأقدمية العامة الدقيقة</th>
                <th>باقي الأقدمية (Reliquat)</th>
                <th>تاريخ استحقاق الدرجة ({nextEchelon})</th>
                <th>الزيادة عند الدرجة ({nextEchelon})</th>
                <th>الرتبة الأعلى المستهدفة</th>
                <th>الزيادة عند الترقية للرتبة</th>
                <th>نسبة التقاعد الحالية (CNR)</th>
                <th>معاش التقاعد الصافي التقديري</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold py-2.5 tabular-nums">
                  {totalEffectiveYears} س و {rawSeniority.months} ش و {rawSeniority.days} ي
                </td>
                <td className="font-bold tabular-nums">
                  {reliquatMonths} أشهر و {reliquatDays} يوم
                </td>
                <td className="font-black text-[#d91424] tabular-nums">{nextPromotionDateStr}</td>
                <td className="font-bold text-[#117a37] tabular-nums">
                  +{nextEchelonNetGain.toLocaleString('ar-DZ')} دج
                </td>
                <td className="font-bold">{config.nextRankLabel}</td>
                <td className="font-bold text-[#117a37] tabular-nums">
                  +{promotedRankNetGain.toLocaleString('ar-DZ')} دج
                </td>
                <td className="font-black tabular-nums">{pensionLiquidationRate}% (سن {effectiveRetirementAge})</td>
                <td className="font-black text-[#094d22] tabular-nums">
                  {netMonthlyPension.toLocaleString('ar-DZ')} دج
                </td>
              </tr>
            </tbody>
          </table>

          <div className="footer-signatures mt-6">
            <div>إمضاء الموظف(ة) المعني(ة)</div>
            <div>إمضاء وختم السيد(ة) المدير(ة)</div>
            <div>مصلحة الموظفين وتسيير النفقات</div>
          </div>
        </div>
      </div>
    </div>
  );
}
