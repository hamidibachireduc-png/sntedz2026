import React, { useState } from 'react';
import {
  TopicCategory,
  CATEGORY_INFO,
  PublicationRequest,
} from './unionPortfoliosData';

interface RequestPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  defaultCategory?: TopicCategory;
  onRequestSubmitted: (newReq: PublicationRequest) => void;
}

export const RequestPublicationModal: React.FC<RequestPublicationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultCategory = 'wilaya_acts',
  onRequestSubmitted,
}) => {
  const [category, setCategory] = useState<TopicCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [justification, setJustification] = useState(
    'يرجى من الأخ الأمين العام الوطني التفضل بالترخيص والتفويض بنشر هذا الموضوع/البيان على البوابة المركزية لنقابة S.N.T.E.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان الموضوع أو البيان المقترح.');
      return;
    }
    if (!summary.trim()) {
      setErrorMsg('يرجى إدخال ملخص الموضوع.');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(/[,،\s]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const newRequest: PublicationRequest = {
        id: `req-pub-${Date.now()}`,
        requesterId: currentUser?.id || 'unknown-sg',
        requesterName: currentUser?.name || 'أمين الهيكل النقابي',
        requesterStructure: currentUser?.structureName || currentUser?.title || 'أمانة هيكل نقابي',
        requesterRole: currentUser?.role || 'WILAYA_SG',
        wilayaCode: currentUser?.wilayaCode,
        wilayaName: currentUser?.wilayaName,
        region: currentUser?.region,
        category,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : [CATEGORY_INFO[category].label],
        justification: justification.trim(),
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      const storedRaw = localStorage.getItem('snte_publication_requests_v1');
      const stored: PublicationRequest[] = storedRaw ? JSON.parse(storedRaw) : [];
      const updated = [newRequest, ...stored];
      localStorage.setItem('snte_publication_requests_v1', JSON.stringify(updated));

      setIsSubmitting(false);
      onRequestSubmitted(newRequest);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('حدث خطأ أثناء إرسال الطلب: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-amber-400/40 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📨</span>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                طلب تفويض وترخيص بالنشر على البوابة الرسمية
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                موجه للسيد: الأمين العام الوطني للنقابة (الأستاذ قويدر يحياوي)
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

        {/* Notice */}
        <div className="bg-amber-50 p-3.5 border-b border-amber-200 text-xs text-amber-950 font-medium flex items-center gap-2">
          <span>⚖️</span>
          <span>
            وفق النظام الداخلي لـ S.N.T.E، تخضع كافة المناشير والبيانات والوثائق للترخيص المسبق
            من طرف <strong>الأمين العام الوطني</strong> لضمان الوحدة النقابية والرقابة القانونية قبل نشرها للعموم.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Requester Info Card */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500 block text-[11px]">الهيكل مقدم الطلب:</span>
              <strong className="text-gray-900">{currentUser?.structureName || currentUser?.name || 'الأمانة الولائية'}</strong>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg text-[10px]">
              {currentUser?.title || 'أمين عام معتمد'}
            </span>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1">
              القسم أو الحقيبة المطلوبة للنشر <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
              className="w-full px-3.5 py-2.5 bg-emerald-50/60 border border-emerald-400 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006633]"
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
              عنوان الموضوع أو البيان المقترح <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بيان الأمانة الولائية حول نتائج التفاوض مع مديرية التربية..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ملخص الفحوى <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ملخص موجز لنقاط البيان أو الوثيقة..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Detailed Content */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              نص البيان أو محتوى الوثيقة الكامل (اختياري)
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="نص البيان أو تقرير النشاط الكامل..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Document / Drive Link */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رابط المستند / المسح الضوئي / Google Drive (اختياري)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/... أو رابط PDF"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          {/* Request Justification to National SG */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              نص طلب الترخيص والتفويض الموجه للأمين العام الوطني <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="أسباب وضرورة النشر على البوابة الوطنية المركزية..."
              className="w-full px-3.5 py-2 border border-amber-300 bg-amber-50/40 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
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
              <span>📨</span>
              <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب الترخيص للأمين العام الوطني'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
