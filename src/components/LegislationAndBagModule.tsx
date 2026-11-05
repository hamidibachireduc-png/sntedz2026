import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Briefcase,
  Search,
  Printer,
  Download,
  CheckSquare,
  FileText,
  FolderKanban,
  Plus,
  Trash2,
  CalendarClock,
  BellRing,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Teacher, rankDisplayTitle, specDisplayTitle, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

interface LegislationItem {
  id: string;
  refNumber: string;
  title: string;
  category: 'القانون الأساسي 25-54' | 'مهام المدير' | 'الجماعة التربوية' | 'الرخص والغيابات' | 'الحوادث والأمن';
  summary: string;
  articles: string[];
}

const LEGISLATION_DATA: LegislationItem[] = [
  {
    id: 'leg1',
    refNumber: 'المرسوم التنفيذي 25-54',
    title: 'القانون الأساسي الخاص بالموظفين المنتمين للأسلاك الخاصة بالتربية الوطنية',
    category: 'القانون الأساسي 25-54',
    summary:
      'يحدد الأحكام الخاصة المطبقة على موظفي التعليم وموظفي الإدارة والتفتيش، ويستحدث رتبة أستاذ مميز ويعيد تصنيف رتب التعليم الابتدائي (أستاذ تعليم ابتدائي، أستاذ قسم أول، أستاذ قسم ثانٍ، أستاذ مميز) ومنصب مدير المدرسة الابتدائية.',
    articles: [
      'يكلف مدير المدرسة الابتدائية بالتنشيط البيداغوجي والتنسيق الإداري والتربوي والسهر على تطبيق النظام الداخلي.',
      'يعتبر المدير الآمر بالصرف للميزانية المخصصة للمؤسسة في إطار القوانين السارية والمسؤول الأول عن حفظ النظام والأمن.',
      'تصنف رتب أساتذة التعليم الابتدائي في أربع رتب متدرجة: أستاذ تعليم ابتدائي، أستاذ قسم أول، أستاذ قسم ثانٍ، وأستاذ مميز.',
      'تراعى الأقدمية والرتبة في إسناد الأقسام التربوية وتوزيع المهام البيداغوجية ومرافقة الأساتذة المتربصين.',
    ],
  },
  {
    id: 'leg2',
    refNumber: 'القرار الوزاري 778 / المعدل',
    title: 'تنظيم الجماعة التربوية وسير المدرسة الابتدائية',
    category: 'الجماعة التربوية',
    summary:
      'ينظم العلاقات داخل المؤسسة التربوية بين الإدارة، الأساتذة، التلاميذ، وأولياء الأمور، ويحدد ضوابط المواظبة والانضباط والحراسة.',
    articles: [
      'يفتح باب المدرسة قبل انطلاق الدروس بـ 15 دقيقة على الأقل، ويتولى الأساتذة المناوبون حراسة التلاميذ في الساحة.',
      'يمنع منعاً باتاً إخراج التلميذ من القسم كعقوبة أو حرمانه من الاستراحة، كما يمنع العقاب البدني أو المعنوي.',
      'تتم مراقبة غيابات التلاميذ يومياً في سجل المناداة مع إشعار الأولياء كتابياً عند تكرار الغياب.',
    ],
  },
  {
    id: 'leg3',
    refNumber: 'المهام البيداغوجية والإدارية للمدير',
    title: 'المرجعية القانونية لمهام مدير المدرسة الابتدائية',
    category: 'مهام المدير',
    summary:
      'تجمع مهام مدير المدرسة الابتدائية بين الدور البيداغوجي (المرافقة، الزيارات الصفية، رئاسة المجالس) والدور الإداري والاجتماعي.',
    articles: [
      'المهام البيداغوجية: إعداد التنظيم التربوي، ضبط جداول التوقيت الأسبوعي، مراقبة وتأشير الكراس اليومي والمذكرات، القيام بزيارات توجيهية للأقسام.',
      'المهام الإدارية: مسك السجلات الرسمية الـ 12 (سجل القيد العام، سجل الموظفين، سجل البريد الصادر والوارد، سجل الصحة المدرسية، سجل التواصل والتبليغ، سجل الشركاء، سجل الجرد العام...).',
      'المهام الاجتماعية والصحية: الإشراف المباشر على المطعم المدرسي، مراقبة النظافة والوجبات، والتنسيق مع وحدة الكشف والمتابعة (UDS).',
    ],
  },
  {
    id: 'leg4',
    refNumber: 'الأمر 06-03 والأنظمة التطبيقية',
    title: 'نظام الرخص الاستثنائية والغيابات والعطل المرضية للموظفين',
    category: 'الرخص والغيابات',
    summary:
      'يضبط حالات الغياب المرخص به قانوناً مع الاحتفاظ بالراتب (مناسبات عائلية، حج، امتحانات) وإجراءات التبليغ عن العطل المرضية.',
    articles: [
      'يستفيد الموظف من 03 أيام غياب مدفوعة الأجر بمناسبة: زواج الموظف، ازدياد مولود، ختان، زواج أحد الفروع، أو وفاة أحد الأصول/الفروع/الحواشي.',
      'يجب إيداع الشهادة الطبية للعطلة المرضية لدى إدارة المؤسسة في أجل لا يتعدى 48 ساعة عمل.',
      'كل غياب غير مبرر يعرض صاحبه لاستفسار كتابي متبوع بخصم من الراتب والمنحة وفق قاعدة الخدمة غير المنجزة.',
    ],
  },
  {
    id: 'leg5',
    refNumber: 'المنشور الوزاري الخاص بالحوادث المدرسية',
    title: 'الإجراءات الاستعجالية والتصريح بالحوادث المدرسية والتعويض',
    category: 'الحوادث والأمن',
    summary:
      'يحدد مسؤولية الإدارة والأستاذ المناوب عند وقوع حادث لتلميذ داخل المؤسسة، وآجال التصريح لدى مصالح الضمان الاجتماعي والوصاية.',
    articles: [
      'إسعاف التلميذ المصاب فوراً والاتصال بالحماية المدنية وولي أمر التلميذ.',
      'تحرير تقرير مفصل من طرف الأستاذ المشرف أو المناوب يتضمن ظروف ومكان وساعة الحادث وشهادة الشهود.',
      'إرسال التصريح بالحادث المدرسي في ظرف 48 ساعة إلى مديرية التربية ومصالح التأمين والضمان الاجتماعي.',
    ],
  },
];

interface DutyChecklistItem {
  id: string;
  period: 'يومية' | 'أسبوعية' | 'شهرية' | 'فصلية وسنوية';
  task: string;
  done: boolean;
}

const INITIAL_DUTIES: DutyChecklistItem[] = [
  { id: 'd1', period: 'يومية', task: 'مراقبة حضور الأساتذة وتنظيم الاستخلاف الفوري للأقسام الشاغرة صباحاً ومساءً', done: true },
  { id: 'd2', period: 'يومية', task: 'تفقد نظافة الحجرات والمرافق الصحية ومعاينة وجبة المطعم المدرسي وحفظ الشاهد الغذائي', done: true },
  { id: 'd3', period: 'يومية', task: 'مراقبة مواظبة التلاميذ وتوقيع سجل الغيابات اليومي والبريد الإداري الصادر والوارد', done: true },
  { id: 'd4', period: 'أسبوعية', task: 'تأشير الكراريس اليومية للأساتذة ومذكرات الإعداد التربوي نهاية الأسبوع', done: true },
  { id: 'd5', period: 'أسبوعية', task: 'إجراء زيارتين توجيهيتين على الأقل للأقسام وتدوين الملاحظات البيداغوجية', done: false },
  { id: 'd6', period: 'شهرية', task: 'إنجاز الكشف الشهري لغيابات الموظفين وإرساله لمصلحة الموظفين بمديرية التربية', done: true },
  { id: 'd7', period: 'شهرية', task: 'ضبط وضعية استهلاك المطعم المدرسي والتعداد الشهري للتلاميذ الحاضرين', done: false },
  { id: 'd8', period: 'فصلية وسنوية', task: 'رئاسة مجلس الأساتذة لتقييم نتائج الفصول وضبط قوائم المعالجة البيداغوجية', done: true },
  { id: 'd9', period: 'فصلية وسنوية', task: 'إنجاز التقرير العام لتسيير المؤسسة وجرد الممتلكات السنوي وسجل الاستقصاء الوجيز', done: false },
];

type BagDocType =
  | 'pv_install'
  | 'explanation_req'
  | 'work_cert'
  | 'absence_auth'
  | 'bordereau'
  | 'accident_report';

export type DirectorRegistryId =
  | 'reg_incoming_mail'
  | 'reg_outgoing_mail'
  | 'reg_school_health'
  | 'reg_communication'
  | 'reg_partners'
  | 'reg_students_matricule'
  | 'reg_staff_personnel'
  | 'reg_staff_attendance'
  | 'reg_general_inventory'
  | 'reg_inspection_visits'
  | 'reg_councils_delib'
  | 'reg_accidents_safety';

export interface RegistryEntryRow {
  id: string;
  refNum: string;
  date: string;
  partyOrTarget: string;
  subjectOrDetail: string;
  actionOrObservation: string;
}

export interface DirectorRegistryDefinition {
  id: DirectorRegistryId;
  numberLabel: string;
  title: string;
  legalRef: string;
  col1Label: string;
  col2Label: string;
  col3Label: string;
  col4Label: string;
  col5Label: string;
}

export interface ScheduledInspectionVisit {
  id: string;
  refCode: string;
  inspectorName: string;
  inspectorSpecialty:
    | 'مفتش اللغة العربية'
    | 'مفتش اللغة الفرنسية'
    | 'مفتش اللغة الإنجليزية'
    | 'مفتش اللغة الأمازيغية'
    | 'مفتش التربية البدنية'
    | 'مفتش الإدارة المدرسية'
    | 'مفتش التغذية المدرسية والمطاعم';
  targetTeacherName: string;
  targetClassGroup: string;
  visitPurpose:
    | 'زيارة تفتيش وتنقيط (ترقية)'
    | 'امتحان التثبيت والترسيم'
    | 'زيارة توجيهية وتكوينية'
    | 'تفتيش إداري وبيداغوجي للمؤسسة'
    | 'مراقبة المطعم المدرسي والتغذية'
    | 'ندوة تربوية تطبيقية';
  visitDate: string;
  visitTimeSlot: string;
  status: 'مجدولة قيد التحضير' | 'منجزة وموثقة' | 'مؤجلة';
  alertDaysBefore: number;
  readinessChecklist: {
    notifiedTeacher: boolean;
    checkedDailyNotebook: boolean;
    preparedAdminDossier: boolean;
    preparedRegistry10: boolean;
  };
  lessonTopic: string;
  awardedScore: string;
  positiveObservations: string;
  recordedDeficiencies: string;
  inspectorRecommendations: string;
  followUpDeadline: string;
}

