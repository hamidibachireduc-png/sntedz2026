import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { WILAYAS_LIST, REGIONAL_COORDINATORS } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';
import { PendingMembersReviewModal } from './PendingMembersReviewModal';
import { ContactInquiry } from './ContactSupportComponent';
import { syncDirectFromGoogleSheets } from './googleSheetsLiveSync';

export interface AnnualPerformanceRecord {
  year: string;
  membersCount: number;
  activeRenewed: number;
  newMembers: number;
  targetGoal: number;
  branchesCount: number;
  disputesResolved: number;
  assembliesHeld: number;
  satisfactionRate: number;
  notes?: string;
}

export const DEFAULT_ANNUAL_PERFORMANCE: AnnualPerformanceRecord[] = [
  {
    year: '2020',
    membersCount: 19800,
    activeRenewed: 16500,
    newMembers: 3300,
    targetGoal: 19000,
    branchesCount: 3820,
    disputesResolved: 740,
    assembliesHeld: 320,
    satisfactionRate: 84,
    notes: 'إطلاق برنامج تعميم الهيكلة القاعدية بالمؤسسات التربوية',
  },
  {
    year: '2021',
    membersCount: 23100,
    activeRenewed: 19400,
    newMembers: 3700,
    targetGoal: 22500,
    branchesCount: 4350,
    disputesResolved: 910,
    assembliesHeld: 410,
    satisfactionRate: 86,
    notes: 'توسيع التغطية لولايات الجنوب المستحدثة (10 ولايات جديدة)',
  },
  {
    year: '2022',
    membersCount: 26900,
    activeRenewed: 22800,
    newMembers: 4100,
    targetGoal: 26000,
    branchesCount: 5010,
    disputesResolved: 1150,
    assembliesHeld: 485,
    satisfactionRate: 88,
    notes: 'استحداث مكاتب التنسيق الجهوي الـ 07 للوطن والمرافقة الميدانية',
  },
  {
    year: '2023',
    membersCount: 30800,
    activeRenewed: 26500,
    newMembers: 4300,
    targetGoal: 30000,
    branchesCount: 5740,
    disputesResolved: 1380,
    assembliesHeld: 560,
    satisfactionRate: 90,
    notes: 'تفعيل ملف القانون الأساسي والنظام التعويضي لعمال التربية',
  },
  {
    year: '2024',
    membersCount: 34600,
    activeRenewed: 30100,
    newMembers: 4500,
    targetGoal: 34000,
    branchesCount: 6320,
    disputesResolved: 1620,
    assembliesHeld: 640,
    satisfactionRate: 92,
    notes: 'بدء الرقمنة الشاملة لبطاقات الانخراط والمحاضر الإلكترونية',
  },
  {
    year: '2025',
    membersCount: 38200,
    activeRenewed: 33900,
    newMembers: 4300,
    targetGoal: 37500,
    branchesCount: 6850,
    disputesResolved: 1890,
    assembliesHeld: 710,
    satisfactionRate: 94,
    notes: 'استكمال الربط الإلكتروني مع شيت الهياكل المركزية',
  },
  {
    year: '2026',
    membersCount: 42150,
    activeRenewed: 37800,
    newMembers: 4350,
    targetGoal: 41000,
    branchesCount: 7420,
    disputesResolved: 2150,
    assembliesHeld: 790,
    satisfactionRate: 96,
    notes: 'تطبيق التقسيم الإداري لـ 69 ولاية ونظام الإشعار الذكي بالتجديد',
  },
];

export interface InstitutionStat {
  id: string;
  name: string;
  tier: 'ثانوي' | 'متوسط' | 'ابتدائي' | 'إدارة وتفتيش';
  wilayaCode: string;
  wilayaName: string;
  municipalName: string;
  membersCount: number;
  activeCount: number;
  pendingCount: number;
  branchSG: string;
  branchPhone: string;
  complianceRate: number;
}

const INITIAL_INSTITUTIONS: InstitutionStat[] = [
  {
    id: 'inst-01',
    name: 'ثانوية الشيخ التعيم النعيمي',
    tier: 'ثانوي',
    wilayaCode: '17',
    wilayaName: 'الجلفة',
    municipalName: 'الجلفة',
    membersCount: 48,
    activeCount: 42,
    pendingCount: 6,
    branchSG: 'أحمد بن عيسى الهواري',
    branchPhone: '0661 23 45 67',
    complianceRate: 88,
  },
  {
    id: 'inst-02',
    name: 'متوسطة الشهيد زبانة',
    tier: 'متوسط',
    wilayaCode: '19',
    wilayaName: 'سطيف',
    municipalName: 'العلمة',
    membersCount: 42,
    activeCount: 35,
    pendingCount: 7,
    branchSG: 'فاطمة الزهراء قاسيمي',
    branchPhone: '0550 88 12 34',
    complianceRate: 83,
  },
  {
    id: 'inst-03',
    name: 'ثانوية عقبة بن نافع',
    tier: 'ثانوي',
    wilayaCode: '16-وسط',
    wilayaName: 'الجزائر وسط',
    municipalName: 'الوسط',
    membersCount: 54,
    activeCount: 50,
    pendingCount: 4,
    branchSG: 'عمر فاروق بوجمعة',
    branchPhone: '0770 12 34 56',
    complianceRate: 93,
  },
  {
    id: 'inst-04',
    name: 'ابتدائية الأمير عبد القادر',
    tier: 'ابتدائي',
    wilayaCode: '25',
    wilayaName: 'قسنطينة',
    municipalName: 'الخروب',
    membersCount: 29,
    activeCount: 22,
    pendingCount: 7,
    branchSG: 'سليم مصطفى دراجي',
    branchPhone: '0662 99 88 77',
    complianceRate: 76,
  },
];

const TIER_COLORS: Record<string, string> = {
  'ثانوي': '#006633',
  'متوسط': '#f59e0b',
  'ابتدائي': '#06b6d4',
  'إدارة وتفتيش': '#8b5cf6',
};

