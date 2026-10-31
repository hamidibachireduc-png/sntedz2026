import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  nationalBureauMembers,
  nationalAdvisors,
  wisdomCommitteeMembers,
  regionalSecretariats,
} from '../data/initialData';
import {
  Users,
  Shield,
  Award,
  Compass,
  Building,
  Phone,
  Mail,
  FileCheck,
  Search,
  ExternalLink,
} from 'lucide-react';

export const NationalBureauTabs: React.FC = () => {
  const { activeTab, setActiveTab, wilayas, setSelectedWilayaId, setActiveModal } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'المكتب الوطني', label: 'المكتب الوطني', count: nationalBureauMembers.length },
    { id: 'المستشارون', label: 'المستشارون', count: nationalAdvisors.length },
    { id: 'لجنة الحكماء', label: 'لجنة الحكماء', count: wisdomCommitteeMembers.length },
    { id: 'الأمانة الجهوية', label: 'الأمانة الجهوية', count: regionalSecretariats.length },
    { id: 'الأمانة الولائية', label: 'الأمانة الولائية', count: wilayas.length },
  ] as const;

  const filteredWilayas = wilayas.filter(
    (w) =>
      w.nameAr.includes(searchTerm) ||
      w.code.includes(searchTerm) ||
      w.sgName.includes(searchTerm) ||
      w.region.includes(searchTerm)
  );

  return (
    <div className="bg-[#03230f]/90 border border-emerald-700/60 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-emerald-800/80 bg-[#021a0b] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 text-xs sm:text-sm font-black whitespace-nowrap transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-[#063316] text-emerald-300 border-emerald-400 font-black shadow-inner'
                  : 'text-gray-300 hover:text-white border-transparent hover:bg-[#042410]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-600/80 text-white' : 'bg-emerald-950 text-emerald-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content body */}
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto max-h-[640px]">
        {/* 1. المكتب الوطني */}
        {activeTab === 'المكتب الوطني' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#073819] p-2.5 rounded-xl border border-emerald-600/40 text-xs">
              <span className="font-bold text-amber-300">أعضاء المكتب الوطني التنفيذي (S.N.T.E)</span>
              <span className="text-emerald-300 text-[11px]">العهدة النقابية 2023 - 2027</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {nationalBureauMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl border transition-all ${
                    member.name.includes('عوايشية طارق')
                      ? 'bg-gradient-to-r from-[#0d4a24] to-[#083318] border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-[#042410] border-emerald-800/60 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-900/80 border border-emerald-500/50 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {member.name.slice(7, 9) || member.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{member.name}</h4>
                          {member.name.includes('عوايشية طارق') && (
                            <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                              حسابك الحالي
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-300 mt-0.5">{member.role}</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">{member.grade} • {member.institution}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white bg-emerald-950/60 px-2 py-1 rounded border border-emerald-700/40"
                        >
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{member.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-gray-300/90 mt-2 bg-black/20 p-2 rounded-lg leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. المستشارون */}
        {activeTab === 'المستشارون' && (
          <div className="space-y-3">
            <div className="bg-[#073819] p-3 rounded-xl border border-emerald-600/40 text-xs">
              <h4 className="font-bold text-amber-300 mb-1">هيئة المستشارين والخبراء القانونيين</h4>
              <p className="text-emerald-200/80 text-[11px] leading-relaxed">
                تضم نخبة من المحامين المعتمدين لدى المحكمة العليا ومجلس الدولة والمفتشين البيداغوجيين لدعم المفاوضات ومرافقة قضايا المربين.
              </p>
            </div>

            <div className="space-y-2.5">
              {nationalAdvisors.map((adv) => (
                <div key={adv.id} className="p-3 bg-[#042410] border border-emerald-800/60 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{adv.name}</h4>
                      <p className="text-xs font-semibold text-emerald-300">{adv.role}</p>
                      <p className="text-[11px] text-amber-300/90 mt-0.5">{adv.grade}</p>
                    </div>
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-black/20 p-2 rounded-lg">
                    {adv.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. لجنة الحكماء */}
        {activeTab === 'لجنة الحكماء' && (
          <div className="space-y-3">
            <div className="bg-[#073819] p-3 rounded-xl border border-emerald-600/40 text-xs">
              <h4 className="font-bold text-amber-300 mb-1">لجنة الحكماء وميثاق الشرف والتحكيم</h4>
              <p className="text-emerald-200/80 text-[11px] leading-relaxed">
                هيئة عليا تضم قدماء القيادات ومؤسسي النقابة للفصل في النزاعات التنظيمية، صيانة وحدة الصف، وتكريس أخلاقيات النضال التربوي.
              </p>
            </div>

            <div className="space-y-2.5">
              {wisdomCommitteeMembers.map((wis) => (
                <div key={wis.id} className="p-3 bg-[#042410] border border-emerald-800/60 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{wis.name}</h4>
                      <p className="text-xs font-semibold text-amber-300">{wis.role}</p>
                      <p className="text-[11px] text-emerald-300 mt-0.5">{wis.grade}</p>
                    </div>
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-black/20 p-2 rounded-lg">
                    {wis.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. الأمانة الجهوية */}
        {activeTab === 'الأمانة الجهوية' && (
          <div className="space-y-3">
            <div className="bg-[#073819] p-3 rounded-xl border border-emerald-600/40 text-xs">
              <h4 className="font-bold text-amber-300 mb-1">الأمانات والتنسيقيات الجهوية الخمس (05)</h4>
              <p className="text-emerald-200/80 text-[11px] leading-relaxed">
                حلقات الوصل الميدانية بين المكتب الوطني والمكاتب الولائية الـ 69 لتأطير العمل المشترك وتنظيم الملتقيات الجهوية.
              </p>
            </div>

            <div className="space-y-2.5">
              {regionalSecretariats.map((reg) => (
                <div key={reg.id} className="p-3 bg-[#042410] border border-emerald-800/60 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{reg.name}</h4>
                      <p className="text-xs font-bold text-emerald-300 mt-1">{reg.role}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">{reg.institution}</p>
                    </div>
                    <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-300 mt-2 bg-black/20 p-2 rounded-lg leading-relaxed">
                    {reg.bio}
                  </p>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-emerald-800/40 text-xs">
                    {reg.phone && (
                      <span className="text-emerald-300 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{reg.phone}</span>
                      </span>
                    )}
                    {reg.email && (
                      <span className="text-emerald-300 flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3" />
                        <span>{reg.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. الأمانة الولائية (دليل الولايات الـ 69) */}
        {activeTab === 'الأمانة الولائية' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-[#073819] p-2.5 rounded-xl border border-emerald-600/40 text-xs">
              <span className="font-bold text-amber-300">دليل المكاتب الولائية الـ 69</span>
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="ابحث عن ولاية أو أمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#031d0d] border border-emerald-600/60 rounded-lg px-2.5 py-1 text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-right"
                />
                <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-2 top-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredWilayas.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWilayaId(w.id)}
                  className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                    w.id === 17
                      ? 'bg-[#0d4a24] border-amber-400 ring-1 ring-amber-400/40'
                      : 'bg-[#042410] border-emerald-800/60 hover:bg-[#073317] hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-900 border border-emerald-400/40 text-amber-300 text-[11px] font-black flex items-center justify-center">
                      {w.code}
                    </span>
                    <span className="font-bold text-sm text-white">{w.nameAr}</span>
                  </div>
                  <p className="text-[11px] text-emerald-300 font-semibold mt-1">الأمين: {w.sgName}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1.5 pt-1.5 border-t border-emerald-900/60">
                    <span>{w.membersCount.toLocaleString()} منخرط</span>
                    <span className="text-amber-300">{w.branchesCount} فرعاً</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
