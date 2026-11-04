import { useState } from 'react';

export default function App() {
  // حالة (State) لتتبع المنصة المفتوحة حالياً (إذا كانت فارغة، تظهر البوابة الرئيسية)
  const [activePlatform, setActivePlatform] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f7f6]" dir="rtl">
      
      {/* شريط التنقل الذكي الخاص بنقابة SNTE */}
      <nav className="sticky top-0 z-[99999] flex flex-wrap items-center justify-between gap-6 border-b-4 border-[#FFD700] bg-gradient-to-r from-[#006633] to-[#004d26] px-5 py-3 shadow-lg">
        
        {/* أزرار المنصات (الناظر والأستاذ) في الجهة اليمنى */}
        <div className="flex gap-6">
          {/* زر بوابة الناظر */}
          <button
            onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/nathersnte2026/')}
            className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
            title="بوابة الناظر"
          >
            <img
              src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/nather-3d.png?raw=true"
              alt="بوابة الناظر"
              className="h-14 w-auto rounded-xl drop-shadow-md group-hover:drop-shadow-xl"
            />
            <span className="font-['Cairo'] text-[13px] font-bold text-white text-shadow-sm pointer-events-none">بوابة الناظر</span>
          </button>

          {/* زر بوابة الأستاذ */}
          <button
            onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/ostadsntedz2026/')}
            className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
            title="بوابة الأستاذ"
          >
            <img
              src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/ostad-3d.png?raw=true"
              alt="بوابة الأستاذ"
              className="h-14 w-auto rounded-xl drop-shadow-md group-hover:drop-shadow-xl"
            />
            <span className="font-['Cairo'] text-[13px] font-bold text-white text-shadow-sm pointer-events-none">بوابة الأستاذ</span>
          </button>
        </div>

        {/* اسم البوابة (للعودة للرئيسية) في الجهة اليسرى */}
        <button
          onClick={() => setActivePlatform('')}
          className="mr-auto cursor-pointer font-['Cairo'] text-xl font-black text-[#FFD700] hover:text-yellow-300 transition-colors drop-shadow-md"
        >
          البوابة التفاعلية S.N.T.E
        </button>
      </nav>

      {/* منطقة عرض المحتوى الرئيسي أو الإطار (iframe) */}
      <main className="w-full">
        {activePlatform ? (
          /* عرض المنصة الفرعية داخل iframe إذا تم النقر على أحد الأزرار */
          <iframe
            src={activePlatform}
            className="h-[calc(100vh-85px)] w-full border-none"
            title="منصة SNTE الفرعية"
          />
        ) : (
          /* عرض محتوى البوابة التفاعلية الرئيسية هنا عند فتح الموقع أو العودة إليه */
          <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-85px)]">
             <h1 className="text-3xl font-['Cairo'] font-bold text-[#006633] mb-4">
               مرحباً بك في البوابة التفاعلية S.N.T.E
             </h1>
             <p className="text-lg font-['Cairo'] text-gray-700">
               الرجاء اختيار إحدى المنصات من الشريط العلوي للبدء.
             </p>
             {/* يمكنك إضافة باقي الأزرار والمكونات الخاصة بالبوابة الرئيسية هنا لاحقاً */}
          </div>
        )}
      </main>
    </div>
  );
}
