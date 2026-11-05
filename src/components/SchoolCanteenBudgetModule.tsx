import React, { useState, useRef } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Printer,
  Download,
  Calculator,
  TrendingUp,
  CheckCircle2,
  Coins,
  Users,
  PackageCheck,
  ShieldCheck,
  CalendarRange,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';
import { SchoolStage } from './OrdonnateurFinancialModule';

export interface DailyMealRecord {
  id: string;
  date: string;
  dayName: string;
  menuMain: string;
  menuSupplement: string;
  registeredBeneficiaries: number;
  actualBeneficiaries: number;
  unitCostDzd: number;
  witnessMealKept: boolean;
  notes: string;
}

export interface CanteenBudgetConfig {
  allocatedBudgetDzd: number;
  defaultUnitCostDzd: number;
  registeredStudentsCount: number;
  municipalityContributionDzd: number;
  stateGrantDzd: number;
  canteenManagerName: string;
  suppliersInfo: string;
}

export interface CanteenBeneficiaryStudent {
  id: string;
  fullName: string;
  levelTitle: string;
  socialCategory: 'معوز' | 'يتيم' | 'بعد المسافة' | 'ذوي الدخل الضعيف';
  guardianName: string;
  healthAllergyNote: string;
}

export interface CanteenStockItem {
  id: string;
  itemName: string;
  category: 'بقوليات وعجائن' | 'لحوم ودواجن' | 'خضر وفواكه' | 'حليب ومشتقاته' | 'مواد بقالة وخبز';
  unit: 'كغ' | 'لتر' | 'علبة' | 'وحدة';
  qtyIn: number;
  qtyConsumed: number;
  expiryDate: string;
  supplierName: string;
}

export interface CanteenHygieneCheck {
  id: string;
  workerName: string;
  role: string;
  medicalCertDate: string;
  medicalStatus: 'صالح للعمل (ملف صحي محين)' | 'قيد التجديد الدوري';
  dailyTask: string;
}

export const INITIAL_CANTEEN_CONFIG: CanteenBudgetConfig = {
  allocatedBudgetDzd: 2450000,
  defaultUnitCostDzd: 95,
  registeredStudentsCount: 185,
  municipalityContributionDzd: 850000,
  stateGrantDzd: 1600000,
  canteenManagerName: 'ع. بن سالم (مسير المطعم / المقتصد)',
  suppliersInfo: 'مؤسسة التموين الغذائي المعتمدة',
};

export const INITIAL_DAILY_MEALS: DailyMealRecord[] = [
  {
    id: 'm1',
    date: '2026-10-18',
    dayName: 'الأحد',
    menuMain: 'عدس مطبوخ بلحم العجل + سلطة خضراء',
    menuSupplement: 'جبن + تفاح موسمي + خبز',
    registeredBeneficiaries: 185,
    actualBeneficiaries: 178,
    unitCostDzd: 95,
    witnessMealKept: true,
    notes: 'وجبة متوازنة — حفظ الطبق الشاهد لمدة 48 ساعة',
  },
  {
    id: 'm2',
    date: '2026-10-19',
    dayName: 'الاثنين',
    menuMain: 'كسكسي بالخضر والدجاج + لبن معلب',
    menuSupplement: 'موز + خبز',
    registeredBeneficiaries: 185,
    actualBeneficiaries: 182,
    unitCostDzd: 95,
    witnessMealKept: true,
    notes: 'إقبال ممتاز للتلاميذ واحترام معايير النظافة',
  },
  {
    id: 'm3',
    date: '2026-10-20',
    dayName: 'الثلاثاء',
    menuMain: 'فاصولياء بيضاء بصلصة الطماطم واللحم',
    menuSupplement: 'ياغورت طبيعي + برتقال + خبز',
    registeredBeneficiaries: 185,
    actualBeneficiaries: 174,
    unitCostDzd: 95,
    witnessMealKept: true,
    notes: 'توزيع الوجبة قبل الخروج على الساعة 11:15',
  },
  {
    id: 'm4',
    date: '2026-10-21',
    dayName: 'الأربعاء',
    menuMain: 'أرز بالخضر وشرائح الديك الرومي + سلطة',
    menuSupplement: 'جبن طري + إجاص + خبز',
    registeredBeneficiaries: 185,
    actualBeneficiaries: 180,
    unitCostDzd: 95,
    witnessMealKept: true,
    notes: 'مراقبة صلاحية المواد الاستهلاكية بالمخزن',
  },
  {
    id: 'm5',
    date: '2026-10-22',
    dayName: 'الخميس',
    menuMain: 'حمص باللحم المفروم + بطاطا مهروسة بالجبن',
    menuSupplement: 'تحلية حليب + تمر دقلة نور + خبز',
    registeredBeneficiaries: 185,
    actualBeneficiaries: 179,
    unitCostDzd: 95,
    witnessMealKept: true,
    notes: 'تنظيف وتعقيم شامل لقاعة الإطعام والمطبخ',
  },
];

const INITIAL_BENEFICIARIES_LIST: CanteenBeneficiaryStudent[] = [
  { id: 'bs1', fullName: 'بوزيد محمد الأمين', levelTitle: 'السنة الأولى', socialCategory: 'معوز', guardianName: 'بوزيد عبد القادر', healthAllergyNote: 'لا توجد حساسية غذائية' },
  { id: 'bs2', fullName: 'رحماني آية سلسبيل', levelTitle: 'السنة الثانية', socialCategory: 'يتيم', guardianName: 'رحماني فاطمة', healthAllergyNote: 'لا توجد حساسية غذائية' },
  { id: 'bs3', fullName: 'عيساوي عبد الرحمن', levelTitle: 'السنة الثالثة', socialCategory: 'بعد المسافة', guardianName: 'عيساوي لخضر', healthAllergyNote: 'لا توجد حساسية غذائية' },
  { id: 'bs4', fullName: 'عماري مريم البتول', levelTitle: 'السنة الرابعة', socialCategory: 'ذوي الدخل الضعيف', guardianName: 'عماري بلقاسم', healthAllergyNote: 'تجنب الحليب غير المبستر' },
  { id: 'bs5', fullName: 'خليفي ياسين', levelTitle: 'السنة الخامسة / النهائي', socialCategory: 'معوز', guardianName: 'خليفي المختار', healthAllergyNote: 'لا توجد حساسية غذائية' },
  { id: 'bs6', fullName: 'تومي سارة', levelTitle: 'قسم تحضيري / أولى', socialCategory: 'ذوي الدخل الضعيف', guardianName: 'تومي كمال', healthAllergyNote: 'لا توجد حساسية غذائية' },
];

const INITIAL_STOCK_ITEMS: CanteenStockItem[] = [
  { id: 'st1', itemName: 'عدس وحمص وفاصولياء جافة', category: 'بقوليات وعجائن', unit: 'كغ', qtyIn: 140, qtyConsumed: 85, expiryDate: '2027-06-30', supplierName: 'الديوان الجزائري المهني للحبوب (OAIC)' },
  { id: 'st2', itemName: 'عجائن غذائية وكسكسي وأرز', category: 'بقوليات وعجائن', unit: 'كغ', qtyIn: 160, qtyConsumed: 95, expiryDate: '2027-08-15', supplierName: 'ممون المواد الغذائية العامة' },
  { id: 'st3', itemName: 'لحم عجل طازج ودواجن مراقبة بيطرياً', category: 'لحوم ودواجن', unit: 'كغ', qtyIn: 90, qtyConsumed: 78, expiryDate: 'تموين يومي طازج', supplierName: 'قصابة وممون اللحوم المعتمد' },
  { id: 'st4', itemName: 'خضر وفواكه موسمية طازجة', category: 'خضر وفواكه', unit: 'كغ', qtyIn: 250, qtyConsumed: 210, expiryDate: 'تموين أسبوعي طازج', supplierName: 'ممون الخضر والفواكه البلدي' },
  { id: 'st5', itemName: 'أجبان وياغورت ولبن معلب', category: 'حليب ومشتقاته', unit: 'علبة', qtyIn: 950, qtyConsumed: 760, expiryDate: '2026-12-20', supplierName: 'ملبنة الجنوب المعتمدة' },
  { id: 'st6', itemName: 'زيت المائدة وطماطم مصبرة وتوابل', category: 'مواد بقالة وخبز', unit: 'وحدة', qtyIn: 80, qtyConsumed: 48, expiryDate: '2027-09-01', supplierName: 'ممون المواد الغذائية العامة' },
];

