import React, { useState } from 'react';
import { Sparkles, Globe, MapPin, Sliders, Bell, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { UserSettings, CityConfig } from '../types';
import { PRESET_CITIES, CALCULATION_METHODS } from '../data/citiesData';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: Partial<UserSettings>) => void;
  currentSettings: UserSettings;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  currentSettings,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'ar' | 'en'>(currentSettings.language);
  const [city, setCity] = useState<CityConfig>(currentSettings.city);
  const [method, setMethod] = useState<number>(currentSettings.calcMethod);
  const [notifs, setNotifs] = useState<boolean>(currentSettings.notifications.enabled);

  const isAr = lang === 'ar';

  const handleFinish = () => {
    onComplete({
      language: lang,
      city,
      calcMethod: method,
      notifications: { ...currentSettings.notifications, enabled: notifs },
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b1728] border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Step progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-emerald-500' : s < step ? 'w-3 bg-emerald-500/50' : 'w-2 bg-slate-800'
                }`}
              ></div>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="text-xs text-slate-400 hover:text-white transition-all"
          >
            {isAr ? 'تخطي والبدء فوراً' : 'Skip & Start'}
          </button>
        </div>

        {/* STEP 1: LANGUAGE */}
        {step === 1 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <Globe className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-white font-thmanyah">
                مرحباً بك في سَكينة | Welcome to SAKINA
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                اختر لغة التطبيق المفضلة / Select your preferred language
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setLang('ar')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  lang === 'ar'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-900/80'
                }`}
              >
                <div className="text-base font-thmanyah font-bold">العربية</div>
                <span className="text-[11px] text-slate-400">واجهة كاملة باليمين (RTL)</span>
              </button>

              <button
                onClick={() => setLang('en')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-900/80'
                }`}
              >
                <div className="text-base font-bold">English</div>
                <span className="text-[11px] text-slate-400">Left-to-right interface</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <MapPin className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white font-thmanyah">
                {isAr ? 'اختر مدينتك لمواقيت دقيقة' : 'Select your city'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? 'حساب أوقات الصلاة والقبلة يعتمد على خطوط الطول والعرض لمدينتك' : 'Prayer times & Qibla bearing depend on your location'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar text-right pt-2">
              {PRESET_CITIES.slice(0, 10).map((c) => {
                const isSelected = city.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setCity(c);
                      setMethod(c.method);
                    }}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{isAr ? c.name : c.nameEn}</div>
                    <span className="text-[10px] text-slate-500">{isAr ? c.country : c.countryEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CALCULATION METHOD */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <Sliders className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white font-thmanyah">
                {isAr ? 'طريقة الحساب الفلكية' : 'Calculation Method'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? 'مصر تعتمد الهيئة العامة للمساحة، والسعودية تعتمد أم القرى' : 'Official recognized bodies for astronomical prayer calculations'}
              </p>
            </div>

            <div className="space-y-2 text-right pt-2">
              {CALCULATION_METHODS.slice(0, 4).map((m) => {
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{isAr ? m.name : m.nameEn}</div>
                    <span className="text-[10px] text-slate-500 block">{m.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: NOTIFICATIONS & START */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
              <Bell className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white font-thmanyah">
                {isAr ? 'تنبيهات الصلاة والذكر' : 'Prayer & Wird Alerts'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? 'هل تود تلقي تنبيهات هادئة عند دخول أوقات الصلوات؟' : 'Enable tranquil reminders at prayer intervals?'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-200">
                  {isAr ? 'تفعيل تنبيهات الصلاة' : 'Enable prayer alerts'}
                </span>
                <input
                  type="checkbox"
                  checked={notifs}
                  onChange={(e) => setNotifs(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-400 text-right">
                {isAr ? 'يمكنك دائماً تعديل الصوت واختيار نغمة الأذان لكل صلاة من الإعدادات.' : 'You can customize tones anytime in settings.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? 'السابق' : 'Back'}</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{isAr ? 'التالي' : 'Continue'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#e6c387] text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'ابدأ تجربة سكينة' : 'Start SAKINA Experience'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
