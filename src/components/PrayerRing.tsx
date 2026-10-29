import React from 'react';
import { Sparkles, Clock, Volume2, ShieldCheck } from 'lucide-react';
import { PrayerPhaseInfo } from '../utils/prayerEngine';
import { soundManager } from '../utils/audio';

interface PrayerRingProps {
  phaseInfo: PrayerPhaseInfo | null;
  language: 'ar' | 'en';
  onPlayAdhanPreview?: () => void;
}

export const PrayerRing: React.FC<PrayerRingProps> = ({
  phaseInfo,
  language,
  onPlayAdhanPreview,
}) => {
  const isAr = language === 'ar';

  if (!phaseInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/60 border border-white/5 animate-pulse min-h-[300px]">
        <div className="w-48 h-48 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
        <p className="text-xs text-slate-400 mt-4">{isAr ? 'جاري حساب مواقيت الصلاة بدقة...' : 'Calculating accurate prayer times...'}</p>
      </div>
    );
  }

  const { currentPrayer, nextPrayer, progress, countdownFormatted } = phaseInfo;

  // Circumference for r=42 is 2 * PI * 42 = 263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, progress))) / 100;

  // Determine dynamic ring gradient & glow based on next prayer phase
  const getPhaseStyles = (key: string) => {
    switch (key) {
      case 'Fajr':
        return {
          stroke: 'url(#fajrGrad)',
          glow: 'drop-shadow(0 0 16px rgba(147, 51, 234, 0.35))',
          bg: 'from-purple-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'سحر الليل وتهيئة الفجر' : 'Pre-dawn tranquility',
        };
      case 'Sunrise':
        return {
          stroke: 'url(#sunriseGrad)',
          glow: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.4))',
          bg: 'from-amber-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'طلوع الفجر وإقبال الإشراق' : 'Dawn breaking',
        };
      case 'Dhuhr':
        return {
          stroke: 'url(#dayGrad)',
          glow: 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))',
          bg: 'from-emerald-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'ضحوة النهار وبركة السعي' : 'Midday light',
        };
      case 'Asr':
        return {
          stroke: 'url(#asrGrad)',
          glow: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.4))',
          bg: 'from-yellow-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'الصلاة الوسطى والصفاء' : 'Golden afternoon',
        };
      case 'Maghrib':
        return {
          stroke: 'url(#maghribGrad)',
          glow: 'drop-shadow(0 0 18px rgba(249, 115, 22, 0.45))',
          bg: 'from-orange-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'غروب الشمس وإجابة الدعاء' : 'Dusk & sunset',
        };
      default: // Isha
        return {
          stroke: 'url(#nightGrad)',
          glow: 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.35))',
          bg: 'from-blue-950/20 via-slate-900/40 to-slate-950',
          badgeText: isAr ? 'سكون الليل وطمأنينة الروح' : 'Serene nightfall',
        };
    }
  };

  const currentStyles = getPhaseStyles(nextPrayer.key);

  const handleTestAdhan = () => {
    soundManager.playAdhanChime();
    if (onPlayAdhanPreview) onPlayAdhanPreview();
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b ${currentStyles.bg} border border-white/10 shadow-2xl overflow-hidden transition-all duration-700`}>
      {/* Dynamic ambient radial backdrop */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Top phase indicator */}
      <div className="flex items-center justify-between w-full mb-3 px-2 z-10">
        <span className="text-[11px] font-semibold text-[#e6c387] bg-[#e6c387]/10 px-3 py-1 rounded-full border border-[#e6c387]/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {currentStyles.badgeText}
        </span>

        <button
          onClick={handleTestAdhan}
          title={isAr ? 'الاستماع لنغمة أذان سكينة' : 'Preview SAKINA Adhan Chime'}
          className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-medium">{isAr ? 'تجربة الأذان' : 'Test Tone'}</span>
        </button>
      </div>

      {/* The Animated Circular Ring */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="fajrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="sunriseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="dayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="asrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="maghribGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="nightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-800/80 stroke-current"
            strokeWidth="4"
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={currentStyles.stroke}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: currentStyles.glow,
              transition: 'stroke-dashoffset 1s ease-linear, stroke 0.8s ease',
            }}
          />
        </svg>

        {/* Center countdown and prayer info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10 pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400 mb-0.5 tracking-wider">
            {isAr ? 'الصلاة القادمة' : 'Next Prayer'}
          </span>

          <h2 className="text-3xl md:text-4xl font-black text-white font-thmanyah tracking-tight">
            {isAr ? nextPrayer.nameAr : nextPrayer.nameEn}
          </h2>

          <div className="text-[#e6c387] font-mono text-2xl md:text-3xl font-extrabold tracking-widest my-1 gold-glow">
            {countdownFormatted}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/10 shadow-inner mt-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{isAr ? 'الموعد:' : 'At:'}</span>
            <span className="font-mono font-bold text-[#fae3b3]">{nextPrayer.time}</span>
          </div>

          <span className="text-[10px] text-slate-400 mt-2 font-mono">
            {Math.round(progress)}% {isAr ? 'انقضى من الفترة' : 'phase elapsed'}
          </span>
        </div>
      </div>

      {/* Daily Spiritual Intention / Hadith reminder */}
      <div className="w-full mt-3 p-3.5 rounded-2xl bg-[#060d17]/80 border border-white/10 text-center shadow-inner relative z-10">
        <p className="text-xs md:text-sm text-[#fae3b3] font-medium leading-relaxed font-thmanyah">
          {isAr
            ? '«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»'
            : '"The most beloved of deeds to Allah are those that are most consistent, even if small."'}
        </p>
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{isAr ? 'صحيح البخاري ومسلم' : 'Sahih al-Bukhari & Muslim'}</span>
        </div>
      </div>
    </div>
  );
};
