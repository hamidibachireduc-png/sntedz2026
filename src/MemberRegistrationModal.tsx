import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST, EDUCATION_RANKS, WilayaData } from './wilayasList';
import { MemberData } from './DigitalMembershipCardModal';
import { OFFICIAL_UNION_ROLES } from './unionHierarchy';
import {
  findWilayaAllocation,
  generateNextCardNumberForWilaya,
  validateCardNumberSubmission,
  isCardNumberTaken,
  normalizeCardNumber,
  MAX_NATIONAL_CARD_NUMBER,
} from './cardAllocation';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newMember: MemberData) => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  // Form states matching requirements:
  // (الاسم واللقب وتاريخ الميلاد، الولاية والبلدية، ومؤسسة العمل والرتبة ومكان العمل، ورقم nin ورقم الضمان الاجتماعي)
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1985-05-15');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('17'); // Default: الجلفة
  const [municipalName, setMunicipalName] = useState('عين الإبل');
  const [institutionName, setInstitutionName] = useState('ثانوية عبد الحميد بن باديس');
  const [rank, setRank] = useState('أستاذ التعليم الثانوي');
  const [hierarchyRole, setHierarchyRole] = useState('منخرط');
  const [workplace, setWorkplace] = useState('المقر الرئيسي للمؤسسة');
  const [nationalId, setNationalId] = useState(''); // NIN 18 digits
  const [socialSecurityNo, setSocialSecurityNo] = useState(''); // رقم الضمان
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('snte2026');

  // Card Number choice / generation (governed by Wilaya Batches Quota)
  const [cardNumberType, setCardNumberType] = useState<'auto' | 'custom'>('auto');
  const [customCardNumber, setCustomCardNumber] = useState('');
  const [generatedCardNumber, setGeneratedCardNumber] = useState('');
  const [batchInfoLabel, setBatchInfoLabel] = useState('');
  const [isNationalReserve, setIsNationalReserve] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Step Modal State (for explicit contact notice to Wilaya SG or National SG)
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    member: MemberData;
    wilayaSG: { name: string; phone: string; headquarters: string };
  } | null>(null);

  const currentWilaya: WilayaData | undefined = WILAYAS_LIST.find(
    (w) => w.code === selectedWilayaCode
  );

  const currentAllocation = findWilayaAllocation(
    currentWilaya ? currentWilaya.name : selectedWilayaCode
  );

  // Generate card number according to Wilaya batches whenever modal opens or Wilaya changes
  const updateCardNumberForWilaya = (wilayaCodeOrName: string) => {
    const result = generateNextCardNumberForWilaya(wilayaCodeOrName);
    setGeneratedCardNumber(result.cardNumber);
    setBatchInfoLabel(result.batchLabel);
    setIsNationalReserve(result.isNationalReserve);
  };

  useEffect(() => {
    if (isOpen) {
      updateCardNumberForWilaya(selectedWilayaCode);
      setErrorMsg('');
      setRegistrationSuccessData(null);
    }
  }, [isOpen]);

  const handleWilayaChange = (newCode: string) => {
    setSelectedWilayaCode(newCode);
    const targetW = WILAYAS_LIST.find((w) => w.code === newCode);
    if (targetW) {
      updateCardNumberForWilaya(targetW.name);
    } else {
      updateCardNumberForWilaya(newCode);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('يرجى إدخال الاسم واللقب بالكامل.');
      return;
    }

    if (!nationalId.trim() || nationalId.trim().length < 8) {
      setErrorMsg('يرجى إدخال رقم التعريف الوطني NIN الصحيح (أرقام فقط).');
      return;
    }

    if (!socialSecurityNo.trim()) {
      setErrorMsg('يرجى إدخال رقم الضمان الاجتماعي.');
      return;
    }

    const wilayaIdentifier = currentWilaya ? currentWilaya.name : selectedWilayaCode;
    const rawCardToValidate =
      cardNumberType === 'custom' && customCardNumber.trim()
        ? customCardNumber.trim()
        : generatedCardNumber;

    // Check if the current session is National SG (who can authorize custom quotas)
    let isNationalSG = false;
    try {
      const uRaw = localStorage.getItem('snte_user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        isNationalSG =
          u?.role === 'NATIONAL_SG' ||
          u?.level === 'national' ||
          u?.username === 'kouideryahiaoui';
      }
    } catch {}

    // Strict validation against batch allocation and duplication in sheet
    const validation = validateCardNumberSubmission(
      rawCardToValidate,
      wilayaIdentifier,
      isNationalSG
    );

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'رقم بطاقة الانخراط غير صالح أو مكرر بالشيت.');
      return;
    }

    const finalCardNo = validation.normalizedCardNo;

    setIsSubmitting(true);

    try {
      const regTime = Date.now();
      const expiresTime = regTime + 7 * 24 * 60 * 60 * 1000; // 7 days grace period

      const newMember: MemberData = {
        id: `mem-${regTime}`,
        nationalId: nationalId.trim(),
        socialSecurityNo: socialSecurityNo.trim(),
        membershipCardNo: finalCardNo,
        fullName: fullName.trim(),
        birthDate: birthDate,
        gender: 'غير محدد',
        email: email.trim() || `member.${finalCardNo}@snte.dz`,
        phone: phone.trim() || '0550 00 00 00',
        wilayaCode: selectedWilayaCode,
        wilayaName: currentWilaya ? currentWilaya.name : selectedWilayaCode,
        municipalName: municipalName.trim() || 'المركز',
        institutionName: institutionName.trim() || 'مؤسسة تربوية',
        rank: rank,
        hierarchyRole: hierarchyRole,
        hierarchyLevel: OFFICIAL_UNION_ROLES.find((r) => r.title === hierarchyRole)?.level || 'منخرط',
        workplace: workplace.trim() || municipalName.trim(),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'مؤقت (أسبوع تجريبي)',
        membershipStatus: 'temporary_pending',
        registrationTimestamp: regTime,
        temporaryExpiresAt: expiresTime,
        duesPaid: false,
      };

      // 1. Save to members in localStorage (snte_members_v3)
      const existingMembersRaw = localStorage.getItem('snte_members_v3');
      const existingMembers: any[] = existingMembersRaw ? JSON.parse(existingMembersRaw) : [];
      
      // Strict duplicate double-check right before write
      if (existingMembers.some((m: any) => normalizeCardNumber(m.membershipCardNo) === finalCardNo)) {
        setIsSubmitting(false);
        setErrorMsg(`عذراً، رقم البطاقة (${finalCardNo}) مسجل ومحجوز مسبقاً في شيت المنخرطين. يمنع تكرار رقم الانخراط.`);
        return;
      }

      const updatedMembers = [newMember, ...existingMembers];
      localStorage.setItem('snte_members_v3', JSON.stringify(updatedMembers));

      // 2. Create account for member
      const existingAccountsRaw = localStorage.getItem('snte_accounts_v3');
      const existingAccounts: any[] = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];
      const memberAccount = {
        id: newMember.id,
        name: newMember.fullName,
        title: `${hierarchyRole} (مؤقت) - بطاقة ${newMember.membershipCardNo}`,
        structureName: `الأمانة الولائية - ولاية ${newMember.wilayaName}`,
        hierarchyRoleId: OFFICIAL_UNION_ROLES.find((r) => r.title === hierarchyRole)?.id || 'union-member',
        hierarchyRole: hierarchyRole,
        email: newMember.email,
        phone: newMember.phone,
        role: 'MEMBER',
        level: 'member',
        wilayaCode: newMember.wilayaCode,
        wilayaName: newMember.wilayaName,
        municipalName: newMember.municipalName,
        institutionName: newMember.institutionName,
        membershipCardNo: newMember.membershipCardNo,
        nationalId: newMember.nationalId,
        socialSecurityNo: newMember.socialSecurityNo,
        rank: newMember.rank,
        workplace: newMember.workplace,
        username: newMember.membershipCardNo,
        password: password.trim() || 'snte2026',
        status: 'مؤقت (أسبوع تجريبي)',
        membershipStatus: 'temporary_pending',
        registrationTimestamp: regTime,
        temporaryExpiresAt: expiresTime,
        isTemporary: true,
        daysRemaining: 7,
      };

      const updatedAccounts = [memberAccount, ...existingAccounts.filter((a) => a.id !== newMember.id)];
      localStorage.setItem('snte_accounts_v3', JSON.stringify(updatedAccounts));

      // Immediately log the new member in with their temporary active status
      localStorage.setItem('snte_user', JSON.stringify(memberAccount));

      // 3. Notify app components
      window.dispatchEvent(new CustomEvent('snte-member-registered', { detail: newMember }));
      onRegistered(newMember);

      // 4. Show mandatory activation message prompt
      setRegistrationSuccessData({
        member: newMember,
        wilayaSG: {
          name: currentWilaya?.sgName || 'الأمين العام الولائي',
          phone: currentWilaya?.phone || '0550 40 29 65',
          headquarters: currentWilaya?.headquarters || `المقر الولائي - ${currentWilaya?.name || ''}`,
        },
      });

      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('حدث خطأ أثناء حفظ الانخراط: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-emerald-500/30 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-amber-400 shrink-0">
              <img
                src="https://l.top4top.io/p_37988hwfa0.png"
                alt="S.N.T.E"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                استمارة تسجيل انخراط جديد واستصدار البطاقة النقابية
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                النقابة الوطنية لعمال التربية S.N.T.E - نظام حزم البطاقات الرسمي المعتمد 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Either Registration Success Prompt OR Registration Form */}
        {registrationSuccessData ? (
          /* ========================================================================= */
          /* Mandatory User Notice: Contact Wilaya SG or National SG for Activation   */
          /* ========================================================================= */
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto flex-1 text-right">
            <div className="w-16 h-16 bg-emerald-100 text-[#006633] rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner">
              ✨
            </div>

            <div className="text-center space-y-2">
              <span className="bg-emerald-100 text-[#006633] text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300">
                تم تسجيل الانخراط بنجاح في قاعدة البيانات (الشيت)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                أهلاً بك زميلنا المحترم: {registrationSuccessData.member.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                تم تخصيص وتسجيل رقم البطاقة النقابية الخاصة بكم وفق حزم ولاية{' '}
                <strong className="text-[#006633]">{registrationSuccessData.member.wilayaName}</strong>
              </p>
            </div>

            {/* Allocated Card Number Badge */}
            <div className="max-w-md mx-auto bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-400 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-amber-900 block mb-1">
                رقم بطاقتك النقابية المعتمد (غير قابل للتكرار):
              </span>
              <div className="text-3xl font-mono font-black text-[#006633] tracking-widest drop-shadow-xs">
                {registrationSuccessData.member.membershipCardNo}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 block">
                مربوط رسمياً بشيت المنخرطين - دورة 2026
              </span>
            </div>

            {/* MANDATORY NOTICE: 7-DAY TEMPORARY ACCESS & WILAYA SG CONTACT */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-right space-y-3">
              <div className="flex items-center justify-between text-amber-900 font-black text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <span>إعلام خاص: حسابك مفعل بصفة مؤقتة لمدة أسبوع (7 أيام)</span>
                </div>
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  ولوج مؤقت نشط
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-semibold">
                تم تفعيل حسابك بصفة مؤقتة لمدة <strong className="text-emerald-900">أسبوع (7 أيام)</strong> للاستفادة الفورية من كافة خدمات المنصات والحقائب النقابية والتربوية والقانونية.
                <br />
                <strong className="text-red-700 block mt-1.5">
                  📌 لتثبيت عضويتكم بشكل رسمي ودائم وتفادي انتهاء الصلاحية، يرجى التقرب من الأمانة الولائية التابع لها لاقتناء بطاقة الانخراط الورقية وتسديد مبلغ الاشتراك السنوي القانوني (100 دج).
                </strong>
              </p>

              {/* Wilaya SG Contact Card */}
              <div className="mt-3 bg-white p-3.5 rounded-xl border border-amber-300 text-xs text-gray-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-emerald-900">
                    🏛️ الأمين العام الولائي (ولاية {registrationSuccessData.member.wilayaName}):
                  </span>
                  <span className="text-[#006633] font-black">
                    {registrationSuccessData.wilayaSG.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📞 هاتف التواصل للتفعيل:</span>
                  <a
                    href={`tel:${registrationSuccessData.wilayaSG.phone.replace(/\s+/g, '')}`}
                    className="font-mono font-black text-blue-700 hover:underline direction-ltr"
                  >
                    {registrationSuccessData.wilayaSG.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-gray-600 text-[11px]">
                  <span>📍 مقر الأمانة الولائية:</span>
                  <span>{registrationSuccessData.wilayaSG.headquarters}</span>
                </div>
              </div>

              {/* National SG Contact */}
              <div className="bg-emerald-900 text-white p-3 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-black block">الأمانة العامة الوطنية (المركزية):</span>
                  <span className="text-[11px] text-amber-300">
                    الأمين العام الوطني: الأستاذ قويدر يحياوي
                  </span>
                </div>
                <div className="font-mono font-bold text-amber-300">
                  0550 40 29 65 / contact@snte.dz
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('snte-open-card'));
                  onClose();
                }}
                className="w-full sm:w-auto bg-[#006633] hover:bg-[#004d26] text-white font-black px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🪪</span>
                <span>استعراض وتحميل البطاقة النقابية الرقمية</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                تمت القراءة والإغلاق
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* Registration Form                                                         */
          /* ========================================================================= */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-right flex-1">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl text-xs font-black flex items-start gap-2.5">
                <span className="text-base shrink-0">🚫</span>
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Personal Info */}
            <div>
              <h4 className="text-xs font-black text-[#006633] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block mb-3">
                1. البيانات الشخصية والهوية الوطنية
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الاسم واللقب بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: محمد بن علي بن عمار"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم التعريف الوطني NIN (18 رقماً) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                    placeholder="119850000000000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الضمان الاجتماعي (بطاقة الشفاء) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={socialSecurityNo}
                    onChange={(e) => setSocialSecurityNo(e.target.value)}
                    placeholder="مثال: 178500123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Administrative and Wilaya Location */}
            <div>
              <h4 className="text-xs font-black text-[#006633] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block mb-3">
                2. التعيين الإداري والمهني والهيكل النقابي
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الولاية النقابية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWilayaCode}
                    onChange={(e) => handleWilayaChange(e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-400 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  >
                    {WILAYAS_LIST.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - ولاية {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    البلدية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={municipalName}
                    onChange={(e) => setMunicipalName(e.target.value)}
                    placeholder="اسم البلدية التابع لها"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    المؤسسة التربوية / مكان العمل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="اسم الثانوية / المتوسطة / الابتدائية"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الرتبة في قطاع التربية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  >
                    {EDUCATION_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>الهيكل والصفة في السلم النقابي <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-[#006633] font-bold">5 مستويات</span>
                  </label>
                  <select
                    value={hierarchyRole}
                    onChange={(e) => setHierarchyRole(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-400 bg-emerald-50/30 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  >
                    <optgroup label="المستوى القاعدي">
                      <option value="منخرط">🪪 منخرط (حامل بطاقة الانخراط)</option>
                    </optgroup>
                    <optgroup label="مستوى المؤسسات التربوية والفروع النقابية">
                      <option value="أمين عام فرع نقابي">🏫 أمين عام فرع نقابي بالمؤسسة</option>
                      <option value="عضو جمعية عامة فرع نقابي">🗳️ عضو جمعية عامة فرع نقابي</option>
                      <option value="أمانة الفرع النقابي">🤝 أمانة الفرع النقابي (مكتب المؤسسة)</option>
                    </optgroup>
                    <optgroup label="المستوى البلدي">
                      <option value="أمين عام بلدي">🏢 أمين عام بلدي</option>
                      <option value="عضو مجلس بلدي">👥 عضو مجلس بلدي</option>
                      <option value="الأمانة البلدية">📑 الأمانة البلدية</option>
                    </optgroup>
                    <optgroup label="المستوى الولائي">
                      <option value="أمين عام ولائي">🏛️ أمين عام ولائي</option>
                      <option value="عضو مجلس ولائي">📋 عضو مجلس ولائي</option>
                      <option value="الأمانة الولائية">🏬 الأمانة الولائية</option>
                      <option value="تنسيقيات ولائية للرتب والأسلاك">🏷️ تنسيقيات ولائية للرتب والأسلاك</option>
                    </optgroup>
                    <optgroup label="المستوى الوطني (القيادة المركزية)">
                      <option value="عضو مؤتمر وطني">🏛️ عضو مؤتمر وطني</option>
                      <option value="عضو مجلس وطني">📜 عضو مجلس وطني</option>
                      <option value="الأمانة الوطنية">💼 الأمانة الوطنية</option>
                      <option value="الأمانة الجهوية للتنسيق">🌐 الأمانة الجهوية للتنسيق</option>
                      <option value="تنسيقات وطنية للرتب والأسلاك">🎯 تنسيقات وطنية للرتب والأسلاك</option>
                      <option value="لجنة الحكماء (المتقاعدين)">👴 لجنة الحكماء (المتقاعدين)</option>
                      <option value="مستشار الشؤون القانونية والمنازعات">⚖️ مستشار الشؤون القانونية</option>
                      <option value="مستشار شؤون التربية والبيداغوجيا">🎓 مستشار شؤون التربية والبيداغوجيا</option>
                      <option value="مسؤولة عامة للخلية الوطنية للإعلام والتنظيم">📢 مسؤولة عامة للخلية الوطنية للإعلام والتنظيم</option>
                      <option value="مستشار المكلف بتقنيات التواصل والرقمنة">💻 مستشار المكلف بتقنيات التواصل</option>
                      <option value="أمين عام وطني">👑 أمين عام وطني</option>
                    </optgroup>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    مكان العمل الدقيق <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    placeholder="مثال: جناح التعليم الثانوي / الإدارة / مخبر العلوم"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Official Card Allocation and Numbering by Wilaya Batches */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 rounded-2xl border-2 border-amber-300">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <span>🪪</span>
                  <span>
                    ترقيم بطاقة الانخراط المعتمد لولاية {currentWilaya?.name || selectedWilayaCode}
                  </span>
                </h4>
                <span className="text-[10px] bg-[#006633] text-white font-black px-2.5 py-0.5 rounded-full">
                  ترتيب الحزم تصاعدياً
                </span>
              </div>

              {/* Display Wilaya Quota Batches */}
              {currentAllocation && currentAllocation.batches.length > 0 ? (
                <div className="bg-white/80 border border-emerald-300 rounded-xl p-2.5 mb-3 text-xs space-y-1">
                  <div className="font-bold text-[#006633] flex items-center gap-1.5">
                    <span>📦</span>
                    <span>الحزم المخصصة لولاية {currentAllocation.wilayaName}:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    {currentAllocation.batches.map((b, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold"
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 mb-3 text-[11px] text-blue-900">
                  ولاية {currentWilaya?.name}: الترقيم المعتمد من حصة التوزيع المركزي للأمانة العامة الوطنية (حتى 60000).
                </div>
              )}

              <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">
                يتم توليد رقم الانخراط آلياً وفق الحزم التصاعدية لولايتكم مع الفحص المباشر في شيت المنخرطين. 
                <strong className="text-red-700"> في حال كان الرقم مسجلاً بالشيت يرفض الانخراط فوراً.</strong>
              </p>

              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="radio"
                    name="cardChoice"
                    checked={cardNumberType === 'auto'}
                    onChange={() => setCardNumberType('auto')}
                    className="text-[#006633] focus:ring-[#006633]"
                  />
                  <span>توليد آلي حسب حزمة الولاية الشاغرة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="radio"
                    name="cardChoice"
                    checked={cardNumberType === 'custom'}
                    onChange={() => setCardNumberType('custom')}
                    className="text-[#006633] focus:ring-[#006633]"
                  />
                  <span>إدخال رقم بطاقة مخصص (يخضع لشرط الحزمة وعدم التكرار)</span>
                </label>
              </div>

              {cardNumberType === 'auto' ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border-2 border-emerald-500 font-mono font-black text-base text-[#006633] flex items-center justify-between shadow-xs">
                    <span>{generatedCardNumber}</span>
                    <span className="text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {batchInfoLabel || 'رقم شاغر ومتاح بالشيت'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateCardNumberForWilaya(currentWilaya?.name || selectedWilayaCode)}
                    className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    🔄 تحديث الرقم
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={customCardNumber}
                      onChange={(e) => setCustomCardNumber(e.target.value)}
                      placeholder={
                        currentAllocation?.batches[0]
                          ? `أدخل رقماً ضمن الحزمة، مثلاً: ${currentAllocation.batches[0].start}`
                          : 'أدخل رقم البطاقة المطلوب (مثال: 0045 أو 12050)'
                      }
                      className="w-full px-3.5 py-2 bg-white border-2 border-amber-400 rounded-xl font-mono font-black text-sm text-[#006633] focus:outline-none focus:ring-2 focus:ring-[#006633]"
                    />
                  </div>
                  {customCardNumber.trim() && (
                    <div className="text-[11px] font-bold">
                      {isCardNumberTaken(customCardNumber) ? (
                        <span className="text-red-600 flex items-center gap-1">
                          ❌ هذا الرقم محجوز ومسجل مسبقاً في شيت المنخرطين (سيرفض التسجيل).
                        </span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-1">
                          ✅ الرقم متاح في شيت المنخرطين.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Contact & Login Credentials */}
            <div>
              <h4 className="text-xs font-black text-[#006633] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block mb-3">
                4. بيانات الاتصال وكلمة المرور لدخول البوابة
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الهاتف للتواصل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06XX XX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@snte.dz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    كلمة المرور للدخول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة مرور الحساب"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#004d26] hover:to-[#00371b] text-white font-black px-7 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>جاري التحقق من الشيت وحفظ الانخراط...</span>
                ) : (
                  <>
                    <span>✨</span>
                    <span>تأكيد التسجيل وربط البطاقة بالشيت</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
