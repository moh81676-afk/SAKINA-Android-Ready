export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
  Midnight?: string;
  Firstthird?: string;
  Lastthird?: string;
}

export interface CityConfig {
  name: string;
  nameEn: string;
  country: string;
  countryEn: string;
  lat: number;
  lon: number;
  method: number;
  timezone?: string;
}

export interface CalculationMethod {
  id: number;
  name: string;
  nameEn: string;
  fajrAngle: string;
  ishaAngle: string;
  note?: string;
}

export interface DhikrItem {
  id: string;
  category: 'morning' | 'evening' | 'post_prayer' | 'sleep' | 'wake_up' | 'home' | 'food' | 'travel' | 'quranic' | 'tasbih';
  text: string;
  translationEn?: string;
  source: string;
  sourceEn?: string;
  benefit: string;
  benefitEn?: string;
  target: number;
  type: 'quran' | 'hadith' | 'dua';
}

export interface RhythmTask {
  id: string;
  title: string;
  periodKey: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'nightfall' | 'latenight';
  completed: boolean;
}

export interface UserSettings {
  language: 'ar' | 'en';
  theme: 'midnight' | 'emerald' | 'gold';
  city: CityConfig;
  calcMethod: number;
  asrSchool: '0' | '1'; // 0 = Standard (Shafi'i, Maliki, Hanbali), 1 = Hanafi
  highLatitudeRule: '1' | '2' | '3'; // 1 = Middle of the night, 2 = One-seventh, 3 = Angle-based
  minuteOffsets: {
    Fajr: number;
    Sunrise: number;
    Dhuhr: number;
    Asr: number;
    Maghrib: number;
    Isha: number;
  };
  notifications: {
    enabled: boolean;
    fajr: 'adhan' | 'chime' | 'silent' | 'off';
    dhuhr: 'adhan' | 'chime' | 'silent' | 'off';
    asr: 'adhan' | 'chime' | 'silent' | 'off';
    maghrib: 'adhan' | 'chime' | 'silent' | 'off';
    isha: 'adhan' | 'chime' | 'silent' | 'off';
    prePrayerAlert: boolean;
    prePrayerMinutes: number; // 5, 10, 15 (default), 30
    salawatEnabled: boolean;
    salawatIntervalHours: number; // 1, 2 (default), 3, 4
    salawatMessageIndex: number;
    salawatStartHour: number;
    salawatEndHour: number;
    adhkarRemindersEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  defaultAdhanId: string;
  prayerAdhanMap: Record<string, string>;
  hijriAdjustment: number; // -2, -1, 0, 1, 2 days
  fontSize: 'sm' | 'md' | 'lg';
  ramadanMode: boolean;
  onboardingCompleted: boolean;
}
