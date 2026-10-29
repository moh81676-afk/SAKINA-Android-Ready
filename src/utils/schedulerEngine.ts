/**
 * SAKINA Smart Reminder Scheduler Engine
 * Handles 15-minute pre-prayer warnings, exact-time Adhan alerts, and 2-hour Salawat reminders
 * with zero duplicates, quiet-hours compliance, and local storage guards.
 */

import { UserSettings, PrayerTimes } from '../types';
import { soundManager } from './audio';
import { SALAWAT_MESSAGES } from '../components/UnifiedNotificationCenter';
import { ADHAN_RECORDINGS } from '../data/adhanLibraryData';

interface SchedulerState {
  lastSalawatTimestamp: number;
  sentPrePrayerAlerts: Record<string, boolean>; // e.g. "2026-10-29_Asr": true
  sentAtTimeAlerts: Record<string, boolean>;
}

class SchedulerEngine {
  private intervalId: any = null;

  start(
    getSettings: () => UserSettings,
    getPrayerTimes: () => PrayerTimes | null,
    getLanguage: () => 'ar' | 'en'
  ) {
    if (this.intervalId) return;

    // Check every 25 seconds
    this.intervalId = setInterval(() => {
      this.tick(getSettings(), getPrayerTimes(), getLanguage());
    }, 25000);

    // Initial tick
    this.tick(getSettings(), getPrayerTimes(), getLanguage());
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private isQuietHour(settings: UserSettings, now: Date): boolean {
    if (!settings.notifications.quietHoursEnabled) return false;

    const [startH, startM] = settings.notifications.quietHoursStart.split(':').map(Number);
    const [endH, endM] = settings.notifications.quietHoursEnd.split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    } else {
      // Over midnight (e.g. 23:00 to 04:00)
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    }
  }

  private tick(settings: UserSettings, prayerTimes: PrayerTimes | null, lang: 'ar' | 'en') {
    if (!settings.notifications.enabled) return;

    const now = new Date();
    const isAr = lang === 'ar';
    const todayStr = now.toISOString().slice(0, 10);

    // 1. Check Salawat Reminder (Default every 2 hours)
    if (settings.notifications.salawatEnabled && !this.isQuietHour(settings, now)) {
      const currentHour = now.getHours();
      const startH = settings.notifications.salawatStartHour || 8;
      const endH = settings.notifications.salawatEndHour || 22;

      if (currentHour >= startH && currentHour <= endH) {
        const lastSalawat = parseInt(localStorage.getItem('sakina_last_salawat_time') || '0', 10);
        const intervalMs = (settings.notifications.salawatIntervalHours || 2) * 60 * 60 * 1000;

        if (Date.now() - lastSalawat >= intervalMs) {
          localStorage.setItem('sakina_last_salawat_time', Date.now().toString());

          // Trigger Salawat
          soundManager.playSalawatChime();
          const currentPhrase = SALAWAT_MESSAGES[settings.notifications.salawatMessageIndex || 0];

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(isAr ? 'صلِّ على النبي ﷺ 🌿' : 'Blessings upon Prophet Muhammad ﷺ', {
              body: isAr ? currentPhrase.ar : currentPhrase.en,
              icon: '/icon.svg',
              badge: '/icon.svg',
            });
          }
        }
      }
    }

    // 2. Check Pre-Prayer (15 minutes before) and At-Time Prayer Reminders
    if (!prayerTimes) return;

    const prayers = [
      { key: 'Fajr', nameAr: 'الفجر', nameEn: 'Fajr', time: prayerTimes.Fajr },
      { key: 'Dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', time: prayerTimes.Dhuhr },
      { key: 'Asr', nameAr: 'العصر', nameEn: 'Asr', time: prayerTimes.Asr },
      { key: 'Maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', time: prayerTimes.Maghrib },
      { key: 'Isha', nameAr: 'العشاء', nameEn: 'Isha', time: prayerTimes.Isha },
    ];

    const leadMins = settings.notifications.prePrayerMinutes || 15;

    prayers.forEach((p) => {
      if (!p.time) return;
      const [pH, pM] = p.time.slice(0, 5).split(':').map(Number);
      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pH, pM, 0);

      const diffMs = prayerDate.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      // A. Pre-prayer alert check (e.g. 15 minutes before)
      if (settings.notifications.prePrayerAlert && diffMins === leadMins) {
        const alertKey = `pre_${todayStr}_${p.key}_${leadMins}`;
        if (!localStorage.getItem(alertKey) && !this.isQuietHour(settings, now)) {
          localStorage.setItem(alertKey, 'true');

          soundManager.playPrePrayerReminderChime();

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(
              isAr ? `اقترب موعد صلاة ${p.nameAr} 🌿` : `${p.nameEn} prayer is approaching 🌿`,
              {
                body: isAr
                  ? `متبقي ${leadMins} دقيقة على صلاة ${p.nameAr}. الموعد: ${p.time.slice(0, 5)}.`
                  : `${leadMins} minutes remaining until ${p.nameEn} prayer at ${p.time.slice(0, 5)}.`,
                icon: '/icon.svg',
                badge: '/icon.svg',
              }
            );
          }
        }
      }

      // B. Exact Prayer Time Alert Check (diffMins === 0)
      if (diffMins === 0) {
        const atTimeKey = `attime_${todayStr}_${p.key}`;
        if (!localStorage.getItem(atTimeKey)) {
          localStorage.setItem(atTimeKey, 'true');

          const soundPref = (settings.notifications as any)[p.key.toLowerCase()];
          if (soundPref !== 'off') {
            if (soundPref === 'adhan') {
              const assignedId = (settings.prayerAdhanMap as any)?.[p.key] || settings.defaultAdhanId || 'makkah-mulla';
              const rec = ADHAN_RECORDINGS.find((r) => r.id === assignedId) || ADHAN_RECORDINGS[0];
              if (rec?.audioUrl) {
                soundManager.playAdhan(rec.audioUrl);
              }
            } else if (soundPref === 'chime') {
              soundManager.playCompletionChime();
            }

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(
                isAr ? `حان الآن موعد صلاة ${p.nameAr} 🕌` : `It is now time for ${p.nameEn} prayer 🕌`,
                {
                  body: isAr
                    ? `الله أكبر الله أكبر.. حان وقت أذان ${p.nameAr} في ${settings.city.name}.`
                    : `Allahu Akbar! Call to prayer in ${settings.city.nameEn}.`,
                  icon: '/icon.svg',
                  badge: '/icon.svg',
                }
              );
            }
          }
        }
      }
    });
  }
}

export const scheduler = new SchedulerEngine();
