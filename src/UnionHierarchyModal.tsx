// src/UnionHierarchyModal.tsx
// نافذة الدليل التفاعلي للهياكل والسلم النقابي للاتحاد الوطني لعمال التربية (S.N.T.E)
import React, { useState } from 'react';
import {
  UNION_HIERARCHY_LEVELS,
  HierarchyLevelKey,
  HierarchyStructure,
  HierarchyLevel,
} from './unionHierarchy';

interface UnionHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginWithRole?: (roleId: string) => void;
  onOpenRegister?: () => void;
}

export const UnionHierarchyModal: React.FC<UnionHierarchyModalProps> = ({
  isOpen,
  onClose,
  onOpenLoginWithRole,
  onOpenRegister,
}) => {
  const [selectedLevelKey, setSelectedLevelKey] = useState<HierarchyLevelKey | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStructure, setActiveStructure] = useState<HierarchyStructure | null>(null);
  const [viewMode, setViewMode] = useState<'ladder' | 'cards'>('ladder');

  if (!isOpen) return null;

  // Filter structures by level and search
  const filteredLevels = UNION_HIERARCHY_LEVELS.map((lvl) => {
    if (selectedLevelKey !== 'all' && lvl.key !== selectedLevelKey) {
      return null;
    }
    const filteredStructures = lvl.structures.filter((st) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        st.name.toLowerCase().includes(q) ||
        st.shortTitle.toLowerCase().includes(q) ||
        st.description.toLowerCase().includes(q) ||
        st.legalBasis.toLowerCase().includes(q) ||
        (st.subRoles && st.subRoles.some((sr) => sr.toLowerCase().includes(q)))
      );
    });

    if (filteredStructures.length === 0) return null;

    return {
      ...lvl,
      structures: filteredStructures,
    };
  }).filter(Boolean) as HierarchyLevel[];

  const handleSelectStructure = (structure: HierarchyStructure) => {
    setActiveStructure(structure);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hierarchy-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-700/30 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00371b] via-[#00552b] to-[#00371b] text-white p-4 sm:p-6 border-b-2 border-amber-400 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg"
            title="إغلاق"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-300 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  الهيكل التنظيمي المعتمد
                </span>
                <span className="text-emerald-200 text-xs">وفق القانون الأساسي والنظام الداخلي</span>
              </div>
              <h2 id="hierarchy-title" className="text-lg sm:text-2xl font-black text-white mt-1">
                الهياكل حسب السلم النقابي - S.N.T.E
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                دليل المستويات القيادية، التشريعية، الاستشارية والقاعدية للنقابة الوطنية لعمال التربية
              </p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <div className="text-amber-300 font-black text-base">01</div>
              <div className="text-[11px] font-bold text-white">المستوى الوطني</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <div className="text-emerald-300 font-black text-base">72</div>
              <div className="text-[11px] font-bold text-white">المستوى الولائي</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <div className="text-yellow-300 font-black text-base">1541</div>
              <div className="text-[11px] font-bold text-white">المستوى البلدي</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10">
              <div className="text-cyan-300 font-black text-base">28,000+</div>
              <div className="text-[11px] font-bold text-white">فروع المؤسسات</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-purple-300 font-black text-base">200,000+</div>
              <div className="text-[11px] font-bold text-white">قاعدة المنخرطين</div>
            </div>
          </div>
        </div>

        {/* Toolbar: Filter Tabs & Search */}
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedLevelKey('all')}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedLevelKey === 'all'
                  ? 'bg-[#004d26] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              الكل (السلم الكامل)
            </button>
            {UNION_HIERARCHY_LEVELS.map((lvl) => (
              <button
                key={lvl.key}
                type="button"
                onClick={() => setSelectedLevelKey(lvl.key)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedLevelKey === lvl.key
                    ? 'bg-[#004d26] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{lvl.icon}</span>
                <span>{lvl.name}</span>
              </button>
            ))}
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الهياكل والرتب..."
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 pl-8 text-xs focus:ring-2 focus:ring-[#006633] outline-none text-right"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-7 top-1.5 text-gray-400 hover:text-gray-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center bg-gray-200 p-0.5 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('ladder')}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                  viewMode === 'ladder'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="عرض سلمي هرمي"
              >
                🪜 السلم
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="عرض بطاقات تفصيلية"
              >
                🗂️ بطاقات
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredLevels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="font-bold text-sm">لا توجد هياكل نقابية تطابق بحثك: &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevelKey('all');
                }}
                className="mt-3 text-xs text-[#006633] font-black underline cursor-pointer"
              >
                إعادة ضبط البحث
              </button>
            </div>
          ) : (
            filteredLevels.map((level) => (
              <section
                key={level.key}
                aria-labelledby={`level-heading-${level.key}`}
                className="bg-white rounded-2xl border-2 border-emerald-900/15 p-4 sm:p-5 shadow-xs transition-all hover:border-[#006633]/30"
              >
                {/* Level Title Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg font-black border border-emerald-200">
                      {level.icon}
                    </span>
                    <div>
                      <h3
                        id={`level-heading-${level.key}`}
                        className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2"
                      >
                        <span>{level.name}</span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          المستوى {level.order}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{level.summary}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {level.structures.length} هياكل معتمدة
                  </span>
                </div>

                {/* Structures List inside this Level */}
                <div
                  className={
                    viewMode === 'ladder'
                      ? 'space-y-3'
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                  }
                >
                  {level.structures.map((st) => (
                    <article
                      key={st.id}
                      className="group p-3.5 sm:p-4 rounded-xl border border-gray-200 hover:border-[#006633] bg-gradient-to-b from-white to-gray-50/70 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Structure Identity */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {st.icon}
                            </span>
                            <div>
                              <h4 className="font-black text-sm text-gray-900 group-hover:text-[#006633] transition-colors">
                                {st.name}
                              </h4>
                              <span className="text-[10px] font-bold text-gray-500">
                                {st.shortTitle}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`${st.badgeBg} ${st.badgeText} text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0`}
                          >
                            {st.levelName}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mt-2.5 leading-relaxed line-clamp-3">
                          {st.description}
                        </p>

                        {/* Subroles (like advisors or specific bodies) */}
                        {st.subRoles && st.subRoles.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 block mb-1">
                              المناصب والأعضاء المعتمدون:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {st.subRoles.map((sr, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold bg-amber-50 text-amber-950 border border-amber-200 px-2 py-0.5 rounded-md"
                                >
                                  {sr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Legal Basis & Scope */}
                        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                          <span className="truncate max-w-[65%]" title={st.legalBasis}>
                            ⚖️ {st.legalBasis}
                          </span>
                          <span className="font-bold text-emerald-800">
                            📍 {st.scope}
                          </span>
                        </div>
                      </div>

                      {/* Card Action footer */}
                      <div className="mt-3 pt-2.5 border-t border-gray-200/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectStructure(st)}
                          className="text-xs font-black text-[#006633] hover:text-[#004d26] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض الصلاحيات والمهام الكاملة</span>
                          <span>←</span>
                        </button>

                        {onOpenLoginWithRole && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenLoginWithRole(st.id);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#006633] text-[11px] font-black px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            دخول الهيكل
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Detail Modal / Drawer if a structure is clicked */}
        {activeStructure && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-structure-title"
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 font-['Cairo',sans-serif]"
          >
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-300 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl border border-emerald-200">
                    {activeStructure.icon}
                  </div>
                  <div>
                    <h3 id="active-structure-title" className="text-lg font-black text-gray-900">
                      {activeStructure.name}
                    </h3>
                    <span className="text-xs font-bold text-emerald-800">
                      {activeStructure.levelName} • {activeStructure.scope}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStructure(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-gray-500 mb-1">التعريف بالهيكل:</h4>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {activeStructure.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black text-emerald-900 mb-2 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>الصلاحيات والمهام النقابية الحصرية:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700 pr-1">
                    {activeStructure.prerogatives.map((pr, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <span className="text-[#006633] font-bold">✔</span>
                        <span className="leading-relaxed">{pr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {activeStructure.subRoles && (
                  <div>
                    <h4 className="text-xs font-black text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <span>👥</span>
                      <span>المناصب والمهام الفرعية:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeStructure.subRoles.map((sr, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-100 text-amber-950 font-bold text-xs px-2.5 py-1 rounded-lg border border-amber-300"
                        >
                          {sr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                  <div>
                    <span className="font-black block">السند في القانون الأساسي:</span>
                    <span className="text-[11px] text-amber-800">{activeStructure.legalBasis}</span>
                  </div>
                  <span className="text-xl">📜</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStructure(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStructure(null);
                      onClose();
                      onOpenRegister();
                    }}
                    className="px-4 py-2 bg-[#006633] hover:bg-[#004d26] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🪪</span>
                    <span>طلب انخراط جديد</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#006633]">S.N.T.E:</span>
            <span>كل الهياكل خاضعة لأحكام القانون الأساسي المعتمد والمؤتمر الوطني</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
              >
                انضم للنقابة الآن
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