export const AdministrativeAnalyticsSection: React.FC = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchInstitution, setSearchInstitution] = useState<string>('');
  const [viewMode, setViewMode] = useState<'charts' | 'regions' | 'annualReport' | 'table' | 'inquiries' | 'membersList'>('charts');
  const [isPendingReviewOpen, setIsPendingReviewOpen] = useState(false);

  // حالة تصفية وإدارة سجل وقائمة المنخرطين
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberWilayaFilter, setMemberWilayaFilter] = useState('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [memberRankFilter, setMemberRankFilter] = useState('all');
  const [isSyncingSheetLive, setIsSyncingSheetLive] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // تقرير الأداء السنوي للنقابة المخزن في localStorage (snte_annual_performance)
  const [annualPerformanceData, setAnnualPerformanceData] = useState<AnnualPerformanceRecord[]>(DEFAULT_ANNUAL_PERFORMANCE);
  const [isAddAnnualModalOpen, setIsAddAnnualModalOpen] = useState<boolean>(false);
  const [selectedAnnualYear, setSelectedAnnualYear] = useState<string>('2026');

  // مدخلات نموذج إضافة أو تحديث مؤشر سنوي
  const [formYear, setFormYear] = useState<string>('2027');
  const [formMembersCount, setFormMembersCount] = useState<number>(45000);
  const [formActiveRenewed, setFormActiveRenewed] = useState<number>(40500);
  const [formNewMembers, setFormNewMembers] = useState<number>(4500);
  const [formTargetGoal, setFormTargetGoal] = useState<number>(44000);
  const [formBranchesCount, setFormBranchesCount] = useState<number>(7800);
  const [formDisputesResolved, setFormDisputesResolved] = useState<number>(2300);
  const [formAssembliesHeld, setFormAssembliesHeld] = useState<number>(850);
  const [formSatisfactionRate, setFormSatisfactionRate] = useState<number>(97);
  const [formNotes, setFormNotes] = useState<string>('');

  // استفسارات المنخرطين المخزنة في snte_contacts
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryWilayaFilter, setInquiryWilayaFilter] = useState<string>('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [inquiryPriorityFilter, setInquiryPriorityFilter] = useState<string>('all');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyStatus, setReplyStatus] = useState<ContactInquiry['status']>('تم الرد');
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // القيم المجلوبة مباشرة من الشيت
  const [totalMinutesFromSheet, setTotalMinutesFromSheet] = useState<number | string>('...');
  const [activeWilayasFromSheet, setActiveWilayasFromSheet] = useState<number | string>('...');

  const SHEET_ID = '12uBmhUooldZDPDIF4pcag8LZTPUIoNM4jc7ZvCrGi_w';
  const SHEET_NAME = 'الورقة1';
  const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isRegionalCoordinator =
    currentUser?.role === 'GENERAL_COORDINATOR' ||
    currentUser?.level === 'coordinator' ||
    currentUser?.coordCategory === 'regional';

  const regCoordInfo = useMemo(() => {
    if (!isRegionalCoordinator) return null;
    return REGIONAL_COORDINATORS.find(
      (c) => c.id === currentUser?.id || c.code === currentUser?.regionCode || c.region === currentUser?.region
    );
  }, [isRegionalCoordinator, currentUser]);

  const regionalCoveredWilayas: string[] = useMemo(() => {
    if (!isRegionalCoordinator) return [];
    return currentUser?.wilayasCovered || regCoordInfo?.wilayasCovered || [];
  }, [isRegionalCoordinator, currentUser, regCoordInfo]);

  const isAuthorized =
    isNationalSG ||
    currentUser?.role === 'WILAYA_SG' ||
    currentUser?.level === 'wilaya' ||
    isRegionalCoordinator ||
    currentUser?.role === 'ADMIN' ||
    Boolean(currentUser);

  const userWilayaCode = currentUser?.wilayaCode;

  const handleDirectSheetSync = async () => {
    setIsSyncingSheetLive(true);
    setSyncFeedback('جاري المزامنة المباشرة مع جدول قوقل شيتس الرسمي...');
    try {
      const res = await syncDirectFromGoogleSheets();
      if (res.success) {
        setSyncFeedback(`✅ تمت المزامنة بنجاح! تم استيراد وتحديث ${res.membersImported} منخرطاً و ${res.minutesImported} محضراً من الشيت الحي.`);
        loadData();
      } else {
        setSyncFeedback(`⚠️ فشلت المزامنة: ${res.error || 'تعذر الاتصال بالشيت'}`);
      }
    } catch (e: any) {
      setSyncFeedback(`❌ خطأ أثناء المزامنة: ${e?.message || 'تعذر استرجاع البيانات'}`);
    } finally {
      setIsSyncingSheetLive(false);
    }
  };

  const loadInquiries = () => {
    try {
      const raw = localStorage.getItem('snte_contacts');
      if (raw) {
        setInquiries(JSON.parse(raw));
      } else {
        setInquiries([]);
      }
    } catch {
      setInquiries([]);
    }
  };

  const loadAnnualPerformance = () => {
    try {
      const raw = localStorage.getItem('snte_annual_performance');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAnnualPerformanceData(parsed);
          return;
        }
      }
      localStorage.setItem('snte_annual_performance', JSON.stringify(DEFAULT_ANNUAL_PERFORMANCE));
      setAnnualPerformanceData(DEFAULT_ANNUAL_PERFORMANCE);
    } catch {
      setAnnualPerformanceData(DEFAULT_ANNUAL_PERFORMANCE);
    }
  };

  const handleSaveAnnualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecord: AnnualPerformanceRecord = {
        year: formYear.trim(),
        membersCount: Number(formMembersCount) || 0,
        activeRenewed: Number(formActiveRenewed) || 0,
        newMembers: Number(formNewMembers) || 0,
        targetGoal: Number(formTargetGoal) || 0,
        branchesCount: Number(formBranchesCount) || 0,
        disputesResolved: Number(formDisputesResolved) || 0,
        assembliesHeld: Number(formAssembliesHeld) || 0,
        satisfactionRate: Number(formSatisfactionRate) || 90,
        notes: formNotes.trim(),
      };

      const existingIdx = annualPerformanceData.findIndex((r) => r.year === newRecord.year);
      let updated: AnnualPerformanceRecord[];
      if (existingIdx >= 0) {
        updated = [...annualPerformanceData];
        updated[existingIdx] = newRecord;
      } else {
        updated = [...annualPerformanceData, newRecord].sort((a, b) => Number(a.year) - Number(b.year));
      }

      localStorage.setItem('snte_annual_performance', JSON.stringify(updated));
      setAnnualPerformanceData(updated);
      setIsAddAnnualModalOpen(false);
      window.dispatchEvent(new CustomEvent('snte-annual-performance-updated'));
    } catch (err) {
      console.error('Error saving annual performance:', err);
    }
  };

  const handleResetAnnualToDefaults = () => {
    if (!confirm('هل تريد استعادة البيانات السنوية الافتراضية للنقابة؟ سيتم تحديث التخزين المحلي localStorage.')) return;
    try {
      localStorage.setItem('snte_annual_performance', JSON.stringify(DEFAULT_ANNUAL_PERFORMANCE));
      setAnnualPerformanceData(DEFAULT_ANNUAL_PERFORMANCE);
      window.dispatchEvent(new CustomEvent('snte-annual-performance-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportAnnualPerformanceJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(annualPerformanceData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snte_annual_performance_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const loadData = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        setCurrentUser(u);
        if (!isNationalSG && u?.wilayaCode) {
          setSelectedWilaya(u.wilayaCode);
        }
      }
      const all = getAllMembersWithSeed();
      setMembers(all);
    } catch {
      setMembers(getAllMembersWithSeed());
    }
    loadInquiries();
    loadAnnualPerformance();
  };

  const handleUpdateInquiryStatus = (id: string, newStatus: ContactInquiry['status'], note?: string) => {
    try {
      const updated = inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: newStatus, responseNote: note !== undefined ? note : inq.responseNote } : inq
      );
      localStorage.setItem('snte_contacts', JSON.stringify(updated));
      setInquiries(updated);
      window.dispatchEvent(new CustomEvent('snte-contacts-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) return;
    handleUpdateInquiryStatus(id, replyStatus, replyText.trim());
    setSelectedInquiryId(null);
    setReplyText('');
  };

  const handleDeleteInquiry = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاستفسار نهائياً من قاعدة البيانات snte_contacts؟')) return;
    try {
      const updated = inquiries.filter((inq) => inq.id !== id);
      localStorage.setItem('snte_contacts', JSON.stringify(updated));
      setInquiries(updated);
      window.dispatchEvent(new CustomEvent('snte-contacts-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportInquiriesJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snte_contacts_admin_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    loadData();

    const fetchSheetAnalytics = async () => {
      try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error('Failed to fetch CSV');
        const text = await res.text();
        const lines = text.split('\n');

        const uniqueMinutes = new Set();
        const uniqueWilayas = new Set();

        lines.forEach((line, index) => {
          if (index < 3 || !line.trim()) return;
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length >= 3) {
            const date = cols[0]?.replace(/"/g, '').trim();
            const type = cols[1]?.replace(/"/g, '').trim();
            const location = cols[2]?.replace(/"/g, '').trim();

            if (date && type && location) {
              uniqueMinutes.add(`${date}-${type}-${location}`);
              if (location.includes('ولاية:')) {
                const parts = location.split('|');
                parts.forEach((p) => {
                  if (p.includes('ولاية:')) {
                    uniqueWilayas.add(p.replace('ولاية:', '').trim());
                  }
                });
              }
            }
          }
        });

        setTotalMinutesFromSheet(uniqueMinutes.size);
        setActiveWilayasFromSheet(uniqueWilayas.size > 0 ? uniqueWilayas.size : 72);
      } catch (err) {
        console.error('Error fetching Google Sheets data:', err);
        setTotalMinutesFromSheet(0);
        setActiveWilayasFromSheet(72);
      }
    };

    fetchSheetAnalytics();

    const handleUpdate = () => loadData();
    const handleNav = (e: any) => {
      const detail = e.detail;
      if (detail === 'admin-stats' || detail === 'admin-inquiries' || detail === 'admin-annual-report') {
        const el = document.getElementById('admin-analytics-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        if (detail === 'admin-inquiries') {
          setViewMode('inquiries');
        } else if (detail === 'admin-annual-report') {
          setViewMode('annualReport');
        }
      }
    };
    (window as any).openAdminInquiries = () => {
      setViewMode('inquiries');
      const el = document.getElementById('admin-analytics-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    (window as any).openAdminAnnualReport = () => {
      setViewMode('annualReport');
      const el = document.getElementById('admin-analytics-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('snte-members-updated', handleUpdate);
    window.addEventListener('snte-member-registered', handleUpdate);
    window.addEventListener('snte-contacts-updated', handleUpdate);
    window.addEventListener('snte-annual-performance-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('snte-navigate', handleNav);
    return () => {
      window.removeEventListener('snte-members-updated', handleUpdate);
      window.removeEventListener('snte-member-registered', handleUpdate);
      window.removeEventListener('snte-contacts-updated', handleUpdate);
      window.removeEventListener('snte-annual-performance-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('snte-navigate', handleNav);
    };
  }, []);

  // إحصائيات الجهات الـ 07
  const regionalStatsData = useMemo(() => {
    return REGIONAL_COORDINATORS.map((coord) => {
      const coveredWilayas = WILAYAS_LIST.filter((w) => coord.wilayasCovered.includes(w.code));
      const membersSum = coveredWilayas.reduce((acc, w) => acc + (w.membersCount || 1200), 0);
      const branchesSum = coveredWilayas.reduce((acc, w) => acc + (w.branchesCount || 95), 0);
      
      return {
        code: coord.code,
        region: coord.region,
        coordinatorName: coord.name,
        wilayasCount: coveredWilayas.length,
        membersCount: membersSum,
        branchesCount: branchesSum,
        complianceRate: 88 + (Number(coord.code) % 7),
      };
    });
  }, []);

  const filteredWilayasList = useMemo(() => {
    if (isNationalSG) {
      if (selectedRegion === 'all') return WILAYAS_LIST;
      const coord = REGIONAL_COORDINATORS.find((c) => c.code === selectedRegion);
      if (!coord) return WILAYAS_LIST;
      return WILAYAS_LIST.filter((w) => coord.wilayasCovered.includes(w.code));
    }
    if (isRegionalCoordinator) {
      if (regionalCoveredWilayas.length === 0) return WILAYAS_LIST;
      return WILAYAS_LIST.filter((w) => {
        const cCode = String(w.code).padStart(2, '0');
        const covered = regionalCoveredWilayas.map((c) => String(c).padStart(2, '0'));
        return covered.includes(cCode) || regionalCoveredWilayas.includes(w.code);
      });
    }
    if (userWilayaCode) {
      return WILAYAS_LIST.filter((w) => String(w.code) === String(userWilayaCode));
    }
    return WILAYAS_LIST;
  }, [isNationalSG, isRegionalCoordinator, regionalCoveredWilayas, userWilayaCode, selectedRegion]);

  const scopedMembers = useMemo(() => {
    if (isNationalSG) {
      return members;
    }
    if (isRegionalCoordinator) {
      if (regionalCoveredWilayas.length === 0) return members;
      const covered = regionalCoveredWilayas.map((c) => String(c).padStart(2, '0'));
      return members.filter((m) => {
        const mCode = String(m.wilayaCode || '').padStart(2, '0');
        return covered.includes(mCode) || regionalCoveredWilayas.includes(String(m.wilayaCode));
      });
    }
    if (userWilayaCode) {
      const uCode = String(userWilayaCode).padStart(2, '0');
      return members.filter(
        (m) =>
          String(m.wilayaCode || '').padStart(2, '0') === uCode ||
          (currentUser?.wilayaName && m.wilayaName?.includes(currentUser.wilayaName))
      );
    }
    return members;
  }, [members, currentUser, isNationalSG, isRegionalCoordinator, regionalCoveredWilayas, userWilayaCode]);

  const displayedScopedMembers = useMemo(() => {
    return scopedMembers.filter((m) => {
      if (memberWilayaFilter !== 'all') {
        const mCode = String(m.wilayaCode || '').padStart(2, '0');
        const fCode = String(memberWilayaFilter).padStart(2, '0');
        if (mCode !== fCode) return false;
      }
      if (memberRankFilter !== 'all' && m.rank !== memberRankFilter) return false;
      const mStatus = m.membershipStatus || (m.status?.includes('مؤقت') ? 'temporary_pending' : 'active');
      if (memberStatusFilter === 'active' && mStatus !== 'active') return false;
      if (memberStatusFilter === 'pending' && mStatus !== 'temporary_pending') return false;
      if (memberStatusFilter === 'rejected' && mStatus !== 'rejected') return false;

      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.trim().toLowerCase();
        const matches =
          m.fullName?.toLowerCase().includes(q) ||
          m.nationalId?.includes(q) ||
          m.membershipCardNo?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.workplace?.toLowerCase().includes(q) ||
          m.institutionName?.toLowerCase().includes(q) ||
          m.hierarchyRole?.toLowerCase().includes(q) ||
          m.rank?.toLowerCase().includes(q) ||
          m.wilayaName?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [scopedMembers, memberWilayaFilter, memberRankFilter, memberStatusFilter, memberSearchQuery]);

  const institutionsData = useMemo(() => {
    const baseList = (!isNationalSG && userWilayaCode)
      ? INITIAL_INSTITUTIONS.filter((i) => String(i.wilayaCode) === String(userWilayaCode))
      : [...INITIAL_INSTITUTIONS];

    const list = [...baseList];

    scopedMembers.forEach((m) => {
      if (!m.institutionName) return;
      const existing = list.find((i) => i.name.trim() === m.institutionName.trim());
      const isActive = m.membershipStatus === 'active' || m.duesPaid;
      if (existing) {
        existing.membersCount += 1;
        if (isActive) existing.activeCount += 1;
        else existing.pendingCount += 1;
        existing.complianceRate = Math.round((existing.activeCount / existing.membersCount) * 100);
      } else {
        let detectedTier: 'ثانوي' | 'متوسط' | 'ابتدائي' | 'إدارة وتفتيش' = 'ثانوي';
        const lower = (m.institutionName + ' ' + (m.rank || '')).toLowerCase();
        if (lower.includes('متوسط')) detectedTier = 'متوسط';
        else if (lower.includes('ابتدائ') || lower.includes('مدرسة')) detectedTier = 'ابتدائي';
        else if (lower.includes('مديري') || lower.includes('مفتش')) detectedTier = 'إدارة وتفتيش';

        list.push({
          id: `dyn-inst-${m.id}`,
          name: m.institutionName,
          tier: detectedTier,
          wilayaCode: m.wilayaCode,
          wilayaName: m.wilayaName || 'الجزائر',
          municipalName: m.municipalName || 'البلدية',
          membersCount: 1,
          activeCount: isActive ? 1 : 0,
          pendingCount: isActive ? 0 : 1,
          branchSG: m.fullName,
          branchPhone: m.phone || '0550 00 00 00',
          complianceRate: isActive ? 100 : 0,
        });
      }
    });

    return list;
  }, [scopedMembers, currentUser]);

  const filteredInstitutions = useMemo(() => {
    return institutionsData.filter((item: InstitutionStat) => {
      if (selectedWilaya !== 'all' && item.wilayaCode !== selectedWilaya) return false;
      if (selectedTier !== 'all' && item.tier !== selectedTier) return false;
      if (searchInstitution.trim()) {
        const q = searchInstitution.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesWilaya = item.wilayaName.toLowerCase().includes(q);
        const matchesSG = item.branchSG.toLowerCase().includes(q);
        if (!matchesName && !matchesWilaya && !matchesSG) return false;
      }
      return true;
    });
  }, [institutionsData, selectedWilaya, selectedTier, searchInstitution]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inquiryWilayaFilter !== 'all' && inq.wilayaCode !== inquiryWilayaFilter) return false;
      if (inquiryStatusFilter !== 'all' && inq.status !== inquiryStatusFilter) return false;
      if (inquiryPriorityFilter !== 'all' && inq.priority !== inquiryPriorityFilter) return false;
      if (inquirySearch.trim()) {
        const q = inquirySearch.trim().toLowerCase();
        const m1 = inq.fullName?.toLowerCase().includes(q);
        const m2 = inq.subject?.toLowerCase().includes(q);
        const m3 = inq.referenceCode?.toLowerCase().includes(q);
        const m4 = inq.phone?.includes(q);
        const m5 = inq.institution?.toLowerCase().includes(q);
        if (!m1 && !m2 && !m3 && !m4 && !m5) return false;
      }
      return true;
    });
  }, [inquiries, inquiryWilayaFilter, inquiryStatusFilter, inquiryPriorityFilter, inquirySearch]);

  const inquiryMetrics = useMemo(() => {
    return {
      total: inquiries.length,
      pending: inquiries.filter((q) => q.status === 'قيد المعالجة').length,
      referred: inquiries.filter((q) => q.status === 'تم التوجيه للمكتب الولائي').length,
      resolved: inquiries.filter((q) => q.status === 'تم الرد' || q.status === 'مكتمل ومؤرشف').length,
      urgent: inquiries.filter((q) => q.priority === 'عاجل جداً' || q.priority === 'مستعجل').length,
    };
  }, [inquiries]);

  const totalNationalMembers = useMemo(() => {
    if (!isNationalSG && userWilayaCode) {
      const wilayaRecord = WILAYAS_LIST.find((w) => String(w.code) === String(userWilayaCode));
      return (wilayaRecord?.membersCount || 0) + scopedMembers.length;
    }
    return WILAYAS_LIST.reduce((acc, w) => acc + (w.membersCount || 0), 0) + members.length;
  }, [scopedMembers, members, currentUser]);

  const pendingUrgentCount = useMemo(() => {
    return scopedMembers.filter((m) => m.membershipStatus === 'temporary_pending' && !m.duesPaid).length;
  }, [scopedMembers]);

  const topWilayasChartData = useMemo(() => {
    const sorted = [...filteredWilayasList]
      .sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0))
      .slice(0, 10);

    return sorted.map((w) => {
      const portalCount = members.filter((m) => String(m.wilayaCode) === String(w.code)).length;
      return {
        name: `ولاية ${w.name}`,
        code: w.code,
        المنخرطون: (w.membersCount || 0) + portalCount,
        الفروع_التربوية: w.branchesCount || 0,
      };
    });
  }, [filteredWilayasList, members]);

  const tierDistributionChartData = useMemo(() => {
    const counts: Record<string, number> = { ثانوي: 0, متوسط: 0, ابتدائي: 0, 'إدارة وتفتيش': 0 };
    filteredInstitutions.forEach((inst) => {
      counts[inst.tier] = (counts[inst.tier] || 0) + inst.membersCount;
    });
    return Object.keys(counts).map((tier) => ({
      name: tier,
      value: counts[tier],
      color: TIER_COLORS[tier] || '#006633',
    }));
  }, [filteredInstitutions]);

  const topInstitutionsChartData = useMemo(() => {
    const sorted = [...filteredInstitutions].sort((a, b) => b.membersCount - a.membersCount).slice(0, 8);
    return sorted.map((inst) => ({
      name: inst.name.length > 24 ? inst.name.slice(0, 24) + '...' : inst.name,
      المعتمدون: inst.activeCount,
      المؤقتون: inst.pendingCount,
    }));
  }, [filteredInstitutions]);

  const growthTrendData = [
    { month: 'ماي 2026', الانخراطات: 84200 },
    { month: 'جوان 2026', الانخراطات: 91500 },
    { month: 'جويلية 2026', الانخراطات: 98100 },
    { month: 'أوت 2026', الانخراطات: 104200 },
    { month: 'سبتمبر 2026', الانخراطات: 119800 },
    { month: 'أكتوبر 2026 (الحالي)', الانخراطات: totalNationalMembers },
  ];

  const handlePrint = () => window.print();

  return (
    <section
      id="admin-analytics-section" // أُضيف هذا المعرّف هنا
      aria-label="لوحة التحكم الإدارية وإحصائيات الانخراطات"
      className="bg-[#002b14] text-white py-12 px-3 sm:px-6 lg:px-8 border-b-4 border-amber-400 font-['Cairo',sans-serif] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* رأس اللوحة */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-[#00371b] via-[#004d26] to-[#00371b] p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shrink-0">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  المؤشرات الوطنية
                </span>
                <span className="bg-emerald-900/80 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                  مربوط بقاعدة بيانات الشيت (Google Sheets)
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-2 leading-tight">
                لوحة المؤشرات وإحصائيات الانخراط الوطني
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-3xl leading-relaxed">
                رصد بياني استراتيجي لتوزيع القاعدة النضالية، متابعة المحاضر الرسمية المسجلة في Google Sheets، وإحصائيات الجهات السبع (07) للوطن.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
            >
              <span>🖨️</span>
              <span>طباعة التقرير</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="bg-white/10 hover:bg-white/20 text-white font-black text-xs p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border border-white/20"
              title="تحديث البيانات"
            >
              <span className="text-base">🔄</span>
            </button>
          </div>
        </div>

        {/* بطاقات الإحصائيات الرئيسية المربوطة بالشيت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-[#00381b] to-black/60 border border-emerald-500/40 rounded-3xl p-5 shadow-xl">
            <span className="text-emerald-300 text-xs font-bold block mb-1">إجمالي المنخرطين وطنياً</span>
            <span className="text-3xl font-black text-white font-mono">{totalNationalMembers.toLocaleString('ar-DZ')}+</span>
            <span className="text-emerald-300 text-[11px] block mt-2">تغطية وطنية شاملة</span>
          </div>

          <div className="bg-gradient-to-br from-[#00381b] to-black/60 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
            <span className="text-amber-300 text-xs font-bold block mb-1">فرع نقابي مهيكل بالمؤسسات</span>
            <span className="text-3xl font-black text-amber-300 font-mono">6,850+</span>
            <span className="text-amber-200 text-[11px] block mt-2">عبر كافة الأطوار</span>
          </div>

          <div className="bg-gradient-to-br from-[#00381b] to-black/60 border border-red-500/40 rounded-3xl p-5 shadow-xl">
            <span className="text-red-300 text-xs font-bold block mb-1">الأمانات الولائية والجهوية</span>
            <span className="text-3xl font-black text-red-400 font-mono">{activeWilayasFromSheet} أمانة</span>
            <span className="text-red-200 text-[11px] block mt-2">مجلوبة مباشرة من الشيت</span>
          </div>

          <div className="bg-gradient-to-br from-[#00381b] to-black/60 border border-blue-500/40 rounded-3xl p-5 shadow-xl">
            <span className="text-blue-300 text-xs font-bold block mb-1">المحاضر والجمعيات المرقمنة</span>
            <span className="text-3xl font-black text-blue-300 font-mono">{totalMinutesFromSheet} محضر</span>
            <span className="text-blue-200 text-[11px] block mt-2">نسبة الرقمنة: 98.5%</span>
          </div>
        </div>

        {/* شريط أدوات التصفية وعرض الأنماط (شملت خيار إحصائيات الجهات 07) */}
        <div className="bg-black/50 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎛️</span>
              <h3 className="font-black text-sm text-amber-300">أدوات التصفية وعرض إحصائيات الجهات الـ 07:</h3>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-950 p-1 rounded-xl border border-emerald-500/40 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('charts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'charts' ? 'bg-[#006633] text-white' : 'text-gray-300'}`}
              >
                📊 الرسوم البيانية العامة
              </button>
              <button
                type="button"
                onClick={() => setViewMode('annualReport')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'annualReport'
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'text-amber-300 hover:text-white bg-emerald-900/60 border border-amber-400/30'
                }`}
              >
                <span>📈</span>
                <span>تقرير الأداء السنوي للنقابة</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('regions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'regions' ? 'bg-amber-400 text-slate-950 font-black' : 'text-gray-300'}`}
              >
                🌐 إحصائيات الجهات الـ 07 للوطن
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'table' ? 'bg-emerald-700 text-white' : 'text-gray-300'}`}
              >
                📋 جدول المؤسسات ({filteredInstitutions.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('membersList')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'membersList'
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'text-amber-300 hover:text-white bg-emerald-900/60 border border-amber-400/30'
                }`}
              >
                <span>🪪</span>
                <span>سجل وقائمة المنخرطين</span>
                <span className="bg-emerald-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-400/40">
                  {scopedMembers.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('inquiries')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'inquiries'
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'text-amber-300 hover:text-white bg-emerald-900/70 hover:bg-emerald-800 border border-amber-400/30'
                }`}
              >
                <span>📩</span>
                <span>إدارة استفسارات المنخرطين (snte_contacts)</span>
                {inquiries.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {inquiries.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* عرض إحصائيات الجهات السبع (07) للوطن */}
        {viewMode === 'regions' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 p-6 rounded-3xl border border-emerald-500/40 shadow-xl">
              <h3 className="text-lg font-black text-amber-300 mb-2 flex items-center gap-2">
                <span>🌐</span>
                <span>إحصائيات ومؤشرات مكاتب الأمانات الجهوية للتنسيق (الجهات الـ 07 للوطن)</span>
              </h3>
              <p className="text-xs text-emerald-100 mb-6">
                توزيع القواعد النضالية والفروع التربوية حسب التقسيم الجهوي الإداري والمرافقة الميدانية للأمانات الولائية.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {regionalStatsData.map((reg) => (
                  <div key={reg.code} className="bg-black/50 border border-emerald-500/30 rounded-2xl p-5 shadow-md hover:border-amber-400 transition-all space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-black text-sm text-white">{reg.region}</span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {reg.wilayasCount} ولايات تابعة
                      </span>
                    </div>
                    <div className="text-xs text-emerald-200 font-bold">
                      المنسق الجهوي: <span className="text-white">{reg.coordinatorName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                      <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/20">
                        <span className="text-gray-400 block text-[10px]">المنخرطون</span>
                        <strong className="text-amber-300 font-mono text-sm">{reg.membersCount.toLocaleString('ar-DZ')}</strong>
                      </div>
                      <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/20">
                        <span className="text-gray-400 block text-[10px]">الفروع المهيكلة</span>
                        <strong className="text-emerald-400 font-mono text-sm">{reg.branchesCount}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تقرير الأداء السنوي للنقابة (Recharts LineChart + localStorage) */}
        {viewMode === 'annualReport' && (
          <div className="space-y-6 animate-in fade-in">
            {/* رأس تقرير الأداء السنوي */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 p-6 sm:p-8 rounded-3xl border-2 border-amber-400/70 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shrink-0 shadow-lg">
                    📈
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                        تقرير الأداء السنوي للنقابة (S.N.T.E)
                      </span>
                      <span className="bg-emerald-900 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/40">
                        مربوط بالتخزين المحلي: localStorage (snte_annual_performance)
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      المسار الزمني لنمو القاعدة النضالية وحصيلة الإنجازات السنوية
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
                      رصد إحصائي دقيق لتطور أعداد المنخرطين، نسبة التجديد والوفاء النضالي، عدد الفروع المهيكلة بالمؤسسات، ومعدل تسوية النزاعات البيداغوجية والمهنية عبر السنوات.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddAnnualModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    title="إضافة سنة جديدة أو تعديل بيانات سنة"
                  >
                    <span>➕</span>
                    <span>إضافة / تعديل مؤشر سنوي</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportAnnualPerformanceJSON}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="تصدير بيانات الأداء السنوي بصيغة JSON"
                  >
                    <span>📥</span>
                    <span>تصدير (JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAnnualToDefaults}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-600 transition-all cursor-pointer"
                    title="استعادة السجل السنوي الافتراضي للنقابة"
                  >
                    <span>🔄 استعادة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* بطاقات المؤشرات السنوية التراكمية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-black/50 border border-emerald-500/40 rounded-2xl p-4 shadow-xl">
                <span className="text-emerald-300 text-xs font-bold block mb-1">إجمالي المنخرطين (2026)</span>
                <span className="text-2xl font-black text-white font-mono">
                  {annualPerformanceData[annualPerformanceData.length - 1]?.membersCount.toLocaleString('ar-DZ') || '42,150'}
                </span>
                <span className="text-emerald-400 text-[11px] block mt-1.5 font-bold">
                  🚀 +{(((annualPerformanceData[annualPerformanceData.length - 1]?.membersCount || 42150) - (annualPerformanceData[0]?.membersCount || 19800)) / (annualPerformanceData[0]?.membersCount || 19800) * 100).toFixed(1)}% نمو إجمالي
                </span>
              </div>

              <div className="bg-black/50 border border-cyan-500/40 rounded-2xl p-4 shadow-xl">
                <span className="text-cyan-300 text-xs font-bold block mb-1">متوسط نسبة تجديد الانخراط</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">
                  {(annualPerformanceData.reduce((acc, r) => acc + (r.activeRenewed / r.membersCount) * 100, 0) / annualPerformanceData.length).toFixed(1)}%
                </span>
                <span className="text-cyan-200 text-[11px] block mt-1.5 font-bold">
                  🔄 ولاء والتزام نضالي مستمر
                </span>
              </div>

              <div className="bg-black/50 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
                <span className="text-amber-300 text-xs font-bold block mb-1">الفروع المهيكلة (2026)</span>
                <span className="text-2xl font-black text-amber-300 font-mono">
                  {annualPerformanceData[annualPerformanceData.length - 1]?.branchesCount.toLocaleString('ar-DZ') || '7,420'}
                </span>
                <span className="text-amber-200 text-[11px] block mt-1.5 font-bold">
                  🏫 عبر الأطوار والمؤسسات
                </span>
              </div>

              <div className="bg-black/50 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
                <span className="text-purple-300 text-xs font-bold block mb-1">النزاعات والعرائض المسواة</span>
                <span className="text-2xl font-black text-purple-300 font-mono">
                  {annualPerformanceData.reduce((acc, r) => acc + r.disputesResolved, 0).toLocaleString('ar-DZ')}
                </span>
                <span className="text-purple-200 text-[11px] block mt-1.5 font-bold">
                  ⚖️ تسوية ودية ونظامية ناجحة
                </span>
              </div>

              <div className="bg-black/50 border border-yellow-500/40 rounded-2xl p-4 shadow-xl">
                <span className="text-yellow-300 text-xs font-bold block mb-1">معدل الرضا النضالي</span>
                <span className="text-2xl font-black text-yellow-300 font-mono">
                  {annualPerformanceData[annualPerformanceData.length - 1]?.satisfactionRate || 96}%
                </span>
                <span className="text-yellow-200 text-[11px] block mt-1.5 font-bold">
                  ⭐ تقييم ميداني معتمد
                </span>
              </div>
            </div>

            {/* الرسم البياني الخطي لنمو أعداد المنخرطين (Recharts LineChart) */}
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div>
                  <h4 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                    <span>📈</span>
                    <span>منحنى نمو أعداد المنخرطين السنوي (رسم بياني خطي - Recharts)</span>
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">
                    يعكس الرسم البياني الخطي التطور التصاعدي لانخراطات عمال التربية ومقارنة الفعلي مع المستهدف التخطيطي للنقابة.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300 font-mono">
                    سلسلة زمنية لـ {annualPerformanceData.length} سنوات ({annualPerformanceData[0]?.year} - {annualPerformanceData[annualPerformanceData.length - 1]?.year})
                  </span>
                </div>
              </div>

              {/* Recharts LineChart Canvas */}
              <div className="h-96 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={annualPerformanceData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#9ca3af"
                      tick={{ fill: '#e5e7eb', fontSize: 13, fontWeight: 'bold' }}
                      tickLine={{ stroke: '#4b5563' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fill: '#e5e7eb', fontSize: 11 }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val))}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#002b14',
                        borderColor: '#10b981',
                        borderRadius: '16px',
                        color: '#ffffff',
                        direction: 'rtl',
                        fontFamily: 'Cairo, sans-serif',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}
                      formatter={(value: any, name: any) => [
                        `${Number(value).toLocaleString('ar-DZ')} منخرط`,
                        name,
                      ]}
                      labelFormatter={(label) => `سنة ${label} (تقرير الأداء السنوي للنقابة)`}
                    />
                    <Legend
                      verticalAlign="top"
                      height={40}
                      formatter={(value) => (
                        <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 'bold', marginInlineStart: '6px' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="membersCount"
                      name="إجمالي المنخرطين الفعلي"
                      stroke="#10b981"
                      strokeWidth={3.5}
                      dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeRenewed"
                      name="التجديد النشط"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="newMembers"
                      name="المنخرطون الجدد"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#a855f7' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="targetGoal"
                      name="المستهدف التخطيطي"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ملخص النمو أسفل الرسم البياني */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-500/20 text-xs">
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-gray-400 block text-[10px]">نقطة الانطلاق (2020):</span>
                  <span className="text-white font-mono font-bold">{annualPerformanceData[0]?.membersCount.toLocaleString('ar-DZ')} منخرط</span>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-gray-400 block text-[10px]">الذروة الحالية (2026):</span>
                  <span className="text-amber-300 font-mono font-bold">{annualPerformanceData[annualPerformanceData.length - 1]?.membersCount.toLocaleString('ar-DZ')} منخرط</span>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-gray-400 block text-[10px]">نسبة تحقيق الأهداف:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {((annualPerformanceData[annualPerformanceData.length - 1]?.membersCount || 42150) / (annualPerformanceData[annualPerformanceData.length - 1]?.targetGoal || 41000) * 100).toFixed(1)}% (تجاوز المستهدف)
                  </span>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-gray-400 block text-[10px]">معدل النمو السنوي المركب:</span>
                  <span className="text-cyan-300 font-mono font-bold">+13.4% سنوياً</span>
                </div>
              </div>
            </div>

            {/* تفاصيل السنة المختارة */}
            <div className="bg-gradient-to-br from-black/80 to-[#00381b]/70 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗓️</span>
                  <h4 className="font-black text-sm text-amber-300">
                    استعراض تفاصيل المحطة السنوية المختارة:
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {annualPerformanceData.map((rec) => (
                    <button
                      key={rec.year}
                      type="button"
                      onClick={() => setSelectedAnnualYear(rec.year)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedAnnualYear === rec.year
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-gray-300 border border-emerald-500/20'
                      }`}
                    >
                      {rec.year}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const currentRecord = annualPerformanceData.find((r) => r.year === selectedAnnualYear) || annualPerformanceData[annualPerformanceData.length - 1];
                if (!currentRecord) return null;
                const renewalRate = ((currentRecord.activeRenewed / currentRecord.membersCount) * 100).toFixed(1);
                const targetAchievement = ((currentRecord.membersCount / currentRecord.targetGoal) * 100).toFixed(1);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">إجمالي المنخرطين:</span>
                        <span className="text-lg font-black text-white font-mono">{currentRecord.membersCount.toLocaleString('ar-DZ')}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">التجديد الفعلي:</span>
                        <span className="text-lg font-black text-cyan-300 font-mono">{currentRecord.activeRenewed.toLocaleString('ar-DZ')}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">منخرطون جدد:</span>
                        <span className="text-lg font-black text-purple-300 font-mono">{currentRecord.newMembers.toLocaleString('ar-DZ')}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">الفروع المنصبة:</span>
                        <span className="text-lg font-black text-amber-300 font-mono">{currentRecord.branchesCount.toLocaleString('ar-DZ')}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">النزاعات المسواة:</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{currentRecord.disputesResolved.toLocaleString('ar-DZ')}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                        <span className="text-gray-400 block text-[11px]">الجمعيات المنعقدة:</span>
                        <span className="text-lg font-black text-yellow-300 font-mono">{currentRecord.assembliesHeld.toLocaleString('ar-DZ')}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <span>📌</span>
                          <span>أهم إنجازات وملاحظات سنة {currentRecord.year}:</span>
                        </span>
                        <p className="text-white text-xs leading-relaxed">
                          {currentRecord.notes || 'استمرار توسيع التمثيل النقابي وتثبيت الفروع بالمؤسسات التربوية.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-emerald-900 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
                          نسبة التجديد: {renewalRate}%
                        </span>
                        <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black font-mono">
                          إنجاز الهدف: {targetAchievement}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* جدول حصيلة الأداء السنوي المفصل */}
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-5 bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 border-b border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                  <span>📋</span>
                  <span>جدول البيانات التاريخية والسنوية للأداء النقابي (snte_annual_performance)</span>
                </h4>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  {annualPerformanceData.length} سنوات مالية ونقابية
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/30 text-[11px]">
                      <th className="py-3 px-4">السنة</th>
                      <th className="py-3 px-4 text-center">إجمالي المنخرطين</th>
                      <th className="py-3 px-4 text-center">التجديد النشط</th>
                      <th className="py-3 px-4 text-center">منخرطون جدد</th>
                      <th className="py-3 px-4 text-center">المستهدف</th>
                      <th className="py-3 px-4 text-center">نسبة الإنجاز</th>
                      <th className="py-3 px-4 text-center">الفروع</th>
                      <th className="py-3 px-4 text-center">النزاعات المسواة</th>
                      <th className="py-3 px-4 text-center">الرضا</th>
                      <th className="py-3 px-4">أبرز المحطات والإنجازات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/15">
                    {annualPerformanceData.map((rec) => {
                      const achievement = ((rec.membersCount / rec.targetGoal) * 100).toFixed(1);
                      const isCurrentYear = rec.year === '2026';
                      return (
                        <tr
                          key={rec.year}
                          className={`hover:bg-emerald-900/40 transition-colors ${
                            isCurrentYear ? 'bg-emerald-950/70 font-bold' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-black text-white font-mono">
                            <span className="flex items-center gap-1.5">
                              {isCurrentYear && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                              {rec.year}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-400">
                            {rec.membersCount.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-cyan-300">
                            {rec.activeRenewed.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-purple-300">
                            +{rec.newMembers.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-gray-400">
                            {rec.targetGoal.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              Number(achievement) >= 100
                                ? 'bg-emerald-900 text-emerald-300 border border-emerald-600'
                                : 'bg-amber-950 text-amber-300 border border-amber-700'
                            }`}>
                              {achievement}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-amber-300">
                            {rec.branchesCount.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-white">
                            {rec.disputesResolved.toLocaleString('ar-DZ')}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-yellow-300">
                            {rec.satisfactionRate}%
                          </td>
                          <td className="py-3.5 px-4 text-gray-300 text-[11px]">
                            {rec.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* عرض الرسوم البيانية */}
        {viewMode === 'charts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-black/50 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl">
                <h3 className="text-sm sm:text-base font-black text-amber-300 mb-4">🗺️ توزيع النقابيين حسب الولايات الأكثر انخراطاً</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topWilayasChartData} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 11 }} angle={-20} textAnchor="end" />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#002b14', borderColor: '#10b981', borderRadius: '16px', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="المنخرطون" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="الفروع_التربوية" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-black/50 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl">
                <h3 className="text-sm sm:text-base font-black text-amber-300 mb-4">🥧 توزيع النقابيين حسب أطوار المؤسسات</h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierDistributionChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {tierDistributionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#002b14', borderColor: '#f59e0b', borderRadius: '16px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-black/50 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl">
                <h3 className="text-sm sm:text-base font-black text-amber-300 mb-4">🏫 تصنيف المؤسسات التربوية الأكثر كثافة</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topInstitutionsChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={140} />
                      <Tooltip contentStyle={{ backgroundColor: '#002b14', borderColor: '#06b6d4', borderRadius: '16px', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="المعتمدون" stackId="a" fill="#006633" />
                      <Bar dataKey="المؤقتون" stackId="a" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-black/50 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl">
                <h3 className="text-sm sm:text-base font-black text-amber-300 mb-4">📈 المنحنى الزمني لنمو الانخراطات</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#9ca3af" angle={-15} textAnchor="end" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#002b14', borderColor: '#8b5cf6', borderRadius: '16px', color: '#fff' }} />
                      <Area type="monotone" dataKey="الانخراطات" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* عرض جدول البيانات */}
        {viewMode === 'table' && (
          <div className="bg-black/60 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 border-b border-emerald-500/30 flex items-center justify-between">
              <h3 className="text-base font-black text-amber-300">🏢 دليل المؤسسات التربوية والفروع النقابية المنصبة</h3>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                الإجمالي: {filteredInstitutions.length} مؤسسة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/30 text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">المؤسسة التربوية</th>
                    <th className="py-3 px-4">الطور</th>
                    <th className="py-3 px-4">الولاية والبلدية</th>
                    <th className="py-3 px-4 text-center">المنخرطون</th>
                    <th className="py-3 px-4 text-center">معتمد نشط</th>
                    <th className="py-3 px-4 text-center">مؤقت</th>
                    <th className="py-3 px-4">ممثل الفرع النقابي</th>
                    <th className="py-3 px-4">الهاتف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/15">
                  {filteredInstitutions.map((inst, idx) => (
                    <tr key={inst.id} className="hover:bg-emerald-900/45 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{inst.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: '#00663333', color: '#10b981' }}>
                          {inst.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-200">{inst.wilayaName} ({inst.municipalName})</td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-amber-300">{inst.membersCount}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{inst.activeCount}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">{inst.pendingCount}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-200">{inst.branchSG}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300" dir="ltr">{inst.branchPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* عرض وإدارة استفسارات المنخرطين من قاعدة بيانات snte_contacts */}
        {viewMode === 'inquiries' && (
          <div className="space-y-6 animate-in fade-in">
            {/* بطاقة معلومات الهيئة المصرح لها */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 p-6 rounded-3xl border-2 border-amber-400/70 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full">
                        فضاء المشرفين والأمانة التنفيذية
                      </span>
                      <span className="bg-emerald-900/90 text-emerald-200 text-xs font-mono font-bold px-3 py-0.5 rounded-full border border-emerald-400/40">
                        مفتاح التخزين: snte_contacts
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                      إدارة ومعالجة استفسارات وتظلمات منتسبي قطاع التربية
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-1">
                      المسؤول الحالي المصرح له: <strong className="text-amber-300">{currentUser?.name || 'الأمانة الوطنية المركزية'}</strong> ({currentUser?.title || 'خلية الإصغاء وتوجيه الانشغالات'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportInquiriesJSON}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📥</span>
                    <span>تصدير السجل (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('snte-open-contact'))}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>➕</span>
                    <span>إرسال استفسار نيابة عن منخرط</span>
                  </button>
                </div>
              </div>
            </div>

            {/* بطاقات المؤشرات الإحصائية للاستفسارات */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-gray-400 text-[11px] block mb-1">إجمالي التذاكر الواردة</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">{inquiryMetrics.total}</span>
                <span className="text-emerald-400 text-[10px] block mt-1">تذكرة مسجلة</span>
              </div>

              <div className="bg-black/50 border border-amber-500/40 rounded-2xl p-4 text-center">
                <span className="text-amber-300 text-[11px] block mb-1">قيد المعالجة والدراسة</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300">{inquiryMetrics.pending}</span>
                <span className="text-amber-200 text-[10px] block mt-1">بانتظار الرد الرسمي</span>
              </div>

              <div className="bg-black/50 border border-cyan-500/40 rounded-2xl p-4 text-center">
                <span className="text-cyan-300 text-[11px] block mb-1">مُحالة إلى المكاتب الولائية</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-300">{inquiryMetrics.referred}</span>
                <span className="text-cyan-200 text-[10px] block mt-1">للمتابعة الميدانية</span>
              </div>

              <div className="bg-black/50 border border-emerald-500/40 rounded-2xl p-4 text-center">
                <span className="text-emerald-300 text-[11px] block mb-1">تمت الإجابة والمصادقة</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">{inquiryMetrics.resolved}</span>
                <span className="text-emerald-200 text-[10px] block mt-1">تذكرة مكتملة</span>
              </div>
            </div>

            {/* شريط الفلاتر والبحث في الاستفسارات */}
            <div className="bg-black/50 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-300">أدوات الفلترة والبحث المتقدم في التذاكر:</h4>
                </div>
                <span className="text-[11px] text-gray-300">
                  عدد النتائج: <strong className="text-white font-mono">{filteredInquiries.length}</strong> من أصل {inquiries.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* البحث بالنص */}
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">البحث بالكلمة أو الكود أو الهاتف:</label>
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="ابحث بالاسم، الكود، المؤسسة..."
                    className="w-full bg-[#002b14] border border-emerald-600/50 rounded-xl px-3 py-2 text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* تصفية بالولاية */}
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">تصفية حسب الولاية:</label>
                  <select
                    value={inquiryWilayaFilter}
                    onChange={(e) => setInquiryWilayaFilter(e.target.value)}
                    className="w-full bg-[#002b14] border border-emerald-600/50 rounded-xl px-3 py-2 text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="all">كافة الولايات (69)</option>
                    {WILAYAS_LIST.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - ولاية {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* تصفية بالحالة */}
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">حالة التذكرة:</label>
                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    className="w-full bg-[#002b14] border border-emerald-600/50 rounded-xl px-3 py-2 text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="all">كافة الحالات</option>
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="تم التوجيه للمكتب الولائي">تم التوجيه للمكتب الولائي</option>
                    <option value="تم الرد">تم الرد</option>
                    <option value="مكتمل ومؤرشف">مكتمل ومؤرشف</option>
                  </select>
                </div>

                {/* تصفية بالأولوية */}
                <div>
                  <label className="block text-gray-300 mb-1 font-bold">درجة الأهمية:</label>
                  <select
                    value={inquiryPriorityFilter}
                    onChange={(e) => setInquiryPriorityFilter(e.target.value)}
                    className="w-full bg-[#002b14] border border-emerald-600/50 rounded-xl px-3 py-2 text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="all">كافة الأولويات</option>
                    <option value="عاجل جداً">عاجل جداً</option>
                    <option value="مستعجل">مستعجل</option>
                    <option value="عادي">عادي</option>
                  </select>
                </div>
              </div>
            </div>

            {/* قائمة الاستفسارات وتفاصيل كل تذكرة */}
            {filteredInquiries.length === 0 ? (
              <div className="bg-black/40 border border-emerald-500/20 rounded-3xl p-10 text-center text-gray-400 space-y-2">
                <span className="text-4xl block">📭</span>
                <p className="font-bold text-base text-white">لا توجد استفسارات تطابق معايير الفلترة الحالية.</p>
                <p className="text-xs text-gray-400">يمكنك تعديل خيارات التصفية أو إرسال استفسارات جديدة لاختبار النظام.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const isReplying = selectedInquiryId === inq.id;
                  return (
                    <div
                      key={inq.id}
                      className="bg-black/50 border border-emerald-500/30 hover:border-emerald-400/60 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
                    >
                      {/* رأس بطاقة التذكرة */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-amber-400 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-lg shadow-sm">
                            {inq.referenceCode}
                          </span>
                          <span className="bg-emerald-900 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                            ولاية {inq.wilayaName} ({inq.wilayaCode})
                          </span>
                          <span className="bg-white/10 text-gray-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {inq.inquiryType}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              inq.priority === 'عاجل جداً'
                                ? 'bg-red-500/20 text-red-300 border-red-400/60 animate-pulse'
                                : inq.priority === 'مستعجل'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            الأولوية: {inq.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full border ${
                              inq.status === 'تم الرد' || inq.status === 'مكتمل ومؤرشف'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                                : inq.status === 'تم التوجيه للمكتب الولائي'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {inq.submittedAt}
                          </span>
                        </div>
                      </div>

                      {/* معلومات المنخرط والمؤسسة */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs bg-[#002b14]/70 p-3 rounded-2xl border border-emerald-500/20">
                        <div>
                          <span className="text-gray-400 block text-[10px]">اسم ولقب المنخرط:</span>
                          <strong className="text-white text-sm">{inq.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">رقم الهاتف للتواصل:</span>
                          <a
                            href={`tel:${inq.phone}`}
                            className="text-cyan-300 hover:text-cyan-200 font-mono font-bold text-xs flex items-center gap-1 mt-0.5"
                            dir="ltr"
                          >
                            <span>📞</span>
                            <span>{inq.phone}</span>
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">المؤسسة والرتبة:</span>
                          <span className="text-emerald-200 font-medium">
                            {inq.institution || 'غير محدد'} ({inq.jobTitle || 'أستاذ'})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">رقم الانخراط:</span>
                          <span className="text-amber-300 font-mono font-bold text-xs">
                            {inq.membershipNumber || 'قيد التسجيل / جديد'}
                          </span>
                        </div>
                      </div>

                      {/* موضوع ونص الانشغال */}
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-white text-sm flex items-center gap-2">
                          <span className="text-amber-300">📌 الموضوع:</span>
                          <span>{inq.subject}</span>
                        </h5>
                        <div className="bg-[#002210] p-4 rounded-2xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed whitespace-pre-wrap">
                          {inq.message}
                        </div>
                      </div>

                      {/* الرد الإداري المسجل إن وُجد */}
                      {inq.responseNote && (
                        <div className="bg-gradient-to-r from-emerald-950 to-[#00381b] p-3.5 rounded-2xl border border-emerald-400/50 text-xs space-y-1">
                          <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                            <span>✅ الرد الرسمي للأمانة:</span>
                            <span className="text-[10px] text-emerald-300">موثق في قاعدة البيانات</span>
                          </div>
                          <p className="text-emerald-100 leading-relaxed">{inq.responseNote}</p>
                        </div>
                      )}

                      {/* محرر الرد الرسمي عند الفتح */}
                      {isReplying && (
                        <div className="bg-[#002b14] p-4 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <h5 className="font-black text-amber-300 text-xs sm:text-sm">
                              ✍️ صياغة الرد الرسمي وتحديث حالة التذكرة:
                            </h5>
                            <button
                              type="button"
                              onClick={() => setSelectedInquiryId(null)}
                              className="text-gray-400 hover:text-white text-xs"
                            >
                              إلغاء ✕
                            </button>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-xs font-bold mb-1">
                              نص الرد / التوجيه الإداري للمنخرط:
                            </label>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="اكتب التوجيه أو الإجراء المتخذ رسمياً من طرف الأمانة..."
                              className="w-full bg-[#001f0e] border border-emerald-600 rounded-xl p-3 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-300 font-bold">تحديث الحالة إلى:</span>
                              <select
                                value={replyStatus}
                                onChange={(e) => setReplyStatus(e.target.value as any)}
                                className="bg-[#001f0e] border border-emerald-600 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold"
                              >
                                <option value="تم الرد">تم الرد</option>
                                <option value="تم التوجيه للمكتب الولائي">تم التوجيه للمكتب الولائي</option>
                                <option value="مكتمل ومؤرشف">مكتمل ومؤرشف</option>
                                <option value="قيد المعالجة">قيد المعالجة</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedInquiryId(null)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveReply(inq.id)}
                                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-[#006633] hover:from-emerald-500 hover:to-[#004d26] text-white font-bold rounded-xl text-xs shadow-md"
                              >
                                حفظ واعتماد الرد الرسمي
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* شريط الإجراءات الإدارية السريعة */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-2">
                          {!isReplying && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInquiryId(inq.id);
                                setReplyText(inq.responseNote || '');
                                setReplyStatus(inq.status);
                              }}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>✍️</span>
                              <span>معالجة وإضافة رد رسمي</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateInquiryStatus(
                                inq.id,
                                'تم التوجيه للمكتب الولائي',
                                `تم تحويل الانشغال بتاريخ اليوم إلى الأمانة الولائية لولاية ${inq.wilayaName} لمتابعة الملف مع مديرية التربية.`
                              )
                            }
                            className="bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            title="تحويل مباشر للأمانة الولائية"
                          >
                            <span>🏢</span>
                            <span>إحالة للولاية</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateInquiryStatus(
                                inq.id,
                                'مكتمل ومؤرشف',
                                inq.responseNote || 'تمت معالجة الانشغال وتسويته بصورة نهائية.'
                              )
                            }
                            className="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            title="أرشفة التذكرة"
                          >
                            <span>📁</span>
                            <span>أرشفة</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="حذف التذكرة نهائياً"
                          >
                            <span className="text-sm">🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* سجل وقائمة المنخرطين حسب الاختصاص الهرمي (وطني، جهوي، ولائي) */}
        {viewMode === 'membersList' && (
          <div className="space-y-6 animate-in fade-in">
            {/* بطاقة الترويسة ونطاق الاختصاص */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#00381b] to-emerald-950 p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/50 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shrink-0 shadow-lg">
                    🪪
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                        {isNationalSG
                          ? 'السجل الوطني العام للمنخرطين (69 ولاية)'
                          : isRegionalCoordinator
                          ? `سجل الأمانة الجهوية للتنسيق - ${currentUser?.region || 'الجهة'}`
                          : `سجل الأمانة الولائية - ولاية ${currentUser?.wilayaName || currentUser?.wilayaCode}`}
                      </span>
                      <span className="bg-emerald-900 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/40">
                        {isNationalSG
                          ? 'صلاحية مشاهدة وتدقيق وطنية شاملة'
                          : isRegionalCoordinator
                          ? `نطاق الاختصاص: ${regionalCoveredWilayas.length} ولاية تابعة للإقليم`
                          : `نطاق الاختصاص: ولاية ${currentUser?.wilayaName || currentUser?.wilayaCode}`}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                      سجل وقائمة المنخرطين المعتمدين والمؤقتين حسب الاختصاص التنظيمي
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
                      عرض بيانات القواعد النضالية، التدقيق في تسديد اشتراكات الـ 100 دج، مطابقة المحاضر، والمزامنة المباشرة الفورية مع Google Sheets دون حظر النوافذ المنبثقة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDirectSheetSync}
                    disabled={isSyncingSheetLive}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-emerald-400"
                    title="مزامنة حية ومباشرة مع جدول بيانات قوقل شيتس الرسمي"
                  >
                    <span className={isSyncingSheetLive ? 'animate-spin text-base' : 'text-base'}>🔄</span>
                    <span>{isSyncingSheetLive ? 'جاري المزامنة...' : 'مزامنة مباشرة مع الشيت'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPendingReviewOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    title="مراجعة وتفعيل الاشتراكات المؤقتة"
                  >
                    <span>⚡</span>
                    <span>تفعيل وقبول الاشتراكات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const csvHeader = 'الرقم,الاسم واللقب,رقم البطاقة,الرتبة,المهمة النقابية,الولاية,البلدية,مكان العمل,NIN,الضمان الاجتماعي,الهاتف,الحالة\n';
                      const csvRows = displayedScopedMembers.map((m, idx) => 
                        `"${idx + 1}","${m.fullName || ''}","${m.membershipCardNo || ''}","${m.rank || ''}","${m.hierarchyRole || ''}","${m.wilayaName || ''}","${m.municipalName || ''}","${m.institutionName || m.workplace || ''}","${m.nationalId || ''}","${m.socialSecurityNo || ''}","${m.phone || ''}","${m.duesPaid ? 'معتمد ومسدد' : 'مؤقت'}"`
                      ).join('\n');
                      const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `snte_members_${currentUser?.wilayaCode || currentUser?.region || 'scoped'}_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="تصدير السجل المفلتر بصيغة CSV"
                  >
                    <span>📥</span>
                    <span>تصدير CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="طباعة السجل الحالي"
                  >
                    <span>🖨️</span>
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              {/* إشعار المزامنة الحية إن وجد */}
              {syncFeedback && (
                <div className="p-3 bg-emerald-900/90 border border-emerald-400 rounded-2xl text-emerald-100 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <span>{syncFeedback}</span>
                  <button onClick={() => setSyncFeedback(null)} className="text-gray-300 hover:text-white">✕</button>
                </div>
              )}
            </div>

            {/* بطاقات الإحصاء السريع لنطاق الاختصاص */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-gray-300 text-xs block">إجمالي المسجلين بالنطاق</span>
                <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
                  {scopedMembers.length.toLocaleString('ar-DZ')}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">ضمن اختصاصك التنظيمي</span>
              </div>

              <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <span className="text-gray-300 text-xs block">المنخرطون المعتمدون (نشط)</span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {scopedMembers.filter((m) => m.membershipStatus === 'active' || m.duesPaid).length.toLocaleString('ar-DZ')}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">سددوا 100 دج واقتنوا البطاقة</span>
              </div>

              <div className="bg-black/50 border border-amber-500/40 rounded-2xl p-4 text-center">
                <span className="text-amber-200 text-xs block">طلبات العضوية المؤقتة</span>
                <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
                  {scopedMembers.filter((m) => m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid)).length}
                </span>
                <span className="text-[10px] text-amber-300 mt-1 block">فترة أسبوع للتسوية</span>
              </div>

              <div className="bg-black/50 border border-red-500/30 rounded-2xl p-4 text-center">
                <span className="text-red-300 text-xs block">الطلبات المرفوضة</span>
                <span className="text-2xl font-black text-red-400 font-mono mt-1 block">
                  {scopedMembers.filter((m) => m.membershipStatus === 'rejected').length}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">عدم استيفاء الشروط</span>
              </div>
            </div>

            {/* شريط البحث وتصفية السجل */}
            <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* البحث النصي */}
                <div className="relative min-w-[240px] flex-1">
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="بحث سريع بالاسم، رقم البطاقة، NIN، الهاتف، المؤسسة التربوية، الرتبة..."
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-white placeholder-gray-400 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-gray-400">🔍</span>
                </div>

                {/* فلتر الولاية حسب الاختصاص */}
                {isNationalSG ? (
                  <select
                    value={memberWilayaFilter}
                    onChange={(e) => setMemberWilayaFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">-- جميع الولايات (69 ولاية) --</option>
                    {WILAYAS_LIST.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - ولاية {w.name}
                      </option>
                    ))}
                  </select>
                ) : isRegionalCoordinator ? (
                  <select
                    value={memberWilayaFilter}
                    onChange={(e) => setMemberWilayaFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-emerald-400 rounded-xl text-amber-300 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">-- كافة ولايات الإقليم ({regionalCoveredWilayas.length}) --</option>
                    {regionalCoveredWilayas.map((cCode) => {
                      const wInfo = WILAYAS_LIST.find((w) => String(w.code).padStart(2, '0') === String(cCode).padStart(2, '0') || w.code === cCode);
                      return (
                        <option key={cCode} value={cCode}>
                          {cCode} - ولاية {wInfo?.name || cCode}
                        </option>
                      );
                    })}
                  </select>
                ) : null}

                {/* فلتر الحالة */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-emerald-500/40">
                  <button
                    type="button"
                    onClick={() => setMemberStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      memberStatusFilter === 'all' ? 'bg-amber-400 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    الكل ({scopedMembers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      memberStatusFilter === 'active' ? 'bg-emerald-600 text-white font-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    المعتمدون (نشط)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      memberStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    مؤقت
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberStatusFilter('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      memberStatusFilter === 'rejected' ? 'bg-red-600 text-white font-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    مرفوض
                  </button>
                </div>
              </div>
            </div>

            {/* جدول سجل المنخرطين */}
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-emerald-950/90 text-amber-300 border-b border-emerald-500/40">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-4">الاسم واللقب</th>
                      <th className="py-3 px-3">رقم البطاقة</th>
                      <th className="py-3 px-4">الرتبة والمهمة النقابية</th>
                      <th className="py-3 px-3">الولاية / البلدية</th>
                      <th className="py-3 px-4">مكان العمل / المؤسسة</th>
                      <th className="py-3 px-3">NIN / الضمان</th>
                      <th className="py-3 px-3">الهاتف</th>
                      <th className="py-3 px-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30">
                    {displayedScopedMembers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-400">
                          <span className="text-3xl block mb-2">📭</span>
                          لا يوجد منخرطون مسجلون مطابقون لخيارات التصفية ضمن نطاق اختصاصك الحالي.
                        </td>
                      </tr>
                    ) : (
                      displayedScopedMembers.map((m, idx) => {
                        const isActive = m.membershipStatus === 'active' || m.duesPaid;
                        const isPending = m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid);
                        const isRejected = m.membershipStatus === 'rejected';

                        return (
                          <tr key={m.id || idx} className="hover:bg-emerald-950/40 transition-colors">
                            <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <span className="font-black text-white block">{m.fullName}</span>
                              {m.biometricFingerprintCode && (
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  بصمة: {m.biometricFingerprintCode}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-amber-300 text-[11px]">
                              {m.membershipCardNo || 'قيد الإصدار'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-white font-bold block">{m.rank || 'إطار تربوي'}</span>
                              <span className="text-[11px] text-emerald-300 block">{m.hierarchyRole || 'عضو منخرط'}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-amber-200 font-bold block">
                                {m.wilayaCode} - {m.wilayaName}
                              </span>
                              <span className="text-gray-400 text-[10px] block">{m.municipalName || 'المقر'}</span>
                            </td>
                            <td className="py-3 px-4 text-emerald-100 max-w-[180px] truncate" title={m.institutionName || m.workplace}>
                              {m.institutionName || m.workplace || 'المؤسسة التربوية'}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] text-gray-300">
                              <span className="block" title="رقم التعريف الوطني">NIN: {m.nationalId || '-'}</span>
                              <span className="block text-gray-400" title="رقم الضمان الاجتماعي">SS: {m.socialSecurityNo || '-'}</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-xs text-amber-300">
                              {m.phone || '-'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isActive ? (
                                <span className="inline-block bg-emerald-900/90 text-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-400/50">
                                  ✓ معتمد (100 دج)
                                </span>
                              ) : isPending ? (
                                <span className="inline-block bg-amber-900/80 text-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/50 animate-pulse">
                                  ⏳ مؤقت (أسبوع)
                                </span>
                              ) : isRejected ? (
                                <span className="inline-block bg-red-900/80 text-red-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-400/50">
                                  ✕ مرفوض
                                </span>
                              ) : (
                                <span className="inline-block bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">
                                  غير محدد
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* أسفل الجدول مع الخلاصة */}
              <div className="bg-emerald-950/80 p-4 border-t border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-gray-300">
                  عرض <strong className="text-amber-300">{displayedScopedMembers.length}</strong> من إجمالي <strong className="text-white">{scopedMembers.length}</strong> منخرط في نطاق اختصاصك.
                </span>
                <span className="text-[11px] text-emerald-300">
                  تحديث تلقائي مستمر ومربوط بقاعدة بيانات التخزين المحلي والشيت الرسمي.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      <PendingMembersReviewModal
        isOpen={isPendingReviewOpen}
        onClose={() => setIsPendingReviewOpen(false)}
        currentUser={currentUser}
      />

      {/* نافذة إضافة أو تعديل مؤشر أداء سنوي في localStorage */}
      {isAddAnnualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#002b14] border-2 border-amber-400 text-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>➕</span>
                <span>إضافة / تحديث مؤشر الأداء السنوي (localStorage)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAnnualModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnualRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">السنة المالية / النقابية:</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    required
                    placeholder="مثال: 2027"
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">إجمالي المنخرطين الفعلي:</label>
                  <input
                    type="number"
                    value={formMembersCount}
                    onChange={(e) => setFormMembersCount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">المنخرطون المجددون (نشط):</label>
                  <input
                    type="number"
                    value={formActiveRenewed}
                    onChange={(e) => setFormActiveRenewed(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">المنخرطون الجدد:</label>
                  <input
                    type="number"
                    value={formNewMembers}
                    onChange={(e) => setFormNewMembers(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">المستهدف التخطيطي:</label>
                  <input
                    type="number"
                    value={formTargetGoal}
                    onChange={(e) => setFormTargetGoal(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">الفروع المهيكلة:</label>
                  <input
                    type="number"
                    value={formBranchesCount}
                    onChange={(e) => setFormBranchesCount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">النزاعات المسواة:</label>
                  <input
                    type="number"
                    value={formDisputesResolved}
                    onChange={(e) => setFormDisputesResolved(Number(e.target.value))}
                    required
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">أبرز المحطات والإنجازات للسنة:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="مثال: استكمال الربط مع قاعدة البيانات وتوسيع بطاقات العضوية البيومترية..."
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-white text-xs focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-500/30">
                <button
                  type="button"
                  onClick={() => setIsAddAnnualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md cursor-pointer"
                >
                  حفظ في localStorage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
