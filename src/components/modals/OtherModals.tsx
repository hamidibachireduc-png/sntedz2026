import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Briefcase,
  UserCheck,
  BookOpen,
  Compass,
  PhoneCall,
  X,
  Download,
  ExternalLink,
  Shield,
  Award,
  CheckCircle2,
  Mail,
  MapPin,
  Building,
  Save,
} from 'lucide-react';

export const OtherModals: React.FC = () => {
  const { activeModal, setActiveModal, currentUser, updateCurrentUser } = useDatabase();

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileRole, setProfileRole] = useState(currentUser.role);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);

  if (!activeModal || ['memberships', 'publishing', 'assembly', 'activities', 'legislation', 'live', 'stats', 'db-restore'].includes(activeModal)) {
    return null;
  }

  // 1. الحقائب والمنصات
  if (activeModal === 'bags') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
        <div className="bg-[#03230f] border-2 border-rose-500/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
          <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
            <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-full bg-emerald-950 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-lg sm:text-xl font-black text-white">الحقائب والمنصات الرقمية للنقابة</h3>
                <p className="text-xs text-emerald-300/80">حقائب المندوب النقابي، برمجيات حساب شبكة الأجور والتقاعد النسبي</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#5b2333] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-bold">الحقيبة الرقمية 01</span>
                  <span className="text-emerald-400 font-bold">إصدار 2024</span>
                </div>
                <h4 className="font-bold text-sm text-white">حقيبة المندوب النقابي وأمين الفرع</h4>
                <p className="text-gray-300 leading-relaxed">
                  تتضمن كافة النماذج الإدارية: استدعاء الجمعيات العامة، محاضر التنصيب، استمارات الانخراط، ونصوص الحماية القانونية.
                </p>
                <button
                  onClick={() => alert('جاري تحميل حقيبة المندوب النقابي بصيغة ZIP مضغوطة...')}
                  className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الحقيبة الكاملة (ZIP)</span>
                </button>
              </div>

              <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-sky-500 text-white px-2.5 py-0.5 rounded-full font-bold">منصة إلكترونية</span>
                  <span className="text-emerald-400 font-bold">محدثة بالمرسوم الأخير</span>
                </div>
                <h4 className="font-bold text-sm text-white">حاسبة شبكة الأجور والدرجات ومنح الجنوب</h4>
                <p className="text-gray-300 leading-relaxed">
                  برمجية لحساب الراتب الصافي، النقطة الاستدلالية، منحة المردودية والخبرة البيداغوجية لمختلف الأسلاك والرتب.
                </p>
                <button
                  onClick={() => alert('تم تشغيل الحاسبة الذكية للأجور لقطاع التربية الوطنية.')}
                  className="w-full mt-2 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح منصة حساب الأجور</span>
                </button>
              </div>

              <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">حقيبة بيداغوجية</span>
                  <span className="text-amber-300 font-bold">تحضير الامتحانات</span>
                </div>
                <h4 className="font-bold text-sm text-white">حقيبة المفتش والمدير البيداغوجية</h4>
                <p className="text-gray-300 leading-relaxed">
                  أدلة التقويم المستمر، مناشير التوجيه المدرسي، وآليات معالجة الصعوبات التعلمية للتلاميذ في الأطوار الثلاثة.
                </p>
                <button
                  onClick={() => alert('جاري تحميل الحقيبة البيداغوجية الرسمية...')}
                  className="w-full mt-2 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملفات التوجيه (PDF)</span>
                </button>
              </div>

              <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full font-bold">الخدمات الاجتماعية</span>
                  <span className="text-emerald-400 font-bold">دليل الموظف</span>
                </div>
                <h4 className="font-bold text-sm text-white">دليل ملفات السلفة الاستعجالية والعمليات الجراحية</h4>
                <p className="text-gray-300 leading-relaxed">
                  ملف متكامل يشرح حقوق الموظف في لجنة الخدمات الاجتماعية، شروط الاستفادة من سلفة السيارات، السكن، والتكفل الصحي.
                </p>
                <button
                  onClick={() => alert('جاري تحميل دليل الخدمات الاجتماعية...')}
                  className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-black flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل استمارات الخدمات الاجتماعية</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#02170a] border-t border-emerald-800/80 flex justify-end">
            <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. تعديل بياناتي (Profile Edit)
  if (activeModal === 'profile') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
        <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
          <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
            <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-full bg-emerald-950 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-lg font-black text-white">لوحة التحكم والملف الشخصي</h3>
                <p className="text-xs text-emerald-300/80">تحديث بيانات حساب الأستاذ عوايشية طارق</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 shrink-0 shadow-lg font-black text-sm">
                ط.ع
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCurrentUser({
                name: profileName,
                role: profileRole,
                phone: profilePhone,
                email: profileEmail,
              });
              setActiveModal(null);
            }}
            className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto"
          >
            <div>
              <label className="block text-gray-300 mb-1 font-bold">الاسم واللقب</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-bold">المسؤولية والرتبة النقابية</label>
              <input
                type="text"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-bold">رقم الشارة الوطنية</label>
              <input
                type="text"
                disabled
                value={currentUser.badgeNumber}
                className="w-full bg-[#011408] border border-emerald-900 rounded-xl p-2.5 text-amber-300 font-mono opacity-80"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-bold">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white text-left"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-bold">البريد الإلكتروني المهني</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white text-left"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-emerald-800">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. التعريف بالنقابة
  if (activeModal === 'about') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
        <div className="bg-[#03230f] border-2 border-teal-500/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
          <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
            <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-full bg-emerald-950 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-lg font-black text-white">التعريف بنقابة عمال التربية (S.N.T.E)</h3>
                <p className="text-xs text-emerald-300/80">تاريخ التأسيس، المبادئ، والأهداف النضالية</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#0f766e] flex items-center justify-center text-white shrink-0 shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-gray-200 flex-1">
            <div className="bg-[#042811] p-4 rounded-2xl border border-emerald-800 space-y-2">
              <h4 className="font-bold text-amber-300 text-sm">نبذة تاريخية:</h4>
              <p>
                تأسست النقابة الوطنية لعمال التربية (S.N.T.E) سنة 1990، معتمدة بالقرار الوزاري رقم 24/90،
                كأول تنظيم نقابي مستقل وموحد يجمع كافة أسلاك التربية والتعليم بالجزائر: من أساتذة التعليم الابتدائي،
                المتوسط، الثانوي، إلى نظار، مقتصدين، مستشاري التربية، مفتشين، والعمال المهنيين والأسلاك المشتركة.
              </p>
            </div>

            <div className="bg-[#042811] p-4 rounded-2xl border border-emerald-800 space-y-2">
              <h4 className="font-bold text-amber-300 text-sm">المبادئ والأهداف الجوهرية:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-gray-300">
                <li>الدفاع المستميت عن كرامة الأستاذ ومربي الأجيال وتحسين قدرته الشرائية.</li>
                <li>المطالبة بالتقاعد المسبق والنسبي لمهنة التعليم باعتبارها مهنة شاقة ومرهقة.</li>
                <li>توفير السكن الوظيفي اللائق وتثمين منح الامتياز والمناطق الجغرافية للجنوب والهضاب العليا.</li>
                <li>المشاركة الفعالة في إصلاح المنظومة التربوية وتطوير المناهج بما يخدم التلميذ والوطن.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-[#02170a] border-t border-emerald-800 flex justify-end">
            <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. الدليل النقابي
  if (activeModal === 'guide') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
        <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
          <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
            <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-full bg-emerald-950 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-lg font-black text-white">الدليل الإجرائي للمناضل النقابي</h3>
                <p className="text-xs text-emerald-300/80">خطوات تأسيس الفروع النقابية والحماية القانونية</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#064e3b] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Compass className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed text-gray-200 flex-1">
            <div className="p-3.5 bg-[#042410] rounded-xl border border-emerald-800 space-y-1.5">
              <h5 className="font-bold text-amber-300">الخطوة الأولى: التحسيس وجمع الانخراطات</h5>
              <p className="text-gray-300">
                التواصل مع الزملاء داخل المؤسسة وتوزيع استمارات الانخراط وبطاقات العضوية الرسمية.
              </p>
            </div>

            <div className="p-3.5 bg-[#042410] rounded-xl border border-emerald-800 space-y-1.5">
              <h5 className="font-bold text-amber-300">الخطوة الثانية: عقد الجمعية العامة التأسيسية</h5>
              <p className="text-gray-300">
                توجيه استدعاء رسمي بحضور ممثل عن المكتب الولائي للنقابة، انتخاب مكتب الفرع بالاقتراع السري.
              </p>
            </div>

            <div className="p-3.5 bg-[#042410] rounded-xl border border-emerald-800 space-y-1.5">
              <h5 className="font-bold text-amber-300">الخطوة الثالثة: إيداع المحضر لدى مديرية التربية</h5>
              <p className="text-gray-300">
                تسليم نسخة من محضر التنصيب لإدارة المؤسسة ومديرية التربية، والحصول على وصل الإيداع القانوني فوراً.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#02170a] border-t border-emerald-800 flex justify-end">
            <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. اتصل بنا
  if (activeModal === 'contact') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
        <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
          <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
            <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-full bg-emerald-950 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-lg font-black text-white">اتصل بالأمانة الوطنية المركزية</h3>
                <p className="text-xs text-emerald-300/80">المقر المركزي للنقابة ومكاتب الاستقبال</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1e3a1f] flex items-center justify-center text-emerald-300 shrink-0 shadow-lg">
                <PhoneCall className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3.5 text-xs text-gray-200 flex-1 overflow-y-auto">
            <div className="p-3 bg-[#042410] rounded-xl border border-emerald-800 space-y-1">
              <p className="font-bold text-amber-300">المقر المركزي الوطني:</p>
              <p className="text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>شارع ديدوش مراد، الجزائر الوسطى، الجزائر العاصمة</span>
              </p>
            </div>

            <div className="p-3 bg-[#042410] rounded-xl border border-emerald-800 space-y-1">
              <p className="font-bold text-amber-300">الهاتف والفاكس المركزي:</p>
              <p className="text-emerald-300 font-mono" dir="ltr">+213 (0) 21 63 45 00 / +213 (0) 21 63 45 01</p>
            </div>

            <div className="p-3 bg-[#042410] rounded-xl border border-emerald-800 space-y-1">
              <p className="font-bold text-amber-300">البريد الإلكتروني للأمانة العامة:</p>
              <p className="text-emerald-300 font-mono">contact@snte-dz.org / bureau.national@snte-dz.org</p>
            </div>
          </div>

          <div className="p-4 bg-[#02170a] border-t border-emerald-800 flex justify-end">
            <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
