import { CityConfig, CalculationMethod } from '../types';

export const CALCULATION_METHODS: CalculationMethod[] = [
  {
    id: 5,
    name: 'الهيئة المصرية العامة للمساحة (المعتمد في مصر)',
    nameEn: 'Egyptian General Authority of Survey (Egypt)',
    fajrAngle: '19.5°',
    ishaAngle: '17.5°',
    note: 'المعيار الرسمي المعمول به في جمهورية مصر العربية وشمال أفريقيا',
  },
  {
    id: 4,
    name: 'جامعة أم القرى - مكة المكرمة',
    nameEn: 'Umm Al-Qura University, Makkah',
    fajrAngle: '18.5°',
    ishaAngle: '90 min after Maghrib (120 min in Ramadan)',
    note: 'المعيار الرسمي المعتمد في المملكة العربية السعودية ودول الخليج',
  },
  {
    id: 3,
    name: 'رابطة العالم الإسلامي (MWL)',
    nameEn: 'Muslim World League (MWL)',
    fajrAngle: '18°',
    ishaAngle: '17°',
    note: 'شائع في أوروبا والشرق الأقصى وأجزاء من العالم الإسلامي',
  },
  {
    id: 2,
    name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
    nameEn: 'Islamic Society of North America (ISNA)',
    fajrAngle: '15°',
    ishaAngle: '15°',
    note: 'المعيار المعتمد في الولايات المتحدة وكندا',
  },
  {
    id: 1,
    name: 'جامعة العلوم الإسلامية بكراتشي',
    nameEn: 'University of Islamic Sciences, Karachi',
    fajrAngle: '18°',
    ishaAngle: '18°',
    note: 'باكستان، الهند، بنغلاديش، وأفغانستان',
  },
  {
    id: 13,
    name: 'رئاسة الشؤون الدينية التركية (Diyanet)',
    nameEn: 'Diyanet İşleri Başkanlığı (Turkey)',
    fajrAngle: '18°',
    ishaAngle: '17°',
    note: 'المعيار الرسمي في الجمهورية التركية ودول البلقان',
  },
  {
    id: 8,
    name: 'منطقة الخليج العربي الموحدة',
    nameEn: 'Gulf Region',
    fajrAngle: '19.5°',
    ishaAngle: '90 min after Maghrib',
    note: 'حساب موحد لدول الخليج',
  },
  {
    id: 12,
    name: 'اتحاد المنظمات الإسلامية في فرنسا (UOIF)',
    nameEn: 'Union des Organisations Islamiques de France',
    fajrAngle: '12°',
    ishaAngle: '12°',
    note: 'خاص بفرنسا وخطوط العرض الأوروبية المرتفعة',
  },
];

