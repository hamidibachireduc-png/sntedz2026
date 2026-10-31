import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Map, ShieldCheck, Sparkles, Database } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setActiveModal } = useDatabase();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl border border-[#c59b27]/80 bg-gradient-to-r from-[#032a12] via-[#053d1b] to-[#032a12] p-4 sm:p-6 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left badge (as in screenshot) */}
          <div className="order-2 md:order-1 flex items-center gap-2">
            <div className="bg-[#042410]/90 border border-[#c59b27]/70 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black shadow-inner flex items-center gap-2 tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>منظومة القيادة والتنظيم الميداني</span>
            </div>
            
            <button
              onClick={() => setActiveModal('db-restore')}
              className="hidden lg:flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>قاعدة البيانات: مستعادة ومكتملة</span>
            </button>
          </div>

          {/* Right side: Badge with map + Main Title */}
          <div className="order-1 md:order-2 flex flex-col md:items-end text-center md:text-right gap-2">
            {/* Top gold badge & icon */}
            <div className="flex items-center justify-center md:justify-end gap-2.5">
              <span className="bg-[#e5a00d] text-stone-950 font-black text-xs sm:text-sm px-4 py-1 rounded-full shadow-md">
                الخريطة الإدارية الرسمية (69 ولاية)
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e5a00d] flex items-center justify-center shadow-lg text-stone-950 font-bold p-1">
                <span className="text-xl">🗺️</span>
              </div>
            </div>

            {/* Main title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-normal leading-snug drop-shadow-md">
              البوابة التفاعلية للقيادات وهياكل النقابة الوطنية لعمال التربية
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};
