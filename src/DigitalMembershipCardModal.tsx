import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

export interface MemberData {
  id: string;
  nationalId: string; // NIN (18 digits)
  socialSecurityNo: string; // رقم الضمان الاجتماعي
  membershipCardNo: string; // رقم بطاقة الانخراط (مستقل عن التقسيم الجغرافي)
  fullName: string;
  birthDate?: string;
  birthPlace?: string; // مكان الميلاد
  gender?: string;
  email?: string;
  phone?: string;
  wilayaCode: string;
  wilayaName: string;
  municipalName: string;
  institutionName: string;
  rank?: string;
  workplace?: string;
  joinDate?: string;
  status?: string;
  avatarUrl?: string; // رابط الصورة الشخصية
  biometricFingerprintCode?: string; // كود البصمة الإلكترونية
  hierarchyRole?: string; // الصفة في السلم النقابي
  hierarchyLevel?: string; // المستوى في السلم النقابي
  membershipStatus?: 'temporary_pending' | 'active' | 'rejected';
  registrationTimestamp?: number;
  temporaryExpiresAt?: number;
  duesPaid?: boolean;
  annualRenewalDate?: string; // تاريخ تجديد الاشتراك السنوي
  lastRenewalTimestamp?: number; // وقت آخر تجديد للاشتراك
  activatedBy?: string;
  activatedAt?: string;
  rejectionReason?: string;
}

