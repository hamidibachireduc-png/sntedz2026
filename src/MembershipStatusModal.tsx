import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST, WilayaData } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { getAllMembersWithSeed } from './membershipStatusData';

interface MembershipStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenCard?: (member: MemberData) => void;
  onOpenLogin?: () => void;
}

export const MembershipStatusModal: React.FC<MembershipStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenCard,
  onOpenLogin,
}) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('');
  const [now, setNow] = useState(Date.now());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // حالة لتعديل كافة البيانات
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<MemberData>>({});

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isWilayaSG = currentUser?.role === 'WILAYA_SG' || currentUser?.level === 'wilaya';

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    try {
      const uRaw = localStorage.getItem('snte_user');
      const u = uRaw ? JSON.parse(uRaw) : null;
      setCurrentUser(u);

      const all = getAllMembersWithSeed();
      setMembers(all);

      if (u && (u.role === 'WILAYA_SG' || u.level === 'wilaya')) {
        setSelectedWilayaFilter(String(u.wilayaCode));
      }

      if (u && (u.role === 'MEMBER' || u.level === 'member') && !searchQuery) {
        if (u.nationalId) setSearchQuery(u.nationalId);
        else if (u.membershipCardNo) setSearchQuery(u.membershipCardNo);
      }
    } catch {
      setMembers(getAllMembersWithSeed());
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionNotice(null);
      setEditingMemberId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) {
      return { isExpired: false, days: 7, hours: 0, minutes: 0, seconds: 0, totalHours: 168 };
    }
    const diff = expiresAt - now;
    if (diff <= 0) {
      return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    return { isExpired: false, days, hours, minutes, seconds, totalHours };
  };

  const formatExpiryDate = (expiresAt?: number) => {
    if (!expiresAt) return 'خلال 7 أيام من تاريخ التسجيل';
    try {
      const d = new Date(expiresAt);
      return d.toLocaleDateString('ar-DZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return new Date(expiresAt).toLocaleString();
    }
  };

  const getStatusCategory = (m: MemberData): 'pending' | 'active' | 'rejected' => {
    if (m.membershipStatus === 'rejected') return 'rejected';
    if (m.membershipStatus === 'active' || m.duesPaid) return 'active';
    return 'pending'; 
  };

  const securedMembers = members.filter((m) => {
    if (!isNationalSG && isWilayaSG) {
      return String(m.wilayaCode).padStart(2, '0') === String(currentUser?.wilayaCode).padStart(2, '0');
    }
    if (currentUser?.role === 'MEMBER' || currentUser?.level === 'member') {
      return m.id === currentUser.id || m.nationalId === currentUser.nationalId;
    }
    return true; 
  });

  const counts = {
    all: securedMembers.length,
    pending: securedMembers.filter((m) => getStatusCategory(m) === 'pending').length,
    active: securedMembers.filter((m) => getStatusCategory(m) === 'active').length,
    rejected: securedMembers.filter((m) => getStatusCategory(m) === 'rejected').length,
  };

  const filteredMembers = securedMembers.filter((m) => {
    const status = getStatusCategory(m);
    if (activeTab !== 'all' && status !== activeTab) return false;
    
    if (selectedWilayaFilter && String(m.wilayaCode) !== selectedWilayaFilter) return false;

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

  const handleAdminStatusChange = (
    memberId: string,
    newStatus: 'active' | 'rejected',
    reason?: string
  ) => {
    try {
      const updated = members.map((m) => {
        if (m.id === memberId) {
          if (newStatus === 'active') {
            return {
              ...m,
              membershipStatus: 'active' as const,
              duesPaid: true,
              status: 'نشط (عضوية دائمة معتمدة)',
              activatedBy: isNationalSG
                ? 'الأمين العام الوطني (الأستاذ قويدر يحياوي)'
                : `الأمانة الولائية (${currentUser?.wilayaName || ''})`,
              activatedAt: new Date().toISOString().split('T')[0],
            };
          } else {
            return {
              ...m,
              membershipStatus: 'rejected' as const,
              duesPaid: false,
              status: 'مرفوض',
              rejectionReason:
                reason ||
                'انقضاء مهلة الأسبوع دون تسديد مبلغ الاشتراك واقتناء البطاقة الورقية.',
            };
          }
        }
        return m;
      });

      setMembers(updated);
      localStorage.setItem('snte_members_v3', JSON.stringify(updated));

      if (currentUser?.id === memberId) {
        const updatedUser = updated.find((m) => m.id === memberId);
        if (updatedUser) {
          localStorage.setItem(
            'snte_user',
            JSON.stringify({ ...currentUser, ...updatedUser })
          );
        }
      }

      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      setActionNotice(
        newStatus === 'active'
          ? '✅ تم قبول وتثبيت العضوية وتأكيد سداد 100 دج واقتناء البطاقة الورقية بنجاح!'
          : '❌ تم تحويل حالة الطلب إلى مرفوض.'
      );
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('خطأ أثناء التحديث: ' + err.message);
    }
  };

  // دوال تعديل كافة البيانات
  const startEditing = (member: MemberData) => {
    setEditingMemberId(member.id);
    setEditFormData({
      fullName: member.fullName,
      nationalId: member.nationalId,
      socialSecurityNo: member.socialSecurityNo,
      membershipCardNo: member.membershipCardNo,
      phone: member.phone,
      email: member.email,
      birthDate: member.birthDate,
      birthPlace: member.birthPlace,
      rank: member.rank,
      institutionName: member.institutionName,
      municipalName: member.municipalName,
      wilayaName: member.wilayaName,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const saveEditedData = (memberId: string) => {
    try {
      const updated = members.map((m) => {
        if (m.id === memberId) {
          return { ...m, ...editFormData };
        }
        return m;
      });

      setMembers(updated);
      localStorage.setItem('snte_members_v3', JSON.stringify(updated));

      if (currentUser?.id === memberId || currentUser?.nationalId === editFormData.nationalId) {
        const updatedUser = updated.find((m) => m.id === memberId);
        if (updatedUser) {
          localStorage.setItem('snte_user', JSON.stringify({ ...currentUser, ...updatedUser }));
        }
      }

      setEditingMemberId(null);
      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      setActionNotice('✅ تم تحديث بيانات العضو بنجاح!');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('خطأ أثناء حفظ التعديلات: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div
        className="relative rounded-3xl shadow-2xl max-w-5xl w-full border-2 border-emerald-500/50 overflow-hidden my-auto max-h-[95vh] flex flex-col text-right text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 39, 18, 0.94), rgba(0, 50, 24, 0.92), rgba(0, 25, 11, 0.96)), url('/assets/aistudio/image_f36486a4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="border-b border-emerald-500/30 p-4 sm:p-6 bg-gradient-to-r from-[#002b15]/90 via-[#004d26]/80 to-[#002b15]/90 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/aistudio/image_f36486a4.png"
                  alt="S.N.T.E Emblem"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://l.top4top.io/p_37988hwfa0.png';
                  }}
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-3 py-0.5 rounded-full text-[11px] font-black shadow-xs mb-1">
                  <span>🏛️</span>
                  <span>النقابة الوطنية لعمال التربية والتكوين S.N.T.E</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                  لوحة تحكم وتعديل بيانات المنخرطين
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-0.5">
                  تحديث فوري لكافة بيانات العضوية الشخصية والمهنية وتتبع حالة الطلبات.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all cursor-pointer border border-white/20 shrink-0"
              title="إغلاق النافذة"
            >
              ✕
            </button>
          </div>

          {actionNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold animate-pulse text-center">
              {actionNotice}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-black/40 backdrop-blur-sm shrink-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم التعريف الوطني NIN، رقم البطاقة، أو الاسم..."
                className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-white/10 border-2 border-emerald-400/40 text-white placeholder-emerald-200/60 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400 focus:bg-black/60 transition-all text-right shadow-inner"
              />
              <span className="absolute right-3.5 top-2.5 text-lg text-amber-300">🔎</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-xs text-gray-400 hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>

            <select
              value={isWilayaSG && !isNationalSG ? String(currentUser?.wilayaCode) : selectedWilayaFilter}
              onChange={(e) => setSelectedWilayaFilter(e.target.value)}
              disabled={!isNationalSG}
              className={`w-full sm:w-52 py-2.5 px-3 rounded-2xl bg-[#00371b] border-2 border-emerald-400/40 text-white text-xs font-bold focus:outline-none transition-all ${
                !isNationalSG ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer focus:border-amber-400'
              }`}
            >
              {isNationalSG && <option value="">جميع الولايات (الـ 72)</option>}
              
              {!isNationalSG && isWilayaSG ? (
                <option value={String(currentUser?.wilayaCode)}>
                  ولاية {currentUser?.wilayaName || currentUser?.wilayaCode}
                </option>
              ) : (
                WILAYAS_LIST.map((w) => (
                  <option key={w.code} value={w.code} className="bg-slate-900 text-white">
                    {w.code} - ولاية {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <span>📋</span>
              <span>جميع الطلبات</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'all' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
              }`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md scale-102'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
            >
              <span className="animate-spin text-sm">⏳</span>
              <span>قيد الانتظار</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'pending' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-amber-300'
              }`}>
                {counts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'active'
                  ? 'bg-emerald-400 text-emerald-950 border-emerald-300 shadow-md scale-102'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border-emerald-400/40'
              }`}
            >
              <span>✅</span>
              <span>مقبول</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'active' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-emerald-300'
              }`}>
                {counts.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                activeTab === 'rejected'
                  ? 'bg-red-500 text-white border-red-300 shadow-md scale-102'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/40'
              }`}
            >
              <span>❌</span>
              <span>مرفوض</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'rejected' ? 'bg-emerald-950 text-white' : 'bg-black/40 text-red-300'
              }`}>
                {counts.rejected}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh] scrollbar-thin">
          {filteredMembers.length === 0 ? (
            <div className="bg-black/40 rounded-3xl p-8 text-center border border-white/10 my-4">
              <span className="text-5xl block mb-3">🔍</span>
              <h4 className="text-base sm:text-lg font-black text-amber-300">
                لم يتم العثور على طلبات مطابقة
              </h4>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const statusCat = getStatusCategory(member);
              const isEditing = editingMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className={`relative rounded-3xl p-4 sm:p-6 border-2 shadow-xl backdrop-blur-md transition-all text-slate-900 bg-white/95 overflow-hidden ${
                    statusCat === 'pending'
                      ? 'border-amber-400'
                      : statusCat === 'active'
                      ? 'border-emerald-500'
                      : 'border-red-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-sm border bg-emerald-100 text-emerald-800 border-emerald-300">
                        {statusCat === 'pending' ? '⏳' : statusCat === 'active' ? '✅' : '❌'}
                      </div>
                      <div>
                         <h3 className="font-black text-base sm:text-lg text-gray-900">
                           {member.fullName}
                         </h3>
                        <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2 font-medium items-center">
                           <span>🏛️ ولاية {member.wilayaName}</span>
                           <span>•</span>
                           <span>🏫 {member.institutionName}</span>
                           <span>•</span>
                           <span>💼 {member.rank || 'أستاذ'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-[10px] text-gray-500 font-bold">رقم بطاقة الانخراط:</div>
                      <div className="font-mono font-black text-sm text-[#006633] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        {member.membershipCardNo}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">NIN: {member.nationalId || '---'}</div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200">
                      <h4 className="font-black text-emerald-900 mb-3 text-sm flex items-center gap-1.5">
                        <span>📝</span>
                        <span>تعديل بيانات المنخرط</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">الاسم واللقب</label>
                          <input type="text" name="fullName" value={editFormData.fullName || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">رقم التعريف الوطني NIN</label>
                          <input type="text" name="nationalId" value={editFormData.nationalId || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">رقم الضمان الاجتماعي</label>
                          <input type="text" name="socialSecurityNo" value={editFormData.socialSecurityNo || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">رقم الهاتف</label>
                          <input type="text" name="phone" value={editFormData.phone || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">البريد الإلكتروني</label>
                          <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">تاريخ الميلاد</label>
                          <input type="date" name="birthDate" value={editFormData.birthDate || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">مكان الميلاد</label>
                          <input type="text" name="birthPlace" value={editFormData.birthPlace || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">المؤسسة التربوية</label>
                          <input type="text" name="institutionName" value={editFormData.institutionName || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">الرتبة / السلك</label>
                          <input type="text" name="rank" value={editFormData.rank || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">البلدية</label>
                          <input type="text" name="municipalName" value={editFormData.municipalName || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-600 font-bold">الولاية</label>
                          <input type="text" name="wilayaName" value={editFormData.wilayaName || ''} onChange={handleEditChange} className="bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                       {isEditing ? (
                          <>
                            <button onClick={() => saveEditedData(member.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                              💾 حفظ كافة التعديلات
                            </button>
                            <button onClick={() => setEditingMemberId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                              إلغاء
                            </button>
                          </>
                       ) : (
                          <button onClick={() => startEditing(member)} className="bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1">
                            <span>✏️</span> تعديل كامل البيانات
                          </button>
                       )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenCard && !isEditing && (
                        <button
                          type="button"
                          onClick={() => { onClose(); onOpenCard(member); }}
                          className={`font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            statusCat === 'active' ? 'bg-[#006633] hover:bg-[#004d26] text-white' : 'bg-amber-400 text-emerald-950'
                          }`}
                        >
                          <span>🪪</span>
                          <span>معاينة البطاقة</span>
                        </button>
                      )}

                      {(isNationalSG || isWilayaSG) && statusCat === 'pending' && !isEditing && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminStatusChange(member.id, 'active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            ✓ قبول (100 دج)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};