const INITIAL_INSPECTOR_VISITS: ScheduledInspectionVisit[] = [
  {
    id: 'insp_1',
    refCode: 'تفتيش-01/2026',
    inspectorName: 'السيد المفتش: محمد الصالح بن يونس',
    inspectorSpecialty: 'مفتش اللغة العربية',
    targetTeacherName: 'أ. فاطمة الزهراء بوزيد',
    targetClassGroup: 'السنة الخامسة ابتدائي — الفوج 01 (قاعة 06)',
    visitPurpose: 'زيارة تفتيش وتنقيط (ترقية)',
    visitDate: '2026-11-06',
    visitTimeSlot: '08:30 - 10:15',
    status: 'مجدولة قيد التحضير',
    alertDaysBefore: 3,
    readinessChecklist: {
      notifiedTeacher: true,
      checkedDailyNotebook: true,
      preparedAdminDossier: true,
      preparedRegistry10: false,
    },
    lessonTopic: 'فهم المكتوب والظواهر النحوية + وضعية إدماجية',
    awardedScore: 'قيد التقييم',
    positiveObservations: 'بانتظار إجراء الزيارة الميدانية وتدوين الملاحظات الرسمية.',
    recordedDeficiencies: 'لا توجد حالياً',
    inspectorRecommendations: 'تحضير دفاتر المعالجة البيداغوجية وكراريس القسم للاطلاع عليها.',
    followUpDeadline: '2026-11-06',
  },
  {
    id: 'insp_2',
    refCode: 'تفتيش-02/2026',
    inspectorName: 'السيد المفتش: كمال الدين لعروسي',
    inspectorSpecialty: 'مفتش اللغة الفرنسية',
    targetTeacherName: 'أ. ياسين بن دحمان',
    targetClassGroup: 'السنة الرابعة ابتدائي — الفوج 01 (قاعة 05)',
    visitPurpose: 'امتحان التثبيت والترسيم',
    visitDate: '2026-11-09',
    visitTimeSlot: '09:30 - 11:15',
    status: 'مجدولة قيد التحضير',
    alertDaysBefore: 7,
    readinessChecklist: {
      notifiedTeacher: true,
      checkedDailyNotebook: true,
      preparedAdminDossier: false,
      preparedRegistry10: false,
    },
    lessonTopic: 'Compréhension de l’écrit & Production écrite (4AP)',
    awardedScore: 'قيد التقييم',
    positiveObservations: 'تشكيل لجنة الترسيم وإشعار الأساتذة الممتحنين.',
    recordedDeficiencies: 'استكمال بطاقة التقييم الفردي للمتربص.',
    inspectorRecommendations: 'مراجعة دفتر التكوين البيداغوجي التحضيري والمذكرات النموذجية.',
    followUpDeadline: '2026-11-09',
  },
  {
    id: 'insp_3',
    refCode: 'تفتيش-03/2026',
    inspectorName: 'السيد المفتش: عبد الحفيظ مرزوقي',
    inspectorSpecialty: 'مفتش الإدارة المدرسية',
    targetTeacherName: 'إدارة المؤسسة (السيد المدير + أمانة المدرسة)',
    targetClassGroup: 'مكتب المدير + المرافق الإدارية والتربوية',
    visitPurpose: 'تفتيش إداري وبيداغوجي للمؤسسة',
    visitDate: '2026-11-15',
    visitTimeSlot: '08:00 - 12:00',
    status: 'مجدولة قيد التحضير',
    alertDaysBefore: 7,
    readinessChecklist: {
      notifiedTeacher: true,
      checkedDailyNotebook: true,
      preparedAdminDossier: true,
      preparedRegistry10: true,
    },
    lessonTopic: 'مراقبة التنظيم التربوي والسجلات الرسمية الـ 12 وسجل الاستقصاء الوجيز',
    awardedScore: 'قيد التقييم',
    positiveObservations: 'جميع السجلات الـ 12 مفتوحة ومؤشرة بانتظام.',
    recordedDeficiencies: 'لا توجد',
    inspectorRecommendations: 'تحضير محاضر المجالس وبطاقة متابعة المطعم المدرسي.',
    followUpDeadline: '2026-11-15',
  },
  {
    id: 'insp_4',
    refCode: 'تفتيش-04/2026',
    inspectorName: 'السيد المفتش: محمد الصالح بن يونس',
    inspectorSpecialty: 'مفتش اللغة العربية',
    targetTeacherName: 'أ. عبد القادر بن صالح',
    targetClassGroup: 'السنة الأولى ابتدائي — الفوج 01 (قاعة 01)',
    visitPurpose: 'زيارة توجيهية وتكوينية',
    visitDate: '2026-10-20',
    visitTimeSlot: '08:15 - 09:45',
    status: 'منجزة وموثقة',
    alertDaysBefore: 3,
    readinessChecklist: {
      notifiedTeacher: true,
      checkedDailyNotebook: true,
      preparedAdminDossier: true,
      preparedRegistry10: true,
    },
    lessonTopic: 'فهم المنطوق واكتشاف الحرف والوعي الصوتي والخطي',
    awardedScore: '18.50 / 20 (ممتاز)',
    positiveObservations:
      'تحكم بيداغوجي رفيع في مقاربة الوعي الصوتي، توظيف فعال للوسائل البصرية واللوحة، وتشجيع مستمر للمتعلمين.',
    recordedDeficiencies: 'ضرورة تخصيص حيز إضافي للتدريب الفردي على الخط للتلاميذ المتعثرين.',
    inspectorRecommendations:
      'تثمين خبرة الأستاذ المميز في مرافقة الأساتذة حديثي التوظيف وتنشيط حصة نموذجية داخلية.',
    followUpDeadline: 'تم التنفيذ والتوثيق',
  },
];

const DIRECTOR_12_REGISTRIES: DirectorRegistryDefinition[] = [
  {
    id: 'reg_incoming_mail',
    numberLabel: '01',
    title: 'سجل البريد الوارد (Registre du Courrier Arrivée)',
    legalRef: 'التنظيم الإداري للمراسلات الرسمية',
    col1Label: 'رقم القيد الوارد',
    col2Label: 'تاريخ الورود',
    col3Label: 'الجهة المرسلة ومصدر البريد',
    col4Label: 'موضوع المراسلة الواردة والمرجع',
    col5Label: 'التوجيه والإجراء المتخذ',
  },
  {
    id: 'reg_outgoing_mail',
    numberLabel: '02',
    title: 'سجل البريد الصادر (Registre du Courrier Départ)',
    legalRef: 'التنظيم الإداري للمراسلات الصادرة',
    col1Label: 'رقم الصادر',
    col2Label: 'تاريخ الإرسال',
    col3Label: 'الجهة المرسل إليها',
    col4Label: 'موضوع المراسلة والمرفقات',
    col5Label: 'تأشيرة الإرسال / الحفظ',
  },
  {
    id: 'reg_school_health',
    numberLabel: '03',
    title: 'سجل الصحة المدرسية والنظافة (وحدة الكشف والمتابعة UDS)',
    legalRef: 'التعليمة الوزارية المشتركة للصحة المدرسية',
    col1Label: 'رقم التدخل',
    col2Label: 'تاريخ الزيارة الطبية',
    col3Label: 'الفريق الطبي (UDS) / المصلحة',
    col4Label: 'طبيعة الفحص (كشف دوري / تلقيح / مراقبة نظافة)',
    col5Label: 'عدد التلاميذ والملاحظات الطبية',
  },
  {
    id: 'reg_communication',
    numberLabel: '04',
    title: 'سجل التواصل والتبليغ الرسمي للموظفين (Registre de Notification)',
    legalRef: 'القرار 778 — الإعلام الداخلي للمناشير والتعليمات',
    col1Label: 'رقم التبليغ',
    col2Label: 'تاريخ التبليغ',
    col3Label: 'الفئة المعنية بالتبليغ',
    col4Label: 'موضوع المنشور / التعليمة / المذكرة الداخلية',
    col5Label: 'إمضاء الاطلاع والتبليغ',
  },
  {
    id: 'reg_partners',
    numberLabel: '05',
    title: 'سجل الشركاء الاجتماعيين وجمعية أولياء التلاميذ والبلدية',
    legalRef: 'القرار 778 والمنشور الإطار لجمعيات أولياء التلاميذ',
    col1Label: 'رقم اللقاء',
    col2Label: 'التاريخ',
    col3Label: 'الشريك (جمعية الأولياء / البلدية / النقابة)',
    col4Label: 'جدول الأعمال وموضوع التنسيق',
    col5Label: 'التوصيات والالتزامات المشتركة',
  },
  {
    id: 'reg_students_matricule',
    numberLabel: '06',
    title: 'سجل القيد العام للتلاميذ — الدخول والخروج (Registre Matricule)',
    legalRef: 'التنظيم التربوي ومسك الدفتر المدرسي',
    col1Label: 'رقم القيد العام',
    col2Label: 'تاريخ التسجيل',
    col3Label: 'اسم ولقب التلميذ(ة) وتاريخ الميلاد',
    col4Label: 'المستوى الدراسي واسم الولي والعنوان',
    col5Label: 'حركة التلميذ (مزاول / محول / متخرج)',
  },
  {
    id: 'reg_staff_personnel',
    numberLabel: '07',
    title: 'سجل الموظفين والهيئة التربوية والإدارية (المرسوم 25-54)',
    legalRef: 'المرسوم التنفيذي 25-54 المتضمن القانون الأساسي',
    col1Label: 'الرقم الترتيبي',
    col2Label: 'تاريخ التنصيب',
    col3Label: 'اسم ولقب الموظف(ة)',
    col4Label: 'الرتبة (25-54) والتخصص والدرجة',
    col5Label: 'الوضعية القانونية والقسم المسند',
  },
  {
    id: 'reg_staff_attendance',
    numberLabel: '08',
    title: 'سجل مواظبة وغيابات الموظفين اليومية',
    legalRef: 'الأمر 06-03 والمرسوم التنفيذي 25-54',
    col1Label: 'رقم التسجيل',
    col2Label: 'تاريخ اليوم',
    col3Label: 'اسم ولقب الموظف الغائب / المتأخر',
    col4Label: 'المدة الزمنية وطبيعة الغياب',
    col5Label: 'التبرير والقرار الإداري المتخذ',
  },
  {
    id: 'reg_general_inventory',
    numberLabel: '09',
    title: 'سجل الجرد العام للممتلكات والعتاد المدرسي (Registre d’Inventaire)',
    legalRef: 'قانون المحاسبة العمومية وجرد الأملاك المنقولة',
    col1Label: 'رقم الجرد الرسمي',
    col2Label: 'تاريخ الاستلام',
    col3Label: 'تعيين العتاد أو التجهيز ومصدره',
    col4Label: 'الكمية ومكان التخصيص بالحجرات',
    col5Label: 'حالة العتاد (جيد / صالح / للإصلاح)',
  },
  {
    id: 'reg_inspection_visits',
    numberLabel: '10',
    title: 'سجل الزيارات التربوية والتفتيشية (المفتش والمدير)',
    legalRef: 'مهام المرافقة البيداغوجية والتكوين المستمر',
    col1Label: 'رقم الزيارة',
    col2Label: 'تاريخ الزيارة',
    col3Label: 'الأستاذ(ة) المزار(ة) والقسم',
    col4Label: 'النشاط البيداغوجي وموضوع الدرس',
    col5Label: 'التوجيهات والتقدير البيداغوجي',
  },
  {
    id: 'reg_councils_delib',
    numberLabel: '11',
    title: 'سجل مداولات مجلس الأساتذة والندوات التربوية الداخلية',
    legalRef: 'القرار الوزاري المنظم لمجلس أساتذة المدرسة الابتدائية',
    col1Label: 'رقم المحضر',
    col2Label: 'تاريخ الجلسة',
    col3Label: 'طبيعة الجلسة / الندوة التربوية',
    col4Label: 'جدول الأعمال والمحاور المناقشة',
    col5Label: 'أهم القرارات والتوصيات المصادق عليها',
  },
  {
    id: 'reg_accidents_safety',
    numberLabel: '12',
    title: 'سجل الحوادث المدرسية والأمن والوقاية',
    legalRef: 'المنشور الوزاري للتصريح بالحوادث المدرسية خلال 48 ساعة',
    col1Label: 'رقم الحادث',
    col2Label: 'التاريخ والساعة',
    col3Label: 'اسم التلميذ المصاب والقسم',
    col4Label: 'مكان وظروف وقوع الحادث والأستاذ المناوب',
    col5Label: 'الإسعافات الأولية ورقم التصريح للتأمين',
  },
];