const INITIAL_HYGIENE_WORKERS: CanteenHygieneCheck[] = [
  { id: 'hw1', workerName: 'خديجة بن عيسى', role: 'طباخة رئيسية بالمطعم', medicalCertDate: '2026-09-10', medicalStatus: 'صالح للعمل (ملف صحي محين)', dailyTask: 'تحضير الوجبة الساخنة وحفظ الطبق الشاهد (48 ساعة)' },
  { id: 'hw2', workerName: 'سعاد مرزوقي', role: 'عون مطعم وتوزيع', medicalCertDate: '2026-09-12', medicalStatus: 'صالح للعمل (ملف صحي محين)', dailyTask: 'توزيع الوجبات وتنظيف وتعقيم الأواني والطاولات' },
  { id: 'hw3', workerName: 'عبد المجيد قادري', role: 'عون استلام ومخزن', medicalCertDate: '2026-09-15', medicalStatus: 'صالح للعمل (ملف صحي محين)', dailyTask: 'فحص السلع المستلمة ومراقبة درجة حرارة الثلاجات' },
];

interface SchoolCanteenBudgetModuleProps {
  schoolStage?: SchoolStage;
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  logoUrl: string;
  totalSchoolStudents: number;
  canteenConfig: CanteenBudgetConfig;
  setCanteenConfig: React.Dispatch<React.SetStateAction<CanteenBudgetConfig>>;
  dailyMeals: DailyMealRecord[];
  setDailyMeals: React.Dispatch<React.SetStateAction<DailyMealRecord[]>>;
}

