import React, { useState } from 'react';

interface UnionStatutesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StatuteSection = 'objectives' | 'rights_duties' | 'discipline' | 'structures' | 'committees' | 'finances';

export const UnionStatutesModal: React.FC<UnionStatutesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<StatuteSection>('objectives');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-gray-50 rounded-3xl w-full max-w-[1100px] h-[95vh] flex flex-col border border-emerald-900/50 shadow-2xl overflow-hidden font-['Cairo',sans-serif]">
        
        {/* رأس النافذة */}
        <div className="bg-gradient-to-l from-[#00381b] to-[#005a2b] p-5 sm:p-6 shrink-0 relative overflow-hidden flex justify-between items-center">
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg border-2 border-amber-400 flex items-center justify-center">
              <span className="text-3xl">⚖️</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 font-bold text-xs bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/30">
                  النظام الداخلي والقانون الأساسي
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">الدليل النقابي المرجعي - S.N.T.E</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-red-500 hover:text-white text-gray-300 rounded-full flex items-center justify-center transition-colors text-xl z-10">
            ✕
          </button>
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        {/* شريط التبويبات المتجاوب */}
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-3 flex items-center gap-2 overflow-x-auto shrink-0 shadow-sm scrollbar-none">
          {[
            { id: 'objectives', label: '🎯 الأهداف والمبادئ' },
            { id: 'rights_duties', label: '👥 الحقوق والواجبات' },
            { id: 'discipline', label: '⚖️ الانضباط وقواعد التعامل' },
            { id: 'structures', label: '🏛️ الهيكلة والتنظيم' },
            { id: 'committees', label: '⚙️ اللجان المختصة' },
            { id: 'finances', label: '💰 الأحكام المالية' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StatuteSection)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-md transform scale-105'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-[#004d26]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* محتوى الأقسام */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 animate-in slide-in-from-bottom-4 duration-500 min-h-full">
            
            {/* 1. الأهداف والمبادئ */}
            {activeTab === 'objectives' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-amber-400 pb-3">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-xl font-black text-[#004d26]">أهداف النقابة (المادة 08)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'دعم الديمقراطية النقابية ودولة القانون وحقوق الإنسان.',
                    'الإسهام على الصعيد المحلي والوطني ثقافيا واجتماعيا وفكريا.',
                    'نشر الفكر المؤسساتي النقابي المدافع عن المصلحة العامة.',
                    'الدفاع عن الحقوق النقابية للمنخرطين في جميع المؤسسات المعنية.',
                    'الدفاع عن حقوق المنخرطين المادية والمعنوية والمهنية.',
                    'العمل على بناء مدرسة جزائرية تجسد ثوابت الأمة.',
                    'الإسهام في الرقي بمنظومة التربية والتعليم والرفع من جودتها.',
                    'تأطير وتكوين المنخرطين بما يحقق لديهم الوعي بحقوقهم وواجباتهم.',
                    'ممارسة الأنشطة الثقافية والاجتماعية والفنية.',
                    'ضمان تمثيل العمال لدى الهيئات العمومية والسلطات.',
                    'السعي لتشكيل كونفدراليات أو تكتلات نقابية.',
                    'إنشاء تعاضديات وتعاونيات استهلاكية غير تجارية وغير ربحية.',
                    'النضال من أجل حماية الوحدة النقابية وتوفير الوسائل لصيانتها.',
                    'المساندة والتضامن من أجل تحقيق المطالب المشروعة.',
                    'ربط أواصر الصداقة والتعاون مع المنظمات النقابية المناضلة.'
                  ].map((goal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm">{i + 1}</span>
                      <p className="text-[13px] font-bold text-gray-800 leading-relaxed pt-1">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. الحقوق والواجبات */}
            {activeTab === 'rights_duties' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b-2 border-emerald-500 pb-2">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-lg font-black text-emerald-800">حقوق العضو المنخرط</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'الحق في المعلومة النقابية وفي التعبير الحر عن الرأي.',
                      'حق المبادرة في إطار صلاحياته في كل ما يخدم أهداف النقابة.',
                      'الحق في الانتخاب والتصويت والترشح في جميع هيئات النقابة.',
                      'الحق في المشاركة في مشاريع النقابة وبلورة مواقفها.',
                      'الحق في الحماية للممثل النقابي أثناء أداء مهامه.',
                      'الحق في الإعلام والتكوين النقابي والتسييري.',
                      'حق النقد على أساس الحوار السلمي والبناء.',
                      'حق الطعن واستئناف أي قرار ضده لدى الهيئات المسؤولة.',
                      'الحق في التعاضديات والتعاونيات الاستهلاكية غير الربحية.',
                      'الحق في الاستقالة برسالة مكتوبة مع تسليم ما بعهدته.'
                    ].map((right, i) => (
                      <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-gray-700 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-emerald-500 text-base mt-0.5">✔</span>
                        <span className="leading-relaxed">{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b-2 border-amber-500 pb-2">
                    <span className="text-2xl">📌</span>
                    <h3 className="text-lg font-black text-amber-800">واجبات العضو المنخرط</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'الالتزام بأهداف ومبادئ النقابة المحددة.',
                      'تطبيق قرارات النقابة والقيام بالمهام الموكلة إليه بفعالية.',
                      'المواظبة على الحضور في هيئات النقابة التي يستدعى إليها.',
                      'العمل على وحدة عمال القطاع ومحاربة أوجه الانشقاق.',
                      'الالتزام بمبدأ الجماعية والمداولات والأغلبية في اتخاذ القرارات.',
                      'الالتزام بدفع الانخراط والاشتراكات المالية بانتظام.',
                      'المساهمة في مختلف أنشطة النقابة ونشر أفكارها.',
                      'التكوين الذاتي المستمر وتنمية اطلاعه على المستجدات.',
                      'المحافظة على ممتلكات النقابة وتجهيزاتها ووثائقها.',
                      'الالتزام بعدم استخدام موقع المسؤولية النقابية لأغراض شخصية.'
                    ].map((duty, i) => (
                      <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-gray-700 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-amber-500 text-base mt-0.5">▪</span>
                        <span className="leading-relaxed">{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. الانضباط وقواعد التعامل */}
            {activeTab === 'discipline' && (
              <div className="space-y-8">
                {/* قواعد التعامل */}
                <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shrink-0 shadow-sm border border-blue-200">🤝</div>
                  <div>
                    <h3 className="text-blue-900 font-black text-lg mb-2">قواعد التعامل داخل هيئات النقابة (المادتين 42 و 43)</h3>
                    <p className="text-sm text-blue-800 font-bold leading-relaxed mb-2">
                      يجب على الهيئات القيادية الرجوع إلى القاعدة العمالية في القضايا المصيرية. وتتخذ القرارات التالية بالأغلبية المطلقة أو ثلثي (2/3) الأعضاء على الأقل:
                    </p>
                    <ul className="text-xs font-black text-blue-900 space-y-1 list-disc list-inside">
                      <li>الحل الإرادي وذلك في مؤتمر استثنائي ينظم لهذا الغرض.</li>
                      <li>التنسيق في قضية مصيرية.</li>
                      <li>ربط علاقة مع أي منظمة نقابية.</li>
                      <li>العدول عن قرارات الشطب والتأديب الصادرة عن لجنة الانضباط.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border-r-4 border-red-600 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shrink-0 shadow-sm border border-red-200">⚖️</div>
                  <div>
                    <h3 className="text-red-900 font-black text-lg mb-2">لجنة الانضباط والإجراءات التأديبية</h3>
                    <p className="text-sm text-red-800 font-bold leading-relaxed">
                      يحال على لجنة الانضباط كل عضو لم يلتزم بأحكام القانون الأساسي أو النظام الداخلي. يحق للعضو الاطلاع على ملفه قبل 8 أيام من مثوله، والدفاع عن نفسه، والطعن في القرارات أمام الهيئة العليا في أجل 21 يوماً.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-black text-gray-800 text-lg mb-4 border-b pb-2">تصنيف المخالفات (المادة 38)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white border-2 border-yellow-200 rounded-xl p-5 shadow-sm">
                      <h4 className="font-black text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg mb-4 text-center">مخالفات من الدرجة الأولى</h4>
                      <ul className="text-[13px] font-bold text-gray-700 space-y-2 list-disc list-inside marker:text-yellow-500">
                        <li>الغياب عن الاجتماعات مرتان متتاليتان بدون مبرر.</li>
                        <li>تجاوز السلم التنظيمي.</li>
                        <li>التأخر في تبليغ التقارير إلى المعنيين بها.</li>
                        <li>عدم احترام الزملاء.</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-500 font-bold">العقوبات: التنبيه، أو الإنذار الكتابي (اختصاص الأمين العام).</div>
                    </div>
                    
                    <div className="bg-white border-2 border-orange-300 rounded-xl p-5 shadow-sm">
                      <h4 className="font-black text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg mb-4 text-center">مخالفات من الدرجة الثانية</h4>
                      <ul className="text-[13px] font-bold text-gray-700 space-y-2 list-disc list-inside marker:text-orange-500">
                        <li>الغياب عن الاجتماعات 3 مرات بدون مبرر.</li>
                        <li>التأخر في القيام بالواجبات.</li>
                        <li>عدم احترام قرارات النقابة وهيئاتها ومسؤولياتها.</li>
                        <li>سوء تسيير أموال وممتلكات النقابة.</li>
                        <li>عدم تسديد المستحقات المالية.</li>
                        <li>تكرار خطأ من الدرجة الأولى.</li>
                      </ul>
                    </div>

                    <div className="bg-white border-2 border-red-400 rounded-xl p-5 shadow-sm">
                      <h4 className="font-black text-red-700 bg-red-50 px-3 py-1.5 rounded-lg mb-4 text-center">مخالفات من الدرجة الثالثة</h4>
                      <ul className="text-[13px] font-bold text-gray-700 space-y-2 list-disc list-inside marker:text-red-500">
                        <li>استخدام المسؤولية لأغراض شخصية.</li>
                        <li>خرق النظام الداخلي والقانون الأساسي للنقابة.</li>
                        <li>السلوك المخالف للآداب العامة.</li>
                        <li>رفض تنفيذ التعليمات الرسمية.</li>
                        <li>إفشاء أسرار النقابة أو الانتساب لتنظيم نقابي آخر.</li>
                        <li>تكرار خطأ من الدرجة الثانية.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h4 className="font-black text-gray-800 mb-3">العقوبات القصوى المقررة (المادة 27 و 41)</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm">تجميد العضوية (1 إلى 3 أشهر) مع الحرمان من الترشح</span>
                    <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm">التوقيف المؤقت (3 إلى 6 أشهر)</span>
                    <span className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm">التوقيف لمدة عامين</span>
                    <span className="bg-red-100 border border-red-300 px-3 py-1.5 rounded-lg text-xs font-black text-red-800 shadow-sm">التوقيف النهائي والفصل</span>
                    <span className="bg-red-600 border border-red-700 px-3 py-1.5 rounded-lg text-xs font-black text-white shadow-sm">التوقيف النهائي مع المتابعة القضائية</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. الهيكلة والتنظيم */}
            {activeTab === 'structures' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-emerald-500 pb-3">
                  <span className="text-2xl">🏛️</span>
                  <h3 className="text-xl font-black text-[#004d26]">الهيكلة التنظيمية للنقابة (المادة 29)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'على مستوى الوطن', icon: '👑', desc: 'المؤتمر الوطني، المجلس الوطني، الأمانة الوطنية، التنسيقيات الوطنية.' },
                    { title: 'على المستوى الجهوي', icon: '🌐', desc: 'مكاتب الامانات الجهوية للتنسيق بين الامانات الولائية.' },
                    { title: 'على مستوى الولاية', icon: '🏢', desc: 'الجمعية العامة الانتخابية للولاية، المجلس الولائي، الأمانة الولائية، التنسيقيات الولائية.' },
                    { title: 'على مستوى البلدية', icon: '🏘️', desc: 'الجمعية العامة الانتخابية البلدية، المجلس البلدي، الأمانة البلدية.' },
                    { title: 'على مستوى المؤسسة', icon: '🏫', desc: 'الجمعية العامة الانتخابية للمؤسسة، أمانة الفرع النقابي للمؤسسة.' },
                  ].map((str, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-emerald-300 transition-colors">
                      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-2xl border border-emerald-100 shrink-0">
                        {str.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm mb-1">{str.title}</h4>
                        <p className="text-xs font-bold text-gray-600">{str.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. اللجان المختصة */}
            {activeTab === 'committees' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-amber-400 pb-3">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-black text-[#004d26]">اللجان المتخصصة في النقابة (المادة 115)</h3>
                </div>
                <p className="text-sm font-bold text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  تشكل كل لجنة من خمسة (05) إلى ثمانية (08) أعضاء من بين أعضاء المجلس الوطني، ويرأس كل لجنة عضو يعينه الأمين العام الوطني للنقابة، ومهمتها إعداد برنامج يساعد الأمانة الوطنية في نشاطها كلاً بحسب اختصاصها.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { icon: '⚖️', name: 'لجنة دراسة القوانين والمناشير والمراسيم' },
                    { icon: '📢', name: 'لجنة الإعلام والمعلوماتية' },
                    { icon: '📋', name: 'لجنة التنظيم' },
                    { icon: '🤝', name: 'لجنة الخدمات الاجتماعية والنشاطات' },
                    { icon: '💼', name: 'لجنة الشؤون القانونية والمنازعات' },
                    { icon: '🛡️', name: 'لجنة الانضباط (منتخبة)' },
                  ].map((com, i) => (
                    <div key={i} className="bg-white border-2 border-gray-100 hover:border-emerald-400 rounded-xl p-5 flex flex-col items-center text-center gap-3 transition-colors shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 shadow-inner flex items-center justify-center text-3xl border border-emerald-100 shrink-0">
                        {com.icon}
                      </div>
                      <h4 className="font-black text-sm text-gray-900 leading-snug">{com.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. الأحكام المالية */}
            {activeTab === 'finances' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md border-2 border-emerald-300 shrink-0">💰</div>
                  <div>
                    <h3 className="text-xl font-black text-emerald-900 mb-2">الموارد المالية والاشتراكات</h3>
                    <p className="text-sm font-bold text-emerald-800 leading-relaxed">
                      تتكون الموارد المالية للنقابة من حاصل الانخراطات، الاشتراكات السنوية للإطارات، الاعتمادات، الإعانات، والتبرعات المحتملة. وتدفع الموارد وجوباً إلى حساب بنكي أو بريدي خاص بالنقابة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-black text-amber-800 mb-5 flex items-center gap-2 text-lg border-b border-amber-100 pb-2">
                      <span className="text-2xl">📊</span> قيم الاشتراكات وتوزيعها
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <span className="font-black text-gray-900 block text-sm">الانخراط النقابي السنوي</span>
                          <span className="text-[11px] text-gray-500 font-bold">المادة 122</span>
                        </div>
                        <span className="bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-sm shadow-sm">100 دج</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-black text-gray-900 block text-sm">توزيع حصيلة الانخراطات</span>
                            <span className="text-[11px] text-gray-500 font-bold">المادة 126</span>
                          </div>
                          <span className="text-xl">⚖️</span>
                        </div>
                        <div className="flex gap-2 text-xs font-black text-center">
                          <div className="flex-1 bg-white border border-gray-300 py-2 rounded-lg text-emerald-700 shadow-sm">50% أمانة وطنية</div>
                          <div className="flex-1 bg-white border border-gray-300 py-2 rounded-lg text-blue-700 shadow-sm">50% أمانة ولائية</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <span className="font-black text-gray-900 block text-sm mb-1">عائدات النشاطات الثقافية والاجتماعية</span>
                         <p className="text-xs font-bold text-gray-600">
                           تحول 50% من فوائد حاصل النشاطات الثقافية والاجتماعية من الأمانة الولائية إلى الأمانة الوطنية (المادة 128).
                         </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🛒</span> تعاونية الاستهلاك لعمال التربية
                      </h4>
                      <p className="text-xs font-bold text-gray-600 leading-relaxed">
                        حقوق الاشتراك محددة بـ <strong className="text-emerald-700 bg-emerald-50 px-1 rounded">500 دج</strong> سنوياً. يستفيد العمال المهنيون والمتقاعدون من التربية من بطاقة الاشتراك بنصف المبلغ (المادتين 123 و 124).
                      </p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">🔐</span> الرقابة وضوابط التسيير المالي
                      </h4>
                      <ul className="text-xs font-bold text-gray-600 leading-relaxed space-y-1.5 list-disc list-inside marker:text-emerald-600">
                        <li>كل السحوبات من الحساب تتم عن طريق صك ممضي بالاشتراك بين الأمين العام والمكلف بالمالية.</li>
                        <li>يراقب المجلس الوطني الميزانية ويصادق عليها.</li>
                        <li>تصفى الحسابات قبل 31 ديسمبر من كل سنة مدنية.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* التذييل */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center shrink-0">
          <span className="text-xs font-bold text-gray-500">تم استخراج البيانات وفق مخرجات المؤتمر الوطني السادس (جوان 2026).</span>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded-xl transition-colors text-sm"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
