import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';

interface MembershipStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenCard?: (member: MemberData) => void;
  onOpenLogin?: () => void;
}

export const MembershipStatusModal: React.FC<MembershipStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenCard,
  onOpenLogin,
}) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('');
  const [now, setNow] = useState(Date.now());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Update clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      setCurrentUser(u);

      const all = getAllMembersWithSeed();
      setMembers(all);

      // If current user is a member and hasn't searched yet, prefill search with their NIN or card number
      if (u && (u.role === 'MEMBER' || u.level === 'member') && !searchQuery) {
        if (u.nationalId) setSearchQuery(u.nationalId);
        else if (u.membershipCardNo) setSearchQuery(u.membershipCardNo);
      }
    } catch {
      setMembers(getAllMembersWithSeed());
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Countdown calculations
  const getTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) {
      return { isExpired: false, days: 7, hours: 0, minutes: 0, seconds: 0, totalHours: 168 };
    }
    const diff = expiresAt - now;
    if (diff <= 0) {
      return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    return { isExpired: false, days, hours, minutes, seconds, totalHours };
  };

  const formatExpiryDate = (expiresAt?: number) => {
    if (!expiresAt) return 'خلال 7 أيام من تاريخ التسجيل';
    try {
      const d = new Date(expiresAt);
      return d.toLocaleDateString('ar-DZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return new Date(expiresAt).toLocaleString();
    }
  };

  const getStatusCategory = (m: MemberData): 'pending' | 'active' | 'rejected' => {
    if (m.membershipStatus === 'rejected') return 'rejected';
    if (m.membershipStatus === 'active' || m.duesPaid) return 'active';
    return 'pending'; // default temporary pending
  };

  const counts = {
    all: members.length,
    pending: members.filter((m) => getStatusCategory(m) === 'pending').length,
    active: members.filter((m) => getStatusCategory(m) === 'active').length,
    rejected: members.filter((m) => getStatusCategory(m) === 'rejected').length,
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const status = getStatusCategory(m);
    if (activeTab !== 'all' && status !== activeTab) return false;
    if (selectedWilayaFilter && String(m.wilayaCode) !== selectedWilayaFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        m.fullName?.toLowerCase().includes(q) ||
        m.membershipCardNo?.toLowerCase().includes(q) ||
        m.nationalId?.includes(q) ||
        m.phone?.includes(q) ||
        m.institutionName?.toLowerCase().includes(q) ||
        m.wilayaName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isWilayaSG = currentUser?.role === 'WILAYA_SG';

  // Admin action handler: activate / reject directly
  const handleAdminStatusChange = (
    memberId: string,
    newStatus: 'active' | 'rejected',
    reason?: string
  ) => {
    try {
      const updated = members.map((m) => {
        if (m.id === memberId) {
          if (newStatus === 'active') {
            return {
              ...m,
              membershipStatus: 'active' as const,
              duesPaid: true,
              status: 'نشط (عضوية دائمة معتمدة)',
              activatedBy: isNationalSG
                ? 'الأمين العام الوطني (الأستاذ قويدر يحياوي)'
                : `الأمانة الولائية (${currentUser?.wilayaName || ''})`,
              activatedAt: new Date().toISOString().split('T')[0],
            };
          } else {
            return {
              ...m,
              membershipStatus: 'rejected' as const,
              duesPaid: false,
              status: 'مرفوض',
              rejectionReason:
                reason ||
                'انقضاء مهلة الأسبوع دون تسديد مبلغ الاشتراك واقتناء البطاقة الورقية.',
            };
          }
        }
        return m;
      });

      setMembers(updated);
      localStorage.setItem('snte_members_v3', JSON.stringify(updated));

      // If current user is this member, update snte_user
      if (currentUser?.id === memberId) {
        const updatedUser = updated.find((m) => m.id === memberId);
        if (updatedUser) {
          localStorage.setItem(
            'snte_user',
            JSON.stringify({ ...currentUser, ...updatedUser })
          );
        }
      }

      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      setActionNotice(
        newStatus === 'active'
          ? '✅ تم قبول وتثبيت العضوية وتأكيد سداد 100 دج واقتناء البطاقة الورقية بنجاح!'
          : '❌ تم تحويل حالة الطلب إلى مرفوض.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('خطأ أثناء التحديث: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div
        className="relative rounded-3xl shadow-2xl max-w-5xl w-full border-2 border-emerald-500/50 overflow-hidden my-auto max-h-[95vh] flex flex-col text-right text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 39, 18, 0.94), rgba(0, 50, 24, 0.92), rgba(0, 25, 11, 0.96)), url('/assets/aistudio/image_f36486a4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top Header with official emblem, banner visual & close button */}
        <div className="border-b border-emerald-500/30 p-4 sm:p-6 bg-gradient-to-r from-[#002b15]/90 via-[#004d26]/80 to-[#002b15]/90 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/aistudio/image_f36486a4.png"
                  alt="S.N.T.E Emblem"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Fallback to official web logo
                    (e.target as HTMLImageElement).src =
                      'https://l.top4top.io/p_37988hwfa0.png';
                  }}
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-3 py-0.5 rounded-full text-[11px] font-black shadow-xs mb-1">
                  <span>🏛️</span>
                  <span>النقابة الوطنية لعمال التربية والتكوين S.N.T.E</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                  متابعة حالة طلبات الانخراط للمنخرطين الجدد
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-0.5">
                  استعلام فوري وتتبع مباشر لوضعية العضوية (قيد الانتظار ⏳، مقبول ✅، مرفوض ❌) ومتابعة العد التنازلي للمهلة المؤقتة.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all cursor-pointer border border-white/20 shrink-0"
              title="إغلاق النافذة"
            >
              ✕
            </button>
          </div>

          {actionNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold animate-pulse text-center">
              {actionNotice}
            </div>
          )}
        </div>

        {/* Search, Filter Bar and Stats Summary */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-black/40 backdrop-blur-sm shrink-0 space-y-4">
          {/* Quick Search Input */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم التعريف الوطني NIN (18 رقماً)، رقم البطاقة (SNTE-2026-XXXX)، أو الاسم..."
                className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-white/10 border-2 border-emerald-400/40 text-white placeholder-emerald-200/60 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all text-right shadow-inner"
              />
              <span className="absolute right-3.5 top-2.5 text-lg text-amber-300">🔎</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-xs text-gray-400 hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Wilaya Filter Dropdown */}
            <select
              value={selectedWilayaFilter}
              onChange={(e) => setSelectedWilayaFilter(e.target.value)}
              className="w-full sm:w-52 py-2.5 px-3 rounded-2xl bg-[#00371b] border-2 border-emerald-400/40 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
            >
              <option value="">جميع الولايات (الـ 72)</option>
              {WILAYAS_LIST.map((w) => (
                <option key={w.code} value={w.code} className="bg-slate-900 text-white">
                  {w.code} - ولاية {w.name}
                </option>
              ))}
            </select>

            {/* Quick Button for Logged in Member */}
            {currentUser && (currentUser.role === 'MEMBER' || currentUser.level === 'member') && (
              <button
                type="button"
                onClick={() => {
                  if (currentUser.nationalId) setSearchQuery(currentUser.nationalId);
                  else if (currentUser.membershipCardNo) setSearchQuery(currentUser.membershipCardNo);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                title="عرض حالة ملف انخراطي المباشر"
              >
                <span>👤</span>
                <span>ملفي المسجل</span>
              </button>
            )}
          </div>

          {/* Status Filter Tabs (الكل، قيد الانتظار، مقبول، مرفوض) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <span>📋</span>
              <span>جميع الطلبات</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'all' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
              }`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
            >
              <span className="animate-spin text-sm">⏳</span>
              <span>قيد الانتظار (أسبوع مؤقت)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'pending' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-amber-300'
              }`}>
                {counts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'active'
                  ? 'bg-emerald-400 text-emerald-950 border-emerald-300 shadow-md scale-102'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border-emerald-400/40'
              }`}
            >
              <span>✅</span>
              <span>مقبول (عضوية دائمة مثبتة)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'active' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
              }`}>
                {counts.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'rejected'
                  ? 'bg-red-500 text-white border-red-300 shadow-md scale-102'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/40'
              }`}
            >
              <span>❌</span>
              <span>مرفوض (بحاجة لتسوية)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'rejected' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-red-300'
              }`}>
                {counts.rejected}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area: Members Cards with Rich Status Badges & Alerts */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh] scrollbar-thin">
          {filteredMembers.length === 0 ? (
            <div className="bg-black/40 rounded-3xl p-8 text-center border border-white/10 my-4">
              <span className="text-5xl block mb-3">🔍</span>
              <h4 className="text-base sm:text-lg font-black text-amber-300">
                لم يتم العثور على طلبات انخراط تطابق معايير البحث
              </h4>
              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                يرجى التأكد من كتابة رقم التعريف الوطني NIN أو رقم بطاقة الانخراط بشكل صحيح، أو الضغط على زر تسجيل انخراط جديد.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                    setSelectedWilayaFilter('');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                >
                  إعادة تعيين البحث
                </button>
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black shadow-md transition-all"
                  >
                    تسجيل انخراط جديد الآن
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const statusCat = getStatusCategory(member);
              const countdown = getTimeRemaining(member.temporaryExpiresAt);
              const wilayaObj = WILAYAS_LIST.find(
                (w) => String(w.code).padStart(2, '0') === String(member.wilayaCode).padStart(2, '0')
              );

              return (
                <div
                  key={member.id}
                  className={`relative rounded-3xl p-4 sm:p-6 border-2 shadow-xl backdrop-blur-md transition-all text-slate-900 bg-white/95 overflow-hidden ${
                    statusCat === 'pending'
                      ? countdown.isExpired
                        ? 'border-red-500 shadow-red-900/20'
                        : countdown.totalHours <= 48
                        ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-amber-900/30'
                        : 'border-amber-400'
                      : statusCat === 'active'
                      ? 'border-emerald-500 shadow-emerald-900/20'
                      : 'border-red-500 shadow-red-900/20'
                  }`}
                >
                  {/* Top Header of Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-sm border ${
                          statusCat === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : statusCat === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {statusCat === 'pending' ? '⏳' : statusCat === 'active' ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base sm:text-lg text-gray-900">
                            {member.fullName}
                          </h3>
                          {statusCat === 'pending' && (
                            <span className="bg-amber-500 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <span>⏳</span>
                              <span>قيد الانتظار (أسبوع مؤقت)</span>
                            </span>
                          )}
                          {statusCat === 'active' && (
                            <span className="bg-emerald-700 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <span>✅</span>
                              <span>مقبول - عضوية دائمة معتمدة</span>
                            </span>
                          )}
                          {statusCat === 'rejected' && (
                            <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                              <span>❌</span>
                              <span>مرفوض - بانتظار تسوية</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2 flex-wrap font-medium">
                          <span>🏛️ ولاية {member.wilayaName} ({member.wilayaCode})</span>
                          <span>•</span>
                          <span>🏫 {member.institutionName}</span>
                          <span>•</span>
                          <span>💼 {member.rank || 'أستاذ'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-left shrink-0">
                      <div className="text-[10px] text-gray-500 font-bold">رقم بطاقة الانخراط:</div>
                      <div className="font-mono font-black text-sm text-[#006633] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        {member.membershipCardNo}
                      </div>
                    </div>
                  </div>

                  {/* Body Content by Status */}

                  {/* 1. STATE: PENDING (عضوية مؤقتة لمدة أسبوع) */}
                  {statusCat === 'pending' && (
                    <div className="mt-4 space-y-3.5">
                      {/* Live Countdown & Expiry Banner */}
                      <div
                        className={`p-3.5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
                          countdown.isExpired
                            ? 'bg-red-50 border-red-300 text-red-950'
                            : countdown.totalHours <= 48
                            ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl animate-pulse">
                            {countdown.isExpired ? '⚠️' : countdown.totalHours <= 48 ? '🚨' : '⏳'}
                          </span>
                          <div>
                            <div className="font-black text-xs sm:text-sm">
                              {countdown.isExpired
                                ? 'انتهت مهلة الأسبوع التجريبي لهذا الطلب'
                                : countdown.totalHours <= 48
                                ? `تنبيه استعجالي: اقتراب انتهاء المهلة (متبقي أقل من ${countdown.totalHours} ساعة)`
                                : `فترة الولوج التجريبي المؤقت (أسبوع الاستفادة من الخدمات)`}
                            </div>
                            <div className="text-[11px] text-gray-700 font-medium mt-0.5">
                              📅 تاريخ انتهاء الصلاحية:{' '}
                              <span className="font-bold text-gray-900">
                                {formatExpiryDate(member.temporaryExpiresAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ticking Live Digital Countdown Clock */}
                        {!countdown.isExpired ? (
                          <div className="flex items-center gap-1.5 font-mono text-center shrink-0">
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                              <span className="block text-sm sm:text-base font-black text-emerald-900 leading-none">
                                {countdown.days}
                              </span>
                              <span className="text-[9px] font-sans text-gray-500 font-bold">يوم</span>
                            </div>
                            <span className="text-gray-400 font-bold">:</span>
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                              <span className="block text-sm sm:text-base font-black text-emerald-900 leading-none">
                                {String(countdown.hours).padStart(2, '0')}
                              </span>
                              <span className="text-[9px] font-sans text-gray-500 font-bold">ساعة</span>
                            </div>
                            <span className="text-gray-400 font-bold">:</span>
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                              <span className="block text-sm sm:text-base font-black text-emerald-900 leading-none">
                                {String(countdown.minutes).padStart(2, '0')}
                              </span>
                              <span className="text-[9px] font-sans text-gray-500 font-bold">دقيقة</span>
                            </div>
                            <span className="text-gray-400 font-bold">:</span>
                            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                              <span className="block text-sm sm:text-base font-black text-red-600 leading-none">
                                {String(countdown.seconds).padStart(2, '0')}
                              </span>
                              <span className="text-[9px] font-sans text-gray-500 font-bold">ثانية</span>
                            </div>
                          </div>
                        ) : (
                          <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shrink-0">
                            منتهية الصلاحية
                          </span>
                        )}
                      </div>

                      {/* Instructions for Temporary Member */}
                      <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <span>ℹ️</span>
                          <span>إرشادات تثبيت العضوية النهائية:</span>
                        </div>
                        <p>
                          يستفيد المنخرط الجديد بصفة مؤقتة لمدة أسبوع كامل من كافة خدمات البوابة، الحقائب النقابية والتربوية والمنصات. لتثبيت العضوية بشكل دائم والحصول على الرقم الوطني المعتمد، يرجى التوجه لمقر الأمانة الولائية لدفع الاشتراك السنوي الرمزي (100 دج) واستلام البطاقة الورقية الرسمية.
                        </p>
                      </div>

                      {/* Wilaya SG Contact Card */}
                      {wilayaObj && (
                        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="text-[10px] font-bold text-gray-500">
                              الأمانة الولائية المختصة بالمعالجة والتسليم:
                            </div>
                            <div className="font-black text-gray-900 mt-0.5">
                              👤 الأمين العام الولائي: {wilayaObj.sgName || 'الأمين العام الولائي'}
                            </div>
                            {wilayaObj.headquarters && (
                              <div className="text-[11px] text-gray-600">
                                📍 المقر: {wilayaObj.headquarters}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {wilayaObj.phone && (
                              <a
                                href={`tel:${wilayaObj.phone}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                              >
                                <span>📞</span>
                                <span>اتصال ({wilayaObj.phone})</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. STATE: ACTIVE (مقبول - عضوية دائمة مثبتة) */}
                  {statusCat === 'active' && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🎉</span>
                          <div>
                            <h4 className="font-black text-sm text-emerald-950">
                              تم قبول الطلب وتثبيت العضوية الرسمية بنجاح
                            </h4>
                            <p className="text-xs text-emerald-800 mt-0.5">
                              تم تأكيد تسديد الاشتراك السنوي (100 دج) واستلام بطاقة الانخراط الورقية المعتمدة من الأمانة الولائية.
                            </p>
                            {member.activatedBy && (
                              <div className="text-[11px] text-emerald-900/80 font-bold mt-1">
                                ✍️ تم التفعيل بواسطة: {member.activatedBy}{' '}
                                {member.activatedAt && `بتاريخ ${member.activatedAt}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-emerald-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1">
                          <span>✓</span>
                          <span>اشتراك 100 دج مسدد</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. STATE: REJECTED (مرفوض) */}
                  {statusCat === 'rejected' && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-red-50 rounded-2xl p-4 border border-red-300">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl text-red-600">❌</span>
                          <div>
                            <h4 className="font-black text-sm text-red-950">
                              حالة الطلب: مرفوض / بحاجة لتسوية وضعية
                            </h4>
                            <p className="text-xs text-red-900 mt-1 leading-relaxed">
                              <span className="font-bold">سبب الرفض: </span>
                              {member.rejectionReason ||
                                'انقضاء مهلة الأسبوع دون تسديد مبلغ الاشتراك (100 دج) ولم يتم اقتناء بطاقة الانخراط الورقية من الأمانة الولائية.'}
                            </p>
                            <p className="text-[11px] text-red-800 mt-2 font-medium">
                              💡 لتسوية الوضعية، يرجى مراجعة الأمانة الولائية لولايتكم أو التقدم بطلب تسجيل جديد مع تقديم الوثائق المطلوبة.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions of Card */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                      <span>NIN: {member.nationalId || '---'}</span>
                      <span>•</span>
                      <span>تاريخ الطلب: {member.joinDate || '2026-10'}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Action for Members to View Digital Card */}
                      {onOpenCard && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCard(member);
                          }}
                          className={`font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            statusCat === 'active'
                              ? 'bg-[#006633] hover:bg-[#004d26] text-white'
                              : 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                          }`}
                        >
                          <span>🪪</span>
                          <span>{statusCat === 'active' ? 'معاينة البطاقة الرسمية' : 'معاينة البطاقة المؤقتة'}</span>
                        </button>
                      )}

                      {/* Admin Controls (National SG or Wilaya SG) */}
                      {(isNationalSG || isWilayaSG) && statusCat === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminStatusChange(member.id, 'active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            title="تأكيد سداد 100 دج وتثبيت العضوية"
                          >
                            <span>✓</span>
                            <span>قبول وتثبيت (100 دج)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const r = prompt(
                                'سبب رفض العضوية:',
                                'عدم تسديد مبلغ الاشتراك (100 دج) وانقضاء مهلة الأسبوع دون اقتناء البطاقة الورقية'
                              );
                              if (r) handleAdminStatusChange(member.id, 'rejected', r);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                            title="رفض الطلب"
                          >
                            <span>✕</span>
                            <span>رفض</span>
                          </button>
                        </div>
                      )}

                      {statusCat === 'rejected' && onOpenRegister && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenRegister();
                          }}
                          className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🔄</span>
                          <span>إعادة تقديم طلب جديد</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-emerald-500/30 bg-black/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-emerald-200/90 font-medium text-center sm:text-right">
            <span>💡 للاستفسار أو تقديم طعن، يرجى الاتصال بالأمانة الولائية لولايتكم أو الأمانة الوطنية S.N.T.E.</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                🪪 تسجيل انخراط جديد
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-white/20"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
