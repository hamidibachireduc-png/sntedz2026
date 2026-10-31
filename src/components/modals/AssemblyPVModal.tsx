import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { AssemblyPV } from '../../types';
import {
  FileCheck2,
  Search,
  Plus,
  Printer,
  X,
  Building,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Download,
} from 'lucide-react';

export const AssemblyPVModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    assemblyPVs,
    wilayas,
    selectedWilayaId,
    addAssemblyPV,
  } = useDatabase();

  const [search, setSearch] = useState('');
  const [filterWilaya, setFilterWilaya] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPVForView, setSelectedPVForView] = useState<AssemblyPV | null>(null);

  // New PV form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssemblyPV['type']>('جمعية عامة ولائية');
  const [wilayaId, setWilayaId] = useState(selectedWilayaId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [attendeesCount, setAttendeesCount] = useState<number>(50);
  const [electedSG, setElectedSG] = useState('');
  const [membersElectedStr, setMembersElectedStr] = useState('');
  const [summary, setSummary] = useState('');

  if (activeModal !== 'assembly') return null;

  const filteredPVs = assemblyPVs.filter((p) => {
    const matchesSearch =
      p.title.includes(search) ||
      p.wilayaName.includes(search) ||
      p.electedSG.includes(search) ||
      p.documentRef.includes(search);
    const matchesWilaya = filterWilaya === 0 || p.wilayaId === filterWilaya;
    return matchesSearch && matchesWilaya;
  });

  const handleCreatePV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !electedSG) return;

    const w = wilayas.find((item) => item.id === wilayaId) || wilayas[0];
    const electedArray = membersElectedStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addAssemblyPV({
      wilayaId: w.id,
      wilayaName: w.nameAr,
      type,
      title,
      date,
      location,
      attendeesCount,
      quorumMet: true,
      electedSG,
      membersElected: electedArray.length > 0 ? electedArray : [`${electedSG} (أمين ولائي)`],
      summary: summary || 'انعقاد الجمعية العامة وفق الأطر القانونية لنقابة S.N.T.E والمصادقة على اللائحة الختامية.',
      documentRef: `PV-SNTE-${w.code}-${new Date().getFullYear()}/${Math.floor(10 + Math.random() * 90)}`,
      fileSize: '3.1 MB (PDF مختوم)',
      status: 'معتمد رسمياً',
    });

    setTitle('');
    setLocation('');
    setElectedSG('');
    setMembersElectedStr('');
    setSummary('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-red-500/80 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
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
                <span className="bg-[#b91c1c] text-white text-xs px-2.5 py-0.5 rounded-full">
                  الوثائق الرسمية
                </span>
                <span>منصة المحاضر والجمعيات العامة (S.N.T.E)</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                أرشيف محاضر تنصيب المكاتب الولائية، الفروع النقابية، والاعتمادات الوزارية
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#b91c1c] flex items-center justify-center text-white shrink-0 shadow-lg">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-[#021a0b] border-b border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إيداع محضر جمعية عامة جديد</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#063316] hover:bg-[#0a4721] text-emerald-300 border border-emerald-600/40 text-xs px-3 py-2 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القائمة المعتمدة</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Wilaya select */}
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(Number(e.target.value))}
              className="bg-[#031d0d] border border-emerald-600/60 rounded-xl px-2.5 py-1.5 text-xs text-white text-right focus:outline-none"
            >
              <option value={0}>جميع الولايات (69)</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="ابحث برقم المحضر أو الأمين..."
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
          {showAddForm && (
            <form
              onSubmit={handleCreatePV}
              className="p-4 bg-[#042811] border border-amber-400/60 rounded-2xl space-y-3 animate-in slide-in-from-top-2 text-xs"
            >
              <h4 className="font-bold text-amber-300 text-sm">استمارة إيداع محضر جمعية عامة:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">عنوان المحضر *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: محضر الجمعية العامة التجديدية لولاية..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">نوع الجمعية</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    <option value="جمعية عامة ولائية">جمعية عامة ولائية</option>
                    <option value="فرع نقابي مؤسسة">فرع نقابي مؤسسة</option>
                    <option value="مجلس ولائي">مجلس ولائي</option>
                    <option value="مؤتمر وطني">مؤتمر وطني</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الولاية المعنية</label>
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
                  <label className="block text-gray-300 mb-1">مكان الانعقاد *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: دار الثقافة، ثانوية..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">تاريخ الانعقاد</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الأمين العام المنتخب *</label>
                  <input
                    type="text"
                    required
                    value={electedSG}
                    onChange={(e) => setElectedSG(e.target.value)}
                    placeholder="اسم الأمين المنتخب..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">عدد الحاضرين المؤتمرين</label>
                  <input
                    type="number"
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-left"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-gray-300 mb-1">أعضاء المكتب المنتخبين (سطر لكل عضو)</label>
                  <textarea
                    rows={2}
                    value={membersElectedStr}
                    onChange={(e) => setMembersElectedStr(e.target.value)}
                    placeholder="الأستاذ فلان (مسؤول التنظيم)&#10;الأستاذ فلان (مسؤول المالية)..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-gray-300 mb-1">ملخص سير أشغال الجمعية والقرارات</label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="افتتاح الأشغال، التحقق من النصاب القانوني، المصادقة على التقريرين..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-gray-700 text-white rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                >
                  اعتماد وحفظ المحضر
                </button>
              </div>
            </form>
          )}

          {/* PVs list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPVs.map((pv) => (
              <div
                key={pv.id}
                className="p-4 bg-[#042410] border border-emerald-800/80 rounded-2xl hover:border-emerald-600/60 transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-black/30 px-2 py-0.5 rounded border border-amber-400/30">
                      {pv.documentRef}
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      ولاية {pv.wilayaName} ({pv.wilayaId})
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mt-2 leading-snug">{pv.title}</h4>

                  <div className="space-y-1 text-xs text-gray-300 mt-2">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>التاريخ: {pv.date} • {pv.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>الحاضرون: {pv.attendeesCount} عضواً (النصاب القانوني مكتمل)</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>الأمين المنتخب: {pv.electedSG}</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-300/90 bg-[#02170a] p-2.5 rounded-xl border border-emerald-900/60 mt-2 line-clamp-2">
                    {pv.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-900/60 text-xs">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{pv.status}</span>
                  </span>

                  <button
                    onClick={() => setSelectedPVForView(pv)}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs"
                  >
                    معاينة المحضر الرسمي
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Official PV View Modal */}
        {selectedPVForView && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-[#02170a] border-2 border-amber-400 rounded-3xl max-w-2xl w-full p-6 text-right relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedPVForView(null)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              {/* Official PV Document layout */}
              <div className="p-6 bg-[#042811] border border-emerald-700 rounded-2xl text-white space-y-4">
                <div className="text-center border-b border-amber-400/40 pb-4">
                  <h4 className="font-bold text-sm text-emerald-300">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                  <h3 className="font-black text-lg text-amber-300 mt-1">النقابة الوطنية لعمال التربية S.N.T.E</h3>
                  <p className="text-xs text-gray-300">المكتب الوطني التنفيذي • أمانة ولاية {selectedPVForView.wilayaName}</p>
                  <p className="font-mono text-xs text-amber-400 mt-1 font-bold">المرجع: {selectedPVForView.documentRef}</p>
                </div>

                <div className="text-center py-2 bg-emerald-950/80 rounded-xl border border-emerald-600/40">
                  <h2 className="text-base font-black text-white">{selectedPVForView.title}</h2>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-gray-200">
                  <p>
                    في يوم <strong className="text-amber-300">{selectedPVForView.date}</strong>، وعلى الساعة التاسعة صباحاً،
                    اجتمعت الجمعية العامة بمقر <strong className="text-amber-300">{selectedPVForView.location}</strong>،
                    بحضور <strong className="text-amber-300">{selectedPVForView.attendeesCount}</strong> منخرطاً ومندوباً،
                    وتحت إشراف أعضاء الأمانة الوطنية المكلفين بالتنظيم.
                  </p>
                  <p>{selectedPVForView.summary}</p>

                  <div className="bg-[#02170a] p-3 rounded-xl border border-emerald-800 my-2">
                    <h5 className="font-bold text-amber-300 mb-1">نتائج انتخاب المكتب التنفيذي الولائي:</h5>
                    <ul className="list-disc list-inside space-y-1 text-emerald-200">
                      {selectedPVForView.membersElected.map((mem, i) => (
                        <li key={i}>{mem}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-gray-300">
                    رُفعت الجلسة في تمام الساعة الثانية بعد الزوال، بعد تلاوة اللائحة العامة وقراءة الفاتحة.
                  </p>
                </div>

                {/* Signatures & Official Stamp */}
                <div className="pt-4 border-t border-amber-400/40 flex items-center justify-between text-xs">
                  <div className="text-center">
                    <p className="font-bold text-emerald-300">رئيس الجلسة والمشرف الوطني</p>
                    <p className="text-[10px] text-gray-400 mt-6">(توقيع وختم الأمانة الوطنية)</p>
                  </div>

                  <div className="w-20 h-20 rounded-full border-2 border-red-500/80 flex flex-col items-center justify-center text-center p-1 text-red-400 rotate-[-12deg] bg-red-950/20">
                    <span className="text-[8px] font-black">النقابة الوطنية</span>
                    <span className="text-[10px] font-black">S.N.T.E</span>
                    <span className="text-[7px]">ختم المصادقة</span>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-amber-300">الأمين الولائي المنتخب</p>
                    <p className="text-xs font-black text-white mt-1">{selectedPVForView.electedSG}</p>
                    <p className="text-[10px] text-gray-400 mt-3">(توقيع وختم المكتب الولائي)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المحضر الرسمي المعتمد</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            أرشيف المحاضر الولائية الموثقة رقمياً
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
