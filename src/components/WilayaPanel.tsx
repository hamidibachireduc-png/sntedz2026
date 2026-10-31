import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  MapPin,
  Users,
  Phone,
  Mail,
  Building,
  FileCheck2,
  Printer,
  ChevronDown,
  Search,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Edit,
  Layers,
} from 'lucide-react';

export const WilayaPanel: React.FC = () => {
  const {
    wilayas,
    selectedWilayaId,
    setSelectedWilayaId,
    setActiveModal,
    members,
    assemblyPVs,
  } = useDatabase();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('الكل');

  // Currently active wilaya
  const currentWilaya = wilayas.find((w) => w.id === selectedWilayaId) || wilayas[16]; // default 17 Djelfa

  // Members count in this wilaya
  const wilayaMembers = members.filter((m) => m.wilayaId === currentWilaya.id);
  // Assembly PVs in this wilaya
  const wilayaPVs = assemblyPVs.filter((p) => p.wilayaId === currentWilaya.id);

  // Filtered wilayas for the quick selector
  const regions = ['الكل', 'الوسط', 'الشرق', 'الغرب', 'الجنوب الشرقي', 'الجنوب الغربي'];

  const filteredWilayasList = wilayas.filter((w) => {
    const matchesSearch =
      w.nameAr.includes(searchFilter) ||
      w.code.includes(searchFilter) ||
      w.sgName.includes(searchFilter);
    const matchesRegion = selectedRegion === 'الكل' || w.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="bg-[#03230f]/90 border border-emerald-700/60 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Right Header (Matches Screenshot exactly: "الخريطة التفاعلية للجزائر (69 ولاية)" and "ولاية مختارة: 17 - الجلفة") */}
      <div className="p-3 sm:p-4 border-b border-emerald-800/80 bg-[#021a0b] flex flex-wrap items-center justify-between gap-2">
        {/* Left pill tag: ولاية مختارة: 17 - الجلفة */}
        <div className="bg-[#053d1b] border border-emerald-400/60 px-3 py-1 rounded-full text-xs font-black text-emerald-300 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ولاية مختارة : {currentWilaya.code} - {currentWilaya.nameAr}</span>
        </div>

        {/* Right title: الخريطة التفاعلية للجزائر (69 ولاية) */}
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-black text-emerald-400">
            الخريطة التفاعلية للجزائر (69 ولاية)
          </h3>
          <span className="text-lg">🇩🇿</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-3 sm:p-4 space-y-4 overflow-y-auto max-h-[640px]">
        {/* Wilaya Quick Picker Bar */}
        <div className="bg-[#042410] p-3 rounded-xl border border-emerald-800/80 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-200">اختر الولاية لتصفح الهيكل التنظيمي والمحاضر:</span>
            
            {/* Region pills */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors whitespace-nowrap ${
                    selectedRegion === reg
                      ? 'bg-amber-400 text-stone-950 shadow'
                      : 'bg-[#063316] text-emerald-300 hover:bg-[#09411d]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم أو الرقم (مثال: الجلفة أو 17)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#02170a] border border-emerald-700/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
            </div>

            <div className="relative">
              <select
                value={currentWilaya.id}
                onChange={(e) => setSelectedWilayaId(Number(e.target.value))}
                className="w-full bg-[#02170a] border border-emerald-700/60 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400 text-right cursor-pointer"
              >
                {filteredWilayasList.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#042410] text-white">
                    {w.code} - ولاية {w.nameAr} ({w.region}) - {w.membersCount} منخرط
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Wilaya Pills (scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {filteredWilayasList.slice(0, 15).map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWilayaId(w.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all border ${
                  w.id === currentWilaya.id
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-black shadow'
                    : 'bg-[#063316] text-gray-200 border-emerald-800/80 hover:bg-[#0a441e]'
                }`}
              >
                {w.code} - {w.nameAr}
              </button>
            ))}
            {filteredWilayasList.length > 15 && (
              <span className="text-[10px] text-emerald-400 shrink-0 px-1">
                +{filteredWilayasList.length - 15} ولاية أخرى
              </span>
            )}
          </div>
        </div>

        {/* Selected Wilaya Card (Highlight Djelfa / Current) */}
        <div className="bg-gradient-to-b from-[#063818] to-[#04230f] border-2 border-emerald-600/70 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          {/* Header of Wilaya */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-emerald-700/50">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#094821] border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 font-black shadow-lg">
                <span className="text-[10px] text-emerald-300">ولاية</span>
                <span className="text-xl leading-none">{currentWilaya.code}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    أمانة ولاية {currentWilaya.nameAr} ({currentWilaya.nameFr})
                  </h4>
                  <span className="bg-emerald-800/90 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                    إقليم {currentWilaya.region}
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  الأمين الولائي: {currentWilaya.sgName}
                </p>
                <p className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{currentWilaya.address}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentWilaya.status === 'نشط جداً'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {currentWilaya.status}
              </span>
              <span className="text-[10px] text-gray-300">
                آخر جمعية عامة: {currentWilaya.lastAssemblyDate}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
            <div className="bg-[#021a0b] p-2.5 rounded-xl border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-300/80 block">إجمالي المنخرطين</span>
              <span className="text-base sm:text-lg font-black text-white">
                {currentWilaya.membersCount.toLocaleString()}
              </span>
              <span className="text-[9px] text-amber-300 block">معلم وموظف مسجل</span>
            </div>

            <div className="bg-[#021a0b] p-2.5 rounded-xl border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-300/80 block">الفروع النقابية</span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {currentWilaya.branchesCount}
              </span>
              <span className="text-[9px] text-emerald-300 block">فرع منصب بالمؤسسات</span>
            </div>

            <div className="bg-[#021a0b] p-2.5 rounded-xl border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-300/80 block">نسبة التغطية الميدانية</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                {currentWilaya.coverageRate}%
              </span>
              <span className="text-[9px] text-gray-400 block">من المؤسسات التعليمية</span>
            </div>

            <div className="bg-[#021a0b] p-2.5 rounded-xl border border-emerald-800/80 text-center">
              <span className="text-[10px] text-emerald-300/80 block">محاضر الجمعيات</span>
              <span className="text-base sm:text-lg font-black text-cyan-300">
                {currentWilaya.assemblyCount}
              </span>
              <span className="text-[9px] text-cyan-400 block">محضر معتمد رسمياً</span>
            </div>
          </div>

          {/* Bureau Executive Team Members */}
          <div className="bg-[#02190b] p-3 rounded-xl border border-emerald-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-900/60">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>تشكيلة المكتب التنفيذي الولائي (ولاية {currentWilaya.nameAr})</span>
              </span>
              <span className="text-[10px] text-emerald-300">
                {currentWilaya.executiveMembers?.length || 1} أعضاء معتمدين
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentWilaya.executiveMembers && currentWilaya.executiveMembers.length > 0 ? (
                currentWilaya.executiveMembers.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-2 rounded-lg bg-[#042811] border border-emerald-800/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white text-[12px]">{m.name}</p>
                      <p className="text-[11px] text-emerald-300">{m.role}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-gray-400 py-2">
                  المكتب التنفيذي للولاية تحت إشراف الأمين الولائي: {currentWilaya.sgName}
                </div>
              )}
            </div>
          </div>

          {/* Contact info & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-emerald-800/60">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <a
                href={`tel:${currentWilaya.phone}`}
                className="flex items-center gap-1 text-emerald-300 hover:text-white"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span dir="ltr">{currentWilaya.phone}</span>
              </a>
              <span>•</span>
              <a
                href={`mailto:${currentWilaya.email}`}
                className="flex items-center gap-1 text-emerald-300 hover:text-white"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentWilaya.email}</span>
              </a>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveModal('memberships')}
                className="flex items-center gap-1.5 bg-[#0e8a75] hover:bg-[#0c7563] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-400/40 shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>عرض بطاقات الانخراط ({wilayaMembers.length})</span>
              </button>

              <button
                onClick={() => setActiveModal('assembly')}
                className="flex items-center gap-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-red-400/40 shadow-sm transition-all"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>محاضر الجمعيات ({wilayaPVs.length})</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1 bg-[#14532d] hover:bg-[#166534] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/40 transition-all"
                title="طباعة تقرير الولاية والاعتماد"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الاعتماد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Map Overview Matrix */}
        <div className="bg-[#02170a] p-3 rounded-xl border border-emerald-800/80">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60 mb-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>شبكة المكاتب الولائية الـ 69 عبر التراب الوطني</span>
            </span>
            <span className="text-[10px] text-gray-300">
              انقر على أي ولاية للانتقال الفوري إليها
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
            {wilayas.map((w) => {
              const isSelected = w.id === currentWilaya.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWilayaId(w.id)}
                  className={`p-1 rounded-md text-[10px] font-bold transition-all border text-center ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow font-black scale-105 ring-1 ring-amber-300'
                      : 'bg-[#052d13] text-emerald-200 border-emerald-800/60 hover:bg-[#08441d] hover:text-white'
                  }`}
                  title={`${w.code} - ولاية ${w.nameAr}`}
                >
                  <span className="block opacity-75 text-[9px]">{w.code}</span>
                  <span className="truncate block">{w.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
