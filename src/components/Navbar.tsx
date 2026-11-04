import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Bell, LogOut, Sliders, FileText, Send, CreditCard,
  Database, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser, setActiveModal, publicationRequests,
  } = useDatabase();

  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // الحالة التي ستتحكم بظهور المنصة ثلاثية الأبعاد فوق التطبيق
  const [activePlatform, setActivePlatform] = useState('');

  const pendingRequests = publicationRequests.filter((r) => r.status === 'قيد الدراسة');

  return (
    <>
      {/* ========================================================= */}
      {/* الشريط العلوي الأصلي الخاص بك مع إضافة أيقونات 3D في المنتصف */}
      {/* ========================================================= */}
      <header className="w-full bg-[#03230f] border-b border-[#0f4d24] text-white px-3 py-2.5 shadow-md relative z-[99999]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* --- يمين: الشعار واسم النقابة --- */}
          <div className="flex items-center gap-3 order-1 w-full md:w-auto">
            <div className="relative group cursor-pointer" onClick={() => setActiveModal('about')}>
              <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-emerald-400 shadow-md flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                {/* SVG الشعار */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#007a3d" strokeWidth="3" />
                  <path d="M 50,5 A 45,45 0 0,1 50,95 A 45,45 0 0,1 50,5 Z" fill="#007a3d" opacity="0.15" />
                  <path d="M 52,28 A 22,22 0 1,0 52,72 A 18,18 0 1,1 52,28 Z" fill="#d62b2b" />
                  <polygon points="55,42 57,48 63,48 58,52 60,58 55,54 50,58 52,52 47,48 53,48" fill="#d62b2b" />
                  <path d="M 32,68 Q 50,60 68,68 L 68,78 Q 50,70 32,78 Z" fill="#eab308" stroke="#854d0e" strokeWidth="1" />
                  <path d="M 48,45 L 52,45 L 51,62 L 49,62 Z" fill="#f97316" />
                  <ellipse cx="50" cy="43" rx="3" ry="5" fill="#ef4444" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {/* زر العودة للرئيسية: يقوم بتفريغ activePlatform لإخفاء الـ iframe */}
                <h1 
                  className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white hover:text-emerald-300 transition-colors cursor-pointer" 
                  onClick={() => { setActiveModal(null); setActivePlatform(''); }}
                >
                  النقابة الوطنية لعمال التربية S.N.T.E
                </h1>
                <span className="bg-[#0e4823] text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-inner">
                  البوابة المركزية
                </span>
              </div>
            </div>
          </div>

          {/* --- وسط: أيقونات 3D + أزرار العمليات (كما في الصورة) --- */}
          <div className="flex flex-wrap items-center justify-center gap-3 order-3 lg:order-2 w-full lg:w-auto">
            
            {/* 1. الأيقونات ثلاثية الأبعاد (جديد) */}
            <div className="flex items-center gap-3 border-l border-emerald-700/50 pl-3">
              {/* زر الناظر */}
              <button 
                onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/nathersnte2026/')} 
                className="group flex flex-col items-center gap-0.5 transition-transform hover:scale-110 active:scale-95"
                title="فتح منصة الناظر"
              >
                <img src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/nather-3d.png?raw=true" alt="الناظر" className="h-9 w-auto rounded-lg drop-shadow-md group-hover:drop-shadow-[0_4px_8px_rgba(255,215,0,0.4)]" />
                <span className="font-['Cairo'] text-[10px] font-bold text-emerald-100">بوابة الناظر</span>
              </button>
              
              {/* زر الأستاذ */}
              <button 
                onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/ostadsntedz2026/')} 
                className="group flex flex-col items-center gap-0.5 transition-transform hover:scale-110 active:scale-95"
                title="فتح منصة الأستاذ"
              >
                <img src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/ostad-3d.png?raw=true" alt="الأستاذ" className="h-9 w-auto rounded-lg drop-shadow-md group-hover:drop-shadow-[0_4px_8px_rgba(255,215,0,0.4)]" />
                <span className="font-['Cairo'] text-[10px] font-bold text-emerald-100">بوابة الأستاذ</span>
              </button>
            </div>

            {/* 2. أزرار العمليات الأصلية */}
            <div className="flex items-center flex-wrap gap-2">
              <button onClick={() => setActiveModal('memberships')} className="flex items-center gap-1.5 bg-[#0e8a75] hover:bg-[#0c7563] text-white text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-300/30 shadow-sm active:scale-95">
                <CreditCard className="w-3.5 h-3.5 text-cyan-200" />
                <span>انخراطات الولاية</span>
              </button>
              
              <button onClick={() => setActiveModal('publishing')} className="flex items-center gap-1.5 bg-[#e5a00d] hover:bg-[#c88b0a] text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200/50 shadow-sm active:scale-95">
                <Send className="w-3.5 h-3.5 text-stone-900" />
                <span>طلب ترخيص بالنشر</span>
              </button>

              <button onClick={() => setActiveModal('db-restore')} className="flex items-center gap-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/50 shadow-sm">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>قاعدة البيانات (مستعادة)</span>
              </button>
            </div>
          </div>

          {/* --- يسار: لوحة التحكم والإشعارات والخروج --- */}
          <div className="flex items-center justify-end gap-2 order-2 lg:order-3 w-full md:w-auto">
            <button onClick={() => setActiveModal('profile')} className="flex items-center gap-2 bg-[#0d592c] hover:bg-[#116e37] text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-400/40">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>لوحة التحكم ({currentUser.name})</span>
            </button>
            
            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-1.5 bg-[#d9222a] hover:bg-[#b81820] text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-red-400/40">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
            
            <div className="relative">
              <button onClick={() => setShowBellDropdown(!showBellDropdown)} className="p-1.5 rounded-full bg-[#0a3e1c] hover:bg-[#0e5226] text-amber-300 border border-emerald-600/50 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full"></span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* نافذة عرض المنصات: تظهر كطبقة علوية تغطي باقي التطبيق عند تفعيلها */}
      {/* ========================================================= */}
      {activePlatform && (
        <div className="fixed top-[75px] left-0 right-0 bottom-0 z-[99998] bg-[#f4f7f6]">
          <iframe src={activePlatform} className="w-full h-full border-none" title="منصة SNTE" />
        </div>
      )}

    </>
  );
};
