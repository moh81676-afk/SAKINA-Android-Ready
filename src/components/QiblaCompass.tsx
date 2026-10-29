import React, { useState, useEffect } from 'react';
import { Compass, Navigation, RefreshCw, AlertCircle, ShieldCheck, MapPin, Info } from 'lucide-react';
import { CityConfig } from '../types';
import { calculateQibla, normalizeHeading, KAABA_COORDINATES } from '../utils/qibla';

interface QiblaCompassProps {
  city: CityConfig;
  language: 'ar' | 'en';
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ city, language }) => {
  const isAr = language === 'ar';
  const [heading, setHeading] = useState<number | null>(null);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [showCalibrationHelp, setShowCalibrationHelp] = useState(false);

  const qiblaData = calculateQibla(city.lat, city.lon);

  // Initialize and bind device orientation sensor
  const requestCompassPermission = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        // iOS 13+ devices
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          bindOrientationListener();
        } else {
          setSensorError(isAr ? 'تم رفض إذن مستشعر الاتجاه' : 'Orientation permission denied');
        }
      } else {
        // Android and standard browsers
        bindOrientationListener();
      }
    } catch (err: any) {
      setSensorError(err.message || 'Sensor unavailable');
    }
  };

  const bindOrientationListener = () => {
    setSensorActive(true);
    setSensorError(null);

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const normalized = normalizeHeading(e.alpha, (e as any).webkitCompassHeading);
      if (normalized !== null) {
        setHeading(normalized);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
  };

  // Compass rotation angle
  // If sensor is active, the compass rose rotates opposite to heading, pointing needle towards Qibla
  const compassRoseRotation = heading !== null ? -heading : 0;
  const needleRotation = qiblaData.bearing;

  // Bearing alignment difference
  const difference = heading !== null ? Math.abs((heading - qiblaData.bearing + 360) % 360) : null;
  const isAlignedWithQibla = difference !== null && (difference < 4 || difference > 356);

  return (
    <div className="space-y-5 text-center">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-white font-thmanyah">
          {isAr ? 'بوصلة القبلة المشرّفة' : 'Interactive Qibla Compass'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isAr
            ? `حساب سمت كروي دقيق من موقعك في ${city.name} نحو الكعبة المشرفة`
            : `Spherical trigonometric bearing from ${city.nameEn} to the Holy Kaaba`}
        </p>
      </div>

      {/* Alignment Banner */}
      {isAlignedWithQibla && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'أنت متجه مباشرةً نحو القبلة المشرفة!' : 'Directly aligned facing the Kaaba!'}</span>
        </div>
      )}

      {/* The Compass Rose Visual */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto flex items-center justify-center my-4">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md"></div>

        {/* Rotating Dial */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${compassRoseRotation}deg)` }}
        >
          {/* Compass degree markings */}
          <div className="absolute top-2 text-[11px] font-bold text-rose-500">N (الشمال)</div>
          <div className="absolute bottom-2 text-[11px] font-bold text-slate-400">S (الجنوب)</div>
          <div className="absolute right-2 text-[11px] font-bold text-slate-400">E (الشرق)</div>
          <div className="absolute left-2 text-[11px] font-bold text-slate-400">W (الغرب)</div>

          {/* Degree ticks */}
          <svg className="w-full h-full p-4" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" fill="none" />
          </svg>

          {/* Needle pointing to Kaaba Bearing */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* Emerald Arrow pointer */}
            <div className="w-1.5 h-28 bg-gradient-to-t from-transparent via-emerald-400 to-emerald-500 rounded-full absolute -top-1 ring-glow"></div>
            
            {/* Kaaba Marker Pin at needle tip */}
            <div className="absolute -top-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white ring-4 ring-emerald-500/20">
              <span className="text-xs">🕋</span>
            </div>

            {/* Bottom opposite needle */}
            <div className="w-1 h-20 bg-slate-700/60 rounded-full absolute -bottom-1"></div>
          </div>
        </div>

        {/* Center hub readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-center shadow-xl">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {qiblaData.bearing}°
            </span>
            <span className="text-[10px] font-bold text-[#e6c387] block mt-0.5">
              {isAr ? 'زاوية القبلة' : 'Qibla Azimuth'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Bar: Distance & Sensor Status */}
      <div className="grid grid-cols-2 gap-3 text-right">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-0.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {isAr ? 'المسافة إلى مكة' : 'Distance to Makkah'}
          </span>
          <span className="text-base font-black font-mono text-slate-100">
            {qiblaData.distanceKm.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {isAr ? 'كم' : 'km'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-0.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-[#e6c387]" />
            {isAr ? 'حالة البوصلة' : 'Compass Status'}
          </span>
          <span className="text-xs font-bold text-slate-200">
            {heading !== null
              ? (isAr ? `توجيه حي (${Math.round(heading)}°)` : `Live (${Math.round(heading)}°)`)
              : (isAr ? 'عرض فلكي ثابت' : 'Fixed Azimuth')}
          </span>
        </div>
      </div>

      {/* Sensor toggle button or calibration */}
      <div className="space-y-2 pt-1">
        {!sensorActive ? (
          <button
            onClick={requestCompassPermission}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Compass className="w-4 h-4 text-[#fae3b3]" />
            <span>{isAr ? 'تفعيل مستشعر حركة الجوال للتدوير الحي' : 'Enable Live Compass Sensors'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowCalibrationHelp(!showCalibrationHelp)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 mx-auto"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'كيفية معايرة بوصلة الهاتف' : 'How to calibrate compass'}</span>
          </button>
        )}

        {/* Calibration instructions */}
        {showCalibrationHelp && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 text-right space-y-1.5 leading-relaxed">
            <span className="font-bold text-[#e6c387] block">
              {isAr ? 'تعليمات ضبط دقة البوصلة:' : 'Calibration Tips:'}
            </span>
            <p>
              {isAr
                ? '1. حرّك هاتفك في الهواء على شكل الرقم (8) بالإنجليزية عدة مرات.'
                : '1. Move your phone in a figure-8 motion in the air a few times.'}
            </p>
            <p>
              {isAr
                ? '2. ابتعد عن الأجهزة الإلكترونية والأجسام المعدنية ذات الحقول المغناطيسية.'
                : '2. Keep away from metallic surfaces and strong electromagnetic fields.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
