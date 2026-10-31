import React, { useState, useEffect } from 'react';
import { TopicCategory, UnionTopic, CATEGORY_INFO } from './unionPortfoliosData';
import { WILAYAS_LIST, REGIONAL_COORDINATORS } from './wilayasList';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: TopicCategory;
  initialTopic?: UnionTopic | null;
  onTopicAdded: (newTopic: UnionTopic) => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'union_bag',
  initialTopic = null,
  onTopicAdded,
}) => {
  const [category, setCategory] = useState<TopicCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('الأمانة العامة الوطنية');
  const [wilayaCode, setWilayaCode] = useState('');
  const [region, setRegion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [actionText, setActionText] = useState('تحميل / استعراض الوثيقة');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setCategory(initialTopic.category);
      setTitle(initialTopic.title);
      setSummary(initialTopic.summary);
      setContent(initialTopic.content || '');
      setAuthor(initialTopic.author || 'الأمانة العامة الوطنية');
      setWilayaCode(initialTopic.wilayaCode || '');
      setRegion(initialTopic.region || '');
      setImageUrl(initialTopic.imageUrl || '');
      setFileUrl(initialTopic.fileUrl || '');
      setExternalUrl(initialTopic.externalUrl || '');
      setActionText(initialTopic.actionText || 'تحميل / استعراض الوثيقة');
      setTagsInput(initialTopic.tags ? initialTopic.tags.join(', ') : '');
      setIsPinned(Boolean(initialTopic.isPinned));
    } else {
      setCategory(defaultCategory);
      setTitle('');
      setSummary('');
      setContent('');
      setAuthor('الأمانة العامة الوطنية');
      setWilayaCode('');
      setRegion('');
      setImageUrl('');
      setFileUrl('');
      setExternalUrl('');
      setActionText('تحميل / استعراض الوثيقة');
      setTagsInput('');
      setIsPinned(false);
    }
    setErrorMsg('');
  }, [initialTopic, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان الموضوع.');
      return;
    }
    if (!summary.trim()) {
      setErrorMsg('يرجى إدخال ملخص موجز للموضوع.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedWilaya = wilayaCode
        ? WILAYAS_LIST.find((w) => w.code === wilayaCode)
        : undefined;

      const tags = tagsInput
        .split(/[,،\s]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const topicData: UnionTopic = {
        id: initialTopic ? initialTopic.id : `topic-${Date.now()}`,
        category,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim() || undefined,
        author: author.trim() || 'الأمانة العامة الوطنية - S.N.T.E',
        date: initialTopic ? initialTopic.date : new Date().toISOString().split('T')[0],
        imageUrl: imageUrl.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        actionText: actionText.trim() || 'عرض التفاصيل',
        wilayaCode: selectedWilaya ? selectedWilaya.code : undefined,
        wilayaName: selectedWilaya ? selectedWilaya.name : undefined,
        region: region.trim() || undefined,
        tags: tags.length > 0 ? tags : [CATEGORY_INFO[category].label],
        isPinned,
      };

      // Persist into localStorage
      const storedRaw = localStorage.getItem('snte_custom_topics_v1');
      const stored: UnionTopic[] = storedRaw ? JSON.parse(storedRaw) : [];
      let updated: UnionTopic[];
      if (initialTopic) {
        // If updating an existing topic
        const existsInCustom = stored.some((t) => t.id === initialTopic.id);
        if (existsInCustom) {
          updated = stored.map((t) => (t.id === initialTopic.id ? topicData : t));
        } else {
          updated = [topicData, ...stored];
        }
      } else {
        updated = [topicData, ...stored];
      }
      localStorage.setItem('snte_custom_topics_v1', JSON.stringify(updated));

      setIsSubmitting(false);
      onTopicAdded(topicData);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('حدث خطأ أثناء حفظ الموضوع: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-emerald-500/30 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{initialTopic ? '✏️' : '👑'}</span>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                {initialTopic ? 'تعديل الموضوع بالبوابة الرسمية' : 'إضافة ونشر موضوع جديد بالبوابة الرسمية'}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                الصلاحية الحصرية للأمين العام الوطني (الأستاذ قويدر يحياوي)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Official Authority Badge */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-xs font-bold text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>نظام النشر والتعديل المركزي - إشراف الأمانة العامة الوطنية</span>
          </div>
          <span className="bg-amber-200 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
            نشر مباشر معتمد
          </span>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Dropdown Selection */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              اختر القسم أو الحقيبة المطلوبة <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
              className="w-full px-3.5 py-2.5 bg-emerald-50/50 border-2 border-emerald-400 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006633]"
            >
              {(Object.keys(CATEGORY_INFO) as TopicCategory[]).map((catKey) => {
                const info = CATEGORY_INFO[catKey];
                return (
                  <option key={catKey} value={catKey}>
                    {info.icon} {info.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              عنوان الموضوع أو البيان أو الوثيقة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بيان الأمانة حول مخرجات التفاوض / دليل بيداغوجي..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ملخص موجز للموضوع <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="فقرة موجزة تصف محتوى الوثيقة أو البيان وأهميته للنقابيين والمنخرطين..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Detailed Content (Optional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              النص الكامل أو محتوى الموضوع (اختياري)
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="يمكنك كتابة نص البيان، القرارات، التوصيات، أو محتوى المذكرة هنا..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Author & Context Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الجهة أو الهيكل الناشر <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="الأمانة العامة الوطنية"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
              />
            </div>

            {category === 'wilaya_acts' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الولاية المعنية</label>
                <select
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006633]"
                >
                  <option value="">-- اختر ولاية --</option>
                  {WILAYAS_LIST.map((w) => (
                    <option key={w.code} value={w.code}>
                      ولاية {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : category === 'region_acts' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">التنسيقية الجهوية</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006633]"
                >
                  <option value="">-- اختر التنسيقية --</option>
                  {REGIONAL_COORDINATORS.map((c) => (
                    <option key={c.id} value={c.region}>
                      {c.region}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  نص زر الإجراء أو التحميل
                </label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="مثال: 🚀 تشغيل تطبيق الويب (HTML) / استعراض..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">نماذج سريعة:</span>
                  <button
                    type="button"
                    onClick={() => setActionText('🚀 تشغيل تطبيق الويب (HTML)')}
                    className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#006633] px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                  >
                    🚀 تشغيل تطبيق HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionText('🌐 فتح المنصة الرقمية')}
                    className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                  >
                    🌐 فتح المنصة
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionText('📄 استعراض الوثيقة والمحتوى')}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-200 cursor-pointer"
                  >
                    📄 استعراض
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Topic Image Cover Section (صورة الموضوع والمشاركة) */}
          <div className="bg-gradient-to-r from-emerald-50/60 via-amber-50/40 to-emerald-50/40 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🖼️</span>
                <span className="text-xs font-black text-gray-900">
                  صورة الموضوع البارزة (تظهر عند النشر والمشاركة بمواقع التواصل)
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                صورة الغلاف والمنصات
              </span>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... رابط الصورة البارزة للموضوع أو البيان"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633] bg-white"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-500 font-bold">صور سريعة معتمدة:</span>
              <button
                type="button"
                onClick={() => setImageUrl('/assets/aistudio/WhatsApp_Image_2026-10-11_at_16.38.53_a3613cf2.jpeg')}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-[#006633] px-2.5 py-1 rounded-lg border border-emerald-300 cursor-pointer font-bold"
              >
                🖼️ شعار التطبيق الرسمي (02)
              </button>
              <button
                type="button"
                onClick={() => setImageUrl('/assets/aistudio/image_536697ab.png')}
                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer font-bold"
              >
                📱 صورة المنصات الرقمية
              </button>
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-300 cursor-pointer"
              >
                ✕ إزالة الصورة
              </button>
            </div>
          </div>

          {/* HTML Web Apps & Google Drive Links Section */}
          <div className="bg-gradient-to-r from-blue-50/60 via-emerald-50/40 to-amber-50/40 p-3.5 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🚀</span>
                <span className="text-xs font-black text-gray-900">
                  ربط صفحات الويب وتطبيقات HTML المبرمجة من Google Drive أو الروابط الخارجية
                </span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                الحقائب والمنصات الرقمية
              </span>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              إذا قمت ببرمجة صفحات HTML ووضعتها في فولدر Google Drive كروابط لتطبيقات رقمية، يمكنك إلصاق رابط المشاركة أو رابط المعاينة أدناه ليتم تشغيل التطبيق مباشرة للمنخرطين.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رابط الملف أو مجلد Google Drive (اختياري)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... أو رابط PDF"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    رابط تطبيق الويب HTML أو المنصة الخارجية
                  </label>
                  {externalUrl && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>تجربة الرابط</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    if (e.target.value.includes('.html') || e.target.value.includes('drive.google.com')) {
                      if (!actionText || actionText === 'تحميل / استعراض الوثيقة') {
                        setActionText('🚀 تشغيل تطبيق الويب (HTML)');
                      }
                    }
                  }}
                  placeholder="https://... رابط صفحة HTML أو منصة رقمية"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                />
              </div>
            </div>
          </div>

          {/* Tags & Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الكلمات المفتاحية والوسوم (مفصولة بفواصل)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="مثال: مرسوم، إضراب، بيداغوجيا، وهران..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
              />
            </div>

            <div className="pt-5 flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#006633] focus:ring-[#006633] w-4 h-4"
                />
                <span>📌 تثبيت هذا الموضوع في أعلى القسم</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#004d26] hover:to-[#00371b] text-white font-black px-7 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{initialTopic ? '💾' : '➕'}</span>
              <span>{isSubmitting ? 'جاري الحفظ...' : initialTopic ? 'حفظ تعديلات الموضوع' : 'نشر الموضوع بالبوابة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
