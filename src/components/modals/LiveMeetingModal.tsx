import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
  X,
  Send,
  Radio,
} from 'lucide-react';

export const LiveMeetingModal: React.FC = () => {
  const { activeModal, setActiveModal, currentUser } = useDatabase();

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'الأستاذ عبد الكريم بوجمعة (الأمين العام الوطني)',
      text: 'مرحباً بجميع الإخوة الأمناء الولائيين وأعضاء المكتب الوطني في هذا الاجتماع التقييمي الطارئ.',
      time: '10:05',
    },
    {
      sender: 'الأستاذ عوايشية طارق',
      text: 'تم ربط البوابة المركزية ومزامنة كافة المحاضر وقواعد البيانات لجميع الولايات الـ 69 بنجاح.',
      time: '10:08',
    },
    {
      sender: 'أمين ولاية الجلفة (الحاج بن عطية)',
      text: 'ولاية الجلفة حاضرة وجاهزة لعرض التقرير الولائي حول منخرطي قطاع التربية.',
      time: '10:12',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  if (activeModal !== 'live') return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: currentUser.name,
        text: newMessage,
        time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-[#02170a] border-2 border-red-500/80 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-emerald-800/80 bg-[#011107] flex items-center justify-between">
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                  <Radio className="w-3 h-3" />
                  <span>مباشر الآن</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  قاعة الاجتماع المرئي المباشر للقيادات (S.N.T.E Direct)
                </h3>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                الدورة التنسيقية العاجلة للمكتب الوطني مع المكاتب الولائية الـ 69
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Video Stage & Side Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden p-3 gap-3">
          {/* Video Grid (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              {/* Speaker 1: Current User */}
              <div className="relative rounded-2xl bg-[#042811] border-2 border-amber-400/80 overflow-hidden aspect-video flex flex-col justify-between p-3 shadow-lg">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                    أنت (مقدم العرض)
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                </div>

                <div className="text-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-800 border-2 border-amber-300 mx-auto flex items-center justify-center text-xl font-black text-white mb-2 shadow">
                    ط.ع
                  </div>
                  <h4 className="font-black text-sm text-white">{currentUser.name}</h4>
                  <p className="text-[11px] text-amber-300">{currentUser.role}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-300 z-10 bg-black/40 px-2 py-1 rounded-lg">
                  <span>الصوت: {micOn ? 'متصل ومفتوح' : 'مكتوم'}</span>
                  <span className="text-emerald-400">جودة البث: HD 1080p</span>
                </div>
              </div>

              {/* Speaker 2: National SG */}
              <div className="relative rounded-2xl bg-[#03200d] border border-emerald-700/60 overflow-hidden aspect-video flex flex-col justify-between p-3">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-emerald-800 text-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    المتحدث الرئيسي
                  </span>
                </div>

                <div className="text-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-900 border-2 border-emerald-400 mx-auto flex items-center justify-center text-xl font-black text-white mb-2 shadow">
                    ع.ب
                  </div>
                  <h4 className="font-black text-sm text-white">الأستاذ عبد الكريم بوجمعة</h4>
                  <p className="text-[11px] text-emerald-300">الأمين العام الوطني للنقابة</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 z-10 bg-black/40 px-2 py-1 rounded-lg">
                  <span>المقر المركزي - الجزائر</span>
                  <span className="text-emerald-400">● مباشر</span>
                </div>
              </div>

              {/* Speaker 3: Djelfa Secretary */}
              <div className="relative rounded-2xl bg-[#03200d] border border-emerald-700/60 overflow-hidden aspect-video flex flex-col justify-between p-3">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-emerald-900 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    مكتب ولاية الجلفة (17)
                  </span>
                </div>

                <div className="text-center my-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 border border-amber-400 mx-auto flex items-center justify-center text-lg font-bold text-amber-300 mb-1 shadow">
                    ح.م
                  </div>
                  <h4 className="font-bold text-xs text-white">الأستاذ الحاج بن عطية مسعود</h4>
                  <p className="text-[10px] text-gray-300">الأمين الولائي لولاية الجلفة</p>
                </div>

                <div className="text-[10px] text-gray-400 z-10 bg-black/40 px-2 py-0.5 rounded">
                  دار الثقافة ابن رشد - الجلفة
                </div>
              </div>

              {/* Speaker 4: Oran / Regional Secretary */}
              <div className="relative rounded-2xl bg-[#03200d] border border-emerald-700/60 overflow-hidden aspect-video flex flex-col justify-between p-3">
                <div className="flex items-center justify-between z-10">
                  <span className="bg-emerald-900 text-cyan-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    التنسيقية الجهوية للغرب
                  </span>
                </div>

                <div className="text-center my-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 border border-cyan-400 mx-auto flex items-center justify-center text-lg font-bold text-cyan-300 mb-1 shadow">
                    ع.س
                  </div>
                  <h4 className="font-bold text-xs text-white">الأستاذ عبد القادر سنوسي</h4>
                  <p className="text-[10px] text-gray-300">المنسق الجهوي للغرب وأمين وهران</p>
                </div>

                <div className="text-[10px] text-gray-400 z-10 bg-black/40 px-2 py-0.5 rounded">
                  مقر التنسيقية - وهران
                </div>
              </div>
            </div>

            {/* Bottom In-call Controls */}
            <div className="bg-[#011408] border border-emerald-800/80 rounded-2xl p-2.5 flex items-center justify-center gap-3">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full font-bold transition-all ${
                  micOn ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
                title={micOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3 rounded-full font-bold transition-all ${
                  videoOn ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
                title={videoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-3 rounded-full font-bold transition-all ${
                  handRaised ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                title="طلب الكلمة (رفع اليد)"
              >
                <Hand className="w-5 h-5" />
              </button>

              <button
                onClick={() => alert('تمت مشاركة شاشة عرض البوابة النقابية مع أعضاء الجلسة.')}
                className="p-3 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                title="مشاركة الشاشة"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
                title="مغادرة الاجتماع"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Chat & Agenda */}
          <div className="bg-[#03200d] border border-emerald-800/80 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-emerald-800/80 bg-[#02170a] flex items-center justify-between text-xs">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>المحادثة المباشرة وقائمة الحضور</span>
              </span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-700/60">
                69 ولاية متصلة
              </span>
            </div>

            {/* Messages scroll */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className="bg-[#042811] border border-emerald-900/60 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold text-amber-300">{msg.sender}</span>
                    <span className="text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-gray-200 text-xs leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-emerald-800/80 bg-[#02170a] flex gap-1.5">
              <input
                type="text"
                placeholder="اكتب مداخلة أو سؤالاً في الجلسة..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#042410] border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-400/40 text-right focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="p-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
