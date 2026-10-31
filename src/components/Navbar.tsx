import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Bell,
  LogOut,
  Sliders,
  FileText,
  Send,
  CreditCard,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setActiveModal,
    publicationRequests,
    assemblyPVs,
    restoreDefaultDatabase,
    exportDatabaseJSON,
  } = useDatabase();

  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Pending requests count for notifications
  const pendingRequests = publicationRequests.filter((r) => r.status === 'قيد الدراسة');

  return (
    <header className="w-full bg-[#03230f] border-b border-[#0f4d24] text-white px-3 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Right side: Syndicate Title & Emblem */}
        <div className="flex items-center gap-3 order-1">
          {/* Emblem / Logo */}
          <div className="relative group cursor-pointer" onClick={() => setActiveModal('about')}>
            <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-emerald-400 shadow-md flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#007a3d" strokeWidth="3" />
                <path d="M 50,5 A 45,45 0 0,1 50,95 A 45,45 0 0,1 50,5 Z" fill="#007a3d" opacity="0.15" />
                {/* Crescent and Star in Algerian Red */}
                <path
                  d="M 52,28 A 22,22 0 1,0 52,72 A 18,18 0 1,1 52,28 Z"
                  fill="#d62b2b"
                />
                <polygon
                  points="55,42 57,48 63,48 58,52 60,58 55,54 50,58 52,52 47,48 53,48"
                  fill="#d62b2b"
                />
                {/* Book & Torch */}
                <path d="M 32,68 Q 50,60 68,68 L 68,78 Q 50,70 32,78 Z" fill="#eab308" stroke="#854d0e" strokeWidth="1" />
                <path d="M 48,45 L 52,45 L 51,62 L 49,62 Z" fill="#f97316" />
                <ellipse cx="50" cy="43" rx="3" ry="5" fill="#ef4444" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white hover:text-emerald-300 transition-colors cursor-pointer" onClick={() => setActiveModal(null)}>
                النقابة الوطنية لعمال التربية S.N.T.E
              </h1>
              <span className="bg-[#0e4823] text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-inner">
                البوابة المركزية
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium hidden sm:block">
              الجمهورية الجزائرية الديمقراطية الشعبية • الاعتماد الوزاري 24/90
            </p>
          </div>
        </div>

        {/* Center: Action Buttons (Matches screenshot) */}
        <div className="flex items-center flex-wrap gap-2 order-3 lg:order-2">
          {/* انخراطات الولاية (Cyan Button) */}
          <button
            onClick={() => setActiveModal('memberships')}
            className="flex items-center gap-1.5 bg-[#0e8a75] hover:bg-[#0c7563] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all border border-cyan-300/30 active:scale-95"
            title="إدارة بطاقات وسجلات الانخراط الولائية"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-200" />
            <span>انخراطات الولاية</span>
          </button>

          {/* طلب ترخيص بالنشر (Yellow/Gold Button) */}
          <button
            onClick={() => setActiveModal('publishing')}
            className="flex items-center gap-1.5 bg-[#e5a00d] hover:bg-[#c88b0a] text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all border border-amber-200/50 active:scale-95"
            title="تقديم ومتابعة تراخيص النشر والبيانات"
          >
            <Send className="w-3.5 h-3.5 text-stone-900" />
            <span>طلب ترخيص بالنشر</span>
            {pendingRequests.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* استعادة قاعدة البيانات (Special Recovered Database Button) */}
          <button
            onClick={() => setActiveModal('db-restore')}
            className="flex items-center gap-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/50 shadow-sm transition-all hover:scale-105"
            title="استرجاع وتصدير قاعدة البيانات ومزامنتها"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>قاعدة البيانات (مستعادة)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* Left side: User Control & Logout & Bell */}
        <div className="flex items-center gap-2 order-2 lg:order-3">
          {/* لوحة التحكم (الأستاذ عوايشية طارق) */}
          <button
            onClick={() => setActiveModal('profile')}
            className="flex items-center gap-2 bg-[#0d592c] hover:bg-[#116e37] text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-sm hover:shadow transition-all group"
            title="الملف الشخصي والتحكم الإداري"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></span>
            <span>لوحة التحكم ({currentUser.name})</span>
            <Sliders className="w-3.5 h-3.5 text-amber-300 opacity-80 group-hover:opacity-100" />
          </button>

          {/* تسجيل الخروج (Red Button) */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 bg-[#d9222a] hover:bg-[#b81820] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:shadow transition-all border border-red-400/40 active:scale-95"
            title="تسجيل الخروج الآمن"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="p-1.5 rounded-full bg-[#0a3e1c] hover:bg-[#0e5226] text-amber-300 border border-emerald-600/50 transition-colors relative"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            {/* Bell Dropdown */}
            {showBellDropdown && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-[#062c14] border border-emerald-600/60 rounded-xl shadow-2xl p-3 z-50 text-right animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-700/50 mb-2">
                  <span className="text-xs font-black text-amber-300">الإشعارات الإدارية</span>
                  <span className="text-[10px] text-emerald-300/70">منظومة S.N.T.E</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-[#0b3d1c] border border-emerald-700/30 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">استعادة قاعدة البيانات بنجاح</p>
                      <p className="text-[11px] text-emerald-200/80">
                        تمت مزامنة 69 ولاية وجميع محاضر الجمعيات العامة.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0b3d1c] border border-emerald-700/30 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">طلب ترخيص بالنشر جديد</p>
                      <p className="text-[11px] text-emerald-200/80">
                        ولاية الجلفة أودعت بياناً نقابياً بانتظار مصادقة المكتب الوطني.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBellDropdown(false);
                    setActiveModal('publishing');
                  }}
                  className="w-full mt-3 text-center text-xs text-amber-300 hover:text-amber-200 py-1 bg-[#09411d] rounded border border-emerald-600/40"
                >
                  عرض جميع الطلبات والتنبيهات
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#062c14] border-2 border-red-500/60 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl animate-in zoom-in-95">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-white mb-2">تسجيل الخروج من البوابة</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-5">
              هل ترغب في تسجيل الخروج من جلسة القيادة المركزية الحالية للأستاذ عوايشية طارق؟ بياناتك وقاعدة البيانات محفوظة محلياً.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  alert('تم حفظ الجلسة. يمكنك العودة في أي وقت دون فقدان البيانات.');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                تأكيد الخروج
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
