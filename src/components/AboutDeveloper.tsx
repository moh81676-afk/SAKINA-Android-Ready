import React from 'react';
import {
  Code2,
  Cpu,
  ShieldCheck,
  Sparkles,
  Mail,
  Heart,
  Layers,
  FileText,
  Compass,
  CheckCircle2,
  ExternalLink,
  UserCheck,
} from 'lucide-react';

interface AboutDeveloperProps {
  language: 'ar' | 'en';
  onNavigateHome?: () => void;
}

export const AboutDeveloper: React.FC<AboutDeveloperProps> = ({
  language,
  onNavigateHome,
}) => {
  const isAr = language === 'ar';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 pb-12 text-left" dir="ltr">
      {/* 1. Main Header Card: Developer Identity */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1728] to-emerald-950/40 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e6c387]/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar Icon */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 via-slate-800 to-[#e6c387]/40 p-0.5 shadow-xl">
              <div className="w-full h-full rounded-[22px] bg-[#091322] flex flex-col items-center justify-center text-white">
                <Cpu className="w-10 h-10 md:w-12 md:h-12 text-[#e6c387]" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 mt-1">
                  AI ENGINEER
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#091322] flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Core Identity Details */}
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#e6c387]" />
              <span>About the Developer</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">
              ENG. Mohamed Ali Shabl Zaho
            </h1>

            <p className="text-sm font-mono text-[#fae3b3] font-bold">
              AI Engineer
            </p>

            {/* Developer Credit Tag */}
            <div className="pt-2">
              <div className="inline-block p-2.5 px-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 font-sans">
                <span className="text-[#e6c387] font-bold mr-1">Credit:</span>
                Designed and developed by AI Engineer Mohamed Ali Shabl Zaho.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Biography & About the Developer Section */}
      <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white font-sans">About the Developer</h2>
          </div>
          <span className="text-[10px] font-mono text-[#fae3b3] bg-[#e6c387]/10 px-2.5 py-0.5 rounded-full border border-[#e6c387]/20 font-bold">
            EN
          </span>
        </div>

        <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
          I am Mohamed Ali Shabl Zaho, an AI Engineer and the developer of SAKINA. My goal is to use technology and artificial intelligence to build meaningful digital experiences that combine simplicity, accuracy, and innovation, with a strong focus on design quality, usability, and user privacy.
        </p>

        <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#e6c387]"></span>
          <span className="font-medium">SAKINA Digital Islamic Companion</span>
        </div>
      </div>

      {/* 3. Core Principles & Philosophy */}
      <div className="p-6 rounded-3xl bg-[#091322] border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e6c387]" />
          <span>Core Engineering & Design Pillars</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              Simplicity & Reverence
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Distraction-free interface with calm palettes fostering peace, tranquility, and focus.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#e6c387]/10 text-[#fae3b3] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              Accuracy & Verification
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verified astronomical prayer time calculations and authentic audio recordings without fake placeholders.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              User Privacy & Innovation
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Local device persistence, zero telemetry tracking, and seamless cross-platform PWA support.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Official Copyright and Intellectual Property Notice */}
      <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-[#e6c387]/10 text-[#fae3b3] border border-[#e6c387]/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans">
              Copyright & Intellectual Property Notice
            </h3>
            <p className="text-xs text-slate-400">
              Legal documentation of project authorship and third-party terms
            </p>
          </div>
        </div>

        {/* Legal Notices */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Primary English Copyright Notice */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <p className="font-mono text-[#fae3b3] font-bold text-[11px]">
              © 2026 Mohamed Ali Shabl Zaho. All rights reserved.
            </p>
            <p className="font-sans text-slate-200">
              SAKINA is a digital project designed and developed by Mohamed Ali Shabl Zaho. The original source code, designs, and creative materials produced by the developer are subject to applicable intellectual property rights and laws.
            </p>
            <p className="font-sans text-slate-400 text-[11px]">
              Third-party rights remain with their respective owners, including audio recordings, fonts, software libraries, and external services, subject to their applicable licenses and terms.
            </p>
          </div>

          {/* Secondary Arabic Copyright Notice */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2 text-right" dir="rtl">
            <p className="font-mono text-[#fae3b3] font-bold text-[11px]">
              © 2026 محمد علي شبل زهو. جميع الحقوق محفوظة.
            </p>
            <p className="font-thmanyah text-slate-300">
              تطبيق سَكينة هو مشروع رقمي تم تصميمه وتطويره بواسطة محمد علي شبل زهو. تخضع الشيفرة البرمجية الأصلية والتصميمات والمحتويات الإبداعية التي أنشأها المطوّر لحقوق الملكية الفكرية المطبقة وفقًا للقانون.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Verified Tech Stack & Third-Party Attributions */}
      <div className="p-6 rounded-3xl bg-[#091322] border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Verified Technology Stack & Libraries</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Frontend</span>
            <p className="font-bold text-white">React 19 & Vite</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Styling & Fonts</span>
            <p className="font-bold text-white">Tailwind CSS & Fonts</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Audio Engine</span>
            <p className="font-bold text-white">HTML5 & Web Audio API</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Platform</span>
            <p className="font-bold text-white">Installable PWA</p>
          </div>
        </div>
      </div>

      {/* 6. Direct Contact Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Direct Developer Contact:
            </span>
            <a
              href="mailto:mohammed.ali.shabl1@gmail.com"
              className="text-xs font-mono font-bold text-[#fae3b3] hover:text-white hover:underline transition-colors"
            >
              mohammed.ali.shabl1@gmail.com
            </a>
          </div>
        </div>

        <a
          href="mailto:mohammed.ali.shabl1@gmail.com"
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md active:scale-95"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Send Message to Developer</span>
        </a>
      </div>
    </div>
  );
};


