# 🌙 SAKINA | سَكينة — Android Ready

> **Let your day flow with the rhythm of prayer.** — يومك على إيقاع الصلاة

## 📌 Project Summary

**SAKINA** is a privacy-first Islamic companion app that brings the essentials of a Muslim's day into one calm, installable experience. It combines verified prayer times, a live Prayer Ring, authenticated daily adhkar, a real-time Qibla compass, a Hijri calendar, and a daily rhythm planner. An AI companion, powered by the Gemini API on the server, helps users build a balanced daily wird and find well-documented supplications. It is instructed to cite its sources and never invent a verse or hadith. When no API key is configured, it falls back to a built-in verified knowledge base.

**Key features**

- 🕌 Accurate prayer times (Egyptian General Authority of Survey, Umm Al-Qura, ISNA, Muslim World League) with a live prayer ring and timeline
- 📿 Authenticated adhkar library, daily wird, and digital tasbih
- 🧭 Qibla compass
- 🔔 Adhan library, 15-minute pre-prayer alerts, and periodic reminders to send blessings upon the Prophet ﷺ
- 📅 Hijri calendar and a daily rhythm planner
- 🤖 AI companion with source-cited answers
- 📱 Installable PWA (manifest, service worker, offline caching), ready for Android
- 🔒 Local-first data: settings stay on the device, with no tracking or telemetry

**Android-ready setup**

The project includes everything needed to deploy and install it on Android: a `render.yaml` Blueprint for free hosting on Render, a `/health` check endpoint, and a step-by-step guide ([DEPLOY_ANDROID_AR.md](DEPLOY_ANDROID_AR.md), in Arabic). It covers deploying, installing the PWA on a phone, and optionally wrapping it as an APK via Trusted Web Activity (PWABuilder or Bubblewrap).

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide icons, Motion
- **Build & Dev:** Vite, ESBuild, tsx
- **Server:** Express (`server.ts`) integrated with Vite middleware, with a server-side Gemini API endpoint
- **Audio:** HTML5 Audio streaming and Web Audio API
- **PWA:** Web App Manifest and Service Worker offline caching
- **Persistence:** Client-side local storage

## 🚀 Getting Started

```bash
npm install
cp .env.example .env   # add your GEMINI_API_KEY (optional)
npm run dev
```

The app runs at `http://localhost:3000`. Without a `GEMINI_API_KEY`, the AI companion falls back to the built-in verified knowledge base. Never commit your API key; set it as an environment variable on your host.

---

## 👨‍💻 Developer

- **Name:** Mohamed Ali Shabl Zaho | محمد علي شبل زهو
- **Title:** AI Engineer | مهندس ذكاء اصطناعي
- **Email:** [mohammed.ali.shabl1@gmail.com](mailto:mohammed.ali.shabl1@gmail.com)
- **LinkedIn:** [mohamedali-zaho](https://linkedin.com/in/mohamedali-zaho)

> “I am Mohamed Ali Shabl Zaho, an AI Engineer and the developer of SAKINA. My goal is to use technology and artificial intelligence to build meaningful digital experiences that combine simplicity, accuracy, and innovation, with a strong focus on design quality, usability, and user privacy.”

## 📜 Third-Party Assets & Attributions

Third-party rights remain with their respective owners, subject to their applicable licenses:

1. **Arabic Typography:** Thmanyah Sans Arabic font family.
2. **Icons:** Lucide React icons (ISC License).
3. **Astronomical Calculations:** Adhan calculation algorithms (Egyptian General Authority of Survey, Umm Al-Qura, ISNA, Muslim World League).
4. **Adhan Audio Recordings:** the Holy Makkah Sanctuary Adhan (Sheikh Ali Ahmed Mulla) and a historic Cairo Adhan broadcast.

## ⚖️ Copyright Notice

```
© 2026 Mohamed Ali Shabl Zaho. All rights reserved.

SAKINA is a digital project designed and developed by Mohamed Ali Shabl Zaho.
The original source code, designs, and creative materials produced by the
developer are subject to applicable intellectual property rights and laws.

Third-party rights remain with their respective owners, including audio
recordings, fonts, software libraries, and external services, subject to
their applicable licenses and terms.
```
