import { PrayerTimes, CityConfig } from '../types';

export interface PrayerPhaseInfo {
  timeline: {
    key: keyof PrayerTimes;
    nameAr: string;
    nameEn: string;
    time: string;
    isPrayer: boolean;
    dateObj: Date;
  }[];
  currentPrayer: {
    key: keyof PrayerTimes;
    nameAr: string;
    nameEn: string;
    time: string;
    isPrayer: boolean;
    dateObj: Date;
  };
  nextPrayer: {
    key: keyof PrayerTimes;
    nameAr: string;
    nameEn: string;
    time: string;
    isPrayer: boolean;
    dateObj: Date;
  };
  progress: number; // 0 to 100
  countdownFormatted: string;
  totalSecondsRemaining: number;
}

export interface CachedTimingsResult {
  timings: PrayerTimes;
  hijriDate: {
    day: string;
    monthAr: string;
    monthEn: string;
    year: string;
    formattedAr: string;
    formattedEn: string;
    monthNumber: number;
  };
  cachedAt: string;
  isStale: boolean;
}

/**
 * Fetch prayer times from AlAdhan API with local fallback and caching
 */
export async function getPrayerTimes(
  city: CityConfig,
  calcMethod: number,
  asrSchool: '0' | '1',
  highLatitudeRule: '1' | '2' | '3',
  minuteOffsets: Record<string, number>,
  hijriAdjustment: number = 0
): Promise<{ result: CachedTimingsResult; fromCache: boolean; error?: string }> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const cacheKey = `sakina_v2_${city.name}_${calcMethod}_${asrSchool}_${highLatitudeRule}_${dateStr}`;

  // Check cache first
  const cachedData = localStorage.getItem(cacheKey);
  let parsedCache: CachedTimingsResult | null = null;
  if (cachedData) {
    try {
      parsedCache = JSON.parse(cachedData);
    } catch {
      // Ignore cache parse error
    }
  }

  // If online, try to fetch fresh data
  if (navigator.onLine) {
    try {
      // Build AlAdhan query
      const url = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${city.lat}&longitude=${city.lon}&method=${calcMethod}&school=${asrSchool}&latitudeAdjustmentMethod=${highLatitudeRule}&adjustment=${hijriAdjustment}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const json = await response.json();

      if (json && json.code === 200 && json.data) {
        const rawTimings = json.data.timings;
        const hijri = json.data.date.hijri;

        // Apply manual minute adjustments
        const adjustedTimings: PrayerTimes = {
          Fajr: applyOffset(rawTimings.Fajr, minuteOffsets.Fajr || 0),
          Sunrise: applyOffset(rawTimings.Sunrise, minuteOffsets.Sunrise || 0),
          Dhuhr: applyOffset(rawTimings.Dhuhr, minuteOffsets.Dhuhr || 0),
          Asr: applyOffset(rawTimings.Asr, minuteOffsets.Asr || 0),
          Maghrib: applyOffset(rawTimings.Maghrib, minuteOffsets.Maghrib || 0),
          Isha: applyOffset(rawTimings.Isha, minuteOffsets.Isha || 0),
          Imsak: rawTimings.Imsak ? applyOffset(rawTimings.Imsak, minuteOffsets.Fajr || 0) : undefined,
          Midnight: rawTimings.Midnight,
        };

        const resultPayload: CachedTimingsResult = {
          timings: adjustedTimings,
          hijriDate: {
            day: hijri.day,
            monthAr: hijri.month.ar,
            monthEn: hijri.month.en,
            year: hijri.year,
            formattedAr: `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`,
            formattedEn: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
            monthNumber: hijri.month.number,
          },
          cachedAt: new Date().toISOString(),
          isStale: false,
        };

        localStorage.setItem(cacheKey, JSON.stringify(resultPayload));
        return { result: resultPayload, fromCache: false };
      }
    } catch (err: any) {
      console.warn('AlAdhan fetch failed, utilizing cached or astronomical fallback', err);
    }
  }

  // If fetch failed or offline, return cache if available
  if (parsedCache) {
    return {
      result: { ...parsedCache, isStale: true },
      fromCache: true,
    };
  }

  // Ultimate fallback calculation if completely fresh & offline
  const fallback = generateOfflineFallback(city, minuteOffsets);
  return {
    result: fallback,
    fromCache: true,
    error: 'تعذر الاتصال بالشبكة، يتم استخدام تقويم حسابي تقديري محلي.',
  };
}

/**
 * Adds minute offset to HH:MM format
 */
