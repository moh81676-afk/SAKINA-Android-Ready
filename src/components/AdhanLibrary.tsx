import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Download,
  Trash2,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Music,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ADHAN_RECORDINGS, AdhanRecording } from '../data/adhanLibraryData';
import { soundManager } from '../utils/audio';

interface AdhanLibraryProps {
  language: 'ar' | 'en';
  defaultAdhanId: string;
  onSetDefaultAdhan: (id: string) => void;
  prayerAdhans: Record<string, string>;
  onSetPrayerAdhan: (prayerKey: string, adhanId: string) => void;
}

export const AdhanLibrary: React.FC<AdhanLibraryProps> = ({
  language,
  defaultAdhanId,
  onSetDefaultAdhan,
  prayerAdhans,
  onSetPrayerAdhan,
}) => {
  const isAr = language === 'ar';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  // Downloaded items stored locally in localStorage (only valid IDs)
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sakina_downloaded_adhans_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((id: string) => ADHAN_RECORDINGS.some((r) => r.id === id));
      } catch {
        return ['makkah-mulla', 'cairo-rifat'];
      }
    }
    return ['makkah-mulla', 'cairo-rifat'];
  });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [assigningAdhan, setAssigningAdhan] = useState<AdhanRecording | null>(null);

  // Save downloads state
  useEffect(() => {
    localStorage.setItem('sakina_downloaded_adhans_v2', JSON.stringify(downloadedIds));
  }, [downloadedIds]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAdhan();
    };
  }, []);

  const categories = [
    { id: 'all', titleAr: 'جميع التسجيلات المحققة', titleEn: 'All Verified Recordings' },
    { id: 'makkah', titleAr: 'أذان مكة المكرمة', titleEn: 'Makkah Sanctuary' },
    { id: 'cairo', titleAr: 'أذان القاهرة', titleEn: 'Cairo Historic' },
  ];

  const filteredAdhans = ADHAN_RECORDINGS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.titleAr.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.muezzinAr.toLowerCase().includes(q) ||
      item.cityAr.toLowerCase().includes(q) ||
      item.countryAr.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handlePlayPreview = (recording: AdhanRecording) => {
    if (currentlyPlayingId === recording.id) {
      soundManager.stopAdhan();
      setCurrentlyPlayingId(null);
      setLoadingAudioId(null);
      setPlaybackProgress(0);
      setElapsedSeconds(0);
      setTotalSeconds(0);
      return;
    }

    if (unavailableIds.includes(recording.id)) return;

    setLoadingAudioId(recording.id);
    setCurrentlyPlayingId(null);
    setPlaybackProgress(0);
    setElapsedSeconds(0);
    setTotalSeconds(recording.durationSeconds);

    soundManager.playAdhan(
      recording.audioUrl,
      (pct, elapsed, total) => {
        setLoadingAudioId(null);
        setCurrentlyPlayingId(recording.id);
        setPlaybackProgress(pct);
        setElapsedSeconds(elapsed);
        if (total > 0) setTotalSeconds(total);
        if (pct >= 100) {
          setCurrentlyPlayingId(null);
          setPlaybackProgress(0);
          setElapsedSeconds(0);
        }
      },
      (err) => {
        console.warn(`Recording ${recording.id} failed to load or play:`, err);
        setLoadingAudioId(null);
        setCurrentlyPlayingId(null);
        setUnavailableIds((prev) => (prev.includes(recording.id) ? prev : [...prev, recording.id]));
      }
    );
  };

  const handleDownload = (recording: AdhanRecording) => {
    if (downloadingId || unavailableIds.includes(recording.id)) return;
    setDownloadingId(recording.id);
    setDownloadProgress(20);

    // Trigger browser file download for authentic audio file
    if (recording.audioUrl) {
      const link = document.createElement('a');
      link.href = recording.audioUrl;
      link.download = `SAKINA-${recording.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);
          setDownloadedIds((d) => (d.includes(recording.id) ? d : [...d, recording.id]));
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleDeleteDownload = (id: string) => {
    if (
      window.confirm(
        isAr
          ? 'هل تريد حذف هذا التسجيل من ذاكرة الجهاز المحلية لتوفير المساحة؟'
          : 'Delete this offline recording to free storage?'
      )
    ) {
      setDownloadedIds((prev) => prev.filter((d) => d !== id));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-4 md:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e6c387] mb-1">
              <Radio className="w-4 h-4" />
              <span className="text-xs font-bold">{isAr ? 'الأصوات النبيلة والتراثية' : 'Heritage & Sacred Calls'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-thmanyah">
              {isAr ? 'مكتبة الأذان الشريف' : 'Adhan Audio Library'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
              {isAr
                ? 'استمع واختر وحمّل أشهر تسجيلات الأذان بصوت نقي كامل محقق، مع إمكانية التعيين لكل صلاة والاستماع دون إنترنت.'
                : 'Browse, preview, download, and assign real authentic Adhan recordings for your daily prayers.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {downloadedIds.length}/{ADHAN_RECORDINGS.length}
            </span>
            <span className="text-[10px] text-slate-400 block">{isAr ? 'محفوظ أوفلاين' : 'Saved offline'}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'ابحث باسم الأذان، المدينة، أو المؤذن...' : 'Search by title, city, or muezzin...'}
          className={`w-full py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 ${
            isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === c.id
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-white/5'
            }`}
          >
            {isAr ? c.titleAr : c.titleEn}
          </button>
        ))}
      </div>

      {/* Adhan Cards Grid */}
      <div className="space-y-3">
        {filteredAdhans.map((recording) => {
          const isPlaying = currentlyPlayingId === recording.id;
          const isLoading = loadingAudioId === recording.id;
          const isUnavailable = unavailableIds.includes(recording.id);
          const isDefault = defaultAdhanId === recording.id;
          const isDownloaded = downloadedIds.includes(recording.id);
          const isDownloading = downloadingId === recording.id;

          return (
            <div
              key={recording.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 space-y-3 ${
                isUnavailable
                  ? 'bg-slate-950/60 border-rose-500/20 opacity-75'
                  : isPlaying
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-white/5'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white font-thmanyah">
                      {isAr ? recording.titleAr : recording.titleEn}
                    </h3>

                    {isUnavailable ? (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        {isAr ? 'غير متاح حاليًا' : 'Currently Unavailable'}
                      </span>
                    ) : recording.isUploadedMaster ? (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {isAr ? 'تسجيل أصلي محقق' : 'Verified Original Audio'}
                      </span>
                    ) : null}

                    {isDefault && (
                      <span className="text-[10px] font-bold bg-[#e6c387]/20 text-[#fae3b3] border border-[#e6c387]/30 px-2 py-0.5 rounded-full">
                        {isAr ? 'الأذان الافتراضي' : 'Default'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-[#fae3b3] font-medium">
                      {isAr ? recording.muezzinAr : recording.muezzinEn}
                    </span>
                    <span>•</span>
                    <span>{isAr ? recording.cityAr : recording.cityEn}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">
                      {isAr ? recording.maqamAr : recording.maqamEn}
                    </span>
                  </div>
                </div>

                {/* Duration and size badge */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    {recording.durationFormatted}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {recording.fileSizeFormatted}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-thmanyah">
                {isAr ? recording.descriptionAr : recording.descriptionEn}
              </p>

              {/* Audio progress bar when playing */}
              {isPlaying && (
                <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-thmanyah">
                      <Music className="w-3.5 h-3.5 animate-pulse" />
                      {isAr ? 'يتم الاستماع للأذان الآن...' : 'Playing recording now...'}
                    </span>
                    <span>
                      {formatTime(elapsedSeconds)} / {formatTime(totalSeconds || recording.durationSeconds)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#e6c387] transition-all duration-100"
                      style={{ width: `${playbackProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {/* Play / Stop Preview */}
                  <button
                    onClick={() => handlePlayPreview(recording)}
                    disabled={isUnavailable || isLoading}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isPlaying
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isAr ? 'جاري التحميل...' : 'Loading...'}</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'إيقاف الأذان' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'استماع للأذان' : 'Play Adhan'}</span>
                      </>
                    )}
                  </button>

                  {/* Set as Default */}
                  {!isDefault ? (
                    <button
                      onClick={() => onSetDefaultAdhan(recording.id)}
                      disabled={isUnavailable}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAr ? 'تعيين كأذان افتراضي' : 'Set as Default'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 px-2 py-1">
                      <Check className="w-3.5 h-3.5" />
                      {isAr ? 'معتمد لجميع الصلوات' : 'Active Default'}
                    </span>
                  )}

                  {/* Assign to specific prayers */}
                  <button
                    onClick={() => setAssigningAdhan(recording)}
                    disabled={isUnavailable}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تخصيص لصلوات محددة' : 'Assign to Prayers'}</span>
                  </button>
                </div>

                {/* Download / Storage controls */}
                <div className="flex items-center gap-2">
                  {isDownloading ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{downloadProgress}%</span>
                    </div>
                  ) : isDownloaded ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isAr ? 'محفوظ أوفلاين' : 'Offline Ready'}
                      </span>
                      <button
                        onClick={() => handleDeleteDownload(recording.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 transition-all"
                        title={isAr ? 'حذف من ذاكرة الجهاز' : 'Delete from storage'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(recording)}
                      disabled={isUnavailable}
                      className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'تحميل MP3' : 'Download'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAdhans.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#e6c387] mx-auto flex items-center justify-center border border-amber-500/20">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-thmanyah">
              {isAr
                ? 'لا توجد تسجيلات أذان متاحة حاليًا. يرجى المحاولة لاحقًا.'
                : 'No Adhan recordings are currently available. Please try again later.'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم عرض التسجيلات الصوتية الحقيقية والمحققة فقط التي تملك ملفات أصلية قابلة للاستماع والتحميل المباشر.'
                : 'Only genuine verified recordings with accessible audio playback and direct download are displayed.'}
            </p>
          </div>
        )}
      </div>

      {/* Assigning Modal */}
      {assigningAdhan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0b1728] border border-white/10 p-5 shadow-2xl space-y-4 text-right">
            <h4 className="text-sm font-bold text-white font-thmanyah">
              {isAr ? `تخصيص (${assigningAdhan.titleAr}):` : `Assign ${assigningAdhan.titleEn}:`}
            </h4>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'اختر الصلوات التي تريد أن يصدح فيها هذا الأذان تحديداً:'
                : 'Select the prayers you wish to associate with this Adhan:'}
            </p>

            <div className="space-y-2">
              {[
                { key: 'Fajr', nameAr: 'صلاة الفجر', nameEn: 'Fajr' },
                { key: 'Dhuhr', nameAr: 'صلاة الظهر', nameEn: 'Dhuhr' },
                { key: 'Asr', nameAr: 'صلاة العصر', nameEn: 'Asr' },
                { key: 'Maghrib', nameAr: 'صلاة المغرب', nameEn: 'Maghrib' },
                { key: 'Isha', nameAr: 'صلاة العشاء', nameEn: 'Isha' },
              ].map((p) => {
                const isAssigned = prayerAdhans[p.key] === assigningAdhan.id;
                return (
                  <button
                    key={p.key}
                    onClick={() => {
                      onSetPrayerAdhan(p.key, isAssigned ? defaultAdhanId : assigningAdhan.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isAssigned
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{isAr ? p.nameAr : p.nameEn}</span>
                    {isAssigned && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setAssigningAdhan(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
            >
              {isAr ? 'تم وحفظ' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

