import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Landmark,
  Calendar,
  MapPin,
  Users,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';

export const ActivitiesModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activities,
    wilayas,
    selectedWilayaId,
    addActivity,
  } = useDatabase();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<any>('ندوة تكوينية');
  const [location, setLocation] = useState('');
  const [wilayaName, setWilayaName] = useState(
    wilayas.find((w) => w.id === selectedWilayaId)?.nameAr || 'الجزائر العاصمة'
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetAudience, setTargetAudience] = useState('');
  const [participantsCount, setParticipantsCount] = useState<number>(100);
  const [description, setDescription] = useState('');

  if (activeModal !== 'activities') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    addActivity({
      title,
      type,
      date,
      location,
      wilayaName,
      targetAudience: targetAudience || 'كافة منتسبي قطاع التربية',
      participantsCount,
      description,
      status: 'مبرمج قريباً',
    });

    setTitle('');
    setLocation('');
    setDescription('');
    setShowAddForm(false);
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
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-end">
                <span className="bg-[#15803d] text-white text-xs px-2.5 py-0.5 rounded-full">
                  الميدان والعمل النقابي
                </span>
                <span>أجندة النشاطات النقابية والملتقيات التكوينية</span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                جدول الندوات، الملتقيات البيداغوجية، والأيام الدراسية عبر الولايات الـ 69
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#15803d] flex items-center justify-center text-white shrink-0 shadow-lg">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-[#021a0b] border-b border-emerald-800/80 flex items-center justify-between">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>برمجة نشاط نقابي جديد</span>
          </button>

          <span className="text-xs text-emerald-300 font-bold">
            الأنشطة الوطنية المقيدة: {activities.length} فعالية
          </span>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-[#042811] border border-amber-400/60 rounded-2xl space-y-3 animate-in slide-in-from-top-2 text-xs"
            >
              <h4 className="font-bold text-amber-300 text-sm">برمجة فعالية نقابية جديدة:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">عنوان الفعالية *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: الملتقى الجهوي للتكوين النقابي..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">نوع النشاط</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    <option value="ندوة تكوينية">ندوة تكوينية</option>
                    <option value="ملتقى بيداغوجي">ملتقى بيداغوجي</option>
                    <option value="يوم دراسي">يوم دراسي</option>
                    <option value="اجتماع تنسيقي">اجتماع تنسيقي</option>
                    <option value="وقفة احتجاجية">وقفة احتجاجية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">الولاية الحاضنة</label>
                  <select
                    value={wilayaName}
                    onChange={(e) => setWilayaName(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white text-right"
                  >
                    {wilayas.map((w) => (
                      <option key={w.id} value={w.nameAr}>
                        ولاية {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">المكان الدقيق *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="قاعة المحاضرات، المركز الثقافي..."
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">تاريخ الفعالية</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#02170a] border border-emerald-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">وصف النشاط وأهدافه</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="محاور الورشات والمواضيع المعالجة..."
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
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  إدراج في الأجندة
                </button>
              </div>
            </form>
          )}

          {/* Activities list */}
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 bg-[#042410] border border-emerald-800/80 rounded-2xl hover:border-emerald-600/60 transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                        {act.type}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">ولاية {act.wilayaName}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-1.5">{act.title}</h4>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                      act.status === 'مكتمل'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>التاريخ: {act.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>المكان: {act.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>المستهدفون: {act.targetAudience} ({act.participantsCount} مشارك)</span>
                  </span>
                </div>

                <p className="text-xs text-gray-200 bg-[#02170a] p-3 rounded-xl border border-emerald-900/60 leading-relaxed">
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#02170a] border-t border-emerald-800/80 flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-bold">
            التنظيم الميداني لنقابة عمال التربية S.N.T.E
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
