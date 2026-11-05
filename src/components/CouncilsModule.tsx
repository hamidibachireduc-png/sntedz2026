import React, { useState } from 'react';
import { Users, Printer, Download, Plus, Trash2, Calendar } from 'lucide-react';
import { Teacher, rankDisplayTitle, specDisplayTitle, OFFICIAL_AUTHOR_SIGNATURE } from '../data/timetableModels';
import { exportElementToPDF, triggerPrintOrPdf } from '../utils/printAndPdf';

export interface CouncilMeeting {
  id: string;
  councilType:
    | 'مجلس الأساتذة (Conseil des Maîtres)'
    | 'مجلس التنسيق الإداري والبيداغوجي'
    | 'لجنة الانضباط والنظام الداخلي'
    | 'لقاء التنسيق مع جمعية أولياء التلاميذ';
  sessionTitle: string;
  date: string;
  time: string;
  agenda: string[];
  decisions: string[];
}

export const INITIAL_COUNCIL_MEETINGS: CouncilMeeting[] = [
  {
    id: 'cm1',
    councilType: 'مجلس الأساتذة (Conseil des Maîtres)',
    sessionTitle: 'الجلسة الافتتاحية العادية — الدخول المدرسي وضبط التنظيم التربوي',
    date: '2026-09-15',
    time: '13:30',
    agenda: [
      'قراءة النصوص التنظيمية الخاصة بالدخول المدرسي والمرسوم التنفيذي 25-54.',
      'المصادقة على إسناد الأفواج التربوية وجداول التوقيت الأسبوعي (نظام الدوام الواحد).',
      'ضبط جدول الحراسة اليومية في الساحة والمناوبة التربوية.',
      'تحديد قوائم التلاميذ المعنيين بحصص المعالجة البيداغوجية وتوحيد التدرجات السنوية.',
    ],
    decisions: [
      'اعتماد الإسناد التربوي العادل وفق الرتب المستحدثة في المرسوم التنفيذي 25-54.',
      'تخصيص أمسيات الثلاثاء للندوات التربوية الداخلية والتنسيق الأفقي بين أساتذة المستويات المتشابهة.',
      'الالتزام بتحيين الكراس اليومي والمذكرات البيداغوجية وتقديمها للتأشير الدوري.',
    ],
  },
  {
    id: 'cm2',
    councilType: 'مجلس الأساتذة (Conseil des Maîtres)',
    sessionTitle: 'جلسة تقييم نتائج الفصل الأول وتحليل التحصيل الدراسي',
    date: '2026-12-17',
    time: '13:30',
    agenda: [
      'عرض الحصيلة الإحصائية لنتائج تقويم الفصل الأول حسب كل مستوى ومادة.',
      'دراسة حالات التعثر الدراسي وتكييف أفواج المعالجة البيداغوجية للفصل الثاني.',
      'تقييم سير المطعم المدرسي والنشاطات الثقافية والرياضية.',
    ],
    decisions: [
      'تكثيف تمارين القراءة المقطعية والحساب الذهني لتلاميذ الطور الأول.',
      'استدعاء أولياء التلاميذ ذوي النتائج الضعيفة لمرافقتهم بيداغوجياً ونفسياً.',
    ],
  },
  {
    id: 'cm3',
    councilType: 'لقاء التنسيق مع جمعية أولياء التلاميذ',
    sessionTitle: 'الاجتماع الدوري مع مكتب جمعية أولياء التلاميذ',
    date: '2026-10-22',
    time: '14:00',
    agenda: [
      'تنظيم أيام الاستقبال الأسبوعية لأولياء التلاميذ مع الأساتذة.',
      'المساهمة في تزيين المحيط المدرسي ومتابعة مواظبة التلاميذ.',
    ],
    decisions: [
      'تحديد يوم الثلاثاء صباحاً (من 10:45 إلى 11:15) لاستقبال الأولياء.',
      'تنظيم حملة تحسيسية حول المحافظة على الكتاب المدرسي والتجهيزات.',
    ],
  },
];

