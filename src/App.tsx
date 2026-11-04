import { useState } from 'react';

export default function App() {
  // حالة لتتبع المنصة المفتوحة حالياً داخل iframe
  const [activePlatform, setActivePlatform] = useState('');

  return (
    <div className="min-h-screen bg-[#052814]" dir="rtl">
      
      {/* ================= شريط التنقل والتحكم الرئيسي (الهيدر) ================= */}
      <header className="sticky top-0 z-[99999] w-full border-b-2 border-yellow-500 bg-[#052814] shadow-lg transition-transform duration-300">
        
        {/* الصف الأول: الشريط العلوي */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 px-4 py-2">
          {/* اليمين: الشعار واسم البوابة */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              {/* ضع مسار شعار النقابة هنا */}
              <img src="/logo.png" alt="الشعار" className="h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <h1 className="cursor-pointer font-['Cairo'] text-lg font-bold text-white hover:text-yellow-400" onClick={() => setActivePlatform('')}>
              النقابة الوطنية لعمال التربية S.N.T.E <span className="text-yellow-500 text-sm">البوابة المركزية</span>
            </h1>
          </div>

          {/* الوسط: أزرار التحكم السريعة */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-full border border-green-600 bg-transparent px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-green-800">
              لوحة التحكم ()
            </button>
            <button className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-red-700">
              تسجيل الخروج 🚪
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-yellow-500 hover:bg-gray-600">
              🔔
            </button>
            <button className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-teal-700">
              شيتات Google Drive 📊
            </button>
          </div>

          {/* اليسار: أزرار العمليات */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-1 font-['Cairo'] text-sm font-bold text-black hover:bg-yellow-400">
              طلبات الترخيص 📝
            </button>
            <button className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-green-500">
              طلبات الانخراط 📑
            </button>
            <button className="flex items-center gap-2 rounded-full bg-teal-500 px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-teal-400">
              نشر مباشر ➕
            </button>
            <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1 font-['Cairo'] text-sm font-bold text-white hover:bg-blue-500">
              لوحة المظهر والصور 🎨
            </button>
          </div>
        </div>

        {/* الصف الثاني: القوائم الرئيسية */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-gray-700 px-2 py-2">
          {/* يمكنك استبدال الإيموجي بأيقوناتك الخاصة (SVG) */}
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">التعريف بالنقابة 📖</button>
          <button className="rounded-full bg-red-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-red-700">منصة المحاضر والجمعيات العامة 📄</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">النشاطات النقابية 🏛</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">الحقائب والمنصات 💼</button>
          <button className="rounded-full bg-teal-700 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-teal-600">المنصات الرقمية (4) 🌐</button>
          <button className="rounded-full bg-gray-800 px-3 py-1 font-['Cairo'] text-sm text-yellow-500 hover:bg-gray-700">مستودع GitHub 🐙</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">خريطة الهياكل النقابية 🗺</button>
        </div>

        {/* الصف الثالث: القوائم الفرعية */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-2">
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">تعديل بياناتي ⚙</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">البيانات القانونية والتشريعات 📜</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">الدليل النقابي 📚</button>
          <button className="rounded-full border border-green-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-green-800">اتصل بنا / الدعم 📞</button>
          <button className="rounded-full bg-blue-600 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-blue-500">الإحصائيات الإدارية 📊</button>
          <button className="rounded-full bg-yellow-500 px-3 py-1 font-['Cairo'] text-sm text-black hover:bg-yellow-400">تقرير الأداء السنوي 📈</button>
          <button className="rounded-full bg-red-800 px-3 py-1 font-['Cairo'] text-sm text-white hover:bg-red-700">الاجتماع المباشر 🎥</button>
          <button className="rounded-full bg-[#cca300] px-3 py-1 font-['Cairo'] text-sm text-black hover:bg-[#e6b800]">توثيق الوثائق 🔐</button>
        </div>
      </header>

      {/* ================= منطقة عرض المحتوى (المنصات الثلاثية الأبعاد أو الـ iframe) ================= */}
      <main className="w-full">
        {activePlatform ? (
          /* عرض منصة الناظر أو الأستاذ عند النقر عليها */
          <iframe
            src={activePlatform}
            className="h-[calc(100vh-140px)] w-full border-none bg-white"
            title="منصة SNTE"
          />
        ) : (
          /* الشاشة الرئيسية: أزرار المنصات ثلاثية الأبعاد */
          <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center gap-10 p-8">
            <h2 className="font-['Cairo'] text-2xl font-bold text-yellow-500">المنصات الرقمية التفاعلية</h2>
            
            <div className="flex gap-10">
              {/* زر منصة الناظر */}
              <button
                onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/nathersnte2026/')}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/nather-3d.png?raw=true"
                  alt="بوابة الناظر"
                  className="h-24 w-auto rounded-xl drop-shadow-2xl group-hover:drop-shadow-[0_10px_20px_rgba(255,215,0,0.3)]"
                />
                <span className="font-['Cairo'] text-lg font-bold text-white">بوابة الناظر</span>
              </button>

              {/* زر منصة الأستاذ */}
              <button
                onClick={() => setActivePlatform('https://hamidibachireduc-png.github.io/ostadsntedz2026/')}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src="https://github.com/hamidibachireduc-png/sntedz2026/blob/main/public/ostad-3d.png?raw=true"
                  alt="بوابة الأستاذ"
                  className="h-24 w-auto rounded-xl drop-shadow-2xl group-hover:drop-shadow-[0_10px_20px_rgba(255,215,0,0.3)]"
                />
                <span className="font-['Cairo'] text-lg font-bold text-white">بوابة الأستاذ</span>
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
