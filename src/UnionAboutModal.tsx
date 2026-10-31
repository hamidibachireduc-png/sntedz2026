import React from 'react';

interface UnionAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHierarchy: () => void;
}

export const UnionAboutModal: React.FC<UnionAboutModalProps> = ({
  isOpen,
  onClose,
  onOpenHierarchy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif] animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-800/20 text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#00371b] text-white p-6 relative flex items-center justify-between rounded-t-3xl border-b-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md border-2 border-amber-400 flex items-center justify-center">
              <img
                src="https://l.top4top.io/p_37988hwfa0.png"
                alt="SNTE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-300">التعريف بالنقابة الوطنية لعمال التربية</h2>
              <p className="text-xs text-emerald-100 font-bold">S.N.T.E - منظمة نقابية عتيدة ومستقلة لقطاع التربية الوطنية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-gray-800 text-sm leading-relaxed">
          {/* Introduction Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
              <span>📖</span>
              <span>نبذة عن الاتحاد والرسالة النقابية</span>
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              تأسست النقابة الوطنية لعمال التربية (S.N.T.E) لتكون الحصن المنيع والممثل الشرعي والموثوق لجميع موظفي ومسؤولي قطاع التربية الوطنية في الجزائر. تهدف النقابة إلى الدفاع عن الحقوق المادية والمعنوية للأسرة التربوية، ترقية العمل التربوي، وتحسين ظروف العمل والتمدرس وفق مبادئ الحوار البناء والمسؤولية الوطنية.
            </p>
          </div>

          {/* National General Secretary Profile Card */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border-2 border-amber-400/60 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-amber-500 shrink-0 bg-emerald-900">
                <img
                  src="https://github.com/hamidibachireduc-png/snte-map-69/blob/main/images/sg_kwaider.jpg?raw=true"
                  onError={(e: any) => {
                    e.target.src = 'https://raw.githubusercontent.com/hamidibachireduc-png/snte-map-69/main/images/sg_kwaider.jpg';
                  }}
                  alt="الأمين العام الوطني قويري يحياوي"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 text-center sm:text-right flex-1">
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  القيادة الوطنية العليا
                </span>
                <h4 className="font-black text-emerald-950 text-lg">الأمين العام الوطني: قويري يحياوي</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  يقود الاتحاد بحكمة واقتدار، مسخراً جهوده لخدمة مناضلي القطاع عبر كافة ولايات الوطن الـ 58 و 69 هيكلاً تنظيمياً.
                </p>

                {/* Interactive Contact Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                  <a
                    href="tel:0781450423"
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>📞</span>
                    <span dir="ltr">0781450423</span>
                  </a>
                  <a
                    href="https://wa.me/213781450423"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>💬</span>
                    <span>واتساب</span>
                  </a>
                  <a
                    href="mailto:Kouidery@ymail.com"
                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>📧</span>
                    <span>Kouidery@ymail.com</span>
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Algeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>🗺️</span>
                    <span>خرائط جوجل</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Structures & Organization */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-black text-emerald-950 text-base flex items-center gap-2">
              <span>🏛️</span>
              <span>هياكل التنظيم النقابي</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              تتوزع هيكلة S.N.T.E على مستويات متكاملة تضمن سرعة اتخاذ القرار وقوة التمثيل الميداني:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs text-center space-y-1">
                <div className="text-xl">🏛️</div>
                <div className="font-black text-emerald-950 text-xs">الأمانة الوطنية</div>
                <div className="text-[11px] text-gray-500">القيادة المركزية العليا للبوابة والمتابعة</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs text-center space-y-1">
                <div className="text-xl">🗺️</div>
                <div className="font-black text-emerald-950 text-xs">الأمانات الولائية (69)</div>
                <div className="text-[11px] text-gray-500">التنسيق والمتابعة عبر ولايات الوطن</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs text-center space-y-1">
                <div className="text-xl">🏫</div>
                <div className="font-black text-emerald-950 text-xs">الفروع النقابية بالمؤسسات</div>
                <div className="text-[11px] text-gray-500">قواعد النضال الميداني المباشر</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 rounded-b-3xl flex items-center justify-between gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenHierarchy();
            }}
            className="bg-[#006633] hover:bg-[#004d26] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🪜</span>
            <span>استعراض الدليل التنظيمي والسلم النقابي</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
