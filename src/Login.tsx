import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ميزة التعبئة السريعة للأمين العام الوطني
  const handleQuickFillSG = () => {
    setUsername('kouideryahiaoui');
    setPassword('kouider2026');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. التحقق من الحساب المركزي (الأمانة العامة الوطنية)
    if (username === 'kouideryahiaoui' && password === 'kouider2026') {
      // حفظ بيانات الجلسة مع إعطاء صلاحية كاملة (NATIONAL_SG) لفتح روابط Google Sheets ومجلد الأمانات
      localStorage.setItem('snte_user', JSON.stringify({ role: 'NATIONAL_SG', username: 'يحياوي قويدر' }));
      onLoginSuccess({ role: 'NATIONAL_SG' });
      setIsLoading(false);
      return;
    }

    // 2. التحقق من حسابات الهياكل الأخرى عبر Google Apps Script
    // ملاحظة: سيتم لاحقاً ربط هذا الجزء بالشيت الذي أرسلته: 1G-qX3qhvueJ13MM8m7wvkVqqTOeeRTx2OVC3NrqFdPg
    try {
      // محاكاة الاتصال بقاعدة البيانات (Google Sheets)
      setTimeout(() => {
        // هذه القيم سيتم جلبها ديناميكياً لاحقاً
        const isAccountValid = false; 
        const isSuspended = false; 

        if (isSuspended) {
          setError('⚠️ تم تعليق هذا الحساب تحفظياً. يرجى مراجعة الأمانة العامة الوطنية.');
          setIsLoading(false);
        } else if (isAccountValid) {
          // حفظ بيانات الجلسة بصلاحية محدودة (لا تظهر أزرار المزامنة)
          localStorage.setItem('snte_user', JSON.stringify({ role: 'LOCAL_BRANCH', username }));
          onLoginSuccess({ role: 'LOCAL_BRANCH' });
        } else {
          setError('❌ اسم المستخدم أو الرقم السري غير صحيح.');
          setIsLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError('حدث خطأ في الاتصال بقاعدة البيانات.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] p-4 font-cairo dir-rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
        
        {/* شريط علوي للزينة يمثل هوية النقابة */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-green-700"></div>

        <div className="text-center mb-6 mt-2">
          <div className="w-20 h-20 mx-auto bg-[#006633] rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-green-50">
            <span className="text-white font-bold text-2xl tracking-wider">SNTE</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">البوابة الرقمية الرسمية</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">النقابة الوطنية لعمال التربية</p>
        </div>

        {/* زر التعبئة السريعة للأمانة الوطنية */}
        <div className="mb-6 flex justify-center">
          <button 
            type="button"
            onClick={handleQuickFillSG}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-4 rounded-full transition-colors flex items-center gap-2 border border-slate-200"
          >
            <span>👑</span> تعبئة بيانات الأمانة العامة الوطنية
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006633] focus:border-transparent outline-none transition-all font-semibold text-gray-800 bg-gray-50 focus:bg-white"
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الرقم السري</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006633] focus:border-transparent outline-none transition-all font-bold tracking-widest text-left"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-r-4 border-red-500 text-red-700 text-sm font-bold rounded-l-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#006633] to-green-700 hover:from-green-700 hover:to-[#004d26] text-white font-bold py-3.5 rounded-lg transition-all flex justify-center items-center shadow-md disabled:opacity-70 mt-4"
          >
            {isLoading ? 'جاري التحقق من الصلاحيات...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