const INITIAL_REGISTRIES_RECORDS: Record<DirectorRegistryId, RegistryEntryRow[]> = {
  reg_incoming_mail: [
    {
      id: 'in1',
      refNum: '01/2026',
      date: '2026-09-05',
      partyOrTarget: 'مديرية التربية — مصلحة التنظيم التربوي',
      subjectOrDetail: 'الخريطة التربوية المعتمدة وفتح الأفواج للسنة الدراسية 2026/2027',
      actionOrObservation: 'التطبيق الفوري وضبط الإسناد',
    },
    {
      id: 'in2',
      refNum: '02/2026',
      date: '2026-10-14',
      partyOrTarget: 'وحدة الكشف والمتابعة الصحية (UDS)',
      subjectOrDetail: 'رزنامة الفحوصات الطبية الدورية لتلاميذ التحضيري والسنة الأولى ابتدائي',
      actionOrObservation: 'تحضير القوائم وقاعة الفحص الطبي',
    },
  ],
  reg_outgoing_mail: [
    {
      id: 'out1',
      refNum: '01/2026',
      date: '2026-09-16',
      partyOrTarget: 'مفتشية التعليم الابتدائي بالمقاطعة',
      subjectOrDetail: 'إرسال محضر الدخول المدرسي وجداول التوقيت الأسبوعي (نظام الدوام الواحد)',
      actionOrObservation: 'أُرسل في 03 نسخ للمصادقة',
    },
    {
      id: 'out2',
      refNum: '02/2026',
      date: '2026-10-25',
      partyOrTarget: 'مديرية التربية — مصلحة الموظفين',
      subjectOrDetail: 'إرسال الكشف الشهري لمواظبة وحضور الموظفين لشهر أكتوبر 2026',
      actionOrObservation: 'مرفق بجدول إرسال مؤشر',
    },
  ],
  reg_school_health: [
    {
      id: 'sh1',
      refNum: 'UDS-01',
      date: '2026-10-15',
      partyOrTarget: 'فرقة الكشف والمتابعة الصحية (طبيب + ممرض)',
      subjectOrDetail: 'فحص طبي شامل (العيون، الأسنان، الوزن، القامة) لقسمي التحضيري والسنة الأولى',
      actionOrObservation: 'فحص 66 تلميذاً وتوجيه 4 حالات لطبيب العيون المختص',
    },
    {
      id: 'sh2',
      refNum: 'UDS-02',
      date: '2026-10-22',
      partyOrTarget: 'مكتب حفظ الصحة البلدي + إدارة المدرسة',
      subjectOrDetail: 'مراقبة صلاحية مياه الشرب وتطهير الخزان المائي والمرافق الصحية',
      actionOrObservation: 'تحاليل المياه سليمة ومطابقة للمعايير الصحية',
    },
  ],
  reg_communication: [
    {
      id: 'com1',
      refNum: 'تبليغ 01',
      date: '2026-09-10',
      partyOrTarget: 'كافة أساتذة المدرسة الابتدائية (10 أساتذة)',
      subjectOrDetail: 'تبليغ التدرجات السنوية المحينة ومخططات التعلم وجدول الحراسة في الساحة',
      actionOrObservation: 'تم الاطلاع والتوقيع من جميع الأساتذة',
    },
    {
      id: 'com2',
      refNum: 'تبليغ 02',
      date: '2026-10-18',
      partyOrTarget: 'أساتذة اللغات والتربية البدنية والأفواج التربوية',
      subjectOrDetail: 'مذكرة داخلية حول ضبط توقيت حصص المعالجة البيداغوجية وتأشير الكراس اليومي',
      actionOrObservation: 'مُبلغ ومؤشر',
    },
  ],
  reg_partners: [
    {
      id: 'par1',
      refNum: 'لقاء 01',
      date: '2026-09-24',
      partyOrTarget: 'مكتب جمعية أولياء التلاميذ المعتمد',
      subjectOrDetail: 'تنصيب مكتب الجمعية ومناقشة مرافقة التلاميذ وتنظيم حملة تشجير وتزيين المحيط المدرسي',
      actionOrObservation: 'برمجة يوم تطوعي ومراسلة البلدية',
    },
    {
      id: 'par2',
      refNum: 'لقاء 02',
      date: '2026-10-11',
      partyOrTarget: 'مصالح البلدية (مصلحة الشؤون الاجتماعية والمطاعم)',
      subjectOrDetail: 'ضبط تموين المطعم المدرسي وصيانة التدفئة المركزية قبل فصل الشتاء',
      actionOrObservation: 'تمت معاينة وصيانة المراجل بنجاح',
    },
  ],
  reg_students_matricule: [
    {
      id: 'mat1',
      refNum: '2026/001',
      date: '2026-09-08',
      partyOrTarget: 'عماري أنس (مواليد 2020-04-12)',
      subjectOrDetail: 'السنة الأولى ابتدائي — الولي: عماري بلقاسم — حي الوئام',
      actionOrObservation: 'مسجل ومزاول بانتظام',
    },
    {
      id: 'mat2',
      refNum: '2026/002',
      date: '2026-09-08',
      partyOrTarget: 'رحماني مريم (مواليد 2016-08-19)',
      subjectOrDetail: 'السنة الخامسة ابتدائي — الولي: رحماني محمد — حي النصر',
      actionOrObservation: 'مسجلة ومزاولة بانتظام',
    },
  ],
  reg_staff_personnel: [
    {
      id: 'stf1',
      refNum: 'موظف 01',
      date: '2014-09-01',
      partyOrTarget: 'أ. عبد القادر بن صالح',
      subjectOrDetail: 'أستاذ مميز في التعليم الابتدائي (الصنف 15) — لغة عربية',
      actionOrObservation: 'مرسم وناشط — مسند له قسم السنة الأولى',
    },
    {
      id: 'stf2',
      refNum: 'موظف 02',
      date: '2017-09-01',
      partyOrTarget: 'أ. فاطمة الزهراء بوزيد',
      subjectOrDetail: 'أستاذ قسم ثانٍ في التعليم الابتدائي (الصنف 14) — لغة عربية',
      actionOrObservation: 'مرسمة وناشطة — مسند لها قسم السنة الخامسة',
    },
  ],
  reg_staff_attendance: [
    {
      id: 'att1',
      refNum: 'مواظبة 01',
      date: '2026-10-18',
      partyOrTarget: 'أ. سعاد منصوري',
      subjectOrDetail: 'غياب يوم كامل (08:00 - 15:00) بسبب وعكة صحية طارئة',
      actionOrObservation: 'مبرر بشهادة طبية مودعة في الآجال',
    },
  ],
  reg_general_inventory: [
    {
      id: 'inv1',
      refNum: 'INV-2026-01',
      date: '2026-09-03',
      partyOrTarget: 'طاولات وكراسي مدرسية فردية ومزدوجة + سبورات بيضاء',
      subjectOrDetail: '120 طاولة + 08 سبورات مغناطيسية موزعة على الحجرات 01 إلى 06',
      actionOrObservation: 'حالة جيدة جداً',
    },
    {
      id: 'inv2',
      refNum: 'INV-2026-02',
      date: '2026-09-15',
      partyOrTarget: 'لوحات إلكترونية رقمية (Tablets) + 03 عربات شحن ذكية',
      subjectOrDetail: '96 لوحة رقمية مخصصة لأفواج السنوات 3، 4، 5 ابتدائي',
      actionOrObservation: '94 لوحة شغالة / 02 قيد الصيانة',
    },
  ],
  reg_inspection_visits: [
    {
      id: 'vis1',
      refNum: 'زيارة 01',
      date: '2026-10-12',
      partyOrTarget: 'أ. عبد القادر بن صالح — السنة الأولى ابتدائي',
      subjectOrDetail: 'زيارة توجيهية للمدير في نشاط فهم المنطوق والتعبير الشفوي',
      actionOrObservation: 'تحكم ممتاز في تسيير الفوج وبناء التعلمات',
    },
  ],
  reg_councils_delib: [
    {
      id: 'del1',
      refNum: 'محضر 01',
      date: '2026-09-14',
      partyOrTarget: 'مجلس أساتذة المدرسة الابتدائية (جلسة الدخول المدرسي)',
      subjectOrDetail: 'دراسة التنظيم التربوي، توزيع الأفواج، وضبط برنامج المعالجة البيداغوجية',
      actionOrObservation: 'مصادق عليه بالإجماع من طرف الهيئة التربوية',
    },
  ],
  reg_accidents_safety: [
    {
      id: 'acc1',
      refNum: 'حادث 01',
      date: '2026-10-19 (09:35)',
      partyOrTarget: 'التلميذ: بوزيد أمين — قسم السنة الثانية ابتدائي',
      subjectOrDetail: 'تعثر خفيف في ساحة المدرسة أثناء فترة الاستراحة الصباحية بحضور الأساتذة المناوبين',
      actionOrObservation: 'إسعاف أولي وإشعار الولي وتحرير التصريح في أقل من 24 ساعة',
    },
  ],
};

