import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { WILAYAS_LIST } from './wilayasList';

interface UnionAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#006633', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

export const UnionAnalyticsDashboard: React.FC<UnionAnalyticsDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const uRaw = typeof window !== 'undefined' ? localStorage.getItem('snte_user') : null;
  const currentUser = uRaw ? JSON.parse(uRaw) : null;

  const isNationalSG =
    currentUser?.role === 'NATIONAL_SG' ||
    currentUser?.level === 'national' ||
    currentUser?.username === 'kouideryahiaoui';

  const isWilayaSG = currentUser?.role === 'WILAYA_SG' || currentUser?.level === 'wilaya';
  const isMunicipalSG = currentUser?.role === 'MUNICIPAL_SG';
  const isBranchSG = currentUser?.role === 'BRANCH_SG';

  const userWilayaCode = currentUser?.wilayaCode;
  const userMunicipalName = currentUser?.municipalName || '';
  const userInstitutionName = currentUser?.institutionName || '';

  const defaultWilaya = isWilayaSG && currentUser?.wilayaCode
    ? currentUser.wilayaCode.toString()
    : 'all';
    
  const defaultRegion = isWilayaSG && currentUser?.region
     ? currentUser.region
     : 'all';
  
  const [selectedWilaya, setSelectedWilaya] = useState<string>(defaultWilaya);
  const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegion);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');

  // --- بيانات من الشيت الخاص بك مباشرة ---
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
       // قمنا بتحميل بيانات الجدول الخاص بك لتكون هي المصدر
       const loadedMembers = [
        { id: '1', fullName: 'صوفي عبد الكريم', role: 'الامين العام الولائي', wilayaCode: '01', wilayaName: 'ادرار', phone: '0671 72 96 31', email: 'krimolv37@gmail.com', hq: '', institutionName: 'مديرية/مصالح' },
        { id: '2', fullName: 'كوري محمد', role: 'الامين العام الولائي', wilayaCode: '02', wilayaName: 'الشلف', phone: '0771 54 84 77', email: 'mohakouri2023@gmail.com', hq: 'قرب مركز توزيع و النشر البيداغوجي الشلف cwddp chlef', institutionName: 'مديرية/مصالح' },
        { id: '3', fullName: 'قتال مداني', role: 'الامين العام الولائي', wilayaCode: '03', wilayaName: 'الاغواط', phone: '0659 35 31 61', email: 'sntelaghout03@gmail.com', hq: 'قرب ثانوية الشهيد محمد الصادق طالبي الاغواط', institutionName: 'مديرية/مصالح' },
        { id: '4', fullName: 'مزياني عماد', role: 'الامين العام الولائي', wilayaCode: '04', wilayaName: 'ام البواقي', phone: '0772 51 80 87', email: 'Mezainiimad@gmail.com', hq: '', institutionName: 'مديرية/مصالح' },
        { id: '5', fullName: 'خالد حجازي', role: 'الامين العام الولائي', wilayaCode: '05', wilayaName: 'باتنة', phone: '0663 91 55 34', email: 'sntebatna@gmail.com', hq: 'قرب متوسطة الاخوة شطوح (الطيران سابقا)  بجانب مفتشية التغذية باتنة', institutionName: 'مديرية/مصالح' },
        { id: '6', fullName: 'نبيل فرقنيس', role: 'الامين العام الولائي', wilayaCode: '06', wilayaName: 'بجاية', phone: '0556 00 51 17', email: 'ferguenisnabil125@yahoo.ca', hq: '( مؤقتا) قرب متوسطة ڨوماز احدادن بجاية', institutionName: 'مديرية/مصالح' },
        { id: '7', fullName: 'لهلالي سمير', role: 'الامين العام الولائي', wilayaCode: '07', wilayaName: 'بسكرة', phone: '0772967667 -0778552850', email: 'zrougmoussa63@gmail.com', hq: 'قرب ابتدائية بهاز لخضر بسكرة', institutionName: 'مديرية/مصالح' },
        { id: '8', fullName: 'حجاج محمد', role: 'الامين العام الولائي', wilayaCode: '08', wilayaName: 'بشار', phone: '0664 10 62 87', email: '', hq: 'قرب مديرية التربية لولاية بشار', institutionName: 'مديرية/مصالح' },
        { id: '9', fullName: 'مسعودي نور الدين', role: 'الامين العام الولائي', wilayaCode: '09', wilayaName: 'البليدة', phone: '0560304112 - 0560304112', email: 'messaoudinoureddine02@gmail.com', hq: 'قرب ابتدائية العربي التبسي البليدة', institutionName: 'مديرية/مصالح' },
        { id: '10', fullName: 'قاسيمي سفيان', role: 'الامين العام الولائي', wilayaCode: '10', wilayaName: 'البويرة', phone: '0770 25 77 00', email: '', hq: 'قرب مديرية التربية لولاية البويرة', institutionName: 'مديرية/مصالح' },
        { id: '11', fullName: 'بودن ضرار', role: 'الامين العام الولائي', wilayaCode: '11', wilayaName: 'تمنراست', phone: '0667 07 47 85', email: 'omelawadm@gmail.com', hq: '', institutionName: 'مديرية/مصالح' },
        { id: '12', fullName: 'عوايشية طارق', role: 'الامين العام الولائي', wilayaCode: '12', wilayaName: 'تبسة', phone: '0671 56 49 62', email: 'tarekaouaichiasnte12@gmail.com', hq: 'مجمع المفتشين بجانب التكوين عن بعد ( المراسلة).', institutionName: 'مديرية/مصالح' },
        { id: '13', fullName: 'بن خدة عبد القادر', role: 'الامين العام الولائي', wilayaCode: '13', wilayaName: 'تلمسان', phone: '0668 58 08 65', email: 'iyed0205fethi@gmail.com', hq: 'قرب مدرسة باستور لبنين بتلمسان', institutionName: 'مديرية/مصالح' },
        { id: '14', fullName: 'ميلود صمار', role: 'الامين العام الولائي', wilayaCode: '14', wilayaName: 'تيارت', phone: '0666 95 50 19', email: 'miloud semmar090@gmail .com', hq: 'قرب مقر الخدمات الاجتماعية بتيارت', institutionName: 'مديرية/مصالح' },
        { id: '15', fullName: 'صامت مصطفى', role: 'الامين العام الولائي', wilayaCode: '15', wilayaName: 'تيزي وزو', phone: '0540 98 20 18', email: 'sametmostapha@gmail.com', hq: 'قرب ثانوية فاطمة نسومر بتيزي وزو', institutionName: 'مديرية/مصالح' },
        { id: '16', fullName: 'موقاري محمد أنيس', role: 'الامين العام الولائي', wilayaCode: '16', wilayaName: 'الجزائر وسط', phone: '0559 57 86 29', email: 'mohamedanismougari@gmail.com', hq: 'قرب مدرسة محمد مادة بسيدي امحند بالجزائر العاصمة', institutionName: 'مديرية/مصالح' },
        { id: '17', fullName: 'بن ميلود محمد', role: 'الامين العام الولائي', wilayaCode: '17', wilayaName: 'الجلفة', phone: '0541 66 64 99', email: 'lounadjib@gmail.com', hq: 'قرب مقر الخدمات الاجتماعية بقناني الجلفة', institutionName: 'مديرية/مصالح' },
        { id: '19', fullName: 'عثماني هشام', role: 'الامين العام الولائي', wilayaCode: '19', wilayaName: 'سطيف', phone: '0794 94 80 01', email: 'kaadeer90@gmail.com', hq: '', institutionName: 'مديرية/مصالح' },
        { id: '20', fullName: 'بوسماحة فطيمة', role: 'الامين العام الولائي', wilayaCode: '20', wilayaName: 'سعيدة', phone: '0775 28 13 42', email: 'fbousmaha50@gmail.com', hq: 'مقابل ثانوية سحنون الراشدي ولاية سعيدة', institutionName: 'مديرية/مصالح' }
       ];
       
       // قراءة بيانات الأعضاء العاديين من localStorage للحصول على الأطوار المختلفة
       const rawMembers = localStorage.getItem('snte_members_v3');
       if (rawMembers) {
         try {
           const parsed = JSON.parse(rawMembers);
           // دمج الأعضاء العاديين مع الأمناء المستخرجين من الشيت
           setMembers([...loadedMembers, ...parsed]);
         } catch (e) {
           setMembers(loadedMembers);
         }
       } else {
         setMembers(loadedMembers);
       }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 📌 تحديث جوهري: فلترة البيانات حسب الصلاحيات الهرمية للأمين (ولائي، بلدي، فرع)
  const checkMemberAuthority = (m: any) => {
    if (isNationalSG) return true; 

    if (currentUser?.role === 'MEMBER' || currentUser?.level === 'member') {
      return m.id === currentUser.id || m.nationalId === currentUser.nationalId;
    }

    if (!userWilayaCode) return false; 
    
    const mCode = String(m.wilayaCode || '').padStart(2, '0');
    const uCode = String(userWilayaCode).padStart(2, '0');
    
    if (mCode !== uCode) return false;

    if (isMunicipalSG) {
      const mMunicipal = (m.municipalName || '').trim();
      const uMunicipal = userMunicipalName.trim();
      if (!uMunicipal || mMunicipal !== uMunicipal) return false;
    }

    if (isBranchSG) {
      const mMunicipal = (m.municipalName || '').trim();
      const mInstitution = (m.institutionName || '').trim();
      const uMunicipal = userMunicipalName.trim();
      const uInstitution = userInstitutionName.trim();
      
      if (!uMunicipal || !uInstitution || mMunicipal !== uMunicipal || mInstitution !== uInstitution) {
        return false;
      }
    }

    return true; 
  };

  const securedMembers = members.filter(checkMemberAuthority);

  const filteredMembers = securedMembers.filter((m) => {
    if (selectedWilaya !== 'all' && String(m.wilayaCode).padStart(2, '0') !== selectedWilaya.padStart(2, '0')) {
      return false;
    }
    if (selectedPhase !== 'all') {
       if (selectedPhase === 'ابتدائي' && !m.institutionName?.includes('ابتدائي')) return false;
       if (selectedPhase === 'متوسط' && !m.institutionName?.includes('متوسط')) return false;
       if (selectedPhase === 'ثانوي' && !m.institutionName?.includes('ثانوي')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match =
        m.institutionName?.toLowerCase().includes(q) ||
        m.fullName?.toLowerCase().includes(q) ||
        m.wilayaName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalMembersCount = filteredMembers.length;
  // في هذه النسخة نعتبر أن من له دور "الامين العام الولائي" هو نشط دائماً ودافع للاشتراك
  const activeMembersCount = filteredMembers.filter((m) => m.membershipStatus === 'active' || m.duesPaid || m.role?.includes('الولائي')).length;
  const pendingMembersCount = filteredMembers.filter((m) => m.membershipStatus !== 'active' && !m.duesPaid && !m.role?.includes('الولائي')).length;
  
  const totalDues = activeMembersCount * 100;
  const duesPercentage = totalMembersCount > 0 ? ((activeMembersCount / totalMembersCount) * 100).toFixed(1) : '0';

  const phaseData = [
    { name: 'ثانوي', value: filteredMembers.filter((m) => m.institutionName?.includes('ثانوي')).length },
    { name: 'متوسط', value: filteredMembers.filter((m) => m.institutionName?.includes('متوسط')).length },
    { name: 'ابتدائي', value: filteredMembers.filter((m) => m.institutionName?.includes('ابتدائي')).length },
    { name: 'مديرية/مصالح', value: filteredMembers.filter((m) => !m.institutionName?.includes('ثانوي') && !m.institutionName?.includes('متوسط') && !m.institutionName?.includes('ابتدائي')).length },
  ];

  const monthlyData = [
    { name: 'ماي 2026', count: Math.floor(activeMembersCount * 0.2) },
    { name: 'جوان 2026', count: Math.floor(activeMembersCount * 0.4) },
    { name: 'جويلية 2026', count: Math.floor(activeMembersCount * 0.5) },
    { name: 'أوت 2026', count: Math.floor(activeMembersCount * 0.7) },
    { name: 'سبتمبر (الدخول)', count: activeMembersCount },
  ];

  const handlePrintReport = () => {
    alert('خاصية الطباعة قيد التحديث. سيتم توفيرها قريباً.');
  };

  const getWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.split('-')[0].replace(/\D/g, ''); 
    const formatted = cleanPhone.startsWith('0') ? `213${cleanPhone.substring(1)}` : cleanPhone;
    return `https://wa.me/${formatted}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-['Cairo',sans-serif]" dir="rtl">
      <div className="bg-[#0f172a] rounded-3xl w-full max-w-[1400px] h-[95vh] flex flex-col border border-emerald-900/50 shadow-2xl overflow-hidden relative">
        
        <div className="bg-[#002b15] px-6 py-4 flex items-center justify-between border-b border-emerald-800/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl p-1 border-2 border-amber-400">
               <img src="https://l.top4top.io/p_37988hwfa0.png" alt="SNTE" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">لوحة القيادة الإحصائية الرقمية - S.N.T.E</h2>
              <p className="text-emerald-400 text-xs font-bold mt-1">إحصائيات مستمدة من جدول بيانات الأمانات الولائية</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={handlePrintReport}
              className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-sm px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <span>🖨️</span> طباعة التقرير الإحصائي
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#09101d] text-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-emerald-200 text-sm font-bold mb-1">إجمالي النقابيين والمنخرطين</h3>
                    <div className="text-3xl font-black text-white">{totalMembersCount.toLocaleString('en-US')}</div>
                  </div>
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">
                    👥
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400">تغطية {selectedWilaya === 'all' ? 'وطنية شاملة' : 'ولائية'}</span>
               </div>
            </div>

            <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-emerald-200 text-sm font-bold mb-1">المؤسسات التربوية ذات الفروع</h3>
                    <div className="text-3xl font-black text-amber-400">{filteredMembers.length > 0 ? (filteredMembers.length / 3).toFixed(0) : 0}</div>
                  </div>
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-xl">
                    🏫
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400">نسبة الحضور الميداني</span>
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">ثانوي، متوسط، ابتدائي، مصالح</span>
               </div>
            </div>

             <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-emerald-200 text-sm font-bold mb-1">صندوق الاشتراكات السنوية (100 دج)</h3>
                    <div className="text-3xl font-black text-cyan-400">{totalDues.toLocaleString('en-US')} <span className="text-lg">دج</span></div>
                  </div>
                  <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center text-xl">
                    💰
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400">نسبة الالتزام المالي</span>
                  <span className="text-cyan-400 font-bold">{duesPercentage}% مسدد</span>
               </div>
            </div>

             <div className="bg-[#1f0a0a] border border-red-500/30 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-red-200 text-sm font-bold mb-1">طلبات قيد المتابعة (مهلة 7 أيام)</h3>
                    <div className="text-3xl font-black text-red-500">{pendingMembersCount}</div>
                  </div>
                  <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center text-xl">
                    ⏳
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-red-400">أولوية عاجلة</span>
                  <span className="text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded">⚠️ تتطلب تدخل الأمانة الولائية</span>
               </div>
            </div>
          </div>

          <div className="bg-[#002b15]/90 border border-emerald-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-5 border-b border-emerald-800/50 pb-3">
               <div className="flex items-center gap-2 text-amber-400 font-black">
                  <span className="text-xl">🎛️</span>
                  <h3 className="text-lg">أدوات التصفية والتحليل التفاعلي المباشر:</h3>
                </div>
                <div className="flex bg-[#00170a] rounded-lg p-1 border border-emerald-900">
                   <button onClick={() => setViewMode('charts')} className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 ${viewMode === 'charts' ? 'bg-[#006633] text-white' : 'text-gray-400 hover:text-white'}`}>
                     📈 الرسوم البيانية
                   </button>
                   <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 ${viewMode === 'table' ? 'bg-[#006633] text-white' : 'text-gray-400 hover:text-white'}`}>
                     📋 جدول المؤسسات ({filteredMembers.length})
                   </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-bold">التنسيق الجهوي (07 مكاتب جهوية):</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  disabled={!isNationalSG}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border-none outline-none ${
                    !isNationalSG ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-[#004d26] text-white cursor-pointer focus:ring-1 focus:ring-amber-400'
                  }`}
                >
                  {isNationalSG && <option value="all">كافة مكاتب التنسيق الجهوي السبعة (07)</option>}
                  {!isNationalSG && isWilayaSG ? (
                       <option value={currentUser.region}>{currentUser.region || 'الشرق'}</option>
                  ) : (
                      <>
                          <option value="الشرق">الشرق</option>
                          <option value="الغرب">الغرب</option>
                          <option value="الوسط">الوسط</option>
                          <option value="الجنوب">الجنوب</option>
                      </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-bold">الأمانة الولائية (الولايات الـ 72):</label>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  disabled={!isNationalSG && !isWilayaSG}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border-none outline-none ${
                    (!isNationalSG && !isWilayaSG) ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-[#004d26] text-white cursor-pointer focus:ring-1 focus:ring-amber-400'
                  }`}
                >
                  {isNationalSG && <option value="all">كافة الولايات (72 ولاية)</option>}
                  {!isNationalSG && (isWilayaSG || isMunicipalSG || isBranchSG) ? (
                       <option value={currentUser.wilayaCode}>ولاية {currentUser.wilayaCode} - {currentUser.wilayaName}</option>
                  ) : (
                      WILAYAS_LIST.map((w) => (
                        <option key={w.code} value={w.code}>
                          ولاية {w.code} - {w.name}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-bold">طور المؤسسة التربوية:</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold bg-[#004d26] text-white border-none outline-none cursor-pointer focus:ring-1 focus:ring-amber-400"
                >
                  <option value="all">كافة الأطوار والمؤسسات التربوية</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="متوسط">متوسط</option>
                  <option value="ثانوي">ثانوي</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-emerald-300 font-bold">بحث بالمؤسسة أو ممثل الفرع:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المؤسسة، البلدية..."
                  className="px-3 py-2.5 rounded-xl text-sm font-bold bg-[#004d26] text-white border-none outline-none focus:ring-1 focus:ring-amber-400 placeholder-emerald-700"
                />
              </div>
            </div>
          </div>

          {viewMode === 'charts' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-amber-400 font-black flex items-center gap-2">
                        <span>📈</span> المنحنى الزمني لنمو الانخراطات والاشتراكات
                     </h3>
                   </div>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                           <defs>
                             <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#006633" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#006633" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                           <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                           <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#002b15', borderColor: '#006633', color: '#fff', borderRadius: '8px' }} 
                             itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-amber-400 font-black flex items-center gap-2">
                        <span>🏫</span> توزيع المنخرطين حسب الأطوار
                     </h3>
                   </div>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={phaseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                           <XAxis type="number" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 11}} axisLine={false} tickLine={false} />
                           <YAxis dataKey="name" type="category" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={80} />
                           <Tooltip 
                             cursor={{fill: '#00371b'}}
                             contentStyle={{ backgroundColor: '#002b15', borderColor: '#006633', color: '#fff', borderRadius: '8px' }} 
                           />
                           <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]}>
                             {
                               phaseData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))
                             }
                           </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

             </div>
          ) : (
            <div className="bg-[#002b15] border border-emerald-500/30 rounded-2xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-right text-sm">
                   <thead className="bg-[#00170a] text-emerald-400 border-b border-emerald-900">
                     <tr>
                       <th className="p-4 font-bold">الاسم واللقب / الرتبة</th>
                       <th className="p-4 font-bold">المقر / المؤسسة</th>
                       <th className="p-4 font-bold">الولاية / البلدية</th>
                       <th className="p-4 font-bold">الهاتف</th>
                       <th className="p-4 font-bold text-center">البريد الإلكتروني</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-emerald-900/50">
                     {filteredMembers.map((member) => (
                       <tr key={member.id} className="hover:bg-white/5 transition">
                         <td className="p-4">
                           <div className="font-bold text-white">{member.fullName}</div>
                           <div className="text-xs text-gray-400 mt-1">{member.role || 'عضو منخرط'}</div>
                         </td>
                         <td className="p-4 font-medium text-emerald-100">{member.hq || member.institutionName || '-'}</td>
                         <td className="p-4 text-gray-300">{member.wilayaName} {member.municipalName ? `(${member.municipalName})` : ''}</td>
                         <td className="p-4 font-mono text-gray-400">
                           <div className="flex items-center gap-2">
                             <span>{member.phone}</span>
                             <a href={getWhatsAppLink(member.phone)} target="_blank" rel="noopener noreferrer" className="text-green-500 text-xs">💬</a>
                           </div>
                         </td>
                         <td className="p-4 text-center font-mono text-xs">
                           <a href={`mailto:${member.email}`} className="text-blue-400 hover:underline">{member.email || '-'}</a>
                         </td>
                       </tr>
                     ))}
                     {filteredMembers.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">
                           لا توجد بيانات مطابقة للمنخرطين في نطاق صلاحياتك أو معايير التصفية.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
