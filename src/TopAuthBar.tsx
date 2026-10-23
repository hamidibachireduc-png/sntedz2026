import React, { useState, useEffect, useRef } from 'react';
import { UnifiedLoginModal } from './UnifiedLoginModal';
import { MemberRegistrationModal } from './MemberRegistrationModal';
import { DigitalMembershipCardModal, MemberData } from './DigitalMembershipCardModal';
import { AddTopicModal } from './AddTopicModal';
import { RequestPublicationModal } from './RequestPublicationModal';
import { PublicationRequestsReviewModal } from './PublicationRequestsReviewModal';
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
  const [activeCategoryForAdd, setActiveCategoryForAdd] = useState<TopicCategory>('union_bag');
  const [isPortfoliosDropdownOpen, setIsPortfoliosDropdownOpen] = useState(false);
  const [activeMemberData, setActiveMemberData] = useState<MemberData | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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
            status: 'نشط',
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

    // Listen to external open requests from anywhere in the app
    const handleOpenLogin = () => setIsLoginOpen(true);
    const handleOpenRegister = () => setIsRegisterOpen(true);
    const handleOpenCard = () => {
      refreshUser();
      setIsCardOpen(true);
    };

    window.addEventListener('snte-open-login', handleOpenLogin);
    window.addEventListener('snte-open-register', handleOpenRegister);
    window.addEventListener('snte-open-member-card', handleOpenCard);
    window.addEventListener('snte-topic-published', loadRequestsCount);
    window.addEventListener('storage', () => {
      refreshUser();
      loadRequestsCount();
    });

    (window as any).openSnteLogin = handleOpenLogin;
    (window as any).openSnteRegister = handleOpenRegister;
    (window as any).openSnteCard = handleOpenCard;

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
    // Scroll to section
    const elem = document.getElementById('unionPortfoliosSection');
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

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'NATIONAL_SG':
        return (
          <span className="bg-amber-400 text-emerald-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>👑</span>
            <span>الأمين العام الوطني</span>
          </span>
        );
      case 'GENERAL_COORDINATOR':
        return (
          <span className="bg-blue-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🌐</span>
            <span>المنسق العام ({currentUser.region || 'الجهوي'})</span>
          </span>
        );
      case 'WILAYA_SG':
        return (
          <span className="bg-emerald-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🏛️</span>
            <span>الأمانة الولائية ({currentUser.wilayaName || currentUser.wilayaCode})</span>
          </span>
        );
      case 'MEMBER':
        return (
          <span className="bg-purple-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>🪪</span>
            <span>منخرط ({currentUser.membershipCardNo || 'بطاقة معتمدة'})</span>
          </span>
        );
      default:
        return (
          <span className="bg-gray-800 text-white font-bold text-[11px] px-2 py-0.5 rounded-full">
            {currentUser.role}
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

          {/* Center Navigation: Dropdown Menu for the 6 new sections */}
          <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
            {/* The Dropdown Menu (القوائم المنسدلة للأقسام الستة) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPortfoliosDropdownOpen(!isPortfoliosDropdownOpen)}
                className="bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-amber-400/30 transition-all cursor-pointer"
              >
                <span>📂</span>
                <span>الحقائب والنشاطات والمنصات</span>
                <span className="text-[10px]">▼</span>
              </button>

              {/* Dropdown Items List */}
              {isPortfoliosDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 text-right text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-black text-[#006633] bg-emerald-50/60">
                    أقسام الحقائب والمنصات النقابية
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
    </>
  );
};
