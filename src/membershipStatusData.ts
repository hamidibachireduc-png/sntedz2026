import { MemberData } from './DigitalMembershipCardModal';

// Initial pre-registered members from structural sheets (all pre-approved and active by default per official records)
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
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-17-A4F109',
    status: 'نشط (معتمد رسمياً - مسجل من شيت الهياكل)',
    membershipStatus: 'active' as const,
    registrationTimestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 350 * 24 * 60 * 60 * 1000,
    duesPaid: true,
    activatedBy: 'الأمانة العامة الوطنية (شيت الهياكل الرسمية)',
    activatedAt: '2026-10-21',
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
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-19-E8C2B1',
    status: 'نشط (معتمد رسمياً - مسجل من شيت الهياكل)',
    membershipStatus: 'active' as const,
    registrationTimestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 350 * 24 * 60 * 60 * 1000,
    duesPaid: true,
    activatedBy: 'الأمانة العامة الوطنية (شيت الهياكل الرسمية)',
    activatedAt: '2026-10-18',
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
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-16-F190D4',
    status: 'نشط (عضوية دائمة معتمدة)',
    membershipStatus: 'active' as const,
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
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-25-C77A32',
    status: 'نشط (معتمد رسمياً - مسجل من شيت الهياكل)',
    membershipStatus: 'active' as const,
    registrationTimestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 350 * 24 * 60 * 60 * 1000,
    duesPaid: true,
    activatedBy: 'الأمانة العامة الوطنية (شيت الهياكل الرسمية)',
    activatedAt: '2026-10-11',
    joinDate: '2026-10-11',
  },
  {
    id: 'mem-seed-pending-001',
    nationalId: '199517010077880099',
    socialSecurityNo: '179509876543',
    membershipCardNo: 'SNTE-2026-0089',
    fullName: 'بلقاسم نور الدين زعرور',
    birthDate: '1995-09-14',
    wilayaCode: '17',
    wilayaName: 'الجلفة',
    municipalName: 'حاسي بحبح',
    institutionName: 'متوسطة بن باديس',
    rank: 'أستاذ التعليم المتوسط',
    workplace: 'مقر المؤسسة التربوية',
    phone: '0663 11 22 33',
    email: 'b.zaarour@snte-dz.org',
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-17-D3E901',
    status: 'مؤقت (أسبوع تجريبي - بانتظار سداد 100 دج والبطاقة الورقية)',
    membershipStatus: 'temporary_pending' as const,
    registrationTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days remaining
    duesPaid: false,
    joinDate: '2026-10-25',
  },
  {
    id: 'mem-seed-renewal-001',
    nationalId: '198116010044550066',
    socialSecurityNo: '168102345678',
    membershipCardNo: 'SNTE-2026-0009',
    fullName: 'سمير بلقاسم بوقرة',
    birthDate: '1981-06-20',
    wilayaCode: '16',
    wilayaName: 'الجزائر',
    municipalName: 'الرويبة',
    institutionName: 'ثانوية أحمد توفيق المدني',
    rank: 'ناظر ثانوية',
    workplace: 'الإدارة المدرسية',
    phone: '0772 44 55 66',
    email: 's.bouguerra@snte-dz.org',
    avatarUrl: '',
    biometricFingerprintCode: 'BIO-16-B54C21',
    status: 'نشط (يقترب موعد تجديد الاشتراك السنوي)',
    membershipStatus: 'active' as const,
    registrationTimestamp: Date.now() - 353 * 24 * 60 * 60 * 1000,
    temporaryExpiresAt: Date.now() + 12 * 24 * 60 * 60 * 1000, // 12 days remaining until renewal
    duesPaid: true,
    annualRenewalDate: '2026-11-10',
    joinDate: '2025-11-10',
    activatedBy: 'الأمانة العامة الوطنية (الأستاذ قويدر يحياوي)',
    activatedAt: '2025-11-10',
  },
];

// Helper to get all members ensuring default seeds are present
export const getAllMembersWithSeed = (): MemberData[] => {
  try {
    const raw = localStorage.getItem('snte_members_v3');
    let members: MemberData[] = [];
    if (!raw) {
      members = INITIAL_SEED_MEMBERS;
      localStorage.setItem('snte_members_v3', JSON.stringify(members));
    } else {
      const parsed: MemberData[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default seed members exist if missing
        const existingIds = new Set(parsed.map((m: any) => m.id || m.membershipCardNo));
        const missingSeeds = INITIAL_SEED_MEMBERS.filter((s) => !existingIds.has(s.id) && !existingIds.has(s.membershipCardNo));
        members = missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
        if (missingSeeds.length > 0) {
          localStorage.setItem('snte_members_v3', JSON.stringify(members));
        }
      } else {
        members = INITIAL_SEED_MEMBERS;
        localStorage.setItem('snte_members_v3', JSON.stringify(members));
      }
    }

    return members;
  } catch {
    return INITIAL_SEED_MEMBERS;
  }
};
