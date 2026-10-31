import React, { useState } from 'react';
import { WILAYAS_LIST } from './wilayasList';

interface VirtualMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualMeetingModal: React.FC<VirtualMeetingModalProps> = ({ isOpen, onClose }) => {
  const uRaw = typeof window !== 'undefined' ? localStorage.getItem('snte_user') : null;
  const currentUser = uRaw ? JSON.parse(uRaw) : null;

  // تحديد مستويات الصلاحيات والمهام
  const role = currentUser?.role;
  const hierarchyRole = currentUser?.hierarchyRoleId || role;
  
  const isNationalSG = role === 'NATIONAL_SG' || currentUser?.level === 'national' || currentUser?.username === 'kouideryahiaoui';
  const isRegionalCoord = role === 'GENERAL_COORDINATOR' || hierarchyRole === 'regional-coordination';
  const isWilayaSG = role === 'WILAYA_SG' || hierarchyRole === 'wilaya-sg' || hierarchyRole === 'wilaya-secretariat';
  const isNationalCorps = hierarchyRole === 'national-corps';

  // تحديد القاعة الافتراضية حسب صلاحية المسؤول
  const defaultType = isNationalSG ? 'national' : 
                      isRegionalCoord ? 'my_region' : 
                      isWilayaSG ? 'my_wilaya' : 
                      isNationalCorps ? 'my_corps' : 'national';

  const [inMeeting, setInMeeting] = useState(false);
  const [meetingType, setMeetingType] = useState<string>(defaultType);
  
  // خاصيات الفلترة للأمين العام الوطني
  const [selectedRegion, setSelectedRegion] = useState(currentUser?.region || 'الشرق');
  const [selectedWilaya, setSelectedWilaya] = useState(currentUser?.wilayaCode?.toString() || '17');

  if (!isOpen) return null;

  // توليد كود واسم الغرفة بطريقة آمنة
  const generateRoomName = () => {
    const prefix = 'SNTE-Official-Meeting-2026-';
    
    // خيارات الأمين العام الوطني
    if (isNationalSG) {
      if (meetingType === 'national') return prefix + 'NATIONAL-ALL';
      if (meetingType === 'regional') return prefix + 'REGION-' + selectedRegion;
      if (meetingType === 'wilaya') return prefix + 'WILAYA-' + selectedWilaya;
    }

    // خيارات باقي القيادات
    if (meetingType === 'national') return prefix + 'NATIONAL-ALL';
    if (meetingType === 'my_region') return prefix + 'REGION-' + (currentUser?.region || 'الشرق');
    if (meetingType === 'my_wilaya') return prefix + 'WILAYA-' + (currentUser?.wilayaCode || '00');
    if (meetingType === 'my_corps') return prefix + 'CORPS-' + (currentUser?.id || '00');
    
    // الخيار الافتراضي لباقي المنخرطين
    return prefix + 'WILAYA-' + (currentUser?.wilayaCode || '00');
  };

  const roomName = generateRoomName();
  
  // تحديد المسمى الوظيفي الذي سيظهر في الفيديو تلقائياً
  const userDisplayName = isNationalSG ? 'الأمين العام الوطني' : 
                          isRegionalCoord ? `المنسق الجهوي - ${currentUser?.region || ''}` :
                          isWilayaSG ? `الأمانة الولائية - ولاية ${currentUser?.wilayaName || currentUser?.wilayaCode}` :
                          isNationalCorps ? `المنسق الوطني للرتبة` :
                          (currentUser?.name || currentUser?.fullName || 'عضو نقابي');
                          
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(userDisplayName)}"`;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 font-['Cairo']">
      <div className="bg-[#002b15] w-full max-w-6xl h-[90vh] rounded-3xl border-2 border-amber-400/50 shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-[#00170a] p-4 flex justify-between items-center border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🎥</span>
            <div>
              <h2 className="text-white font-black text-lg">قاعة الاجتماعات الافتراضية - S.N.T.E</h2>
              <p className="text-emerald-400 text-xs">اتصال مرئي مباشر ومشفر</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-red-500/20 hover:bg-red-500 text-red-100 px-4 py-2 rounded-xl font-bold transition">
            إغلاق القاعة ✕
          </button>
        </div>

        {!inMeeting ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-white text-center overflow-y-auto">
            <div className="bg-[#00371b] p-8 rounded-3xl max-w-md w-full border border-emerald-500/30 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-amber-400">بدء / الانضمام لاجتماع</h3>
              
              <div className="space-y-4 text-right">
                <label className="text-sm font-bold text-emerald-200 block">حدد القاعة أو نطاق الاجتماع:</label>
                <select 
                  value={meetingType} 
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#00170a] text-white border border-emerald-700 outline-none cursor-pointer focus:ring-1 focus:ring-amber-400"
                >
                  {isNationalSG && (
                    <>
                      <option value="national">القاعة الوطنية الشاملة</option>
                      <option value="regional">قاعات التنسيق الجهوي</option>
                      <option value="wilaya">قاعات الأمانات الولائية</option>
                    </>
                  )}
                  
                  {!isNationalSG && (
                    <>
                      {/* الخيارات تظهر ديناميكياً حسب صلاحية المسؤول */}
                      {isWilayaSG && <option value="my_wilaya">قاعة الأمانة الولائية (إدارة اجتماعات ولايتي)</option>}
                      {(isRegionalCoord || isWilayaSG) && <option value="my_region">قاعة التنسيق الجهوي (مكتب {currentUser?.region})</option>}
                      {isNationalCorps && <option value="my_corps">قاعة التنسيقية الوطنية للرتب والأسلاك</option>}
                      
                      <option value="national">القاعة الوطنية الشاملة (بدعوة من الأمانة العامة)</option>
                    </>
                  )}
                </select>

                {isNationalSG && meetingType === 'regional' && (
                  <div className="animate-fade-in">
                    <label className="text-xs font-bold text-gray-400 block mb-1 mt-2">اختر المنطقة:</label>
                    <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full p-3 rounded-xl bg-[#00170a] text-white border border-emerald-700 outline-none cursor-pointer">
                      <option value="الشرق">الشرق</option>
                      <option value="الغرب">الغرب</option>
                      <option value="الوسط">الوسط</option>
                      <option value="الجنوب">الجنوب</option>
                    </select>
                  </div>
                )}

                {isNationalSG && meetingType === 'wilaya' && (
                  <div className="animate-fade-in">
                    <label className="text-xs font-bold text-gray-400 block mb-1 mt-2">اختر الولاية:</label>
                    <select value={selectedWilaya} onChange={(e) => setSelectedWilaya(e.target.value)} className="w-full p-3 rounded-xl bg-[#00170a] text-white border border-emerald-700 outline-none cursor-pointer">
                      {WILAYAS_LIST.map((w) => (
                        <option key={w.code} value={w.code}>ولاية {w.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-[#00170a]/50 p-3 rounded-xl text-xs text-emerald-200/80 border border-emerald-900/50">
                سيتعرف النظام تلقائياً على صفتك كـ <strong>{userDisplayName}</strong> داخل غرفة الاجتماع.
              </div>

              <button 
                onClick={() => setInMeeting(true)}
                className="mt-6 w-full bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2"
              >
                <span>🚀</span> دخول قاعة الاجتماع
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-black w-full h-full relative">
            <iframe
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              src={jitsiUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              title="SNTE Virtual Meeting"
            />
          </div>
        )}
      </div>
    </div>
  );
};