interface LegislationAndBagModuleProps {
  mode: 'legislation' | 'bag';
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

export default function LegislationAndBagModule({
  mode,
  institution,
  teachers,
  logoUrl,
}: LegislationAndBagModuleProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Legislation state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [duties, setDuties] = useState<DutyChecklistItem[]>(INITIAL_DUTIES);

  // Document Bag Mode Sub-section:
  // 'registries_12' | 'inspector_schedule' | 'admin_docs'
  const [bagSubMode, setBagSubMode] = useState<'registries_12' | 'inspector_schedule' | 'admin_docs'>('registries_12');
  const [activeRegistryId, setActiveRegistryId] = useState<DirectorRegistryId>('reg_incoming_mail');
  const [registriesData, setRegistriesData] = useState<Record<DirectorRegistryId, RegistryEntryRow[]>>(
    INITIAL_REGISTRIES_RECORDS
  );

  // New Registry Row Inputs
  const [newRowRef, setNewRowRef] = useState('03/2026');
  const [newRowDate, setNewRowDate] = useState('2026-11-04');
  const [newRowParty, setNewRowParty] = useState('');
  const [newRowSubject, setNewRowSubject] = useState('');
  const [newRowAction, setNewRowAction] = useState('');

  // Inspector Scheduling, Alerts & Documentation State
  const [referenceTodayDate, setReferenceTodayDate] = useState<string>('2026-11-04');
  const [inspectorVisits, setInspectorVisits] = useState<ScheduledInspectionVisit[]>(INITIAL_INSPECTOR_VISITS);
  const [selectedVisitId, setSelectedVisitId] = useState<string>(INITIAL_INSPECTOR_VISITS[0].id);
  const [inspectorPrintMode, setInspectorPrintMode] = useState<'all_schedule' | 'single_visit_report'>('all_schedule');
  const [syncSuccessBanner, setSyncSuccessBanner] = useState<string>('');

  // New Inspector Visit Form State
  const [newInspName, setNewInspName] = useState('السيد المفتش: محمد الصالح بن يونس');
  const [newInspSpec, setNewInspSpec] =
    useState<ScheduledInspectionVisit['inspectorSpecialty']>('مفتش اللغة العربية');
  const [newInspTeacher, setNewInspTeacher] = useState(teachers[0]?.name || 'أ. عبد القادر بن صالح');
  const [newInspGroup, setNewInspGroup] = useState('السنة الثالثة ابتدائي — الفوج 01');
  const [newInspPurpose, setNewInspPurpose] =
    useState<ScheduledInspectionVisit['visitPurpose']>('زيارة تفتيش وتنقيط (ترقية)');
  const [newInspDate, setNewInspDate] = useState('2026-11-12');
  const [newInspTime, setNewInspTime] = useState('08:30 - 10:00');
  const [newInspAlertDays, setNewInspAlertDays] = useState<number>(3);

  // Document Bag state
  const [selectedDoc, setSelectedDoc] = useState<BagDocType>('pv_install');
  const [targetTeacherId, setTargetTeacherId] = useState<string>(teachers[0]?.id || 't1');
  const [docDate, setDocDate] = useState<string>('2026-11-04');
  const [docNumber, setDocNumber] = useState<string>('148 / 2026');
  const [docReason, setDocReason] = useState<string>('التنصيب الرسمي في المنصب / استئناف العمل');
  const [bordereauItems, setBordereauItems] = useState([
    { title: 'محضر الدخول المدرسي وإسناد الأفواج التربوية (2026/2027)', count: '02 نسختان', note: 'للمصادقة والإعلام' },
    { title: 'جدول التوقيت الأسبوعي الرسمي لأساتذة المدرسة (نظام الدوام الواحد)', count: '10 نسخ', note: 'للتأشير والرقابة' },
    { title: 'الكشف الشهري لمواظبة وحضور الموظفين', count: '01 نسخة', note: 'مصلحة الموظفين' },
  ]);

  const targetTeacher = teachers.find((t) => t.id === targetTeacherId) || teachers[0];

  const filteredLegislation = LEGISLATION_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'الكل' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.includes(searchQuery) ||
      item.refNumber.includes(searchQuery) ||
      item.summary.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const toggleDuty = (id: string) => {
    setDuties((prev) => prev.map((d) => (d.id === id ? { ...d, done: !d.done } : d)));
  };

  const activeRegistryDef =
    DIRECTOR_12_REGISTRIES.find((r) => r.id === activeRegistryId) || DIRECTOR_12_REGISTRIES[0];
  const activeRegistryRows = registriesData[activeRegistryId] || [];

  const handleAddRegistryRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowSubject.trim() && !newRowParty.trim()) return;
    const row: RegistryEntryRow = {
      id: 'reg_row_' + Date.now(),
      refNum: newRowRef.trim() || `${activeRegistryRows.length + 1}/2026`,
      date: newRowDate,
      partyOrTarget: newRowParty.trim() || 'الجهة المعنية',
      subjectOrDetail: newRowSubject.trim() || 'تفاصيل التسجيل الرسمي',
      actionOrObservation: newRowAction.trim() || 'تم اتخاذ الإجراء القانوني',
    };
    setRegistriesData((prev) => ({
      ...prev,
      [activeRegistryId]: [row, ...(prev[activeRegistryId] || [])],
    }));
    setNewRowParty('');
    setNewRowSubject('');
    setNewRowAction('');
  };

  const handleDeleteRegistryRow = (rowId: string) => {
    setRegistriesData((prev) => ({
      ...prev,
      [activeRegistryId]: (prev[activeRegistryId] || []).filter((r) => r.id !== rowId),
    }));
  };

  // Helper to compute days remaining until inspection visit
  const getDaysUntilVisit = (visitDateStr: string) => {
    const refTime = new Date(referenceTodayDate || '2026-11-04').getTime();
    const visitTime = new Date(visitDateStr).getTime();
    if (Number.isNaN(refTime) || Number.isNaN(visitTime)) return 0;
    return Math.round((visitTime - refTime) / (1000 * 60 * 60 * 24));
  };

  const getVisitAlertBadge = (visit: ScheduledInspectionVisit) => {
    if (visit.status === 'منجزة وموثقة') {
      return {
        label: 'زيارة منجزة وموثقة ✓',
        colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        urgency: 'done' as const,
      };
    }
    if (visit.status === 'مؤجلة') {
      return {
        label: 'موعد مؤجل',
        colorClass: 'bg-slate-200 text-slate-700 border-slate-300',
        urgency: 'postponed' as const,
      };
    }
    const diff = getDaysUntilVisit(visit.visitDate);
    if (diff < 0) {
      return {
        label: `تجاوز الموعد بـ ${Math.abs(diff)} يوم — يتطلب التوثيق`,
        colorClass: 'bg-rose-100 text-rose-900 border-rose-400',
        urgency: 'urgent' as const,
      };
    }
    if (diff === 0) {
      return {
        label: 'تنبيه عاجل: الزيارة التفتيشية اليوم!',
        colorClass: 'bg-red-600 text-white border-red-700 animate-pulse',
        urgency: 'urgent' as const,
      };
    }
    if (diff <= 3) {
      return {
        label: `تنبيه عاجل جداً: متبقي ${diff} أيام`,
        colorClass: 'bg-rose-100 text-[#d91424] border-rose-300',
        urgency: 'urgent' as const,
      };
    }
    if (diff <= 7) {
      return {
        label: `تنبيه قريب: متبقي ${diff} أيام`,
        colorClass: 'bg-amber-100 text-amber-900 border-amber-300',
        urgency: 'soon' as const,
      };
    }
    return {
      label: `مبرمجة (بعد ${diff} يوماً)`,
      colorClass: 'bg-blue-50 text-blue-900 border-blue-200',
      urgency: 'scheduled' as const,
    };
  };

  const selectedVisit =
    inspectorVisits.find((v) => v.id === selectedVisitId) || inspectorVisits[0];

  const handleAddInspectorVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspName.trim()) return;
    const newVisit: ScheduledInspectionVisit = {
      id: 'insp_' + Date.now(),
      refCode: `تفتيش-0${inspectorVisits.length + 1}/2026`,
      inspectorName: newInspName.trim(),
      inspectorSpecialty: newInspSpec,
      targetTeacherName: newInspTeacher,
      targetClassGroup: newInspGroup.trim() || 'الفوج التربوي المعني',
      visitPurpose: newInspPurpose,
      visitDate: newInspDate,
      visitTimeSlot: newInspTime,
      status: 'مجدولة قيد التحضير',
      alertDaysBefore: newInspAlertDays,
      readinessChecklist: {
        notifiedTeacher: true,
        checkedDailyNotebook: false,
        preparedAdminDossier: false,
        preparedRegistry10: false,
      },
      lessonTopic: 'نشاط بيداغوجي مبرمج وفق التدرج السنوي',
      awardedScore: 'قيد التقييم',
      positiveObservations: 'في انتظار إجراء الزيارة وتدوين ملاحظات السيد المفتش.',
      recordedDeficiencies: 'لا توجد حالياً',
      inspectorRecommendations: 'إشعار الأستاذ(ة) وتحضير الوثائق التربوية والكراس اليومي.',
      followUpDeadline: newInspDate,
    };
    setInspectorVisits((prev) => [newVisit, ...prev]);
    setSelectedVisitId(newVisit.id);
  };

  const updateSelectedVisitField = <K extends keyof ScheduledInspectionVisit>(
    field: K,
    value: ScheduledInspectionVisit[K]
  ) => {
    if (!selectedVisit) return;
    setInspectorVisits((prev) =>
      prev.map((v) => (v.id === selectedVisit.id ? { ...v, [field]: value } : v))
    );
  };

  const toggleVisitReadiness = (key: keyof ScheduledInspectionVisit['readinessChecklist']) => {
    if (!selectedVisit) return;
    setInspectorVisits((prev) =>
      prev.map((v) =>
        v.id === selectedVisit.id
          ? {
              ...v,
              readinessChecklist: {
                ...v.readinessChecklist,
                [key]: !v.readinessChecklist[key],
              },
            }
          : v
      )
    );
  };

  const handleSyncVisitToRegistry10 = (visit: ScheduledInspectionVisit) => {
    const newEntry: RegistryEntryRow = {
      id: 'reg10_sync_' + Date.now(),
      refNum: visit.refCode,
      date: visit.visitDate,
      partyOrTarget: `${visit.targetTeacherName} — (${visit.inspectorSpecialty}: ${visit.inspectorName})`,
      subjectOrDetail: `${visit.visitPurpose} — النشاط: ${visit.lessonTopic}`,
      actionOrObservation: `العلامة: ${visit.awardedScore} | التوصيات: ${visit.inspectorRecommendations}`,
    };
    setRegistriesData((prev) => ({
      ...prev,
      reg_inspection_visits: [newEntry, ...(prev.reg_inspection_visits || [])],
    }));
    setSyncSuccessBanner(`تم ترحيل وتدوين زيارة (${visit.targetTeacherName}) بنجاح في السجل الرسمي رقم 10 (سجل الزيارات التربوية والتفتيشية).`);
    setTimeout(() => setSyncSuccessBanner(''), 5000);
  };

  const urgentVisitsCount = inspectorVisits.filter((v) => {
    if (v.status !== 'مجدولة قيد التحضير') return false;
    const d = getDaysUntilVisit(v.visitDate);
    return d <= v.alertDaysBefore;
  }).length;

  if (mode === 'legislation') {
    return (
      <div className="space-y-6">
        <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#117a37]" />
              <span>قسم التشريع المدرسي والمهام الرسمية لمدير المدرسة الابتدائية</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              دليل النصوص التشريعية والتنظيمية المحينة (المرسوم التنفيذي 25-54، القرار 778) ورزنامة المهام الدورية للمدير
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المرسوم 25-54، المهام..."
                className="w-full pr-9 pl-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={() =>
                exportElementToPDF(sheetRef.current, `دليل_التشريع_ومهام_المدير_${institution.school}`, 'landscape')
              }
              className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل PDF</span>
            </button>

            <button
              onClick={() =>
                triggerPrintOrPdf(`دليل_التشريع_ومهام_المدير_${institution.school}`, sheetRef.current)
              }
              className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة (A4)</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="no-print flex flex-wrap gap-2">
          {(['الكل', 'القانون الأساسي 25-54', 'مهام المدير', 'الجماعة التربوية', 'الرخص والغيابات', 'الحوادث والأمن'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                  selectedCategory === cat
                    ? 'bg-[#117a37] text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Legislation Cards & Director Periodic Checklist */}
        <div className="no-print grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5 items-start">
          <div className="space-y-4">
            {filteredLegislation.map((leg) => (
              <div key={leg.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-xs font-black text-[#d91424]">{leg.refNumber}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-xs font-bold text-[#117a37]">{leg.category}</span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{leg.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {leg.summary}
                </p>

                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-[#094d22]">أهم الأحكام والضوابط التطبيقية:</div>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                    {leg.articles.map((art, i) => (
                      <li key={i} className="leading-relaxed">
                        {art}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Director Periodic Duties Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#094d22] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#117a37]" />
                  <span>رزنامة المهام الدورية للسيد(ة) المدير(ة)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  قائمة تحقق تفاعلية لمتابعة الأعمال اليومية والأسبوعية والشهرية
                </p>
              </div>
              <span className="text-xs font-black text-[#117a37] tabular-nums">
                {duties.filter((d) => d.done).length} / {duties.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {duties.map((duty) => (
                <label
                  key={duty.id}
                  onClick={() => toggleDuty(duty.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition ${
                    duty.done
                      ? 'bg-[#e8f5e9]/60 border-[#117a37]/40 text-[#094d22]'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={duty.done}
                    onChange={() => {}}
                    className="mt-0.5 accent-[#117a37] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-[#d91424] mb-0.5">مهمة {duty.period}</div>
                    <div className={`font-bold leading-relaxed ${duty.done ? 'line-through opacity-80' : ''}`}>
                      {duty.task}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Printable A4 Sheet for Legislation & Periodic Duties */}
        <div className="sheet-scroll-container">
          <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
            <div className="sheet-header-grid">
              <div className="sheet-right-col">
                <div>مديرية التربية لولاية : {institution.wilaya}</div>
                <div>مقاطعة التفتيش : {institution.district}</div>
                <div>المدرسة الابتدائية : {institution.school}</div>
              </div>
              <div className="sheet-center-col">
                <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="min-heading">وزارة التربية الوطنية</div>
                <div className="title-frame-with-logo">
                  <img src={logoUrl} alt="SNTE" />
                  <div className="title-frame-text">
                    <span className="main-doc-title">
                      بطاقة متابعة المهام الدورية والمرجعية التشريعية لمدير المدرسة الابتدائية
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

            <table className="timetable-grid mt-2">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '40px' }}>#</th>
                  <th style={{ width: '120px' }}>الدورية</th>
                  <th>بيان المهمة الإدارية والبيداغوجية للمدير</th>
                  <th style={{ width: '130px' }}>حالة الإنجاز</th>
                </tr>
              </thead>
              <tbody>
                {duties.map((d, i) => (
                  <tr key={d.id}>
                    <td className="font-bold tabular-nums py-1.5">{i + 1}</td>
                    <td className="font-black text-[#d91424]">مهمة {d.period}</td>
                    <td className="text-right px-3 font-bold">{d.task}</td>
                    <td className="font-black text-[#094d22]">{d.done ? 'منجزة ✓' : 'قيد المتابعة'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="footer-signatures mt-6">
              <div>الأمانة الإدارية</div>
              <div>إمضاء وختم السيد(ة) المدير(ة)</div>
              <div>تأشيرة السيد(ة) مفتش(ة) المقاطعة</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODE === 'bag': حقيبة وثائق المدير + السجلات الـ 12 الرسمية + جدولة مواعيد تفتيش المفتشين والتنبيهات وتوثيق الملاحظات
  const pdfFileName =
    bagSubMode === 'registries_12'
      ? `${activeRegistryDef.title}_${institution.school}`
      : bagSubMode === 'inspector_schedule'
      ? `جدولة_وتوثيق_الزيارات_التفتيشية_${institution.school}`
      : `وثيقة_إدارية_${selectedDoc}_${institution.school}`;

  return (
    <div className="space-y-6">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#117a37]" />
            <span>حقيبة وثائق المدير · السجلات الـ 12 · جدولة تفتيش المفتشين والتنبيهات</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            تضم السجلات الرسمية الـ 12 للمدير، منظومة جدولة مواعيد تفتيش المفتشين التربويين مع نظام التنبيهات وتوثيق الزيارات، ونماذج المحاضر الإدارية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportElementToPDF(sheetRef.current, pdfFileName, 'landscape')}
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الوثيقة / السجل (PDF)</span>
          </button>

          <button
            onClick={() => triggerPrintOrPdf(pdfFileName, sheetRef.current)}
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل / الوثيقة (A4)</span>
          </button>
        </div>
      </div>

      {/* Main Switcher inside Director Bag: 1) السجلات الـ 12 | 2) جدولة مواعيد المفتشين والتنبيهات وتوثيق الزيارات | 3) النماذج الإدارية */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setBagSubMode('registries_12')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            bagSubMode === 'registries_12'
              ? 'bg-[#094d22] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>أولاً: السجلات الرسمية الـ 12 للمدير (الصادر · الوارد · الصحة · التواصل...)</span>
        </button>

        <button
          onClick={() => setBagSubMode('inspector_schedule')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            bagSubMode === 'inspector_schedule'
              ? 'bg-[#117a37] text-white shadow-xs ring-2 ring-[#facc15]'
              : 'bg-amber-50 border border-amber-300 text-[#094d22] hover:bg-amber-100'
          }`}
        >
          <CalendarClock className="w-4 h-4 text-[#d91424]" />
          <span>ثانياً: جدولة مواعيد تفتيش المفتشين التربويين · التنبيهات وتوثيق الزيارات</span>
          {urgentVisitsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#d91424] text-white text-[10px] font-black tabular-nums">
              {urgentVisitsCount} تنبيه نشط
            </span>
          )}
        </button>

        <button
          onClick={() => setBagSubMode('admin_docs')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black cursor-pointer transition flex items-center gap-2 ${
            bagSubMode === 'admin_docs'
              ? 'bg-[#d91424] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ثالثاً: نماذج المحاضر والشهادات الإدارية وجدول الإرسال (06 نماذج)</span>
        </button>
      </div>

      {/* SUB-MODE 1: السجلات الرسمية الـ 12 للمدير */}
      {bagSubMode === 'registries_12' && (
        <div className="no-print space-y-5">
          {/* Grid of 12 Official Registries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DIRECTOR_12_REGISTRIES.map((reg) => {
              const isSelected = activeRegistryId === reg.id;
              const count = (registriesData[reg.id] || []).length;
              return (
                <button
                  key={reg.id}
                  onClick={() => setActiveRegistryId(reg.id)}
                  className={`p-3 rounded-xl border text-right cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-[#e8f5e9] border-2 border-[#117a37] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 rounded bg-[#094d22] text-white text-[10px] font-black tabular-nums">
                      سجل رقم {reg.numberLabel}
                    </span>
                    <span className="text-[11px] font-bold text-[#d91424] tabular-nums">
                      {count} تسجيلات
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 leading-snug">{reg.title}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{reg.legalRef}</div>
                </button>
              );
            })}
          </div>

          {/* Active Registry Entry Form & Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-black text-[#d91424]">
                  السجل الرسمي رقم {activeRegistryDef.numberLabel} من أصل 12 سجلاً إدارياً وتربوياً
                </div>
                <h3 className="text-base font-black text-[#094d22] mt-0.5">
                  {activeRegistryDef.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-600">{activeRegistryDef.legalRef}</span>
            </div>

            <form
              onSubmit={handleAddRegistryRow}
              className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">{activeRegistryDef.col1Label}</label>
                <input
                  type="text"
                  value={newRowRef}
                  onChange={(e) => setNewRowRef(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{activeRegistryDef.col2Label}</label>
                <input
                  type="date"
                  value={newRowDate}
                  onChange={(e) => setNewRowDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{activeRegistryDef.col3Label}</label>
                <input
                  type="text"
                  value={newRowParty}
                  onChange={(e) => setNewRowParty(e.target.value)}
                  placeholder="الجهة / المعني..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">{activeRegistryDef.col4Label}</label>
                <input
                  type="text"
                  value={newRowSubject}
                  onChange={(e) => setNewRowSubject(e.target.value)}
                  placeholder="الموضوع والتفاصيل..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{activeRegistryDef.col5Label}</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newRowAction}
                    onChange={(e) => setNewRowAction(e.target.value)}
                    placeholder="الملاحظة..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تدوين</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                    <th className="py-2.5 px-3">{activeRegistryDef.col1Label}</th>
                    <th className="py-2.5 px-3">{activeRegistryDef.col2Label}</th>
                    <th className="py-2.5 px-3">{activeRegistryDef.col3Label}</th>
                    <th className="py-2.5 px-3">{activeRegistryDef.col4Label}</th>
                    <th className="py-2.5 px-3">{activeRegistryDef.col5Label}</th>
                    <th className="py-2.5 px-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeRegistryRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-black text-[#d91424] tabular-nums">{row.refNum}</td>
                      <td className="py-2.5 px-3 font-bold tabular-nums whitespace-nowrap">{row.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{row.partyOrTarget}</td>
                      <td className="py-2.5 px-3 font-bold text-[#094d22]">{row.subjectOrDetail}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{row.actionOrObservation}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteRegistryRow(row.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="حذف القيد"
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
        </div>
      )}

      {/* SUB-MODE 2: جدولة مواعيد تفتيش المفتشين التربويين مع نظام التنبيهات وتوثيق ملاحظات الزيارات */}
      {bagSubMode === 'inspector_schedule' && (
        <div className="no-print space-y-5">
          {/* Smart Proactive Alert Banner */}
          <div className="bg-gradient-to-l from-[#073818] via-[#0b5626] to-[#117a37] text-white rounded-xl p-4 shadow-sm border border-[#facc15]/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 mt-0.5">
                  <BellRing className="w-6 h-6 text-[#facc15]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      مركز التنبيهات الاستباقية وجدولة زيارات المفتشين التربويين والإداريين
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-[#d91424] text-white text-[11px] font-black tabular-nums">
                      {urgentVisitsCount} مواعيد تتطلب التحضير العاجل
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-1">
                    يقوم النظام بحساب العد التنازلي لمواعيد التفتيش المبرمجة، تنبيه المدير لقائمة التحضير البيداغوجي، وتوثيق ملاحظات وتوصيات السادة المفتشين مع إمكانية الترحيل المباشر للسجل الرسمي رقم 10.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/25 px-3 py-2 rounded-lg border border-white/15 text-xs">
                <span className="font-bold text-yellow-200">تاريخ اليوم المرجعي للتنبيهات:</span>
                <input
                  type="date"
                  value={referenceTodayDate}
                  onChange={(e) => setReferenceTodayDate(e.target.value)}
                  className="bg-white text-slate-900 font-black px-2 py-1 rounded text-xs tabular-nums"
                />
              </div>
            </div>

            {/* Active Urgent Alerts Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
              {inspectorVisits
                .filter((v) => v.status === 'مجدولة قيد التحضير')
                .slice(0, 3)
                .map((visit) => {
                  const diff = getDaysUntilVisit(visit.visitDate);
                  const readyCount = Object.values(visit.readinessChecklist).filter(Boolean).length;
                  return (
                    <div
                      key={visit.id}
                      onClick={() => setSelectedVisitId(visit.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedVisitId === visit.id
                          ? 'bg-white text-slate-900 border-[#facc15] ring-2 ring-[#facc15]'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-black mb-1">
                        <span className={selectedVisitId === visit.id ? 'text-[#d91424]' : 'text-[#facc15]'}>
                          {visit.inspectorSpecialty}
                        </span>
                        <span className="tabular-nums px-2 py-0.5 rounded bg-black/20">
                          {diff === 0 ? 'اليوم!' : diff > 0 ? `متبقي ${diff} أيام` : `متأخر ${Math.abs(diff)} يوم`}
                        </span>
                      </div>
                      <div className="text-xs font-black truncate">{visit.targetTeacherName}</div>
                      <div
                        className={`text-[11px] mt-1 flex items-center justify-between ${
                          selectedVisitId === visit.id ? 'text-slate-600' : 'text-emerald-100'
                        }`}
                      >
                        <span className="tabular-nums">{visit.visitDate} ({visit.visitTimeSlot})</span>
                        <span className="font-black tabular-nums">جاهزية التحضير: {readyCount}/4</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {syncSuccessBanner && (
            <div className="bg-emerald-50 border-2 border-[#117a37] text-[#094d22] p-3.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#117a37] shrink-0" />
              <span>{syncSuccessBanner}</span>
            </div>
          )}

          {/* Form to Schedule a New Inspector Visit */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#094d22] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#117a37]" />
                <span>برمجة وجدولة موعد زيارة تفتيشية جديدة مع ضبط التنبيه المبكر</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">نمط وثيقة الطباعة (A4):</span>
                <button
                  type="button"
                  onClick={() => setInspectorPrintMode('all_schedule')}
                  className={`px-2.5 py-1 rounded font-extrabold cursor-pointer ${
                    inspectorPrintMode === 'all_schedule'
                      ? 'bg-[#094d22] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  جدول كافة المواعيد والملاحظات
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorPrintMode('single_visit_report')}
                  className={`px-2.5 py-1 rounded font-extrabold cursor-pointer ${
                    inspectorPrintMode === 'single_visit_report'
                      ? 'bg-[#d91424] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  بطاقة توثيق الزيارة المختارة فقط
                </button>
              </div>
            </div>

            <form
              onSubmit={handleAddInspectorVisit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs"
            >
              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">اسم ولقب السيد(ة) المفتش(ة):</label>
                <input
                  type="text"
                  value={newInspName}
                  onChange={(e) => setNewInspName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">اختصاص المفتش والمقاطعة:</label>
                <select
                  value={newInspSpec}
                  onChange={(e) =>
                    setNewInspSpec(e.target.value as ScheduledInspectionVisit['inspectorSpecialty'])
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                >
                  <option value="مفتش اللغة العربية">مفتش اللغة العربية</option>
                  <option value="مفتش اللغة الفرنسية">مفتش اللغة الفرنسية</option>
                  <option value="مفتش اللغة الإنجليزية">مفتش اللغة الإنجليزية</option>
                  <option value="مفتش اللغة الأمازيغية">مفتش اللغة الأمازيغية</option>
                  <option value="مفتش التربية البدنية">مفتش التربية البدنية</option>
                  <option value="مفتش الإدارة المدرسية">مفتش الإدارة المدرسية</option>
                  <option value="مفتش التغذية المدرسية والمطاعم">مفتش التغذية المدرسية والمطاعم</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">الأستاذ(ة) أو المصلحة المعنية:</label>
                <select
                  value={newInspTeacher}
                  onChange={(e) => setNewInspTeacher(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({rankDisplayTitle(t.rank)})
                    </option>
                  ))}
                  <option value="إدارة المؤسسة (السيد المدير + أمانة المدرسة)">
                    إدارة المؤسسة (السيد المدير + أمانة المدرسة)
                  </option>
                  <option value="كافة أساتذة المدرسة (ندوة داخلية)">كافة أساتذة المدرسة (ندوة داخلية)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">الفوج التربوي / القاعة:</label>
                <input
                  type="text"
                  value={newInspGroup}
                  onChange={(e) => setNewInspGroup(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">طبيعة الزيارة التفتيشية:</label>
                <select
                  value={newInspPurpose}
                  onChange={(e) =>
                    setNewInspPurpose(e.target.value as ScheduledInspectionVisit['visitPurpose'])
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold"
                >
                  <option value="زيارة تفتيش وتنقيط (ترقية)">زيارة تفتيش وتنقيط (ترقية)</option>
                  <option value="امتحان التثبيت والترسيم">امتحان التثبيت والترسيم</option>
                  <option value="زيارة توجيهية وتكوينية">زيارة توجيهية وتكوينية</option>
                  <option value="تفتيش إداري وبيداغوجي للمؤسسة">تفتيش إداري وبيداغوجي للمؤسسة</option>
                  <option value="مراقبة المطعم المدرسي والتغذية">مراقبة المطعم المدرسي والتغذية</option>
                  <option value="ندوة تربوية تطبيقية">ندوة تربوية تطبيقية</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">تاريخ الزيارة المبرمج:</label>
                <input
                  type="date"
                  value={newInspDate}
                  onChange={(e) => setNewInspDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">التوقيت الزمني للزيارة:</label>
                <input
                  type="text"
                  value={newInspTime}
                  onChange={(e) => setNewInspTime(e.target.value)}
                  placeholder="08:30 - 10:00"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#094d22] mb-1">مهلة التنبيه الاستباقي:</label>
                <div className="flex gap-1.5">
                  <select
                    value={newInspAlertDays}
                    onChange={(e) => setNewInspAlertDays(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-bold"
                  >
                    <option value={1}>تنبيه قبل 24 ساعة</option>
                    <option value={3}>تنبيه قبل 03 أيام</option>
                    <option value={7}>تنبيه قبل 07 أيام</option>
                    <option value={15}>تنبيه قبل 15 يوماً</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold px-3.5 py-1.5 rounded cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>جدولة</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Master-Detail View: List of Scheduled Visits + Detailed Observation Documentation Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-5 items-start">
            {/* Table of Scheduled & Completed Inspector Visits */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-sm font-black text-[#094d22] flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-[#117a37]" />
                  <span>قائمة مواعيد تفتيش المفتشين التربويين وحالة التنبيهات ({inspectorVisits.length})</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  انقر على أي زيارة لتوثيق ملاحظات المفتش والتوصيات البيداغوجية
                </span>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-[#094d22] font-black">
                    <th className="py-2.5 px-2.5">المرجع والتاريخ</th>
                    <th className="py-2.5 px-2.5">السيد(ة) المفتش(ة) والاختصاص</th>
                    <th className="py-2.5 px-2.5">الأستاذ(ة) المعني(ة) والقسم</th>
                    <th className="py-2.5 px-2.5">طبيعة الزيارة</th>
                    <th className="py-2.5 px-2.5">حالة التنبيه والعد التنازلي</th>
                    <th className="py-2.5 px-2.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inspectorVisits.map((visit) => {
                    const badge = getVisitAlertBadge(visit);
                    const isSelected = selectedVisit?.id === visit.id;
                    return (
                      <tr
                        key={visit.id}
                        onClick={() => setSelectedVisitId(visit.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-[#e8f5e9]/80 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <div className="font-black text-[#d91424] tabular-nums">{visit.refCode}</div>
                          <div className="text-[11px] font-bold text-slate-700 tabular-nums">{visit.visitDate}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">{visit.visitTimeSlot}</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="font-extrabold text-slate-900">{visit.inspectorName}</div>
                          <div className="text-[11px] font-bold text-[#117a37]">{visit.inspectorSpecialty}</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="font-extrabold text-slate-900">{visit.targetTeacherName}</div>
                          <div className="text-[11px] text-slate-600">{visit.targetClassGroup}</div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="font-bold text-[#094d22]">{visit.visitPurpose}</span>
                          {visit.status === 'منجزة وموثقة' && (
                            <div className="text-[11px] font-black text-emerald-700 mt-0.5">
                              العلامة: {visit.awardedScore}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md border text-[11px] font-black ${badge.colorClass}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleSyncVisitToRegistry10(visit);
                              }}
                              className="px-2 py-1 bg-[#117a37] hover:bg-[#094d22] text-white rounded text-[10px] font-extrabold cursor-pointer"
                              title="ترحيل إلى السجل رقم 10 (سجل الزيارات التربوية والتفتيشية)"
                            >
                              ترحيل للسجل 10
                            </button>
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setInspectorVisits((prev) => prev.filter((x) => x.id !== visit.id));
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="حذف الموعد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Detailed Documentation & Readiness Panel for Selected Visit */}
            {selectedVisit && (
              <div className="bg-white border-2 border-[#117a37] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-[11px] font-black text-[#d91424] flex items-center gap-1">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>بطاقة التوثيق والتحضير للزيارة التفتيشية ({selectedVisit.refCode})</span>
                    </div>
                    <h4 className="text-sm font-black text-[#094d22] mt-0.5">
                      {selectedVisit.targetTeacherName} — {selectedVisit.inspectorSpecialty}
                    </h4>
                  </div>

                  <select
                    value={selectedVisit.status}
                    onChange={(e) =>
                      updateSelectedVisitField(
                        'status',
                        e.target.value as ScheduledInspectionVisit['status']
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                      selectedVisit.status === 'منجزة وموثقة'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : selectedVisit.status === 'مؤجلة'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-amber-50 text-amber-900 border-amber-400'
                    }`}
                  >
                    <option value="مجدولة قيد التحضير">مجدولة قيد التحضير</option>
                    <option value="منجزة وموثقة">منجزة وموثقة ✓</option>
                    <option value="مؤجلة">مؤجلة</option>
                  </select>
                </div>

                {/* Pre-Inspection Readiness Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-black text-[#094d22] flex items-center justify-between">
                    <span>قائمة التحقق الاستباقية لاستقبال السيد(ة) المفتش(ة):</span>
                    <span className="text-[#117a37] tabular-nums">
                      {Object.values(selectedVisit.readinessChecklist).filter(Boolean).length} / 4 مكتمل
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVisit.readinessChecklist.notifiedTeacher}
                        onChange={() => toggleVisitReadiness('notifiedTeacher')}
                        className="accent-[#117a37]"
                      />
                      <span>تبليغ الأستاذ(ة) المعني(ة) رسمياً</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVisit.readinessChecklist.checkedDailyNotebook}
                        onChange={() => toggleVisitReadiness('checkedDailyNotebook')}
                        className="accent-[#117a37]"
                      />
                      <span>مراقبة وتأشير الكراس اليومي والمذكرات</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVisit.readinessChecklist.preparedAdminDossier}
                        onChange={() => toggleVisitReadiness('preparedAdminDossier')}
                        className="accent-[#117a37]"
                      />
                      <span>تحضير الملف الإداري وبطاقة الزيارة</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVisit.readinessChecklist.preparedRegistry10}
                        onChange={() => toggleVisitReadiness('preparedRegistry10')}
                        className="accent-[#117a37]"
                      />
                      <span>تجهيز السجل رقم 10 للتأشير</span>
                    </label>
                  </div>
                </div>

                {/* Documentation Fields for Observations & Recommendations */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        موضوع الدرس / النشاط المعاين:
                      </label>
                      <input
                        type="text"
                        value={selectedVisit.lessonTopic}
                        onChange={(e) => updateSelectedVisitField('lessonTopic', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        العلامة التربوية الممنوحة / التقدير:
                      </label>
                      <input
                        type="text"
                        value={selectedVisit.awardedScore}
                        onChange={(e) => updateSelectedVisitField('awardedScore', e.target.value)}
                        placeholder="مثال: 17.50 / 20 (جيد جداً)"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-black text-[#117a37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#094d22] mb-1">
                      1. الملاحظات الإيجابية ومواطن القوة المسجلة خلال الزيارة التفتيشية:
                    </label>
                    <textarea
                      rows={2}
                      value={selectedVisit.positiveObservations}
                      onChange={(e) => updateSelectedVisitField('positiveObservations', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded font-semibold leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#d91424] mb-1">
                      2. النقائص والتحفظات البيداغوجية أو الإدارية المسجلة:
                    </label>
                    <textarea
                      rows={2}
                      value={selectedVisit.recordedDeficiencies}
                      onChange={(e) => updateSelectedVisitField('recordedDeficiencies', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded font-semibold leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1">
                      3. توجيهات وتوصيات السيد(ة) المفتش(ة) وخطة المتابعة للمدير:
                    </label>
                    <textarea
                      rows={2}
                      value={selectedVisit.inspectorRecommendations}
                      onChange={(e) => updateSelectedVisitField('inspectorRecommendations', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded font-semibold leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        updateSelectedVisitField('status', 'منجزة وموثقة');
                        handleSyncVisitToRegistry10({
                          ...selectedVisit,
                          status: 'منجزة وموثقة',
                        });
                      }}
                      className="bg-[#117a37] hover:bg-[#094d22] text-white font-black text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد التوثيق وترحيله للسجل الرسمي رقم 10</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInspectorPrintMode('single_visit_report');
                        setTimeout(() => {
                          triggerPrintOrPdf(
                            `بطاقة_توثيق_زيارة_تفتيشية_${selectedVisit.targetTeacherName}`,
                            sheetRef.current
                          );
                        }, 100);
                      }}
                      className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-black text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة بطاقة هذه الزيارة</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODE 3: نماذج الوثائق الإدارية الفردية */}
      {bagSubMode === 'admin_docs' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'pv_install', label: '1. محضر تنصيب / استئناف عمل' },
                { id: 'work_cert', label: '2. شهادة عمل وإثبات مهنة' },
                { id: 'explanation_req', label: '3. استفسار كتابي إداري' },
                { id: 'absence_auth', label: '4. ترخيص غياب استثنائي' },
                { id: 'bordereau', label: '5. جدول إرسال رسمي (Bordereau)' },
                { id: 'accident_report', label: '6. تصريح بحادث مدرسي' },
              ] as const
            ).map((docBtn) => (
              <button
                key={docBtn.id}
                onClick={() => setSelectedDoc(docBtn.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1.5 ${
                  selectedDoc === docBtn.id
                    ? 'bg-[#117a37] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{docBtn.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">
                الموظف / الأستاذ(ة) المعني(ة):
              </label>
              <select
                value={targetTeacherId}
                onChange={(e) => setTargetTeacherId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({rankDisplayTitle(t.rank)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">رقم القيد / المراسلة:</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">تاريخ تحرير الوثيقة:</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">السبب / المرجع:</label>
              <input
                type="text"
                value={docReason}
                onChange={(e) => setDocReason(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Printable Official Document / Registry / Inspector Schedule Canvas */}
      <div className="sheet-scroll-container">
        <div ref={sheetRef} className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مفتشية التعليم الابتدائي — مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
              <div>
                {bagSubMode === 'registries_12'
                  ? `السجل الرسمي رقم : ${activeRegistryDef.numberLabel} / 12`
                  : bagSubMode === 'inspector_schedule'
                  ? `سجل جدولة وتوثيق الزيارات التفتيشية`
                  : `الرقم : ${docNumber}`}
              </div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    {bagSubMode === 'registries_12' ? (
                      activeRegistryDef.title
                    ) : bagSubMode === 'inspector_schedule' ? (
                      inspectorPrintMode === 'all_schedule' ? (
                        'الجدول الرسمي لمواعيد تفتيش المفتشين التربويين وتوثيق الملاحظات البيداغوجية'
                      ) : (
                        `بطاقة توثيق ومتابعة زيارة تفتيشية (${selectedVisit?.refCode || ''})`
                      )
                    ) : (
                      <>
                        {selectedDoc === 'pv_install' && 'محضر تنصيب / استئناف العمل الرسمي'}
                        {selectedDoc === 'work_cert' && 'شهادة عمل وإثبات المهنة'}
                        {selectedDoc === 'explanation_req' && 'استفسار كتابي إداري'}
                        {selectedDoc === 'absence_auth' && 'ترخيص غياب استثنائي / إذن بالخروج'}
                        {selectedDoc === 'bordereau' && 'جدول إرسال الوثائق الرسمية (Bordereau d’envoi)'}
                        {selectedDoc === 'accident_report' && 'بطاقة التصريح بحادث مدرسي لتلميذ'}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>التاريخ : {bagSubMode === 'inspector_schedule' ? referenceTodayDate : docDate}</div>
              <div>المدير(ة) : {institution.directorName}</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          {/* Printable Content when in Registries 12 Mode */}
          {bagSubMode === 'registries_12' && (
            <div className="mt-2">
              <table className="timetable-grid">
                <thead>
                  <tr className="hours-header">
                    <th style={{ width: '95px' }}>{activeRegistryDef.col1Label}</th>
                    <th style={{ width: '100px' }}>{activeRegistryDef.col2Label}</th>
                    <th style={{ width: '220px' }}>{activeRegistryDef.col3Label}</th>
                    <th>{activeRegistryDef.col4Label}</th>
                    <th style={{ width: '210px' }}>{activeRegistryDef.col5Label}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegistryRows.map((row) => (
                    <tr key={row.id}>
                      <td className="font-black text-[#d91424] tabular-nums py-2">{row.refNum}</td>
                      <td className="font-bold tabular-nums py-2">{row.date}</td>
                      <td
                        className="font-extrabold text-right px-2 py-2"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {row.partyOrTarget}
                      </td>
                      <td
                        className="font-bold text-[#094d22] text-right px-2 py-2"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {row.subjectOrDetail}
                      </td>
                      <td
                        className="font-bold text-right px-2 py-2"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {row.actionOrObservation}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3">.........</td>
                    <td>.... / .. / ..</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Printable Content when in Inspector Schedule & Documentation Mode */}
          {bagSubMode === 'inspector_schedule' && (
            <div className="mt-2">
              {inspectorPrintMode === 'all_schedule' ? (
                <table className="timetable-grid">
                  <thead>
                    <tr className="hours-header">
                      <th style={{ width: '85px' }}>المرجع</th>
                      <th style={{ width: '105px' }}>التاريخ والتوقيت</th>
                      <th style={{ width: '185px' }}>السيد(ة) المفتش(ة) والاختصاص</th>
                      <th style={{ width: '175px' }}>الأستاذ(ة) المعني(ة) والفوج</th>
                      <th style={{ width: '140px' }}>طبيعة الزيارة والعلامة</th>
                      <th>توثيق الملاحظات البيداغوجية والتوصيات المسجلة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectorVisits.map((v) => (
                      <tr key={v.id}>
                        <td className="font-black text-[#d91424] tabular-nums py-2">{v.refCode}</td>
                        <td className="font-bold tabular-nums py-2">
                          <div>{v.visitDate}</div>
                          <div className="text-[10px]">{v.visitTimeSlot}</div>
                        </td>
                        <td className="font-extrabold text-right px-2 py-2">
                          <div>{v.inspectorName}</div>
                          <div className="text-[10px] text-[#117a37]">{v.inspectorSpecialty}</div>
                        </td>
                        <td className="font-bold text-right px-2 py-2">
                          <div>{v.targetTeacherName}</div>
                          <div className="text-[10px] text-slate-700">{v.targetClassGroup}</div>
                        </td>
                        <td className="font-bold py-2">
                          <div className="text-[#094d22]">{v.visitPurpose}</div>
                          <div className="text-[10px] font-black text-[#d91424] mt-0.5">
                            {v.status} ({v.awardedScore})
                          </div>
                        </td>
                        <td className="text-right px-2 py-2 text-[11px] leading-snug">
                          <div>
                            <b>الملاحظات:</b> {v.positiveObservations}
                          </div>
                          <div>
                            <b>التوصيات:</b> {v.inspectorRecommendations}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                selectedVisit && (
                  <div className="border-2 border-black p-4 space-y-3 text-xs bg-white">
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-black font-bold">
                      <div>رقم ومرجع الزيارة: {selectedVisit.refCode}</div>
                      <div>تاريخ وتوقيت الزيارة: {selectedVisit.visitDate} ({selectedVisit.visitTimeSlot})</div>
                      <div>حالة الزيارة: {selectedVisit.status}</div>
                      <div>السيد(ة) المفتش(ة): {selectedVisit.inspectorName}</div>
                      <div>الاختصاص: {selectedVisit.inspectorSpecialty}</div>
                      <div>طبيعة الزيارة: {selectedVisit.visitPurpose}</div>
                      <div>الأستاذ(ة) المعني(ة): {selectedVisit.targetTeacherName}</div>
                      <div>الفوج التربوي والقاعة: {selectedVisit.targetClassGroup}</div>
                      <div>العلامة والتقدير الممنوح: {selectedVisit.awardedScore}</div>
                    </div>

                    <div className="border border-black p-2.5">
                      <b className="text-[#094d22]">موضوع الدرس / النشاط البيداغوجي المعاين: </b>
                      <span>{selectedVisit.lessonTopic}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-black p-3">
                        <div className="font-black text-[#094d22] mb-1">
                          1. الجوانب الإيجابية ونقاط القوة المسجلة:
                        </div>
                        <p className="leading-relaxed">{selectedVisit.positiveObservations}</p>
                      </div>
                      <div className="border border-black p-3">
                        <div className="font-black text-[#d91424] mb-1">
                          2. النقائص والتحفظات الواجب تداركها:
                        </div>
                        <p className="leading-relaxed">{selectedVisit.recordedDeficiencies}</p>
                      </div>
                    </div>

                    <div className="border border-black p-3 bg-slate-50">
                      <div className="font-black text-slate-900 mb-1">
                        3. التوصيات والتوجيهات البيداغوجية للسيد(ة) المفتش(ة) وخطة المرافقة:
                      </div>
                      <p className="leading-relaxed">{selectedVisit.inspectorRecommendations}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Printable Content when in Admin Docs Mode */}
          {bagSubMode === 'admin_docs' && (
            <>
              {selectedDoc === 'pv_install' && targetTeacher && (
                <div className="border-2 border-black p-6 mt-4 space-y-4 text-sm leading-loose bg-white">
                  <p contentEditable suppressContentEditableWarning>
                    في عام ألفين وستة وعشرين، وفي اليوم الموافق لـ: <b>{docDate}</b> على الساعة الثامنة (08:00) صباحاً،
                  </p>
                  <p contentEditable suppressContentEditableWarning>
                    نحن السيد(ة): <b>{institution.directorName}</b>، مدير(ة) المدرسة الابتدائية{' '}
                    <b>{institution.school}</b> بمقاطعة <b>{institution.district}</b> — مديرية التربية لولاية{' '}
                    <b>{institution.wilaya}</b>،
                  </p>
                  <p contentEditable suppressContentEditableWarning>
                    نقر ونشهد أننا قمنا بتنصيب / معاينة استئناف عمل السيد(ة):{' '}
                    <b className="text-[#d91424]">{targetTeacher.name}</b>
                  </p>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-black font-bold text-xs">
                    <div contentEditable suppressContentEditableWarning>
                      الرتبة القانونية (المرسوم 25-54): {rankDisplayTitle(targetTeacher.rank)}
                    </div>
                    <div contentEditable suppressContentEditableWarning>
                      مادة التخصص: {specDisplayTitle(targetTeacher.spec)}
                    </div>
                    <div contentEditable suppressContentEditableWarning>طبيعة الإجراء: {docReason}</div>
                    <div contentEditable suppressContentEditableWarning>تاريخ سريان المفعول: {docDate}</div>
                  </div>
                  <p contentEditable suppressContentEditableWarning>
                    حرر هذا المحضر في أربع (04) نسخ أصلية لإثبات الحالة وإرساله إلى المصالح المعنية بمديرية التربية ومفتشية التعليم الابتدائي.
                  </p>
                </div>
              )}

              {selectedDoc === 'work_cert' && targetTeacher && (
                <div className="border-2 border-black p-6 mt-4 space-y-4 text-sm leading-loose bg-white">
                  <p contentEditable suppressContentEditableWarning>
                    يشهد السيد(ة) مدير(ة) المدرسة الابتدائية <b>{institution.school}</b>، التابعة لمديرية التربية لولاية{' '}
                    <b>{institution.wilaya}</b>،
                  </p>
                  <p contentEditable suppressContentEditableWarning>
                    أن السيد(ة): <b className="text-[#094d22] text-base">{targetTeacher.name}</b>
                  </p>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-black font-bold text-xs">
                    <div contentEditable suppressContentEditableWarning>
                      الرتبة (المرسوم التنفيذي 25-54): {rankDisplayTitle(targetTeacher.rank)}
                    </div>
                    <div contentEditable suppressContentEditableWarning>
                      التخصص البيداغوجي: {specDisplayTitle(targetTeacher.spec)}
                    </div>
                    <div contentEditable suppressContentEditableWarning>
                      تاريخ التنصيب بالمؤسسة: {targetTeacher.installDate || '2018-09-01'}
                    </div>
                    <div contentEditable suppressContentEditableWarning>
                      الوضعية الإدارية الحالية: يزاول مهامه بانتظام إلى غاية يومنا هذا
                    </div>
                  </div>
                  <p contentEditable suppressContentEditableWarning>
                    سلمت هذه الشهادة للمعني(ة) بالأمر بناءً على طلبه(ها) لاستعمالها في حدود ما يسمح به القانون ({docReason}).
                  </p>
                </div>
              )}

              {selectedDoc === 'explanation_req' && targetTeacher && (
                <div className="border-2 border-black p-6 mt-4 space-y-4 text-sm leading-loose bg-white">
                  <div className="font-black text-[#d91424]" contentEditable suppressContentEditableWarning>
                    إلى السيد(ة): {targetTeacher.name} — الرتبة: {rankDisplayTitle(targetTeacher.rank)}
                  </div>
                  <p contentEditable suppressContentEditableWarning>
                    الموضوع: استفسار كتابي حول: <b>{docReason}</b> بتاريخ <b>{docDate}</b>.
                  </p>
                  <p contentEditable suppressContentEditableWarning>
                    بناءً على المعاينة الإدارية المسجلة في سجل مواظبة الموظفين، يطلب منكم تقديم تبرير كتابي مفصل في أجل أقصاه 48 ساعة من تاريخ استلام هذا الاستفسار، مدعماً بالوثائق الثبوتية اللازمة.
                  </p>
                  <div className="border border-dashed border-black p-4 bg-slate-50 min-h-[95px]">
                    <div className="font-black text-xs text-[#094d22] mb-1">رد الموظف(ة) المعني(ة) وتوقيعه(ها):</div>
                    <div contentEditable suppressContentEditableWarning className="text-xs text-slate-700">
                      ....................................................................................................................................................................
                    </div>
                  </div>
                </div>
              )}

              {selectedDoc === 'absence_auth' && targetTeacher && (
                <div className="border-2 border-black p-6 mt-4 space-y-4 text-sm leading-loose bg-white">
                  <p contentEditable suppressContentEditableWarning>
                    بناءً على الطلب المقدم من طرف السيد(ة): <b>{targetTeacher.name}</b> ({rankDisplayTitle(targetTeacher.rank)})،
                  </p>
                  <p contentEditable suppressContentEditableWarning>
                    يرخص للمعني(ة) بالغياب الاستثنائي / الخروج المؤقت يوم: <b>{docDate}</b>، وذلك للسبب التالي:{' '}
                    <b>{docReason}</b>، مع اتخاذ التدابير البيداغوجية اللازمة لضمان التغطية واستمرارية تمدرس التلاميذ.
                  </p>
                </div>
              )}

              {selectedDoc === 'bordereau' && (
                <div className="mt-3">
                  <div className="text-center font-black text-sm mb-2" contentEditable suppressContentEditableWarning>
                    إلى السيد(ة): مدير التربية لولاية {institution.wilaya} / مفتش التعليم الابتدائي لمقاطعة{' '}
                    {institution.district}
                  </div>
                  <table className="timetable-grid">
                    <thead>
                      <tr className="hours-header">
                        <th style={{ width: '50px' }}>الرقم</th>
                        <th>بيان الوثائق المرسلة</th>
                        <th style={{ width: '130px' }}>العدد / المرفقات</th>
                        <th style={{ width: '240px' }}>الملاحظات والغرض</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bordereauItems.map((b, i) => (
                        <tr key={i}>
                          <td className="font-bold tabular-nums py-2.5">{i + 1}</td>
                          <td className="font-extrabold text-right px-3" contentEditable suppressContentEditableWarning>
                            {b.title}
                          </td>
                          <td className="font-bold tabular-nums" contentEditable suppressContentEditableWarning>
                            {b.count}
                          </td>
                          <td className="font-bold text-[#094d22]" contentEditable suppressContentEditableWarning>
                            {b.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="no-print mt-2">
                    <button
                      onClick={() =>
                        setBordereauItems((prev) => [
                          ...prev,
                          { title: 'وثيقة إدارية / بيداغوجية إضافية...', count: '01 نسخة', note: 'للتفضل بالاطلاع' },
                        ])
                      }
                      className="bg-[#117a37] text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer"
                    >
                      + إضافة سطر جديد في جدول الإرسال
                    </button>
                  </div>
                </div>
              )}

              {selectedDoc === 'accident_report' && (
                <div className="border-2 border-black p-5 mt-3 space-y-3 text-xs leading-relaxed bg-white">
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-black font-bold">
                    <div contentEditable suppressContentEditableWarning>
                      اسم ولقب التلميذ(ة) المصاب(ة): ...........................
                    </div>
                    <div contentEditable suppressContentEditableWarning>تاريخ الميلاد والقسم: السنة ........ ابتدائي</div>
                    <div contentEditable suppressContentEditableWarning>
                      تاريخ وساعة الحادث: {docDate} على الساعة 09:35
                    </div>
                    <div contentEditable suppressContentEditableWarning>
                      مكان وقوع الحادث: ساحة المدرسة أثناء الاستراحة
                    </div>
                    <div contentEditable suppressContentEditableWarning>الأستاذ(ة) المناوب(ة): {targetTeacher?.name}</div>
                    <div contentEditable suppressContentEditableWarning>
                      الإجراء المتخذ: الإسعاف الأولي وإخطار الولي والحماية المدنية
                    </div>
                  </div>
                  <div>
                    <strong className="block text-[#d91424] mb-1">وصف مفصل لظروف الحادث وشهادة الشهود:</strong>
                    <p contentEditable suppressContentEditableWarning className="border border-slate-300 p-3 rounded">
                      أثناء فترة الاستراحة الصباحية وبحضور الأساتذة المناوبين في الساحة، تعثر التلميذ المذكور أعلاه عفوياً مما أدى إلى إصابته إصابة خفيفة، وقد تم التكفل به فوراً وإشعار ولي أمره في الحين.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="footer-signatures mt-6">
            <div>توقيع المعني(ة) / الأمانة</div>
            <div>إمضاء وختم السيد(ة) المدير(ة)</div>
            <div>تأشيرة ومصادقة السيد(ة) المفتش(ة)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
