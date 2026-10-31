export type RegionName = 'الوسط' | 'الشرق' | 'الغرب' | 'الجنوب الشرقي' | 'الجنوب الغربي';

export interface BureauMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  wilaya?: string;
  institution?: string;
  grade?: string;
  avatar?: string;
  bio?: string;
}

export interface WilayaData {
  id: number; // 1 to 69
  code: string; // e.g. "17"
  nameAr: string; // "الجلفة"
  nameFr: string; // "Djelfa"
  region: RegionName;
  sgName: string; // الأمين الولائي
  phone: string;
  email: string;
  address: string;
  membersCount: number;
  branchesCount: number; // عدد الفروع النقابية
  coverageRate: number; // نسبة التغطية
  status: 'نشط جداً' | 'نشط' | 'في طور التجديد';
  executiveMembers: BureauMember[];
  assemblyCount: number;
  lastAssemblyDate: string;
}

export interface Member {
  id: string;
  membershipNumber: string; // SNTE-17-2024-001
  fullName: string;
  nationalId: string;
  wilayaId: number;
  wilayaName: string;
  establishment: string; // e.g. ثانوية النعيم النعيمي - الجلفة
  educationPhase: 'ابتدائي' | 'متوسط' | 'ثانوي' | 'إدارة ومصالح اقتصادية' | 'عمال مهنيين وأسلاك مشتركة';
  jobTitle: string; // أستاذ التعليم الثانوي، مقتصد، ناظر...
  phone: string;
  email: string;
  joinDate: string;
  expirationDate: string;
  status: 'نشط' | 'منتهي' | 'قيد التجديد';
  photoUrl?: string;
}

export interface AssemblyPV {
  id: string;
  wilayaId: number;
  wilayaName: string;
  type: 'جمعية عامة ولائية' | 'فرع نقابي مؤسسة' | 'مجلس ولائي' | 'مؤتمر وطني';
  title: string;
  date: string;
  location: string;
  attendeesCount: number;
  quorumMet: boolean;
  electedSG: string;
  membersElected: string[];
  summary: string;
  documentRef: string;
  fileSize: string;
  status: 'معتمد رسمياً' | 'قيد المصادقة' | 'مؤرشف';
}

export interface PublicationRequest {
  id: string;
  title: string;
  type: 'بيان إعلامي' | 'نداء نقابي' | 'ملصق حائطي' | 'مجلة دورية' | 'تغطية نشاط';
  wilayaName: string;
  submittedBy: string;
  role: string;
  submissionDate: string;
  status: 'مقبول ومعتمد' | 'قيد الدراسة' | 'مرفوض للتعديل';
  contentSummary: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface SyndicateActivity {
  id: string;
  title: string;
  type: 'ندوة تكوينية' | 'وقفة احتجاجية' | 'ملتقى بيداغوجي' | 'يوم دراسي' | 'اجتماع تنسيقي';
  date: string;
  location: string;
  wilayaName: string;
  targetAudience: string;
  participantsCount: number;
  description: string;
  status: 'مكتمل' | 'مبرمج قريباً' | 'جاري حالياً';
}

export interface LegalDocument {
  id: string;
  title: string;
  number: string;
  category: 'قوانين الجمهورية' | 'مراسيم تنفيذية' | 'مناشير وزارية' | 'القانون الأساسي للنقابة';
  date: string;
  summary: string;
  downloadUrl: string;
  importantArticles: string[];
}

export interface UserProfile {
  name: string;
  role: string;
  title: string;
  wilaya: string;
  badgeNumber: string;
  email: string;
  phone: string;
  avatar: string;
}
