import React, { useState } from 'react';
import { Printer, Download, Award, TrendingUp, CheckSquare, Plus } from 'lucide-react';
import { Teacher, AssignedGroup, MODELS, rankDisplayTitle, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface TeacherEvaluation {
  teacherId: string;
  curriculumRate: number; // % إنجاز المنهاج
  dailyJournalScore: number; // /20 الكراس اليومي والمذكرات
  classManagementScore: number; // /20 تسيير القسم والوسائل
  studentSuccessRate: number; // % نسبة التلاميذ الحاصلين على المعدل >= 5/10
  remediationCount: number; // عدد التلاميذ المعنيين بالمعالجة
  directorAppreciation: string;
}

interface PerformanceControlModuleProps {
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  teachers: Teacher[];
  groups: AssignedGroup[];
  evaluations: Record<string, TeacherEvaluation>;
  setEvaluations: React.Dispatch<React.SetStateAction<Record<string, TeacherEvaluation>>>;
  logoUrl: string;
}

export default function PerformanceControlModule({
  institution,
  teachers,
  groups,
  evaluations,
  setEvaluations,
  logoUrl,
}: PerformanceControlModuleProps) {
  const [selectedTrimester, setSelectedTrimester] = useState<'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث'>('الفصل الأول');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || 't1');

  const getEval = (tId: string): TeacherEvaluation => {
    if (evaluations[tId]) return evaluations[tId];
    return {
      teacherId: tId,
      curriculumRate: 88,
      dailyJournalScore: 18,
      classManagementScore: 17.5,
      studentSuccessRate: 84,
      remediationCount: 4,
      directorAppreciation: 'أداء بيداغوجي متميز والتزام تام بالتدرجات السنوية والوثائق التربوية.',
    };
  };

  const updateEvalField = (tId: string, field: keyof TeacherEvaluation, value: number | string) => {
    const current = getEval(tId);
    setEvaluations((prev) => ({
      ...prev,
      [tId]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const allEvals = teachers.map((t) => getEval(t.id));
  const avgCurriculum = Math.round(
    allEvals.reduce((acc, e) => acc + Number(e.curriculumRate || 0), 0) / Math.max(1, allEvals.length)
  );
  const avgSuccess = Math.round(
    allEvals.reduce((acc, e) => acc + Number(e.studentSuccessRate || 0), 0) / Math.max(1, allEvals.length)
  );
  const totalRemediation = allEvals.reduce((acc, e) => acc + Number(e.remediationCount || 0), 0);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  const selectedEval = selectedTeacher ? getEval(selectedTeacher.id) : null;
  const selectedGroup = selectedTeacher ? groups.find((g) => g.teacherId === selectedTeacher.id) : null;
  const selectedModel = selectedGroup ? MODELS[selectedGroup.level] : null;

  return (
    <div className="space-y-6">
      {/* Header Control Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#117a37]" />
            <span>لوحة التحكم في الأداء التربوي والتحصيل الدراسي ({selectedTrimester})</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            مراقبة نسب تنفيذ المناهج، تحليل النتائج الفصلية، متابعة المعالجة البيداغوجية، وتقييم الأداء التربوي للأساتذة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'] as const).map((trim) => (
              <button
                key={trim}
                onClick={() => setSelectedTrimester(trim)}
                className={`px-3 py-1.5 rounded-md text-xs font-extrabold cursor-pointer transition whitespace-nowrap ${
                  selectedTrimester === trim
                    ? 'bg-[#117a37] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {trim}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              exportElementToPDF(null, `حصيلة_الأداء_التربوي_${selectedTrimester}_${institution.school}`, 'landscape')
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تحميل PDF</span>
          </button>

          <button
            onClick={() => triggerPrintOrPdf(`حصيلة_الأداء_التربوي_${selectedTrimester}_${institution.school}`)}
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة حصيلة الأداء التربوي</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">متوسط نسبة إنجاز المناهج والتدرجات</div>
          <div className="text-2xl font-black text-[#117a37] mt-1 tabular-nums">{avgCurriculum}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#117a37] h-full rounded-full" style={{ width: `${Math.min(100, avgCurriculum)}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">نسبة النجاح والتحكم العامة (≥ 5/10)</div>
          <div className="text-2xl font-black text-[#094d22] mt-1 tabular-nums">{avgSuccess}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#094d22] h-full rounded-full" style={{ width: `${Math.min(100, avgSuccess)}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">التلاميذ المبرمجون في المعالجة البيداغوجية</div>
          <div className="text-2xl font-black text-[#d91424] mt-1 tabular-nums">{totalRemediation} تلميذ(ة)</div>
          <div className="text-xs text-slate-600 mt-1.5">حصص المعالجة مدرجة في التوقيت الرسمي</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">معدل انضباط الوثائق التربوية</div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">96%</div>
          <div className="text-xs text-slate-600 mt-1.5">الكراس اليومي · المذكرات · دفتر المناداة</div>
        </div>
      </div>

      {/* Interactive Performance Matrix & Individual Inspector Card */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 items-start">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
          <h3 className="text-sm font-black text-[#094d22] mb-3">
            الجدول التحليلي للأداء البيداغوجي ونتائج الأقسام — {selectedTrimester}
          </h3>
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#e8f5e9] border-y border-[#117a37]/30 text-[#094d22] font-black">
                <th className="py-2.5 px-2.5">الأستاذ(ة)</th>
                <th className="py-2.5 px-2.5">الرتبة (25-54)</th>
                <th className="py-2.5 px-2.5">القسم المسند</th>
                <th className="py-2.5 px-2.5">إنجاز المنهاج (%)</th>
                <th className="py-2.5 px-2.5">الوثائق (/20)</th>
                <th className="py-2.5 px-2.5">الأداء الصفي (/20)</th>
                <th className="py-2.5 px-2.5">نسبة النجاح (%)</th>
                <th className="py-2.5 px-2.5">تلاميذ المعالجة</th>
                <th className="py-2.5 px-2.5">بطاقة التقييم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teachers.map((t) => {
                const ev = getEval(t.id);
                const grp = groups.find((g) => g.teacherId === t.id);
                const m = grp ? MODELS[grp.level] : null;
                const isSelected = t.id === selectedTeacherId;
                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50 transition ${isSelected ? 'bg-emerald-50/60' : ''}`}
                  >
                    <td className="py-2 px-2.5 font-extrabold text-slate-900">{t.name}</td>
                    <td className="py-2 px-2.5 text-slate-700 font-bold">{rankDisplayTitle(t.rank)}</td>
                    <td className="py-2 px-2.5 font-bold text-[#094d22]">
                      {m ? m.levelTitle : 'غير مسند'}
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={ev.curriculumRate}
                        onChange={(e) => updateEvalField(t.id, 'curriculumRate', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={ev.dailyJournalScore}
                        onChange={(e) => updateEvalField(t.id, 'dailyJournalScore', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={ev.classManagementScore}
                        onChange={(e) => updateEvalField(t.id, 'classManagementScore', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={ev.studentSuccessRate}
                        onChange={(e) => updateEvalField(t.id, 'studentSuccessRate', Number(e.target.value))}
                        className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums text-[#117a37]"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        min={0}
                        max={45}
                        value={ev.remediationCount}
                        onChange={(e) => updateEvalField(t.id, 'remediationCount', Number(e.target.value))}
                        className="w-14 px-1.5 py-1 border border-slate-300 rounded text-center font-bold tabular-nums text-[#d91424]"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <button
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`px-2.5 py-1 rounded text-xs font-extrabold cursor-pointer ${
                          isSelected
                            ? 'bg-[#d91424] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Teacher Pedagogical Evaluation Card */}
        {selectedTeacher && selectedEval && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-bold text-[#117a37]">بطاقة المتابعة البيداغوجية الفردية</div>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{selectedTeacher.name}</h4>
                <div className="text-xs text-slate-600">
                  {rankDisplayTitle(selectedTeacher.rank)} · {selectedModel ? selectedModel.levelTitle : 'بدون قسم'}
                </div>
              </div>
              <Award className="w-8 h-8 text-[#e6b85c]" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="text-slate-500 font-bold">نسبة تنفيذ التدرج</div>
                <div className="text-lg font-black text-[#117a37] tabular-nums">{selectedEval.curriculumRate}%</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="text-slate-500 font-bold">نسبة نجاح التلاميذ</div>
                <div className="text-lg font-black text-[#094d22] tabular-nums">{selectedEval.studentSuccessRate}%</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="text-slate-500 font-bold">نقطة الوثائق التربوية</div>
                <div className="text-lg font-black text-slate-900 tabular-nums">{selectedEval.dailyJournalScore} / 20</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="text-slate-500 font-bold">الأداء الصفي والوسائل</div>
                <div className="text-lg font-black text-slate-900 tabular-nums">{selectedEval.classManagementScore} / 20</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#094d22] mb-1">
                التقدير البيداغوجي للسيد(ة) المدير(ة):
              </label>
              <textarea
                rows={3}
                value={selectedEval.directorAppreciation}
                onChange={(e) => updateEvalField(selectedTeacher.id, 'directorAppreciation', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="bg-[#e8f5e9] border border-[#117a37]/30 rounded-lg p-3 text-xs text-[#094d22] space-y-1 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#117a37]" />
                <span>تأشيرة الكراس اليومي والمذكرات: منتظمة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#117a37]" />
                <span>المعدل البيداغوجي الإجمالي: {((selectedEval.dailyJournalScore + selectedEval.classManagementScore) / 2).toFixed(2)} / 20</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Official Sheet for Pedagogical Performance */}
      <div className="sheet-scroll-container">
        <div className="a4-landscape-page" dir="rtl">
          <div className="sheet-header-grid">
            <div className="sheet-right-col">
              <div>مديرية التربية لولاية : {institution.wilaya}</div>
              <div>مفتشية التعليم الابتدائي</div>
              <div>مقاطعة : {institution.district}</div>
              <div>المدرسة الابتدائية : {institution.school}</div>
            </div>

            <div className="sheet-center-col">
              <div className="rep-heading">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="min-heading">وزارة التربية الوطنية</div>
              <div className="title-frame-with-logo">
                <img src={logoUrl} alt="SNTE" />
                <div className="title-frame-text">
                  <span className="main-doc-title">
                    الحصيلة الرقمية للأداء التربوي والتحصيل الدراسي — {selectedTrimester}
                  </span>
                </div>
              </div>
            </div>

            <div className="sheet-left-col">
              <div>السنة الدراسية : {institution.year}</div>
              <div>السيد(ة) المدير(ة) : {institution.directorName}</div>
              <div>نسبة تنفيذ المناهج : {avgCurriculum}%</div>
              <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
            </div>
          </div>

          <table className="timetable-grid mt-2">
            <thead>
              <tr className="hours-header">
                <th style={{ width: '40px' }}>الرقم</th>
                <th>الأستاذ(ة)</th>
                <th>الرتبة (المرسوم 25-54)</th>
                <th>القسم المسند</th>
                <th>إنجاز المنهاج</th>
                <th>نقطة الوثائق (/20)</th>
                <th>الأداء الصفي (/20)</th>
                <th>نسبة النجاح (≥5/10)</th>
                <th>تلاميذ المعالجة</th>
                <th>تقدير السيد(ة) المدير(ة)</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => {
                const ev = getEval(t.id);
                const grp = groups.find((g) => g.teacherId === t.id);
                const m = grp ? MODELS[grp.level] : null;
                return (
                  <tr key={t.id}>
                    <td className="font-bold tabular-nums py-1.5">{i + 1}</td>
                    <td className="font-extrabold text-right px-2">{t.name}</td>
                    <td className="font-bold">{rankDisplayTitle(t.rank)}</td>
                    <td className="font-bold text-[#094d22]">{m ? m.levelTitle : 'غير مسند'}</td>
                    <td className="font-bold tabular-nums">{ev.curriculumRate}%</td>
                    <td className="font-bold tabular-nums">{ev.dailyJournalScore}/20</td>
                    <td className="font-bold tabular-nums">{ev.classManagementScore}/20</td>
                    <td className="font-black text-[#117a37] tabular-nums">{ev.studentSuccessRate}%</td>
                    <td className="font-bold text-[#d91424] tabular-nums">{ev.remediationCount}</td>
                    <td className="text-right px-2 text-[11px]" contentEditable suppressContentEditableWarning>
                      {ev.directorAppreciation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="footer-signatures mt-6">
            <div>إمضاء الناظر / المدير المساعد</div>
            <div>إمضاء وختم السيد(ة) المدير(ة)</div>
            <div>تأشيرة السيد(ة) مفتش(ة) المقاطعة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