interface CouncilsModuleProps {
  institution: {
    wilaya: string;
    district: string;
    school: string;
    year: string;
    directorName: string;
  };
  teachers: Teacher[];
  meetings: CouncilMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<CouncilMeeting[]>>;
  logoUrl: string;
}

export default function CouncilsModule({
  institution,
  teachers,
  meetings,
  setMeetings,
  logoUrl,
}: CouncilsModuleProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || 'cm1');
  const [newType, setNewType] = useState<CouncilMeeting['councilType']>('مجلس الأساتذة (Conseil des Maîtres)');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-11-10');
  const [newTime, setNewTime] = useState('13:30');
  const [newAgendaText, setNewAgendaText] = useState('');
  const [newDecisionsText, setNewDecisionsText] = useState('');

  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const agendaItems = newAgendaText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const decisionItems = newDecisionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created: CouncilMeeting = {
      id: 'cm_' + Date.now(),
      councilType: newType,
      sessionTitle: newTitle.trim(),
      date: newDate,
      time: newTime,
      agenda: agendaItems.length > 0 ? agendaItems : ['دراسة جدول الأعمال المسطر من طرف إدارة المؤسسة.'],
      decisions: decisionItems.length > 0 ? decisionItems : ['المصادقة بالإجماع على النقاط الواردة في جدول الأعمال.'],
    };

    setMeetings((prev) => [created, ...prev]);
    setSelectedMeetingId(created.id);
    setNewTitle('');
    setNewAgendaText('');
    setNewDecisionsText('');
  };

  const handleDeleteMeeting = (id: string) => {
    if (meetings.length <= 1) return;
    const next = meetings.filter((m) => m.id !== id);
    setMeetings(next);
    if (selectedMeetingId === id) {
      setSelectedMeetingId(next[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#094d22] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#117a37]" />
            <span>قسم المجالس البيداغوجية والإدارية في المدرسة الابتدائية</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            تسيير جلسات مجلس الأساتذة، مجلس التنسيق الإداري، ولجنة الانضباط مع التحرير الآلي لمحاضر الاجتماعات الرسمية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportElementToPDF(null, `محضر_مجلس_${institution.school}`, 'landscape')
            }
            className="bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تحميل المحضر (PDF)</span>
          </button>
          <button
            onClick={() => triggerPrintOrPdf(`محضر_مجلس_${institution.school}`)}
            className="bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة محضر المجلس الرسمي (A4)</span>
          </button>
        </div>
      </div>

      {/* Interactive Council Selector & New Meeting Form */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-5 items-start">
        <form
          onSubmit={handleAddMeeting}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
        >
          <h3 className="text-sm font-black text-[#094d22]">برمجة وتحرير محضر مجلس جديد</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طبيعة المجلس:</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CouncilMeeting['councilType'])}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
            >
              <option value="مجلس الأساتذة (Conseil des Maîtres)">مجلس الأساتذة (Conseil des Maîtres)</option>
              <option value="مجلس التنسيق الإداري والبيداغوجي">مجلس التنسيق الإداري والبيداغوجي</option>
              <option value="لجنة الانضباط والنظام الداخلي">لجنة الانضباط والنظام الداخلي</option>
              <option value="لقاء التنسيق مع جمعية أولياء التلاميذ">لقاء التنسيق مع جمعية أولياء التلاميذ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الدورة / الجلسة:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: جلسة تنسيق اختبارات الفصل الثاني..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانعقاد:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التوقيت:</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نقاط جدول الأعمال (كل نقطة في سطر):</label>
            <textarea
              rows={3}
              value={newAgendaText}
              onChange={(e) => setNewAgendaText(e.target.value)}
              placeholder="1. تقييم تنفيذ التدرجات السنوية&#10;2. تنظيم المعالجة البيداغوجية..."
              className="w-full p-2 border border-slate-300 rounded-md text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">القرارات والتوصيات المصادق عليها (كل توصية في سطر):</label>
            <textarea
              rows={3}
              value={newDecisionsText}
              onChange={(e) => setNewDecisionsText(e.target.value)}
              placeholder="1. توحيد شبكة التقويم المستمر&#10;2. برمجة دروس نموذجية..."
              className="w-full p-2 border border-slate-300 rounded-md text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>حفظ المحضر وعرضه للطباعة</span>
          </button>
        </form>

        {/* Meetings List */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-[#094d22]">
            سجل المجالس والمحاضر المحررة ({meetings.length}) — اختر محضراً لمعاينته وطباعته بالأسفل
          </h3>

          <div className="space-y-2.5">
            {meetings.map((m) => {
              const isSelected = m.id === activeMeeting?.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#e8f5e9] border-[#117a37]'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-extrabold text-[#117a37]">{m.councilType}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3.5 h-3.5" />
                        {m.date} ({m.time})
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{m.sessionTitle}</div>
                    <div className="text-xs text-slate-600">
                      عدد نقاط جدول الأعمال: {m.agenda.length} · عدد التوصيات: {m.decisions.length}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMeeting(m.id);
                    }}
                    className="text-slate-400 hover:text-[#d91424] p-1 cursor-pointer"
                    title="حذف المحضر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Official Council PV Sheet */}
      {activeMeeting && (
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
                    <span className="main-doc-title">محضر اجتماع {activeMeeting.councilType}</span>
                  </div>
                </div>
              </div>

              <div className="sheet-left-col">
                <div>السنة الدراسية : {institution.year}</div>
                <div>تاريخ الجلسة : {activeMeeting.date} على الساعة {activeMeeting.time}</div>
                <div>رئيس المجلس : السيد(ة) المدير(ة) {institution.directorName}</div>
                <div className="text-[11px] text-[#094d22]">{OFFICIAL_AUTHOR_SIGNATURE}</div>
              </div>
            </div>

            <div className="border-2 border-black p-3 mb-2 bg-slate-50 text-xs leading-relaxed">
              <div className="font-black text-[#094d22] mb-1" contentEditable suppressContentEditableWarning>
                الموضوع : {activeMeeting.sessionTitle}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <strong className="text-[#d91424] block mb-1">أولاً — جدول الأعمال المسطر:</strong>
                  <ol className="list-decimal list-inside space-y-0.5 font-bold">
                    {activeMeeting.agenda.map((item, i) => (
                      <li key={i} contentEditable suppressContentEditableWarning>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <strong className="text-[#117a37] block mb-1">ثانياً — القرارات والتوصيات المصادق عليها:</strong>
                  <ol className="list-decimal list-inside space-y-0.5 font-bold">
                    {activeMeeting.decisions.map((dec, i) => (
                      <li key={i} contentEditable suppressContentEditableWarning>
                        {dec}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Attendance & Signatures Table */}
            <table className="timetable-grid">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '40px' }}>الرقم</th>
                  <th>الاسم واللقب (أعضاء المجلس)</th>
                  <th>الرتبة (المرسوم 25-54)</th>
                  <th>التخصص</th>
                  <th>الحضور</th>
                  <th style={{ width: '150px' }}>التوقيع</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => (
                  <tr key={t.id}>
                    <td className="font-bold tabular-nums py-1">{idx + 1}</td>
                    <td className="font-extrabold text-right px-2">{t.name}</td>
                    <td className="font-bold">{rankDisplayTitle(t.rank)}</td>
                    <td>{specDisplayTitle(t.spec)}</td>
                    <td className="font-bold text-[#117a37]" contentEditable suppressContentEditableWarning>
                      حاضر(ة)
                    </td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="footer-signatures mt-4">
              <div>إمضاء كاتب(ة) الجلسة</div>
              <div>إمضاء وختم رئيس المجلس (المدير/ة)</div>
              <div>إرسال نسخة للسيد(ة) المفتش(ة)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
