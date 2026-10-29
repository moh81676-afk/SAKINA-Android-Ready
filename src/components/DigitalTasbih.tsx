import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, RotateCcw, Volume2, VolumeX, Vibrate, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DigitalTasbihProps {
  language: 'ar' | 'en';
}

const TASBIH_PHRASES = [
  {
    ar: 'سُبْحَانَ اللَّهِ',
    en: 'Subhan Allah',
    meaningAr: 'تنزيه الله وتقديسه عن كل نقص وعيب',
    meaningEn: 'Glory be to Allah above all imperfections',
    defaultTarget: 33,
  },
  {
    ar: 'الْحَمْدُ لِلَّهِ',
    en: 'Al-Hamdulillah',
    meaningAr: 'الثناء المطلق على الله بجميل صفاته ونعمه',
    meaningEn: 'All praise and gratitude belong to Allah',
    defaultTarget: 33,
  },
  {
    ar: 'اللَّهُ أَكْبَرُ',
    en: 'Allahu Akbar',
    meaningAr: 'الله أعظم من كل شيء كبرياءً وجلالاً',
    meaningEn: 'Allah is the Greatest',
    defaultTarget: 33,
  },
  {
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ',
    en: 'La Ilaha Illa Allah',
    meaningAr: 'كلمة الإخلاص والتوحيد وأثقل ما في الميزان',
    meaningEn: 'None has the right to be worshipped except Allah',
    defaultTarget: 100,
  },
  {
    ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    en: 'Astaghfirullah wa Atubu Ilayh',
    meaningAr: 'سيد الاستدراك وطلب المغفرة وفتح أبواب الرزق',
    meaningEn: 'I seek forgiveness from Allah and repent unto Him',
    defaultTarget: 100,
  },
  {
    ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    en: 'Allahumma Salli wa Sallim ‘ala Muhammad',
    meaningAr: 'الصلاة الإبراهيمية على سيد الخلق وباب الشفاعة',
    meaningEn: 'O Allah, bestow peace and blessings upon Prophet Muhammad',
    defaultTarget: 10,
  },
  {
    ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    en: 'La Hawla wa La Quwwata Illa Billah',
    meaningAr: 'كنز من كنوز الجنة وتفويض الأمر لله بالكلية',
    meaningEn: 'There is no power nor might except with Allah',
    defaultTarget: 33,
  },
];

export const DigitalTasbih: React.FC<DigitalTasbihProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(0);
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(() => {
    return parseInt(localStorage.getItem('sakina_tasbih_val') || '0', 10);
  });
  const [sessionTotal, setSessionTotal] = useState(() => {
    return parseInt(localStorage.getItem('sakina_tasbih_total') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('sakina_tasbih_val', count.toString());
    localStorage.setItem('sakina_tasbih_total', sessionTotal.toString());
  }, [count, sessionTotal]);

  const currentPhrase = TASBIH_PHRASES[selectedPhraseIndex];

  const handleTap = () => {
    const nextCount = count + 1;
    const nextTotal = sessionTotal + 1;
    setCount(nextCount);
    setSessionTotal(nextTotal);

    if (soundEnabled) soundManager.playTick();
    if (hapticEnabled && navigator.vibrate) navigator.vibrate(15);

    if (nextCount >= target) {
      if (soundEnabled) soundManager.playCompletionChime();
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([30, 80, 40]);
      setCount(0); // auto reset round or prompt
    }
  };

  const handleManualDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count > 0) {
      setCount(count - 1);
      setSessionTotal(Math.max(0, sessionTotal - 1));
    }
  };

  const handleConfirmReset = () => {
    setCount(0);
    setShowResetConfirm(false);
  };

  return (
    <div className={`space-y-5 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#060d17] p-6 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Top Header & Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white font-thmanyah">
            {isAr ? 'المسبحة الرقمية المتقدمة' : 'Digital Tasbih'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr ? '«أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ»' : 'Serene tactile remembrance with target milestones'}
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs transition-all ${
              soundEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2 rounded-lg text-xs transition-all ${
              hapticEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={hapticEnabled ? 'تعطيل الاهتزاز' : 'تفعيل الاهتزاز'}
          >
            <Vibrate className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg text-xs text-slate-300 hover:text-white bg-white/5 transition-all"
            title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Phrase Selector */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
        <label className="text-[11px] font-bold text-slate-400 block">
          {isAr ? 'الصيغة المأثورة الحالية:' : 'Selected Remembrance:'}
        </label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TASBIH_PHRASES.map((ph, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPhraseIndex(idx);
                setTarget(ph.defaultTarget);
                setCount(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedPhraseIndex === idx
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              {isAr ? ph.ar : ph.en}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#fae3b3] italic pt-1">
          {isAr ? currentPhrase.meaningAr : currentPhrase.meaningEn}
        </p>
      </div>

      {/* Target Presets */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-slate-400">{isAr ? 'الهدف:' : 'Goal:'}</span>
        {[33, 99, 100, 1000].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTarget(t);
              setCount(0);
            }}
            className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
              target === t
                ? 'bg-[#e6c387] text-slate-950 border-[#e6c387] shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Giant Tactile Tap Circle Area */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          onClick={handleTap}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-full bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 border-4 border-emerald-500/40 hover:border-emerald-500 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all duration-150 group select-none relative overflow-hidden"
        >
          {/* Subtle water ripple background glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

          <span className="text-xs text-slate-400 mb-1 z-10 font-medium">
            {isAr ? 'المس في أي مكان' : 'Tap anywhere'}
          </span>

          <span className="text-6xl md:text-7xl font-black font-mono text-white tracking-wider group-active:text-[#fae3b3] transition-colors z-10">
            {count}
          </span>

          <span className="text-xs font-semibold text-[#e6c387] mt-2 z-10 bg-black/40 px-3 py-1 rounded-full border border-white/5">
            {isAr ? `الهدف: ${target}` : `Target: ${target}`}
          </span>

          {/* Progress fill at bottom */}
          <div className="absolute bottom-5 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#e6c387] transition-all duration-150"
              style={{ width: `${Math.min(100, (count / target) * 100)}%` }}
            ></div>
          </div>
        </button>

        {/* Manual correction button */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleManualDecrement}
            disabled={count === 0}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-40"
          >
            {isAr ? 'تصحيح العداد (-1)' : 'Undo (-1)'}
          </button>
        </div>
      </div>

      {/* Stats bar & Reset */}
      <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-900/90 border border-white/5 text-xs">
        <div className="text-center">
          <span className="text-slate-400 block text-[10px]">{isAr ? 'إجمالي تسبيح اليوم' : 'Today’s Total'}</span>
          <span className="text-lg font-black font-mono text-slate-100">{sessionTotal}</span>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="text-center">
          <span className="text-slate-400 block text-[10px]">{isAr ? 'الدورة الحالية' : 'Current Round'}</span>
          <span className="text-lg font-black font-mono text-emerald-400">{count}/{target}</span>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <button
          onClick={() => {
            if (count > 0) {
              setShowResetConfirm(true);
            }
          }}
          className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-950/20 transition-all font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تصفير' : 'Reset'}</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-thmanyah">
                {isAr ? 'تأكيد تصفير الدورة الحالية' : 'Confirm Reset'}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? `لقد وصلت إلى (${count}) تسبيحة في الدورة الحالية. هل تود بالتأكيد تصفير العداد والبدء من جديد؟`
                : `You have reached ${count} recitations in the current round. Are you sure you want to reset?`}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                {isAr ? 'نعم، تصفير' : 'Yes, Reset'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
