import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  BookOpen,
  FileCheck2,
  Landmark,
  Briefcase,
  MapPin,
  UserCheck,
  Scale,
  Video,
  BarChart3,
  PhoneCall,
  Compass,
} from 'lucide-react';

export const SubNavbar: React.FC = () => {
  const { activeModal, setActiveModal } = useDatabase();

  const navItems = [
    {
      id: 'about',
      label: 'التعريف بالنقابة',
      icon: BookOpen,
      bgColor: 'bg-[#0f766e]',
      hoverColor: 'hover:bg-[#115e59]',
      borderColor: 'border-teal-400/30',
      textColor: 'text-white',
    },
    {
      id: 'assembly',
      label: 'منصة المحاضر والجمعيات العامة',
      icon: FileCheck2,
      bgColor: 'bg-[#b91c1c]',
      hoverColor: 'hover:bg-[#991b1b]',
      borderColor: 'border-red-400/40',
      textColor: 'text-white',
    },
    {
      id: 'activities',
      label: 'النشاطات النقابية',
      icon: Landmark,
      bgColor: 'bg-[#15803d]',
      hoverColor: 'hover:bg-[#166534]',
      borderColor: 'border-green-400/30',
      textColor: 'text-white',
    },
    {
      id: 'bags',
      label: 'الحقائب والمنصات',
      icon: Briefcase,
      bgColor: 'bg-[#5b2333]',
      hoverColor: 'hover:bg-[#451a26]',
      borderColor: 'border-rose-400/30',
      textColor: 'text-white',
    },
    {
      id: 'map',
      label: 'خريطة الهياكل النقابية',
      icon: MapPin,
      bgColor: 'bg-[#065f46]',
      hoverColor: 'hover:bg-[#064e3b]',
      borderColor: 'border-emerald-300/30',
      textColor: 'text-white',
    },
    {
      id: 'profile',
      label: 'تعديل بياناتي',
      icon: UserCheck,
      bgColor: 'bg-[#0f766e]',
      hoverColor: 'hover:bg-[#134e4a]',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-white',
    },
    {
      id: 'legislation',
      label: 'البيانات القانونية والتشريعات',
      icon: Scale,
      bgColor: 'bg-[#14532d]',
      hoverColor: 'hover:bg-[#052e16]',
      borderColor: 'border-emerald-400/30',
      textColor: 'text-white',
    },
    {
      id: 'live',
      label: 'الاجتماع المباشر',
      icon: Video,
      bgColor: 'bg-[#b91c1c]',
      hoverColor: 'hover:bg-[#991b1b]',
      borderColor: 'border-red-400/40',
      textColor: 'text-white',
    },
    {
      id: 'stats',
      label: 'الإحصائيات الإدارية',
      icon: BarChart3,
      bgColor: 'bg-[#0284c7]',
      hoverColor: 'hover:bg-[#0369a1]',
      borderColor: 'border-sky-300/40',
      textColor: 'text-white',
    },
    {
      id: 'contact',
      label: 'اتصل بنا',
      icon: PhoneCall,
      bgColor: 'bg-[#1e3a1f]',
      hoverColor: 'hover:bg-[#162d17]',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-100',
    },
    {
      id: 'guide',
      label: 'الدليل النقابي',
      icon: Compass,
      bgColor: 'bg-[#064e3b]',
      hoverColor: 'hover:bg-[#022c22]',
      borderColor: 'border-emerald-400/30',
      textColor: 'text-white',
    },
  ];

  return (
    <nav className="w-full bg-[#021d0c] py-2 px-2 border-b border-[#0d4520]/80 overflow-x-auto scrollbar-none shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center flex-nowrap sm:flex-wrap gap-1.5 md:gap-2 min-w-max sm:min-w-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModal === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModal(item.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold transition-all transform active:scale-95 border ${
                item.bgColor
              } ${item.hoverColor} ${item.borderColor} ${item.textColor} ${
                isActive ? 'ring-2 ring-amber-300 shadow-lg scale-105' : 'opacity-90 hover:opacity-100 hover:shadow'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
