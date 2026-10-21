import React, { useState, useEffect } from 'react';
import Login from './Login';

export default function App() {
  const [user, setUser] = useState<{ role: string; username: string } | null>(null);

  // التحقق من الجلسة المخزنة عند تحميل التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem('snte_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('snte_user');
      }
    }
  }, []);

  // دالة تسجيل الخروج المعتمدة
  const handleLogout = () => {
    localStorage.removeItem('snte_user');
    setUser(null);
  };

  // عرض شاشة الدخول إذا لم يسجل المستخدم دخوله
  if (!user) {
    return (
      <Login
        onLoginSuccess={(userData: { role: string; username?: string }) => {
          const userObj = {
            role: userData.role,
            username: userData.username || (userData.role === 'NATIONAL_SG' ? 'الأمين العام الوطني' : 'هيكل محلي')
          };
          setUser(userObj);
        }}
      />
    );
  }

  // عرض لوحة التحكم بعد تسجيل الدخول وفيها زر الخروج
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#1e293b] font-['Cairo',sans-serif] dir-rtl text-right">
      
      {/* الشريط العلوي وفيه زر تسجيل الخروج */}
      <header className="bg-white shadow-xs border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#006633] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs">
            SNTE
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">البوابة الرقمية الرسمية - S.N.T.E</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                user.role === 'NATIONAL_SG' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {user.role === 'NATIONAL_SG' ? '👑 الأمانة العامة الوطنية' : '🏛️ هيكل محلي / ولائي'}
              </span>
              <span className="text-[11px] text-gray-500 font-semibold">{user.username}</span>
            </div>
          </div>
        </div>

        {/* زر تسجيل الخروج في الزاوية المقابلة */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          title="إنهاء الجلسة والعودة لشاشة الدخول"
        >
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </header>

      {/* لوحة التحكم الرئيسية */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* قسم الأمانة العامة الوطنية ومزامنة Google Sheets (محصور بالحساب المركزي فقط) */}
        {user.role === 'NATIONAL_SG' && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#004d26] text-white shadow-md flex items-center justify-between gap-4 flex-wrap border border-emerald-700/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black bg-amber-400 text-black px-2 py-0.5 rounded-full">حصري للقيادة المركزية</span>
                <span className="text-xs text-emerald-200 font-bold">مجلد الأمانات وجداول المتابعة</span>
              </div>
              <h2 className="text-base font-black">مزامنة شيتات Google Sheets ومجلد الأمانات (Google Drive)</h2>
              <p className="text-xs text-emerald-100 mt-1">
                إدارة قواعد البيانات الـ 6، الاشتراك السنوي (50-50)، واستيراد ملفات التنصيب.
              </p>
            </div>
            
            <button
              onClick={() => window.dispatchEvent(new Event('snte-open-sheets-sync'))}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>📊 فتح نافذة المزامنة السحابية</span>
              <span>←</span>
            </button>
          </div>
        )}

        {/* مساحة عمل المحاضر والوثائق الرسمية */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black text-gray-900">سجل محاضر التنصيب والجمعيات العامة المعتمدة</h2>
              <p className="text-xs text-gray-500 font-medium">وفقاً لمقتضيات القانون 23-02 ومواد النظام الداخلي للنقابة الوطنية لعمال التربية.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs font-bold text-gray-600">
            جاهز لعرض نموذج محضر التنصيب A4 المعتمد مع الختم الرسمي وتوقيع الأمين العام الوطني (الأستاذ يحياوي قويدر).
          </div>
        </div>

      </main>
    </div>
  );
}
