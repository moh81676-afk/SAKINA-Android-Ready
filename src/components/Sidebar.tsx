import React from 'react';
import {
  Clock,
  BookMarked,
  BookOpen,
  Music,
  BellRing,
  Disc,
  Compass,
  CalendarClock,
  Calendar,
  Bot,
  Settings as SettingsIcon,
  Globe,
  Download,
  Sparkles,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { CityConfig } from '../types';
import { PrayerPhaseInfo } from '../utils/prayerEngine';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  language: 'ar' | 'en';
  city: CityConfig;
  phaseInfo: PrayerPhaseInfo | null;
  onOpenSettings: () => void;
  onToggleLanguage: () => void;
  onOpenInstallModal: () => void;
  isStandalone: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  language,
  city,
  phaseInfo,
  onOpenSettings,
  onToggleLanguage,
  onOpenInstallModal,
  isStandalone,
}) => {
  const isAr = language === 'ar';

  const navItems = [
    { id: 'home', titleAr: 'مواقيت الصلاة', titleEn: 'Prayer Times', icon: Clock },
    { id: 'wird', titleAr: 'وِردي اليومي', titleEn: 'Daily Wird', icon: BookMarked },
    { id: 'adhkar', titleAr: 'مكتبة الأذكار', titleEn: 'Adhkar Encyclopedia', icon: BookOpen },
    { id: 'adhanLibrary', titleAr: 'مكتبة الأذان', titleEn: 'Adhan Library', icon: Music },
    { id: 'notifications', titleAr: 'مركز التنبيهات', titleEn: 'Notification Center', icon: BellRing },
    { id: 'tasbih', titleAr: 'المسبحة الرقمية', titleEn: 'Digital Tasbih', icon: Disc },
    { id: 'qibla', titleAr: 'بوصلة القبلة', titleEn: 'Qibla Compass', icon: Compass },
    { id: 'rhythm', titleAr: 'إيقاع اليوم', titleEn: 'Daily Rhythm', icon: CalendarClock },
    { id: 'calendar', titleAr: 'التقويم الهجري', titleEn: 'Hijri Calendar', icon: Calendar },
    { id: 'companion', titleAr: 'رفيق سكينة', titleEn: 'AI Companion', icon: Bot },
    { id: 'aboutDeveloper', titleAr: 'عن المطور', titleEn: 'About Developer', icon: UserCheck },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-72 shrink-0 bg-[#091322] border-r border-white/5 p-5 min-h-screen sticky top-0 z-40">
      {/* Brand & Mini Next Prayer */}
      <div className="space-y-5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sakina-navy border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
            <span className="text-2xl">🌙</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#060d17]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-thmanyah">
                {isAr ? 'سَكينة' : 'SAKINA'}
              </h1>
              <span className="text-[10px] tracking-wider text-[#e6c387] font-semibold bg-[#e6c387]/10 px-2 py-0.5 rounded-full border border-[#e6c387]/20">
                {isAr ? 'الرفيق الذكي' : 'Companion'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {isAr ? 'يومك على إيقاع الصلاة' : 'Rhythm of Prayer'}
            </p>
          </div>
        </div>

        {/* Next Prayer Mini-Widget */}
        {phaseInfo && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#e6c387]" />
                {isAr ? 'القادمة:' : 'Next:'}
              </span>
              <span className="font-mono text-[#fae3b3] font-bold">
                {phaseInfo.nextPrayer.time}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white font-thmanyah">
                {isAr ? phaseInfo.nextPrayer.nameAr : phaseInfo.nextPrayer.nameEn}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {phaseInfo.countdownFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-right ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-thmanyah">{isAr ? item.titleAr : item.titleEn}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions (PWA install, Language, Settings) */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        {/* PWA Install Button if not standalone */}
        {!isStandalone && (
          <button
            onClick={onOpenInstallModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-[#e6c387]/20 hover:from-emerald-600/40 hover:to-[#e6c387]/30 border border-emerald-500/30 text-white font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#fae3b3]" />
            <span>{isAr ? 'تثبيت التطبيق على جهازك' : 'Install SAKINA App'}</span>
          </button>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenSettings}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all border border-white/5"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5 flex items-center gap-1 text-xs font-mono font-bold"
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#e6c387]" />
            <span className="uppercase">{language}</span>
          </button>
        </div>

        {/* Developer Attribution & Copyright */}
        <button
          onClick={() => onSelectTab('aboutDeveloper')}
          className="w-full text-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-all border border-white/5 space-y-0.5 group"
          title={isAr ? 'عن المطور وحقوق الملكية' : 'About Developer & Copyright'}
        >
          <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 font-thmanyah block transition-colors leading-tight">
            {isAr
              ? 'تم التصميم والتطوير بواسطة مهندس الذكاء الاصطناعي محمد علي شبل زهو'
              : 'Designed and developed by AI Engineer Mohamed Ali Shabl Zaho'}
          </span>
          <span className="text-[9px] text-[#e6c387]/70 font-mono block">
            © {new Date().getFullYear()} Mohamed Ali Shabl Zaho
          </span>
        </button>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          {city.name} • {isAr ? 'نسخة الإنتاج v2.0' : 'Production v2.0'}
        </div>
      </div>
    </aside>
  );
};
