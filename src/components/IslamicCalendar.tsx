import React, { useState } from 'react';
import { Calendar as CalendarIcon, Moon, Sun, Sparkles, ChevronLeft, ChevronRight, CheckCircle, ShieldCheck, Heart } from 'lucide-react';
import { ISLAMIC_OCCASIONS } from '../data/islamicCalendarData';
import { PrayerTimes } from '../types';

interface IslamicCalendarProps {
  language: 'ar' | 'en';
  hijriFormatted: string;
  hijriAdjustment: number;
  onSetHijriAdjustment: (adj: number) => void;
  ramadanMode: boolean;
  onToggleRamadanMode: () => void;
  prayerTimes: PrayerTimes | null;
}

export const IslamicCalendar: React.FC<IslamicCalendarProps> = ({
  language,
  hijriFormatted,
  hijriAdjustment,
  onSetHijriAdjustment,
  ramadanMode,
  onToggleRamadanMode,
  prayerTimes,
}) => {
  const isAr = language === 'ar';

  // Fasting tracker state (saved locally)
  const [isFastingToday, setIsFastingToday] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(`sakina_fasting_${today}`) === 'true';
  });

  // Quran Juz tracker state in Ramadan mode (1 to 30)
  const [completedJuz, setCompletedJuz] = useState<number[]>(() => {
    const saved = localStorage.getItem('sakina_quran_juz');
    return saved ? JSON.parse(saved) : [1];
  });

  const handleToggleFasting = () => {
    const today = new Date().toISOString().slice(0, 10);
    const next = !isFastingToday;
    setIsFastingToday(next);
    localStorage.setItem(`sakina_fasting_${today}`, next.toString());
  };

  const handleToggleJuz = (juzNum: number) => {
    let updated: number[];
    if (completedJuz.includes(juzNum)) {
      updated = completedJuz.filter((j) => j !== juzNum);
    } else {
      updated = [...completedJuz, juzNum];
    }
    setCompletedJuz(updated);
    localStorage.setItem('sakina_quran_juz', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Ramadan Mode Switch */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e6c387] mb-1">
              <Moon className="w-4 h-4" />
              <span className="text-xs font-bold">{isAr ? 'التقويم الهجري الشريف' : 'Hijri Calendar'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-thmanyah">
              {hijriFormatted || (isAr ? 'التقويم الهجري' : 'Hijri Dates')}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isAr ? 'متابعة المناسبات الإسلامية الكبرى، أيام البيض، وأوضاع الصيام' : 'Islamic occasions, White Days, and fasting log'}
            </p>
          </div>

          <button
            onClick={onToggleRamadanMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-md ${
              ramadanMode
                ? 'bg-[#e6c387] text-slate-950 border-[#e6c387] shadow-[#e6c387]/20 font-black'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isAr ? (ramadanMode ? 'وضع رمضان نشط' : 'تفعيل وضع رمضان') : (ramadanMode ? 'Ramadan Active' : 'Ramadan Mode')}</span>
          </button>
        </div>

        {/* Moon-sighting adjustments */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5 text-xs text-slate-400">
          <span>{isAr ? 'تعديل رؤية الهلال المحلية:' : 'Moon-sighting offset:'}</span>
          <div className="flex items-center gap-1">
            {[-2, -1, 0, 1, 2].map((adj) => (
              <button
                key={adj}
                onClick={() => onSetHijriAdjustment(adj)}
                className={`w-7 h-7 rounded-lg font-mono font-bold text-xs transition-all ${
                  hijriAdjustment === adj
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {adj > 0 ? `+${adj}` : adj}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ramadan Mode Special Dedicated Section */}
      {ramadanMode && (
        <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-base text-white font-thmanyah">
                {isAr ? 'لوحة شهر رمضان المبارك' : 'Ramadan Dedicated Dashboard'}
              </h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {isAr ? 'شهر الصيام والقرآن' : 'Month of Fasting'}
            </span>
          </div>

          {/* Timings: Imsak/Suhoor & Iftar */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'الإمساك / السحور' : 'Imsak / Suhoor'}
              </span>
              <span className="text-xl font-black font-mono text-[#fae3b3]">
                {prayerTimes?.Imsak || prayerTimes?.Fajr || '--:--'}
              </span>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'قبل أذان الفجر' : 'Before Fajr'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? 'موعد الإفطار (المغرب)' : 'Iftar (Maghrib)'}
              </span>
              <span className="text-xl font-black font-mono text-emerald-400">
                {prayerTimes?.Maghrib || '--:--'}
              </span>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'حان وقت الإفطار' : 'At Maghrib Adhan'}</span>
            </div>
          </div>

          {/* Daily Fasting Toggle */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white font-thmanyah">
                {isAr ? 'صيام هذا اليوم المبارك' : 'Fasting Today'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isAr ? '«ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»' : 'Private fasting commitment'}
              </p>
            </div>
            <button
              onClick={handleToggleFasting}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isFastingToday
                  ? 'bg-emerald-500 text-white shadow-emerald-950/50'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isFastingToday ? (isAr ? 'صائم اليوم ✓' : 'Fasting ✓') : (isAr ? 'تسجيل الصيام' : 'Log Fast')}</span>
            </button>
          </div>

          {/* Quran Juz 30 Tracker for Ramadan */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{isAr ? 'ختمة القرآن (الأجزاء المقروءة):' : 'Quran Khatmah Progress:'}</span>
              <span className="font-mono text-[#e6c387] font-bold">{completedJuz.length} / 30</span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                const isRead = completedJuz.includes(juz);
                return (
                  <button
                    key={juz}
                    onClick={() => handleToggleJuz(juz)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      isRead
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-black/30 hover:bg-black/50 text-slate-400 border-white/5'
                    }`}
                  >
                    {juz}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Major Islamic Occasions List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 px-1 font-thmanyah">
          {isAr ? 'المناسبات والأيام الإسلامية الفاضلة' : 'Key Islamic Occasions'}
        </h3>

        <div className="space-y-2.5">
          {ISLAMIC_OCCASIONS.map((occ) => (
            <div
              key={occ.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 hover:border-white/10 transition-all text-right"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e6c387] font-thmanyah">
                  {isAr ? occ.nameAr : occ.nameEn}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                  {isAr ? `شهر ${occ.hijriMonth}` : `Month ${occ.hijriMonth}`}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? occ.descriptionAr : occ.descriptionEn}
              </p>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isAr ? occ.recommendedActionAr : occ.recommendedActionEn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
