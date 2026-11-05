import React, { useState, useRef } from 'react';
import {
  MODELS,
  Teacher,
  AssignedGroup,
  ActivityItem,
  rankDisplayTitle,
  OFFICIAL_AUTHOR_SIGNATURE,
} from '../data/timetableModels';

interface InstitutionData {
  wilaya: string;
  district: string;
  school: string;
  year: string;
  directorName: string;
}

interface AutomatedTimetableSystemProps {
  institution: InstitutionData;
  setInstitution: React.Dispatch<React.SetStateAction<InstitutionData>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  groups: AssignedGroup[];
  setGroups: React.Dispatch<React.SetStateAction<AssignedGroup[]>>;
  logoUrl: string;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  assignPolicy: string;
  setAssignPolicy: (policy: string) => void;
  runFairAssignment: (policyOverride?: string, currentTeachers?: Teacher[], currentGroups?: AssignedGroup[]) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
}

export default function AutomatedTimetableSystem({
  institution,
  setInstitution,
  teachers,
  setTeachers,
  groups,
  setGroups,
  logoUrl,
  onLogoUpload,
  assignPolicy,
  setAssignPolicy,
  runFairAssignment,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
}: AutomatedTimetableSystemProps) {
  const [activeSideTab, setActiveSideTab] = useState<'tab-custom' | 'tab-ranks' | 'tab-assign'>('tab-custom');
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || 'g1');

  // Form states for adding Teacher
  const [newTName, setNewTName] = useState('');
  const [newTRank, setNewTRank] = useState<Teacher['rank']>('تعليم ابتدائي');
  const [newTSpec, setNewTSpec] = useState<Teacher['spec']>('arabic');

  // Form states for adding Group
  const [newGLevel, setNewGLevel] = useState('5');
  const [newGRoom, setNewGRoom] = useState('01');

  // Custom activity overrides per group to support Drag & Drop swapping and inline edits
  const [customActivities, setCustomActivities] = useState<
    Record<string, Record<string, ActivityItem[]>>
  >({});

  const [dragSource, setDragSource] = useState<{
    slotKey: string;
    index: number;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const activeModel = activeGroup ? MODELS[activeGroup.level] || MODELS['1'] : MODELS['1'];
  const activeTeacher = activeGroup ? teachers.find((t) => t.id === activeGroup.teacherId) : undefined;
  const lang = activeModel.lang || 'ar';
  const isLtr = lang === 'fr' || lang === 'en' || lang === 'tz';

  const handleFontChange = (newFont: string, newSize: string) => {
    setFontFamily(newFont);
    setFontSize(newSize);
    document.documentElement.style.setProperty('--app-font', newFont);
    document.documentElement.style.setProperty('--table-font-scale', newSize);
  };

  const handleAddTeacher = () => {
    const trimmed = newTName.trim();
    if (!trimmed) {
      showToast('يرجى إدخال اسم ولقب الأستاذ(ة)');
      return;
    }
    const newTeacher: Teacher = {
      id: 't_' + Date.now(),
      name: trimmed,
      rank: newTRank,
      spec: newTSpec,
      installDate: '2026-09-01',
      status: 'ناشط',
    };
    const updatedTeachers = [...teachers, newTeacher];
    setTeachers(updatedTeachers);
    setNewTName('');
    runFairAssignment(assignPolicy, updatedTeachers, groups);
    showToast(`تمت إضافة ${trimmed} وتحديث الإسناد الآلي`);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    const updatedGroups = groups.map((g) => (g.teacherId === id ? { ...g, teacherId: '' } : g));
    setGroups(updatedGroups);
    showToast('تم حذف الأستاذ(ة) من القائمة');
  };

  const handleAddGroup = () => {
    const roomTrim = newGRoom.trim() || '01';
    const newId = 'g_' + Date.now();
    const newGrp: AssignedGroup = {
      id: newId,
      level: newGLevel,
      room: roomTrim,
      teacherId: '',
      boys: 16,
      girls: 16,
      repeaters: 0,
    };
    const updatedGroups = [...groups, newGrp];
    setGroups(updatedGroups);
    setActiveGroupId(newId);
    runFairAssignment(assignPolicy, teachers, updatedGroups);
    showToast('تمت إضافة القسم وتطبيق الإسناد الآلي');
  };

  const handleDeleteGroup = (id: string) => {
    if (groups.length <= 1) {
      showToast('يجب الإبقاء على قسم واحد على الأقل');
      return;
    }
    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    if (activeGroupId === id) {
      setActiveGroupId(updated[0].id);
    }
  };

  const handleChangeGroupTeacher = (groupId: string, teacherId: string) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, teacherId } : g)));
  };

  const getSlotActivities = (dayIdx: number, period: 'm1' | 'm2' | 'a1', defaultArr: ActivityItem[]): ActivityItem[] => {
    const slotKey = `${dayIdx}_${period}`;
    const groupCustom = customActivities[activeGroup?.id || ''];
    if (groupCustom && groupCustom[slotKey]) {
      return groupCustom[slotKey];
    }
    return defaultArr;
  };

  const getDefaultSlotItems = (slotKey: string): ActivityItem[] => {
    const [dIdxStr, period] = slotKey.split('_');
    const dObj = activeModel.days[Number(dIdxStr)];
    if (!dObj) return [];
    if (period === 'm1') return dObj.m1;
    if (period === 'm2') return dObj.m2;
    if (period === 'a1' && dObj.a1 !== 'off') return dObj.a1;
    return [];
  };

  const handleDropActivity = (targetSlotKey: string, targetIndex: number) => {
    if (!dragSource || !activeGroup) return;
    const { slotKey: srcSlotKey, index: srcIndex } = dragSource;
    if (srcSlotKey === targetSlotKey && srcIndex === targetIndex) return;

    const groupId = activeGroup.id;
    const currentGroupMap = { ...(customActivities[groupId] || {}) };

    const sourceDefaultArr = getDefaultSlotItems(srcSlotKey);
    const targetDefaultArr = getDefaultSlotItems(targetSlotKey);

    const srcList = [...(currentGroupMap[srcSlotKey] || sourceDefaultArr.map((x) => ({ ...x })))];
    const targetList =
      srcSlotKey === targetSlotKey
        ? srcList
        : [...(currentGroupMap[targetSlotKey] || targetDefaultArr.map((x) => ({ ...x })))];

    const itemA = { ...srcList[srcIndex] };
    const itemB = { ...targetList[targetIndex] };

    srcList[srcIndex] = { ...itemA, t: itemB.t, d: itemB.d, c: itemB.c };
    targetList[targetIndex] = { ...itemB, t: itemA.t, d: itemA.d, c: itemA.c };

    currentGroupMap[srcSlotKey] = srcList;
    if (srcSlotKey !== targetSlotKey) {
      currentGroupMap[targetSlotKey] = targetList;
    }

    setCustomActivities((prev) => ({
      ...prev,
      [groupId]: currentGroupMap,
    }));
    setDragSource(null);
  };

  const exportLandscapePDF = () => {
    const element = sheetRef.current;
    if (!element) return;
    const title = activeModel ? activeModel.levelTitle : 'ابتدائي';
    const w = window as unknown as {
      html2pdf?: () => {
        set: (opt: unknown) => { from: (el: HTMLElement) => { save: () => void } };
      };
    };
    if (w.html2pdf) {
      const opt = {
        margin: [3, 3, 3, 3],
        filename: `استعمال_الزمن_${title.replace(/\s+/g, '_')}_إعداد_الأستاذ_حميدي_البشير_2026.pdf`,
        image: { type: 'jpeg', quality: 0.99 },
        html2canvas: { scale: 2.2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };
      w.html2pdf().set(opt).from(element).save();
      showToast('جاري تصدير ملف PDF بتخطيط A4 أفقي...');
    } else {
      window.print();
    }
  };

  const rankBadgeStyle = (rank: string) => {
    if (rank === 'مميز') return 'bg-[#d91424] text-white';
    if (rank === 'قسم ثان') return 'bg-[#117a37] text-white';
    if (rank === 'قسم أول') return 'bg-[#0284c7] text-white';
    return 'bg-[#64748b] text-white';
  };

  // Localized labels for A4 sheet
  const repHeading =
    lang === 'fr'
      ? 'RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE'
      : lang === 'en'
      ? 'PEOPLE’S DEMOCRATIC REPUBLIC OF ALGERIA'
      : lang === 'tz'
      ? 'TAGDUDANT TAZZAYRIT TAMEGDAYT TAƔERFANT'
      : 'الجمهورية الجزائرية الديمقراطية الشعبية';

  const minHeading =
    lang === 'fr'
      ? 'MINISTÈRE DE L’ÉDUCATION NATIONALE'
      : lang === 'en'
      ? 'MINISTRY OF NATIONAL EDUCATION'
      : lang === 'tz'
      ? 'AƔLIF N USEGMI AƔELNAW'
      : 'وزارة التربية الوطنية';

  const lblTitleWilaya =
    lang === 'fr'
      ? 'Direction de l’Éducation : '
      : lang === 'en'
      ? 'Directorate of Education: '
      : lang === 'tz'
      ? 'Tanmehla n Usegmi : '
      : 'مديرية التربية لولاية : ';

  const lblTitleInsp =
    lang === 'fr'
      ? 'Inspection de l’Enseignement Primaire'
      : lang === 'en'
      ? 'Primary Education Inspectorate'
      : lang === 'tz'
      ? 'Tasweḍt n Ulmud Amezwaru'
      : 'مفتشية التعليم الابتدائي';

  const lblTitleDist =
    lang === 'fr'
      ? 'Circonscription : '
      : lang === 'en'
      ? 'District: '
      : lang === 'tz'
      ? 'Tamnaḍt : '
      : 'مقاطعة : ';

  const lblTitleSchool =
    lang === 'fr'
      ? 'École Primaire : '
      : lang === 'en'
      ? 'Primary School: '
      : lang === 'tz'
      ? 'Aɣerbaz Amezwaru : '
      : 'المدرسة الابتدائية : ';

  const lblTitleYear =
    lang === 'fr'
      ? 'Année Scolaire : '
      : lang === 'en'
      ? 'School Year: '
      : lang === 'tz'
      ? 'Aseggas Aɣurbiz : '
      : 'السنة الدراسية : ';

  const lblTitleTeacher =
    lang === 'fr'
      ? 'Enseignant(e) : '
      : lang === 'en'
      ? 'Teacher: '
      : lang === 'tz'
      ? 'Aselmad / Taselmadt : '
      : 'الأستاذ(ة) : ';

  const lblTitleLevel =
    lang === 'fr'
      ? 'Matière : '
      : lang === 'en'
      ? 'Subject: '
      : lang === 'tz'
      ? 'Tangalt : '
      : 'المستوى / التخصص : ';

  const valLevelText =
    lang === 'fr'
      ? 'Langue Française'
      : lang === 'en'
      ? 'English Language'
      : lang === 'tz'
      ? 'Tutlayt Tamaziɣt'
      : activeModel.levelTitle;

  const lblTitleRoom =
    lang === 'fr'
      ? 'Classes Assignées : '
      : lang === 'en'
      ? 'Assigned Classes: '
      : lang === 'tz'
      ? 'Ismilen : '
      : 'القسم / الأفواج المسندة : ';

  const sig1 =
    lang === 'fr'
      ? 'Signature de l’Enseignant(e)'
      : lang === 'en'
      ? 'Teacher’s Signature'
      : lang === 'tz'
      ? 'Azmul n Uselmad'
      : 'إمضاء الأستاذ (ة)';

  const sig2 =
    lang === 'fr'
      ? 'Signature du Directeur / Directrice'
      : lang === 'en'
      ? 'Headmaster’s Signature'
      : lang === 'tz'
      ? 'Azmul n Unemhal'
      : 'إمضاء السيد (ة) المدير (ة)';

  const sig3 =
    lang === 'fr'
      ? 'Signature de l’Inspecteur / Inspectrice'
      : lang === 'en'
      ? 'Inspector’s Signature'
      : lang === 'tz'
      ? 'Azmul n Umaswaḍ'
      : 'إمضاء السيد (ة) المفتش (ة)';

  const dayHeaderLabel = lang === 'fr' ? 'Jours' : lang === 'en' ? 'Days' : lang === 'tz' ? 'Ussan' : 'الأيام';
  const breakLabel = lang === 'fr' ? 'RÉCRÉATION' : lang === 'en' ? 'MORNING BREAK' : lang === 'tz' ? 'ASGUNFU' : 'إستراحــــــــــــة';
  const lunchLabel = lang === 'fr' ? 'PAUSE DÉJEUNER' : lang === 'en' ? 'LUNCH BREAK' : lang === 'tz' ? 'IMENSI N UZAL' : 'الفترة المسائيــــــــة';
  const offLabel =
    lang === 'fr'
      ? 'Formation Pédagogique / Coordination & Activités'
      : lang === 'en'
      ? 'Pedagogical Training / Coordination & Activities'
      : lang === 'tz'
      ? 'Asileɣ Asensegman / Irmad Idelsanen'
      : 'تكوين / نشاطات ثقافية ورياضية';

  const teacherDisplayText = activeTeacher
    ? `${activeTeacher.name} (${rankDisplayTitle(activeTeacher.rank, lang)})`
    : '.........................';

  return (
    <div className="space-y-4">
      {/* Sub-header Control Bar for Automated Timetable System */}
      <div className="no-print bg-gradient-to-l from-[#073818] via-[#117a37] to-[#d91424] text-white p-4 rounded-xl border-b-4 border-[#e6b85c] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-[#e6b85c] p-1 flex items-center justify-center shrink-0 shadow">
            <img src={logoUrl} alt="SNTE Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black">
              منظومة التوقيت الأسبوعي والإسناد العادل للتعليم الابتدائي (نظام الدوام الواحد)
            </h2>
            <div className="inline-block mt-1 bg-black/55 border-r-4 border-[#e6b85c] border-l-4 border-[#d91424] px-3 py-0.5 rounded text-xs font-extrabold text-yellow-200">
              {OFFICIAL_AUTHOR_SIGNATURE}
            </div>
            <p className="text-xs text-white/90 mt-1">
              اللجنة الوطنية للتربية والبيداغوجيا - النقابة الوطنية لعمال التربية (S.N.T.E) | تطبيق أحكام المرسوم التنفيذي 25-54
            </p>
          </div>
        </div>

        {/* Font Selector & Print/PDF Toolbar */}
        <div className="bg-white/15 backdrop-blur-md border-2 border-[#e6b85c] rounded-xl p-2.5 flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-yellow-200 text-xs font-extrabold mb-1">🔤 نوع الخط (تغيير فوري):</label>
            <select
              value={fontFamily}
              onChange={(e) => handleFontChange(e.target.value, fontSize)}
              className="bg-white text-[#094d22] font-bold text-xs px-2.5 py-1.5 rounded border border-white cursor-pointer"
            >
              <option value="'Cairo', sans-serif">خط القاهرة (Cairo - عصري رسمي)</option>
              <option value="'Amiri', serif">الخط الأميري (Amiri - مطبعي كلاسيكي)</option>
              <option value="'Tajawal', sans-serif">خط تجوال (Tajawal - واضح وأنيق)</option>
              <option value="'Changa', sans-serif">خط شانغا (Changa - هندسي عريض)</option>
              <option value="'Traditional Arabic', serif">الخط العربي التقليدي (Traditional)</option>
            </select>
          </div>

          <div>
            <label className="block text-yellow-200 text-xs font-extrabold mb-1">📏 حجم خط الجدول:</label>
            <select
              value={fontSize}
              onChange={(e) => handleFontChange(fontFamily, e.target.value)}
              className="bg-white text-[#094d22] font-bold text-xs px-2.5 py-1.5 rounded border border-white cursor-pointer"
            >
              <option value="12px">صغير (12px)</option>
              <option value="13px">متوسط مثالي (13px)</option>
              <option value="14px">كبير (14px)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0">
            <button
              onClick={exportLandscapePDF}
              className="bg-[#d91424] hover:bg-[#9e0b17] text-white border border-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
            >
              📥 تحميل PDF (A4 أفقي)
            </button>
            <button
              onClick={() => {
                try {
                  window.print();
                } catch {
                  // fallback
                }
                if (window.self !== window.top) {
                  exportLandscapePDF();
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-black border border-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
            >
              🖨️ طباعة فورية
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="no-print bg-[#e8f5e9] border border-[#117a37] text-[#094d22] px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline cursor-pointer">
            إغلاق
          </button>
        </div>
      )}

      {/* Main 2-column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-[395px_1fr] gap-5 items-start">
        {/* Right Side Control Panel */}
        <aside className="no-print bg-white rounded-xl border-t-6 border-t-[#117a37] border-b-6 border-b-[#d91424] p-4 shadow-md">
          {/* 3 Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-200 p-1 rounded-lg mb-3.5">
            <button
              onClick={() => setActiveSideTab('tab-custom')}
              className={`py-2 px-1 rounded-md font-extrabold text-xs cursor-pointer transition ${
                activeSideTab === 'tab-custom' ? 'bg-[#117a37] text-white' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              1. الشعار والخيارات
            </button>
            <button
              onClick={() => setActiveSideTab('tab-ranks')}
              className={`py-2 px-1 rounded-md font-extrabold text-xs cursor-pointer transition ${
                activeSideTab === 'tab-ranks' ? 'bg-[#117a37] text-white' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              2. الأساتذة والرتب
            </button>
            <button
              onClick={() => setActiveSideTab('tab-assign')}
              className={`py-2 px-1 rounded-md font-extrabold text-xs cursor-pointer transition ${
                activeSideTab === 'tab-assign' ? 'bg-[#117a37] text-white' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              3. الإسناد العادل
            </button>
          </div>

          {/* Tab 1: الشعار والخيارات */}
          {activeSideTab === 'tab-custom' && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex items-center justify-between text-xs font-extrabold text-[#094d22] select-none">
                <span>© من إعداد الأستاذ حميدي البشير - أكتوبر 2026</span>
                <span className="bg-[#d91424] text-white text-[11px] px-2 py-0.5 rounded font-black">🔒 ملكية خاصة</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">مديرية التربية لولاية:</label>
                  <input
                    type="text"
                    value={institution.wilaya}
                    onChange={(e) => setInstitution((prev) => ({ ...prev, wilaya: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">مقاطعة التفتيش:</label>
                  <input
                    type="text"
                    value={institution.district}
                    onChange={(e) => setInstitution((prev) => ({ ...prev, district: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#094d22] mb-1">المدرسة الابتدائية:</label>
                <input
                  type="text"
                  value={institution.school}
                  onChange={(e) => setInstitution((prev) => ({ ...prev, school: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">السنة الدراسية:</label>
                  <input
                    type="text"
                    value={institution.year}
                    onChange={(e) => setInstitution((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">اسم السيد(ة) المدير(ة):</label>
                  <input
                    type="text"
                    value={institution.directorName}
                    onChange={(e) => setInstitution((prev) => ({ ...prev, directorName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#094d22] mb-1">رفع ملف صورة الشعار المرفق (اختياري):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 cursor-pointer"
                />
              </div>

              <div className="bg-[#e8f5e9] p-2.5 rounded-lg text-xs text-[#094d22] leading-relaxed font-semibold border border-[#117a37]/30">
                💡 يمكنك النقر مباشرة على أي خلية داخل الجدول لتعديل محتواها، أو سحب وإفلات الحصص (Drag & Drop) لتبديل مواقعها، وتنعكس بيانات المدرسة تلقائياً في كافة وثائق المدير.
              </div>
            </div>
          )}

          {/* Tab 2: الأساتذة والرتب */}
          {activeSideTab === 'tab-ranks' && (
            <div className="space-y-3">
              <div className="bg-[#ffebee] border border-[#d91424]/30 p-2.5 rounded-lg text-xs text-[#7f1d1d] leading-relaxed">
                <strong>⚖️ تصنيف الرتب (المرسوم التنفيذي 25-54):</strong>
                <br />
                تبدأ المسميات بـ <b>أستاذ تعليم ابتدائي</b> ثم تليها المسميات الأخرى (<b>أستاذ قسم أول</b>،{' '}
                <b>أستاذ قسم ثانٍ</b>، <b>أستاذ مميز</b>).
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#094d22] mb-1">اسم ولقب الأستاذ(ة):</label>
                <input
                  type="text"
                  value={newTName}
                  onChange={(e) => setNewTName(e.target.value)}
                  placeholder="مثال: أ. حميدي البشير / Mme. Amrani"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">الرتبة (المرسوم 25-54):</label>
                  <select
                    value={newTRank}
                    onChange={(e) => setNewTRank(e.target.value as Teacher['rank'])}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                  >
                    <option value="تعليم ابتدائي">أستاذ تعليم ابتدائي</option>
                    <option value="قسم أول">أستاذ قسم أول</option>
                    <option value="قسم ثان">أستاذ قسم ثانٍ</option>
                    <option value="مميز">أستاذ مميز</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">التخصص:</label>
                  <select
                    value={newTSpec}
                    onChange={(e) => setNewTSpec(e.target.value as Teacher['spec'])}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                  >
                    <option value="arabic">لغة عربية</option>
                    <option value="french">Langue Française (فرنسية)</option>
                    <option value="english">English Language (إنجليزية)</option>
                    <option value="amazigh">Tutlayt Tamaziɣt (أمازيغية)</option>
                    <option value="pe">تربية بدنية ورياضية</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddTeacher}
                className="w-full bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs py-2.5 rounded-lg transition cursor-pointer"
              >
                + إضافة أستاذ(ة) للهيئة التربوية
              </button>

              <div>
                <label className="block text-xs font-extrabold text-[#094d22] mb-1">
                  قائمة الأساتذة والأقسام المسندة ({teachers.length}):
                </label>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-1.5 bg-slate-50 space-y-1.5">
                  {teachers.map((t) => {
                    const grp = groups.find((g) => g.teacherId === t.id);
                    const model = grp ? MODELS[grp.level] : null;
                    const infoText = model && grp ? `${model.levelTitle} - ${grp.room}` : 'غير مسند';
                    return (
                      <div
                        key={t.id}
                        className="bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-slate-900">{t.name}</strong>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${rankBadgeStyle(t.rank)}`}>
                              {rankDisplayTitle(t.rank)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">المسند: {infoText}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="bg-[#d91424] hover:bg-[#9e0b17] text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer shrink-0"
                        >
                          حذف
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: الإسناد العادل */}
          {activeSideTab === 'tab-assign' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#094d22] mb-1">طريقة الإسناد المعتمدة:</label>
                <select
                  value={assignPolicy}
                  onChange={(e) => {
                    setAssignPolicy(e.target.value);
                    runFairAssignment(e.target.value, teachers, groups);
                    showToast('تم تحديث الإسناد وفق السياسة المختارة');
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                >
                  <option value="normal">1. الطريقة العادية</option>
                  <option value="by_rank">2. طريقة أستاذ حسب الرتبة (المرسوم 25-54)</option>
                  <option value="exceptional">3. طريقة الإسناد الاستثنائي (الأقسام النهائية أولاً)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">القسم / اللغة المسندة:</label>
                  <select
                    value={newGLevel}
                    onChange={(e) => setNewGLevel(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
                  >
                    <option value="prep">التربية التحضيرية (17 سا)</option>
                    <option value="1">السنة الأولى ابتدائي (19 سا)</option>
                    <option value="2">السنة الثانية ابتدائي (19 سا)</option>
                    <option value="3">السنة الثالثة ابتدائي (17 سا)</option>
                    <option value="4">السنة الرابعة ابتدائي (17 سا)</option>
                    <option value="5">السنة الخامسة ابتدائي (17 سا)</option>
                    <option value="fr">Français (3AP / 4AP / 5AP)</option>
                    <option value="en">English (3PS / 4PS / 5PS)</option>
                    <option value="tz">Tamaziɣt - الأمازيغية (4AP / 5AP)</option>
                    <option value="pe">التربية البدنية (س1 إلى س5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#094d22] mb-1">الحجرة / الأفواج:</label>
                  <input
                    type="text"
                    value={newGRoom}
                    onChange={(e) => setNewGRoom(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleAddGroup}
                className="w-full bg-[#117a37] hover:bg-[#094d22] text-white font-extrabold text-xs py-2 rounded-lg transition cursor-pointer"
              >
                + إضافة قسم / توقيت لغة جديد
              </button>

              <button
                onClick={() => {
                  runFairAssignment(assignPolicy, teachers, groups);
                  showToast('تم تطبيق الإسناد الآلي العادل بنجاح');
                }}
                className="w-full bg-[#d91424] hover:bg-[#9e0b17] text-white font-extrabold text-xs py-2 rounded-lg transition cursor-pointer"
              >
                ⚖️ تطبيق الإسناد آلياً
              </button>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-1.5 bg-slate-50 space-y-1.5">
                {groups.map((g) => {
                  const model = MODELS[g.level];
                  if (!model) return null;
                  return (
                    <div key={g.id} className="bg-white border border-slate-300 rounded-md p-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">
                          {model.levelTitle} ({g.room})
                        </strong>
                        <span className="text-[11px] font-extrabold text-[#d91424] tabular-nums">
                          {model.arabicActualHours} سا
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={g.teacherId}
                          onChange={(e) => handleChangeGroupTeacher(g.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="">-- اختر الأستاذ(ة) --</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({rankDisplayTitle(t.rank)})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteGroup(g.id)}
                          className="bg-[#d91424] hover:bg-[#9e0b17] text-white text-[11px] font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Left Main Area: Level Selector & Official Printable A4 Landscape Sheet */}
        <div className="sheet-scroll-container space-y-3">
          <div className="no-print bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs space-y-2">
            <div className="text-xs font-extrabold text-[#094d22]">
              اختر القسم المسند (اللغة العربية / Français / English / Tamaziɣt / التربية البدنية) لمعاينة وطباعة جدوله الرسمي:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g) => {
                const m = MODELS[g.level];
                if (!m) return null;
                const tObj = teachers.find((t) => t.id === g.teacherId);
                const isActive = g.id === activeGroup?.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(g.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold cursor-pointer transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[#d91424] border-[#d91424] text-white shadow-xs'
                        : 'bg-white border-[#117a37] text-[#094d22] hover:bg-[#e8f5e9]'
                    }`}
                  >
                    {m.levelTitle} ({tObj ? tObj.name : 'غير مسند'})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official A4 Landscape Sheet */}
          <div
            ref={sheetRef}
            className="a4-landscape-page"
            dir={isLtr ? 'ltr' : 'rtl'}
            id="printableA4Sheet"
          >
            <div className="sheet-header-grid">
              <div className="sheet-right-col">
                <div>
                  <span>{lblTitleWilaya}</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || '';
                      setInstitution((prev) => ({ ...prev, wilaya: val }));
                    }}
                  >
                    {institution.wilaya}
                  </span>
                </div>
                <div>{lblTitleInsp}</div>
                <div>
                  <span>{lblTitleDist}</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || '';
                      setInstitution((prev) => ({ ...prev, district: val }));
                    }}
                  >
                    {institution.district}
                  </span>
                </div>
                <div>
                  <span>{lblTitleSchool}</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || '';
                      setInstitution((prev) => ({ ...prev, school: val }));
                    }}
                  >
                    {institution.school}
                  </span>
                </div>
              </div>

              <div className="sheet-center-col">
                <div className="rep-heading">{repHeading}</div>
                <div className="min-heading">{minHeading}</div>
                <div className="title-frame-with-logo">
                  <img src={logoUrl} alt="SNTE" />
                  <div className="title-frame-text">
                    <span className="main-doc-title">{activeModel.systemTitle}</span>
                  </div>
                </div>
              </div>

              <div className="sheet-left-col">
                <div>
                  <span>{lblTitleYear}</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || '';
                      setInstitution((prev) => ({ ...prev, year: val }));
                    }}
                  >
                    {institution.year}
                  </span>
                </div>
                <div>
                  <span>{lblTitleTeacher}</span>
                  <span style={{ color: 'var(--red-snte)' }} contentEditable suppressContentEditableWarning>
                    {teacherDisplayText}
                  </span>
                </div>
                <div>
                  <span>{lblTitleLevel}</span>
                  <span style={{ color: 'var(--green-dark)' }}>{valLevelText}</span>
                </div>
                <div>
                  <span>{lblTitleRoom}</span>
                  <span contentEditable suppressContentEditableWarning>
                    {activeGroup?.room}
                  </span>{' '}
                  <small style={{ color: 'var(--red-dark)' }}>[{activeModel.workloadLabel}]</small>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <table className="summary-table">
              <thead>
                <tr>
                  {activeModel.summaryHeaders.map((h, i) => {
                    const isHi = i === activeModel.summaryHeaders.length - 1 || h.includes('التعليم الفعلي');
                    return (
                      <th
                        key={i}
                        className={isHi ? 'highlight-col' : ''}
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {activeModel.summaryCounts.map((c, i) => {
                    const h = activeModel.summaryHeaders[i] || '';
                    const isHi = i === activeModel.summaryHeaders.length - 1 || h.includes('التعليم الفعلي');
                    return (
                      <td
                        key={i}
                        className={isHi ? 'highlight-col' : ''}
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {c}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  {activeModel.summaryDurs.map((d, i) => {
                    const h = activeModel.summaryHeaders[i] || '';
                    const isHi = i === activeModel.summaryHeaders.length - 1 || h.includes('التعليم الفعلي');
                    return (
                      <td
                        key={i}
                        className={isHi ? 'highlight-col' : ''}
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {d}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>

            {/* Main Timetable Grid */}
            <table className="timetable-grid">
              <thead>
                <tr className="hours-header">
                  <th style={{ width: '85px' }}>{dayHeaderLabel}</th>
                  <th style={{ width: '27%' }}>08:00 ◄────────► 09:30</th>
                  <th style={{ width: '34px' }}>{'9:30\n9:45'}</th>
                  <th style={{ width: '27%' }}>09:45 ◄────────► 11:15</th>
                  <th style={{ width: '34px' }}>{'11:15\n13:00'}</th>
                  <th style={{ width: '32%' }}>13:00 ◄────────► 15:00</th>
                </tr>
              </thead>
              <tbody>
                {activeModel.days.map((dObj, dIdx) => {
                  const m1Items = getSlotActivities(dIdx, 'm1', dObj.m1);
                  const m2Items = getSlotActivities(dIdx, 'm2', dObj.m2);
                  const a1Items = dObj.a1 === 'off' ? 'off' : getSlotActivities(dIdx, 'a1', dObj.a1);

                  return (
                    <tr key={dIdx}>
                      <td className="day-col-cell">{dObj.day}</td>

                      {/* Morning Period 1 */}
                      <td>
                        <div className="activities-flex">
                          {m1Items.map((item, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={() => setDragSource({ slotKey: `${dIdx}_m1`, index: idx })}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDropActivity(`${dIdx}_m1`, idx)}
                              className={`act-box ${item.w || 'w-30'} ${item.c || 'bg-arab'}`}
                            >
                              <div className="act-name" contentEditable suppressContentEditableWarning>
                                {item.t}
                              </div>
                              <div className="act-time" contentEditable suppressContentEditableWarning>
                                {item.d}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Break Strip */}
                      {dIdx === 0 && (
                        <td className="vertical-strip" rowSpan={5}>
                          {breakLabel}
                        </td>
                      )}

                      {/* Morning Period 2 */}
                      <td>
                        <div className="activities-flex">
                          {m2Items.map((item, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={() => setDragSource({ slotKey: `${dIdx}_m2`, index: idx })}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDropActivity(`${dIdx}_m2`, idx)}
                              className={`act-box ${item.w || 'w-30'} ${item.c || 'bg-arab'}`}
                            >
                              <div className="act-name" contentEditable suppressContentEditableWarning>
                                {item.t}
                              </div>
                              <div className="act-time" contentEditable suppressContentEditableWarning>
                                {item.d}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Lunch Strip */}
                      {dIdx === 0 && (
                        <td className="vertical-strip" rowSpan={5}>
                          {lunchLabel}
                        </td>
                      )}

                      {/* Afternoon Period */}
                      {a1Items === 'off' ? (
                        <td className="bg-off" contentEditable suppressContentEditableWarning>
                          {offLabel}
                        </td>
                      ) : (
                        <td>
                          <div className="activities-flex">
                            {a1Items.map((item, idx) => (
                              <div
                                key={idx}
                                draggable
                                onDragStart={() => setDragSource({ slotKey: `${dIdx}_a1`, index: idx })}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropActivity(`${dIdx}_a1`, idx)}
                                className={`act-box ${item.w || 'w-30'} ${item.c || 'bg-arab'}`}
                              >
                                <div className="act-name" contentEditable suppressContentEditableWarning>
                                  {item.t}
                                </div>
                                <div className="act-time" contentEditable suppressContentEditableWarning>
                                  {item.d}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signatures Footer */}
            <div className="footer-signatures">
              <div>{sig1}</div>
              <div>{sig2}</div>
              <div>{sig3}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
