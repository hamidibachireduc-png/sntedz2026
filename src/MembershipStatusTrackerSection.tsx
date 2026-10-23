import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';

export const MembershipStatusTrackerSection: React.FC = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('');
  const [now, setNow] = useState(Date.now());

  // Update clock every second for live ticking countdown
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
    } catch {
      setMembers(getAllMembersWithSeed());
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('snte-members-updated', handleUpdate);
    window.addEventListener('snte-member-registered', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('snte-members-updated', handleUpdate);
      window.removeEventListener('snte-member-registered', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

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
    return 'pending';
  };

  const counts = {
    all: members.length,
    pending: members.filter((m) => getStatusCategory(m) === 'pending').length,
    active: members.filter((m) => getStatusCategory(m) === 'active').length,
    rejected: members.filter((m) => getStatusCategory(m) === 'rejected').length,
  };

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

  const handleOpenRegister = () => {
    (window as any).openSnteRegister
      ? (window as any).openSnteRegister()
      : window.dispatchEvent(new CustomEvent('snte-open-register'));
  };

  const handleOpenStatusModal = () => {
    (window as any).openSnteMembershipStatus
      ? (window as any).openSnteMembershipStatus()
      : window.dispatchEvent(new CustomEvent('snte-open-membership-status'));
  };

  return (
    <section
      id="membershipStatusSection"
      aria-label="واجهة متابعة حالة طلبات الانخراط"
      className="relative py-16 px-4 sm:px-6 text-white font-['Cairo',sans-serif] overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 39, 18, 0.93), rgba(0, 55, 27, 0.88), rgba(0, 24, 11, 0.95)), url('/assets/aistudio/image_f36486a4.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative Arabesque Border and Glow */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-black mb-3 shadow-lg border border-amber-300">
            <span>🪪</span>
            <span>بوابة الاستعلام ومتابعة العضوية الرسمية S.N.T.E</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            فضاء متابعة حالة طلبات الانخراط للمنخرطين الجدد
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-3 leading-relaxed max-w-2xl mx-auto">
            تابع وضعية عضويتك بصفة لحظية (قيد الانتظار ⏳، مقبول ✅، مرفوض ❌) مع تنبيهات العد التنازلي التفاعلية لتاريخ انتهاء صلاحية الأسبوع التجريبي لاستلام البطاقة الورقية وسداد اشتراك 100 دج.
          </p>
        </div>

        {/* Search & Status Quick Filter Card */}
        <div className="bg-black/45 backdrop-blur-md rounded-3xl border border-emerald-400/30 p-4 sm:p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم التعريف الوطني NIN (18 رقماً)، رقم البطاقة (SNTE-2026-XXXX)، أو الاسم..."
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/10 border-2 border-emerald-400/40 text-white placeholder-emerald-200/60 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all text-right shadow-inner"
              />
              <span className="absolute right-3.5 top-3 text-lg text-amber-300">🔎</span>
            </div>

            {/* Wilaya Filter Dropdown */}
            <select
              value={selectedWilayaFilter}
              onChange={(e) => setSelectedWilayaFilter(e.target.value)}
              className="w-full sm:w-56 py-3 px-3.5 rounded-2xl bg-[#00371b] border-2 border-emerald-400/40 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
            >
              <option value="">جميع الولايات (الـ 72)</option>
              {WILAYAS_LIST.map((w) => (
                <option key={w.code} value={w.code} className="bg-slate-900 text-white">
                  {w.code} - ولاية {w.name}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>🪪</span>
                <span>تسجيل انخراط جديد</span>
              </button>
            </div>
          </div>

          {/* Filter Pills with Counts */}
          <div className="mt-5 pt-4 border-t border-emerald-500/20 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
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
              <span>الكل</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'all' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
              }`}>
                {counts.all}
              </span>
            </button>
          </div>
        </div>

        {/* Grid of Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMembers.slice(0, 6).map((member) => {
            const statusCat = getStatusCategory(member);
            const countdown = getTimeRemaining(member.temporaryExpiresAt);
            const wilayaObj = WILAYAS_LIST.find(
              (w) => String(w.code).padStart(2, '0') === String(member.wilayaCode).padStart(2, '0')
            );

            return (
              <div
                key={member.id}
                className="bg-white/95 rounded-3xl p-5 border-2 border-emerald-400/50 shadow-xl text-slate-900 transition-all hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-xs border ${
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
                        <h4 className="font-black text-base text-gray-950">
                          {member.fullName}
                        </h4>
                        <div className="text-[11px] text-gray-600 font-medium">
                          ولاية {member.wilayaName} ({member.wilayaCode}) • {member.institutionName}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0">
                      {member.membershipCardNo}
                    </span>
                  </div>

                  {/* Body Countdown / Status Notice */}
                  {statusCat === 'pending' && (
                    <div className="mt-3.5 space-y-2.5">
                      {/* Live Countdown Box */}
                      <div
                        className={`p-3 rounded-2xl border text-xs ${
                          countdown.isExpired
                            ? 'bg-red-50 border-red-300 text-red-950'
                            : countdown.totalHours <= 48
                            ? 'bg-amber-50 border-amber-400 text-amber-950'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-black flex items-center gap-1">
                            <span>{countdown.isExpired ? '⚠️' : '⏳'}</span>
                            <span>
                              {countdown.isExpired
                                ? 'انتهت فترة الأسبوع المؤقتة'
                                : countdown.totalHours <= 48
                                ? '⚠️ تنبيه استعجالي: اقتراب انتهاء المهلة'
                                : 'فترة الولوج التجريبي المؤقت (أسبوع)'}
                            </span>
                          </span>
                          {!countdown.isExpired && (
                            <div className="font-mono font-bold text-[11px] text-emerald-900">
                              {countdown.days} ي : {countdown.hours} س : {countdown.minutes} د : {countdown.seconds} ث
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-gray-700">
                          تاريخ الانتهاء: <strong>{formatExpiryDate(member.temporaryExpiresAt)}</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        📍 <strong>الخطوة القادمة:</strong> دفع الاشتراك السنوي الرمزي (100 دج) واستلام البطاقة الورقية الرسمية من الأمانة الولائية بولاية {member.wilayaName}.
                      </p>
                    </div>
                  )}

                  {statusCat === 'active' && (
                    <div className="mt-3.5 bg-emerald-50 rounded-2xl p-3 border border-emerald-300 text-xs text-emerald-950">
                      <div className="font-black flex items-center gap-1.5 mb-1">
                        <span>✅</span>
                        <span>عضوية رسمية دائمة ومثبتة</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        تم تسديد اشتراك 100 دج واستلام البطاقة الورقية الرسمية من الأمانة الولائية.
                      </p>
                    </div>
                  )}

                  {statusCat === 'rejected' && (
                    <div className="mt-3.5 bg-red-50 rounded-2xl p-3 border border-red-300 text-xs text-red-950">
                      <div className="font-black flex items-center gap-1.5 mb-1">
                        <span>❌</span>
                        <span>طلب غير معتمد أو منتهي المهلة</span>
                      </div>
                      <p className="text-[11px] text-red-900">
                        {member.rejectionReason || 'انقضاء مهلة الأسبوع دون سداد الاشتراك واقتناء البطاقة الورقية.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                  {wilayaObj?.phone ? (
                    <a
                      href={`tel:${wilayaObj.phone}`}
                      className="text-blue-700 hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>📞 اتصال:</span>
                      <span dir="ltr">{wilayaObj.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-500">NIN: {member.nationalId}</span>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenStatusModal}
                    className="text-[#006633] hover:text-[#004d26] font-black text-xs hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>عرض التفاصيل الكاملة</span>
                    <span>←</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All & Full Tracker Action Banner */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleOpenStatusModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-emerald-950 font-black text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 border border-amber-300"
          >
            <span>🔎</span>
            <span>فتح نافذة الاستعلام الشامل وتتبع كافة طلبات الانخراط</span>
          </button>
        </div>
      </div>
    </section>
  );
};
