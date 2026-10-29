import React, { useState } from 'react';
import { Sparkles, Sun, Moon, CheckCircle, RotateCcw, Bookmark, ChevronLeft, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { VERIFIED_ADHKAR } from '../data/adhkarData';
import { DhikrItem } from '../types';
import { soundManager } from '../utils/audio';

interface DailyWirdProps {
  language: 'ar' | 'en';
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  fontSizeClass: string;
}

export const DailyWird: React.FC<DailyWirdProps> = ({
  language,
  bookmarkedIds,
  onToggleBookmark,
  fontSizeClass,
}) => {
  const isAr = language === 'ar';
  const [selectedRoutine, setSelectedRoutine] = useState<'morning' | 'evening' | 'post_prayer' | 'favorites'>('morning');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local state for counts in current session
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sakina_wird_session');
    return saved ? JSON.parse(saved) : {};
  });

  // Filter items based on routine
  const routineItems: DhikrItem[] = React.useMemo(() => {
    if (selectedRoutine === 'favorites') {
      return VERIFIED_ADHKAR.filter((item) => bookmarkedIds.includes(item.id));
    }
    return VERIFIED_ADHKAR.filter((item) => item.category === selectedRoutine);
  }, [selectedRoutine, bookmarkedIds]);

  const currentItem = routineItems[currentIndex] || routineItems[0];
  const currentCount = currentItem ? sessionCounts[currentItem.id] || 0 : 0;
  const isCurrentDone = currentItem ? currentCount >= currentItem.target : false;

  // Calculate overall routine progress
  const completedCount = routineItems.filter(
    (item) => (sessionCounts[item.id] || 0) >= item.target
  ).length;
  const progressPercent = routineItems.length > 0 ? (completedCount / routineItems.length) * 100 : 0;

  const handleIncrement = () => {
    if (!currentItem) return;
    if (currentCount < currentItem.target) {
      const next = currentCount + 1;
      const updated = { ...sessionCounts, [currentItem.id]: next };
      setSessionCounts(updated);
      localStorage.setItem('sakina_wird_session', JSON.stringify(updated));

      soundManager.playTick();
      if (navigator.vibrate) navigator.vibrate(14);

      if (next === currentItem.target) {
        soundManager.playCompletionChime();
        if (navigator.vibrate) navigator.vibrate([20, 40, 30]);

        // If not last, gently advance after brief pause
        if (currentIndex < routineItems.length - 1) {
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
          }, 450);
        }
      }
    }
  };

  const handleResetCurrent = () => {
    if (!currentItem) return;
    const updated = { ...sessionCounts, [currentItem.id]: 0 };
    setSessionCounts(updated);
    localStorage.setItem('sakina_wird_session', JSON.stringify(updated));
  };

  const handleResetAll = () => {
    if (window.confirm(isAr ? 'هل تود إعادة ضبط عدادات الورد الحالي؟' : 'Reset progress for this session?')) {
      const updated = { ...sessionCounts };
      routineItems.forEach((it) => (updated[it.id] = 0));
      setSessionCounts(updated);
      localStorage.setItem('sakina_wird_session', JSON.stringify(updated));
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e6c387] mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">{isAr ? 'الميزة التوقيعية' : 'Signature Feature'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-thmanyah">
              {isAr ? 'وِردي اليومي' : 'My Daily Wird'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
              {isAr
                ? 'رحلة ذكر هادئة بدون مشقة ولا سباقات تنافسية. عبادة تُقربك إلى الله بالسكينة واليقين.'
                : 'A mindful, serene remembrance journey without pressure or streaks.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black font-mono text-[#fae3b3]">{completedCount}/{routineItems.length}</span>
            <span className="text-[10px] text-slate-400 block">{isAr ? 'أذكار مكتملة' : 'completed'}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mt-4 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#e6c387] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Routine selector tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900/70 border border-white/5">
        <button
          onClick={() => { setSelectedRoutine('morning'); setCurrentIndex(0); }}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedRoutine === 'morning'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>{isAr ? 'الصباح' : 'Morning'}</span>
        </button>

        <button
          onClick={() => { setSelectedRoutine('evening'); setCurrentIndex(0); }}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedRoutine === 'evening'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>{isAr ? 'المساء' : 'Evening'}</span>
        </button>

        <button
          onClick={() => { setSelectedRoutine('post_prayer'); setCurrentIndex(0); }}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedRoutine === 'post_prayer'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{isAr ? 'دبر الصلاة' : 'Post-Prayer'}</span>
        </button>

        <button
          onClick={() => { setSelectedRoutine('favorites'); setCurrentIndex(0); }}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedRoutine === 'favorites'
              ? 'bg-[#e6c387] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{isAr ? 'المفضلة' : 'Saved'}</span>
        </button>
      </div>

      {/* Routine Cards / Card-by-Card Experience */}
      {routineItems.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/50 border border-white/5 space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-300">
            {isAr ? 'لا توجد أذكار في هذه القائمة' : 'No adhkar in this list'}
          </h4>
          <p className="text-xs text-slate-400">
            {isAr ? 'يمكنك إضافة أي ذكر إلى المفضلة من مكتبة الأذكار.' : 'You can bookmark items from the Adhkar Library.'}
          </p>
        </div>
      ) : (
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
          {/* Card header with index & bookmark */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              {currentIndex + 1} / {routineItems.length}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#e6c387] bg-[#e6c387]/10 px-2.5 py-1 rounded-full border border-[#e6c387]/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {isAr ? currentItem.source : currentItem.sourceEn || currentItem.source}
              </span>

              <button
                onClick={() => onToggleBookmark(currentItem.id)}
                title={isAr ? 'حفظ في المفضلة' : 'Bookmark'}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#e6c387] transition-all"
              >
                <Bookmark
                  className={`w-4 h-4 ${bookmarkedIds.includes(currentItem.id) ? 'fill-[#e6c387] text-[#e6c387]' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Main Arabic text */}
          <div className="py-2">
            <p className={`text-slate-100 font-thmanyah font-medium leading-loose text-justify ${fontSizeClass}`}>
              {currentItem.text}
            </p>

            {/* Translation if English is active */}
            {!isAr && currentItem.translationEn && (
              <p className="text-xs text-slate-400 italic mt-3 pt-3 border-t border-white/5 leading-relaxed">
                {currentItem.translationEn}
              </p>
            )}
          </div>

          {/* Benefit / Reference note */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-[#fae3b3] block mb-0.5">
              {isAr ? 'الفضل والمناسبة:' : 'Virtue & Occasion:'}
            </span>
            {isAr ? currentItem.benefit : currentItem.benefitEn || currentItem.benefit}
          </div>

          {/* Big Tactile Tap Button to Count */}
          <div className="pt-2 flex flex-col items-center">
            <button
              onClick={handleIncrement}
              disabled={isCurrentDone}
              className={`w-full py-5 px-6 rounded-2xl font-bold font-thmanyah text-base transition-all duration-200 flex items-center justify-between shadow-xl active:scale-98 ${
                isCurrentDone
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/50'
              }`}
            >
              <span className="flex items-center gap-2">
                {isCurrentDone ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>{isAr ? 'تم الذكر بحمد الله' : 'Completed Alhamdulillah'}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    <span>{isAr ? 'اضغط للذكر' : 'Tap to recite'}</span>
                  </>
                )}
              </span>

              {/* Progress counter pill */}
              <div className="flex items-center gap-2 bg-black/30 px-3.5 py-1.5 rounded-xl border border-white/10 font-mono font-bold text-lg">
                <span>{currentCount}</span>
                <span className="text-slate-400 text-sm">/ {currentItem.target}</span>
              </div>
            </button>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title={isAr ? 'الذكر السابق' : 'Previous'}
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(routineItems.length - 1, prev + 1))}
                disabled={currentIndex === routineItems.length - 1}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title={isAr ? 'الذكر التالي' : 'Next'}
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentCount > 0 && (
                <button
                  onClick={handleResetCurrent}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصفير الحالي' : 'Reset'}</span>
                </button>
              )}

              <button
                onClick={handleResetAll}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 text-xs"
              >
                {isAr ? 'إعادة ضبط الجلسة' : 'Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
