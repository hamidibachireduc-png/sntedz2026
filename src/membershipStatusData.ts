import { MemberData } from './DigitalMembershipCardModal';

// Initial sample members to demonstrate all 3 states (pending, accepted, rejected)
export const INITIAL_SEED_MEMBERS: MemberData[] = [
  {
    id: 'mem-seed-001',
    nationalId: '198717010045230012',
    socialSecurityNo: '178709123456',
    membershipCardNo: 'SNTE-2026-0014',
    fullName: 'أحمد بن عيسى الهواري',
    birthDate: '1987-03-12',
    wilayaCode: '17',
    wilayaName: 'الجلفة',
    municipalName: 'عين الإبل',
    institutionName: 'ثانوية عبد الحميد بن باديس',
    rank: 'أستاذ التعليم الثانوي',
    workplace: 'المقر الرئيسي للمؤسسة',
    phone: '0661 23 45 67',
    email: 'ahmed.houari@snte-dz.org',
    status: 'مؤقت (أسبوع تجريبي)',
    membershipStatus: 'temporary_pending',
    registrationTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    temporaryExpiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days remaining
    duesPaid: false,
    joinDate: '2026-10-21',
  },
  {
    id: 'mem-seed-002',
    nationalId: '199219010098760034',
    socialSecurityNo: '199208765432',
    membershipCardNo: 'SNTE-2026-0028',
    fullName: 'فاطمة الزهراء قاسيمي',
    birthDate: '1992-07-25',
    wilayaCode: '19',
    wilayaName: 'سطيف',
    municipalName: 'العلمة',
    institutionName: 'متوسطة الشهيد زبانة',
    rank: 'أستاذة التعليم المتوسط',
    workplace: 'قسم اللغات',
    phone: '0550 88 12 34',
    email: 'f.kassimi@snte-dz.org',
    status: 'مؤقت (أسبوع تجريبي)',
    membershipStatus: 'temporary_pending',
    registrationTimestamp: Date.now() - 5.8 * 24 * 60 * 60 * 1000, // almost 6 days ago
    temporaryExpiresAt: Date.now() + 28 * 60 * 60 * 1000, // 28 hours remaining (urgent alert)
    duesPaid: false,
    joinDate: '2026-10-18',
  },
  {
    id: 'mem-seed-003',
    nationalId: '198416010012340055',
    socialSecurityNo: '168401234567',
    membershipCardNo: 'SNTE-2026-0005',
    fullName: 'عمر فاروق بوجمعة',
    birthDate: '1984-11-04',
    wilayaCode: '16',
    wilayaName: 'الجزائر',
    municipalName: 'الوسط',
    institutionName: 'ثانوية عقبة بن نافع',
    rank: 'ناظر ثانوية',
    workplace: 'إدارة الثانوية',
    phone: '0770 12 34 56',
    email: 'o.boudjemaa@snte-dz.org',
    status: 'نشط (عضوية دائمة معتمدة)',
    membershipStatus: 'active',
    registrationTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 350 * 24 * 60 * 60 * 1000,
    duesPaid: true,
    activatedBy: 'الأمانة العامة الوطنية (الأستاذ قويدر يحياوي)',
    activatedAt: '2026-10-10',
    joinDate: '2026-10-08',
  },
  {
    id: 'mem-seed-004',
    nationalId: '198925010065430078',
    socialSecurityNo: '258909876543',
    membershipCardNo: 'SNTE-2026-0042',
    fullName: 'سليم مصطفى دراجي',
    birthDate: '1989-02-18',
    wilayaCode: '25',
    wilayaName: 'قسنطينة',
    municipalName: 'الخروب',
    institutionName: 'ابتدائية الأمير عبد القادر',
    rank: 'أستاذ المدرسة الابتدائية',
    workplace: 'الفريق التربوي',
    phone: '0662 99 88 77',
    email: 'salim.deradji@snte-dz.org',
    status: 'مرفوض (انقضاء المهلة)',
    membershipStatus: 'rejected',
    registrationTimestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // expired 5 days ago
    duesPaid: false,
    rejectionReason: 'انقضاء مهلة الأسبوع التجريبي دون تسديد مبلغ الاشتراك (100 دج) ولم يتم اقتناء بطاقة الانخراط الورقية من الأمانة الولائية بقسنطينة.',
    joinDate: '2026-10-11',
  },
];

// Helper to get all members ensuring default seeds are present if localStorage is empty
export const getAllMembersWithSeed = (): MemberData[] => {
  try {
    const raw = localStorage.getItem('snte_members_v3');
    if (!raw) {
      localStorage.setItem('snte_members_v3', JSON.stringify(INITIAL_SEED_MEMBERS));
      return INITIAL_SEED_MEMBERS;
    }
    const parsed: MemberData[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('snte_members_v3', JSON.stringify(INITIAL_SEED_MEMBERS));
      return INITIAL_SEED_MEMBERS;
    }
    return parsed;
  } catch {
    return INITIAL_SEED_MEMBERS;
  }
};
