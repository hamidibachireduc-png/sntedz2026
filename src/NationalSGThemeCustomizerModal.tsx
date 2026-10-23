import React, { useState, useEffect } from 'react';

interface NationalSGThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NationalSGThemeCustomizerModal: React.FC<NationalSGThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [themeColor, setThemeColor] = useState('#006633');
  const [headerBannerImage, setHeaderBannerImage] = useState('/assets/aistudio/WhatsApp_Image_2026-10-11_at_16.38.53_a3613cf2.jpeg');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        const savedColor = localStorage.getItem('snte_theme_color');
        if (savedColor) setThemeColor(savedColor);
        const savedBanner = localStorage.getItem('snte_banner_image');
        if (savedBanner) setHeaderBannerImage(savedBanner);
      } catch {}
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('snte_theme_color', themeColor);
      localStorage.setItem('snte_banner_image', headerBannerImage);
      setSuccessMsg('✅ تم حفظ وتطبيق إعدادات المظهر والصور الخاصة بالموقع بنجاح.');
      window.dispatchEvent(new CustomEvent('snte-theme-updated'));
    } catch (err: any) {
      setSuccessMsg('حدث خطأ أثناء الحفظ: ' + err.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-title"
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-slate-900 border-2 border-emerald-600 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 id="customizer-title" className="text-base font-black text-emerald-950 flex items-center gap-2">
            <span>👑</span>
            <span>لوحة تحكم الأمين العام الوطني: المظهر، الأقسام وتعديل الصور</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-center font-bold text-xs space-y-3">
            <p>{successMsg}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#006633] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
            >
              تم ومتابعة التصفح
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 text-xs leading-relaxed">
              <span>🛡️ صلاحية حصرية للأمين العام الوطني (الأستاذ قويدر يحياوي): يمكنك عبر هذه اللوحة التحكم في ألوان المظهر العام وصور التروسات الرئيسية للبوابة.</span>
            </div>

            {/* Theme Color Customization */}
            <div>
              <label className="block text-gray-800 mb-1.5">لون الهوية البصرية الأساسي (اللون الأخضر النقابي والسمات):</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-gray-300 p-1"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setThemeColor('#006633')}
                    className="px-3 py-1 bg-[#006633] text-white rounded-lg text-[11px]"
                  >
                    الأخضر الأصلي (#006633)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeColor('#0f766e')}
                    className="px-3 py-1 bg-teal-700 text-white rounded-lg text-[11px]"
                  >
                    أخضر زيتي
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeColor('#1e40af')}
                    className="px-3 py-1 bg-blue-800 text-white rounded-lg text-[11px]"
                  >
                    أزرق ملكي
                  </button>
                </div>
              </div>
            </div>

            {/* Header / Banner Image Customization */}
            <div>
              <label className="block text-gray-800 mb-1">رابط صورة التروسة والغلاف الرئيسي لتطبيقات النقابة:</label>
              <input
                type="url"
                value={headerBannerImage}
                onChange={(e) => setHeaderBannerImage(e.target.value)}
                placeholder="/assets/aistudio/... رابط الصورة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#006633] outline-none"
              />
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-gray-500">اختر من الصور المرفقة المعتمدة:</span>
                <button
                  type="button"
                  onClick={() => setHeaderBannerImage('/assets/aistudio/WhatsApp_Image_2026-10-11_at_16.38.53_a3613cf2.jpeg')}
                  className="px-2.5 py-1 bg-emerald-100 text-[#006633] rounded-lg text-[10px] font-bold border border-emerald-300 cursor-pointer"
                >
                  🖼️ صورة التطبيق الرسمية (04)
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderBannerImage('/assets/aistudio/image_536697ab.png')}
                  className="px-2.5 py-1 bg-amber-100 text-amber-950 rounded-lg text-[10px] font-bold border border-amber-300 cursor-pointer"
                >
                  📱 صورة المنصات الرقمية
                </button>
              </div>
            </div>

            {/* Image Preview */}
            {headerBannerImage && (
              <div className="rounded-2xl overflow-hidden border border-emerald-200 max-h-40 bg-gray-100">
                <img
                  src={headerBannerImage}
                  alt="معاينة الغلاف"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://l.top4top.io/p_37988hwfa0.png';
                  }}
                />
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#006633] to-[#004d26] text-white rounded-xl font-black shadow-md cursor-pointer text-xs"
              >
                حفظ وتطبيق التعديلات على البوابة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
