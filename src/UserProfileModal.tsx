import React, { useState, useEffect } from 'react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        const uRaw = localStorage.getItem('snte_user');
        if (uRaw) {
          const u = JSON.parse(uRaw);
          setUser(u);
          setFormData({
            name: u.name || u.fullName || '',
            nationalId: u.nationalId || '',
            socialSecurityNo: u.socialSecurityNo || '',
            membershipCardNo: u.membershipCardNo || '',
            phone: u.phone || '',
            email: u.email || '',
            birthDate: u.birthDate || '',
            birthPlace: u.birthPlace || '',
            wilayaName: u.wilayaName || '',
            municipalName: u.municipalName || '',
            institutionName: u.institutionName || '',
            rank: u.rank || '',
            workplace: u.workplace || '',
          });
        }
      } catch (err) {
        console.error('Error loading user data', err);
      }
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    try {
      // 1. تحديث جلسة المستخدم الحالي
      const updatedUser = { ...user, ...formData, fullName: formData.name };
      localStorage.setItem('snte_user', JSON.stringify(updatedUser));

      // 2. تحديث بياناته في قاعدة بيانات المنخرطين الكلية
      const membersRaw = localStorage.getItem('snte_members_v3');
      if (membersRaw) {
        let members = JSON.parse(membersRaw);
        members = members.map((m: any) =>
          m.id === user.id || m.nationalId === user.nationalId
            ? { ...m, ...formData, fullName: formData.name }
            : m
        );
        localStorage.setItem('snte_members_v3', JSON.stringify(members));
      }

      setSuccessMsg('تم تحديث كافة بياناتك الشخصية والمهنية بنجاح ✅');
      window.dispatchEvent(new CustomEvent('snte-members-updated'));
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البيانات.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-['Cairo',sans-serif] text-right" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border-2 border-emerald-800 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-[#004d26] p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <h2 className="text-xl font-black text-white">إعدادات الحساب وتعديل البيانات</h2>
              <p className="text-emerald-200 text-xs mt-1">يمكنك تحديث كافة معلوماتك الشخصية والمهنية من هنا</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-300 text-2xl transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successMsg && (
            <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl p-3 text-sm font-bold text-center animate-pulse">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* البيانات الشخصية */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">الاسم واللقب</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">رقم التعريف الوطني NIN</label>
              <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">رقم الضمان الاجتماعي</label>
              <input type="text" name="socialSecurityNo" value={formData.socialSecurityNo} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">تاريخ الميلاد</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">مكان الميلاد</label>
              <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            {/* بيانات الاتصال والتوطين */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">الولاية</label>
              <input type="text" name="wilayaName" value={formData.wilayaName} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">البلدية</label>
              <input type="text" name="municipalName" value={formData.municipalName} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">رقم الهاتف</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" className="border border-gray-300 rounded-xl p-2.5 text-sm font-mono text-right focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">البريد الإلكتروني</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="border border-gray-300 rounded-xl p-2.5 text-sm text-right focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            {/* البيانات المهنية والنقابية */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">المؤسسة التربوية</label>
              <input type="text" name="institutionName" value={formData.institutionName} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">مقر العمل الفعلي</label>
              <input type="text" name="workplace" value={formData.workplace} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">الرتبة / السلك</label>
              <input type="text" name="rank" value={formData.rank} onChange={handleChange} className="border border-gray-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">رقم بطاقة الانخراط النقابية</label>
              <input type="text" name="membershipCardNo" value={formData.membershipCardNo} onChange={handleChange} className="border border-gray-300 bg-gray-50 rounded-xl p-2.5 text-sm font-mono focus:border-emerald-500 focus:outline-none shadow-sm" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-start gap-3 shrink-0">
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-emerald-950 font-black bg-amber-400 hover:bg-amber-300 shadow-md transition-colors flex items-center gap-2">
            <span>💾</span>
            <span>حفظ التعديلات</span>
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