export const PRESET_CITIES: CityConfig[] = [
  // مصر (Default)
  { name: 'القاهرة', nameEn: 'Cairo', country: 'مصر', countryEn: 'Egypt', lat: 30.0444, lon: 31.2357, method: 5, timezone: 'Africa/Cairo' },
  { name: 'الإسكندرية', nameEn: 'Alexandria', country: 'مصر', countryEn: 'Egypt', lat: 31.2001, lon: 29.9187, method: 5, timezone: 'Africa/Cairo' },
  { name: 'الجيزة', nameEn: 'Giza', country: 'مصر', countryEn: 'Egypt', lat: 30.0131, lon: 31.2089, method: 5, timezone: 'Africa/Cairo' },
  { name: 'المنصورة', nameEn: 'Mansoura', country: 'مصر', countryEn: 'Egypt', lat: 31.0409, lon: 31.3785, method: 5, timezone: 'Africa/Cairo' },
  { name: 'أسوان', nameEn: 'Aswan', country: 'مصر', countryEn: 'Egypt', lat: 24.0889, lon: 32.8998, method: 5, timezone: 'Africa/Cairo' },
  { name: 'طنطا', nameEn: 'Tanta', country: 'مصر', countryEn: 'Egypt', lat: 30.7865, lon: 31.0004, method: 5, timezone: 'Africa/Cairo' },
  { name: 'بور سعيد', nameEn: 'Port Said', country: 'مصر', countryEn: 'Egypt', lat: 31.2653, lon: 32.3019, method: 5, timezone: 'Africa/Cairo' },

  // السعودية والخليج
  { name: 'مكة المكرمة', nameEn: 'Makkah', country: 'السعودية', countryEn: 'Saudi Arabia', lat: 21.4225, lon: 39.8262, method: 4, timezone: 'Asia/Riyadh' },
  { name: 'المدينة المنورة', nameEn: 'Madinah', country: 'السعودية', countryEn: 'Saudi Arabia', lat: 24.4672, lon: 39.6111, method: 4, timezone: 'Asia/Riyadh' },
  { name: 'الرياض', nameEn: 'Riyadh', country: 'السعودية', countryEn: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, method: 4, timezone: 'Asia/Riyadh' },
  { name: 'جدة', nameEn: 'Jeddah', country: 'السعودية', countryEn: 'Saudi Arabia', lat: 21.5433, lon: 39.1728, method: 4, timezone: 'Asia/Riyadh' },
  { name: 'دبي', nameEn: 'Dubai', country: 'الإمارات', countryEn: 'UAE', lat: 25.2048, lon: 55.2708, method: 4, timezone: 'Asia/Dubai' },
  { name: 'أبو ظبي', nameEn: 'Abu Dhabi', country: 'الإمارات', countryEn: 'UAE', lat: 24.4539, lon: 54.3773, method: 4, timezone: 'Asia/Dubai' },
  { name: 'الدوحة', nameEn: 'Doha', country: 'قطر', countryEn: 'Qatar', lat: 25.2854, lon: 51.531, method: 4, timezone: 'Asia/Qatar' },
  { name: 'الكويت', nameEn: 'Kuwait City', country: 'الكويت', countryEn: 'Kuwait', lat: 29.3759, lon: 47.9774, method: 4, timezone: 'Asia/Kuwait' },
  { name: 'مسقط', nameEn: 'Muscat', country: 'عُمان', countryEn: 'Oman', lat: 23.588, lon: 58.3829, method: 4, timezone: 'Asia/Muscat' },
  { name: 'المنامة', nameEn: 'Manama', country: 'البحرين', countryEn: 'Bahrain', lat: 26.2285, lon: 50.586, method: 4, timezone: 'Asia/Bahrain' },

  // بلاد الشام والمغرب العربي
  { name: 'القدس الشريف', nameEn: 'Jerusalem', country: 'فلسطين', countryEn: 'Palestine', lat: 31.7683, lon: 35.2137, method: 3, timezone: 'Asia/Jerusalem' },
  { name: 'عَمّان', nameEn: 'Amman', country: 'الأردن', countryEn: 'Jordan', lat: 31.9539, lon: 35.9106, method: 3, timezone: 'Asia/Amman' },
  { name: 'بيروت', nameEn: 'Beirut', country: 'لبنان', countryEn: 'Lebanon', lat: 33.8938, lon: 35.5018, method: 3, timezone: 'Asia/Beirut' },
  { name: 'دمشق', nameEn: 'Damascus', country: 'سوريا', countryEn: 'Syria', lat: 33.5138, lon: 36.2765, method: 3, timezone: 'Asia/Damascus' },
  { name: 'بغداد', nameEn: 'Baghdad', country: 'العراق', countryEn: 'Iraq', lat: 33.3152, lon: 44.3661, method: 3, timezone: 'Asia/Baghdad' },
  { name: 'الرباط', nameEn: 'Rabat', country: 'المغرب', countryEn: 'Morocco', lat: 34.0209, lon: -6.8416, method: 3, timezone: 'Africa/Casablanca' },
  { name: 'تونس', nameEn: 'Tunis', country: 'تونس', countryEn: 'Tunisia', lat: 36.8065, lon: 10.1815, method: 3, timezone: 'Africa/Tunis' },
  { name: 'الجزائر', nameEn: 'Algiers', country: 'الجزائر', countryEn: 'Algeria', lat: 36.7538, lon: 3.0588, method: 3, timezone: 'Africa/Algiers' },

  // عواصم عالمية أخرى
  { name: 'إسطنبول', nameEn: 'Istanbul', country: 'تركيا', countryEn: 'Turkey', lat: 41.0082, lon: 28.9784, method: 13, timezone: 'Europe/Istanbul' },
  { name: 'لندن', nameEn: 'London', country: 'بريطانيا', countryEn: 'UK', lat: 51.5074, lon: -0.1278, method: 3, timezone: 'Europe/London' },
  { name: 'باريس', nameEn: 'Paris', country: 'فرنسا', countryEn: 'France', lat: 48.8566, lon: 2.3522, method: 12, timezone: 'Europe/Paris' },
  { name: 'نيويورك', nameEn: 'New York', country: 'أمريكا', countryEn: 'USA', lat: 40.7128, lon: -74.006, method: 2, timezone: 'America/New_York' },
  { name: 'تورونتو', nameEn: 'Toronto', country: 'كندا', countryEn: 'Canada', lat: 43.6532, lon: -79.3832, method: 2, timezone: 'America/Toronto' },
  { name: 'كوالالمبور', nameEn: 'Kuala Lumpur', country: 'ماليزيا', countryEn: 'Malaysia', lat: 3.139, lon: 101.6869, method: 3, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'جاكرتا', nameEn: 'Jakarta', country: 'إندونيسيا', countryEn: 'Indonesia', lat: -6.2088, lon: 106.8456, method: 3, timezone: 'Asia/Jakarta' },
];
