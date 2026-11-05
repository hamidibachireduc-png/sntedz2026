export interface ActivityItem {
  t: string;
  d: string;
  w?: string;
  c?: string;
}

export interface DaySchedule {
  day: string;
  m1: ActivityItem[];
  m2: ActivityItem[];
  a1: ActivityItem[] | 'off';
}

export interface TimetableModel {
  lang: 'ar' | 'fr' | 'en' | 'tz';
  spec: 'arabic' | 'french' | 'english' | 'amazigh' | 'pe';
  levelTitle: string;
  systemTitle: string;
  arabicActualHours: number;
  workloadLabel: string;
  summaryHeaders: string[];
  summaryCounts: string[];
  summaryDurs: string[];
  days: DaySchedule[];
}

export interface Teacher {
  id: string;
  name: string;
  rank: 'مميز' | 'قسم ثان' | 'قسم أول' | 'تعليم ابتدائي';
  spec: 'arabic' | 'french' | 'english' | 'amazigh' | 'pe';
  installDate?: string;
  phone?: string;
  status?: 'ناشط' | 'عطلة مرضية' | 'تكوين';
}

export interface AssignedGroup {
  id: string;
  level: string;
  room: string;
  teacherId: string;
  boys?: number;
  girls?: number;
  repeaters?: number;
}

export const OFFICIAL_AUTHOR_SIGNATURE = '🔒 من إعداد الأستاذ حميدي البشير - أكتوبر 2026';

export function createSnteLogoDataUrl(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 80, 76, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#117a37';
    ctx.beginPath();
    ctx.arc(80, 80, 72, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = '#d91424';
    ctx.beginPath();
    ctx.arc(80, 80, 72, 0, Math.PI, false);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 80, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e6b85c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(80, 80, 74, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#094d22';
    ctx.font = '900 22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S.N.T.E', 80, 74);

    ctx.fillStyle = '#d91424';
    ctx.font = 'bold 11px Tahoma';
    ctx.fillText('النقابة الوطنية', 80, 96);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'أ. حميدي البشير', rank: 'مميز', spec: 'arabic', installDate: '2010-09-01', status: 'ناشط' },
  { id: 't2', name: 'أ. عبد القادر رحماني', rank: 'مميز', spec: 'arabic', installDate: '2011-09-01', status: 'ناشط' },
  { id: 't3', name: 'أ. سعاد بن يطو', rank: 'قسم ثان', spec: 'arabic', installDate: '2014-09-01', status: 'ناشط' },
  { id: 't4', name: 'أ. فاطمة الزهراء عليوي', rank: 'قسم أول', spec: 'arabic', installDate: '2017-09-01', status: 'ناشط' },
  { id: 't5', name: 'أ. كمال بوزيد', rank: 'تعليم ابتدائي', spec: 'arabic', installDate: '2021-09-01', status: 'ناشط' },
  { id: 't6', name: 'أ. أمين بلحاج', rank: 'تعليم ابتدائي', spec: 'arabic', installDate: '2022-09-01', status: 'ناشط' },
  { id: 't7', name: 'Mme. Amrani Nadia', rank: 'قسم ثان', spec: 'french', installDate: '2015-09-01', status: 'ناشط' },
  { id: 't8', name: 'Mr. Mansouri Karim', rank: 'قسم أول', spec: 'english', installDate: '2022-09-01', status: 'ناشط' },
  { id: 't9', name: 'Mass Yacine Ait Kaci', rank: 'تعليم ابتدائي', spec: 'amazigh', installDate: '2020-09-01', status: 'ناشط' },
  { id: 't10', name: 'أ. بوعلام دراجي', rank: 'قسم أول', spec: 'pe', installDate: '2023-09-01', status: 'ناشط' },
];

export const INITIAL_GROUPS: AssignedGroup[] = [
  { id: 'g1', level: '1', room: 'حجرة 01 (س1)', teacherId: 't1', boys: 18, girls: 16, repeaters: 1 },
  { id: 'g2', level: '2', room: 'حجرة 02 (س2)', teacherId: 't2', boys: 17, girls: 18, repeaters: 2 },
  { id: 'g5', level: '5', room: 'حجرة 05 (س5)', teacherId: 't3', boys: 19, girls: 17, repeaters: 2 },
  { id: 'g4', level: '4', room: 'حجرة 04 (س4)', teacherId: 't4', boys: 16, girls: 17, repeaters: 1 },
  { id: 'g3', level: '3', room: 'حجرة 03 (س3)', teacherId: 't5', boys: 18, girls: 15, repeaters: 1 },
  { id: 'gp', level: 'prep', room: 'فوج تحضيري', teacherId: 't6', boys: 14, girls: 15, repeaters: 0 },
  { id: 'g_fr', level: 'fr', room: '3AP (G1/G2) + 4AP (G1/G2) + 5AP (G1/G2)', teacherId: 't7', boys: 0, girls: 0, repeaters: 0 },
  { id: 'g_en', level: 'en', room: '3PS (G1/G2) + 4PS (G1/G2) + 5PS (G1/G2)', teacherId: 't8', boys: 0, girls: 0, repeaters: 0 },
  { id: 'g_tz', level: 'tz', room: '4AP (G1/G2) + 5AP (G1/G2)', teacherId: 't9', boys: 0, girls: 0, repeaters: 0 },
  { id: 'g_pe', level: 'pe', room: 'أفواج: س1 + س2 + س3 + س4 + س5', teacherId: 't10', boys: 0, girls: 0, repeaters: 0 },
];

