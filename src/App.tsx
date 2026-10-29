/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  WifiOff,
  RefreshCw,
  Sparkles,
  Download,
  Menu,
  X,
  Heart,
  UserCheck,
} from 'lucide-react';

import { UserSettings, CityConfig, PrayerTimes } from './types';
import { PRESET_CITIES } from './data/citiesData';
import { getPrayerTimes, calculatePrayerPhases, PrayerPhaseInfo } from './utils/prayerEngine';
import { usePWAInstall } from './utils/usePWAInstall';
import { scheduler } from './utils/schedulerEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PrayerRing } from './components/PrayerRing';
import { PrayerTimeline } from './components/PrayerTimeline';
import { DailyWird } from './components/DailyWird';
import { AdhkarLibrary } from './components/AdhkarLibrary';
import { AdhanLibrary } from './components/AdhanLibrary';
import { UnifiedNotificationCenter } from './components/UnifiedNotificationCenter';
import { DigitalTasbih } from './components/DigitalTasbih';
import { QiblaCompass } from './components/QiblaCompass';
import { DailyRhythm } from './components/DailyRhythm';
import { IslamicCalendar } from './components/IslamicCalendar';
import { AICompanion } from './components/AICompanion';
import { AboutDeveloper } from './components/AboutDeveloper';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PWAInstallModal } from './components/PWAInstallModal';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar',
  theme: 'midnight',
  city: PRESET_CITIES[0], // Cairo default
  calcMethod: 5, // Egyptian General Authority of Survey
  asrSchool: '0', // Standard (Shafi'i/Maliki/Hanbali)
  highLatitudeRule: '3', // Angle-based
  minuteOffsets: {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  },
  notifications: {
    enabled: true,
    fajr: 'adhan',
    dhuhr: 'chime',
    asr: 'chime',
    maghrib: 'adhan',
    isha: 'adhan',
    prePrayerAlert: true,
    prePrayerMinutes: 15, // 15-minute default
    salawatEnabled: true, // Salawat reminder enabled
    salawatIntervalHours: 2, // Every 2 hours default
    salawatMessageIndex: 0,
    salawatStartHour: 8,
    salawatEndHour: 22,
    adhkarRemindersEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '23:00',
    quietHoursEnd: '04:00',
  },
  defaultAdhanId: 'makkah-mulla',
  prayerAdhanMap: {
    Fajr: 'cairo-rifat',
    Dhuhr: 'makkah-mulla',
    Asr: 'makkah-mulla',
    Maghrib: 'cairo-rifat',
    Isha: 'makkah-mulla',
  },
  hijriAdjustment: 0,
  fontSize: 'md',
  ramadanMode: false,
  onboardingCompleted: false,
};

