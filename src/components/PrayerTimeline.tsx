import React from 'react';
import { Sun, CheckCircle2, Circle, AlertCircle, Sparkles } from 'lucide-react';
import { PrayerPhaseInfo } from '../utils/prayerEngine';
import { soundManager } from '../utils/audio';

interface PrayerTimelineProps {
  phaseInfo: PrayerPhaseInfo;
  completedPrayers: Record<string, boolean>;
  language: 'ar' | 'en';
  onToggleComplete: (prayerKey: string) => void;
}

export const PrayerTimeline: React.FC<PrayerTimelineProps> = ({
  phaseInfo,
  completedPrayers,
  language,
  onToggleComplete,
}) => {
  const isAr = language === 'ar';
  const { timeline, nextPrayer, currentPrayer } = phaseInfo;

  const handleToggle = (key: string, isPrayer: boolean) => {
    if (!isPrayer) return; // Sunrise cannot be marked as prayed
    soundManager.playTick();
    onToggleComplete(key);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-slate-100 font-thmanyah">
            {isAr ? 'مواقيت الصلوات الخمس اليوم' : 'Daily Prayer Times'}
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {isAr ? 'حساب فلكي حي' : 'Live Astronomical'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {isAr ? 'اضغط لتأكيد أداء الصلاة خاصاً' : 'Tap to toggle private completion'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {timeline.map((item) => {
          const isNext = nextPrayer.key === item.key;
          const isCurrent = currentPrayer.key === item.key;
          const isCompleted = completedPrayers[item.key] || false;

          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key, item.isPrayer)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                item.isPrayer ? 'cursor-pointer' : 'cursor-default opacity-85'
              } ${
                isNext
                  ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : isCurrent
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/5'
              }`}
            >
              {/* Prayer Name & Status Badge */}
              <div className="flex items-center gap-3">
                {/* Checkbox indicator */}
                {item.isPrayer ? (
                  <button
                    type="button"
                    aria-label={`Mark ${item.nameEn} complete`}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-700/40'
                        : 'border border-slate-700 text-slate-500 group-hover:border-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                    )}
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold font-thmanyah ${isNext ? 'text-white' : 'text-slate-200'}`}>
                      {isAr ? item.nameAr : item.nameEn}
                    </span>

                    {/* Status badges */}
                    {!item.isPrayer && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                        {isAr ? 'شروق الشمس (لا صلاة)' : 'Sunrise (No prayer)'}
                      </span>
                    )}

                    {isNext && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        {isAr ? 'الصلاة الآتية' : 'Next Prayer'}
                      </span>
                    )}

                    {isCurrent && !isNext && item.isPrayer && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                        {isAr ? 'الفترة الحالية' : 'Current Phase'}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {isCompleted
                      ? (isAr ? 'تمت الصلاة والحمد لله (سجل خاص)' : 'Recorded as completed (private)')
                      : item.isPrayer
                      ? (isAr ? 'انقر لتأكيد أدائها في سجلك الخاص' : 'Tap to log completion privately')
                      : (isAr ? 'نهاية وقت صلاة الفجر' : 'Concludes Fajr prayer window')}
                  </span>
                </div>
              </div>

              {/* Exact Time display */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-lg md:text-xl font-bold font-mono tracking-wide ${isNext ? 'text-[#fae3b3] gold-glow' : 'text-slate-100'}`}>
                  {item.time}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isAr ? 'التوقيت المحلي' : 'Local time'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