export function rankDisplayTitle(rank: string, lang: string = 'ar'): string {
  if (lang === 'fr') {
    if (rank === 'مميز') return 'Professeur Distingué';
    if (rank === 'قسم ثان') return 'Professeur Classe 2';
    if (rank === 'قسم أول') return 'Professeur Classe 1';
    return 'Professeur Ens. Primaire';
  }
  if (lang === 'en') {
    if (rank === 'مميز') return 'Distinguished Teacher';
    if (rank === 'قسم ثان') return 'Class 2 Teacher';
    if (rank === 'قسم أول') return 'Class 1 Teacher';
    return 'Primary School Teacher';
  }
  if (lang === 'tz') {
    if (rank === 'مميز') return 'Aselmad Ufrin (مميز)';
    if (rank === 'قسم ثان') return 'Aselmad Asmil 2 (قسم ثان)';
    if (rank === 'قسم أول') return 'Aselmad Asmil 1 (قسم أول)';
    return 'Aselmad n Umezwaru (ابتدائي)';
  }
  if (rank === 'تعليم ابتدائي') return 'أستاذ تعليم ابتدائي';
  if (rank === 'قسم أول') return 'أستاذ قسم أول';
  if (rank === 'قسم ثان') return 'أستاذ قسم ثانٍ';
  if (rank === 'مميز') return 'أستاذ مميز';
  return rank;
}

export function specDisplayTitle(spec: string): string {
  if (spec === 'arabic') return 'لغة عربية';
  if (spec === 'french') return 'لغة فرنسية (Français)';
  if (spec === 'english') return 'لغة إنجليزية (English)';
  if (spec === 'amazigh') return 'لغة أمازيغية (Tamaziɣt)';
  if (spec === 'pe') return 'تربية بدنية ورياضية';
  return spec;
}

export function rankWeight(rank: string): number {
  if (rank === 'مميز') return 1;
  if (rank === 'قسم ثان') return 2;
  if (rank === 'قسم أول') return 3;
  return 4;
}

export function levelWeight(level: string, policy: string): number {
  if (policy === 'by_rank') {
    const map1: Record<string, number> = { '1': 100, '2': 95, '5': 90, '4': 75, '3': 65, prep: 50 };
    return map1[level] || 10;
  }
  if (policy === 'exceptional') {
    const map2: Record<string, number> = { '5': 100, '4': 85, '3': 75, '2': 65, '1': 60, prep: 50 };
    return map2[level] || 10;
  }
  return 50;
}

