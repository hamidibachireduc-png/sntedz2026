import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Member } from '../../types';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  Building,
  User,
  QrCode,
  Shield,
  Trash2,
} from 'lucide-react';

export const MembershipModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    members,
    wilayas,
    selectedWilayaId,
    addMember,
    deleteMember,
  } = useDatabase();

  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('الكل');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  // New member form state
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [educationPhase, setEducationPhase] = useState<Member['educationPhase']>('ثانوي');
  const [jobTitle, setJobTitle] = useState('أستاذ التعليم الثانوي');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wilayaId, setWilayaId] = useState(selectedWilayaId);

  if (activeModal !== 'memberships') return null;

  const currentWilaya = wilayas.find((w) => w.id === selectedWilayaId) || wilayas[0];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.includes(search) ||
      m.membershipNumber.includes(search) ||
      m.establishment.includes(search) ||
      m.nationalId.includes(search);
    const matchesPhase = filterPhase === 'الكل' || m.educationPhase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !establishment) return;

    const chosenWilaya = wilayas.find((w) => w.id === wilayaId) || currentWilaya;

    addMember({
      fullName,
      nationalId: nationalId || '1098' + Math.floor(100000000 + Math.random() * 900000000),
      wilayaId: chosenWilaya.id,
      wilayaName: chosenWilaya.nameAr,
      establishment,
      educationPhase,
      jobTitle,
      phone: phone || '0661 00 00 00',
      email: email || `${fullName.split(' ')[0]}@snte-dz.org`,
      joinDate: new Date().toISOString().slice(0, 10),
      expirationDate: '2025-12-31',
      status: 'نشط',
    });

    setFullName('');
    setNationalId('');
    setEstablishment('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-700/60 bg-[#02170a] flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-end">
                <span className="bg-[#0e8a75] text-white text-xs px-2.5 py-0.5 rounded-full">
                  البطاقية الوطنية
                </span>
                <span>منصة انخراطات الولاية والبطاقات البيومترية</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                إدارة المنخرطين، إصدار البطاقات الرقمية، والتحقق الفوري من صحة الانخراط
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0e8a75] flex items-center justify-center text-white shrink-0 shadow-lg">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="p-4 bg-[#021a0b] border-b border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل منخرط جديد</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#063316] hover:bg-[#0a4721] text-emerald-300 border border-emerald-600/40 text-xs px-3 py-2 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القائمة</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Phase filters */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {['الكل', 'ابتدائي', 'متوسط', 'ثانوي', 'إدارة ومصالح اقتصادية'].map((ph) => (
                <button
                  key={ph}
                  onClick={() => setFilterPhase(ph)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    filterPhase === ph
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#042410] text-gray-300 hover:bg-[#063316]'
                  }`}
                >
                  {ph}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="ابحث بالاسم، المؤسسة، رقم البطاقة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#031d0d] border border-emerald-600/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add Member Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateMember}
              className="p-4 bg-[#042811] border border-amber-400/60 rounded-2xl space-y-3 animate-in slide-in-from-top-2"
            >
              <h4 className="font-bold text-amber-300 text-sm">استمارة تسجيل منخرط جديد بنقابة S.N.T.E:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1">الاسم واللقب الكامل *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: الأستاذ كمال الدين بن علي"
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الولاية *</label>
                  <select
                    value={wilayaId}
                    onChange={(e) => setWilayaId(Number(e.target.value))}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">المؤسسة التربوية *</label>
                  <input
                    type="text"
                    required
                    value={establishment}
                    onChange={(e) => setEstablishment(e.target.value)}
                    placeholder="مثال: ثانوية النعيم النعيمي"
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الطور التعليمي</label>
                  <select
                    value={educationPhase}
                    onChange={(e) => setEducationPhase(e.target.value as any)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="ثانوي">ثانوي</option>
                    <option value="إدارة ومصالح اقتصادية">إدارة ومصالح اقتصادية</option>
                    <option value="عمال مهنيين وأسلاك مشتركة">عمال مهنيين وأسلاك مشتركة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الرتبة والوظيفة</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="أستاذ، مقتصد، ناظر..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0661 00 00 00"
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-left"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  حفظ وتسجيل المنخرط
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="overflow-x-auto border border-emerald-800/80 rounded-2xl">
            <table className="w-full text-xs text-right">
              <thead className="bg-[#02170a] text-emerald-300 border-b border-emerald-800">
                <tr>
                  <th className="p-3">رقم الانخراط</th>
                  <th className="p-3">الاسم واللقب</th>
                  <th className="p-3">الولاية</th>
                  <th className="p-3">المؤسسة والرتبة</th>
                  <th className="p-3">الطور</th>
                  <th className="p-3">صلاحية البطاقة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60 bg-[#031e0c]">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-emerald-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{m.membershipNumber}</td>
                    <td className="p-3 font-bold text-white">{m.fullName}</td>
                    <td className="p-3 text-emerald-200">{m.wilayaName}</td>
                    <td className="p-3">
                      <p className="font-semibold text-white">{m.establishment}</p>
                      <p className="text-[10px] text-gray-300">{m.jobTitle}</p>
                    </td>
                    <td className="p-3">
                      <span className="bg-[#053d1b] text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-600/40">
                        {m.educationPhase}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{m.expirationDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 text-[10px] font-bold">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedMemberForCard(m)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-[11px] shadow"
                          title="عرض وطباعة بطاقة العضوية"
                        >
                          البطاقة الرسمية
                        </button>
                        <button
                          onClick={() => deleteMember(m.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Official Card Preview Modal */}
        {selectedMemberForCard && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-[#02170a] border-2 border-amber-400 rounded-3xl max-w-md w-full p-5 text-right relative shadow-2xl">
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              {/* Physical Union Card Design */}
              <div className="rounded-2xl border-2 border-[#c59b27] bg-gradient-to-br from-[#063a19] via-[#042811] to-[#02170a] p-4 text-white shadow-2xl relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <span className="text-8xl font-black">SNTE</span>
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-amber-400/40 pb-2 mb-3">
                  <div className="text-right">
                    <h5 className="font-black text-xs text-amber-300">
                      النقابة الوطنية لعمال التربية (S.N.T.E)
                    </h5>
                    <p className="text-[9px] text-gray-300">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5">
                    <span className="text-xs">🇩🇿</span>
                  </div>
                </div>

                <div className="text-center my-1">
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                    بطاقة انخراط نقابي بيومترية
                  </span>
                </div>

                {/* Member Info */}
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-20 h-24 rounded-xl bg-emerald-950 border border-emerald-500/60 flex flex-col items-center justify-center text-center p-1 shrink-0">
                    <User className="w-8 h-8 text-emerald-400 mb-1" />
                    <span className="text-[8px] text-gray-400">صورة المنخرط</span>
                  </div>

                  <div className="space-y-1 text-[11px] flex-1">
                    <p className="font-black text-amber-300 text-xs">
                      {selectedMemberForCard.fullName}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-emerald-400">الرتبة:</span> {selectedMemberForCard.jobTitle}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-emerald-400">المؤسسة:</span> {selectedMemberForCard.establishment}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-emerald-400">الولاية:</span> {selectedMemberForCard.wilayaName} ({selectedMemberForCard.wilayaId})
                    </p>
                    <p className="font-mono text-amber-300 text-[10px] font-bold">
                      {selectedMemberForCard.membershipNumber}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Barcode & Official Stamp */}
                <div className="mt-4 pt-2 border-t border-amber-400/40 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-1 text-emerald-300">
                    <QrCode className="w-8 h-8 text-amber-300" />
                    <div>
                      <p>الختم الرسمي للمكتب الوطني</p>
                      <p className="text-gray-400">صالحة إلى: {selectedMemberForCard.expirationDate}</p>
                    </div>
                  </div>
                  <div className="text-center border border-emerald-600/60 p-1 rounded bg-[#02170a]">
                    <span className="text-[8px] text-amber-300 font-bold block">الأمانة الوطنية</span>
                    <span className="text-[7px] text-emerald-400">معتمد ورسمي</span>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة المنخرط الرسمية</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            إجمالي المنخرطين في المنظومة: {members.length} عضو مسجل
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