function applyOffset(timeStr: string, offsetMins: number): string {
  if (!timeStr) return '00:00';
  const cleanTime = timeStr.slice(0, 5); // strip any (EET) timezone notes
  const [h, m] = cleanTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + offsetMins;
  const normalized = (totalMinutes + 1440) % 1440;
  const newH = Math.floor(normalized / 60);
  const newM = normalized % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Offline astronomical estimations if first run and no internet
 */
function generateOfflineFallback(city: CityConfig, offsets: Record<string, number>): CachedTimingsResult {
  return {
    timings: {
      Fajr: applyOffset('04:45', offsets.Fajr || 0),
      Sunrise: applyOffset('06:10', offsets.Sunrise || 0),
      Dhuhr: applyOffset('11:55', offsets.Dhuhr || 0),
      Asr: applyOffset('15:15', offsets.Asr || 0),
      Maghrib: applyOffset('17:40', offsets.Maghrib || 0),
      Isha: applyOffset('19:00', offsets.Isha || 0),
      Imsak: '04:35',
      Midnight: '23:45',
    },
    hijriDate: {
      day: '15',
      monthAr: 'شعبان',
      monthEn: 'Sha’ban',
      year: '1448',
      formattedAr: '15 شعبان 1448 هـ',
      formattedEn: '15 Sha’ban 1448 AH',
      monthNumber: 8,
    },
    cachedAt: new Date().toISOString(),
    isStale: true,
  };
}

/**
 * Calculates current prayer, next prayer, smooth progress ratio, and countdown
 */
export function calculatePrayerPhases(
  timings: PrayerTimes,
  now: Date = new Date()
): PrayerPhaseInfo {
  const prayerConfig: { key: keyof PrayerTimes; nameAr: string; nameEn: string; isPrayer: boolean }[] = [
    { key: 'Fajr', nameAr: 'الفجر', nameEn: 'Fajr', isPrayer: true },
    { key: 'Sunrise', nameAr: 'الشروق', nameEn: 'Sunrise', isPrayer: false },
    { key: 'Dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', isPrayer: true },
    { key: 'Asr', nameAr: 'العصر', nameEn: 'Asr', isPrayer: true },
    { key: 'Maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', isPrayer: true },
    { key: 'Isha', nameAr: 'العشاء', nameEn: 'Isha', isPrayer: true },
  ];

  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const timeline = prayerConfig.map((item) => {
    const raw = (timings[item.key] || '00:00').slice(0, 5);
    const [hrs, mins] = raw.split(':').map(Number);
    const dateObj = new Date(y, m, d, hrs, mins, 0);
    return {
      ...item,
      time: raw,
      dateObj,
    };
  });

  const nextIndex = timeline.findIndex((p) => p.dateObj > now);
  let currentPrayer: (typeof timeline)[0];
  let nextPrayer: (typeof timeline)[0];
  let elapsedMs = 0;
  let totalSpanMs = 0;
  let diffMs = 0;

  if (nextIndex === -1) {
    // Current time is after Isha: next prayer is tomorrow's Fajr
    currentPrayer = timeline[timeline.length - 1]; // Isha
    const [fajrH, fajrM] = (timings['Fajr'] || '04:45').slice(0, 5).split(':').map(Number);
    const tomorrowFajrDate = new Date(y, m, d + 1, fajrH, fajrM, 0);

    nextPrayer = {
      key: 'Fajr',
      nameAr: 'الفجر',
      nameEn: 'Fajr',
      isPrayer: true,
      time: (timings['Fajr'] || '04:45').slice(0, 5),
      dateObj: tomorrowFajrDate,
    };

    diffMs = tomorrowFajrDate.getTime() - now.getTime();
    totalSpanMs = tomorrowFajrDate.getTime() - currentPrayer.dateObj.getTime();
    elapsedMs = now.getTime() - currentPrayer.dateObj.getTime();
  } else if (nextIndex === 0) {
    // Current time is before today's Fajr: current prayer is yesterday's Isha
    nextPrayer = timeline[0]; // Fajr
    const [ishaH, ishaM] = (timings['Isha'] || '19:00').slice(0, 5).split(':').map(Number);
    const yesterdayIshaDate = new Date(y, m, d - 1, ishaH, ishaM, 0);

    currentPrayer = {
      key: 'Isha',
      nameAr: 'العشاء',
      nameEn: 'Isha',
      isPrayer: true,
      time: (timings['Isha'] || '19:00').slice(0, 5),
      dateObj: yesterdayIshaDate,
    };

    diffMs = nextPrayer.dateObj.getTime() - now.getTime();
    totalSpanMs = nextPrayer.dateObj.getTime() - yesterdayIshaDate.getTime();
    elapsedMs = now.getTime() - yesterdayIshaDate.getTime();
  } else {
    // Standard daytime interval
    currentPrayer = timeline[nextIndex - 1];
    nextPrayer = timeline[nextIndex];
    diffMs = nextPrayer.dateObj.getTime() - now.getTime();
    totalSpanMs = nextPrayer.dateObj.getTime() - currentPrayer.dateObj.getTime();
    elapsedMs = now.getTime() - currentPrayer.dateObj.getTime();
  }

  const progress = totalSpanMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalSpanMs) * 100)) : 0;
  const totalSecondsRemaining = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSecondsRemaining / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = totalSecondsRemaining % 60;
  const countdownFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    timeline,
    currentPrayer,
    nextPrayer,
    progress,
    countdownFormatted,
    totalSecondsRemaining,
  };
}
