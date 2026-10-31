import React, { useState, useEffect, useRef } from 'react';
import { UnifiedLoginModal } from './UnifiedLoginModal';
import { MinutesPlatformModal } from './MinutesPlatformModal';
import { MemberRegistrationModal } from './MemberRegistrationModal';
import { DigitalMembershipCardModal, MemberData } from './DigitalMembershipCardModal';
import { AddTopicModal } from './AddTopicModal';
import { RequestPublicationModal } from './RequestPublicationModal';
import { PublicationRequestsReviewModal } from './PublicationRequestsReviewModal';
import { PendingMembersReviewModal } from './PendingMembersReviewModal';
import { UnionHierarchyModal } from './UnionHierarchyModal';
import { UnionAboutModal } from './UnionAboutModal';
import { AdminNotificationsModal } from './AdminNotificationsModal';
import { MembershipStatusModal } from './MembershipStatusModal';
import { NationalSGThemeCustomizerModal } from './NationalSGThemeCustomizerModal';
import { VirtualMeetingModal } from './VirtualMeetingModal';
import { UserProfileModal } from './UserProfileModal';
import { UnionStatutesModal } from './UnionStatutesModal';
import { ContactSupportComponent } from './ContactSupportComponent';
import {
  SnteNotification,
  generateDynamicNotifications,
  playNotificationChime,
} from './notificationsSystem';
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
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPendingMembersOpen, setIsPendingMembersOpen] = useState(false);
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatutesOpen, setIsStatutesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [notifications, setNotifications] = useState<SnteNotification[]>([]);
  const [toastNotification, setToastNotification] = useState<SnteNotification | null>(null);
  const [activeCategoryForAdd, setActiveCategoryForAdd] = useState<TopicCategory>('union_bag');
  const [isPortfoliosDropdownOpen, setIsPortfoliosDropdownOpen] = useState(false);
  const [activeMemberData, setActiveMemberData] = useState<MemberData | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingMembersCount, setPendingMembersCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
      } else if (currentUser?.role === 'GENERAL_COORDINATOR' || currentUser?.level === 'coordinator') {
        const covered: string[] = currentUser?.wilayasCovered || [];
        const normCovered = covered.map((c: string) => String(c).padStart(2, '0'));
        const count = all.filter(
          (m) =>
            (normCovered.includes(String(m.wilayaCode).padStart(2, '0')) || covered.includes(String(m.wilayaCode))) &&
            (m.membershipStatus === 'temporary_pending' || (!m.membershipStatus && !m.duesPaid))
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

  const refreshUser = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        setCurrentUser(u);
        if (u.role === 'MEMBER' || u.level === 'member') {
          setActiveMemberData({
            id: u.id,
            nationalId: u.nationalId || '198416010045230001',
            socialSecurityNo: u.socialSecurityNo || '168409123456',
            membershipCardNo: u.membershipCardNo || 'SNTE-2026-0001',
            fullName: u.name || u.fullName || 'المنخرط',
            birthDate: u.birthDate || '1985-05-15',
            birthPlace: u.birthPlace || u.municipalName || 'الجزائر',
            email: u.email,
            phone: u.phone,
            wilayaCode: u.wilayaCode || '16',
            wilayaName: u.wilayaName || 'الجزائر',
            municipalName: u.municipalName || 'الوسط',
            institutionName: u.institutionName || 'مؤسسة تربوية',
            rank: u.rank || 'أستاذ',
            workplace: u.workplace || 'المؤسسة',
            hierarchyRole: u.hierarchyRole || 'منخرط',
            avatarUrl: u.avatarUrl || '',
            biometricFingerprintCode: u.biometricFingerprintCode,
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

  const loadNotifications = (triggerAlert = false) => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      if (!u) {
        setNotifications([]);
        return;
      }
      const list = generateDynamicNotifications(u);
      setNotifications(list);
      const unread = list.filter((n) => !n.read);
      if (triggerAlert && unread.length > 0) {
        playNotificationChime();
        setToastNotification(unread[0]);
      }
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    refreshUser();
    loadRequestsCount();
    loadPendingMembersCount();
    loadNotifications(false);

    const handleOpenLogin = () => setIsLoginOpen(true);
    const handleOpenRegister = () => setIsRegisterOpen(true);
    const handleOpenCard = () => {
      refreshUser();
      setIsCardOpen(true);
    };
    const handleOpenPendingMembers = () => setIsPendingMembersOpen(true);
    const handleOpenHierarchy = () => setIsHierarchyOpen(true);
    const handleOpenNotifications = () => setIsNotificationsModalOpen(true);
    const handleOpenStatus = () => setIsStatusModalOpen(true);
    const handleNotifsUpdate = () => loadNotifications(false);
    const handleMemberRegistered = () => {
      refreshUser();
      loadPendingMembersCount();
      loadNotifications(true);
    };

    const handleOpenContact = () => setIsContactOpen(true);

    window.addEventListener('snte-open-login', handleOpenLogin);
    window.addEventListener('snte-open-register', handleOpenRegister);
    window.addEventListener('snte-open-member-card', handleOpenCard);
    window.addEventListener('snte-open-pending-members', handleOpenPendingMembers);
    window.addEventListener('snte-open-hierarchy', handleOpenHierarchy);
    window.addEventListener('snte-open-notifications', handleOpenNotifications);
    window.addEventListener('snte-open-membership-status', handleOpenStatus);
    window.addEventListener('snte-open-contact', handleOpenContact);
    window.addEventListener('snte-notifications-updated', handleNotifsUpdate);
    window.addEventListener('snte-topic-published', loadRequestsCount);
    window.addEventListener('snte-members-updated', () => {
      refreshUser();
      loadPendingMembersCount();
      loadNotifications(false);
    });
    window.addEventListener('snte-member-registered', handleMemberRegistered);
    window.addEventListener('storage', () => {
      refreshUser();
      loadRequestsCount();
      loadPendingMembersCount();
      loadNotifications(false);
    });

    (window as any).openSnteLogin = handleOpenLogin;
    (window as any).openSnteRegister = handleOpenRegister;
    (window as any).openSnteCard = handleOpenCard;
    (window as any).openSntePendingMembers = handleOpenPendingMembers;
    (window as any).openSnteHierarchy = handleOpenHierarchy;
    (window as any).openSnteNotifications = handleOpenNotifications;
    (window as any).openSnteMembershipStatus = handleOpenStatus;
    (window as any).openContactSupport = handleOpenContact;

    const notifTimer = setInterval(() => {
      loadNotifications(false);
    }, 45000);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortfoliosDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(notifTimer);
      window.removeEventListener('snte-open-login', handleOpenLogin);
      window.removeEventListener('snte-open-register', handleOpenRegister);
      window.removeEventListener('snte-open-member-card', handleOpenCard);
      window.removeEventListener('snte-open-pending-members', handleOpenPendingMembers);
      window.removeEventListener('snte-open-hierarchy', handleOpenHierarchy);
      window.removeEventListener('snte-open-notifications', handleOpenNotifications);
      window.removeEventListener('snte-open-membership-status', handleOpenStatus);
      window.removeEventListener('snte-open-contact', handleOpenContact);
      window.removeEventListener('snte-notifications-updated', handleNotifsUpdate);
      window.removeEventListener('snte-topic-published', loadRequestsCount);
      window.removeEventListener('snte-member-registered', handleMemberRegistered);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
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
    window.dispatchEvent(
      new CustomEvent('snte-switch-portfolio', { detail: { category: catKey } })
    );
    const targetId =
      catKey === 'national_acts' || catKey === 'wilaya_acts' || catKey === 'region_acts'
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

  return (
    <>
      <nav
        aria-label="شريط الحساب وتسجيل الدخول والأقسام"
        className="sticky top-0 z-50 bg-[#00371b] text-white border-b-2 border-amber-400 shadow-lg px-3 sm:px-6 py-2.5 font-['Cairo',sans-serif]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
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

          <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
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
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="bg-cyan-700 hover:bg-cyan-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-400"
                  title="لوحة تحكم الأمين العام الوطني لتخصيص الأقسام، المظهر، وتعديل الصور"
                >
                  <span>🎨</span>
                  <span className="hidden sm:inline">لوحة المظهر والصور</span>
                </button>
              </div>
            ) : isWilayaOrRegionalSG ? (
              <div className="flex items-center gap-1.5">
                {(currentUser?.role === 'GENERAL_COORDINATOR' || currentUser?.level === 'coordinator') && (
                  <button
                    type="button"
                    onClick={() => setIsPendingMembersOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                    title={`سجل وقائمة منخرطي الأمانة الجهوية لـ ${currentUser.region || 'الإقليم'}`}
                  >
                    <span>🪪</span>
                    <span>قائمة منخرطي الجهة</span>
                    {pendingMembersCount > 0 && (
                      <span className="bg-amber-300 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                        {pendingMembersCount}
                      </span>
                    )}
                  </button>
                )}
                {currentUser?.role === 'WILAYA_SG' && (
                  <button
                    type="button"
                    onClick={() => setIsPendingMembersOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                    title={`مراجعة طلبات وقائمة منخرطي ولاية ${currentUser.wilayaName || currentUser.wilayaCode}`}
                  >
                    <span>🪪</span>
                    <span>قائمة منخرطي الولاية</span>
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

          <div className="flex items-center gap-2 flex-wrap">
            {currentUser ? (
              <div className="flex items-center gap-2 flex-wrap">
                
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('snte-navigate', { detail: 'admin-stats' }));
                  }}
                  className="bg-[#004d26] hover:bg-[#00381b] text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500"
                  title="لوحة تحكم الأمين العام / الرئيس"
                >
                  <span>لوحة التحكم ({currentUser.name})</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-red-500"
                  title="تسجيل الخروج الفوري من الحساب"
                >
                  <span>تسجيل الخروج</span>
                  <span>🚪</span>
                </button>

                {(isNationalSG || isWilayaOrRegionalSG) && (
                  <button
                    type="button"
                    onClick={() => setIsNotificationsModalOpen(true)}
                    className="relative bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                    title="مركز التنبيهات والإشعارات"
                  >
                    <span className="text-sm">🔔</span>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono border-2 border-[#00371b] animate-bounce shadow-md">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>
                )}

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
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border border-amber-300/40 flex items-center gap-1.5"
                  title="استعلام فوري عن حالة طلب الانخراط للمنخرطين الجدد"
                >
                  <span>🔎</span>
                  <span>حالة طلبي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-[#006633] hover:from-emerald-400 hover:to-[#004d26] text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
                >
                  <span>🔐</span>
                  <span>تسجيل الدخول</span>
                </button>

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

      <div className="bg-emerald-950 border-b border-emerald-800 shadow-inner py-2.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap text-xs font-black">
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>📖</span>
            <span>التعريف بالنقابة</span>
          </button>
          
          {currentUser && (
            <button
              onClick={() => setIsMinutesOpen(true)}
              className="bg-[#d93025] hover:bg-[#b8251c] text-white px-3.5 py-1.5 rounded-full border border-red-300 shadow-xs transition-all cursor-pointer flex items-center gap-1"
              title="إدارة وتعديل وطباعة المحاضر"
            >
              <span>📝</span>
              <span>منصة المحاضر والجمعيات العامة</span>
            </button>
          )}
          
          <button
            onClick={() => handleNavigateToCategory('wilaya_acts')}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🏛️</span>
            <span>النشاطات النقابية</span>
          </button>
          <button
            onClick={() => handleNavigateToCategory('platforms')}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>💼</span>
            <span>الحقائب والمنصات</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('interactive-map-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🗺️</span>
            <span>خريطة الهياكل النقابية</span>
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>⚙️</span>
            <span>تعديل بياناتي</span>
          </button>

          <button
            onClick={() => setIsStatutesOpen(true)}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>📜</span>
            <span>البيانات القانونية والتشريعات</span>
          </button>

          <button
            onClick={() => setIsHierarchyOpen(true)}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🪜</span>
            <span>الدليل النقابي</span>
          </button>
          
          <button
            onClick={() => setIsContactOpen(true)}
            className="bg-[#006633] hover:bg-[#004d26] text-white px-3.5 py-1.5 rounded-full border border-red-500 shadow-xs transition-all cursor-pointer flex items-center gap-1"
            title="اتصل بنا: إرسال استفسار أو طلب دعم مباشر للأمانة الوطنية والولائية"
          >
            <span>📞</span>
            <span>اتصل بنا / الدعم</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('snte-navigate', { detail: 'admin-stats' }));
            }}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-3.5 py-1.5 rounded-full border border-cyan-400 shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>📊</span>
            <span>الإحصائيات الإدارية</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('snte-navigate', { detail: 'admin-annual-report' }));
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-full border border-amber-300 shadow-xs transition-all cursor-pointer flex items-center gap-1 font-black"
            title="عرض تقرير الأداء السنوي للنقابة ومنحنى نمو المنخرطين"
          >
            <span>📈</span>
            <span>تقرير الأداء السنوي</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMeetingOpen(true)}
            className="bg-red-600/90 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border border-red-400/50 shadow-lg transition-all cursor-pointer animate-pulse"
          >
            <span className="text-sm">🎥</span>
            <span>الاجتماع المباشر</span>
          </button>
        </div>
      </div>

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
                    onClick={() => setIsStatusModalOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black px-3 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-amber-600"
                    title="تتبع حالة طلبي والعد التنازلي للمهلة المؤقتة"
                  >
                    <span>🔎</span>
                    <span>تفاصيل طلبي وتنبيه المهلة</span>
                  </button>
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

      <UnifiedLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <MinutesPlatformModal 
        isOpen={isMinutesOpen} 
        onClose={() => setIsMinutesOpen(false)} 
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

      <UnionAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenHierarchy={() => setIsHierarchyOpen(true)}
      />

      <AdminNotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onOpenPendingMembers={() => setIsPendingMembersOpen(true)}
        onOpenReviewRequests={() => setIsReviewModalOpen(true)}
        onRefreshNotifications={() => loadNotifications(false)}
      />

      <MembershipStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onOpenRegister={() => {
          setIsStatusModalOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenCard={(m) => {
          setActiveMemberData(m);
          setIsStatusModalOpen(false);
          setIsCardOpen(true);
        }}
        onOpenLogin={() => {
          setIsStatusModalOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      <UnionStatutesModal
        isOpen={isStatutesOpen}
        onClose={() => setIsStatutesOpen(false)}
      />

      <VirtualMeetingModal isOpen={isMeetingOpen} onClose={() => setIsMeetingOpen(false)} />

      <ContactSupportComponent isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {toastNotification && (
        <aside
          aria-label="إشعار فوري جديد"
          className="fixed top-16 left-4 z-50 max-w-sm bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 backdrop-blur-md flex items-start gap-3 font-['Cairo',sans-serif]"
        >
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h5 className="font-black text-xs text-amber-300 truncate">
                {toastNotification.title}
              </h5>
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer p-0.5"
                title="إغلاق الإشعار"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-gray-200 mt-1 leading-relaxed line-clamp-2">
              {toastNotification.message}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {toastNotification.type.includes('temporary') || toastNotification.type === 'new_member' ? (
                <button
                  type="button"
                  onClick={() => {
                    setToastNotification(null);
                    setIsPendingMembersOpen(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  معالجة وسداد (100 دج)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setToastNotification(null);
                    setIsNotificationsModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  عرض التفاصيل
                </button>
              )}
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="text-[10px] text-gray-400 hover:underline cursor-pointer"
              >
                تجاهل
              </button>
            </div>
          </div>
        </aside>
      )}
      <NationalSGThemeCustomizerModal isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />
    </>
  );
};
