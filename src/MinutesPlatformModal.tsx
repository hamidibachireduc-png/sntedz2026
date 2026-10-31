import React from 'react';

interface MinutesPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MinutesPlatformModal: React.FC<MinutesPlatformModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // ⚠️ ضع الرابط المنشور لتطبيقك (Web App URL) الذي ينتهي بـ /exec هنا
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby9NWPgJ0hX9jssgdVM4EuaJvuEMaMdkwVBj2aZyECUfFYz09LN-p1StR29av83vgNVfg/exec";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-gray-50 rounded-3xl w-full max-w-[1200px] h-[95vh] flex flex-col border border-emerald-900/50 shadow-2xl overflow-hidden font-['Cairo',sans-serif]">
        
        {/* شريط العنوان العلوي */}
        <div className="bg-gradient-to-l from-[#00381b] to-[#005a2b] p-4 shrink-0 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-emerald-300">
              📝
            </div>
            <div>
              <h2 className="text-lg font-black text-white">منصة المحاضر والجمعيات العامة</h2>
              <span className="text-[10px] text-amber-300 font-bold">النظام المستقل لإدارة المحاضر الرقمية</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/10 hover:bg-red-500 hover:text-white text-gray-200 rounded-full flex items-center justify-center transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* مساحة عرض التطبيق */}
        <div className="flex-1 w-full relative bg-[#e2efe8]">
          <iframe 
            src={WEB_APP_URL} 
            className="absolute inset-0 w-full h-full border-none"
            title="منصة المحاضر"
            allow="clipboard-read; clipboard-write"
          />
        </div>

      </div>
    </div>
  );
};
