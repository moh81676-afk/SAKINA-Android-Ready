import React, { useState } from 'react';
import { X, MapPin, Sliders, Bell, Volume2, Shield, Download, Trash2, Crosshair, Check, AlertCircle } from 'lucide-react';
import { UserSettings, CityConfig } from '../types';
import { PRESET_CITIES, CALCULATION_METHODS } from '../data/citiesData';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRefreshTimes: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRefreshTimes,
}) => {
  if (!isOpen) return null;

  const isAr = settings.language === 'ar';
  const [activeTab, setActiveTab] = useState<'location' | 'calc' | 'notifs' | 'privacy'>('location');
  const [citySearch, setCitySearch] = useState('');
  const [customLat, setCustomLat] = useState(settings.city.lat.toString());
  const [customLon, setCustomLon] = useState(settings.city.lon.toString());
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter preset cities
  const filteredCities = PRESET_CITIES.filter((c) => {
    const q = citySearch.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.countryEn.toLowerCase().includes(q)
    );
  });

  // Geolocation trigger
  const handleDetectGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsError(isAr ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const detectedCity: CityConfig = {
          name: isAr ? 'موقعي الحالي' : 'My Current Location',
          nameEn: 'Current Location',
          country: isAr ? 'تحديد تلقائي' : 'Auto GPS',
          countryEn: 'Auto GPS',
          lat,
          lon,
          method: settings.calcMethod,
        };
        onUpdateSettings({ city: detectedCity });
        setCustomLat(lat.toString());
        setCustomLon(lon.toString());
        setGpsLoading(false);
        onRefreshTimes();
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? (isAr ? 'تم رفض إذن الوصول للموقع في المتصفح' : 'Location permission denied')
            : (isAr ? 'تعذر جلب إحداثيات الموقع' : 'Could not acquire coordinates')
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;

    const customCity: CityConfig = {
      name: isAr ? `إحداثيات (${lat}, ${lon})` : `Coords (${lat}, ${lon})`,
      nameEn: `Coords (${lat}, ${lon})`,
      country: isAr ? 'مخصص' : 'Custom',
      countryEn: 'Custom',
      lat,
      lon,
      method: settings.calcMethod,
    };
    onUpdateSettings({ city: customCity });
    onRefreshTimes();
  };

  // Test Notification & Sound
  const handleTestNotification = () => {
    soundManager.playAdhanChime();

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(isAr ? 'سكينة | حان وقت الصلاة' : 'SAKINA | Prayer Time', {
          body: isAr
            ? `أشهد أن لا إله إلا الله، حان موعد الصلاة في ${settings.city.name}.`
            : `It is now prayer time in ${settings.city.nameEn}.`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(isAr ? 'سكينة | تم تفعيل الإشعارات' : 'SAKINA | Notifications Enabled', {
              body: isAr ? 'ستصلك تنبيهات الصلوات في موعدها المحدد.' : 'Prayer alerts are now active.',
            });
            onUpdateSettings({
              notifications: { ...settings.notifications, enabled: true },
            });
          }
        });
      }
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sakina_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakina-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const handleClearData = () => {
    if (window.confirm(isAr ? 'تحذير: هل أنت متأكد من مسح كافة السجلات والبيانات المحفوظة محلياً؟' : 'Are you sure you want to delete all local data?')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sakina_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1728] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg md:text-xl font-black text-white font-thmanyah">
              {isAr ? 'الإعدادات والتخصيص' : 'Settings & Preferences'}
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {isAr ? 'خصوصية كاملة' : '100% Private'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-slate-900/60 p-1.5 gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'location' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isAr ? 'الموقع الجغرافي' : 'Location'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'calc' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'طرق الحساب' : 'Calculations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifs')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'notifs' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isAr ? 'الأذان والتنبيهات' : 'Adhan & Alerts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخصوصية' : 'Privacy'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 no-scrollbar">
          {/* TAB 1: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* GPS Auto Detect */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-thmanyah">
                      {isAr ? 'التحديد التلقائي عبر GPS' : 'Automatic GPS Detection'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'يتم طلب الإذن لحساب القبلة والمواقيت فقط دون حفظ مسارك' : 'Used solely for local prayer calculation'}
                    </p>
                  </div>
                  <button
                    onClick={handleDetectGPS}
                    disabled={gpsLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? (isAr ? 'جاري التحديد...' : 'Detecting...') : (isAr ? 'تحديد موقعي' : 'Locate Me')}</span>
                  </button>
                </div>
                {gpsError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
              </div>

              {/* Preset City Search & Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'اختر مدينتك من القائمة المعتمدة:' : 'Select city from presets:'}
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    {isAr ? settings.city.name : settings.city.nameEn}
                  </span>
                </div>

                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={isAr ? 'ابحث باسم المدينة أو الدولة...' : 'Search city or country...'}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pt-1">
                  {filteredCities.map((c) => {
                    const isSelected = settings.city.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          onUpdateSettings({ city: c, calcMethod: c.method });
                          onRefreshTimes();
                        }}
                        className={`p-2.5 rounded-xl text-right transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="text-xs flex items-center justify-between">
                          <span>{isAr ? c.name : c.nameEn}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block">{isAr ? c.country : c.countryEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Coordinates Input */}
              <form onSubmit={handleApplyCoordinates} className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isAr ? 'أو أدخل الإحداثيات يدوياً (Latitude / Longitude):' : 'Or enter custom coordinates:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude"
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                  <input
                    type="number"
                    step="any"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="Longitude"
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-bold"
                >
                  {isAr ? 'تطبيق الإحداثيات' : 'Apply Coordinates'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CALCULATIONS & OFFSETS */}
          {activeTab === 'calc' && (
            <div className="space-y-4">
              {/* Calculation Method Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {isAr ? 'طريقة الحساب الفلكية المعتمدة:' : 'Calculation Method:'}
                </label>
                <select
                  value={settings.calcMethod}
                  onChange={(e) => {
                    onUpdateSettings({ calcMethod: parseInt(e.target.value, 10) });
                    onRefreshTimes();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {isAr ? m.name : m.nameEn} (فجر: {m.fajrAngle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Asr Juristic School */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {isAr ? 'مذهب حساب وقت صلاة العصر:' : 'Asr Juristic Method:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onUpdateSettings({ asrSchool: '0' });
                      onRefreshTimes();
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      settings.asrSchool === '0'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    {isAr ? 'الجمهور (الشافعي ومالك وأحمد)' : 'Standard (Shafi’i/Maliki/Hanbali)'}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSettings({ asrSchool: '1' });
                      onRefreshTimes();
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      settings.asrSchool === '1'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}
                  >
                    {isAr ? 'المذهب الحنفي (المثلين)' : 'Hanafi (Shadow ratio 2:1)'}
                  </button>
                </div>
              </div>

              {/* Minute Manual Adjustments */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'ضبط الدقائق اليدوي لكل صلاة:' : 'Minute Tuning Adjustments:'}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? '(لمطابقة الأذان المحلي تماماً)' : '(For exact local match)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((key) => {
                    const currentOffset = settings.minuteOffsets[key] || 0;
                    return (
                      <div key={key} className="p-2 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">{key}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const updated = {
                                ...settings.minuteOffsets,
                                [key]: Math.max(-15, currentOffset - 1),
                              };
                              onUpdateSettings({ minuteOffsets: updated });
                              onRefreshTimes();
                            }}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-emerald-400">
                            {currentOffset > 0 ? `+${currentOffset}` : currentOffset}
                          </span>
                          <button
                            onClick={() => {
                              const updated = {
                                ...settings.minuteOffsets,
                                [key]: Math.min(15, currentOffset + 1),
                              };
                              onUpdateSettings({ minuteOffsets: updated });
                              onRefreshTimes();
                            }}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & SOUND */}
          {activeTab === 'notifs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-thmanyah">
                    {isAr ? 'تنبيهات مواقيت الصلاة' : 'Prayer Notifications'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'نغمات صوتية وإشعارات المتصفح عند دخول الوقت' : 'Synthesized audio and browser alerts at prayer time'}
                  </p>
                </div>

                <button
                  onClick={handleTestNotification}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'اختبار النغمة' : 'Test Sound'}</span>
                </button>
              </div>

              {/* Pre-prayer reminder */}
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {isAr ? 'تنبيه الاستعداد قبل الصلاة:' : 'Pre-prayer reminder:'}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.prePrayerAlert}
                    onChange={(e) =>
                      onUpdateSettings({
                        notifications: { ...settings.notifications, prePrayerAlert: e.target.checked },
                      })
                    }
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {settings.notifications.prePrayerAlert && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">{isAr ? 'التذكير قبل الوقت بـ:' : 'Remind before:'}</span>
                    {[5, 10, 15, 30].map((m) => (
                      <button
                        key={m}
                        onClick={() =>
                          onUpdateSettings({
                            notifications: { ...settings.notifications, prePrayerMinutes: m },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          settings.notifications.prePrayerMinutes === m
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-900 border-white/5 text-slate-400'
                        }`}
                      >
                        {m} {isAr ? 'د' : 'm'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & DATA */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="w-5 h-5" />
                  <h4 className="text-xs font-bold text-white font-thmanyah">
                    {isAr ? 'ميثاق الخصوصية التام في سكينة' : 'SAKINA Privacy Constitution'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'كل بياناتك الشخصية (التسبيح، الأوراد، إتمام الصلوات، الإعدادات) تُخزن فقط في متصفحك المحلي (Local Storage). لا نبيع بياناتك ولا نملك خوادم تتبع للمستخدمين.'
                    : 'All your personal activity and worship records remain strictly inside your device. No analytics trackers or telemetry.'}
                </p>
              </div>

              {/* Export Backup */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {isAr ? 'تصدير نسخة احتياطية من بياناتك' : 'Export Local Backup'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'تحميل ملف JSON بسجلاتك وأورادك' : 'Download JSON file of your settings & history'}
                  </span>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'تصدير' : 'Export'}</span>
                </button>
              </div>

              {/* Developer Attribution & Copyright Notice */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] text-[#e6c387] font-mono font-bold uppercase tracking-wider block">
                  {isAr ? 'بيانات المطور وحقوق الملكية' : 'Developer & Intellectual Property'}
                </span>
                <p className="text-xs text-white font-thmanyah font-bold">
                  {isAr
                    ? 'مهندس الذكاء الاصطناعي محمد علي شبل'
                    : 'AI Engineer Mohamed Ali Shabl'}
                </p>
                <p className="text-[11px] text-slate-300 font-thmanyah leading-relaxed">
                  {isAr
                    ? 'تم التصميم والتطوير بواسطة مهندس الذكاء الاصطناعي محمد علي شبل.'
                    : 'Designed and developed by AI Engineer Mohamed Ali Shabl.'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  © 2026 Mohamed Ali Shabl. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                </p>
              </div>

              {/* Clear All Data */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                <div>
                  <span className="text-xs font-bold text-rose-300 block">
                    {isAr ? 'حذف كافة البيانات والسجلات' : 'Delete All Data'}
                  </span>
                  <span className="text-[10px] text-rose-400/80">
                    {isAr ? 'إعادة ضبط التطبيق إلى حالته الأصلية' : 'Reset application to factory state'}
                  </span>
                </div>
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مسح الآن' : 'Clear All'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
