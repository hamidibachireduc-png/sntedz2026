import React, { useState, useEffect } from 'react';
import {
  PublicationRequest,
  UnionTopic,
  CATEGORY_INFO,
  INITIAL_PUBLICATION_REQUESTS,
} from './unionPortfoliosData';

interface PublicationRequestsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onApproveAndPublish: (approvedTopic: UnionTopic) => void;
}

export const PublicationRequestsReviewModal: React.FC<PublicationRequestsReviewModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onApproveAndPublish,
}) => {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReqForDetails, setSelectedReqForDetails] = useState<PublicationRequest | null>(null);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const loadRequests = () => {
    try {
      const storedRaw = localStorage.getItem('snte_publication_requests_v1');
      if (storedRaw) {
        setRequests(JSON.parse(storedRaw));
      } else {
        localStorage.setItem(
          'snte_publication_requests_v1',
          JSON.stringify(INITIAL_PUBLICATION_REQUESTS)
        );
        setRequests(INITIAL_PUBLICATION_REQUESTS);
      }
    } catch {
      setRequests(INITIAL_PUBLICATION_REQUESTS);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
      setActionSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter requests according to tab and role
  const displayedRequests = requests.filter((r) => {
    // If not national SG, only show requester's own requests
    if (!isNationalSG && currentUser?.id) {
      if (r.requesterId !== currentUser.id && r.requesterRole !== currentUser.role) {
        // Fallback matching if id is mock
        if (currentUser.wilayaCode && r.wilayaCode !== currentUser.wilayaCode) {
          return false;
        }
      }
    }
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleApproveRequest = (req: PublicationRequest) => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Create the UnionTopic
    const newTopic: UnionTopic = {
      id: `topic-licensed-${req.id}-${Date.now()}`,
      category: req.category,
      title: req.title,
      summary: req.summary,
      content: req.content,
      author: `${req.requesterStructure} (بترخيص من الأمانة العامة الوطنية)`,
      date: today,
      fileUrl: req.fileUrl,
      externalUrl: req.externalUrl,
      actionText: req.fileUrl ? 'تحميل الوثيقة المعتمدة' : 'عرض التفاصيل',
      wilayaCode: req.wilayaCode,
      wilayaName: req.wilayaName,
      region: req.region,
      tags: [...req.tags, 'معتمد رسمياً', 'ترخيص وطني'],
      isPinned: false,
    };

    // 2. Persist topic into snte_custom_topics_v1
    const storedTopicsRaw = localStorage.getItem('snte_custom_topics_v1');
    const storedTopics: UnionTopic[] = storedTopicsRaw ? JSON.parse(storedTopicsRaw) : [];
    const updatedTopics = [newTopic, ...storedTopics];
    localStorage.setItem('snte_custom_topics_v1', JSON.stringify(updatedTopics));

    // 3. Update request status to 'approved'
    const updatedRequests = requests.map((r) => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'approved' as const,
          reviewedBy: 'الأستاذ قويدر يحياوي (الأمين العام الوطني)',
          reviewDate: today,
          reviewNotes: 'تم منح الترخيص والتفويض، ونشر الموضوع مباشرة على البوابة الرسمية.',
        };
      }
      return r;
    });

    localStorage.setItem('snte_publication_requests_v1', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    setActionSuccessMsg(`تم منح الترخيص لـ "${req.title}" ونشره بنجاح على البوابة.`);

    onApproveAndPublish(newTopic);
  };

  const handleConfirmReject = (reqId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedRequests = requests.map((r) => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'rejected' as const,
          reviewedBy: 'الأستاذ قويدر يحياوي (الأمين العام الوطني)',
          reviewDate: today,
          reviewNotes: rejectNotes.trim() || 'تم رفض النشر لمخالفة ضوابط النشر أو الحاجة لتعديل الصياغة.',
        };
      }
      return r;
    });

    localStorage.setItem('snte_publication_requests_v1', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    setRejectReasonPrompt(null);
    setRejectNotes('');
    setActionSuccessMsg('تم حفظ قرار رفض الطلب وإشعار الهيكل صاحب الطلب.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-amber-400/40 overflow-hidden my-6 max-h-[92vh] flex flex-col text-right">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>
                  {isNationalSG
                    ? 'ديوان الأمانة الوطنية: دراسة طلبات الترخيص والتفويض بالنشر'
                    : 'سجل طلبات الترخيص والتفويض بالنشر على البوابة'}
                </span>
                {isNationalSG && pendingCount > 0 && (
                  <span className="bg-amber-400 text-emerald-950 text-xs px-2.5 py-0.5 rounded-full font-black animate-pulse">
                    {pendingCount} بانتظار الترخيص
                  </span>
                )}
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                {isNationalSG
                  ? 'الصلاحية الحصرية للأمين العام الوطني (الأستاذ قويدر يحياوي) للترخيص بالنشر والتعديل'
                  : 'متابعة حالة الطلبات المرفوعة للأمانة العامة الوطنية للنقابة S.N.T.E'}
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

        {/* Success Alert */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-[#006633] p-3 text-xs font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg('')}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Authority Legal Notice */}
        <div className="bg-amber-50/80 p-3 border-b border-amber-200 text-xs text-amber-950 font-medium flex items-center gap-2">
          <span>📜</span>
          <span>
            <strong>تذكير تنظيمي:</strong> بموجب المادة 42 من النظام الداخلي لنقابة S.N.T.E، لا يُسمح بالنشر المباشر أو التعديل إلا للأمين العام الوطني. يرفع الأمناء العامون الولائيون والمنسقون طلباتهم عبر هذه المنظومة ليتم فحصها والموافقة عليها.
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-500 text-gray-950 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>⏳</span>
            <span>طلبات قيد الانتظار</span>
            <span className="bg-white/50 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {requests.filter((r) => r.status === 'pending').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'approved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>✅</span>
            <span>الطلبات المرخصة والمنشورة</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {requests.filter((r) => r.status === 'approved').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'rejected'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>❌</span>
            <span>الطلبات المرفوضة</span>
            <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {requests.filter((r) => r.status === 'rejected').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'all'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>📋</span>
            <span>كافة الطلبات ({requests.length})</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {displayedRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <span className="text-4xl block mb-2">📭</span>
              <p className="font-bold text-sm">لا توجد طلبات في هذا التبويب حالياً</p>
              <p className="text-xs text-gray-400 mt-1">
                تظهر هنا طلبات الترخيص المرفوعة من الأمناء العامين الولائيين والمنسقين الجهويين.
              </p>
            </div>
          ) : (
            displayedRequests.map((req) => {
              const catInfo = CATEGORY_INFO[req.category];
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between gap-3 ${
                    req.status === 'pending'
                      ? 'border-amber-400 shadow-md ring-1 ring-amber-300/40 bg-amber-50/20'
                      : req.status === 'approved'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-red-200 bg-red-50/10'
                  }`}
                >
                  {/* Top Bar of Request */}
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>⏳</span>
                          <span>قيد مراجعة الأمين العام الوطني</span>
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>✅</span>
                          <span>تم منح الترخيص والنشر</span>
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="bg-red-100 text-red-900 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>❌</span>
                          <span>تم رفض الترخيص</span>
                        </span>
                      )}

                      <span className="font-mono text-gray-400 text-[11px]">
                        📅 تاريخ الإرسال: {req.submissionDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-800 font-bold px-2.5 py-0.5 rounded-lg text-[11px]">
                        {catInfo.icon} {catInfo.label}
                      </span>
                      {req.wilayaName && (
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                          ولاية {req.wilayaName} ({req.wilayaCode})
                        </span>
                      )}
                      {req.region && (
                        <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                          تنسيقية {req.region}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requester Identity */}
                  <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500 text-[11px]">صاحب الطلب: </span>
                      <strong className="text-gray-900">{req.requesterName}</strong>
                      <span className="text-gray-400 mx-1.5">•</span>
                      <span className="text-emerald-800 font-bold">{req.requesterStructure}</span>
                    </div>
                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md font-mono text-gray-600">
                      معرف: {req.requesterId}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-gray-900 mb-1.5">
                      {req.title}
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                      {req.summary}
                    </p>
                  </div>

                  {/* Content snippet if provided */}
                  {req.content && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200 line-clamp-3">
                      <span className="font-bold text-gray-700 block mb-0.5">نص الموضوع المقترح:</span>
                      {req.content}
                    </div>
                  )}

                  {/* Justification given to National SG */}
                  <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950">
                    <span className="font-bold block mb-0.5 text-amber-900">
                      📨 صيغة الالتماس والترخيص الموجهة للأمين العام الوطني:
                    </span>
                    <p className="italic">"{req.justification || 'نرجو من الأخ الأمين العام الوطني التفضل بالترخيص بنشر هذا الموضوع.'}"</p>
                  </div>

                  {/* Review Notes if approved/rejected */}
                  {req.reviewNotes && (
                    <div
                      className={`text-xs p-2.5 rounded-xl border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-red-50 border-red-200 text-red-950'
                      }`}
                    >
                      <div className="font-black flex items-center justify-between mb-0.5">
                        <span>قرار الأمانة العامة الوطنية:</span>
                        <span className="font-normal text-[10px]">{req.reviewDate}</span>
                      </div>
                      <p>{req.reviewNotes}</p>
                      {req.reviewedBy && (
                        <span className="block mt-1 font-bold text-[10px] text-gray-700">
                          بواسطة: {req.reviewedBy}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons for National SG */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {req.fileUrl && (
                        <a
                          href={req.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <span>📄</span>
                          <span>معاينة المستند / الرابط</span>
                        </a>
                      )}
                    </div>

                    {isNationalSG && req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {rejectReasonPrompt === req.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rejectNotes}
                              onChange={(e) => setRejectNotes(e.target.value)}
                              placeholder="سبب الرفض أو التوجيه..."
                              className="px-2.5 py-1.5 text-xs border border-red-300 rounded-xl outline-none focus:ring-1 focus:ring-red-500 w-48 sm:w-64"
                            />
                            <button
                              type="button"
                              onClick={() => handleConfirmReject(req.id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
                            >
                              تأكيد الرفض
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectReasonPrompt(null)}
                              className="text-gray-500 hover:text-gray-700 text-xs px-2"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setRejectReasonPrompt(req.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              ❌ رفض الترخيص
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveRequest(req)}
                              className="bg-gradient-to-r from-emerald-600 to-[#006633] hover:from-emerald-500 hover:to-[#004d26] text-white font-black text-xs px-4 py-1.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>✅</span>
                              <span>منح الترخيص والنشر المباشر</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>النقابة الوطنية لعمال التربية S.N.T.E - الأمانة العامة الوطنية</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