export default function SchoolCanteenBudgetModule({
  schoolStage = 'primary',
  institution,
  logoUrl,
  totalSchoolStudents,
  canteenConfig,
  setCanteenConfig,
  dailyMeals,
  setDailyMeals,
}: SchoolCanteenBudgetModuleProps) {
  const [subTab, setSubTab] = useState<
    'budget_meals' | 'meal_calculator' | 'weekly_menu' | 'beneficiaries' | 'stock' | 'hygiene'
  >('budget_meals');
  const sheetRef = useRef<HTMLDivElement>(null);

  // Interactive Daily Meal Budget & Consumption Calculator State
  const [calcMode, setCalcMode] = useState<'from_records' | 'custom_simulation'>('custom_simulation');
  const [simDailyMealsServed, setSimDailyMealsServed] = useState<number>(
    canteenConfig.registeredStudentsCount || 180
  );
  const [simDaysCount, setSimDaysCount] = useState<number>(20); // مثلاً 20 يوم دراسة في الشهر
  const [simUnitCostDzd, setSimUnitCostDzd] = useState<number>(canteenConfig.defaultUnitCostDzd || 95);
  const [simExtraExpensesDzd, setSimExtraExpensesDzd] = useState<number>(0); // مصاريف إضافية (خبز/وقود/نقل إن وجدت)

  // Add Daily Meal State
  const [newMealDate, setNewMealDate] = useState('2026-10-25');
  const [newMealDay, setNewMealDay] = useState('الأحد');
  const [newMealMain, setNewMealMain] = useState('');
  const [newMealSupp, setNewMealSupp] = useState('فاكهة موسمية + جبن + خبز');
  const [newMealActual, setNewMealActual] = useState<number>(canteenConfig.registeredStudentsCount || 180);
  const [newMealUnitCost, setNewMealUnitCost] = useState<number>(canteenConfig.defaultUnitCostDzd || 95);
  const [newMealNotes, setNewMealNotes] = useState('حفظ الوجبة الشاهدة 48 ساعة في الثلاجة');

  // Beneficiaries List State
  const [beneficiariesList, setBeneficiariesList] = useState<CanteenBeneficiaryStudent[]>(INITIAL_BENEFICIARIES_LIST);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState('السنة الأولى');
  const [newStudentCat, setNewStudentCat] = useState<CanteenBeneficiaryStudent['socialCategory']>('معوز');
  const [newStudentGuardian, setNewStudentGuardian] = useState('');

  // Stock State
  const [stockItems, setStockItems] = useState<CanteenStockItem[]>(INITIAL_STOCK_ITEMS);
  const [newStockName, setNewStockName] = useState('');
  const [newStockCat, setNewStockCat] = useState<CanteenStockItem['category']>('بقوليات وعجائن');
  const [newStockUnit, setNewStockUnit] = useState<CanteenStockItem['unit']>('كغ');
  const [newStockIn, setNewStockIn] = useState(50);

  // Hygiene & Workers State
  const [hygieneWorkers] = useState<CanteenHygieneCheck[]>(INITIAL_HYGIENE_WORKERS);

  // Calculations from Actual Daily Records
  const totalMealsServed = dailyMeals.reduce((sum, r) => sum + r.actualBeneficiaries, 0);
  const totalRegisteredSum = dailyMeals.reduce((sum, r) => sum + r.registeredBeneficiaries, 0);
  const attendanceRate =
    totalRegisteredSum > 0 ? Math.round((totalMealsServed / totalRegisteredSum) * 100) : 0;

  const avgDailyBeneficiaries =
    dailyMeals.length > 0 ? Math.round(totalMealsServed / dailyMeals.length) : 0;

  const totalConsumedCostDzd = dailyMeals.reduce(
    (sum, r) => sum + r.actualBeneficiaries * r.unitCostDzd,
    0
  );

  const remainingBudgetDzd = Math.max(0, canteenConfig.allocatedBudgetDzd - totalConsumedCostDzd);
  const budgetUsedPercent =
    canteenConfig.allocatedBudgetDzd > 0
      ? Math.min(100, Number(((totalConsumedCostDzd / canteenConfig.allocatedBudgetDzd) * 100).toFixed(1)))
      : 0;

  const estimatedRemainingMealsCapacity =
    canteenConfig.defaultUnitCostDzd > 0
      ? Math.floor(remainingBudgetDzd / canteenConfig.defaultUnitCostDzd)
      : 0;

  const estimatedRemainingSchoolDays =
    canteenConfig.registeredStudentsCount > 0
      ? Math.floor(estimatedRemainingMealsCapacity / canteenConfig.registeredStudentsCount)
      : 0;

  // Calculations for Interactive Meal Budget Calculator
  const calcTotalActualMeals =
    calcMode === 'from_records' ? totalMealsServed : simDailyMealsServed * simDaysCount;
  const calcEffectiveUnitCost =
    calcMode === 'from_records' ? canteenConfig.defaultUnitCostDzd : simUnitCostDzd;
  const calcDailyExpenditure =
    calcMode === 'from_records'
      ? avgDailyBeneficiaries * canteenConfig.defaultUnitCostDzd
      : simDailyMealsServed * simUnitCostDzd;
  const calcTotalConsumedDzd =
    (calcMode === 'from_records' ? totalConsumedCostDzd : calcTotalActualMeals * simUnitCostDzd) +
    simExtraExpensesDzd;
  const calcRemainingBudgetDzd = Math.max(
    0,
    canteenConfig.allocatedBudgetDzd - calcTotalConsumedDzd
  );
  const calcDeficitDzd = Math.max(0, calcTotalConsumedDzd - canteenConfig.allocatedBudgetDzd);
  const calcConsumptionPercent =
    canteenConfig.allocatedBudgetDzd > 0
      ? Number(((calcTotalConsumedDzd / canteenConfig.allocatedBudgetDzd) * 100).toFixed(2))
      : 0;
  const calcAdditionalMealsPossible =
    calcEffectiveUnitCost > 0 ? Math.floor(calcRemainingBudgetDzd / calcEffectiveUnitCost) : 0;
  const calcAdditionalDaysPossible =
    (calcMode === 'from_records' ? avgDailyBeneficiaries : simDailyMealsServed) > 0
      ? Math.floor(
          calcAdditionalMealsPossible /
            Math.max(1, calcMode === 'from_records' ? avgDailyBeneficiaries : simDailyMealsServed)
        )
      : 0;

  const canteenSystemTitle =
    schoolStage === 'primary'
      ? 'المطعم المدرسي (التعليم الابتدائي)'
      : schoolStage === 'middle'
      ? 'النظام نصف الداخلي والداخلي (المتوسطة)'
      : 'النظام نصف الداخلي والداخلي (الثانوية)';

  // Monthly Budget Consumption Tracking (9 School Months: September -> May)
  const [chartViewMode, setChartViewMode] = useState<'cumulative_vs_total' | 'monthly_vs_ceiling'>(
    'cumulative_vs_total'
  );
  const [monthlyMealsPlan, setMonthlyMealsPlan] = useState<
    { id: string; monthName: string; schoolDays: number; avgBeneficiaries: number }[]
  >([
    { id: 'm1', monthName: 'سبتمبر', schoolDays: 12, avgBeneficiaries: 175 },
    { id: 'm2', monthName: 'أكتوبر', schoolDays: 21, avgBeneficiaries: 182 },
    { id: 'm3', monthName: 'نوفمبر', schoolDays: 20, avgBeneficiaries: 185 },
    { id: 'm4', monthName: 'ديسمبر', schoolDays: 15, avgBeneficiaries: 184 },
    { id: 'm5', monthName: 'جانفي', schoolDays: 18, avgBeneficiaries: 185 },
    { id: 'm6', monthName: 'فيفري', schoolDays: 20, avgBeneficiaries: 186 },
    { id: 'm7', monthName: 'مارس', schoolDays: 16, avgBeneficiaries: 185 },
    { id: 'm8', monthName: 'أفريل', schoolDays: 21, avgBeneficiaries: 192 },
    { id: 'm9', monthName: 'ماي', schoolDays: 20, avgBeneficiaries: 195 },
  ]);

  const effectiveUnitCostForChart =
    subTab === 'meal_calculator' && calcMode === 'custom_simulation'
      ? simUnitCostDzd
      : canteenConfig.defaultUnitCostDzd || 95;

  const monthlyBudgetCeiling = Math.round(canteenConfig.allocatedBudgetDzd / 9);

  const monthlyChartData = (() => {
    let runningCumulative = 0;
    return monthlyMealsPlan.map((m) => {
      const mealsCount = m.schoolDays * m.avgBeneficiaries;
      const monthlyConsumed = mealsCount * effectiveUnitCostForChart;
      runningCumulative += monthlyConsumed;

      const isCumulativeDeficit = runningCumulative > canteenConfig.allocatedBudgetDzd;
      const isMonthlyDeficit = monthlyConsumed > monthlyBudgetCeiling;
      const isDeficit =
        chartViewMode === 'cumulative_vs_total'
          ? isCumulativeDeficit || isMonthlyDeficit
          : isMonthlyDeficit || isCumulativeDeficit;

      const cumulativeDeficitDzd = Math.max(
        0,
        runningCumulative - canteenConfig.allocatedBudgetDzd
      );
      const monthlyDeficitDzd = Math.max(0, monthlyConsumed - monthlyBudgetCeiling);

      return {
        id: m.id,
        month: m.monthName,
        schoolDays: m.schoolDays,
        avgBeneficiaries: m.avgBeneficiaries,
        mealsCount,
        monthlyConsumed,
        cumulativeConsumed: runningCumulative,
        allocatedTotal: canteenConfig.allocatedBudgetDzd,
        monthlyCeiling: monthlyBudgetCeiling,
        isCumulativeDeficit,
        isMonthlyDeficit,
        isDeficit,
        cumulativeDeficitDzd,
        monthlyDeficitDzd,
      };
    });
  })();

  const totalAnnualProjectedConsumed =
    monthlyChartData[monthlyChartData.length - 1]?.cumulativeConsumed || 0;
  const totalAnnualDeficitDzd = Math.max(
    0,
    totalAnnualProjectedConsumed - canteenConfig.allocatedBudgetDzd
  );
  const deficitMonthsList = monthlyChartData.filter((d) => d.isDeficit).map((d) => d.month);

  const handleUpdateMonthPlan = (
    id: string,
    field: 'schoolDays' | 'avgBeneficiaries',
    val: string
  ) => {
    const num = Math.max(0, Number(val) || 0);
    setMonthlyMealsPlan((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: num } : m))
    );
  };

  const handleAddDailyMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealMain.trim()) return;
    const item: DailyMealRecord = {
      id: 'meal_' + Date.now(),
      date: newMealDate,
      dayName: newMealDay,
      menuMain: newMealMain.trim(),
      menuSupplement: newMealSupp.trim(),
      registeredBeneficiaries: canteenConfig.registeredStudentsCount,
      actualBeneficiaries: Math.max(0, Number(newMealActual) || 0),
      unitCostDzd: Math.max(1, Number(newMealUnitCost) || canteenConfig.defaultUnitCostDzd),
      witnessMealKept: true,
      notes: newMealNotes.trim(),
    };
    setDailyMeals((prev) => [...prev, item]);
    setNewMealMain('');
  };

  const handleUpdateMealField = (
    id: string,
    field: keyof DailyMealRecord,
    value: string | number | boolean
  ) => {
    setDailyMeals((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (
          field === 'actualBeneficiaries' ||
          field === 'registeredBeneficiaries' ||
          field === 'unitCostDzd'
        ) {
          return { ...m, [field]: Math.max(0, Number(value) || 0) };
        }
        return { ...m, [field]: value };
      })
    );
  };

  const handleDeleteMeal = (id: string) => {
    setDailyMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleApplyUnitCostToAll = () => {
    setDailyMeals((prev) =>
      prev.map((m) => ({
        ...m,
        unitCostDzd: canteenConfig.defaultUnitCostDzd,
        registeredBeneficiaries: canteenConfig.registeredStudentsCount,
      }))
    );
  };

  const handleAddBeneficiaryStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const st: CanteenBeneficiaryStudent = {
      id: 'bs_' + Date.now(),
      fullName: newStudentName.trim(),
      levelTitle: newStudentLevel,
      socialCategory: newStudentCat,
      guardianName: newStudentGuardian.trim() || 'ولي التلميذ',
      healthAllergyNote: 'لا توجد حساسية غذائية',
    };
    setBeneficiariesList((prev) => [...prev, st]);
    setNewStudentName('');
    setNewStudentGuardian('');
  };

  const handleAddStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;
    const st: CanteenStockItem = {
      id: 'st_' + Date.now(),
      itemName: newStockName.trim(),
      category: newStockCat,
      unit: newStockUnit,
      qtyIn: Math.max(0, Number(newStockIn) || 0),
      qtyConsumed: 0,
      expiryDate: '2027-06-30',
      supplierName: canteenConfig.suppliersInfo,
    };
    setStockItems((prev) => [...prev, st]);
    setNewStockName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#117a37]" />
            <span>
              منظومة تسيير {canteenSystemTitle} وحاسبة ميزانية الوجبات اليومية
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            قسم متكامل لتسيير الإطعام المدرسي، حاسبة استهلاك الميزانية بناءً على الوجبات المقدمة فعلياً وتكلفتها مقابل الاعتماد الكلي، جرد المخزون، والرقابة الصحية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(
                sheetRef.current,
                `المطعم_المدرسي_${subTab}_${institution.school}`,
                'landscape'
              )
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل كشف المطعم (PDF)</span>
          </button>
          <button
            onClick={() =>
              triggerPrintOrPdf(`كشف_المطعم_المدرسي_${institution.school}`, sheetRef.current)
            }
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوثيقة الرسمية (A4)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs for All Canteen Sections */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2">
        {[
          {
            id: 'budget_meals',
            label: '1. الميزانية والوجبات اليومية والتكلفة',
            icon: <Coins className="w-3.5 h-3.5" />,
          },
          {
            id: 'meal_calculator',
            label: '2. حاسبة ميزانية الوجبات اليومية واستهلاك الاعتماد',
            icon: <Calculator className="w-3.5 h-3.5 text-[#d91424]" />,
          },
          {
            id: 'weekly_menu',
            label: '3. الجدول الغذائي الأسبوعي المعتمد',
            icon: <CalendarRange className="w-3.5 h-3.5" />,
          },
          {
            id: 'beneficiaries',
            label: '4. قائمة التلاميذ المستفيدين من الإطعام',
            icon: <Users className="w-3.5 h-3.5" />,
          },
          {
            id: 'stock',
            label: '5. جرد المخزون الغذائي والتموين',
            icon: <PackageCheck className="w-3.5 h-3.5" />,
          },
          {
            id: 'hygiene',
            label: '6. الرقابة الصحية والطبق الشاهد والعمال',
            icon: <ShieldCheck className="w-3.5 h-3.5" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as typeof subTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
              subTab === tab.id
                ? 'bg-[#117a37] text-white shadow-xs'
                : tab.id === 'meal_calculator'
                ? 'bg-amber-50 border border-amber-300 text-[#094d22] hover:bg-amber-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Top Financial & Beneficiaries KPI Strip */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>الميزانية السنوية المخصصة</span>
            <Coins className="w-4 h-4 text-[#094d22]" />
          </div>
          <div className="text-xl font-black text-[#094d22] mt-1.5 tabular-nums">
            {canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-500 mt-1">إعانة الدولة + مساهمة البلدية/العائلات</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>متوسط المستفيدين اليومي</span>
            <Users className="w-4 h-4 text-[#117a37]" />
          </div>
          <div className="text-xl font-black text-[#117a37] mt-1.5 tabular-nums">
            {avgDailyBeneficiaries} / {canteenConfig.registeredStudentsCount} تلميذ
          </div>
          <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
            نسبة الحضور في المطعم: {attendanceRate}% (من أصل {totalSchoolStudents} بالمؤسسة)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>مجموع الوجبات المقدمة فعلياً</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5 tabular-nums">
            {totalMealsServed.toLocaleString('ar-DZ')} وجبة
          </div>
          <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
            خلال {dailyMeals.length} أيام إطعام مسجلة · التسعيرة: {canteenConfig.defaultUnitCostDzd} دج
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>التكلفة الإجمالية المستهلكة</span>
            <TrendingUp className="w-4 h-4 text-[#d91424]" />
          </div>
          <div className="text-xl font-black text-[#d91424] mt-1.5 tabular-nums">
            {totalConsumedCostDzd.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
            نسبة استهلاك الاعتماد: {budgetUsedPercent}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>الرصيد المالي المتبقي</span>
            <CheckCircle2 className="w-4 h-4 text-[#117a37]" />
          </div>
          <div className="text-xl font-black text-[#094d22] mt-1.5 tabular-nums">
            {remainingBudgetDzd.toLocaleString('ar-DZ')} دج
          </div>
          <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
            يكفي لحوالي {estimatedRemainingMealsCapacity.toLocaleString('ar-DZ')} وجبة ({estimatedRemainingSchoolDays} يوم)
          </div>
        </div>
      </div>

      {/* RECHARTS MONTHLY BUDGET CONSUMPTION VS ALLOCATED BUDGET CHART (WITH RED DEFICIT HIGHLIGHTING) */}
      {(subTab === 'budget_meals' || subTab === 'meal_calculator') && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-[#094d22] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#117a37]" />
                <span>
                  الرسم البياني لاستهلاك الميزانية شهرياً مقارنة بالميزانية المخصصة الكلية (مع تلوين فترات العجز بالأحمر)
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                تحليل بياني تفاعلي عبر مكتبة Recharts يقارن استهلاك الوجبات على مدار الأشهر التسعة مع سقف الميزانية الكلية ({canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج) ويلون تلقائياً أشهر العجز باللون الأحمر
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setChartViewMode('cumulative_vs_total')}
                className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer transition ${
                  chartViewMode === 'cumulative_vs_total'
                    ? 'bg-[#094d22] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الاستهلاك التراكمي مقابل الميزانية الكلية
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('monthly_vs_ceiling')}
                className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer transition ${
                  chartViewMode === 'monthly_vs_ceiling'
                    ? 'bg-[#117a37] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الاستهلاك الشهري مقابل السقف الشهري ({monthlyBudgetCeiling.toLocaleString('ar-DZ')} دج)
              </button>
            </div>
          </div>

          {/* Alert Banner if Deficit Months Exist */}
          {deficitMonthsList.length > 0 ? (
            <div className="bg-rose-50 border-2 border-[#d91424] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#d91424] shrink-0" />
                <div>
                  <span className="font-black text-[#d91424]">
                    تنبيه فترات العجز المالي الملونة بالأحمر ({deficitMonthsList.join(' · ')}):
                  </span>{' '}
                  <span className="font-bold text-slate-800">
                    إجمالي الاستهلاك السنوي المقدر ({totalAnnualProjectedConsumed.toLocaleString('ar-DZ')} دج) يتجاوز الميزانية المخصصة الكلية ({canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج) بعجز مالي قدره{' '}
                    <b className="text-[#d91424]">{totalAnnualDeficitDzd.toLocaleString('ar-DZ')} دج</b>.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#117a37] text-white font-black text-[11px]">
                  أخضر: ضمن الاعتماد المخصص
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#d91424] text-white font-black text-[11px]">
                  أحمر: فترة عجز مالي (تجاوز الميزانية)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-[#117a37] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-black text-[#094d22]">
                جميع الأشهر الدراسية التسعة متوازنة مالياً وضمن حدود الميزانية المخصصة الكلية ({canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج).
              </div>
              <button
                type="button"
                onClick={() =>
                  setCanteenConfig((prev) => ({
                    ...prev,
                    allocatedBudgetDzd: Math.max(1000000, Math.round(totalAnnualProjectedConsumed * 0.82)),
                  }))
                }
                className="px-3 py-1 rounded bg-[#d91424] text-white font-bold cursor-pointer"
              >
                معاينة سيناريو العجز المالي (بالأحمر)
              </button>
            </div>
          )}

          {/* Recharts Container */}
          <div className="w-full h-[360px] bg-slate-50/70 border border-slate-200 rounded-xl p-3" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }}
                />
                <YAxis
                  tickFormatter={(val: number) => `${Math.round(val / 1000)}k`}
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  formatter={(value) => `${Number(value ?? 0).toLocaleString('ar-DZ')} دج`}
                  labelFormatter={(label) => `شهر ${String(label ?? '')}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #094d22',
                    borderRadius: '10px',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                />

                {chartViewMode === 'cumulative_vs_total' ? (
                  <>
                    <ReferenceLine
                      y={canteenConfig.allocatedBudgetDzd}
                      stroke="#d91424"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      label={{
                        value: `سقف الميزانية المخصصة الكلية (${canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج)`,
                        position: 'top',
                        fill: '#d91424',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    />
                    <Bar
                      dataKey="cumulativeConsumed"
                      name="الاستهلاك التراكمي للميزانية (أحمر = فترة عجز)"
                      radius={[6, 6, 0, 0]}
                      barSize={38}
                    >
                      {monthlyChartData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.isCumulativeDeficit
                              ? '#d91424'
                              : entry.cumulativeConsumed > canteenConfig.allocatedBudgetDzd * 0.85
                              ? '#d97706'
                              : '#117a37'
                          }
                        />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="allocatedTotal"
                      name="خط الميزانية المخصصة الكلية"
                      stroke="#0f172a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </>
                ) : (
                  <>
                    <ReferenceLine
                      y={monthlyBudgetCeiling}
                      stroke="#d91424"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      label={{
                        value: `الحصة الشهرية المرجعية (${monthlyBudgetCeiling.toLocaleString('ar-DZ')} دج)`,
                        position: 'top',
                        fill: '#d91424',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    />
                    <Bar
                      dataKey="monthlyConsumed"
                      name="الاستهلاك المالي الشهري (أحمر = عجز شهري)"
                      radius={[6, 6, 0, 0]}
                      barSize={38}
                    >
                      {monthlyChartData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.isMonthlyDeficit || entry.isCumulativeDeficit
                              ? '#d91424'
                              : '#117a37'
                          }
                        />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="monthlyCeiling"
                      name="السقف الشهري المخصص"
                      stroke="#0f172a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Monthly Table to Adjust Meals / Days and Observe Deficit Coloring */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2 px-2.5">الشهر الدراسي</th>
                  <th className="py-2 px-2.5 text-center">أيام الإطعام</th>
                  <th className="py-2 px-2.5 text-center">المستفيدون/يوم</th>
                  <th className="py-2 px-2.5 text-center">مجموع الوجبات</th>
                  <th className="py-2 px-2.5 text-center">الاستهلاك الشهري (دج)</th>
                  <th className="py-2 px-2.5 text-center">الاستهلاك التراكمي (دج)</th>
                  <th className="py-2 px-2.5 text-center">الوضعية مقارنة بالميزانية الكلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyChartData.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.isCumulativeDeficit || row.isMonthlyDeficit
                        ? 'bg-rose-50/90 font-bold'
                        : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-2 px-2.5 font-black text-slate-900">{row.month}</td>
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="number"
                        min={1}
                        max={26}
                        value={row.schoolDays}
                        onChange={(e) =>
                          handleUpdateMonthPlan(row.id, 'schoolDays', e.target.value)
                        }
                        className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={row.avgBeneficiaries}
                        onChange={(e) =>
                          handleUpdateMonthPlan(row.id, 'avgBeneficiaries', e.target.value)
                        }
                        className="w-20 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                      {row.mealsCount.toLocaleString('ar-DZ')} وجبة
                    </td>
                    <td
                      className={`py-2 px-2.5 text-center font-black tabular-nums ${
                        row.isMonthlyDeficit ? 'text-[#d91424]' : 'text-[#094d22]'
                      }`}
                    >
                      {row.monthlyConsumed.toLocaleString('ar-DZ')} دج
                    </td>
                    <td
                      className={`py-2 px-2.5 text-center font-black tabular-nums ${
                        row.isCumulativeDeficit ? 'text-[#d91424]' : 'text-slate-900'
                      }`}
                    >
                      {row.cumulativeConsumed.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      {row.isCumulativeDeficit ? (
                        <span className="px-2.5 py-0.5 rounded bg-[#d91424] text-white text-[11px] font-black inline-block">
                          عجز تراكمي: -{row.cumulativeDeficitDzd.toLocaleString('ar-DZ')} دج
                        </span>
                      ) : row.isMonthlyDeficit ? (
                        <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-[11px] font-black inline-block">
                          تجاوز السقف الشهري بـ {row.monthlyDeficitDzd.toLocaleString('ar-DZ')} دج
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-[#094d22] text-[11px] font-black inline-block">
                          متوازن (وفر: {(canteenConfig.allocatedBudgetDzd - row.cumulativeConsumed).toLocaleString('ar-DZ')} دج)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: حاسبة ميزانية الوجبات اليومية واستهلاك الاعتماد المالي */}
      {subTab === 'meal_calculator' && (
        <div className="no-print bg-white border-2 border-[#117a37] rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-[#094d22] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#d91424]" />
                <span>
                  حاسبة ميزانية الوجبات اليومية واستهلاك الميزانية (مقابل الميزانية المخصصة الكلية)
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                حساب دقيق لاستهلاك الميزانية بناءً على عدد الوجبات المقدمة فعلياً وتكلفة الوجبة الواحدة ومقارنتها الفورية مع الميزانية المخصصة الكلية للمؤسسة
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCalcMode('custom_simulation')}
                className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer ${
                  calcMode === 'custom_simulation'
                    ? 'bg-[#094d22] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                حساب حر (إدخال عدد الوجبات والأيام)
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('from_records')}
                className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer ${
                  calcMode === 'from_records'
                    ? 'bg-[#d91424] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                حساب آلي من سجل الوجبات اليومية ({totalMealsServed} وجبة)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Inputs Panel */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 text-xs">
              <div className="font-black text-[#094d22] border-b border-slate-200 pb-2">
                مدخلات حاسبة ميزانية الوجبات اليومية:
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">
                  1. الميزانية المخصصة الكلية للمطعم (الاعتماد الكلي بالدينار):
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={canteenConfig.allocatedBudgetDzd}
                  onChange={(e) =>
                    setCanteenConfig((prev) => ({
                      ...prev,
                      allocatedBudgetDzd: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-black text-sm text-[#094d22] tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    2. عدد الوجبات المقدمة فعلياً في اليوم:
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={calcMode === 'from_records'}
                    value={calcMode === 'from_records' ? avgDailyBeneficiaries : simDailyMealsServed}
                    onChange={(e) => setSimDailyMealsServed(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-black text-[#117a37] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    3. عدد أيام الإطعام الفعلية:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={220}
                    disabled={calcMode === 'from_records'}
                    value={calcMode === 'from_records' ? dailyMeals.length : simDaysCount}
                    onChange={(e) => setSimDaysCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-black text-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 self-center">فترات سريعة:</span>
                {[
                  { label: 'يوم واحد (1)', days: 1 },
                  { label: 'أسبوع (5 أيام)', days: 5 },
                  { label: 'شهر (20 يوماً)', days: 20 },
                  { label: 'فصل (60 يوماً)', days: 60 },
                  { label: 'سنة دراسية (160 يوماً)', days: 160 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setCalcMode('custom_simulation');
                      setSimDaysCount(preset.days);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      calcMode === 'custom_simulation' && simDaysCount === preset.days
                        ? 'bg-[#117a37] text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    4. تكلفة الوجبة اليومية الواحدة (دج):
                  </label>
                  <input
                    type="number"
                    min={1}
                    disabled={calcMode === 'from_records'}
                    value={calcEffectiveUnitCost}
                    onChange={(e) => setSimUnitCostDzd(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-black text-[#d91424] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    5. نفقات تموين إضافية (اختياري):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={simExtraExpensesDzd}
                    onChange={(e) => setSimExtraExpensesDzd(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Results & Budget Comparison Panel */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-emerald-50 border border-[#117a37]/30 rounded-xl p-4">
                  <div className="text-[11px] font-extrabold text-[#094d22]">
                    مجموع الوجبات المقدمة فعلياً
                  </div>
                  <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">
                    {calcTotalActualMeals.toLocaleString('ar-DZ')} وجبة
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 tabular-nums">
                    التكلفة اليومية: {calcDailyExpenditure.toLocaleString('ar-DZ')} دج/يوم
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="text-[11px] font-extrabold text-rose-900">
                    إجمالي استهلاك الميزانية الفعلي
                  </div>
                  <div className="text-2xl font-black text-[#d91424] mt-1 tabular-nums">
                    {calcTotalConsumedDzd.toLocaleString('ar-DZ')} دج
                  </div>
                  <div className="text-[11px] text-rose-800 font-bold mt-1 tabular-nums">
                    نسبة الاستهلاك: {calcConsumptionPercent}% من الكلي
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-4">
                  <div className="text-[11px] font-extrabold text-yellow-300">
                    الرصيد المتبقي من الميزانية الكلية
                  </div>
                  <div className="text-2xl font-black mt-1 tabular-nums">
                    {calcRemainingBudgetDzd.toLocaleString('ar-DZ')} دج
                  </div>
                  <div className="text-[11px] text-emerald-200 mt-1 tabular-nums">
                    يكفي لـ {calcAdditionalMealsPossible.toLocaleString('ar-DZ')} وجبة ({calcAdditionalDaysPossible} يوم)
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar vs Total Allocated Budget */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-[#094d22]">
                    مؤشر استهلاك الميزانية مقابل الاعتماد المالي المخصص الكلي ({canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج)
                  </span>
                  <span
                    className={`tabular-nums ${
                      calcDeficitDzd > 0 ? 'text-[#d91424]' : 'text-[#117a37]'
                    }`}
                  >
                    {calcConsumptionPercent}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      calcDeficitDzd > 0
                        ? 'bg-[#d91424]'
                        : calcConsumptionPercent > 80
                        ? 'bg-amber-500'
                        : 'bg-[#117a37]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, calcConsumptionPercent))}%` }}
                  />
                </div>
                {calcDeficitDzd > 0 ? (
                  <div className="text-xs font-black text-[#d91424]">
                    تنبيه مالي: إجمالي تكلفة الوجبات يتجاوز الميزانية المخصصة الكلية بعجز قدره{' '}
                    {calcDeficitDzd.toLocaleString('ar-DZ')} دج (يتطلب طلب اعتماد مالي إضافي).
                  </div>
                ) : (
                  <div className="text-xs font-bold text-[#094d22]">
                    الوضعية المالية متوازنة: الوفر المتاح يغطي {calcAdditionalDaysPossible} يوم إطعام إضافي بنفس وتيرة الاستهلاك الفعلي.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: الميزانية والوجبات اليومية والتكلفة */}
      {subTab === 'budget_meals' && (
        <>
          <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Right Column: Financial Configuration */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h3 className="text-sm font-black text-[#094d22]">
                  ضبط الميزانية السنوية وتسعيرة الوجبة والتعداد المسجل
                </h3>
                <button
                  onClick={handleApplyUnitCostToAll}
                  className="text-[11px] font-extrabold text-[#117a37] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  <span>تعميم التسعيرة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الميزانية الإجمالية المخصصة (دج)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={canteenConfig.allocatedBudgetDzd}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        allocatedBudgetDzd: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-[#094d22] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تسعيرة الوجبة اليومية الواحدة (دج)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={canteenConfig.defaultUnitCostDzd}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        defaultUnitCostDzd: Math.max(1, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-[#d91424] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    عدد التلاميذ المسجلين بالمطعم
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={canteenConfig.registeredStudentsCount}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        registeredStudentsCount: Math.max(1, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مسير المطعم / المقتصد
                  </label>
                  <input
                    type="text"
                    value={canteenConfig.canteenManagerName}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        canteenManagerName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    إعانة الدولة للتغذية المدرسية (دج)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={canteenConfig.stateGrantDzd}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        stateGrantDzd: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مساهمة البلدية / العائلات (دج)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={canteenConfig.municipalityContributionDzd}
                    onChange={(e) =>
                      setCanteenConfig((prev) => ({
                        ...prev,
                        municipalityContributionDzd: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-slate-700">مؤشر استهلاك ميزانية المطعم المدرسي</span>
                  <span className="text-[#d91424] tabular-nums">{budgetUsedPercent}% مستهلك</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-l from-[#117a37] to-[#d91424] h-full rounded-full transition-all"
                    style={{ width: `${Math.max(3, budgetUsedPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 tabular-nums">
                  <span>المستهلك: {totalConsumedCostDzd.toLocaleString('ar-DZ')} دج</span>
                  <span>المتبقي: {remainingBudgetDzd.toLocaleString('ar-DZ')} دج</span>
                </div>
              </div>
            </div>

            {/* Left Column: Add New Daily Meal Record */}
            <form
              onSubmit={handleAddDailyMeal}
              className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              <h3 className="text-sm font-black text-[#094d22] border-b border-slate-200 pb-2.5">
                إضافة حصيلة وجبة يومية جديدة وحساب تكلفتها الفورية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ اليوم</label>
                  <input
                    type="date"
                    value={newMealDate}
                    onChange={(e) => setNewMealDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اليوم الدراسي</label>
                  <select
                    value={newMealDay}
                    onChange={(e) => setNewMealDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
                  >
                    <option value="الأحد">الأحد</option>
                    <option value="الاثنين">الاثنين</option>
                    <option value="الثلاثاء">الثلاثاء</option>
                    <option value="الأربعاء">الأربعاء</option>
                    <option value="الخميس">الخميس</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد المستفيدين الفعلي</label>
                  <input
                    type="number"
                    min={0}
                    value={newMealActual}
                    onChange={(e) => setNewMealActual(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-[#117a37] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تكلفة الوجبة (دج)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMealUnitCost}
                    onChange={(e) => setNewMealUnitCost(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-[#d91424] tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">الطبق الرئيسي للوجبة الساخنة</label>
                  <input
                    type="text"
                    placeholder="مثال: عدس بلحم العجل + سلطة خضراء..."
                    value={newMealMain}
                    onChange={(e) => setNewMealMain(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    المكملات الغذائية (الفاكهة / المشتقات / الخبز)
                  </label>
                  <input
                    type="text"
                    value={newMealSupp}
                    onChange={(e) => setNewMealSupp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">
                    ملاحظات الرقابة الصحية والوجبة الشاهدة
                  </label>
                  <input
                    type="text"
                    value={newMealNotes}
                    onChange={(e) => setNewMealNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إدراج الوجبة ({(newMealActual * newMealUnitCost).toLocaleString('ar-DZ')} دج)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Interactive Table of Daily Meals & Cost Calculation */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#094d22]">
                  سجل المتابعة اليومية للوجبات المقدمة وعدد المستفيدين والتكلفة المالية
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  عدّل عدد المستفيدين اليومي أو سعر الوجبة مباشرة ليتم تحيين التكلفة الإجمالية والرصيد المتبقي فوراً
                </p>
              </div>
              <div className="text-xs font-black text-[#d91424] bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg tabular-nums">
                إجمالي تكلفة الوجبات المسجلة: {totalConsumedCostDzd.toLocaleString('ar-DZ')} دج
              </div>
            </div>

            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-2.5">#</th>
                  <th className="py-2.5 px-2.5">التاريخ واليوم</th>
                  <th className="py-2.5 px-2.5">قائمة الوجبة الساخنة والمكملات</th>
                  <th className="py-2.5 px-2.5 text-center">المسجلون</th>
                  <th className="py-2.5 px-2.5 text-center">المستفيدون الفعليون</th>
                  <th className="py-2.5 px-2.5 text-center">الغياب</th>
                  <th className="py-2.5 px-2.5 text-center">سعر الوجبة (دج)</th>
                  <th className="py-2.5 px-2.5 text-center">التكلفة اليومية الإجمالية</th>
                  <th className="py-2.5 px-2.5 text-center">الطبق الشاهد</th>
                  <th className="py-2.5 px-2.5">ملاحظات الرقابة</th>
                  <th className="py-2.5 px-2.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dailyMeals.map((meal, index) => {
                  const absences = Math.max(0, meal.registeredBeneficiaries - meal.actualBeneficiaries);
                  const dailyTotalCost = meal.actualBeneficiaries * meal.unitCostDzd;
                  return (
                    <tr key={meal.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2.5 font-bold tabular-nums">{index + 1}</td>
                      <td className="py-2.5 px-2.5 font-bold whitespace-nowrap">
                        <div>{meal.dayName}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">{meal.date}</div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <input
                          type="text"
                          value={meal.menuMain}
                          onChange={(e) => handleUpdateMealField(meal.id, 'menuMain', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-extrabold text-slate-900 mb-1"
                        />
                        <input
                          type="text"
                          value={meal.menuSupplement}
                          onChange={(e) => handleUpdateMealField(meal.id, 'menuSupplement', e.target.value)}
                          className="w-full px-2 py-0.5 border border-slate-200 rounded text-[11px] text-slate-600"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={meal.registeredBeneficiaries}
                          onChange={(e) =>
                            handleUpdateMealField(meal.id, 'registeredBeneficiaries', e.target.value)
                          }
                          className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={meal.actualBeneficiaries}
                          onChange={(e) =>
                            handleUpdateMealField(meal.id, 'actualBeneficiaries', e.target.value)
                          }
                          className="w-16 px-1.5 py-1 border-2 border-[#117a37] bg-emerald-50/50 rounded text-center font-black text-[#094d22] tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-slate-600 tabular-nums">
                        {absences}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="number"
                          min={1}
                          value={meal.unitCostDzd}
                          onChange={(e) => handleUpdateMealField(meal.id, 'unitCostDzd', e.target.value)}
                          className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-black text-[#d91424] tabular-nums whitespace-nowrap">
                        {dailyTotalCost.toLocaleString('ar-DZ')} دج
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={meal.witnessMealKept}
                          onChange={(e) =>
                            handleUpdateMealField(meal.id, 'witnessMealKept', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#117a37] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2.5">
                        <input
                          type="text"
                          value={meal.notes}
                          onChange={(e) => handleUpdateMealField(meal.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SUB-TAB 3: الجدول الغذائي الأسبوعي المعتمد */}
      {subTab === 'weekly_menu' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22]">
            الجدول الغذائي الأسبوعي المتوازن المعتمد من طرف الطبيب المدرسي (UDS) ومفتش التغذية المدرسية
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">اليوم الدراسي</th>
                  <th className="py-2.5 px-3">الطبق الرئيسي الساخن (بروتينات + نشويات/بقوليات)</th>
                  <th className="py-2.5 px-3">المكمل الغذائي والفاكهة الموسمية</th>
                  <th className="py-2.5 px-3">القيمة الطاقوية التقديرية</th>
                  <th className="py-2.5 px-3">توقيت التوزيع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dailyMeals.slice(0, 5).map((m, i) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-black text-[#d91424]">{m.dayName}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{m.menuMain}</td>
                    <td className="py-2.5 px-3 font-bold text-[#094d22]">{m.menuSupplement}</td>
                    <td className="py-2.5 px-3 font-bold tabular-nums">{780 + i * 25} سعرة حرارية (Kcal)</td>
                    <td className="py-2.5 px-3 font-bold">
                      {m.dayName === 'الثلاثاء' ? '11:00 - 11:30 صباحاً' : '11:15 - 12:30 زوالاً'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: قائمة التلاميذ المستفيدين من الإطعام */}
      {subTab === 'beneficiaries' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#094d22]">
                القائمة الاسمية للتلاميذ المستفيدين من الإطعام ({canteenConfig.registeredStudentsCount} تلميذ مسجل)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تصنيف المستفيدين حسب الحالة الاجتماعية والصحية (معوز · يتيم · بعد المسافة · ذوي الدخل الضعيف)
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddBeneficiaryStudent}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs"
          >
            <input
              type="text"
              placeholder="اسم ولقب التلميذ(ة)..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
            />
            <input
              type="text"
              placeholder="المستوى / القسم..."
              value={newStudentLevel}
              onChange={(e) => setNewStudentLevel(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
            />
            <select
              value={newStudentCat}
              onChange={(e) => setNewStudentCat(e.target.value as CanteenBeneficiaryStudent['socialCategory'])}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
            >
              <option value="معوز">معوز</option>
              <option value="يتيم">يتيم</option>
              <option value="بعد المسافة">بعد المسافة</option>
              <option value="ذوي الدخل الضعيف">ذوي الدخل الضعيف</option>
            </select>
            <input
              type="text"
              placeholder="اسم الولي..."
              value={newStudentGuardian}
              onChange={(e) => setNewStudentGuardian(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
            />
            <button
              type="submit"
              className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة للمستفيدين</span>
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">اسم ولقب التلميذ(ة)</th>
                  <th className="py-2.5 px-3">المستوى الدراسي</th>
                  <th className="py-2.5 px-3">الصفة الاجتماعية</th>
                  <th className="py-2.5 px-3">اسم ولقب الولي</th>
                  <th className="py-2.5 px-3">الملاحظة الصحية / الحساسية الغذائية</th>
                  <th className="py-2.5 px-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {beneficiariesList.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold tabular-nums">{idx + 1}</td>
                    <td className="py-2 px-3 font-extrabold text-slate-900">{st.fullName}</td>
                    <td className="py-2 px-3 font-bold text-[#094d22]">{st.levelTitle}</td>
                    <td className="py-2 px-3 font-bold text-[#d91424]">{st.socialCategory}</td>
                    <td className="py-2 px-3 font-bold">{st.guardianName}</td>
                    <td className="py-2 px-3 text-slate-600">{st.healthAllergyNote}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() =>
                          setBeneficiariesList((prev) => prev.filter((item) => item.id !== st.id))
                        }
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: جرد المخزون الغذائي والتموين */}
      {subTab === 'stock' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22]">
            بطاقة جرد ومراقبة مخزون المواد الغذائية وحركة التموين بالمطعم
          </h3>

          <form
            onSubmit={handleAddStockItem}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs"
          >
            <input
              type="text"
              placeholder="اسم المادة الغذائية..."
              value={newStockName}
              onChange={(e) => setNewStockName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white sm:col-span-2"
            />
            <select
              value={newStockCat}
              onChange={(e) => setNewStockCat(e.target.value as CanteenStockItem['category'])}
              className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
            >
              <option value="بقوليات وعجائن">بقوليات وعجائن</option>
              <option value="لحوم ودواجن">لحوم ودواجن</option>
              <option value="خضر وفواكه">خضر وفواكه</option>
              <option value="حليب ومشتقاته">حليب ومشتقاته</option>
              <option value="مواد بقالة وخبز">مواد بقالة وخبز</option>
            </select>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={1}
                value={newStockIn}
                onChange={(e) => setNewStockIn(Number(e.target.value) || 0)}
                className="w-full px-2 py-2 border border-slate-300 rounded-lg font-bold tabular-nums bg-white"
              />
              <select
                value={newStockUnit}
                onChange={(e) => setNewStockUnit(e.target.value as CanteenStockItem['unit'])}
                className="px-2 py-2 border border-slate-300 rounded-lg font-bold bg-white"
              >
                <option value="كغ">كغ</option>
                <option value="لتر">لتر</option>
                <option value="علبة">علبة</option>
                <option value="وحدة">وحدة</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة للمخزن</span>
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">المادة الغذائية</th>
                  <th className="py-2.5 px-3">الصنف</th>
                  <th className="py-2.5 px-3 text-center">الكمية المستلمة</th>
                  <th className="py-2.5 px-3 text-center">الكمية المستهلكة</th>
                  <th className="py-2.5 px-3 text-center">المخزون المتبقي</th>
                  <th className="py-2.5 px-3">تاريخ الصلاحية</th>
                  <th className="py-2.5 px-3">الممون المعتمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockItems.map((st) => {
                  const rem = Math.max(0, st.qtyIn - st.qtyConsumed);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{st.itemName}</td>
                      <td className="py-2.5 px-3 font-bold text-[#094d22]">{st.category}</td>
                      <td className="py-2.5 px-3 text-center font-bold tabular-nums">
                        {st.qtyIn} {st.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={st.qtyIn}
                          value={st.qtyConsumed}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setStockItems((prev) =>
                              prev.map((x) => (x.id === st.id ? { ...x, qtyConsumed: val } : x))
                            );
                          }}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-[#117a37] tabular-nums">
                        {rem} {st.unit}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#d91424] tabular-nums">{st.expiryDate}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">{st.supplierName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: الرقابة الصحية والطبق الشاهد والعمال */}
      {subTab === 'hygiene' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#094d22]">
            سجل الرقابة الصحية والوقائية، الطبق الشاهد (48 ساعة)، والمتابعة الطبية لأعوان المطعم
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                  <th className="py-2.5 px-3">اسم ولقب العون</th>
                  <th className="py-2.5 px-3">الوظيفة بالمطعم</th>
                  <th className="py-2.5 px-3">تاريخ آخر فحص طبي وتحاليل</th>
                  <th className="py-2.5 px-3">الوضعية الصحية</th>
                  <th className="py-2.5 px-3">المهام اليومية والوقائية المسندة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hygieneWorkers.map((hw) => (
                  <tr key={hw.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{hw.workerName}</td>
                    <td className="py-2.5 px-3 font-bold text-[#094d22]">{hw.role}</td>
                    <td className="py-2.5 px-3 font-bold tabular-nums">{hw.medicalCertDate}</td>
                    <td className="py-2.5 px-3 font-black text-[#117a37]">{hw.medicalStatus}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{hw.dailyTask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Official A4 Landscape Sheet for Active Canteen Sub-Tab */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>المقاطعة : {institution.district}</div>
              <div>المؤسسة : {institution.school}</div>
              <div>مسير المطعم / المقتصد : {canteenConfig.canteenManagerName}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    {(subTab === 'budget_meals' || subTab === 'meal_calculator') &&
                      `الكشف الرسمي لمتابعة الوجبات اليومية وحاسبة الميزانية — ${canteenSystemTitle}`}
                    {subTab === 'weekly_menu' &&
                      `الجدول الغذائي الأسبوعي الرسمي المعتمد — ${canteenSystemTitle}`}
                    {subTab === 'beneficiaries' &&
                      `القائمة الاسمية الرسمية للتلاميذ المستفيدين من الإطعام`}
                    {subTab === 'stock' &&
                      `بطاقة الجرد الرسمي للمخزون الغذائي وحركة التموين`}
                    {subTab === 'hygiene' &&
                      `سجل الرقابة الصحية والنظافة والمتابعة الطبية لأعوان الإطعام`}
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>المدير(ة) : {institution.directorName}</div>
              <div>الطور : {canteenSystemTitle}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          {/* Summary Financial Bar inside Print Sheet */}
          <div className="grid grid-cols-5 gap-2 my-2 text-center text-[11px] font-black">
            <div className="border border-black p-1.5 bg-[#f8fafc]">
              <div>الميزانية المخصصة الكلية</div>
              <div className="text-xs text-[#094d22] tabular-nums">
                {canteenConfig.allocatedBudgetDzd.toLocaleString('ar-DZ')} دج
              </div>
            </div>
            <div className="border border-black p-1.5 bg-[#f8fafc]">
              <div>عدد التلاميذ المسجلين</div>
              <div className="text-xs text-[#094d22] tabular-nums">
                {canteenConfig.registeredStudentsCount} تلميذ
              </div>
            </div>
            <div className="border border-black p-1.5 bg-[#f8fafc]">
              <div>مجموع الوجبات المقدمة فعلياً</div>
              <div className="text-xs text-[#094d22] tabular-nums">
                {subTab === 'meal_calculator' ? calcTotalActualMeals : totalMealsServed} وجبة
              </div>
            </div>
            <div className="border border-black p-1.5 bg-[#fff1f2]">
              <div>التكلفة الإجمالية المستهلكة</div>
              <div className="text-xs text-[#d91424] tabular-nums">
                {(subTab === 'meal_calculator' ? calcTotalConsumedDzd : totalConsumedCostDzd).toLocaleString('ar-DZ')} دج
              </div>
            </div>
            <div className="border border-black p-1.5 bg-[#f0fdf4]">
              <div>الرصيد المالي المتبقي</div>
              <div className="text-xs text-[#094d22] tabular-nums">
                {(subTab === 'meal_calculator' ? calcRemainingBudgetDzd : remainingBudgetDzd).toLocaleString('ar-DZ')} دج
              </div>
            </div>
          </div>

          {(subTab === 'budget_meals' || subTab === 'meal_calculator' || subTab === 'weekly_menu') && (
            <table className="timetable-grid mt-1">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '35px' }}>الرقم</th>
                  <th style={{ width: '95px' }}>اليوم والتاريخ</th>
                  <th>الوجبة الساخنة المقدمة والمكملات</th>
                  <th style={{ width: '70px' }}>المسجلون</th>
                  <th style={{ width: '85px' }}>المستفيدون الفعليون</th>
                  <th style={{ width: '60px' }}>الغياب</th>
                  <th style={{ width: '75px' }}>تسعيرة الوجبة</th>
                  <th style={{ width: '105px' }}>التكلفة اليومية</th>
                  <th style={{ width: '75px' }}>الطبق الشاهد</th>
                  <th>ملاحظات المراقبة الصحية</th>
                </tr>
              </thead>
              <tbody>
                {dailyMeals.map((m, i) => {
                  const abs = Math.max(0, m.registeredBeneficiaries - m.actualBeneficiaries);
                  const cost = m.actualBeneficiaries * m.unitCostDzd;
                  return (
                    <tr key={m.id}>
                      <td className="font-bold tabular-nums py-1">{i + 1}</td>
                      <td className="font-bold py-1">
                        {m.dayName} ({m.date})
                      </td>
                      <td className="text-right px-2 font-bold py-1">
                        {m.menuMain} — <span className="font-normal">{m.menuSupplement}</span>
                      </td>
                      <td className="tabular-nums font-bold">{m.registeredBeneficiaries}</td>
                      <td className="tabular-nums font-black text-[#094d22]">
                        {m.actualBeneficiaries}
                      </td>
                      <td className="tabular-nums">{abs}</td>
                      <td className="tabular-nums font-bold">{m.unitCostDzd} دج</td>
                      <td className="tabular-nums font-black text-[#d91424]">
                        {cost.toLocaleString('ar-DZ')} دج
                      </td>
                      <td className="font-bold">{m.witnessMealKept ? 'محفوظ 48 سا' : '—'}</td>
                      <td className="text-right px-2 text-[10px]">{m.notes}</td>
                    </tr>
                  );
                })}
                <tr className="bg-[#e8f5e9] font-black">
                  <td colSpan={3} className="py-1.5">
                    المجموع الإجمالي لاستهلاك الوجبات والتكلفة المالية
                  </td>
                  <td className="tabular-nums">{totalRegisteredSum}</td>
                  <td className="tabular-nums text-[#094d22]">{totalMealsServed} وجبة</td>
                  <td className="tabular-nums">
                    {Math.max(0, totalRegisteredSum - totalMealsServed)}
                  </td>
                  <td className="tabular-nums">{canteenConfig.defaultUnitCostDzd} دج</td>
                  <td className="tabular-nums text-[#d91424]">
                    {totalConsumedCostDzd.toLocaleString('ar-DZ')} دج
                  </td>
                  <td colSpan={2}>
                    الرصيد المتبقي: {remainingBudgetDzd.toLocaleString('ar-DZ')} دج
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {subTab === 'beneficiaries' && (
            <table className="timetable-grid mt-1">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '40px' }}>الرقم</th>
                  <th>اسم ولقب التلميذ(ة) المستفيد(ة)</th>
                  <th>المستوى الدراسي</th>
                  <th>الصفة الاجتماعية</th>
                  <th>اسم ولقب الولي</th>
                  <th>الملاحظة الصحية / الغذائية</th>
                </tr>
              </thead>
              <tbody>
                {beneficiariesList.map((st, idx) => (
                  <tr key={st.id}>
                    <td className="font-bold tabular-nums py-1.5">{idx + 1}</td>
                    <td className="font-extrabold text-right px-2">{st.fullName}</td>
                    <td className="font-bold">{st.levelTitle}</td>
                    <td className="font-bold text-[#d91424]">{st.socialCategory}</td>
                    <td className="font-bold">{st.guardianName}</td>
                    <td>{st.healthAllergyNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {subTab === 'stock' && (
            <table className="timetable-grid mt-1">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '40px' }}>الرقم</th>
                  <th>بيان المادة الغذائية</th>
                  <th>الصنف</th>
                  <th>الكمية المستلمة</th>
                  <th>الكمية المستهلكة</th>
                  <th>المخزون المتبقي</th>
                  <th>تاريخ الصلاحية</th>
                  <th>الممون المعتمد</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((st, idx) => (
                  <tr key={st.id}>
                    <td className="font-bold tabular-nums py-1.5">{idx + 1}</td>
                    <td className="font-extrabold text-right px-2">{st.itemName}</td>
                    <td className="font-bold">{st.category}</td>
                    <td className="font-bold tabular-nums">
                      {st.qtyIn} {st.unit}
                    </td>
                    <td className="font-bold tabular-nums">
                      {st.qtyConsumed} {st.unit}
                    </td>
                    <td className="font-black text-[#094d22] tabular-nums">
                      {Math.max(0, st.qtyIn - st.qtyConsumed)} {st.unit}
                    </td>
                    <td className="font-bold text-[#d91424] tabular-nums">{st.expiryDate}</td>
                    <td className="text-right px-2">{st.supplierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {subTab === 'hygiene' && (
            <table className="timetable-grid mt-1">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '40px' }}>الرقم</th>
                  <th>اسم ولقب العون</th>
                  <th>الوظيفة بالمطعم</th>
                  <th>تاريخ الشهادة الطبية الدورية</th>
                  <th>الوضعية الصحية</th>
                  <th>المهام الوقائية والصحية اليومية</th>
                </tr>
              </thead>
              <tbody>
                {hygieneWorkers.map((hw, idx) => (
                  <tr key={hw.id}>
                    <td className="font-bold tabular-nums py-2">{idx + 1}</td>
                    <td className="font-extrabold text-right px-2">{hw.workerName}</td>
                    <td className="font-bold">{hw.role}</td>
                    <td className="font-bold tabular-nums">{hw.medicalCertDate}</td>
                    <td className="font-black text-[#094d22]">{hw.medicalStatus}</td>
                    <td className="text-right px-2">{hw.dailyTask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="footer-signatures mt-5">
            <div>إمضاء مسير المطعم / المقتصد</div>
            <div>إمضاء وختم السيد(ة) مدير(ة) المؤسسة</div>
            <div>مصادقة مصالح البلدية / الوصاية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
