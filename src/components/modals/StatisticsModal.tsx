import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Building,
  CheckCircle2,
  Printer,
  X,
  PieChart,
} from 'lucide-react';

export const StatisticsModal: React.FC = () => {
  const { activeModal, setActiveModal, wilayas, members, assemblyPVs } = useDatabase();

  if (activeModal !== 'stats') return null;

  const totalMembers = wilayas.reduce((acc, w) => acc + w.membersCount, 0);
  const totalBranches = wilayas.reduce((acc, w) => acc + w.branchesCount, 0);
  const avgCoverage = Math.round(
    wilayas.reduce((acc, w) => acc + w.coverageRate, 0) / wilayas.length
  );

  // Region breakdown
  const regionsData = ['الوسط', 'الشرق', 'الغرب', 'الجنوب الشرقي', 'الجنوب الغربي'].map((reg) => {
    const regionalWilayas = wilayas.filter((w) => w.region === reg);
    const count = regionalWilayas.reduce((acc, w) => acc + w.membersCount, 0);
    return {
      region: reg,
      wilayasCount: regionalWilayas.length,
      membersCount: count,
      percent: Math.round((count / totalMembers) * 100),
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-sky-500/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
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
                <span className="bg-[#0284c7] text-white text-xs px-2.5 py-0.5 rounded-full">
                  التحليل والبيانات
                </span>
                <span>الإحصائيات الإدارية والتمثيل النقابي الوطني</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                مؤشرات التغطية الميدانية، نمو الاشتراكات، والتوزيع الجغرافي للولايات الـ 69
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0284c7] flex items-center justify-center text-white shrink-0 shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top High-level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#021a0b] p-3.5 rounded-2xl border border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-300/80 block">إجمالي المنخرطين وطنياً</span>
              <span className="text-2xl font-black text-white">{totalMembers.toLocaleString()}</span>
              <span className="text-[10px] text-amber-300 block">عبر 69 ولاية</span>
            </div>

            <div className="bg-[#021a0b] p-3.5 rounded-2xl border border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-300/80 block">الفروع المنصبة بالمؤسسات</span>
              <span className="text-2xl font-black text-amber-300">{totalBranches.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-300 block">فرع نقابي مؤسساتي</span>
            </div>

            <div className="bg-[#021a0b] p-3.5 rounded-2xl border border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-300/80 block">متوسط التغطية الولائية</span>
              <span className="text-2xl font-black text-emerald-400">{avgCoverage}%</span>
              <span className="text-[10px] text-gray-400 block">من قطاع التربية</span>
            </div>

            <div className="bg-[#021a0b] p-3.5 rounded-2xl border border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-300/80 block">المحاضر المعتمدة</span>
              <span className="text-2xl font-black text-sky-300">{assemblyPVs.length}</span>
              <span className="text-[10px] text-sky-400 block">محضر رسمي مؤرشف</span>
            </div>
          </div>

          {/* Regional Distribution Bars */}
          <div className="bg-[#042410] p-4 rounded-2xl border border-emerald-800/80 space-y-3">
            <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>التوزيع الجغرافي للمنخرطين حسب الأقاليم الخمسة:</span>
            </h4>

            <div className="space-y-2.5">
              {regionsData.map((reg) => (
                <div key={reg.region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">إقليم {reg.region} ({reg.wilayasCount} ولاية)</span>
                    <span className="text-emerald-300 font-bold">
                      {reg.membersCount.toLocaleString()} منخرط ({reg.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#02170a] rounded-full overflow-hidden border border-emerald-900">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${reg.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Active Wilayas Table */}
          <div className="bg-[#042410] p-4 rounded-2xl border border-emerald-800/80 space-y-3">
            <h4 className="font-bold text-sm text-white">أبرز الولايات من حيث التعداد النقابي والتنظيم:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#02170a] text-emerald-300 border-b border-emerald-800">
                  <tr>
                    <th className="p-2">الرقم</th>
                    <th className="p-2">الولاية</th>
                    <th className="p-2">الأمين الولائي</th>
                    <th className="p-2">المنخرطون</th>
                    <th className="p-2">الفروع</th>
                    <th className="p-2">نسبة التغطية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/60">
                  {[...wilayas]
                    .sort((a, b) => b.membersCount - a.membersCount)
                    .slice(0, 6)
                    .map((w, idx) => (
                      <tr key={w.id} className="hover:bg-emerald-900/30">
                        <td className="p-2 font-bold text-amber-300">#{idx + 1}</td>
                        <td className="p-2 font-bold text-white">{w.code} - {w.nameAr}</td>
                        <td className="p-2 text-gray-200">{w.sgName}</td>
                        <td className="p-2 font-bold text-emerald-300">{w.membersCount.toLocaleString()}</td>
                        <td className="p-2 text-amber-300">{w.branchesCount}</td>
                        <td className="p-2 text-white">{w.coverageRate}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#063316] text-amber-300 border border-emerald-600/40 rounded-lg font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير الإحصائي</span>
          </button>
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
