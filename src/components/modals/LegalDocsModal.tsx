import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Scale,
  Search,
  BookOpen,
  Download,
  Printer,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LegalDocsModal: React.FC = () => {
  const { activeModal, setActiveModal, legalDocs } = useDatabase();
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  if (activeModal !== 'legislation') return null;

  const filteredDocs = legalDocs.filter(
    (d) =>
      d.title.includes(search) ||
      d.number.includes(search) ||
      d.summary.includes(search) ||
      d.category.includes(search)
  );

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
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-end">
                <span className="bg-[#14532d] text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-600/60">
                  المرجعية القانونية
                </span>
                <span>البيانات القانونية والتشريعات النقابية والتربوية</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                القانون 23-02، المراسيم التنفيذية لأسلاك التربية، وقوانين الوظيفة العمومية
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#14532d] flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
              <Scale className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 bg-[#021a0b] border-b border-emerald-800/80">
          <div className="relative max-w-md mr-auto">
            <input
              type="text"
              placeholder="ابحث برقم القانون أو المادة أو الكلمة الدلالية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#031d0d] border border-emerald-600/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-[#042410] border border-emerald-800/80 rounded-2xl hover:border-emerald-600/60 transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 border border-emerald-700/50">
                      {doc.category}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{doc.title}</h4>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">{doc.number} • بتاريخ: {doc.date}</p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#063316] hover:bg-[#0a441e] text-emerald-300 border border-emerald-600/40 rounded-lg text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة النص</span>
                  </button>
                </div>

                <p className="text-xs text-gray-200 bg-[#02170a] p-3 rounded-xl border border-emerald-900/60 leading-relaxed">
                  {doc.summary}
                </p>

                {doc.importantArticles && (
                  <div className="p-3 bg-[#03200d] rounded-xl border border-emerald-800/60 space-y-1 text-xs">
                    <h5 className="font-bold text-amber-300 text-[11px] mb-1">المواد الجوهرية لحماية العمل النقابي:</h5>
                    {doc.importantArticles.map((art, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{art}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            قسم الشؤون القانونية والمنازعات للنقابة الوطنية S.N.T.E
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
