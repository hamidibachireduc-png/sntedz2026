import React, { useState, useEffect, useRef } from 'react';
import { UnifiedLoginModal } from './UnifiedLoginModal';
import { MemberRegistrationModal } from './MemberRegistrationModal';
import { DigitalMembershipCardModal, MemberData } from './DigitalMembershipCardModal';
import { AddTopicModal } from './AddTopicModal';
import { RequestPublicationModal } from './RequestPublicationModal';
import { PublicationRequestsReviewModal } from './PublicationRequestsReviewModal';
import { PendingMembersReviewModal } from './PendingMembersReviewModal';
import { UnionHierarchyModal } from './UnionHierarchyModal';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import {
  TopicCategory,
  CATEGORY_INFO,
  UnionTopic,
  PublicationRequest,
  INITIAL_PUBLICATION_REQUESTS,
} from './unionPortfoliosData';

export const TopAuthBar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPendingMembersOpen, setIsPendingMembersOpen] = useState(false);
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [activeCategoryForAdd, setActiveCategoryForAdd] = useState<TopicCategory>('union_bag');
  const [isPortfoliosDropdownOpen, setIsPortfoliosDropdownOpen] = useState(false);
  const [activeMemberData, setActiveMemberData] = useState<MemberData | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingMembersCount, setPendingMembersCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check roles
  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isWilayaOrRegionalSG =
    currentUser &&
    !isNationalSG &&
    (currentUser.role === 'WILAYA_SG' ||
      currentUser.role === 'GENERAL_COORDINATOR' ||
      currentUser.role === 'MUNICIPAL_SG' ||
      currentUser.role === 'BRANCH_SG' ||
      currentUser.level === 'wilaya' ||
      currentUser.level === 'coordinator');

  const loadRequestsCount = () => {
    try {
      const raw = localStorage.getItem('snte_publication_requests_v1');
      const reqs: PublicationRequest[] = raw ? JSON.parse(raw) : INITIAL_PUBLICATION_REQUESTS;
      const count = reqs.filter((r) => r.status === 'pending').length;
      setPendingRequestsCount(count);
    } catch {
      setPendingRequestsCount(0);
    }
  };

  const loadPendingMembersCount = () => {
    try {
      const raw = localStorage.getItem('snte_members_v3');
      if (!raw) {
        setPendingMembersCount(0);
        return;
      }
      const all: any[] = JSON.parse(raw);
      if (!Array.isArray(all)) {
        setPendingMembersCount(0);
        return;
      }
      if (isNationalSG) {
        const count = all.filter(
          (m) => m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid)
        ).length;
        setPendingMembersCount(count);
      } else if (currentUser?.role === 'WILAYA_SG' && currentUser?.wilayaCode) {
        const cCode = String(currentUser.wilayaCode).padStart(2, '0');
        const count = all.filter(
          (m) =>
            String(m.wilayaCode).padStart(2, '0') === cCode &&
            (m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid))
        ).length;
        setPendingMembersCount(count);
      } else {
        setPendingMembersCount(0);
      }
    } catch {
      setPendingMembersCount(0);
    }
  };

  // Sync user state from localStorage
  const refreshUser = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        setCurrentUser(u);

        // If user is a member, prepare their member card
        if (u.role === 'MEMBER' || u.level === 'member') {
          setActiveMemberData({
            id: u.id,
            nationalId: u.nationalId || '198416010045230001',
            socialSecurityNo: u.socialSecurityNo || '168409123456',
            membershipCardNo: u.membershipCardNo || 'SNTE-2026-0001',
            fullName: u.name || 'المنخرط',
            birthDate: u.birthDate || '1985-05-15',
            wilayaCode: u.wilayaCode || '16',
            wilayaName: u.wilayaName || 'الجزائر',
            municipalName: u.municipalName || 'الوسط',
            institutionName: u.institutionName || 'مؤسسة تربوية',
            rank: u.rank || 'أستاذ',
            workplace: u.workplace || 'المؤسسة',
            status: u.membershipStatus === 'temporary_pending' ? 'مؤقت (أسبوع تجريبي)' : (u.status || 'نشط'),
            membershipStatus: u.membershipStatus,
            registrationTimestamp: u.registrationTimestamp,
            temporaryExpiresAt: u.temporaryExpiresAt,
            duesPaid: u.duesPaid,
            rejectionReason: u.rejectionReason,
          });
        }
      } else {
        setCurrentUser(null);
        setActiveMemberData(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
    loadRequestsCount();
    loadPendingMembersCount();

    // Listen to external open requests from anywhere in the app
    const handleOpenLogin = () => setIsLoginOpen(true);
    const handleOpenRegister = () => setIsRegisterOpen(true);
    const handleOpenCard = () => {
      refreshUser();
      setIsCardOpen(true);
    };
    const handleOpenPendingMembers = () => setIsPendingMembersOpen(true);
    const handleOpenHierarchy = () => setIsHierarchyOpen(true);

    window.addEventListener('snte-open-login', handleOpenLogin);
    window.addEventListener('snte-open-register', handleOpenRegister);
    window.addEventListener('snte-open-member-card', handleOpenCard);
    window.addEventListener('snte-open-pending-members', handleOpenPendingMembers);
    window.addEventListener('snte-open-hierarchy', handleOpenHierarchy);
    window.addEventListener('snte-topic-published', loadRequestsCount);
    window.addEventListener('snte-members-updated', () => {
      refreshUser();
      loadPendingMembersCount();
    });
    window.addEventListener('snte-member-registered', () => {
      refreshUser();
      loadPendingMembersCount();
    });
    window.addEventListener('storage', () => {
      refreshUser();
      loadRequestsCount();
      loadPendingMembersCount();
    });

    (window as any).openSnteLogin = handleOpenLogin;
    (window as any).openSnteRegister = handleOpenRegister;
    (window as any).openSnteCard = handleOpenCard;
    (window as any).openSntePendingMembers = handleOpenPendingMembers;
    (window as any).openSnteHierarchy = handleOpenHierarchy;

    // Handle outside clicks for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortfoliosDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('snte-open-login', handleOpenLogin);
      window.removeEventListener('snte-open-register', handleOpenRegister);
      window.removeEventListener('snte-open-member-card', handleOpenCard);
      window.removeEventListener('snte-open-pending-members', handleOpenPendingMembers);
      window.removeEventListener('snte-open-hierarchy', handleOpenHierarchy);
      window.removeEventListener('snte-topic-published', loadRequestsCount);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Immediate, activated logout without blocked confirm dialogs
    localStorage.removeItem('snte_user');
    setCurrentUser(null);
    setActiveMemberData(null);
    window.location.reload();
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    refreshUser();
    loadRequestsCount();
    if (user.role === 'MEMBER') {
      setIsCardOpen(true);
    } else {
      window.location.reload();
    }
  };

  const handleRegistrationSuccess = (newMember: MemberData) => {
    setActiveMemberData(newMember);
    refreshUser();
    setIsCardOpen(true);
  };

  const handleNavigateToCategory = (catKey: TopicCategory) => {
    setIsPortfoliosDropdownOpen(false);
    // Dispatch event to switch active category
    window.dispatchEvent(
      new CustomEvent('snte-switch-portfolio', { detail: { category: catKey } })
    );
    // Scroll to the specific dedicated section
    const targetId =
      catKey === 'wilaya_acts' || catKey === 'region_acts'
        ? 'unionActivitiesSection'
        : 'memberServicesSection';
    const elem = document.getElementById(targetId) || document.getElementById('unionPortfoliosSection');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActionForTopic = (catKey: TopicCategory = 'union_bag') => {
    setActiveCategoryForAdd(catKey);
    setIsPortfoliosDropdownOpen(false);

    if (isNationalSG) {
      setIsAddTopicOpen(true);
    } else if (isWilayaOrRegionalSG) {
      setIsRequestModalOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const isTemporaryMember =
    currentUser?.role === 'MEMBER' &&
    (currentUser?.isTemporary ||
      currentUser?.membershipStatus === 'temporary_pending' ||
      (currentUser?.temporaryExpiresAt && Date.now() < currentUser?.temporaryExpiresAt && !currentUser?.duesPaid));

  const memberWilayaData: WilayaData | undefined =
    currentUser?.wilayaCode
      ? WILAYAS_LIST.find(
          (w) => String(w.code).padStart(2, '0') === String(currentUser.wilayaCode).padStart(2, '0')
        )
      : undefined;

  const calculateDaysRemaining = () => {
    if (!currentUser?.temporaryExpiresAt) return 7;
    const diff = currentUser.temporaryExpiresAt - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    const roleId = currentUser.hierarchyRoleId || currentUser.role;

    switch (roleId) {
      case 'NATIONAL_SG':
      case 'national-sg':
        return (
          <span className="bg-amber-400 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>👑</span>
            <span>الأمين العام الوطني</span>
          </span>
        );
      case 'national-congress':
        return (
          <span className="bg-emerald-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏛️</span>
            <span>عضو مؤتمر وطني</span>
          </span>
        );
      case 'national-council':
        return (
          <span className="bg-blue-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>📜</span>
            <span>عضو مجلس وطني</span>
          </span>
        );
      case 'national-secretariat':
        return (
          <span className="bg-[#004d26] text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>💼</span>
            <span>الأمانة الوطنية</span>
          </span>
        );
      case 'GENERAL_COORDINATOR':
      case 'regional-coordination':
        return (
          <span className="bg-cyan-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🌐</span>
            <span>الأمانة الجهوية للتنسيق ({currentUser.region || 'الجهوي'})</span>
          </span>
        );
      case 'national-corps':
        return (
          <span className="bg-indigo-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🎯</span>
            <span>تنسيقيات وطنية للرتب والأسلاك</span>
          </span>
        );
      case 'elders-council':
        return (
          <span className="bg-amber-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>👴</span>
            <span>لجنة الحكماء (المتقاعدين)</span>
          </span>
        );
      case 'advisor-legal':
        return (
          <span className="bg-purple-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>⚖️</span>
            <span>مستشار الشؤون القانونية</span>
          </span>
        );
      case 'advisor-pedagogy':
        return (
          <span className="bg-purple-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🎓</span>
            <span>مستشار شؤون التربية والبيداغوجيا</span>
          </span>
        );
      case 'advisor-media':
        return (
          <span className="bg-purple-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>📢</span>
            <span>مسؤولة الخلية الوطنية للإعلام والتنظيم</span>
          </span>
        );
      case 'advisor-comm':
        return (
          <span className="bg-purple-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>💻</span>
            <span>مستشار تقنيات التواصل</span>
          </span>
        );
      case 'WILAYA_SG':
      case 'wilaya-sg':
        return (
          <span className="bg-emerald-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏛️</span>
            <span>الأمانة الولائية ({currentUser.wilayaName || currentUser.wilayaCode})</span>
          </span>
        );
      case 'wilaya-council':
        return (
          <span className="bg-teal-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>📋</span>
            <span>عضو مجلس ولائي ({currentUser.wilayaName || currentUser.wilayaCode})</span>
          </span>
        );
      case 'wilaya-secretariat':
        return (
          <span className="bg-emerald-900 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏬</span>
            <span>الأمانة الولائية ({currentUser.wilayaName || currentUser.wilayaCode})</span>
          </span>
        );
      case 'wilaya-corps':
        return (
          <span className="bg-indigo-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏷️</span>
            <span>تنسيقيات ولائية للرتب والأسلاك</span>
          </span>
        );
      case 'MUNICIPAL_SG':
      case 'municipal-sg':
        return (
          <span className="bg-amber-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏢</span>
            <span>أمين عام بلدي ({currentUser.municipalName || 'البلدية'})</span>
          </span>
        );
      case 'municipal-council':
        return (
          <span className="bg-amber-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>👥</span>
            <span>عضو مجلس بلدي</span>
          </span>
        );
      case 'municipal-secretariat':
        return (
          <span className="bg-yellow-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>📑</span>
            <span>الأمانة البلدية</span>
          </span>
        );
      case 'BRANCH_SG':
      case 'branch-sg':
        return (
          <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏫</span>
            <span>أمين عام فرع نقابي بالمؤسسة</span>
          </span>
        );
      case 'branch-assembly-member':
        return (
          <span className="bg-blue-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🗳️</span>
            <span>عضو جمعية فرع نقابي</span>
          </span>
        );
      case 'branch-secretariat':
        return (
          <span className="bg-teal-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🤝</span>
            <span>أمانة الفرع النقابي</span>
          </span>
        );
      case 'MEMBER':
      case 'union-member':
        if (isTemporaryMember) {
          const days = calculateDaysRemaining();
          return (
            <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-amber-300">
              <span>⏳</span>
              <span>عضوية مؤقتة (متبقي {days} أيام)</span>
            </span>
          );
        }
        return (
          <span className="bg-purple-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🪪</span>
            <span>منخرط ({currentUser.membershipCardNo || 'بطاقة معتمدة'})</span>
          </span>
        );
      default:
        return (
          <span className="bg-gray-800 text-white font-bold text-[11px] px-2 py-0.5 rounded-full">
            {currentUser.structureName || currentUser.role}
          </span>
        );
    }
  };

  return (
    <>
      {/* Sticky Top Universal Auth & Portfolios Bar */}
      <nav
        aria-label="شريط الحساب وتسجيل الدخول والأقسام"
        className="sticky top-0 z-50 bg-[#00371b] text-white border-b-2 border-amber-400 shadow-lg px-3 sm:px-6 py-2.5 font-['Cairo',sans-serif]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Logo & National Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-amber-400 shrink-0">
              <img
                src="https://l.top4top.io/p_37988hwfa0.png"
                alt="SNTE"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white">النقابة الوطنية لعمال التربية S.N.T.E</span>
                <span className="hidden md:inline-block text-[10px] text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                  البوابة المركزية
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation: Separate Activities, Hierarchy and Member Services buttons */}
          <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
            {/* 1. زر النشاطات النقابية الميدانية (مستقل وظاهر) */}
            <button
              type="button"
              onClick={() => handleNavigateToCategory('wilaya_acts')}
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-emerald-400/50 shadow-xs transition-all cursor-pointer"
              title="الانتقال المباشر لنشاطات الأمانات الولائية والتنسيقيات الجهوية"
            >
              <span>🏛️</span>
              <span>النشاطات النقابية</span>
            </button>

            {/* 2. زر الهياكل والسلم النقابي (مستقل وظاهر) */}
            <button
              type="button"
              onClick={() => setIsHierarchyOpen(true)}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-emerald-500/50 shadow-xs transition-all cursor-pointer"
              title="دليل الهياكل والسلم النقابي الرسمي للاتحاد الوطني لعمال التربية"
            >
              <span>🪜</span>
              <span>الهياكل والسلم النقابي</span>
            </button>

            {/* 3. زر قسم خدمات المنخرطين (الحقائب والمنصات) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPortfoliosDropdownOpen(!isPortfoliosDropdownOpen)}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-amber-300 shadow-xs transition-all cursor-pointer"
                title="فضاء خدمات المنخرطين: المنصات الرقمية والحقائب النقابية"
              >
                <span>💼</span>
                <span>خدمات المنخرطين (الحقائب والمنصات)</span>
                <span className="text-[10px]">▼</span>
              </button>

              {/* Dropdown Items List */}
              {isPortfoliosDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 text-right text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-black text-[#006633] bg-emerald-50/60 flex items-center justify-between">
                    <span>💼 خدمات المنخرطين والحقائب المعتمدة</span>
                    <button
                      type="button"
                      onClick={() => handleNavigateToCategory('platforms')}
                      className="text-[10px] text-blue-700 hover:underline"
                    >
                      فتح القسم
                    </button>
                  </div>

                  {(Object.keys(CATEGORY_INFO) as TopicCategory[]).map((catKey) => {
                    const info = CATEGORY_INFO[catKey];
                    const isProtected = !currentUser && catKey !== 'wilaya_acts' && catKey !== 'region_acts';
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => handleNavigateToCategory(catKey)}
                        className="w-full text-right px-3.5 py-2 hover:bg-emerald-50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base group-hover:scale-110 transition-transform">
                            {isProtected ? '🔒' : info.icon}
                          </span>
                          <div>
                            <div className="font-extrabold text-gray-900 group-hover:text-[#006633] flex items-center gap-1.5">
                              <span>{info.label}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 line-clamp-1">
                              {info.desc}
                            </div>
                          </div>
                        </div>
                        {isProtected && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded shrink-0">
                            خاص بالمنخرطين
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Add / Request Topic Action inside dropdown */}
                  <div className="pt-2 mt-1 border-t border-gray-100 px-3 pb-1 space-y-1">
                    {isNationalSG ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleActionForTopic('union_bag')}
                          className="w-full bg-[#006633] hover:bg-[#004d26] text-white font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>➕</span>
                          <span>إضافة موضوع جديد (نشر مباشر)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPortfoliosDropdownOpen(false);
                            setIsReviewModalOpen(true);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                        >
                          <span>📩</span>
                          <span>مراجعة طلبات الترخيص والتفويض</span>
                        </button>
                      </>
                    ) : isWilayaOrRegionalSG ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleActionForTopic('wilaya_acts')}
                          className="w-full bg-[#006633] hover:bg-[#004d26] text-white font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>📨</span>
                          <span>طلب ترخيص بالنشر للأمين العام الوطني</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPortfoliosDropdownOpen(false);
                            setIsReviewModalOpen(true);
                          }}
                          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                        >
                          <span>📋</span>
                          <span>تتبع طلباتي المرسلة</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-xl text-[11px] text-gray-600 text-center">
                        🔒 النشر والتعديل خاضع للترخيص الحصري للأمانة العامة الوطنية
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role-tailored Action Buttons in Top Bar */}
            {isNationalSG ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300"
                  title="مراجعة طلبات الترخيص والتفويض الواردة من الأمناء العامين والمنسقين"
                >
                  <span>📩</span>
                  <span>طلبات الترخيص</span>
                  {pendingRequestsCount > 0 && (
                    <span className="bg-emerald-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPendingMembersOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                  title="مراجعة طلبات الانخراط وتفعيل اشتراك 100 دج"
                >
                  <span>🪪</span>
                  <span className="hidden sm:inline">طلبات الانخراط</span>
                  <span className="sm:hidden">الانخراطات</span>
                  {pendingMembersCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                      {pendingMembersCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleActionForTopic('union_bag')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                  title="إضافة موضوع وتعديله (خاص بالأمين العام الوطني)"
                >
                  <span>➕</span>
                  <span className="hidden sm:inline">نشر مباشر</span>
                </button>
              </div>
            ) : isWilayaOrRegionalSG ? (
              <div className="flex items-center gap-1.5">
                {currentUser?.role === 'WILAYA_SG' && (
                  <button
                    type="button"
                    onClick={() => setIsPendingMembersOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                    title={`مراجعة طلبات الانخراط وتفعيل سداد 100 دج لولاية ${currentUser.wilayaName || currentUser.wilayaCode}`}
                  >
                    <span>🪪</span>
                    <span>انخراطات الولاية</span>
                    {pendingMembersCount > 0 && (
                      <span className="bg-amber-300 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                        {pendingMembersCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300"
                  title="إرسال طلب ترخيص وتفويض بالنشر للأمين العام الوطني"
                >
                  <span>📨</span>
                  <span>طلب ترخيص بالنشر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  title="متابعة حالة طلبات الترخيص المرسلة"
                >
                  <span>📋</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-amber-200 text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="طلب ترخيص بالنشر للأمناء العامين والمنسقين"
              >
                <span>📜</span>
                <span className="hidden sm:inline">ضوابط النشر</span>
              </button>
            )}
          </div>

          {/* Right Action Controls: Login, Register, Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentUser ? (
              // Logged in state
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-black/30 border border-white/15 px-3 py-1 rounded-xl">
                  {getRoleBadge()}
                  <span className="font-extrabold text-xs text-white max-w-[150px] truncate">
                    {currentUser.name}
                  </span>
                </div>

                {/* If member: View Membership Card */}
                {(currentUser.role === 'MEMBER' || currentUser.level === 'member') && (
                  <button
                    type="button"
                    onClick={() => setIsCardOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🪪</span>
                    <span className="hidden sm:inline">بطاقتي النقابية</span>
                  </button>
                )}

                {/* If National SG: Google Drive Folder */}
                {currentUser.role === 'NATIONAL_SG' && (
                  <button
                    type="button"
                    onClick={() => {
                      (window as any).openGoogleSheetsSync
                        ? (window as any).openGoogleSheetsSync()
                        : window.dispatchEvent(new CustomEvent('snte-open-sheets-sync'));
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
                    title="مجلد الأمانات وشيتات Google Sheets"
                  >
                    <span>📊</span>
                    <span className="hidden sm:inline">شيتات Google Drive</span>
                  </button>
                )}

                {/* Logout Button (Immediate, activated logout) */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-red-400/50"
                  title="تسجيل الخروج الفوري من الحساب"
                >
                  <span>🚪</span>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              // Logged out state
              <div className="flex items-center gap-2 flex-wrap">
                {/* Login Button */}
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-[#006633] hover:from-emerald-400 hover:to-[#004d26] text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
                >
                  <span>🔐</span>
                  <span>تسجيل الدخول</span>
                </button>

                {/* New Member Registration Button */}
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300"
                >
                  <span>🪪</span>
                  <span>تسجيل انخراط جديد</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dedicated Notice Banner for Temporary Member (ولوج تجريبي مؤقت لمدة أسبوع) */}
      {isTemporaryMember && (
        <aside
          aria-label="إعلام خاص بالمنخرط الجديد"
          className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 border-b-2 border-amber-600 shadow-md font-['Cairo',sans-serif]"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/95 text-amber-700 flex items-center justify-center text-2xl shadow-sm shrink-0 border border-amber-400">
                  ⏳
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-emerald-950">
                      إعلام خاص بالمنخرط الجديد: ولوج تجريبي مؤقت (متبقي {calculateDaysRemaining()} أيام)
                    </span>
                    <span className="bg-emerald-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      قيد اقتناء البطاقة الورقية
                    </span>
                  </div>
                  <p className="text-xs text-slate-900 mt-1 leading-relaxed max-w-3xl">
                    مرحباً بك زميلنا الكريم في رحاب S.N.T.E! حسابك مفعل بصفة مؤقتة لمدة 7 أيام للاستفادة الكاملة من كافة الخدمات، الحقائب النقابية والمنصات الرقمية. لتثبيت عضويتكم بصفة نهائية يرجى التوجه لمقر الأمانة الولائية لدفع الاشتراك السنوي الرمزي (100 دج) واستلام بطاقة الانخراط الورقية الرسمية لتفعيل الحساب نهائياً.
                  </p>
                </div>
              </div>

              {/* Contact Card for Member's Wilaya General Secretary */}
              <div className="w-full lg:w-auto bg-white/95 rounded-2xl p-3 border border-amber-500 shadow-sm flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="text-xs space-y-0.5">
                  <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                    <span>🏛️</span>
                    <span>الأمانة الولائية التابع لها ({currentUser?.wilayaName || (memberWilayaData ? memberWilayaData.name : 'الولاية')}):</span>
                  </div>
                  <div className="font-black text-emerald-950 text-xs flex items-center gap-1">
                    <span>👤</span>
                    <span>الأمين العام الولائي:</span>
                    <span className="text-emerald-800 font-bold">{memberWilayaData?.sgName || 'الأمين العام الولائي'}</span>
                  </div>
                  {memberWilayaData?.phone && (
                    <div className="text-[11px] text-gray-800 font-bold flex items-center gap-1">
                      <span>📞 الهاتف:</span>
                      <a href={`tel:${memberWilayaData.phone}`} className="text-blue-700 hover:underline font-mono font-bold" dir="ltr">
                        {memberWilayaData.phone}
                      </a>
                    </div>
                  )}
                  {memberWilayaData?.headquarters && (
                    <div className="text-[10px] text-gray-600 truncate max-w-[240px]" title={memberWilayaData.headquarters}>
                      <span>📍 المقر: </span>
                      <span>{memberWilayaData.headquarters}</span>
                    </div>
                  )}
                  {memberWilayaData?.email && (
                    <div className="text-[10px] text-gray-600 font-mono truncate max-w-[240px]">
                      <span>✉️ </span>
                      <span>{memberWilayaData.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCardOpen(true)}
                    className="w-full bg-[#006633] hover:bg-[#004d26] text-white text-xs font-black px-3 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>🪪</span>
                    <span>معاينة البطاقة المؤقتة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Modals */}
      <UnifiedLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <MemberRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={handleRegistrationSuccess}
      />

      <DigitalMembershipCardModal
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        member={activeMemberData}
      />

      {/* Direct Add/Edit Modal (National SG Exclusive) */}
      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        defaultCategory={activeCategoryForAdd}
        onTopicAdded={(topic: UnionTopic) => {
          window.dispatchEvent(
            new CustomEvent('snte-switch-portfolio', { detail: { category: topic.category } })
          );
          window.dispatchEvent(new CustomEvent('snte-topic-published'));
          const elem = document.getElementById('unionPortfoliosSection');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Request Publication Modal (Wilaya SGs, Municipal SGs, Coordinators) */}
      <RequestPublicationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        defaultCategory={activeCategoryForAdd}
        onRequestSubmitted={() => {
          loadRequestsCount();
          setIsReviewModalOpen(true);
        }}
      />

      {/* Review & Tracking Modal */}
      <PublicationRequestsReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        currentUser={currentUser}
        onApproveAndPublish={(approvedTopic: UnionTopic) => {
          window.dispatchEvent(
            new CustomEvent('snte-switch-portfolio', { detail: { category: approvedTopic.category } })
          );
          window.dispatchEvent(new CustomEvent('snte-topic-published'));
          loadRequestsCount();
          const elem = document.getElementById('unionPortfoliosSection');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Pending Members Review & Activation Modal */}
      <PendingMembersReviewModal
        isOpen={isPendingMembersOpen}
        onClose={() => {
          setIsPendingMembersOpen(false);
          loadPendingMembersCount();
        }}
        currentUser={currentUser}
        onMemberUpdated={() => {
          refreshUser();
          loadPendingMembersCount();
        }}
      />

      {/* Union Hierarchy & Ladder Modal */}
      <UnionHierarchyModal
        isOpen={isHierarchyOpen}
        onClose={() => setIsHierarchyOpen(false)}
        onOpenLoginWithRole={() => {
          setIsHierarchyOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenRegister={() => {
          setIsHierarchyOpen(false);
          setIsRegisterOpen(true);
        }}
      />
    </>
  );
};