export default function App() {
  // Settings state with localStorage persistence
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('sakina_settings_v2');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'wird'
    | 'adhkar'
    | 'adhanLibrary'
    | 'notifications'
    | 'tasbih'
    | 'qibla'
    | 'rhythm'
    | 'calendar'
    | 'companion'
    | 'aboutDeveloper'
  >('home');

  // Time and date states
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriFormatted, setHijriFormatted] = useState<string>('');
  const [isStaleData, setIsStaleData] = useState<boolean>(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [loadingTimes, setLoadingTimes] = useState<boolean>(true);

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !settings.onboardingCompleted);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState<boolean>(false);

  // PWA install hook
  const { isInstallable, isIOS, isStandalone, install } = usePWAInstall();

  // Private completed prayers for today
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`sakina_prayers_${todayStr}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Bookmarked Adhkar IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sakina_bookmarked_adhkar');
    return saved ? JSON.parse(saved) : ['m-2', 'e-2', 'p-4', 'q-1'];
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('sakina_settings_v2', JSON.stringify(settings));
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings]);

  // Save completed prayers
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`sakina_prayers_${todayStr}`, JSON.stringify(completedPrayers));
  }, [completedPrayers]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('sakina_bookmarked_adhkar', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Load prayer times engine
  const loadPrayerTimes = useCallback(async () => {
    setLoadingTimes(true);
    try {
      const { result, fromCache } = await getPrayerTimes(
        settings.city,
        settings.calcMethod,
        settings.asrSchool,
        settings.highLatitudeRule,
        settings.minuteOffsets,
        settings.hijriAdjustment
      );

      setPrayerTimes(result.timings);
      setHijriFormatted(
        settings.language === 'ar' ? result.hijriDate.formattedAr : result.hijriDate.formattedEn
      );
      setIsStaleData(result.isStale || fromCache);
      setCacheTimestamp(result.cachedAt);
    } catch (err) {
      console.error('Failed to load prayer times:', err);
    } finally {
      setLoadingTimes(false);
    }
  }, [
    settings.city,
    settings.calcMethod,
    settings.asrSchool,
    settings.highLatitudeRule,
    settings.minuteOffsets,
    settings.hijriAdjustment,
    settings.language,
  ]);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  // Initialize and run the Smart Reminder Scheduler
  useEffect(() => {
    scheduler.start(
      () => settings,
      () => prayerTimes,
      () => settings.language
    );

    return () => {
      scheduler.stop();
    };
  }, [settings, prayerTimes]);

  // Recalculate phases live every second
  const phaseInfo: PrayerPhaseInfo | null = useMemo(() => {
    if (!prayerTimes) return null;
    return calculatePrayerPhases(prayerTimes, currentTime);
  }, [prayerTimes, currentTime]);

  const handleTogglePrayerComplete = (key: string) => {
    setCompletedPrayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const fontSizeClass = useMemo(() => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-xs md:text-sm';
      case 'lg':
        return 'text-base md:text-lg';
      default:
        return 'text-sm md:text-base';
    }
  }, [settings.fontSize]);

  const isAr = settings.language === 'ar';

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white font-thmanyah">
      {/* 1. Desktop & Laptop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={settings.language}
        city={settings.city}
        phaseInfo={phaseInfo}
        onOpenSettings={() => setShowSettingsModal(true)}
        onToggleLanguage={() =>
          setSettings((prev) => ({
            ...prev,
            language: prev.language === 'ar' ? 'en' : 'ar',
          }))
        }
        onOpenInstallModal={() => setShowInstallModal(true)}
        isStandalone={isStandalone}
      />

      {/* 2. Main Content Container (Responsive: Phone max-w-xl, Desktop full width) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto w-full lg:px-6">
        {/* Offline / Stale Data Banner */}
        {isOffline && (
          <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {isAr
                ? 'أنت غير متصل بالإنترنت حالياً. تعمل سكينة بنظام المواقيت والأذكار المحفوظة محلياً.'
                : 'You are offline. SAKINA is running using locally cached timings & adhkar.'}
            </span>
          </div>
        )}

        {isStaleData && !isOffline && (
          <div className="bg-slate-900/90 border-b border-white/5 text-slate-400 text-[11px] py-1.5 px-4 text-center flex items-center justify-center gap-2">
            <span>
              {isAr
                ? `بيانات المواقيت المخزنة: ${new Date(cacheTimestamp || '').toLocaleTimeString(isAr ? 'ar-EG' : 'en-US')}`
                : `Cached data time: ${new Date(cacheTimestamp || '').toLocaleTimeString()}`}
            </span>
            <button
              onClick={loadPrayerTimes}
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isAr ? 'تحديث الآن' : 'Refresh now'}</span>
            </button>
          </div>
        )}

        {/* Dynamic Atmosphere Header */}
        <Header
          city={settings.city}
          hijriFormatted={hijriFormatted}
          currentTime={currentTime}
          activePhase={phaseInfo?.nextPrayer.key || 'Fajr'}
          language={settings.language}
          ramadanMode={settings.ramadanMode}
          onOpenSettings={() => setShowSettingsModal(true)}
          onToggleLanguage={() =>
            setSettings((prev) => ({
              ...prev,
              language: prev.language === 'ar' ? 'en' : 'ar',
            }))
          }
        />

        {/* Main Content Area */}
        <main className="p-4 md:p-6 flex-1 space-y-6 pb-28 lg:pb-12">
          {/* TAB 1: THE LIVING PRAYER DASHBOARD */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Responsive Layout on Desktop: Prayer Ring beside Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6 items-start">
                {/* The SAKINA Signature Prayer Ring */}
                <PrayerRing
                  phaseInfo={phaseInfo}
                  language={settings.language}
                  onPlayAdhanPreview={() => {}}
                />

                {/* Five Daily Prayers Timeline with Sunrise separation & private checkmark */}
                {phaseInfo && (
                  <PrayerTimeline
                    phaseInfo={phaseInfo}
                    completedPrayers={completedPrayers}
                    language={settings.language}
                    onToggleComplete={handleTogglePrayerComplete}
                  />
                )}
              </div>

              {/* Quick Feature Grid Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab('wird')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 transition-all text-right group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{isAr ? 'وِردي اليومي' : 'Daily Wird'}</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'رحلة ذكر هادئة' : 'Mindful routine'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('adhanLibrary')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 transition-all text-right group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{isAr ? 'مكتبة الأذان' : 'Adhan Library'}</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'أصوات الحرمين ومصر' : 'Sacred calls'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-amber-500/30 transition-all text-right group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{isAr ? 'تنبيه 15 دقيقة' : '15-min Alert'}</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'قبل كل صلاة والصلاة على النبي' : 'Pre-prayer & Salawat'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('qibla')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-sky-500/30 transition-all text-right group active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{isAr ? 'بوصلة القبلة' : 'Qibla'}</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'حساب كروي ومستشعر' : 'Sensors & bearing'}</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY DAILY WIRD */}
          {activeTab === 'wird' && (
            <DailyWird
              language={settings.language}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              fontSizeClass={fontSizeClass}
            />
          )}

          {/* TAB 3: COMPLETE ADHKAR LIBRARY */}
          {activeTab === 'adhkar' && (
            <AdhkarLibrary
              language={settings.language}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              fontSizeClass={fontSizeClass}
              onSetFontSize={(sz) => setSettings((prev) => ({ ...prev, fontSize: sz }))}
            />
          )}

          {/* TAB 4: DOWNLOADABLE ADHAN AUDIO LIBRARY */}
          {activeTab === 'adhanLibrary' && (
            <AdhanLibrary
              language={settings.language}
              defaultAdhanId={settings.defaultAdhanId}
              onSetDefaultAdhan={(id) => setSettings((prev) => ({ ...prev, defaultAdhanId: id }))}
              prayerAdhans={settings.prayerAdhanMap}
              onSetPrayerAdhan={(pKey, id) =>
                setSettings((prev) => ({
                  ...prev,
                  prayerAdhanMap: { ...prev.prayerAdhanMap, [pKey]: id },
                }))
              }
            />
          )}

          {/* TAB 5: UNIFIED NOTIFICATION CENTER */}
          {activeTab === 'notifications' && (
            <UnifiedNotificationCenter
              settings={settings}
              onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
              prayerTimes={prayerTimes}
              language={settings.language}
              onOpenAdhanLibrary={() => setActiveTab('adhanLibrary')}
            />
          )}

          {/* TAB 6: ADVANCED DIGITAL TASBIH */}
          {activeTab === 'tasbih' && <DigitalTasbih language={settings.language} />}

          {/* TAB 7: INTERACTIVE QIBLA COMPASS */}
          {activeTab === 'qibla' && <QiblaCompass city={settings.city} language={settings.language} />}

          {/* TAB 8: PRAYER-AWARE DAILY RHYTHM */}
          {activeTab === 'rhythm' && <DailyRhythm language={settings.language} />}

          {/* TAB 9: ISLAMIC CALENDAR & RAMADAN MODE */}
          {activeTab === 'calendar' && (
            <IslamicCalendar
              language={settings.language}
              hijriFormatted={hijriFormatted}
              hijriAdjustment={settings.hijriAdjustment}
              onSetHijriAdjustment={(adj) => {
                setSettings((prev) => ({ ...prev, hijriAdjustment: adj }));
                loadPrayerTimes();
              }}
              ramadanMode={settings.ramadanMode}
              onToggleRamadanMode={() =>
                setSettings((prev) => ({ ...prev, ramadanMode: !prev.ramadanMode }))
              }
              prayerTimes={prayerTimes}
            />
          )}

          {/* TAB 10: RAFIQ SAKINA (AI SPIRITUAL COMPANION) */}
          {activeTab === 'companion' && <AICompanion language={settings.language} />}

          {/* TAB 11: ABOUT DEVELOPER & COPYRIGHT NOTICE */}
          {activeTab === 'aboutDeveloper' && (
            <AboutDeveloper
              language={settings.language}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* Persistent Page Footer Attribution & Copyright Notice */}
          <footer className="mt-12 pt-6 pb-20 lg:pb-8 border-t border-white/5 text-center space-y-2">
            <p className="text-[11px] font-mono text-slate-500">
              © {new Date().getFullYear()} Mohamed Ali Shabl Zaho • {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
            </p>
          </footer>
        </main>
      </div>

      {/* 3. Mobile Touch Bottom Navigation Bar (Hidden on Desktop) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b1728]/95 backdrop-blur-xl border-t border-white/10 py-1.5 px-2 z-40 flex items-center justify-between shadow-2xl pb-safe">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            activeTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'المواقيت' : 'Prayers'}</span>
        </button>

        <button
          onClick={() => setActiveTab('wird')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            activeTab === 'wird' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'الورد' : 'Wird'}</span>
        </button>

        <button
          onClick={() => setActiveTab('adhanLibrary')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            activeTab === 'adhanLibrary' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Music className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'الأذان' : 'Adhan'}</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            activeTab === 'notifications' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <BellRing className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'التنبيهات' : 'Alerts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tasbih')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            activeTab === 'tasbih' ? 'text-[#e6c387] font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Disc className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'السبحة' : 'Tasbih'}</span>
        </button>

        {/* Mobile "More" Drawer Trigger */}
        <button
          onClick={() => setShowMobileMoreMenu(true)}
          className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
            ['qibla', 'rhythm', 'calendar', 'companion', 'adhkar', 'aboutDeveloper'].includes(activeTab)
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">{isAr ? 'المزيد' : 'More'}</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer Modal */}
      {showMobileMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-[#0b1728] border-t border-white/10 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white font-thmanyah">
                {isAr ? 'أقسام وخدمات سكينة' : 'All SAKINA Sections'}
              </h3>
              <button
                onClick={() => setShowMobileMoreMenu(false)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              {[
                { id: 'adhkar', titleAr: 'مكتبة الأذكار الكاملة', titleEn: 'Adhkar Encyclopedia', icon: BookOpen },
                { id: 'qibla', titleAr: 'بوصلة القبلة المشرّفة', titleEn: 'Qibla Compass', icon: Compass },
                { id: 'rhythm', titleAr: 'إيقاع اليوم على الصلاة', titleEn: 'Daily Rhythm', icon: CalendarClock },
                { id: 'calendar', titleAr: 'التقويم الهجري ورمضان', titleEn: 'Hijri & Ramadan', icon: Calendar },
                { id: 'companion', titleAr: 'رفيق سكينة المعرفي', titleEn: 'AI Companion', icon: Bot },
                { id: 'aboutDeveloper', titleAr: 'عن المطور وحقوق الملكية', titleEn: 'About Developer', icon: UserCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setShowMobileMoreMenu(false);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2.5 ${
                      activeTab === item.id
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-900 border-white/5 text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isAr ? item.titleAr : item.titleEn}</span>
                  </button>
                );
              })}
            </div>

            {/* PWA Install Button on mobile */}
            {!isStandalone && (
              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  setShowInstallModal(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#e6c387]/30 border border-emerald-500/40 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#fae3b3]" />
                <span>{isAr ? 'تثبيت سكينة كتطبيق على الهاتف' : 'Install SAKINA App on Phone'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onRefreshTimes={loadPrayerTimes}
      />

      {/* Onboarding Modal for First Time Launch */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={(newVals) => {
          setSettings((prev) => ({ ...prev, ...newVals }));
          setShowOnboarding(false);
          loadPrayerTimes();
        }}
        currentSettings={settings}
      />

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        language={settings.language}
        isIOS={isIOS}
        isInstallable={isInstallable}
        onInstall={install}
      />
    </div>
  );
}
