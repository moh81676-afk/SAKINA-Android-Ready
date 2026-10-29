import React from 'react';
import { X, Smartphone, Monitor, Download, Share, PlusSquare, CheckCircle, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  isIOS: boolean;
  isInstallable: boolean;
  onInstall: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  language,
  isIOS,
  isInstallable,
  onInstall,
}) => {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b1728] border border-white/10 p-6 shadow-2xl space-y-5 text-right">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black text-white font-thmanyah">
              {isAr ? 'تثبيت سكينة كتطبيق على جهازك' : 'Install SAKINA App'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isAr ? 'مزايا التثبيت المباشر (PWA):' : 'Key PWA Benefits:'}</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400 pr-4 list-disc">
            <li>{isAr ? 'يعمل دون اتصال بالإنترنت مع حفظ المواقيت والأذكار.' : 'Works 100% offline with cached prayer times & adhkar.'}</li>
            <li>{isAr ? 'وصول فوري من الشاشة الرئيسية بدون أشرطة المتصفح المشتتة.' : 'Standalone full-screen experience without browser chrome.'}</li>
            <li>{isAr ? 'حجم خفيف جداً يستهلك أقل من 2 ميغابايت ولا يثقل الذاكرة.' : 'Ultra lightweight (< 2MB) with battery optimization.'}</li>
          </ul>
        </div>

        {/* Platform-specific instructions */}
        {isInstallable ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'متصفحك يدعم التثبيت المباشر بنقرة واحدة على أجهزة Android و Windows و macOS.'
                : 'Your browser supports one-click direct installation.'}
            </p>
            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تثبيت التطبيق الآن' : 'Install Now'}</span>
            </button>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#e6c387] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>{isAr ? 'خطوات التثبيت على iPhone و iPad:' : 'Installation for iPhone & iPad:'}</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>{isAr ? 'اضغط على زر المشاركة (Share) في شريط سفاري السفلي.' : 'Tap the Share icon in Safari toolbar.'}</span>
                <Share className="w-3.5 h-3.5 text-sky-400 inline" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>{isAr ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).' : 'Scroll down and tap "Add to Home Screen".'}</span>
                <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>{isAr ? 'انقر على "إضافة" (Add) أعلى اليمين لبدء تشغيل سكينة كتطبيق مستقل.' : 'Tap "Add" in the top right.'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop / PC instructions */
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#e6c387] flex items-center gap-1.5">
              <Monitor className="w-4 h-4" />
              <span>{isAr ? 'التثبيت على الحاسوب (Windows / macOS / Linux):' : 'Desktop Installation:'}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'في متصفح Chrome أو Edge، انقر على أيقونة التثبيت (🖥️ أو ⬇️) الموجودة في نهاية شريط العنوان بالأعلى لتثبيت سكينة على حاسوبك كنافذة مستقلة وسريعة.'
                : 'In Chrome or Edge, click the Install icon in the address bar to run SAKINA as a dedicated desktop app.'}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all"
        >
          {isAr ? 'إغلاق' : 'Close'}
        </button>
      </div>
    </div>
  );
};
