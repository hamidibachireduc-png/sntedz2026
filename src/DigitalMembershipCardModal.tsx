import React, { useRef } from 'react';

export interface MemberData {
  id: string;
  nationalId: string; // NIN (18 digits)
  socialSecurityNo: string; // رقم الضمان الاجتماعي
  membershipCardNo: string; // رقم بطاقة الانخراط (مستقل عن التقسيم الجغرافي)
  fullName: string;
  birthDate?: string;
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
  avatarUrl?: string;
  hierarchyRole?: string; // الصفة في السلم النقابي
  hierarchyLevel?: string; // المستوى في السلم النقابي
  // Temporary grace period & activation fields
  membershipStatus?: 'temporary_pending' | 'active' | 'rejected';
  registrationTimestamp?: number;
  temporaryExpiresAt?: number;
  duesPaid?: boolean;
  activatedBy?: string;
  activatedAt?: string;
  rejectionReason?: string;
}

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

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = () => {
    // Generate clean print view for official certificate
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
        <title>شهادة انخراط نقابي - ${member.fullName}</title>
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
              <td class="val">${member.fullName}</td>
            </tr>
            <tr>
              <td class="label">تاريخ الميلاد:</td>
              <td class="val">${member.birthDate || 'غير محدد'}</td>
            </tr>
            <tr>
              <td class="label">رقم بطاقة الانخراط الوطنية:</td>
              <td class="val" style="color: #006633; font-size: 17px; font-weight: 900;">${member.membershipCardNo}</td>
            </tr>
            <tr>
              <td class="label">رقم التعريف الوطني (NIN):</td>
              <td class="val" style="letter-spacing: 1px;">${member.nationalId}</td>
            </tr>
            <tr>
              <td class="label">رقم الضمان الاجتماعي:</td>
              <td class="val">${member.socialSecurityNo || 'مسجل'}</td>
            </tr>
            <tr>
              <td class="label">الرتبة المهنية:</td>
              <td class="val">${member.rank || 'أستاذ'}</td>
            </tr>
            <tr>
              <td class="label">مؤسسة ومكان العمل:</td>
              <td class="val">${member.institutionName} - ${member.workplace || member.municipalName}</td>
            </tr>
            <tr>
              <td class="label">الولاية والبلدية:</td>
              <td class="val">${member.wilayaName} (${member.wilayaCode}) - بلدية ${member.municipalName}</td>
            </tr>
            <tr>
              <td class="label">الهيكل والسلم النقابي:</td>
              <td class="val" style="color: #004d26; font-weight: 900;">${member.hierarchyRole || 'منخرط'}</td>
            </tr>
            <tr>
              <td class="label">حالة الانخراط:</td>
              <td class="val" style="color: #059669; font-weight: bold;">ساري المفعول ومعتمد نظامياً لسنة 2026</td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #475569; margin-top: 15px;">
            سلمت هذه الشهادة للمعني(ة) بالأمر للإدلاء بها واستعمالها في حدود ما يسمح به القانون والنظام الداخلي للنقابة.
          </p>

          <div class="signatures">
            <div class="sig-box">
              <p style="font-size: 14px; font-weight: bold;">حرر بتاريخ: ${new Date().toLocaleDateString('ar-DZ')}</p>
              <p style="font-size: 13px; color: #64748b;">عن الأمانة الولائية / فرع المؤسسة</p>
            </div>
            <div class="sig-box">
              <p style="font-size: 15px; font-weight: 900; color: #006633;">الأمين العام الوطني للنقابة</p>
              <p style="font-size: 14px; font-weight: bold;">الأستاذ قويدر يحياوي</p>
              <img src="/assets/aistudio/image_49bcf1f2.png" alt="ختم وتوقيع الأمين العام الوطني" class="stamp-img">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto font-['Cairo',sans-serif]">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-emerald-500/30 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#006633] to-[#004d26] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-amber-400 shrink-0">
              <img
                src="https://l.top4top.io/p_37988hwfa0.png"
                alt="S.N.T.E"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">بطاقة الانخراط النقابية الوطنية الرقمية</h3>
              <p className="text-xs text-amber-300 font-medium">النقابة الوطنية لعمال التربية S.N.T.E - دورة 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Card Visual Container (Front & Back or Master Card) */}
          <div
            ref={cardRef}
            className="relative mx-auto max-w-[500px] bg-gradient-to-br from-emerald-900 via-[#006633] to-emerald-950 text-white rounded-2xl p-5 shadow-2xl border-2 border-amber-400 overflow-hidden"
          >
            {/* Watermark Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Top Card Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-amber-400/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-white rounded-full p-1 border-2 border-amber-400 shadow-md">
                  <img
                    src="https://l.top4top.io/p_37988hwfa0.png"
                    alt="SNTE"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-200 font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="text-xs sm:text-sm font-black text-amber-300">النقابة الوطنية لعمال التربية S.N.T.E</div>
                  <div className="text-[9px] text-gray-300">CARTE D'ADHÉRENT 2026 | بطاقة انخراط وطنية</div>
                </div>
              </div>
              <div className="text-left">
                <span className="inline-block bg-amber-400 text-emerald-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
                  دورة 2026
                </span>
                <div className="text-[9px] text-emerald-200 mt-0.5 text-center font-bold">معتمدة 2000/13/76</div>
              </div>
            </div>

            {/* Card Content Grid */}
            <div className="relative z-10 grid grid-cols-12 gap-3 pt-3.5 items-center">
              {/* Member Photo / Avatar & QR */}
              <div className="col-span-4 flex flex-col items-center text-center">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-white/10 border-2 border-amber-400 overflow-hidden p-1 shadow-md flex items-center justify-center bg-emerald-950">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-amber-300">
                      <span className="text-3xl">👤</span>
                      <span className="text-[10px] font-bold text-white mt-1">صورة منخرط</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 bg-white p-1 rounded-lg shadow-sm border border-emerald-300">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[10px] text-gray-800 font-mono text-center leading-none">
                    [QR-CODE]<br />
                    {member.membershipCardNo}
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="col-span-8 space-y-1.5 text-right text-xs">
                <div>
                  <span className="text-[10px] text-emerald-200 font-bold block">الاسم واللقب:</span>
                  <span className="text-sm sm:text-base font-black text-white">{member.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">رقم البطاقة (الوطني):</span>
                    <span className="font-extrabold text-amber-300 font-mono text-xs sm:text-sm bg-black/30 px-2 py-0.5 rounded border border-amber-400/50 inline-block">
                      {member.membershipCardNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">تاريخ الميلاد:</span>
                    <span className="font-bold text-white text-[11px]">{member.birthDate || 'غير محدد'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">رقم التعريف NIN:</span>
                    <span className="font-mono font-bold text-white text-[10px] tracking-wide block truncate">
                      {member.nationalId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">الضمان الاجتماعي:</span>
                    <span className="font-mono font-bold text-white text-[10px] block truncate">
                      {member.socialSecurityNo || '168409123456'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">الرتبة:</span>
                    <span className="font-bold text-white text-[11px] truncate block">{member.rank || 'أستاذ'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200 font-bold block">الولاية / البلدية:</span>
                    <span className="font-bold text-white text-[11px] truncate block">
                      {member.wilayaName} ({member.wilayaCode})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-200 font-bold block">مؤسسة ومكان العمل:</span>
                  <span className="font-bold text-amber-200 text-[11px] truncate block">
                    {member.institutionName} - {member.workplace || member.municipalName}
                  </span>
                </div>

                <div className="pt-0.5">
                  <span className="text-[10px] text-emerald-200 font-bold block">الهيكل والسلم النقابي:</span>
                  <span className="font-black text-amber-300 text-[11px] bg-black/40 px-2 py-0.5 rounded border border-amber-400/40 inline-flex items-center gap-1">
                    <span>🏛️</span>
                    <span>{member.hierarchyRole || 'منخرط'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: National SG Stamp & Security Band */}
            <div className="relative z-10 border-t border-amber-400/30 mt-3 pt-2.5 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-gray-300 block">
                  صفة الحساب:{' '}
                  {member.membershipStatus === 'temporary_pending' || member.status?.includes('مؤقت') ? (
                    <strong className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/40 text-[9px]">
                      ⏳ عضوية مؤقتة (قيد اقتناء البطاقة الورقية من الأمانة الولائية)
                    </strong>
                  ) : (
                    <strong className="text-emerald-300">منخرط نظامي نشط (اشتراك مسدد)</strong>
                  )}
                </span>
                <span className="text-amber-200/90 text-[9px] block">رقم البطاقة وطني موحد غير مقيد بالتقسيم الإقليمي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-left">
                  <span className="text-[9px] text-amber-300 font-bold block">توقيع وختم الأمين العام الوطني</span>
                  <span className="text-[8px] text-gray-300 block">الأستاذ قويدر يحياوي</span>
                </div>
                <img
                  src="/assets/aistudio/image_49bcf1f2.png"
                  alt="ختم الأمين العام الوطني"
                  className="h-10 sm:h-12 object-contain drop-shadow"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={handlePrint}
              className="bg-[#006633] hover:bg-[#004d26] text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>🖨️</span>
              <span>طباعة بطاقة الانخراط</span>
            </button>
            <button
              onClick={handleDownloadCertificate}
              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>📄</span>
              <span>طباعة شهادة إثبات الانخراط (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
