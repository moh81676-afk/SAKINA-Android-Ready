import React, { useState, useMemo } from 'react';
import { Search, Bookmark, RotateCcw, Check, ShieldCheck, BookOpen, Sun, Moon, Home, Utensils, Plane, Sparkles, SlidersHorizontal } from 'lucide-react';
import { VERIFIED_ADHKAR } from '../data/adhkarData';
import { DhikrItem } from '../types';
import { soundManager } from '../utils/audio';

interface AdhkarLibraryProps {
  language: 'ar' | 'en';
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  fontSizeClass: string;
  onSetFontSize: (size: 'sm' | 'md' | 'lg') => void;
}

export const AdhkarLibrary: React.FC<AdhkarLibraryProps> = ({
  language,
  bookmarkedIds,
  onToggleBookmark,
  fontSizeClass,
  onSetFontSize,
}) => {
  const isAr = language === 'ar';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'quran' | 'hadith'>('all');

  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sakina_adhkar_counts');
    return saved ? JSON.parse(saved) : {};
  });

  const categories = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All', icon: Sparkles },
    { id: 'morning', nameAr: 'أذكار الصباح', nameEn: 'Morning', icon: Sun },
    { id: 'evening', nameAr: 'أذكار المساء', nameEn: 'Evening', icon: Moon },
    { id: 'post_prayer', nameAr: 'بعد الصلاة', nameEn: 'Post-Prayer', icon: ShieldCheck },
    { id: 'sleep', nameAr: 'أذكار النوم', nameEn: 'Sleep', icon: Moon },
    { id: 'wake_up', nameAr: 'الاستيقاظ', nameEn: 'Wake-up', icon: Sun },
    { id: 'home', nameAr: 'المنزل', nameEn: 'Home', icon: Home },
    { id: 'quranic', nameAr: 'أدعية قرآنية', nameEn: 'Quranic Duas', icon: BookOpen },
    { id: 'tasbih', nameAr: 'تسبيح واستغفار', nameEn: 'Tasbih', icon: Sparkles },
  ];

  const filteredItems = useMemo(() => {
    return VERIFIED_ADHKAR.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesType = filterType === 'all' || item.type === filterType;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.text.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.translationEn && item.translationEn.toLowerCase().includes(query)) ||
        item.benefit.toLowerCase().includes(query);

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [activeCategory, filterType, searchQuery]);

  const handleIncrement = (item: DhikrItem) => {
    const current = adhkarCounts[item.id] || 0;
    if (current < item.target) {
      const next = current + 1;
      const updated = { ...adhkarCounts, [item.id]: next };
      setAdhkarCounts(updated);
      localStorage.setItem('sakina_adhkar_counts', JSON.stringify(updated));

      soundManager.playTick();
      if (navigator.vibrate) navigator.vibrate(12);

      if (next === item.target) {
        soundManager.playCompletionChime();
        if (navigator.vibrate) navigator.vibrate([15, 30, 20]);
      }
    }
  };

  const handleReset = (id: string) => {
    const updated = { ...adhkarCounts, [id]: 0 };
    setAdhkarCounts(updated);
    localStorage.setItem('sakina_adhkar_counts', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      {/* Title & Font Size Adjuster */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white font-thmanyah">
            {isAr ? 'موسوعة الأذكار والأدعية' : 'Adhkar & Supplications'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr ? 'أدعية وأذكار محققة بأسانيدها ومصادرها المعتمدة' : 'Verified authentic remembrance with scholarly citations'}
          </p>
        </div>

        {/* Font size toggles */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onSetFontSize('sm')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              fontSizeClass.includes('text-sm') ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            A-
          </button>
          <button
            onClick={() => onSetFontSize('md')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              fontSizeClass.includes('text-base') ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            A
          </button>
          <button
            onClick={() => onSetFontSize('lg')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              fontSizeClass.includes('text-lg') ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'ابحث في الأذكار، الآيات، أو الفوائد...' : 'Search adhkar, verses, or references...'}
          className={`w-full py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all ${
            isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className={`text-slate-400 hover:text-white text-xs absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3.5' : 'right-3.5'}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills (horizontal scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/30'
                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? cat.nameAr : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Type Filter (Quran vs Hadith) */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">{isAr ? 'نوع النص:' : 'Source:'}</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            filterType === 'all' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isAr ? 'الكل' : 'All'}
        </button>
        <button
          onClick={() => setFilterType('hadith')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            filterType === 'hadith' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isAr ? 'أحاديث نبوية' : 'Prophetic Hadith'}
        </button>
        <button
          onClick={() => setFilterType('quran')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            filterType === 'quran' ? 'bg-[#e6c387]/20 text-[#fae3b3] border border-[#e6c387]/30 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isAr ? 'آيات قرآنية' : 'Quranic Verses'}
        </button>
      </div>

      {/* Adhkar Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 text-xs">
            {isAr ? 'لا توجد أذكار تطابق بحثك حالياً.' : 'No adhkar found matching your search.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const count = adhkarCounts[item.id] || 0;
            const isCompleted = count >= item.target;
            const isBookmarked = bookmarkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-white/5'
                }`}
              >
                {/* Header of item */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/40 text-[#e6c387] border border-white/10 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {item.source}
                    </span>

                    {item.type === 'quran' ? (
                      <span className="text-[10px] font-bold bg-[#e6c387]/15 text-[#fae3b3] px-2 py-0.5 rounded-md border border-[#e6c387]/30">
                        {isAr ? 'قرآن كريم' : 'Holy Quran'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {isAr ? 'حديث شريف' : 'Hadith'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleBookmark(item.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#e6c387] transition-all"
                      title={isAr ? 'حفظ الذكر' : 'Bookmark'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#e6c387] text-[#e6c387]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Text */}
                <p className={`text-slate-100 font-medium font-thmanyah leading-loose text-justify my-2 ${fontSizeClass}`}>
                  {item.text}
                </p>

                {/* English translation if applicable */}
                {!isAr && item.translationEn && (
                  <p className="text-xs text-slate-400 italic mt-2 pt-2 border-t border-white/5">
                    {item.translationEn}
                  </p>
                )}

                {/* Benefit */}
                <div className="text-[11px] text-slate-400 mt-2">
                  <span className="text-[#fae3b3] font-semibold">{isAr ? 'الفضل: ' : 'Virtue: '}</span>
                  {item.benefit}
                </div>

                {/* Counter & Action */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleIncrement(item)}
                    disabled={isCompleted}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold font-thmanyah text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98 shadow-emerald-950/40'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'اكتمل التكرار المطلوب' : 'Completed'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? 'تكرار الذكر' : 'Repeat'}</span>
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md">
                          {count + 1} / {item.target}
                        </span>
                      </>
                    )}
                  </button>

                  {count > 0 && (
                    <button
                      onClick={() => handleReset(item.id)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all text-xs"
                      title={isAr ? 'إعادة العداد' : 'Reset count'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
