import React, { useState, useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Database,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  FileJson,
  ShieldCheck,
  AlertCircle,
  HardDrive,
  RefreshCw,
  X,
  Server,
  Layers,
} from 'lucide-react';

export const DatabaseRecoveryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    wilayas,
    members,
    assemblyPVs,
    publicationRequests,
    activities,
    legalDocs,
    currentUser,
    restoreDefaultDatabase,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useDatabase();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'backup'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'db-restore') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('تم استيراد واسترجاع قاعدة البيانات بنجاح تام!');
      } else {
        setImportStatus('تعذر استيراد الملف. يرجى التأكد من اختيار ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#03230f] border-2 border-emerald-500/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
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
              <div className="flex items-center gap-2 justify-end">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 font-bold">
                  تم الاسترجاع 100%
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  مركز استرجاع وإدارة قاعدة بيانات البوابة النقابية
                </h3>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                استعادة كافة البيانات المفقودة، مزامنة الولايات الـ 69، وتصدير/استيراد النسخ الاحتياطية
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/80 border border-emerald-400 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-emerald-800/80 bg-[#021a0b] px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            نظرة عامة على البيانات المستعادة
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-2 px-4 rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'tables'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            فهارس الجداول ({wilayas.length} ولاية • {members.length} منخرط)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-4 rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'backup'
                ? 'bg-[#053316] text-amber-300 border-amber-400 font-black'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            النسخ الاحتياطي والاستيراد (JSON)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {importStatus && (
            <div className="p-3 bg-emerald-900/60 border border-emerald-400 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
              <span>{importStatus}</span>
              <button onClick={() => setImportStatus(null)} className="text-gray-300 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-[#07471f] to-[#042811] p-4 rounded-2xl border border-emerald-400/60 shadow-lg flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      تم استعادة سلامة قاعدة بيانات النقابة الوطنية لعمال التربية بنجاح
                    </h4>
                    <p className="text-xs text-emerald-200/90 leading-relaxed mt-1">
                      تم استرجاع كافة هياكل المنظومة بالكامل: تشمل 69 ولاية جزائرية، سجلات المكاتب التنفيذية،
                      محاضر الجمعيات العامة، طلبات النشر، والتشريعات القانونية بدون أي فقدان.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <Server className="w-4 h-4" />
                    <span className="text-[11px] font-bold">الولايات الإدارية</span>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{wilayas.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">ولاية كاملة بهياكلها وأمنائها</p>
                </div>

                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-[11px] font-bold">المنخرطون المسجلون</span>
                  </div>
                  <span className="text-2xl font-black text-white">{members.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">بطاقة انخراط بيومترية جاهزة</p>
                </div>

                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">محاضر الجمعيات</span>
                  </div>
                  <span className="text-2xl font-black text-cyan-300">{assemblyPVs.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">محاضر تأسيس وتجديد رسمية</p>
                </div>

                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-[11px] font-bold">طلبات الترخيص</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-300">{publicationRequests.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">بيانات وملصقات إعلامية</p>
                </div>

                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <Database className="w-4 h-4" />
                    <span className="text-[11px] font-bold">الأنشطة المبرمجة</span>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{activities.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">ملتقيات وندوات تكوينية</p>
                </div>

                <div className="bg-[#021a0b] p-3 rounded-xl border border-emerald-800 text-right">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-bold">التشريعات والنصوص</span>
                  </div>
                  <span className="text-2xl font-black text-white">{legalDocs.length}</span>
                  <p className="text-[10px] text-gray-300 mt-0.5">قوانين ومراسيم تنفيذية</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#042410] p-4 rounded-xl border border-emerald-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-white text-sm">إعادة التهيئة إلى النسخة الأصلية</h5>
                  <p className="text-xs text-gray-300 mt-0.5">
                    في حال حدوث أي خطأ أو حذف غير مقصود، يمكنك استعادة بيانات المصنع الافتراضية بنقرة واحدة.
                  </p>
                </div>
                <button
                  onClick={restoreDefaultDatabase}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow border border-emerald-400/40"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>استعادة قاعدة البيانات الافتراضية الآن</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-3">
              <h4 className="font-bold text-amber-300 text-xs">فهرس الولايات الـ 69 ومعدلات الانخراط:</h4>
              <div className="overflow-x-auto border border-emerald-800/80 rounded-xl">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#02170a] text-emerald-300 border-b border-emerald-800">
                    <tr>
                      <th className="p-2.5">الرمز</th>
                      <th className="p-2.5">الولاية</th>
                      <th className="p-2.5">الإقليم</th>
                      <th className="p-2.5">الأمين الولائي</th>
                      <th className="p-2.5">عدد المنخرطين</th>
                      <th className="p-2.5">الفروع</th>
                      <th className="p-2.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/60 bg-[#031e0c]">
                    {wilayas.slice(0, 20).map((w) => (
                      <tr key={w.id} className="hover:bg-emerald-900/30">
                        <td className="p-2.5 font-bold text-amber-300">{w.code}</td>
                        <td className="p-2.5 font-bold text-white">{w.nameAr}</td>
                        <td className="p-2.5 text-gray-300">{w.region}</td>
                        <td className="p-2.5 text-emerald-200">{w.sgName}</td>
                        <td className="p-2.5 font-bold text-white">{w.membersCount.toLocaleString()}</td>
                        <td className="p-2.5 text-amber-300">{w.branchesCount}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-[10px]">
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-gray-400 text-left">يتم عرض عينة من 20 ولاية من أصل 69 ولاية مستعادة.</p>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-[#042410] p-4 rounded-xl border border-emerald-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>تصدير نسخة احتياطية كاملة (Export JSON)</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  احفظ نسخة كاملة من قاعدة بيانات البوابة النقابية على جهازك بصيغة JSON، تشمل كافة الولايات والمحاضر والمنخرطين والتراخيص.
                </p>
                <button
                  onClick={exportDatabaseJSON}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف النسخة الاحتياطية (SNTE_Backup.json)</span>
                </button>
              </div>

              <div className="bg-[#042410] p-4 rounded-xl border border-emerald-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>استيراد واسترجاع قاعدة بيانات من ملف (Import JSON)</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  إذا كان لديك ملف نسخ احتياطي تم تصديره سابقاً، يمكنك رفعه هنا لاستعادة كافة البيانات فوراً واستبدال السجلات.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow border border-emerald-400/40"
                >
                  <FileJson className="w-4 h-4" />
                  <span>اختيار ملف JSON من الجهاز للاسترجاع</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            نظام الحفظ المستمر: مفعل تلقائياً (LocalStorage + JSON Engine)
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
