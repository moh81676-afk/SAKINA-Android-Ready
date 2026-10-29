import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  Volume2,
  Heart,
  Moon,
  Sun,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Sliders,
  Play,
  Square,
  RotateCcw,
} from 'lucide-react';
import { UserSettings, PrayerTimes } from '../types';
import { soundManager } from '../utils/audio';
import { ADHAN_RECORDINGS } from '../data/adhanLibraryData';

interface UnifiedNotificationCenterProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  prayerTimes: PrayerTimes | null;
  language: 'ar' | 'en';
  onOpenAdhanLibrary: () => void;
}

export const SALAWAT_MESSAGES = [
  {
    ar: '«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ»',
    en: '“O Allah, send peace and blessings upon our Prophet Muhammad.”',
    source: 'الصيغة النبوية الموجزة المستحبة',
  },
  {
    ar: '«الصَّلَاةُ وَالسَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ»',
    en: '“Peace and blessings be upon you, O Messenger of Allah.”',
    source: 'صيغة التحية والسلام النبوي',
  },
  {
    ar: '«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ»',
    en: '“O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim.”',
    source: 'الصلاة الإبراهيمية المباركة (متفق عليه)',
  },
];

export const UnifiedNotificationCenter: React.FC<UnifiedNotificationCenterProps> = ({
  settings,
  onUpdateSettings,
  prayerTimes,
  language,
  onOpenAdhanLibrary,
}) => {
  const isAr = language === 'ar';
  const notifs = settings.notifications;
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });

  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTestingAdhan, setIsTestingAdhan] = useState<boolean>(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAdhan();
    };
  }, []);

  const selectedDefaultAdhan = ADHAN_RECORDINGS.find((a) => a.id === settings.defaultAdhanId) || ADHAN_RECORDINGS[0];

  // Request browser permissions
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      setTestStatus(isAr ? 'المتصفح الحالي لا يدعم واجهة الإشعارات' : 'Notifications not supported in this browser');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        onUpdateSettings({
          notifications: { ...notifs, enabled: true },
        });
        setTestStatus(isAr ? 'تم منح الإذن بنجاح! الإشعارات مفعلة.' : 'Permission granted! Notifications enabled.');
      } else {
        setTestStatus(isAr ? 'تم رفض إذن الإشعارات من المتصفح.' : 'Notification permission was denied.');
      }
    } catch (e: any) {
      setTestStatus(e.message || 'Error requesting permission');
    }
  };

  // Dispatch real test notifications
  const triggerTestNotification = (
    type: 'prePrayer' | 'atTime' | 'salawat'
  ) => {
    if (type === 'prePrayer') {
      soundManager.playPrePrayerReminderChime();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(isAr ? 'اقترب موعد صلاة العصر 🌿' : 'Asr Prayer is approaching 🌿', {
          body: isAr
            ? `متبقي ${notifs.prePrayerMinutes} دقيقة على الصلاة. موعد الأذان: ${prayerTimes?.Asr || '15:15'}.`
            : `${notifs.prePrayerMinutes} minutes remaining until Asr prayer.`,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      }
      setTestStatus(isAr ? 'تم إرسال إشعار تجريبي: تنبيه ما قبل الصلاة (15 دقيقة) مع النغمة الهادئة' : 'Pre-prayer reminder test triggered');
    } else if (type === 'atTime') {
      if (isTestingAdhan) {
        soundManager.stopAdhan();
        setIsTestingAdhan(false);
        setTestStatus(isAr ? 'تم إيقاف تشغيل الأذان' : 'Adhan playback stopped');
        return;
      }

      setIsTestingAdhan(true);
      soundManager.playAdhan(
        selectedDefaultAdhan.audioUrl,
        (pct) => {
          if (pct >= 100) {
            setIsTestingAdhan(false);
          }
        },
        (err) => {
          setIsTestingAdhan(false);
          setTestStatus(isAr ? 'تعذر تشغيل التسجيل الصوتي للأذان حالياً' : 'Unable to play Adhan recording');
        }
      );

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(isAr ? 'حان الآن موعد صلاة المغرب 🕌' : 'It is now time for Maghrib prayer 🕌', {
          body: isAr
            ? `الله أكبر الله أكبر.. حان وقت الأذان في ${settings.city.name} (${selectedDefaultAdhan.titleAr}).`
            : `Allahu Akbar! Prayer time in ${settings.city.nameEn} (${selectedDefaultAdhan.titleEn}).`,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      }
      setTestStatus(
        isAr
          ? `جارٍ تشغيل: ${selectedDefaultAdhan.titleAr} (${selectedDefaultAdhan.isUploadedMaster ? 'صوت MP3 أصلي مرفوع' : 'نغمة محاكاة'})`
          : `Playing: ${selectedDefaultAdhan.titleEn}`
      );
    } else if (type === 'salawat') {
      soundManager.playSalawatChime();
      const currentSalawat = SALAWAT_MESSAGES[notifs.salawatMessageIndex || 0];
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(isAr ? 'صلِّ على النبي ﷺ' : 'Blessings upon Prophet Muhammad ﷺ', {
          body: isAr ? currentSalawat.ar : currentSalawat.en,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      }
      setTestStatus(isAr ? 'تم إرسال إشعار تجريبي: تذكير الصلاة على النبي ﷺ' : 'Salawat reminder test triggered');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 md:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#e6c387] mb-1">
              <BellRing className="w-4 h-4" />
              <span className="text-xs font-bold">{isAr ? 'المركز الموحد للسكينة' : 'Unified Notification Center'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-thmanyah">
              {isAr ? 'مركز التنبيهات والأذان' : 'Notification & Adhan Center'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
              {isAr
                ? 'إدارة متكاملة للتذكير قبل الصلاة بـ 15 دقيقة، أصوات الأذان، والصلاة على النبي ﷺ كل ساعتين.'
                : 'Manage pre-prayer reminders, authentic Adhan recordings, and Salawat alerts in one place.'}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 px-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-xs font-bold text-slate-200">
              {notifs.enabled ? (isAr ? 'مفعلة' : 'Active') : (isAr ? 'معطلة' : 'Muted')}
            </span>
            <input
              type="checkbox"
              checked={notifs.enabled}
              onChange={(e) =>
                onUpdateSettings({
                  notifications: { ...notifs, enabled: e.target.checked },
                })
              }
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Permission status bar */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{isAr ? 'حالة إذن النظام:' : 'System status:'}</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${
                permissionState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : permissionState === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {permissionState === 'granted'
                ? (isAr ? 'ممنوح ونشط ✓' : 'Granted ✓')
                : permissionState === 'denied'
                ? (isAr ? 'محظور في المتصفح ✕' : 'Denied ✕')
                : (isAr ? 'يتطلب الإذن' : 'Prompt Required')}
            </span>
          </div>

          {permissionState !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] shadow-sm transition-all"
            >
              {isAr ? 'منح إذن الإشعارات' : 'Grant Permission'}
            </button>
          )}
        </div>

        {testStatus && (
          <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}
      </div>

      {/* SECTION 1: PRE-PRAYER REMINDER (15 MINUTES BEFORE) */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-thmanyah">
                {isAr ? 'تنبيه ما قبل الصلاة (الاستعداد والتهيئة)' : 'Pre-Prayer Readiness Reminder'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'تنبيه وقور قبل دخول الوقت بـ 15 دقيقة (افتراضياً) لإنهاء العمل والتجهز للوضوء'
                  : 'Tranquil notice 15 minutes before prayer to wrap up activities & prepare for Wudu'}
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={notifs.prePrayerAlert}
            onChange={(e) =>
              onUpdateSettings({
                notifications: { ...notifs, prePrayerAlert: e.target.checked },
              })
            }
            className="accent-emerald-500 w-5 h-5 cursor-pointer mt-1"
          />
        </div>

        {notifs.prePrayerAlert && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            {/* Lead Time Selection: 5, 10, 15 (default), 30 minutes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                {isAr ? 'وقت التنبيه المسبق:' : 'Reminder Lead Time:'}
              </span>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() =>
                      onUpdateSettings({
                        notifications: { ...notifs, prePrayerMinutes: mins },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                      notifs.prePrayerMinutes === mins
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/5'
                    }`}
                  >
                    {mins} {isAr ? 'دقيقة' : 'min'}
                    {mins === 15 && <span className="text-[10px] text-[#fae3b3] block font-sans">({isAr ? 'الافتراضي' : 'Default'})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Example preview message */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#e6c387] block font-bold mb-0.5">
                  {isAr ? 'نموذج الإشعار الذي سيظهر:' : 'Preview of notification message:'}
                </span>
                <p className="font-thmanyah">
                  {isAr
                    ? `«اقترب موعد صلاة العصر 🌿 متبقي ${notifs.prePrayerMinutes} دقيقة على الصلاة»`
                    : `“Asr prayer is approaching 🌿 ${notifs.prePrayerMinutes} minutes remaining”`}
                </p>
              </div>

              <button
                onClick={() => triggerTestNotification('prePrayer')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1 shrink-0"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>{isAr ? 'تجربة' : 'Test'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: SALAWAT REMINDER EVERY TWO HOURS */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-thmanyah">
                  {isAr ? 'تذكير الصلاة على النبي ﷺ (كل ساعتين)' : 'Prophetic Blessings (Every 2 Hours)'}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {isAr ? 'ميزة حصرية' : 'Exclusive'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? '«مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا» — تذكير دوري هادئ كل ساعتين'
                  : 'Periodic gentle reminder to invoke blessings upon Prophet Muhammad ﷺ'}
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={notifs.salawatEnabled}
            onChange={(e) =>
              onUpdateSettings({
                notifications: { ...notifs, salawatEnabled: e.target.checked },
              })
            }
            className="accent-emerald-500 w-5 h-5 cursor-pointer mt-1"
          />
        </div>

        {notifs.salawatEnabled && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            {/* Interval selection: 1, 2 (default), 3, 4 hours */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">{isAr ? 'التكرار الدوري:' : 'Interval Frequency:'}</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    onClick={() =>
                      onUpdateSettings({
                        notifications: { ...notifs, salawatIntervalHours: h },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                      notifs.salawatIntervalHours === h
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/5'
                    }`}
                  >
                    {isAr ? `كل ${h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : `${h} ساعات`}` : `Every ${h} hr`}
                  </button>
                ))}
              </div>
            </div>

            {/* Phrasing selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">
                {isAr ? 'اختر صيغة التذكير المفضلة:' : 'Select preferred phrasing:'}
              </span>
              <div className="space-y-1.5">
                {SALAWAT_MESSAGES.map((msg, idx) => {
                  const isSelected = (notifs.salawatMessageIndex || 0) === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        onUpdateSettings({
                          notifications: { ...notifs, salawatMessageIndex: idx },
                        })
                      }
                      className={`w-full p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-black/50'
                      }`}
                    >
                      <span className="font-thmanyah">{isAr ? msg.ar : msg.en}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test button & Active window */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {isAr ? 'ساعات العمل: 08:00 ص إلى 10:00 م (مع مراعاة ساعات الهدوء)' : 'Active hours: 08:00 to 22:00'}
              </span>
              <button
                onClick={() => triggerTestNotification('salawat')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>{isAr ? 'تجربة التنبيه' : 'Test Salawat'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: AT-PRAYER TIME & ADHAN LIBRARY INTEGRATION */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-thmanyah">
                {isAr ? 'نغمة الأذان المعتمدة عند دخول الوقت' : 'Adhan Audio & Notification at Prayer Time'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? `الأذان الحالي: ${selectedDefaultAdhan.titleAr} (${selectedDefaultAdhan.muezzinAr})`
                  : `Current: ${selectedDefaultAdhan.titleEn}`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdhanLibrary}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'مكتبة الأذان' : 'Adhan Library'}</span>
          </button>
        </div>

        {/* Per-Prayer Sound Preference Table */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((key) => {
            const prayerName =
              key === 'fajr'
                ? (isAr ? 'الفجر' : 'Fajr')
                : key === 'dhuhr'
                ? (isAr ? 'الظهر' : 'Dhuhr')
                : key === 'asr'
                ? (isAr ? 'العصر' : 'Asr')
                : key === 'maghrib'
                ? (isAr ? 'المغرب' : 'Maghrib')
                : (isAr ? 'العشاء' : 'Isha');

            const currentSound = notifs[key];

            return (
              <div key={key} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
                <span className="text-xs font-bold text-white font-thmanyah block">{prayerName}</span>
                <select
                  value={currentSound}
                  onChange={(e) =>
                    onUpdateSettings({
                      notifications: { ...notifs, [key]: e.target.value as any },
                    })
                  }
                  className="w-full p-1.5 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="adhan">{isAr ? 'أذان كامل' : 'Full Adhan'}</option>
                  <option value="chime">{isAr ? 'نغمة هادئة' : 'Gentle Chime'}</option>
                  <option value="silent">{isAr ? 'إشعار صامت' : 'Silent'}</option>
                  <option value="off">{isAr ? 'بدون تنبيه' : 'Off'}</option>
                </select>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400">
            {selectedDefaultAdhan.isUploadedMaster && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'ملف صوتي MP3 مرفوع ومسجل' : 'Real MP3 Master Audio'}
              </span>
            )}
          </div>
          <button
            onClick={() => triggerTestNotification('atTime')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isTestingAdhan
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
            }`}
          >
            {isTestingAdhan ? (
              <>
                <Square className="w-3 h-3 text-rose-400 fill-current" />
                <span>{isAr ? 'إيقاف صوت الأذان' : 'Stop Adhan'}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400 fill-current" />
                <span>{isAr ? 'تجربة صوت الأذان المعتمد' : 'Test Selected Adhan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 4: QUIET HOURS & PLATFORM NOTES */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#e6c387]" />
            <h4 className="text-xs font-bold text-white font-thmanyah">
              {isAr ? 'ساعات الهدوء الليلية (عدم الإزعاج)' : 'Quiet Hours (Do Not Disturb)'}
            </h4>
          </div>
          <input
            type="checkbox"
            checked={notifs.quietHoursEnabled}
            onChange={(e) =>
              onUpdateSettings({
                notifications: { ...notifs, quietHoursEnabled: e.target.checked },
              })
            }
            className="accent-emerald-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {notifs.quietHoursEnabled && (
          <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
            <span>{isAr ? 'من:' : 'From:'}</span>
            <input
              type="time"
              value={notifs.quietHoursStart}
              onChange={(e) =>
                onUpdateSettings({
                  notifications: { ...notifs, quietHoursStart: e.target.value },
                })
              }
              className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white"
            />
            <span>{isAr ? 'إلى:' : 'To:'}</span>
            <input
              type="time"
              value={notifs.quietHoursEnd}
              onChange={(e) =>
                onUpdateSettings({
                  notifications: { ...notifs, quietHoursEnd: e.target.value },
                })
              }
              className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white"
            />
          </div>
        )}

        {/* Honest Platform Limitations Breakdown */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
          <span className="font-bold text-[#e6c387] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {isAr ? 'توضيح الشفافية الفنية لأنظمة التشغيل:' : 'Platform Transparency Notes:'}
          </span>
          <p>
            {isAr
              ? '• أجهزة iPhone و iPad: تفرض Apple تثبيت التطبيق عبر زر المشاركة "إضافة إلى الشاشة الرئيسية" لتلقي التنبيهات في الخلفية.'
              : '• iOS (iPhone & iPad): Apple requires adding SAKINA to Home Screen via Safari for Web Push notifications.'}
          </p>
          <p>
            {isAr
              ? '• أجهزة Android و الحاسوب: تعمل الإشعارات الصوتية والنظامية فور منح إذن المتصفح سواء أكان التطبيق مفتوحاً أو في الخلفية.'
              : '• Android & Desktop: Push notifications and tones trigger reliably once browser permission is granted.'}
          </p>
        </div>
      </div>
    </div>
  );
};
