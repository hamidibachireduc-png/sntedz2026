import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Send,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
  FileCheck,
  Shield,
  Printer,
} from 'lucide-react';

export const PublishingModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    publicationRequests,
    wilayas,
    selectedWilayaId,
    currentUser,
    addPublicationRequest,
    updatePublicationStatus,
  } = useDatabase();

  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<any>('بيان إعلامي');
  const [contentSummary, setContentSummary] = useState('');
  const [wilayaName, setWilayaName] = useState(
    wilayas.find((w) => w.id === selectedWilayaId)?.nameAr || 'الجلفة'
  );

  if (activeModal !== 'publishing') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentSummary) return;

    addPublicationRequest({
      title,
      type,
      wilayaName,
      submittedBy: `${currentUser.name} (${currentUser.role})`,
      role: currentUser.role,
      contentSummary,
      notes: 'تم الإيداع عبر البوابة الرقمية بانتظار التأشيرة الرسمية.',
    });

    setTitle('');
    setContentSummary('');
    setShowNewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-amber-500/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-end">
                <span className="bg-[#e5a00d] text-stone-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                  الإعلام والاتصال
                </span>
                <span>منصة طلبات تراخيص النشر والبيانات الرسمية</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                متابعة واعتماد البيانات الإعلامية والملصقات الصادرة عن المكاتب الولائية الـ 69
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#e5a00d] flex items-center justify-center text-stone-950 shrink-0 shadow-lg">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-[#021a0b] border-b border-emerald-800/80 flex items-center justify-between">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>إيداع طلب ترخيص بالنشر جديد</span>
          </button>

          <span className="text-xs text-gray-300">
            المشرف المركزي على التأشيرة: <span className="text-amber-300 font-bold">{currentUser.name}</span>
          </span>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {showNewForm && (
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-[#042811] border border-amber-400/60 rounded-2xl space-y-3 animate-in slide-in-from-top-2"
            >
              <h4 className="font-bold text-amber-300 text-sm">بيانات طلب الترخيص بالنشر:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">عنوان البيان أو المنشور *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: بيان بخصوص المطالب الاجتماعية والمهنية لأساتذة التعليم الابتدائي..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">النوع</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    <option value="بيان إعلامي">بيان إعلامي</option>
                    <option value="نداء نقابي">نداء نقابي</option>
                    <option value="ملصق حائطي">ملصق حائطي</option>
                    <option value="مجلة دورية">مجلة دورية</option>
                    <option value="تغطية نشاط">تغطية نشاط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الولاية أو الهيكل المعني</label>
                  <select
                    value={wilayaName}
                    onChange={(e) => setWilayaName(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    <option value="المكتب الوطني المركزي">المكتب الوطني المركزي</option>
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.nameAr}>
                        ولاية {w.nameAr} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">نص الملخص ومحتوى النشر *</label>
                  <textarea
                    rows={4}
                    required
                    value={contentSummary}
                    onChange={(e) => setContentSummary(e.target.value)}
                    placeholder="اكتب ملخص البيان، الأسباب، والمحاور الأساسية المراد نشرها..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs"
                >
                  إرسال الطلب للاعتماد
                </button>
              </div>
            </form>
          )}

          {/* List of Requests */}
          <div className="space-y-3">
            {publicationRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-[#042410] border border-emerald-800/80 rounded-2xl hover:border-emerald-600/60 transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                        {req.type}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">ولاية {req.wilayaName}</span>
                      <span className="text-[11px] text-gray-400">تاريخ الإيداع: {req.submissionDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-1.5">{req.title}</h4>
                    <p className="text-[11px] text-gray-300 mt-0.5">مقدم الطلب: {req.submittedBy}</p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        req.status === 'مقبول ومعتمد'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                          : req.status === 'قيد الدراسة'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse'
                          : 'bg-red-500/20 text-red-300 border-red-400/50'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-200 bg-[#02170a] p-3 rounded-xl leading-relaxed border border-emerald-900/40">
                  {req.contentSummary}
                </p>

                {req.notes && (
                  <p className="text-[11px] text-amber-200/90 italic">
                    ملاحظات الأمانة الوطنية: {req.notes}
                  </p>
                )}

                {/* Management controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-900/60 text-xs">
                  <div className="text-[11px] text-gray-400">
                    {req.approvedBy && (
                      <span className="text-emerald-400 font-bold">
                        تمت المصادقة بواسطة: {req.approvedBy} في {req.approvalDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {req.status === 'قيد الدراسة' && (
                      <>
                        <button
                          onClick={() => updatePublicationStatus(req.id, 'مقبول ومعتمد', 'تمت الموافقة الرسمية والنشر المأذون')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                        >
                          منح ترخيص النشر
                        </button>
                        <button
                          onClick={() => updatePublicationStatus(req.id, 'مرفوض للتعديل', 'يرجى مراجعة الصياغة والتنسيق مع الأمانة الولائية')}
                          className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-xs"
                        >
                          إعادة للتعديل
                        </button>
                      </>
                    )}
                    {req.status === 'مقبول ومعتمد' && (
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 bg-[#063316] hover:bg-[#094720] text-amber-300 border border-emerald-600/40 rounded-lg font-bold text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة وثيقة الترخيص</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            نظام التأشير الإلكتروني المركزي لبيانات S.N.T.E
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