export const generateBiometricFingerprintCode = (member: {
  id?: string;
  nationalId?: string;
  membershipCardNo?: string;
  wilayaCode?: string;
}): string => {
  const seed = `${member.nationalId || ''}-${member.membershipCardNo || ''}-${member.wilayaCode || '40'}-2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(-6);
  return `BIO-${member.wilayaCode || '40'}-${hex}`;
};

interface DigitalMembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberData | null;
}

export const DigitalMembershipCardModal: React.FC<DigitalMembershipCardModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Active view side: 'front' | 'back' | 'both'
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [showPhotoOnCard, setShowPhotoOnCard] = useState(false);

  // Edit Profile & Photo State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(member?.fullName || '');
  const [editBirthDate, setEditBirthDate] = useState(member?.birthDate || '');
  const [editBirthPlace, setEditBirthPlace] = useState(member?.birthPlace || member?.municipalName || '');
  const [editPhone, setEditPhone] = useState(member?.phone || '');
  const [editEmail, setEditEmail] = useState(member?.email || '');
  const [editRank, setEditRank] = useState(member?.rank || '');
  const [editInstitution, setEditInstitution] = useState(member?.institutionName || '');
  const [editHierarchyRole, setEditHierarchyRole] = useState(member?.hierarchyRole || 'منخرط');
  const [editSocialSec, setEditSocialSec] = useState(member?.socialSecurityNo || '');
  const [editNIN, setEditNIN] = useState(member?.nationalId || '');
  const [editWilayaName, setEditWilayaName] = useState(member?.wilayaName || '');
  const [editMunicipalName, setEditMunicipalName] = useState(member?.municipalName || '');
  const [editCardNo, setEditCardNo] = useState(member?.membershipCardNo || 'SNTE-2026-0001');
  const [editYear, setEditYear] = useState('2026');
  const [editAvatarUrl, setEditAvatarUrl] = useState(member?.avatarUrl || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const biometricCode =
    member?.biometricFingerprintCode ||
    generateBiometricFingerprintCode(member || { id: '0', wilayaCode: '40' });

  // Generate dynamic QR code for digital and print validation
  useEffect(() => {
    if (member) {
      const cardNum = editCardNo || member.membershipCardNo || 'SNTE-2026-0001';
      const nin = editNIN || member.nationalId || '';
      const payload = `SNTE-AUTH|CARD:${cardNum}|NIN:${nin}|BIO:${biometricCode}|YEAR:${editYear}|MEMBER:${encodeURIComponent(editFullName || member.fullName)}`;
      QRCode.toDataURL(payload, {
        margin: 1,
        width: 160,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.warn('QR Generation Error:', err));
    }
  }, [member, editCardNo, editNIN, biometricCode, editYear, editFullName]);

  useEffect(() => {
    if (member) {
      setEditFullName(member.fullName || '');
      setEditBirthDate(member.birthDate || '');
      setEditBirthPlace(member.birthPlace || member.municipalName || '');
      setEditPhone(member.phone || '');
      setEditEmail(member.email || '');
      setEditRank(member.rank || 'أستاذ التعليم الثانوي');
      setEditInstitution(member.institutionName || 'مؤسسة تربوية');
      setEditHierarchyRole(member.hierarchyRole || 'منخرط');
      setEditSocialSec(member.socialSecurityNo || '168409123456');
      setEditNIN(member.nationalId || '198416010045230001');
      setEditWilayaName(member.wilayaName || 'الجزائر');
      setEditMunicipalName(member.municipalName || 'الوسط');
      setEditCardNo(member.membershipCardNo || 'SNTE-2026-0001');
      setEditAvatarUrl(member.avatarUrl || '');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64String = uploadEvent.target?.result as string;
      if (base64String) {
        setEditAvatarUrl(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updatedMember: MemberData = {
      ...member,
      fullName: editFullName,
      birthDate: editBirthDate,
      birthPlace: editBirthPlace,
      phone: editPhone,
      email: editEmail,
      rank: editRank,
      institutionName: editInstitution,
      hierarchyRole: editHierarchyRole,
      socialSecurityNo: editSocialSec,
      nationalId: editNIN,
      wilayaName: editWilayaName,
      municipalName: editMunicipalName,
      membershipCardNo: editCardNo,
      avatarUrl: editAvatarUrl,
      biometricFingerprintCode: biometricCode,
    };

    // Update snte_user in localStorage if it matches
    try {
      const uRaw = localStorage.getItem('snte_user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        if (u.id === member.id || u.nationalId === member.nationalId) {
          const newU = {
            ...u,
            fullName: editFullName,
            name: editFullName,
            birthDate: editBirthDate,
            birthPlace: editBirthPlace,
            phone: editPhone,
            email: editEmail,
            rank: editRank,
            institutionName: editInstitution,
            hierarchyRole: editHierarchyRole,
            socialSecurityNo: editSocialSec,
            nationalId: editNIN,
            wilayaName: editWilayaName,
            municipalName: editMunicipalName,
            membershipCardNo: editCardNo,
            avatarUrl: editAvatarUrl,
          };
          localStorage.setItem('snte_user', JSON.stringify(newU));
        }
      }
    } catch (err) {
      console.warn(err);
    }

    // Update snte_members_v3 in localStorage
    try {
      const raw = localStorage.getItem('snte_members_v3');
      if (raw) {
        const members: any[] = JSON.parse(raw);
        const updatedMembers = members.map((m) =>
          m.id === member.id || m.nationalId === member.nationalId ? updatedMember : m
        );
        localStorage.setItem('snte_members_v3', JSON.stringify(updatedMembers));
      }
    } catch (err) {
      console.warn(err);
    }

    window.dispatchEvent(new CustomEvent('snte-members-updated'));
    window.dispatchEvent(new CustomEvent('snte-user-updated'));

    setIsEditing(false);
    alert('تم حفظ وتحديث بيانات البطاقة بنجاح!');
  };

  // Render the literal Front Face of the membership card with pixel-accurate SVG overlay
  const renderFrontFace = () => (
    <div className="relative aspect-[629/249] w-full max-w-[620px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-400/50 bg-white select-none">
      <img
        src="/sntedz2026/Screenshot_2026-10-24-13-12-59-21_c0d35d5c8ea536686f7fb1c9f2f8f274_df626750.jpg"
        alt="الوجه الأمامي لبطاقة الانخراط"
        className="w-full h-full object-contain block"
      />

      {/* Pixel-Accurate SVG Overlay for Front Face (629 x 249) */}
      <svg
        viewBox="0 0 629 249"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ direction: 'ltr' }}
      >
        {/* Left Half (بطاقة المنخرط) */}
        {/* Card Number on dotted line to the left of label */}
        <text
          x="110"
          y="204"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Cairo', monospace"
          fill="#0f172a"
        >
          {editCardNo || member.membershipCardNo}
        </text>

        {/* Year on dotted line to the left of label */}
        <text
          x="110"
          y="223"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Cairo', sans-serif"
          fill="#0f172a"
        >
          {editYear}
        </text>

        {/* Right Half (وصل الأمانة الولائية) */}
        {/* Card Number on dotted line to the left of label */}
        <text
          x="465"
          y="168"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Cairo', monospace"
          fill="#0f172a"
        >
          {editCardNo || member.membershipCardNo}
        </text>

        {/* Year on dotted line to the left of label */}
        <text
          x="465"
          y="196"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Cairo', sans-serif"
          fill="#0f172a"
        >
          {editYear}
        </text>
      </svg>
    </div>
  );

  // Render the literal Back Face of the membership card with pixel-accurate SVG overlay
  // STAMP IS OMITTED as requested (distributed to wilayas for physical stamping)
  // Photo box and Electronic Biometric Fingerprint (QR Code) added matching user diagram
  const renderBackFace = () => {
    const birthString =
      (editBirthDate || member.birthDate || '1985-05-15') +
      (editBirthPlace ? ` بـ ${editBirthPlace}` : '');
    const wilayaString = `${editWilayaName || member.wilayaName || 'الجزائر'} (${member.wilayaCode})`;
    const municipalString = editMunicipalName || member.municipalName || 'الوسط';

    return (
      <div className="relative aspect-[607/253] w-full max-w-[620px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-400/50 bg-white select-none">
        <img
          src="/sntedz2026/Screenshot_2026-10-24-13-13-23-51_c0d35d5c8ea536686f7fb1c9f2f8f274_93a58b8d.jpg"
          alt="الوجه الخلفي لبطاقة الانخراط"
          className="w-full h-full object-contain block"
        />

        {/* Pixel-Accurate SVG Overlay for Back Face (607 x 253) */}
        <svg
          viewBox="0 0 607 253"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ direction: 'ltr' }}
        >
          <defs>
            <clipPath id="photoClipLeft">
              <rect x="13" y="16" width="82" height="93" rx="3" />
            </clipPath>
          </defs>

          {/* ================= LEFT HALF (بطاقة المنخرط) ================= */}
          {/* 1. Photo Box Frame (x: 12..96, y: 15..110) as shown in user's diagram */}
          <g>
            <rect
              x="12"
              y="15"
              width="84"
              height="95"
              rx="4"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {editAvatarUrl || member.avatarUrl ? (
              <image
                href={editAvatarUrl || member.avatarUrl}
                x="13"
                y="16"
                width="82"
                height="93"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#photoClipLeft)"
              />
            ) : (
              <g>
                <rect x="13" y="16" width="82" height="93" rx="3" fill="#f8fafc" />
                <circle cx="54" cy="50" r="16" fill="#cbd5e1" />
                <path d="M 54 44 A 6 6 0 1 1 54 56 A 6 6 0 1 1 54 44 Z" fill="#64748b" />
                <path d="M 42 66 C 42 60, 48 59, 54 59 C 60 59, 66 60, 66 66 Z" fill="#64748b" />
                <text
                  x="54"
                  y="82"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="'Cairo', sans-serif"
                  fill="#1e293b"
                >
                  صورة المنخرط
                </text>
                <text
                  x="54"
                  y="93"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="600"
                  fontFamily="'Cairo', sans-serif"
                  fill="#64748b"
                >
                  (3.5 × 4.5 سم)
                </text>
              </g>
            )}
          </g>

          {/* Line 1: الإسم واللقب (dots: 98..290 alongside photo) */}
          <text
            x="195"
            y="35"
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editFullName || member.fullName}
          </text>

          {/* Line 2: تاريخ ومكان الميلاد (dots: 98..260 alongside photo) */}
          <text
            x="185"
            y="52"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {birthString}
          </text>

          {/* Line 3: الوظيفة (dots: 98..305 alongside photo) */}
          <text
            x="195"
            y="71"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editRank || member.rank || 'أستاذ'}
          </text>

          {/* Line 4: مكان العمل (dots: 98..290 alongside photo) */}
          <text
            x="195"
            y="87"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editInstitution || member.institutionName || 'مؤسسة تربوية'}
          </text>

          {/* Line 5: الصفة النقابية (dots: 98..285 alongside photo) */}
          <text
            x="195"
            y="104"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="'Cairo', sans-serif"
            fill="#004d26"
          >
            {editHierarchyRole || member.hierarchyRole || 'منخرط'}
          </text>

          {/* Line 6: رقم الضمان الاجتماعي (dots: 20..255) */}
          <text
            x="137"
            y="120"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', monospace"
            fill="#0f172a"
          >
            {editSocialSec || member.socialSecurityNo || '168409123456'}
          </text>

          {/* Line 7: الرقم الوطني (NIN) (dots: 20..250) */}
          <text
            x="135"
            y="138"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', monospace"
            fill="#0f172a"
          >
            {editNIN || member.nationalId || '198416010045230001'}
          </text>

          {/* Line 8: الولاية (dots: 180..265) */}
          <text
            x="222"
            y="156"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {wilayaString}
          </text>

          {/* Line 8: البلدية (dots: 20..130) */}
          <text
            x="75"
            y="156"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {municipalString}
          </text>

          {/* Line 9: إمضاء المنخرط (dots: 175..260) - Stamp area left completely empty for local stamping */}
          <text
            x="217"
            y="178"
            textAnchor="middle"
            fontSize="8.5"
            fontStyle="italic"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#1e3a8a"
          >
            {editFullName || member.fullName}
          </text>

          {/* Electronic Biometric Fingerprint (QR Code + Auth Text) - Left Half */}
          <g>
            {qrDataUrl && (
              <image
                href={qrDataUrl}
                x="272"
                y="196"
                width="46"
                height="46"
              />
            )}
            <text
              x="268"
              y="207"
              textAnchor="end"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="'Cairo', sans-serif"
              fill="#006633"
            >
              SNTE - البصمة الإلكترونية
            </text>
            <text
              x="268"
              y="220"
              textAnchor="end"
              fontSize="6"
              fontWeight="bold"
              fontFamily="'Cairo', monospace"
              fill="#b91c1c"
            >
              رقم التوثيق: {editCardNo || member.membershipCardNo} / {biometricCode} / {editYear}
            </text>
            <text
              x="268"
              y="233"
              textAnchor="end"
              fontSize="5.5"
              fontWeight="600"
              fontFamily="'Cairo', sans-serif"
              fill="#334155"
            >
              امسح الرمز (QR) للتحقق من الوثيقة.
            </text>
          </g>

          {/* ================= RIGHT HALF (وصل الأمانة الولائية) ================= */}
          {/* Line 1: الإسم واللقب (dots: 330..535) */}
          <text
            x="432"
            y="35"
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editFullName || member.fullName}
          </text>

          {/* Line 2: تاريخ ومكان الميلاد (dots: 330..500) */}
          <text
            x="415"
            y="52"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {birthString}
          </text>

          {/* Line 3: الوظيفة (dots: 330..550) */}
          <text
            x="440"
            y="71"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editRank || member.rank || 'أستاذ'}
          </text>

          {/* Line 4: مكان العمل (dots: 330..535) */}
          <text
            x="432"
            y="87"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {editInstitution || member.institutionName || 'مؤسسة تربوية'}
          </text>

          {/* Line 5: الصفة النقابية (dots: 330..530) */}
          <text
            x="430"
            y="104"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="'Cairo', sans-serif"
            fill="#004d26"
          >
            {editHierarchyRole || member.hierarchyRole || 'منخرط'}
          </text>

          {/* Line 6: رقم الضمان الاجتماعي (dots: 330..500) */}
          <text
            x="415"
            y="120"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', monospace"
            fill="#0f172a"
          >
            {editSocialSec || member.socialSecurityNo || '168409123456'}
          </text>

          {/* Line 7: الرقم الوطني (NIN) (dots: 330..495) */}
          <text
            x="412"
            y="138"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', monospace"
            fill="#0f172a"
          >
            {editNIN || member.nationalId || '198416010045230001'}
          </text>

          {/* Line 8: الولاية (dots: 470..555) */}
          <text
            x="512"
            y="156"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {wilayaString}
          </text>

          {/* Line 8: البلدية (dots: 330..420) */}
          <text
            x="375"
            y="156"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#0f172a"
          >
            {municipalString}
          </text>

          {/* Line 9: إمضاء المنخرط (dots: 420..500) - Stamp area left completely empty for local stamping */}
          <text
            x="460"
            y="178"
            textAnchor="middle"
            fontSize="8.5"
            fontStyle="italic"
            fontWeight="bold"
            fontFamily="'Cairo', sans-serif"
            fill="#1e3a8a"
          >
            {editFullName || member.fullName}
          </text>

          {/* Electronic Biometric Fingerprint (QR Code + Auth Text) - Right Half */}
          <g>
            {qrDataUrl && (
              <image
                href={qrDataUrl}
                x="550"
                y="196"
                width="46"
                height="46"
              />
            )}
            <text
              x="546"
              y="207"
              textAnchor="end"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="'Cairo', sans-serif"
              fill="#006633"
            >
              SNTE - البصمة الإلكترونية
            </text>
            <text
              x="546"
              y="220"
              textAnchor="end"
              fontSize="6"
              fontWeight="bold"
              fontFamily="'Cairo', monospace"
              fill="#b91c1c"
            >
              رقم التوثيق: {editCardNo || member.membershipCardNo} / {biometricCode} / {editYear}
            </text>
            <text
              x="546"
              y="233"
              textAnchor="end"
              fontSize="5.5"
              fontWeight="600"
              fontFamily="'Cairo', sans-serif"
              fill="#334155"
            >
              امسح الرمز (QR) للتحقق من الوثيقة.
            </text>
          </g>
        </svg>
      </div>
    );
  };

  // Print Functionality for Double-Sided Membership Card (A4 Print Ready)
  // Perfectly matching the user's requirements with NO stamp and EXACT dotted line coordinates
  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة بطاقة الانخراط');
      return;
    }

    const birthString =
      (editBirthDate || member.birthDate || '1985-05-15') +
      (editBirthPlace ? ` بـ ${editBirthPlace}` : '');
    const wilayaString = `${editWilayaName || member.wilayaName || 'الجزائر'} (${member.wilayaCode})`;
    const municipalString = editMunicipalName || member.municipalName || 'الوسط';
    const cardNum = editCardNo || member.membershipCardNo;
    const memberName = editFullName || member.fullName;
    const rankName = editRank || member.rank || 'أستاذ';
    const institution = editInstitution || member.institutionName || 'مؤسسة تربوية';
    const role = editHierarchyRole || member.hierarchyRole || 'منخرط';
    const socSec = editSocialSec || member.socialSecurityNo || '168409123456';
    const nin = editNIN || member.nationalId || '198416010045230001';

    const cardHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>طباعة بطاقة الانخراط الرسمية - ${memberName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 15px;
            background: #fff;
            color: #000;
          }
          .sheet {
            max-width: 750px;
            margin: 0 auto;
            text-align: center;
          }
          .card-container {
            position: relative;
            width: 170mm;
            height: 68mm;
            margin: 10px auto;
            border: 1px dashed #cbd5e1;
            page-break-inside: avoid;
            background: #fff;
          }
          .card-bg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .svg-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          .label-header {
            font-size: 13px;
            font-weight: 800;
            color: #006633;
            margin: 12px 0 4px;
          }
          .cut-guide {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 4px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            .sheet { width: 100%; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="no-print" style="margin-bottom: 20px; text-align: center;">
            <button onclick="window.print()" style="background: #006633; color: white; padding: 10px 28px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; font-family: 'Cairo', sans-serif;">🖨️ بدء الطباعة الآن</button>
            <p style="font-size: 12px; color: #64748b; margin-top: 5px;">نموذج مطابق للأصل مطبوع على قياس البطاقة النقابية الرسمية لـ S.N.T.E (بدون ختم مسبق، يختم محلياً)</p>
          </div>

          <div class="label-header">الوجه الأمامي (بطاقة المنخرط + وصل الأمانة الولائية)</div>
          <div class="cut-guide">✂️ خط الطي والقص في المنتصف</div>
          <div class="card-container">
            <img src="/sntedz2026/Screenshot_2026-10-24-13-12-59-21_c0d35d5c8ea536686f7fb1c9f2f8f274_df626750.jpg" class="card-bg" />
            <svg viewBox="0 0 629 249" class="svg-overlay" style="direction: ltr;">
           {/* Left Half (بطاقة المنخرط) */}
            <text x="95" y="205" text-anchor="middle" font-size="11" font-weight="900" font-family="'Cairo', monospace" fill="#0f172a">${cardNum}</text>
             <text x="68" y="222" text-anchor="middle" font-size="11" font-weight="900" font-family="'Cairo', sans-serif" fill="#0f172a">${editYear}</text>

           {/* Right Half (وصل الأمانة الولائية) */}
          <text x="510" y="170" text-anchor="middle" font-size="11" font-weight="900" font-family="'Cairo', monospace" fill="#0f172a">${cardNum}</text>
          <text x="449" y="189" text-anchor="middle" font-size="11" font-weight="900" font-family="'Cairo', sans-serif" fill="#0f172a">${editYear}</text>
            </svg>
          </div>

          <div style="height: 15px;"></div>

          <div class="label-header">الوجه الخلفي (بيانات المنخرط الرسمية + وصل الأمانة الولائية)</div>
          <div class="cut-guide">✂️ يطابق خلفية البطاقة عند الطباعة على الوجهين أو الطي</div>
          <div class="card-container">
            <img src="/sntedz2026/Screenshot_2026-10-24-13-13-23-51_c0d35d5c8ea536686f7fb1c9f2f8f274_93a58b8d.jpg" class="card-bg" />
            <svg viewBox="0 0 607 253" class="svg-overlay" style="direction: ltr;">
              <defs>
                <clipPath id="printPhotoClip">
                  <rect x="13" y="16" width="82" height="93" rx="3" />
                </clipPath>
              </defs>

              <!-- Photo Box (Left Half) -->
              <rect x="12" y="15" width="84" height="95" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" />
              ${
                editAvatarUrl || member.avatarUrl
                  ? `<image href="${editAvatarUrl || member.avatarUrl}" x="13" y="16" width="82" height="93" preserveAspectRatio="xMidYMid slice" clip-path="url(#printPhotoClip)" />`
                  : `<g>
                      <rect x="13" y="16" width="82" height="93" rx="3" fill="#f8fafc" />
                      <circle cx="54" cy="50" r="16" fill="#cbd5e1" />
                      <text x="54" y="82" text-anchor="middle" font-size="8" font-weight="bold" font-family="'Cairo', sans-serif" fill="#1e293b">صورة المنخرط</text>
                      <text x="54" y="93" text-anchor="middle" font-size="6.5" font-weight="600" font-family="'Cairo', sans-serif" fill="#64748b">(3.5 × 4.5 سم)</text>
                    </g>`
              }

             <!-- Left Half (بطاقة المنخرط) -->
              <text x="195" y="35" text-anchor="middle" font-size="9" font-weight="900" font-family="'Cairo', sans-serif" fill="#0f172a">${memberName}</text>
              <text x="195" y="52" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${birthString}</text>
              <text x="195" y="71" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${rankName}</text>
              <text x="195" y="87" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${institution}</text>
              <text x="195" y="104" text-anchor="middle" font-size="8.5" font-weight="900" font-family="'Cairo', sans-serif" fill="#004d26">${role}</text>
              <text x="135" y="120" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', monospace" fill="#0f172a">${socSec}</text>
              <text x="135" y="138" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', monospace" fill="#0f172a">${nin}</text>
              <text x="314" y="152" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${wilayaString}</text>
              <text x="174" y="154" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${municipalString}</text>
              <text x="217" y="178" text-anchor="middle" font-size="8.5" font-style="italic" font-weight="bold" font-family="'Cairo', sans-serif" fill="#1e3a8a">${memberName}</text>
              <!-- Left Half QR & Biometric -->
              ${
                qrDataUrl
                  ? `<image href="${qrDataUrl}" x="272" y="196" width="46" height="46" />`
                  : ''
              }
              <text x="268" y="207" text-anchor="end" font-size="7.5" font-weight="900" font-family="'Cairo', sans-serif" fill="#006633">SNTE - البصمة الإلكترونية</text>
              <text x="268" y="220" text-anchor="end" font-size="6" font-weight="bold" font-family="'Cairo', monospace" fill="#b91c1c">رقم التوثيق: ${cardNum} / ${biometricCode} / ${editYear}</text>
              <text x="268" y="233" text-anchor="end" font-size="5.5" font-weight="600" font-family="'Cairo', sans-serif" fill="#334155">امسح الرمز (QR) للتحقق من الوثيقة.</text>

             <!-- Right Half (وصل الأمانة الولائية) -->
              <text x="430" y="35" text-anchor="middle" font-size="9" font-weight="900" font-family="'Cairo', sans-serif" fill="#0f172a">${memberName}</text>
              <text x="430" y="52" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${birthString}</text>
              <text x="430" y="71" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${rankName}</text>
              <text x="430" y="87" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${institution}</text>
              <text x="430" y="104" text-anchor="middle" font-size="8.5" font-weight="900" font-family="'Cairo', sans-serif" fill="#004d26">${role}</text>
              <text x="425" y="120" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', monospace" fill="#0f172a">${socSec}</text>
              <text x="425" y="138" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', monospace" fill="#0f172a">${nin}</text>
              <text x="533" y="161" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${wilayaString}</text>
              <text x="312" y="156" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="'Cairo', sans-serif" fill="#0f172a">${municipalString}</text>
              <text x="511" y="178" text-anchor="middle" font-size="8.5" font-style="italic" font-weight="bold" font-family="'Cairo', sans-serif" fill="#1e3a8a">${memberName}</text>
              <!-- Right Half QR & Biometric -->
              ${
                qrDataUrl
                  ? `<image href="${qrDataUrl}" x="550" y="196" width="46" height="46" />`
                  : ''
              }
              <text x="546" y="207" text-anchor="end" font-size="7.5" font-weight="900" font-family="'Cairo', sans-serif" fill="#006633">SNTE - البصمة الإلكترونية</text>
              <text x="546" y="220" text-anchor="end" font-size="6" font-weight="bold" font-family="'Cairo', monospace" fill="#b91c1c">رقم التوثيق: ${cardNum} / ${biometricCode} / ${editYear}</text>
              <text x="546" y="233" text-anchor="end" font-size="5.5" font-weight="600" font-family="'Cairo', sans-serif" fill="#334155">امسح الرمز (QR) للتحقق من الوثيقة.</text>
            </svg>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(cardHtml);
    printWindow.document.close();
  };

  const handleDownloadCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الشهادة');
      return;
    }

    const certHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>شهادة انخراط نقابي - ${editFullName || member.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap');
          body {
            font-family: 'Cairo', 'Amiri', serif;
            margin: 0;
            padding: 40px;
            color: #111827;
            background: #fff;
          }
          .border-frame {
            border: 4px double #006633;
            padding: 30px;
            border-radius: 12px;
            position: relative;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #006633;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 26px;
            font-weight: 900;
            color: #006633;
            margin: 10px 0;
          }
          .subtitle {
            font-size: 16px;
            color: #d21034;
            font-weight: bold;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          .info-table td {
            padding: 10px 14px;
            border: 1px solid #cbd5e1;
            font-size: 15px;
          }
          .label {
            background-color: #f1f5f9;
            font-weight: bold;
            width: 30%;
            color: #1e293b;
          }
          .val {
            font-weight: 700;
            color: #0f172a;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .sig-box {
            text-align: center;
            width: 45%;
          }
          .stamp-img {
            max-height: 110px;
            object-fit: contain;
            margin-top: 10px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="border-frame">
          <div class="header">
            <h3 style="margin: 0; font-size: 16px; color: #475569;">الجمهورية الجزائرية الديمقراطية الشعبية</h3>
            <div class="title">النقابة الوطنية لعمال التربية (S.N.T.E)</div>
            <div class="subtitle">SYNDICAT NATIONAL DES TRAVAILLEURS DE L'ÉDUCATION</div>
            <p style="font-size: 13px; color: #64748b; margin-top: 5px;">معتمدة قانونياً تحت رقم 2000/13/76 | مطابقة لمقتضيات القانون 23-02 المتعلق بممارسة الحق النقابي</p>
          </div>

          <h2 style="text-align: center; font-size: 22px; text-decoration: underline; color: #006633; margin-bottom: 25px;">شهــــادة انخــــراط نقــــابي</h2>

          <p style="font-size: 16px; line-height: 1.8; text-align: justify;">
            يشهد الأمين العام الوطني للنقابة الوطنية لعمال التربية بأن الموظف(ة) المبينة بياناته(ا) أدناه، مسجل(ة) بصفة رسمية في السجل الوطني للمنخرطين وحائز(ة) على بطاقة العضوية النقابية لسنة <strong>2026</strong>:
          </p>

          <table class="info-table">
            <tr>
              <td class="label">الاسم واللقب:</td>
              <td class="val">${editFullName || member.fullName}</td>
            </tr>
            <tr>
              <td class="label">تاريخ ومكان الميلاد:</td>
              <td class="val">${editBirthDate || member.birthDate || 'غير محدد'} ${editBirthPlace ? ` بـ ${editBirthPlace}` : ''}</td>
            </tr>
            <tr>
              <td class="label">رقم بطاقة الانخراط الوطنية:</td>
              <td class="val" style="color: #006633; font-size: 17px; font-weight: 900;">${editCardNo || member.membershipCardNo}</td>
            </tr>
            <tr>
              <td class="label">رقم التعريف الوطني (NIN):</td>
              <td class="val" style="letter-spacing: 1px;">${editNIN || member.nationalId}</td>
            </tr>
            <tr>
              <td class="label">رقم الضمان الاجتماعي:</td>
              <td class="val">${editSocialSec || member.socialSecurityNo || 'مسجل'}</td>
            </tr>
            <tr>
              <td class="label">الرتبة المهنية:</td>
              <td class="val">${editRank || member.rank || 'أستاذ'}</td>
            </tr>
            <tr>
              <td class="label">مؤسسة ومكان العمل:</td>
              <td class="val">${editInstitution || member.institutionName} - ${member.workplace || member.municipalName}</td>
            </tr>
            <tr>
              <td class="label">الولاية والبلدية:</td>
              <td class="val">${editWilayaName || member.wilayaName} (${member.wilayaCode}) - بلدية ${editMunicipalName || member.municipalName}</td>
            </tr>
            <tr>
              <td class="label">الهيكل والسلم النقابي:</td>
              <td class="val" style="color: #004d26; font-weight: 900;">${editHierarchyRole || member.hierarchyRole || 'منخرط'}</td>
            </tr>
            <tr>
              <td class="label">حالة الانخراط:</td>
              <td class="val" style="color: #059669; font-weight: bold;">ساري المفعول ومعتمد نظامياً لسنة 2026</td>
            </tr>
          </table>

          <div class="signatures">
            <div class="sig-box" style="width: 100%; text-align: center;">
              <p style="font-size: 14px; font-weight: bold;">حرر بتاريخ: ${new Date().toLocaleDateString('ar-DZ')}</p>
              <p style="font-size: 13px; color: #64748b; margin-top: 5px;">عن الأمانة الولائية / فرع المؤسسة</p>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(certHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-emerald-500/30 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
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
              <h3 className="font-extrabold text-base sm:text-lg">
                بطاقة الانخراط النقابية الرسمية (النموذج المعتمد)
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                النقابة الوطنية لعمال التربية S.N.T.E - مطابقة حرفية للسطور والبيانات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Card Side Switcher & Actions Bar */}
          <div className="bg-gray-100 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* View Side Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSide === 'front'
                    ? 'bg-[#006633] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🪪</span>
                <span>الوجه الأمامي (الغلاف والوصل)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSide === 'back'
                    ? 'bg-[#006633] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>📋</span>
                <span>الوجه الخلفي (بيانات المنخرط)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('both')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSide === 'both'
                    ? 'bg-[#006633] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>📑</span>
                <span>عرض الوجهين</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-2xs transition-all cursor-pointer border border-amber-500/40"
              >
                {isEditing ? '✕ إلغاء التعديل' : '✏️ تعديل البيانات'}
              </button>
            </div>
          </div>

          {/* Member Profile Edit Drawer */}
          {isEditing && (
            <div className="bg-gradient-to-br from-amber-50/40 via-white to-emerald-50/40 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-4 text-right shadow-md">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="font-black text-sm text-[#006633] flex items-center gap-2">
                  <span>📝</span>
                  <span>تحديث بيانات المنخرط وفق نموذج بطاقة الانخراط</span>
                </h4>
                <span className="text-[11px] text-gray-500 font-bold">التعديل يظهر فورياً على البطاقة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الاسم واللقب:</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">تاريخ الميلاد:</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">مكان الميلاد:</label>
                  <input
                    type="text"
                    value={editBirthPlace}
                    onChange={(e) => setEditBirthPlace(e.target.value)}
                    placeholder="مثال: خنشلة، الجزائر..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الوظيفة / الرتبة المهنية:</label>
                  <input
                    type="text"
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">مكان العمل (المؤسسة التربوية):</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الصفة النقابية:</label>
                  <input
                    type="text"
                    value={editHierarchyRole}
                    onChange={(e) => setEditHierarchyRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">رقم الضمان الاجتماعي:</label>
                  <input
                    type="text"
                    value={editSocialSec}
                    onChange={(e) => setEditSocialSec(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium font-mono focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الرقم الوطني (NIN):</label>
                  <input
                    type="text"
                    value={editNIN}
                    onChange={(e) => setEditNIN(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium font-mono focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">رقم البطاقة الوطنية:</label>
                  <input
                    type="text"
                    value={editCardNo}
                    onChange={(e) => setEditCardNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium font-mono focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الولاية:</label>
                  <input
                    type="text"
                    value={editWilayaName}
                    onChange={(e) => setEditWilayaName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">البلدية:</label>
                  <input
                    type="text"
                    value={editMunicipalName}
                    onChange={(e) => setEditMunicipalName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">سنة الانخراط:</label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-[#006633] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-[#006633] hover:bg-[#004d26] text-white font-black px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>
            </div>
          )}

          {/* Literal Card Visual Display based on User Templates */}
          <div ref={cardRef} className="space-y-6">
            {/* Show Front Face */}
            {(activeSide === 'front' || activeSide === 'both') && (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                    <span>🪪</span>
                    <span>الوجه الأمامي (بطاقة المنخرط + وصل الأمانة الولائية):</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">✂️ خط القص والطي بالمنتصف</span>
                </div>
                {renderFrontFace()}
              </div>
            )}

            {/* Show Back Face */}
            {(activeSide === 'back' || activeSide === 'both') && (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>الوجه الخلفي (بيانات المنخرط الرسمية + وصل الأمانة الولائية):</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    مطابقة تامة لسطور البيانات - مساحة الختم مخصصة للختم الولائي
                  </span>
                </div>
                {renderBackFace()}
              </div>
            )}
          </div>

          {/* Quick Notice Info */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <span>
                تطابق تام ومحاذاة دقيقة للبيانات فوق السطور المنقطة لبطاقة ووصل S.N.T.E. مساحة الختم متروكة خالية للختم المباشر على مستوى الأمانة الولائية.
              </span>
            </div>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-300">
              الثمن: 100 دج
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={handlePrintCard}
              className="bg-[#006633] hover:bg-[#004d26] text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>🖨️</span>
              <span>طباعة بطاقة الانخراط الرسمية (الوجهين وجه أمامي وخلفي)</span>
            </button>
            <button
              onClick={handleDownloadCertificate}
              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-amber-400"
            >
              <span>📄</span>
              <span>شهادة إثبات الانخراط (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
