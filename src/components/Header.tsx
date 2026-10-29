import React from 'react';
import { MapPin, Moon, Sun, Sparkles, Globe, Settings as SettingsIcon } from 'lucide-react';
import { CityConfig } from '../types';

interface HeaderProps {
  city: CityConfig;
  hijriFormatted: string;
  currentTime: Date;
  activePhase: string;
  language: 'ar' | 'en';
  ramadanMode: boolean;
  onOpenSettings: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  city,
  hijriFormatted,
  currentTime,
  activePhase,
  language,
  ramadanMode,
  onOpenSettings,
  onToggleLanguage,
}) => {
  const isAr = language === 'ar';

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (isAr) {
      if (hour >= 3 && hour < 11) return 'طابَ صباحُك بذِكر الله وطاعته';
      if (hour >= 11 && hour < 16) return 'يومٌ مبارك ومُسدَّد في طاعة الله';
      if (hour >= 16 && hour < 20) return 'مساؤك يفيضُ سكينةً وبركة';
      return 'ليلةٌ هادئة في كنفِ الله وذكره';
    } else {
      if (hour >= 3 && hour < 11) return 'May your morning be blessed with remembrance';
      if (hour >= 11 && hour < 16) return 'May your day be fruitful and serene';
      if (hour >= 16 && hour < 20) return 'May peace surround your evening';
      return 'Peaceful night under Allah’s grace';
    }
  };

  // Atmosphere background gradient based on prayer phase
  const getAtmosphereClass = () => {
    switch (activePhase) {
      case 'Fajr':
        return 'from-[#0d1627] via-[#111e38] to-transparent';
      case 'Sunrise':
        return 'from-[#19273f] via-[#1b2b46] to-transparent';
      case 'Dhuhr':
        return 'from-[#0e1d33] via-[#12243e] to-transparent';
      case 'Asr':
        return 'from-[#162136] via-[#1c273e] to-transparent';
      case 'Maghrib':
        return 'from-[#1b1e33] via-[#161a2f] to-transparent';
      default:
        return 'from-[#060e1c] via-[#091528] to-transparent';
    }
  };

  return (
    <header className={`p-4 md:p-5 border-b border-white/5 bg-gradient-to-b ${getAtmosphereClass()} backdrop-blur-xl sticky top-0 z-30 transition-colors duration-1000`}>
      <div className="flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sakina-navy border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
            <span className="text-xl">🌙</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060d17]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-thmanyah">
                {isAr ? 'سَكينة' : 'SAKINA'}
              </h1>
              <span className="text-[10px] tracking-wider text-[#e6c387] font-semibold bg-[#e6c387]/10 px-2 py-0.5 rounded-full border border-[#e6c387]/20">
                {isAr ? 'يومك على إيقاع الصلاة' : 'Rhythm of Prayer'}
              </span>
              {ramadanMode && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  {isAr ? 'رمضان المبارك' : 'Ramadan Mode'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{getGreeting()}</p>
          </div>
        </div>

        {/* Actions & City selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleLanguage}
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-[#e6c387]" />
            <span className="font-mono uppercase font-bold text-[10px]">{language}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all shadow-sm group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-200">{isAr ? city.name : city.nameEn}</span>
          </button>

          <button
            onClick={onOpenSettings}
            title={isAr ? 'الإعدادات والتخصيص' : 'Settings'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date bar */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs text-slate-400">
        <span className="text-[#e6c387] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#e6c387]" />
          {hijriFormatted || (isAr ? 'جاري حساب التاريخ الهجري...' : 'Calculating Hijri date...')}
        </span>
        <span className="font-medium text-slate-300">
          {currentTime.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
    </header>
  );
};
