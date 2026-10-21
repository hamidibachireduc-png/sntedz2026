import React from 'react';

export default function App() {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbx24zlQ3VlbpbGMgKJIQJeWf6YShA7uk9StUtqU1W3f2iNYMJqRxypADsHKtU9aICtfFA/exec';

  const handleSync = async (dbType: string) => {
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'sync_master_database',
          dbType: dbType,
          payload: { timestamp: new Date().toISOString() }
        }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ ' + result.message);
      } else {
        alert('❌ فشل المزامنة: ' + result.error);
      }
    } catch (err) {
      alert('❌ خطأ في الاتصال بالخادم السحابي.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#1e293b] p-6 font-['Cairo']" dir="rtl">
      <header className="max-w-6xl mx-auto bg-[#006633] text-white p-6 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">البوابة الرقمية الرسمية - S.N.T.E</h1>
          <p className="text-sm opacity-90 mt-1">منظومة إدارة وربط قواعد البيانات السحابية بـ Google Sheets & Drive</p>
        </div>
        <a 
          href="https://drive.google.com/drive/folders/1NFsugrAW9aP8a7THKy4pY4EIwHQzBZaQ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-[#006633] px-4 py-2 rounded-xl font-bold shadow hover:bg-opacity-90 transition"
        >
          📂 فتح المجلد في Drive
        </a>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'financial', title: 'الملف المالي والاشتراكات', desc: 'سندات القبض، الاشتراكات، وتوزيع الحصص (50% / 50%).' },
          { id: 'members', title: 'قاعدة بيانات المنخرطين', desc: 'سجلات المنخرطين متضمنة أرقام NIN، الضمان، وبطاقات العضوية.' },
          { id: 'minutes', title: 'سجل المحاضر الرسمية', desc: 'محاضر التنصيب والجمعيات العامة وروابط PDF على Drive.' },
          { id: 'structures', title: 'دليل الهياكل والأمانات الـ 72', desc: 'الأمانات الولائية والبلدية ومكاتب الفروع والمكلفين بالعهدة.' },
          { id: 'grievances', title: 'سجل النزاعات والعرائض', desc: 'ملفات النزاعات المهنية والعرائض الموجهة لمديريات التربية.' },
          { id: 'laws', title: 'بنك النصوص التشريعية', desc: 'القانون الأساسي، النظام الداخلي، وميثاق أخلاقيات العمل النقابي.' }
        ].map((db) => (
          <div key={db.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#006633] mb-2">{db.title}</h3>
              <p className="text-sm text-gray-600 mb-6">{db.desc}</p>
            </div>
            <button 
              onClick={() => handleSync(db.id)}
              className="w-full bg-[#006633] text-white py-2.5 rounded-xl font-semibold hover:bg-[#00552b] transition flex items-center justify-center gap-2"
            >
              ⚡ مزامنة وتثبيت القاعدة
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
