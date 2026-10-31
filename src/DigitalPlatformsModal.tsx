import React, { useState } from 'react';

export interface DigitalPlatform {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  url: string;
  icon: string;
  tag: string;
  colorTheme: {
    bgLight: string;
    border: string;
    badge: string;
    gradient: string;
    button: string;
  };
  features: string[];
}

export const OFFICIAL_SNTE_PLATFORMS: DigitalPlatform[] = [
  {
    id: 'membership',
    name: 'منصة الانخراط النقابي',
    subtitle: 'الانخراط الفردي والجماعي لعمال التربية',
    description:
      'المنصة الرقمية الوطنية المعتمدة لاستقبال وتسجيل طلبات الانخراط الفردية والجماعية لعمال وموظفي قطاع التربية الوطنية، معالجة البيانات، وتأكيد العضوية واستصدار بطاقات الانخراط الرسمية.',
    targetAudience: 'الأساتذة، الموظفون، الإداريون، والعمال المهنيون (فردي / جماعي)',
    url: 'https://script.google.com/macros/s/AKfycbzCm8LfQxV5bQIGKOhX36RJDNhImVPYdSNa1JH2M7AdQYGMe2lofwy58kde9uQBIohoRA/exec',
    icon: '🪪',
    tag: 'انخراط رقمي فوري',
    colorTheme: {
      bgLight: 'bg-emerald-50/80',
      border: 'border-emerald-300',
      badge: 'bg-emerald-700 text-white',
      gradient: 'from-emerald-700 via-emerald-800 to-teal-900',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    features: [
      'استمارة انخراط إلكترونية سريعة ومباشرة',
      'دعم التسجيل الفردي والتسجيل الجماعي للمؤسسات',
      'ربط مباشر مع قواعد بيانات الأمانة الوطنية',
      'استلام إشعار العضوية الإلكتروني فور التأكيد',
    ],
  },
  {
    id: 'structure-minutes',
    name: 'منصة الهيكلة النقابية والمحاضر',
    subtitle: 'الأمانات الولائية والبلدية والفروع والتنسيقيات',
    description:
      'المنصة السحابية المخصصة لتنظيم الهياكل النقابية، تحرير وتوثيق محاضر الجمعيات العامة التجديدية والتأسيسية، واعتماد الفروع النقابية بالمؤسسات التربوية عبر الـ 72 ولاية.',
    targetAudience: 'الأمناء الولائيون، المنسقون الجهويون، مكاتب البلديات، وفروع المؤسسات',
    url: 'https://script.google.com/macros/s/AKfycby9NWPgJ0hX9jssgdVM4EuaJvuEMaMdkwVBj2aZyECUfFYz09LN-p1StR29av83vgNVfg/exec',
    icon: '🏛️',
    tag: 'إدارة الهياكل والمحاضر',
    colorTheme: {
      bgLight: 'bg-blue-50/80',
      border: 'border-blue-300',
      badge: 'bg-blue-700 text-white',
      gradient: 'from-blue-700 via-indigo-800 to-slate-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    features: [
      'إنشاء وتوليد محاضر الجمعيات العامة وفق الأطر القانونية',
      'تثبيت وتحديث تشكيلة المكاتب التنفيذية والفروع',
      'المصادقة الرقمية والاعتماد من الأمانة العامة',
      'أرشفة سحابية محمية لجميع المحاضر والتقارير الأدبية والمالية',
    ],
  },
  {
    id: 'contact-cards',
    name: 'منصة بطاقات الاتصال 2026',
    subtitle: 'البطاقات الفردية والجماعية للتنسيق النقابي',
    description:
      'منصة رقمية موحدة مخصصة لإصدار واستعراض وتوزيع بطاقات الاتصال الفردية والجماعية لمسؤولي الهياكل والأمانات والفروع النقابية لتسهيل التواصل والتعامل مع مديريات التربية ومؤسسات الدولة.',
    targetAudience: 'كافة مسؤولي ومندوبي وهياكل النقابة الوطنية لعمال التربية',
    url: 'https://sites.google.com/view/bitaket-itsale2026',
    icon: '📇',
    tag: 'تواصل وتنسيق مؤسساتي',
    colorTheme: {
      bgLight: 'bg-purple-50/80',
      border: 'border-purple-300',
      badge: 'bg-purple-700 text-white',
      gradient: 'from-purple-700 via-violet-800 to-indigo-950',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    features: [
      'دليل رقمي للاتصال والتواصل بين الهياكل النقابية',
      'بطاقات اتصال فردية وجماعية رسمية ومعتمدة',
      'تحديث فوري لبيانات الاتصال ومقرات الأمانات',
      'واجهة سهلة ومتاحة عبر كافة الأجهزة والهواتف',
    ],
  },
  {
    id: 'blood-donation',
    name: 'منصة مشروع التبرع بالدم الوطني 17',
    subtitle: 'المبادرة الإنسانية الوطنية الكبرى لنقابة S.N.T.E',
    description:
      'المنصة الرسمية للحملة الوطنية الكبرى للتبرع بالدم في نسختها السابعة عشرة، لتنظيم وحصر المتبرعين، التنسيق مع بنوك الدم والمستشفيات، وتجسيد قيم التضامن والتآخي الإنساني لعمال التربية.',
    targetAudience: 'كافة منخرطي وعمال قطاع التربية وعموم المواطنين والمؤسسات الصحية',
    url: 'https://script.google.com/macros/s/AKfycby4J-N1j3Pc_Do2i9slNVzAlPQtAAeLD4TBiZUbS-JzIUVVpJD_cJ84OG4m6C74IGs/exec',
    icon: '🩸',
    tag: 'مشروع وطني إنساني',
    colorTheme: {
      bgLight: 'bg-rose-50/80',
      border: 'border-rose-300',
      badge: 'bg-rose-700 text-white',
      gradient: 'from-rose-700 via-red-800 to-amber-950',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    features: [
      'تسجيل وإحصاء المتبرعين بالدم حسب الولايات والبلديات',
      'تنسيق القوافل الطبية المشتركة مع بنوك الدم الولائية',
      'لوحة قيادة لمتابعة أكياس الدم وتلبية نداءات الاستغاثة',
      'شهادات تقدير وشكر إلكترونية للمشاركين في المبادرة',
    ],
  },
];

interface DigitalPlatformsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatformId?: string;
}

export const DigitalPlatformsModal: React.FC<DigitalPlatformsModalProps> = ({
  isOpen,
  onClose,
  initialPlatformId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialPlatformId || OFFICIAL_SNTE_PLATFORMS[0].id
  );
  const [viewMode, setViewMode] = useState<'cards' | 'viewer'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const currentPlatform =
    OFFICIAL_SNTE_PLATFORMS.find((p) => p.id === selectedId) || OFFICIAL_SNTE_PLATFORMS[0];

  const handleCopyLink = (p: DigitalPlatform, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      navigator.clipboard.writeText(p.url);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenViewer = (platformId: string) => {
    setSelectedId(platformId);
    setViewMode('viewer');
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full border-2 border-emerald-700/40 overflow-hidden flex flex-col font-['Cairo',sans-serif] transition-all ${
          isFullscreen ? 'fixed inset-2 z-[130] max-h-none h-[calc(100vh-1rem)]' : 'max-w-5xl max-h-[92vh] h-[88vh]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-md shrink-0">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  المنظومة الرقمية المعتمدة
                </span>
                <span className="text-[11px] text-emerald-200 font-bold">
                  S.N.T.E Digital Platforms
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                بوابة المنصات الرقمية الوطنية للنقابة الوطنية لعمال التربية
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'viewer' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer hidden sm:flex items-center gap-1"
                  title="تكبير / تصغير الشاشة"
                >
                  <span>{isFullscreen ? '🗗' : '🗖'}</span>
                  <span>{isFullscreen ? 'استعادة' : 'ملء الشاشة'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>📋</span>
                  <span>قائمة المنصات</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-red-300 p-1.5 rounded-xl hover:bg-white/10 transition-colors text-lg cursor-pointer"
              title="إغلاق النافذة"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation for Platforms */}
        <div className="bg-emerald-950/95 border-b border-emerald-800 px-3 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-amber-300 text-xs font-black shrink-0 hidden md:inline-block ml-2">
            المنصات الرسمية:
          </span>
          {OFFICIAL_SNTE_PLATFORMS.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  if (viewMode === 'viewer') {
                    setIframeKey((k) => k + 1);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                    : 'bg-white/10 text-white/90 border-white/10 hover:bg-white/20'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          {viewMode === 'cards' ? (
            /* Cards Overview Mode */
            <div className="p-4 sm:p-6 space-y-6">
              {/* Notice Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-[#004d26] text-white p-4 rounded-2xl border border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h4 className="font-black text-sm text-amber-300">
                      خدمات رقمية وطنية متكاملة ومباشرة
                    </h4>
                    <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                      تم دمج كافة روابط المنصات الوزارية والتنظيمية المعتمدة لتمكين المكاتب الولائية، الفروع، والمنخرطين من إتمام المعاملات فورياً.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenViewer(selectedId)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🖥️</span>
                    <span>استعراض المنصة المحددة</span>
                  </button>
                </div>
              </div>

              {/* Grid of the 4 platforms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OFFICIAL_SNTE_PLATFORMS.map((platform) => {
                  const isSelected = selectedId === platform.id;
                  const isCopied = copiedId === platform.id;

                  return (
                    <div
                      key={platform.id}
                      onClick={() => setSelectedId(platform.id)}
                      className={`rounded-2xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between cursor-pointer ${
                        platform.colorTheme.bgLight
                      } ${
                        isSelected
                          ? `${platform.colorTheme.border} ring-2 ring-emerald-500 shadow-md`
                          : 'border-gray-200 hover:border-gray-300 shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{platform.icon}</span>
                            <div>
                              <h4 className="font-black text-sm text-gray-950">
                                {platform.name}
                              </h4>
                              <span className="text-[11px] font-bold text-gray-600 block">
                                {platform.subtitle}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${platform.colorTheme.badge}`}
                          >
                            {platform.tag}
                          </span>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed text-justify">
                          {platform.description}
                        </p>

                        <div className="bg-white/80 rounded-xl p-2.5 border border-gray-200/60 text-[11px] space-y-1">
                          <span className="font-black text-gray-900 block">
                            🎯 الفئة المستهدفة:
                          </span>
                          <span className="text-gray-600 block">
                            {platform.targetAudience}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          {platform.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                              <span className="text-emerald-700 font-black">✓</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-gray-200/70 mt-4 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(platform, e)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-300 shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="نسخ الرابط المباشر"
                          >
                            <span>{isCopied ? '✓' : '🔗'}</span>
                            <span>{isCopied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                          </button>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-black shadow-xs flex items-center gap-1 transition-all"
                            title="فتح في نافذة جديدة مستقلة"
                          >
                            <span>فتح ↗</span>
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenViewer(platform.id);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${platform.colorTheme.button}`}
                        >
                          <span>🖥️</span>
                          <span>استعراض داخل البوابة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* In-Portal Iframe Viewer Mode */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Viewer Subheader Bar */}
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentPlatform.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-gray-950">
                        {currentPlatform.name}
                      </h4>
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                        جلسة متصلة ومباشرة
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono truncate max-w-sm block">
                      {currentPlatform.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="إعادة تحميل المنصة"
                  >
                    <span>🔄</span>
                    <span className="hidden sm:inline">تحديث</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(currentPlatform)}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{copiedId === currentPlatform.id ? '✓' : '🔗'}</span>
                    <span>{copiedId === currentPlatform.id ? 'تم النسخ' : 'نسخ الرابط'}</span>
                  </button>

                  <a
                    href={currentPlatform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>فتح في نافذة كاملة ↗</span>
                  </a>
                </div>
              </div>

              {/* Informative Note for Google Apps Script & Google Sites embedded framing */}
              <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-950 flex items-center justify-between flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>💡</span>
                  <span>
                    إذا واجهت شاشة بيضاء أو تقييداً من المتصفح في إطار العرض الداخلي بسبب إعدادات أمان Google، اضغط مباشرة على <strong>"فتح في نافذة كاملة ↗"</strong> بالأعلى لفتح المنصة بملء الشاشة بدون أي قيود.
                  </span>
                </div>
              </div>

              {/* Iframe View */}
              <div className="flex-1 w-full h-full bg-slate-100 relative">
                <iframe
                  key={iframeKey}
                  src={currentPlatform.url}
                  title={currentPlatform.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
            <span>🏛️ النقابة الوطنية لعمال التربية S.N.T.E</span>
            <span>•</span>
            <span>المنصات الرقمية المعتمدة 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