export const MODELS: Record<string, TimetableModel> = {
  prep: {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'التربية التحضيرية (عربية)',
    systemTitle: 'التوقيت الأسبوعي - قسم التربية التحضيرية',
    arabicActualHours: 17,
    workloadLabel: '17 سا تعليم فعلي + 4 سا تنظيم (21 سا)',
    summaryHeaders: [
      'الأنشطة',
      'اللغة العربية',
      'رياضيات',
      'تربية إسلامية',
      'إيقاظ علمي',
      'ت مدنية',
      'رسم وأشغال',
      'تربية إيقاعية',
      'مسرح وعرائس',
      'موسيقى وإنشاد',
      'تربية بدنية',
      'التنظيم',
      'المجموع',
    ],
    summaryCounts: ['الحصص', '09', '05', '02', '04', '02', '02', '02', '02', '02', '04', '16', '34+18'],
    summaryDurs: ['المدة', '04:30', '02:30', '01:00', '02:00', '01:00', '01:00', '01:00', '01:00', '01:00', '02:00', '16×15د', '17:00+4:00'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'استقبال الأطفال', d: '15 د' },
          { t: 'تربية إسلامية', d: '30 د' },
          { t: 'تعبير شفوي', d: '30 د' },
          { t: 'ألعاب قرائية', d: '15 د' },
        ],
        m2: [
          { t: 'رياضيات', d: '30 د', c: 'bg-math' },
          { t: 'تربية إيقاعية', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
        a1: [
          { t: 'استقبال', d: '15 د' },
          { t: 'إيقاظ علمي', d: '30 د' },
          { t: 'رسم وأشغال', d: '30 د' },
          { t: 'مسرح وعرائس', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'استقبال الأطفال', d: '15 د' },
          { t: 'تربية مدنية', d: '30 د' },
          { t: 'تعبير شفوي', d: '30 د' },
          { t: 'تخطيط', d: '15 د' },
        ],
        m2: [
          { t: 'رياضيات', d: '30 د', c: 'bg-math' },
          { t: 'مسرح وعرائس', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
        a1: [
          { t: 'استقبال', d: '15 د' },
          { t: 'إيقاظ علمي', d: '30 د' },
          { t: 'تربية بدنية', d: '30 د', c: 'bg-pe' },
          { t: 'تربية بدنية', d: '30 د', c: 'bg-pe' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'استقبال الأطفال', d: '15 د' },
          { t: 'تربية إسلامية', d: '30 د' },
          { t: 'تعبير شفوي', d: '30 د' },
          { t: 'ألعاب قرائية', d: '15 د' },
        ],
        m2: [
          { t: 'رياضيات', d: '30 د', c: 'bg-math' },
          { t: 'موسيقى وإنشاد', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'استقبال الأطفال', d: '15 د' },
          { t: 'تربية مدنية', d: '30 د' },
          { t: 'رياضيات', d: '30 د', c: 'bg-math' },
          { t: 'تخطيط', d: '15 د' },
        ],
        m2: [
          { t: 'إيقاظ علمي', d: '30 د' },
          { t: 'رسم وأشغال', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
        a1: [
          { t: 'استقبال', d: '15 د' },
          { t: 'إيقاظ علمي', d: '30 د' },
          { t: 'تربية بدنية', d: '30 د', c: 'bg-pe' },
          { t: 'تربية بدنية', d: '30 د', c: 'bg-pe' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'استقبال الأطفال', d: '15 د' },
          { t: 'ألعاب قرائية', d: '30 د' },
          { t: 'إيقاظ علمي', d: '30 د' },
          { t: 'تربية إيقاعية', d: '15 د' },
        ],
        m2: [
          { t: 'رياضيات', d: '30 د', c: 'bg-math' },
          { t: 'موسيقى وإنشاد', d: '30 د' },
          { t: 'تهيئة للخروج', d: '15 د' },
        ],
        a1: 'off',
      },
    ],
  },
  '1': {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'السنة الأولى ابتدائي (عربية)',
    systemTitle: 'التوقيت الأسبوعي - السنة الأولى ابتدائي (اللغة العربية)',
    arabicActualHours: 19,
    workloadLabel: 'الحجم الفعلي: 19 سا عربية (27 حصة)',
    summaryHeaders: ['الأنشطة', 'اللغة العربية', 'رياضيات', 'تربية إسلامية', 'تربية فنية', 'التعليم الفعلي لغة عربية', 'تربية بدنية', 'المجموع'],
    summaryCounts: ['الحصص', '14', '07', '03', '03', '27', '02', '29'],
    summaryDurs: ['المدة', '11:00', '05:00', '01:30', '01:30', '19 سا', '02:00', '21:00 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'فهم المنطوق (س1)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'تعبير شفوي (س1)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س1)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'التربية الفنية (س1)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'رياضيات: معالجة ودعم (س1)', d: '30 د (13:00-13:30)', w: 'w-30', c: 'bg-math' },
          { t: 'القراءة الإجمالية (س1)', d: '60 د (13:30-14:30)', w: 'w-60' },
          { t: 'محفوظات (س1)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'التربية الإسلامية (س1)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'قراءة تحليلية (س1)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س1)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'كتابة وخط (س1)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'قراءة وتركيب (س1)', d: '60 د (13:00-14:00)', w: 'w-60' },
          { t: 'التربية البدنية والرياضية (س1)', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-pe' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'كتابة وخط (س1)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'رياضيات: درس وتطبيقات (س1)', d: '60 د (08:30-09:30)', w: 'w-60', c: 'bg-math' },
        ],
        m2: [
          { t: 'الإنتاج الشفوي (س1)', d: '60 د (09:45-10:45)', w: 'w-60' },
          { t: 'التربية الإسلامية (س1)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'قراءة (س1)', d: '60 د (08:00-09:00)', w: 'w-60' },
          { t: 'كتابة وخط (س1)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'تطبيقات قرائية (س1)', d: '60 د (09:45-10:45)', w: 'w-60' },
          { t: 'رياضيات: معالجة ودعم (س1)', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-math' },
        ],
        a1: [
          { t: 'تطبيقات كتابية (س1)', d: '60 د (13:00-14:00)', w: 'w-60' },
          { t: 'إملاء (س1)', d: '30 د (14:00-14:30)', w: 'w-30' },
          { t: 'التربية الفنية (س1)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'التربية الإسلامية (س1)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'إدماج وألعاب قرائية (س1)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'رياضيات: ألعاب رياضياتية (س1)', d: '30 د (09:45-10:15)', w: 'w-30', c: 'bg-math' },
          { t: 'التربية البدنية والرياضية (س1)', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-pe' },
        ],
        a1: 'off',
      },
    ],
  },
  '2': {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'السنة الثانية ابتدائي (عربية)',
    systemTitle: 'التوقيت الأسبوعي - السنة الثانية ابتدائي (اللغة العربية)',
    arabicActualHours: 19,
    workloadLabel: 'الحجم الفعلي: 19 سا عربية (27 حصة)',
    summaryHeaders: ['الأنشطة', 'اللغة العربية', 'رياضيات', 'تربية إسلامية', 'تربية فنية', 'التعليم الفعلي لغة عربية', 'تربية بدنية', 'المجموع'],
    summaryCounts: ['الحصص', '15', '07', '03', '03', '27', '02', '30'],
    summaryDurs: ['المدة', '11:00', '05:00', '01:30', '01:30', '19 سا', '02:00', '21:00 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'التربية الإسلامية (س2)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'فهم المنطوق (س2)', d: '30 د (08:30-09:00)', w: 'w-30' },
          { t: 'تعبير شفوي (س2)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س2)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'التربية الفنية (س2)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'رياضيات: معالجة ودعم (س2)', d: '30 د (13:00-13:30)', w: 'w-30', c: 'bg-math' },
          { t: 'القراءة (س2)', d: '60 د (13:30-14:30)', w: 'w-60' },
          { t: 'كتابة وخط (س2)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'رياضيات: درس وتطبيقات (س2)', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-math' },
          { t: 'التربية الفنية (س2)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'رياضيات: معالجة ودعم (س2)', d: '30 د (09:45-10:15)', w: 'w-30', c: 'bg-math' },
          { t: 'الإنتاج الشفوي (س2)', d: '60 د (10:15-11:15)', w: 'w-60' },
        ],
        a1: [
          { t: 'قراءة (س2)', d: '60 د (13:00-14:00)', w: 'w-60' },
          { t: 'التربية البدنية والرياضية (س2)', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-pe' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'إملاء (س2)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'رياضيات: درس وتطبيقات (س2)', d: '60 د (08:30-09:30)', w: 'w-60', c: 'bg-math' },
        ],
        m2: [
          { t: 'القراءة (س2)', d: '60 د (09:45-10:45)', w: 'w-60' },
          { t: 'كتابة وخط (س2)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'قراءة (س2)', d: '60 د (08:00-09:00)', w: 'w-60' },
          { t: 'محفوظات (س2)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'التربية الإسلامية (س2)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'رياضيات: معالجة ودعم (س2)', d: '30 د (10:15-10:45)', w: 'w-30', c: 'bg-math' },
          { t: 'التربية الفنية (س2)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'قراءة إتقان (س2)', d: '60 د (13:00-14:00)', w: 'w-60' },
          { t: 'التربية البدنية والرياضية (س2)', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-pe' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'إملاء (س2)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'إدماج (س2)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'رياضيات: ألعاب رياضياتية (س2)', d: '30 د (09:45-10:15)', w: 'w-30', c: 'bg-math' },
          { t: 'التربية الإسلامية (س2)', d: '30 د (10:15-10:45)', w: 'w-30' },
          { t: 'محفوظات (س2)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: 'off',
      },
    ],
  },
  '3': {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'السنة الثالثة ابتدائي (عربية)',
    systemTitle: 'التوقيت الأسبوعي - السنة الثالثة ابتدائي (اللغة العربية)',
    arabicActualHours: 17,
    workloadLabel: 'الفعلي عربية: 17 سا (25 حصة)',
    summaryHeaders: [
      'الأنشطة',
      'اللغة العربية',
      'رياضيات',
      'تربية إسلامية',
      'تربية علمية',
      'تاريخ',
      'تربية فنية',
      'التعليم الفعلي لغة عربية',
      'تربية بدنية',
      'فرنسية/إنجليزية',
      'المجموع',
    ],
    summaryCounts: ['الحصص', '09', '07', '03', '02', '01', '03', '25', '02', '04', '31'],
    summaryDurs: ['المدة', '07:30', '05:00', '01:30', '01:00', '30 د', '01:30', '17:00 سا', '02:00', '03:00', '22:00 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'فهم المنطوق (س3)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'القراءة: أداء وفهم (س3)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'تعبير شفوي (س3)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'رياضيات: درس وتطبيقات (س3)', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-math' },
        ],
        a1: [
          { t: 'Français / English (س3)', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'رياضيات: معالجة ودعم (س3)', d: '30 د (14:00-14:30)', w: 'w-30', c: 'bg-math' },
          { t: 'تربية إسلامية (س3)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'قراءة + ظاهرة تركيبية (س3)', d: '60 د (08:00-09:00)', w: 'w-60' },
          { t: 'تربية فنية (س3)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'إنتاج شفوي (س3)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'رياضيات: درس وتطبيقات (س3)', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-math' },
        ],
        a1: [
          { t: 'تربية بدنية ورياضية (س3)', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-pe' },
          { t: 'مطالعة (س3)', d: '60 د (14:00-15:00)', w: 'w-60' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'تربية علمية (س3)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'تربية إسلامية (س3)', d: '30 د (08:30-09:00)', w: 'w-30' },
          { t: 'تاريخ (س3)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'قراءة + ظاهرة صرفية أو إملائية (س3)', d: '60 د (09:45-10:45)', w: 'w-60' },
          { t: 'رياضيات: معالجة ودعم (س3)', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-math' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'تربية إسلامية (س3)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'رياضيات: ألعاب رياضياتية (س3)', d: '60 د (08:30-09:30)', w: 'w-60', c: 'bg-math' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س3)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'تربية فنية (س3)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'تربية علمية (س3)', d: '30 د (13:00-13:30)', w: 'w-30' },
          { t: 'رياضيات: معالجة ودعم (س3)', d: '30 د (13:30-14:00)', w: 'w-30', c: 'bg-math' },
          { t: 'محفوظات (س3)', d: '30 د (14:00-14:30)', w: 'w-30' },
          { t: 'تربية فنية (س3)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'Français / English (س3)', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'التدريب على الإنتاج الكتابي (س3)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'التدريب على الإنتاج الكتابي (س3)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'تربية بدنية ورياضية (س3)', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-pe' },
        ],
        a1: 'off',
      },
    ],
  },
  '4': {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'السنة الرابعة ابتدائي (عربية)',
    systemTitle: 'التوقيت الأسبوعي - السنة الرابعة ابتدائي (اللغة العربية)',
    arabicActualHours: 17,
    workloadLabel: 'الفعلي عربية: 17 سا (27 حصة)',
    summaryHeaders: [
      'الأنشطة',
      'اللغة العربية',
      'رياضيات',
      'تربية إسلامية',
      'ت مدنية',
      'تربية علمية',
      'تاريخ جغرافيا',
      'تربية فنية',
      'التعليم الفعلي لغة عربية',
      'تربية بدنية',
      'فرنسية',
      'إنجليزية',
      'المجموع',
    ],
    summaryCounts: ['الحصص', '09', '06', '04', '02', '02', '02', '02', '27', '01', '02', '02', '32'],
    summaryDurs: ['المدة', '06:30', '04:30', '02:00', '01:00', '01:00', '01:00', '01:00', '17:00 سا', '01:30', '02:00', '02:00', '22:30 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'تربية إسلامية (س4)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'القراءة: أداء وفهم (س4)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'التربية الفنية (س4)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'فهم المنطوق (س4)', d: '30 د (10:15-10:45)', w: 'w-30' },
          { t: 'تعبير شفوي (س4)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'رياضيات: معالجة ودعم (س4)', d: '30 د (13:00-13:30)', w: 'w-30', c: 'bg-math' },
          { t: 'English (س4)', d: '60 د (13:30-14:30)', w: 'w-60', c: 'bg-lang' },
          { t: 'تربية مدنية (س4)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'تربية إسلامية (س4)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'رياضيات: درس وتطبيقات (س4)', d: '60 د (08:30-09:30)', w: 'w-60', c: 'bg-math' },
        ],
        m2: [
          { t: 'الإنتاج الشفوي (س4)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'قراءة + ظاهرة تركيبية (س4)', d: '60 د (10:15-11:15)', w: 'w-60' },
        ],
        a1: [
          { t: 'التربية العلمية (س4)', d: '30 د (13:00-13:30)', w: 'w-30' },
          { t: 'جغرافيا (س4)', d: '30 د (13:30-14:00)', w: 'w-30' },
          { t: 'Français (س4)', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-lang' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'التربية العلمية (س4)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'تاريخ (س4)', d: '30 د (08:30-09:00)', w: 'w-30' },
          { t: 'ت إسلامية (س4)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س4)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'محفوظات (س4)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'القراءة والظاهرة الصرفية أو الإملائية (س4)', d: '60 د (08:00-09:00)', w: 'w-60' },
          { t: 'رياضيات: معالجة ودعم (س4)', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-math' },
        ],
        m2: [
          { t: 'تربية مدنية (س4)', d: '30 د (09:45-10:15)', w: 'w-30' },
          { t: 'English (س4)', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-lang' },
        ],
        a1: [
          { t: 'تربية بدنية ورياضية (س4)', d: '90 د (13:00-14:30)', w: 'w-90', c: 'bg-pe' },
          { t: 'التربية الفنية (س4)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'تربية إسلامية (س4)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'Français (س4)', d: '60 د (08:30-09:30)', w: 'w-60', c: 'bg-lang' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س4)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'الإنتاج الكتابي (س4)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'مطالعة (س4)', d: '30 د (13:00-13:30)', w: 'w-30' },
          { t: 'تكوين / نشاطات ثقافية ورياضية', d: '90 د (13:30-15:00)', w: 'w-90', c: 'bg-off' },
        ],
      },
    ],
  },
  '5': {
    lang: 'ar',
    spec: 'arabic',
    levelTitle: 'السنة الخامسة ابتدائي (عربية)',
    systemTitle: 'التوقيت الأسبوعي - السنة الخامسة ابتدائي (اللغة العربية)',
    arabicActualHours: 17,
    workloadLabel: 'قسم نهائي (المرسوم 25-54) | 17 سا فعلي',
    summaryHeaders: [
      'الأنشطة',
      'اللغة العربية',
      'رياضيات',
      'تربية إسلامية',
      'ت مدنية',
      'تربية علمية',
      'تاريخ جغرافيا',
      'تربية فنية',
      'التعليم الفعلي لغة عربية',
      'تربية بدنية',
      'فرنسية',
      'إنجليزية',
      'المجموع',
    ],
    summaryCounts: ['الحصص', '09', '06', '03', '01', '02', '02', '01', '23', '01', '03', '02', '29'],
    summaryDurs: ['المدة', '06:30', '04:30', '01:30', '0:45', '01:30', '01:30', '0:45', '17:00 سا', '01:00', '03:00', '01:30', '22:30 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'ت إسلامية (س5)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'فهم المنطوق (س5)', d: '30 د (08:30-09:00)', w: 'w-30' },
          { t: 'ت شفوي (س5)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'القراءة: أداء وفهم (س5)', d: '60 د (09:45-10:45)', w: 'w-60' },
          { t: 'رياضيات: معالجة ودعم (س5)', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-math' },
        ],
        a1: [
          { t: 'Français (س5)', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'تربية بدنية ورياضية (س5)', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-pe' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'رياضيات: درس وتطبيقات (س5)', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-math' },
          { t: 'تربية إسلامية (س5)', d: '30 د (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س5)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'رياضيات: معالجة ودعم (س5)', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-math' },
        ],
        a1: [
          { t: 'قراءة + ظاهرة تركيبية (س5)', d: '60 د (13:00-14:00)', w: 'w-60' },
          { t: 'محفوظات (س5)', d: '30 د (14:00-14:30)', w: 'w-30' },
          { t: 'الإنتاج الشفوي (س5)', d: '30 د (14:30-15:00)', w: 'w-30' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'تربية إسلامية (س5)', d: '30 د (08:00-08:30)', w: 'w-30' },
          { t: 'القراءة والظاهرة الصرفية أو الإملائية (س5)', d: '60 د (08:30-09:30)', w: 'w-60' },
        ],
        m2: [
          { t: 'التربية العلمية (س5)', d: '45 د (09:45-10:30)', w: 'w-45' },
          { t: 'English (س5)', d: '45 د (10:30-11:15)', w: 'w-45', c: 'bg-lang' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'تربية مدنية (س5)', d: '45 د (08:00-08:45)', w: 'w-45' },
          { t: 'تاريخ (س5)', d: '45 د (08:45-09:30)', w: 'w-45' },
        ],
        m2: [
          { t: 'رياضيات: درس وتطبيقات (س5)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: 'رياضيات: معالجة ودعم (س5)', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-math' },
        ],
        a1: [
          { t: 'Français (س5)', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'الإنتاج الكتابي (س5)', d: '60 د (14:00-15:00)', w: 'w-60' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'التربية العلمية (س5)', d: '45 د (08:00-08:45)', w: 'w-45' },
          { t: 'التربية الفنية (س5)', d: '45 د (08:45-09:30)', w: 'w-45' },
        ],
        m2: [
          { t: 'Français (س5)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-lang' },
          { t: 'مطالعة (س5)', d: '30 د (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: 'جغرافيا (س5)', d: '45 د (13:00-13:45)', w: 'w-45' },
          { t: 'English (س5)', d: '45 د (13:45-14:30)', w: 'w-45', c: 'bg-lang' },
          { t: 'نشاطات ثقافية', d: '30 د (14:30-15:00)', w: 'w-30', c: 'bg-off' },
        ],
      },
    ],
  },
  fr: {
    lang: 'fr',
    spec: 'french',
    levelTitle: 'Français (3AP / 4AP / 5AP)',
    systemTitle: 'EMPLOI DU TEMPS HEBDOMADAIRE - LANGUE FRANÇAISE',
    arabicActualHours: 14,
    workloadLabel: 'Classes assignées : 3AP (G1/G2) | 4AP (G1/G2) | 5AP (G1/G2)',
    summaryHeaders: [
      'Classes Assignées',
      '3AP - Gr 01',
      '3AP - Gr 02',
      '4AP - Gr 01',
      '4AP - Gr 02',
      '5AP - Gr 01',
      '5AP - Gr 02',
      'Remédiation Pédag.',
      'Total Hebdomadaire',
    ],
    summaryCounts: ['Séances / Semaine', '02 Séances', '02 Séances', '03 Séances', '03 Séances', '03 Séances', '03 Séances', '03 Séances', '19 Séances'],
    summaryDurs: [
      'Volume Horaire',
      '01h30 (45m×2)',
      '01h30 (45m×2)',
      '02h00 (45m×2+30m)',
      '02h00 (45m×2+30m)',
      '03h00 (60m×3)',
      '03h00 (60m×3)',
      '01h30 (30m×3)',
      '14h30 / Semaine',
    ],
    days: [
      {
        day: 'Dimanche',
        m1: [
          { t: '5AP (G2) : Compréhension de l’oral & Production', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G1) : Compréhension de l’oral', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-math' },
        ],
        m2: [
          { t: '4AP (G2) : Compréhension de l’oral', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '3AP (G1) : Oral / Compréhension & Phonétique', d: '45 min (10:30-11:15)', w: 'w-45' },
        ],
        a1: [
          { t: '5AP (G1) : Compréhension de l’oral & Lecture', d: '60 min (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: '3AP (G2) : Oral / Compréhension & Phonétique', d: '45 min (14:00-14:45)', w: 'w-45' },
          { t: '3AP : Remédiation', d: '15 min', w: 'w-30', c: 'bg-pe' },
        ],
      },
      {
        day: 'Lundi',
        m1: [
          { t: '5AP (G2) : Compréhension de l’écrit & Vocabulaire', d: '60 min (08:00-09:00)', w: 'w-60', c: 'bg-lang' },
          { t: '5AP (G2) : Remédiation', d: '30 min (09:00-09:30)', w: 'w-30', c: 'bg-pe' },
        ],
        m2: [
          { t: '3AP (G1) : Lecture / Phonétique & Écriture', d: '45 min (09:45-10:30)', w: 'w-45' },
          { t: '3AP (G2) : Lecture / Phonétique & Écriture', d: '45 min (10:30-11:15)', w: 'w-45' },
        ],
        a1: [
          { t: '4AP (G2) : Compréhension de l’écrit & Grammaire', d: '60 min (13:00-14:00)', w: 'w-60', c: 'bg-math' },
          { t: '4AP (G1) : Compréhension de l’écrit & Grammaire', d: '60 min (14:00-15:00)', w: 'w-60', c: 'bg-math' },
        ],
      },
      {
        day: 'Mardi',
        m1: [
          { t: '5AP (G1) : Grammaire & Conjugaison', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '5AP (G2) : Grammaire & Conjugaison', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-lang' },
        ],
        m2: [
          { t: '4AP (G1) : Lecture & Dictée', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '4AP (G2) : Lecture & Dictée', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-math' },
        ],
        a1: 'off',
      },
      {
        day: 'Mercredi',
        m1: [
          { t: '4AP (G1) : Production écrite', d: '30 min (08:00-08:30)', w: 'w-30', c: 'bg-math' },
          { t: '4AP (G2) : Production écrite', d: '30 min (08:30-09:00)', w: 'w-30', c: 'bg-math' },
          { t: '4AP : Remédiation', d: '30 min (09:00-09:30)', w: 'w-30', c: 'bg-pe' },
        ],
        m2: [
          { t: '5AP (G2) : Orthographe & Production écrite', d: '60 min (09:45-10:45)', w: 'w-60', c: 'bg-lang' },
          { t: '5AP (G1) : Remédiation', d: '30 min (10:45-11:15)', w: 'w-30', c: 'bg-pe' },
        ],
        a1: [
          { t: '5AP (G1) : Orthographe & Production écrite', d: '60 min (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'Coordination Pédagogique', d: '60 min (14:00-15:00)', w: 'w-60', c: 'bg-off' },
        ],
      },
      {
        day: 'Jeudi',
        m1: [
          { t: '4AP (G2) : Comptine & Projet', d: '30 min (08:00-08:30)', w: 'w-30', c: 'bg-math' },
          { t: '4AP (G1) : Entrainement à l’écrit & Projet', d: '60 min (08:30-09:30)', w: 'w-60', c: 'bg-math' },
        ],
        m2: [
          { t: '5AP (G1) : Compte-rendu & Projet', d: '60 min (09:45-10:45)', w: 'w-60', c: 'bg-lang' },
          { t: '5AP (G2) : Projet', d: '30 min (10:45-11:15)', w: 'w-30', c: 'bg-lang' },
        ],
        a1: 'off',
      },
    ],
  },
  en: {
    lang: 'en',
    spec: 'english',
    levelTitle: 'English (3PS / 4PS / 5PS)',
    systemTitle: 'WEEKLY TIMETABLE - ENGLISH LANGUAGE',
    arabicActualHours: 11,
    workloadLabel: 'Assigned Classes: 3PS (G1/G2) | 4PS (G1/G2) | 5PS (G1/G2)',
    summaryHeaders: ['Assigned Classes', '3PS - Gr 01', '3PS - Gr 02', '4PS - Gr 01', '4PS - Gr 02', '5PS - Gr 01', '5PS - Gr 02', 'Remedial Work', 'Total Weekly Load'],
    summaryCounts: ['Sessions / Week', '02 Sessions', '02 Sessions', '02 Sessions', '02 Sessions', '02 Sessions', '02 Sessions', '03 Sessions', '15 Sessions'],
    summaryDurs: [
      'Weekly Duration',
      '01h30 (45m×2)',
      '01h30 (45m×2)',
      '02h00 (60m×2)',
      '02h00 (60m×2)',
      '01h30 (45m×2)',
      '01h30 (45m×2)',
      '01h30 (30m×3)',
      '11h30 / Week',
    ],
    days: [
      {
        day: 'Sunday',
        m1: [
          { t: '3PS (G2): I Listen & Repeat (Listening/Speaking)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '5PS (G2): I Listen & Interact', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-pe' },
        ],
        m2: [
          { t: '4PS (G2): I Listen & Discover (Phonics)', d: '60 min (09:45-10:45)', w: 'w-60', c: 'bg-math' },
          { t: '3PS: Remedial Work', d: '30 min (10:45-11:15)', w: 'w-30' },
        ],
        a1: [
          { t: '3PS (G1): I Listen & Repeat (Listening/Speaking)', d: '60 min (13:00-14:00)', w: 'w-60', c: 'bg-lang' },
          { t: '4PS (G1): I Listen & Discover (Phonics)', d: '60 min (14:00-15:00)', w: 'w-60', c: 'bg-math' },
        ],
      },
      {
        day: 'Monday',
        m1: [
          { t: '3PS (G2): I Read & Write (Handwriting)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4PS (G2): I Read & Enjoy', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-math' },
        ],
        m2: [
          { t: '5PS (G2): I Read & Discover (Grammar/Reading)', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-pe' },
          { t: '4PS: Remedial Work', d: '45 min (10:30-11:15)', w: 'w-45' },
        ],
        a1: 'off',
      },
      {
        day: 'Tuesday',
        m1: [
          { t: '4PS (G2): I Read & Write (Dictation)', d: '60 min (08:00-09:00)', w: 'w-60', c: 'bg-math' },
          { t: '5PS: Remedial Work', d: '30 min (09:00-09:30)', w: 'w-30' },
        ],
        m2: [
          { t: '3PS (G2): Phonics & Songs', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-lang' },
          { t: '5PS (G1): I Listen & Interact', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-pe' },
        ],
        a1: 'off',
      },
      {
        day: 'Wednesday',
        m1: [
          { t: '5PS (G2): I Learn to Write (Project)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-pe' },
          { t: '3PS (G1): Phonics & Songs', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-lang' },
        ],
        m2: [
          { t: '5PS (G1): I Read & Discover', d: '30 min (09:45-10:15)', w: 'w-30', c: 'bg-pe' },
          { t: '4PS (G1): I Read & Write (Language Games)', d: '60 min (10:15-11:15)', w: 'w-60', c: 'bg-math' },
        ],
        a1: 'off',
      },
      {
        day: 'Thursday',
        m1: [
          { t: '3PS (G1): I Read & Write (Handwriting)', d: '60 min (08:00-09:00)', w: 'w-60', c: 'bg-lang' },
          { t: '4PS (G2): Games & Songs', d: '30 min (09:00-09:30)', w: 'w-30', c: 'bg-math' },
        ],
        m2: [
          { t: '4PS (G1): I Play Roles & Songs', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '5PS (G2): Assessment', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-pe' },
        ],
        a1: [
          { t: '3PS (G2): Language Games', d: '45 min (13:00-13:45)', w: 'w-45', c: 'bg-lang' },
          { t: '5PS (G1): I Learn to Write & Project', d: '45 min (13:45-14:30)', w: 'w-45', c: 'bg-pe' },
          { t: 'Coordination', d: '30 min (14:30-15:00)', w: 'w-30', c: 'bg-off' },
        ],
      },
    ],
  },
  tz: {
    lang: 'tz',
    spec: 'amazigh',
    levelTitle: 'Tamaziɣt - الأمازيغية (4AP / 5AP)',
    systemTitle: 'AHIL N WAKUD IMALAS - TUTLAYT TAMAZIƔT',
    arabicActualHours: 12,
    workloadLabel: 'Ismilen (الأقسام المسندة) : 4AP (G1/G2) | 5AP (G1/G2)',
    summaryHeaders: ['Ismilen (الأقسام)', '4AP - Asmil 01', '4AP - Asmil 02', '5AP - Asmil 01', '5AP - Asmil 02', 'aseɣti (معالجة)', 'Assemday (المجموع)'],
    summaryCounts: ['Tiɣimit (الحصص)', '04 Tiɣimit', '04 Tiɣimit', '04 Tiɣimit', '04 Tiɣimit', '02 Tiɣimit', '18 Tiɣimit'],
    summaryDurs: ['Akud (المدة)', '03h00', '03h00', '03h00', '03h00', '01h00', '13h00 / Imalas'],
    days: [
      {
        day: 'Acer (الأحد)',
        m1: [
          { t: '4AP (G1) : Tigzi n tmesliwt (فهم المنطوق)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G2) : Tigzi n tmesliwt (فهم المنطوق)', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-lang' },
        ],
        m2: [
          { t: '5AP (G1) : Tigzi n tmesliwt & Asenfali s wawal', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '5AP (G2) : Tigzi n tmesliwt & Asenfali s wawal', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-math' },
        ],
        a1: [
          { t: '4AP (G1) : Taɣuri & Tifinaɣ (قراءة وتيفيناغ)', d: '45 min (13:00-13:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G2) : Taɣuri & Tifinaɣ (قراءة وتيفيناغ)', d: '45 min (13:45-14:30)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP : Aseɣti (معالجة)', d: '30 min (14:30-15:00)', w: 'w-30', c: 'bg-pe' },
        ],
      },
      {
        day: 'Arim (الاثنين)',
        m1: [
          { t: '5AP (G1) : Taɣuri & Tigzi n tira (فهم المكتوب)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-math' },
          { t: '5AP (G2) : Taɣuri & Tigzi n tira (فهم المكتوب)', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-math' },
        ],
        m2: [
          { t: '4AP (G1) : Tajerrumt (الظواهر النحوية)', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G2) : Tajerrumt (الظواهر النحوية)', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-lang' },
        ],
        a1: [
          { t: '5AP (G1) : Tajerrumt & Asegzi n tira (نحو وإملاء)', d: '45 min (13:00-13:45)', w: 'w-45', c: 'bg-math' },
          { t: '5AP (G2) : Tajerrumt & Asegzi n tira (نحو وإملاء)', d: '45 min (13:45-14:30)', w: 'w-45', c: 'bg-math' },
          { t: '5AP : Aseɣti (معالجة)', d: '30 min (14:30-15:00)', w: 'w-30', c: 'bg-pe' },
        ],
      },
      {
        day: 'Aram (الثلاثاء)',
        m1: [
          { t: '4AP (G1) : Asegzi n tira & Asfaru (إملاء وإنتاج)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G2) : Asegzi n tira & Asfaru (إملاء وإنتاج)', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-lang' },
        ],
        m2: [
          { t: '5AP (G1) : Asfaru s tira (الإنتاج الكتابي)', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '5AP (G2) : Asfaru s tira (الإنتاج الكتابي)', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-math' },
        ],
        a1: 'off',
      },
      {
        day: 'Ahad (الأربعاء)',
        m1: [
          { t: '4AP (G1) : Isfruyen & Asenfar (محفوظات ومشروع)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-lang' },
          { t: '4AP (G2) : Isfruyen & Asenfar (محفوظات ومشروع)', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-lang' },
        ],
        m2: [
          { t: '5AP (G1) : Asenfar & Aktazal (مشروع وتقويم)', d: '45 min (09:45-10:30)', w: 'w-45', c: 'bg-math' },
          { t: '5AP (G2) : Asenfar & Aktazal (مشروع وتقويم)', d: '45 min (10:30-11:15)', w: 'w-45', c: 'bg-math' },
        ],
        a1: 'off',
      },
      {
        day: 'Amhad (الخميس)',
        m1: [
          { t: '5AP (G1+G2) : Taɣuri & Idles (مطالعة وتراث)', d: '45 min (08:00-08:45)', w: 'w-45', c: 'bg-pe' },
          { t: '4AP (G1+G2) : Urar n tutlayt (ألعاب قرائية)', d: '45 min (08:45-09:30)', w: 'w-45', c: 'bg-pe' },
        ],
        m2: [{ t: 'Aheggi Asensegman (تنسيق وتحضير بيداغوجي)', d: '90 min (09:45-11:15)', w: 'w-90', c: 'bg-off' }],
        a1: 'off',
      },
    ],
  },
  pe: {
    lang: 'ar',
    spec: 'pe',
    levelTitle: 'التربية البدنية (س1 إلى س5)',
    systemTitle: 'التوقيت الأسبوعي - أستاذ التربية البدنية والرياضية',
    arabicActualHours: 16,
    workloadLabel: 'الأقسام المسندة: س1 + س2 + س3 + س4 + س5 ابتدائي',
    summaryHeaders: [
      'الأقسام المسندة',
      'السنة الأولى (ف1+ف2)',
      'السنة الثانية (ف1+ف2)',
      'السنة الثالثة (ف1+ف2)',
      'السنة الرابعة (ف1+ف2)',
      'السنة الخامسة (ف1+ف2)',
      'الرياضة المدرسية',
      'المجموع',
    ],
    summaryCounts: ['عدد الحصص', '04 حصص', '04 حصص', '02 حصتان', '02 حصتان', '02 حصتان', '02 حصتان', '16 حصة'],
    summaryDurs: ['المدة الأسبوعية', '04:00 سا', '04:00 سا', '02:00 سا', '02:00 سا', '02:00 سا', '02:00 سا', '16:00 سا'],
    days: [
      {
        day: 'الأحد',
        m1: [
          { t: 'س5 (فوج 2): تربية بدنية ورياضية', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-pe' },
          { t: 'تحضير الورشات', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-off' },
        ],
        m2: [
          { t: 'س3 (فوج 2): تربية بدنية ورياضية', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-pe' },
          { t: 'مرافقة وتنظيم', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-off' },
        ],
        a1: [
          { t: 'س4 (فوج 2): تربية بدنية ورياضية', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-math' },
          { t: 'س5 (فوج 1): تربية بدنية ورياضية', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-pe' },
        ],
      },
      {
        day: 'الاثنين',
        m1: [
          { t: 'س1 (فوج 2): ألعاب حركية وتوازن', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'تحضير العتاد', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-off' },
        ],
        m2: [
          { t: 'س2 (فوج 2): ألعاب حركية وتوازن', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-lang' },
          { t: 'مرافقة وتنظيم', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-off' },
        ],
        a1: [
          { t: 'س3 (فوج 1): تربية بدنية ورياضية', d: '60 د (13:00-14:00)', w: 'w-60', c: 'bg-pe' },
          { t: 'س1 (فوج 1) + س2 (فوج 1): تربية بدنية', d: '60 د (14:00-15:00)', w: 'w-60', c: 'bg-lang' },
        ],
      },
      {
        day: 'الثلاثاء',
        m1: [
          { t: 'س1 (فوج 2): تربية بدنية (جري ورمي)', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-lang' },
          { t: 'تحضير الميدان', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-off' },
        ],
        m2: [
          { t: 'س2 (فوج 2): تربية بدنية (جري ورمي)', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-lang' },
          { t: 'صيانة العتاد', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-off' },
        ],
        a1: 'off',
      },
      {
        day: 'الأربعاء',
        m1: [
          { t: 'س4 (فوج 2): ألعاب جماعية وجمباز', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-math' },
          { t: 'تحضير الورشات', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-off' },
        ],
        m2: [
          { t: 'تدريب الفرق المدرسية', d: '60 د (09:45-10:45)', w: 'w-60', c: 'bg-pe' },
          { t: 'تنظيم الأفواج', d: '30 د (10:45-11:15)', w: 'w-30', c: 'bg-off' },
        ],
        a1: [
          { t: 'س4 (فوج 1): تربية بدنية ورياضية', d: '90 د (13:00-14:30)', w: 'w-90', c: 'bg-math' },
          { t: 'س2 (فوج 1): تربية بدنية', d: '30 د (14:30-15:00)', w: 'w-30', c: 'bg-lang' },
        ],
      },
      {
        day: 'الخميس',
        m1: [
          { t: 'تنشيط ومنافسات الرياضة المدرسية', d: '60 د (08:00-09:00)', w: 'w-60', c: 'bg-pe' },
          { t: 'تحضير الميدان', d: '30 د (09:00-09:30)', w: 'w-30', c: 'bg-off' },
        ],
        m2: [
          { t: 'جرد الوسائل', d: '30 د (09:45-10:15)', w: 'w-30', c: 'bg-off' },
          { t: 'س1 (فوج 1) + س3 (فوج 1): تربية بدنية', d: '60 د (10:15-11:15)', w: 'w-60', c: 'bg-pe' },
        ],
        a1: 'off',
      },
    ],
  },
};
