import React, { useState, useEffect } from 'react';
import { WILAYAS_LIST } from './wilayasList';
import {
  X,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  User,
  Shield,
  Copy,
  ExternalLink,
} from 'lucide-react';

export interface ContactInquiry {
  id: string;
  referenceCode: string; // e.g. SNTE-SUP-784210
  fullName: string;
  membershipNumber?: string;
  nationalId?: string;
  phone: string;
  email?: string;
  wilayaCode: string;
  wilayaName: string;
  institution?: string;
  jobTitle?: string;
  inquiryType:
    | 'استفسار عن بطاقة الانخراط والاشتراك'
    | 'انشغال مهني وبيداغوجي'
    | 'نزاع إداري وتظلم قانوني'
    | 'الخدمات الاجتماعية والمنح والسلفة'
    | 'التقاعد النسبي والمناطق'
    | 'طلب موعد أو لقاء مع المكتب الولائي/الوطني'
    | 'أخرى';
  priority: 'عادي' | 'مستعجل' | 'عاجل جداً';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'قيد المعالجة' | 'تم التوجيه للمكتب الولائي' | 'تم الرد' | 'مكتمل ومؤرشف';
  responseNote?: string;
}

interface ContactSupportComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'snte_contacts';

export const ContactSupportComponent: React.FC<ContactSupportComponentProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'new_inquiry' | 'my_inquiries' | 'hotlines'>('new_inquiry');
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wilayaCode, setWilayaCode] = useState('17'); // Default 17 Djelfa
  const [institution, setInstitution] = useState('');
  const [jobTitle, setJobTitle] = useState('أستاذ التعليم الثانوي');
  const [inquiryType, setInquiryType] = useState<ContactInquiry['inquiryType']>('استفسار عن بطاقة الانخراط والاشتراك');
  const [priority, setPriority] = useState<ContactInquiry['priority']>('عادي');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // UI state
  const [submittedInquiry, setSubmittedInquiry] = useState<ContactInquiry | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load inquiries from dedicated localStorage key 'snte_contacts'
  const loadContacts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setInquiries(JSON.parse(raw));
      } else {
        // Initial sample inquiries if completely empty for good UX
        const initialSamples: ContactInquiry[] = [
          {
            id: 'CONT-17001',
            referenceCode: 'SNTE-SUP-892401',
            fullName: 'الأستاذ عبد القادر بن عيسى',
            membershipNumber: 'SNTE-17-2024-00142',
            phone: '0661 24 58 90',
            email: 'a.benaissa@snte-dz.org',
            wilayaCode: '17',
            wilayaName: 'الجلفة',
            institution: 'ثانوية النعيم النعيمي - الجلفة',
            jobTitle: 'أستاذ التعليم الثانوي',
            inquiryType: 'استفسار عن بطاقة الانخراط والاشتراك',
            priority: 'عادي',
            subject: 'استفسار حول بطاقات الانخراط البيومترية الجديدة للفرع النقابي',
            message: 'نرجو من الأمانة الوطنية إفادتنا بموعد استلام الدفعة الثانية من بطاقات الانخراط البيومترية الخاصة بموظفي ثانوية النعيم النعيمي لولاية الجلفة.',
            submittedAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString('ar-DZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            status: 'تم التوجيه للمكتب الولائي',
            responseNote: 'تم تحويل الطلب إلى أمانة التنظيم والبطاقية للمكتب الولائي لولاية الجلفة للمتابعة الميدانية.',
          },
          {
            id: 'CONT-16002',
            referenceCode: 'SNTE-SUP-451290',
            fullName: 'الأستاذة مريم حواس',
            membershipNumber: 'SNTE-16-2024-00980',
            phone: '0550 44 22 11',
            email: 'm.haouas@snte-dz.org',
            wilayaCode: '16',
            wilayaName: 'الجزائر العاصمة',
            institution: 'متوسطة بلحرش البشير',
            jobTitle: 'أستاذة التعليم المتوسط',
            inquiryType: 'الخدمات الاجتماعية والمنح والسلفة',
            priority: 'مستعجل',
            subject: 'ملف السلفة الاستعجالية والعمليات الجراحية',
            message: 'طلب استشارة بخصوص الآجال القانونية لإيداع ملف السلفة الصحية لدى لجنة الخدمات الاجتماعية الوطنية.',
            submittedAt: new Date(Date.now() - 86400000).toLocaleDateString('ar-DZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            status: 'قيد المعالجة',
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
        setInquiries(initialSamples);
      }
    } catch (e) {
      console.error('Error loading contacts from localStorage key snte_contacts:', e);
      setInquiries([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      // Try auto-filling from logged in user if available
      try {
        const rawUser = localStorage.getItem('snte_user');
        if (rawUser) {
          const user = JSON.parse(rawUser);
          if (user.name) setFullName(user.name);
          if (user.phone) setPhone(user.phone);
          if (user.email) setEmail(user.email);
          if (user.wilaya) {
            const foundWilaya = WILAYAS_LIST.find((w) => w.name === user.wilaya || w.code === user.wilaya);
            if (foundWilaya) setWilayaCode(foundWilaya.code);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      alert('يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، الموضوع، والرسالة).');
      return;
    }

    const selectedWilayaObj = WILAYAS_LIST.find((w) => w.code === wilayaCode) || WILAYAS_LIST[16];
    const generatedRef = `SNTE-SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInquiry: ContactInquiry = {
      id: `CONT-${Date.now()}`,
      referenceCode: generatedRef,
      fullName: fullName.trim(),
      membershipNumber: membershipNumber.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      wilayaCode,
      wilayaName: selectedWilayaObj.name,
      institution: institution.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      inquiryType,
      priority,
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'قيد المعالجة',
    };

    try {
      const existing: ContactInquiry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [newInquiry, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInquiries(updated);
      setSubmittedInquiry(newInquiry);

      // Reset form
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to store inquiry in snte_contacts:', err);
      alert('حدث خطأ أثناء حفظ الاستفسار. يرجى المحاولة ثانية.');
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الاستفسار من السجل؟')) return;
    try {
      const updated = inquiries.filter((q) => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInquiries(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snte_contacts_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredInquiries = inquiries.filter(
    (q) =>
      q.fullName.includes(searchFilter) ||
      q.subject.includes(searchFilter) ||
      q.referenceCode.includes(searchFilter) ||
      q.wilayaName.includes(searchFilter) ||
      q.phone.includes(searchFilter)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="bg-[#006633] text-emerald-200 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 font-bold">
                  خدمة الإصغاء والدعم المباشر
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  فضاء التواصل واستقبال الاستفسارات (Contact & Support)
                </h3>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                إرسال انشغالات واستفسارات منخرطي قطاع التربية مباشرة وتخزينها في قاعدة بيانات <code className="text-amber-300 font-mono">snte_contacts</code>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006633] to-[#043d1a] border border-emerald-400 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-emerald-800/80 bg-[#021a0b] px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('new_inquiry');
              setSubmittedInquiry(null);
            }}
            className={`py-2 px-4 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'new_inquiry'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال استفسار جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('my_inquiries')}
            className={`py-2 px-4 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'my_inquiries'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>سجل الاستفسارات المحفوظة</span>
            <span className="bg-emerald-900 text-emerald-200 text-[10px] px-2 py-0.2 rounded-full border border-emerald-700">
              {inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hotlines')}
            className={`py-2 px-4 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'hotlines'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>قنوات الاتصال المباشرة ومقرات الأمانة</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tab 1: New Inquiry Form */}
          {activeTab === 'new_inquiry' && (
            <div>
              {submittedInquiry ? (
                /* Success Receipt Card */
                <div className="p-5 sm:p-6 bg-gradient-to-br from-[#063818] to-[#03200d] border-2 border-emerald-400 rounded-2xl shadow-xl space-y-4 text-center animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-400 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white">
                      تم استلام استفسارك وتخزينه بنجاح في المنظومة!
                    </h4>
                    <p className="text-xs text-emerald-200/90 mt-1 max-w-lg mx-auto">
                      تم تسجيل استفسارك رسمياً وتوجيهه إلى خلية المتابعة المركزية والمكتب الولائي لولاية {submittedInquiry.wilayaName}.
                    </p>
                  </div>

                  {/* Reference Ticket Box */}
                  <div className="bg-[#02170a] border border-amber-400/80 rounded-xl p-4 max-w-md mx-auto text-center space-y-2">
                    <span className="text-[11px] text-gray-300 block">كود المتابعة والتذكرة المرجعية:</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
                        {submittedInquiry.referenceCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(submittedInquiry.referenceCode)}
                        className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-300 transition-colors"
                        title="نسخ كود التذكرة"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedCode && (
                      <span className="text-[10px] text-emerald-400 font-bold block animate-fade-in">
                        تم نسخ الكود إلى الحافظة!
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-300 max-w-md mx-auto bg-[#02170a]/70 p-3 rounded-lg border border-emerald-800 text-right space-y-1">
                    <p><strong>صاحب الاستفسار:</strong> {submittedInquiry.fullName}</p>
                    <p><strong>الموضوع:</strong> {submittedInquiry.subject}</p>
                    <p><strong>الولاية:</strong> ولاية {submittedInquiry.wilayaName} ({submittedInquiry.wilayaCode})</p>
                    <p><strong>الجهة المكلفة:</strong> خلية الإصغاء والمنازعات للنقابة الوطنية S.N.T.E</p>
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setSubmittedInquiry(null)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      إرسال استفسار آخر
                    </button>
                    <button
                      onClick={() => setActiveTab('my_inquiries')}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-black transition-all shadow"
                    >
                      عرض في سجل الاستفسارات
                    </button>
                  </div>
                </div>
              ) : (
                /* Inquiry Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3 bg-[#042811] border border-emerald-700/60 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">توجيهات المنخرطين:</span> يمكنك طرح أي انشغال بيداغوجي، إداري، قانوني، أو استفسار حول بطاقة الانخراط. سيتم حفظ طلبك محلياً في <code className="text-amber-300 font-mono font-bold">snte_contacts</code> والرد عليه من طرف الأمانة المختصة.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        الاسم واللقب الكامل <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: الأستاذ كمال الدين بن يحيى"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        رقم الهاتف الشخصي <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="مثال: 0661 12 34 56"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-left focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-left focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Wilaya Selector */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        الولاية المعنية <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={wilayaCode}
                        onChange={(e) => setWilayaCode(e.target.value)}
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-amber-300 font-bold text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                      >
                        {WILAYAS_LIST.map((w) => (
                          <option key={w.code} value={w.code} className="bg-[#042410] text-white">
                            {w.code} - ولاية {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Institution */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        المؤسسة التربوية / مكان العمل
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="مثال: ثانوية النعيم النعيمي"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Membership Number */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        رقم بطاقة الانخراط (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={membershipNumber}
                        onChange={(e) => setMembershipNumber(e.target.value)}
                        placeholder="مثال: SNTE-17-2024-00142"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-left focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        تصنيف ونوع الاستفسار
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value as any)}
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        <option value="استفسار عن بطاقة الانخراط والاشتراك">استفسار عن بطاقة الانخراط والاشتراك</option>
                        <option value="انشغال مهني وبيداغوجي">انشغال مهني وبيداغوجي</option>
                        <option value="نزاع إداري وتظلم قانوني">نزاع إداري وتظلم قانوني</option>
                        <option value="الخدمات الاجتماعية والمنح والسلفة">الخدمات الاجتماعية والمنح والسلفة</option>
                        <option value="التقاعد النسبي والمناطق">التقاعد النسبي والمناطق</option>
                        <option value="طلب موعد أو لقاء مع المكتب الولائي/الوطني">طلب موعد أو لقاء مع المكتب الولائي/الوطني</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-gray-200 font-bold mb-1">
                        درجة الأهمية
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-amber-300 font-bold text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        <option value="عادي">عادي (خلال 48 ساعة)</option>
                        <option value="مستعجل">مستعجل (خلال 24 ساعة)</option>
                        <option value="عاجل جداً">عاجل جداً (معالجة آنية)</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-gray-200 font-bold mb-1">
                        موضوع الاستفسار <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="مثال: تسوية المخلفات المالية للدرجة"
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-2.5 text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    {/* Message Body */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-gray-200 font-bold mb-1">
                        تفاصيل الانشغال أو الرسالة <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="اكتب هنا تفاصيل استفسارك أو مشكلتك المهنية بدقة ليتمكن المكلف بالمنازعات أو التنظيم من الرد المباشر عليك..."
                        className="w-full bg-[#02170a] border border-emerald-700 rounded-xl p-3 text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-800">
                    <span className="text-[11px] text-gray-400">
                      يتم حفظ البيانات مشفرة محلياً في مفتاح <span className="text-emerald-400 font-mono">snte_contacts</span>
                    </span>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-[#006633] hover:from-emerald-500 hover:to-[#004d26] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/40 active:scale-95"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>إرسال الاستفسار وتوليد كود التذكرة</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Saved Inquiries List */}
          {activeTab === 'my_inquiries' && (
            <div className="space-y-3">
              {/* Filter & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#02170a] p-3 rounded-xl border border-emerald-800/80">
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، الموضوع، الولاية، أو كود التذكرة..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-[#042811] border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1.5 bg-[#063316] hover:bg-[#0a4721] text-emerald-300 border border-emerald-600/40 text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                    title="تصدير السجل كملف JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير السجل (JSON)</span>
                  </button>
                </div>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="text-center py-10 bg-[#02170a] rounded-2xl border border-emerald-900/60 text-gray-400 text-xs">
                  <MessageSquare className="w-10 h-10 mx-auto text-emerald-600/40 mb-2" />
                  <p className="font-bold text-white">لا توجد استفسارات مسجلة تطابق بحثك حالياً.</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    يمكنك إرسال استفسار جديد عبر التبويب الأول لتظهر تذكرتك هنا.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 bg-[#042410] border border-emerald-800/80 rounded-2xl hover:border-emerald-600/60 transition-all space-y-2.5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-emerald-900/60 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-amber-300 bg-[#02170a] px-2.5 py-0.5 rounded-lg border border-amber-400/40">
                            {inq.referenceCode}
                          </span>
                          <span className="text-xs font-bold text-white bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                            ولاية {inq.wilayaName} ({inq.wilayaCode})
                          </span>
                          <span className="text-[11px] text-gray-300">
                            {inq.inquiryType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              inq.status === 'تم الرد'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                                : inq.status === 'تم التوجيه للمكتب الولائي'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                            }`}
                          >
                            {inq.status}
                          </span>

                          <button
                            onClick={() => handleDelete(inq.id)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/60 transition-colors cursor-pointer"
                            title="حذف من السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white">{inq.subject}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-300 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-emerald-400" />
                            <span className="font-bold text-emerald-200">{inq.fullName}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span dir="ltr">{inq.phone}</span>
                          </span>
                          {inq.institution && (
                            <span className="text-gray-400">({inq.institution})</span>
                          )}
                          <span className="text-gray-400 font-mono text-[10px]">
                            {inq.submittedAt}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#02170a] border border-emerald-900/60 rounded-xl text-xs text-gray-200 leading-relaxed">
                        {inq.message}
                      </div>

                      {inq.responseNote && (
                        <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300">رد خلية المتابعة: </span>
                            <span>{inq.responseNote}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Official Hotlines & Physical Contacts */}
          {activeTab === 'hotlines' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-400 text-stone-950 font-black px-2.5 py-0.5 rounded-full text-[10px]">
                      المقر المركزي
                    </span>
                    <Building className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-sm text-white">الأمانة الوطنية المركزية</h4>
                  <p className="text-gray-300">شارع ديدوش مراد، الجزائر الوسطى، الجزائر العاصمة</p>
                  <div className="pt-2 border-t border-emerald-900/60 space-y-1 text-emerald-300">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span dir="ltr">+213 (0) 21 63 45 00</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>contact@snte-dz.org</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      المنازعات القانونية
                    </span>
                    <Shield className="w-4 h-4 text-amber-300" />
                  </div>
                  <h4 className="font-bold text-sm text-white">خلية الاستشارات القانونية والتظلمات</h4>
                  <p className="text-gray-300">مرافقة المربين والأساتذة أمام اللجان التأديبية ومديريات التربية</p>
                  <div className="pt-2 border-t border-emerald-900/60 space-y-1 text-emerald-300">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span dir="ltr">+213 (0) 553 44 66 88</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>juridique@snte-dz.org</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-sky-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      البطاقية والانخراطات
                    </span>
                    <User className="w-4 h-4 text-sky-300" />
                  </div>
                  <h4 className="font-bold text-sm text-white">أمانة التنظيم والبطاقية البيومترية</h4>
                  <p className="text-gray-300">متابعة تجديد بطاقات العضوية وتسليم الحصص الولائية</p>
                  <div className="pt-2 border-t border-emerald-900/60 space-y-1 text-emerald-300">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span dir="ltr">+213 (0) 551 22 44 66</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>organisation@snte-dz.org</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#042410] border border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-700 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      الإعلام والرقمنة
                    </span>
                    <MessageSquare className="w-4 h-4 text-rose-300" />
                  </div>
                  <h4 className="font-bold text-sm text-white">أمانة الإعلام والاتصال الرقمي</h4>
                  <p className="text-gray-300">إشراف الأستاذ عوايشية طارق ومتابعة البوابة المركزية</p>
                  <div className="pt-2 border-t border-emerald-900/60 space-y-1 text-emerald-300">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span dir="ltr">+213 (0) 550 12 34 56</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>media@snte-dz.org</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            مفتاح التخزين المخصص: <code className="text-amber-300 font-mono">localStorage['snte_contacts']</code> ({inquiries.length} استفسار)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
