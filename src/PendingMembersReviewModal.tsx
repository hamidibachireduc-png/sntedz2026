import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';

interface PendingMembersReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onMemberUpdated?: () => void;
}

export const PendingMembersReviewModal: React.FC<PendingMembersReviewModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onMemberUpdated,
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWilaya, setFilterWilaya] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'rejected' | 'all'>('pending');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('لم يتم تسديد مبلغ الاشتراك (100 دج) ولم يتم اقتناء بطاقة الانخراط الورقية من الأمانة الولائية');

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const userWilayaCode = currentUser?.wilayaCode;

  const loadMembers = () => {
    try {
      const raw = localStorage.getItem('snte_members_v3');
      const all: any[] = raw ? JSON.parse(raw) : [];
      setMembers(all);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      setActionSuccessMsg('');
      setSelectedMemberForAction(null);
      if (!isNationalSG && userWilayaCode) {
        setFilterWilaya(userWilayaCode);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter members based on user authority
  const relevantMembers = members.filter((m) => {
    // Wilaya SG only sees their wilaya
    if (!isNationalSG && userWilayaCode) {
      const mCode = String(m.wilayaCode || '');
      if (mCode !== String(userWilayaCode) && !m.wilayaName?.includes(currentUser?.wilayaName || '')) {
        return false;
      }
    } else if (filterWilaya) {
      // National SG applied wilaya filter
      const mCode = String(m.wilayaCode || '');
      if (mCode !== filterWilaya) return false;
    }

    // Status filter
    const mStatus = m.membershipStatus || (m.status?.includes('مؤقت') || m.status?.includes('بانتظار') ? 'temporary_pending' : 'active');
    if (statusFilter === 'pending' && mStatus !== 'temporary_pending') return false;
    if (statusFilter === 'active' && mStatus !== 'active') return false;
    if (statusFilter === 'rejected' && mStatus !== 'rejected') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        m.fullName?.toLowerCase().includes(q) ||
        m.membershipCardNo?.toLowerCase().includes(q) ||
        m.nationalId?.includes(q) ||
        m.phone?.includes(q) ||
        m.institutionName?.toLowerCase().includes(q) ||
        m.wilayaName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const pendingCount = members.filter((m) => {
    if (!isNationalSG && userWilayaCode) {
      if (String(m.wilayaCode) !== String(userWilayaCode)) return false;
    }
    const mStatus = m.membershipStatus || (m.status?.includes('مؤقت') || m.status?.includes('بانتظار') ? 'temporary_pending' : 'active');
    return mStatus === 'temporary_pending';
  }).length;

  // 1. Activate Membership (Confirm 100 DA Payment and Paper Card Acquisition)
  const handleActivateMember = (member: any) => {
    try {
      const allMembersRaw = localStorage.getItem('snte_members_v3');
      const allMembers: any[] = allMembersRaw ? JSON.parse(allMembersRaw) : [];

      const updatedMembers = allMembers.map((m) => {
        if (m.id === member.id || m.membershipCardNo === member.membershipCardNo) {
          return {
            ...m,
            membershipStatus: 'active',
            status: 'نشط (معتمد رسمياً)',
            duesStatus: 'مدفوع',
            duesPaid: true,
            activatedBy: isNationalSG ? 'الأمين العام الوطني' : `الأمانة الولائية (${currentUser.wilayaName || currentUser.wilayaCode})`,
            activatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      localStorage.setItem('snte_members_v3', JSON.stringify(updatedMembers));

      // Also update accounts
      const allAccountsRaw = localStorage.getItem('snte_accounts_v3');
      const allAccounts: any[] = allAccountsRaw ? JSON.parse(allAccountsRaw) : [];
      const updatedAccounts = allAccounts.map((a) => {
        if (a.id === member.id || a.membershipCardNo === member.membershipCardNo) {
          return {
            ...a,
            status: 'نشط',
            membershipStatus: 'active',
            duesPaid: true,
          };
        }
        return a;
      });
      localStorage.setItem('snte_accounts_v3', JSON.stringify(updatedAccounts));

      // Add financial receipt (100 DA: 50% Wilaya + 50% National)
      try {
        const financesRaw = localStorage.getItem('snte_finances');
        const finances: any[] = financesRaw ? JSON.parse(financesRaw) : [];
        const receiptNo = `وصل-انخراط-${Date.now().toString().slice(-6)}`;
        const newFinanceRecord = {
          id: `fin-mem-${Date.now()}`,
          transactionNo: receiptNo,
          date: new Date().toISOString().split('T')[0],
          wilayaCode: member.wilayaCode || '01',
          wilayaName: member.wilayaName || 'الجزائر',
          type: 'اشتراك سنوي (100 دج)',
          amount: 100,
          direction: 'إيراد',
          wilayaShare: 50,
          nationalShare: 50,
          recordedBy: isNationalSG ? 'الأمانة الوطنية' : `الأمانة الولائية (${member.wilayaName})`,
          description: `تسديد اشتراك سنوي رسمي واقتناء بطاقة ورقية للمنخرط: ${member.fullName} (بطاقة رقم: ${member.membershipCardNo})`,
          receiptNumber: receiptNo,
        };
        localStorage.setItem('snte_finances', JSON.stringify([newFinanceRecord, ...finances]));
      } catch (finErr) {
        console.warn('Could not auto-record finance:', finErr);
      }

      loadMembers();
      setActionSuccessMsg(`✅ تم بنجاح تفعيل عضوية المنخرط (${member.fullName})، وتأكيد استلام وصل الاشتراك (100 دج) واقتناء البطاقة الورقية.`);
      if (onMemberUpdated) onMemberUpdated();
      window.dispatchEvent(new CustomEvent('snte-members-updated'));
    } catch (err: any) {
      alert('حدث خطأ أثناء التفعيل: ' + err.message);
    }
  };

  // 2. Reject Membership (Unpaid Dues / No Paper Card)
  const handleRejectMember = (member: any) => {
    try {
      const allMembersRaw = localStorage.getItem('snte_members_v3');
      const allMembers: any[] = allMembersRaw ? JSON.parse(allMembersRaw) : [];

      const updatedMembers = allMembers.map((m) => {
        if (m.id === member.id || m.membershipCardNo === member.membershipCardNo) {
          return {
            ...m,
            membershipStatus: 'rejected',
            status: 'مرفوض (غير مسدد)',
            duesStatus: 'غير مدفوع',
            duesPaid: false,
            rejectedBy: isNationalSG ? 'الأمين العام الوطني' : `الأمانة الولائية (${currentUser.wilayaName})`,
            rejectedAt: new Date().toISOString(),
            rejectionReason: rejectionReason.trim(),
          };
        }
        return m;
      });

      localStorage.setItem('snte_members_v3', JSON.stringify(updatedMembers));

      // Also update accounts
      const allAccountsRaw = localStorage.getItem('snte_accounts_v3');
      const allAccounts: any[] = allAccountsRaw ? JSON.parse(allAccountsRaw) : [];
      const updatedAccounts = allAccounts.map((a) => {
        if (a.id === member.id || a.membershipCardNo === member.membershipCardNo) {
          return {
            ...a,
            status: 'مرفوض',
            membershipStatus: 'rejected',
          };
        }
        return a;
      });
      localStorage.setItem('snte_accounts_v3', JSON.stringify(updatedAccounts));

      loadMembers();
      setSelectedMemberForAction(null);
      setActionSuccessMsg(`❌ تم إلغاء/رفض طلب انخراط (${member.fullName}) لعدم تسديد مبلغ الاشتراك واقتناء البطاقة.`);
      if (onMemberUpdated) onMemberUpdated();
      window.dispatchEvent(new CustomEvent('snte-members-updated'));
    } catch (err: any) {
      alert('حدث خطأ أثناء الرفض: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-emerald-500/30 overflow-hidden my-4 max-h-[92vh] flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 p-2 flex items-center justify-center border border-white/20 text-2xl">
              🪪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full uppercase">
                  إدارة طلبات الانخراط المؤقتة
                </span>
                <span className="text-xs text-emerald-200 font-bold">
                  {isNationalSG ? 'صلاحية وطنية شاملة' : `أمانة ولاية ${currentUser?.wilayaName || currentUser?.wilayaCode}`}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                متابعة تفعيل العضويات المؤقتة (فترة أسبوع) وتأكيد تسديد الاشتراكات (100 دج)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Operational Guidance Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>نظام الولوج المؤقت:</strong> يمنح المنخرط الجديد أسبوعاً (7 أيام) للاستفادة من خدمات البوابة، ويتم التفعيل النهائي بعد دفع 100 دج واقتناء البطاقة الورقية من الأمانة الولائية.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 text-amber-950 font-black px-2.5 py-0.5 rounded-full text-[11px]">
              طلبات بانتظار التفعيل: {pendingCount}
            </span>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-black flex items-center justify-between">
            <span>{actionSuccessMsg}</span>
            <button onClick={() => setActionSuccessMsg('')} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، رقم البطاقة، NIN، الهاتف، المؤسسة..."
                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
              />
              <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>

            {isNationalSG && (
              <select
                value={filterWilaya}
                onChange={(e) => setFilterWilaya(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006633]"
              >
                <option value="">-- كل الولايات (72) --</option>
                {WILAYAS_LIST.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - ولاية {w.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-200/80 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              ⏳ قيد الانتظار ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[#006633] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              ✅ معتمد رسمياً
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              ❌ مرفوض
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              📋 الكل ({relevantMembers.length})
            </button>
          </div>
        </div>

        {/* Members List Table / Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {relevantMembers.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-4xl block">📭</span>
              <h4 className="font-bold text-gray-700">لا توجد طلبات انخراط مطابقة لمعايير البحث الحالية</h4>
              <p className="text-gray-500 text-[11px]">
                {statusFilter === 'pending'
                  ? 'كافة طلبات الانخراط المؤقتة تم تفعيلها أو معالجتها بنجاح.'
                  : 'جرب تغيير معايير البحث أو تصفية الولايات.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {relevantMembers.map((m) => {
                const regTime = m.registrationTimestamp || (m.joinDate ? new Date(m.joinDate).getTime() : Date.now());
                const expiresTime = m.temporaryExpiresAt || (regTime + 7 * 24 * 60 * 60 * 1000);
                const isExpired = Date.now() > expiresTime;
                const daysLeft = Math.max(0, Math.ceil((expiresTime - Date.now()) / (1000 * 60 * 60 * 24)));
                
                const mStatus = m.membershipStatus || (m.status?.includes('مؤقت') || m.status?.includes('بانتظار') ? 'temporary_pending' : 'active');
                const isPending = mStatus === 'temporary_pending';
                const isActive = mStatus === 'active';
                const isRejected = mStatus === 'rejected';

                // Look up Wilaya SG contact
                const wilayaSGInfo = WILAYAS_LIST.find(
                  (w) => w.code === String(m.wilayaCode) || w.name === m.wilayaName
                );

                return (
                  <div
                    key={m.id || m.membershipCardNo}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPending
                        ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                        : isActive
                        ? 'bg-white border-emerald-300'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    {/* Member Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-gray-900">{m.fullName}</span>
                        
                        <span className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          🪪 بطاقة: {m.membershipCardNo}
                        </span>

                        {isPending && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isExpired
                              ? 'bg-red-200 text-red-950 animate-pulse'
                              : 'bg-amber-200 text-amber-950'
                          }`}>
                            {isExpired ? '⚠️ انتهت فترة الأسبوع المؤقتة' : `⏳ مؤقت (متبقي ${daysLeft} أيام)`}
                          </span>
                        )}

                        {isActive && (
                          <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            ✓ معتمد ومسدد رسمي (100 دج)
                          </span>
                        )}

                        {isRejected && (
                          <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
                            ✕ ملغى / غير مسدد
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600">
                        <div>
                          <span className="text-gray-400 block">الولاية / البلدية:</span>
                          <strong>ولاية {m.wilayaName} ({m.municipalName || 'المركز'})</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block">مؤسسة العمل / الرتبة:</span>
                          <strong>{m.institutionName || 'مؤسسة تربوية'} - {m.rank || 'أستاذ'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block">رقم NIN / الضمان:</span>
                          <span className="font-mono">{m.nationalId || '---'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">الهاتف / البريد:</span>
                          <span className="font-mono">{m.phone || '---'}</span>
                        </div>
                      </div>

                      {/* Wilaya SG reference note */}
                      {wilayaSGInfo && (
                        <div className="text-[10px] text-gray-500 bg-white/80 p-1.5 rounded-lg border border-gray-200 inline-flex items-center gap-2">
                          <span>🏛️ الأمانة الولائية المسؤولة:</span>
                          <strong className="text-emerald-900">{wilayaSGInfo.sgName}</strong>
                          <span className="font-mono">({wilayaSGInfo.phone})</span>
                        </div>
                      )}

                      {isRejected && m.rejectionReason && (
                        <div className="text-[11px] text-red-700 bg-red-100 p-2 rounded-lg font-bold">
                          سبب الإلغاء: {m.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleActivateMember(m)}
                            className="flex-1 md:flex-initial bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#004d26] hover:to-[#00371b] text-white px-4 py-2 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="تأكيد استلام 100 دج واقتناء البطاقة الورقية وتفعيل الحساب بشكل دائم"
                          >
                            <span>✅</span>
                            <span>تفعيل وسداد (100 دج)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedMemberForAction(m)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title="إلغاء أو رفض العضوية لعدم التسديد"
                          >
                            <span>❌</span>
                            <span>إلغاء / رفض</span>
                          </button>
                        </>
                      ) : isActive ? (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                          تم الاعتماد بتاريخ {m.activatedAt ? new Date(m.activatedAt).toLocaleDateString('ar-DZ') : m.joinDate}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivateMember(m)}
                          className="bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-300 transition-all cursor-pointer"
                        >
                          إعادة تفعيل
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Rejection Prompt */}
        {selectedMemberForAction && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl text-right space-y-3 border-2 border-red-400">
              <div className="flex items-center gap-2 text-red-700 font-black text-sm">
                <span>⚠️</span>
                <span>تأكيد رفض / إلغاء طلب انخراط: {selectedMemberForAction.fullName}</span>
              </div>
              <p className="text-xs text-gray-600">
                سيتم إيقاف صلاحية الدخول المؤقتة وحظر الحساب لعدم تسديد مبلغ الاشتراك (100 دج) واقتناء البطاقة الورقية من الأمانة الولائية.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">سبب الرفض:</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMemberForAction(null)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectMember(selectedMemberForAction)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
                >
                  تأكيد الرفض والإلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-gray-500 text-[11px]">
            إشراف: الأمانة العامة الوطنية - منظومة إدارة العضويات الرقمية S.N.T.E 2026
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
