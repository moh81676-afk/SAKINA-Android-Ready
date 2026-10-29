import React, { useState } from 'react';
import { Bot, Send, Sparkles, BookOpen, ShieldCheck, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AICompanionProps {
  language: 'ar' | 'en';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sourceBadge?: string;
  isFallback?: boolean;
}

const PRESET_TOPICS = [
  {
    qAr: 'كيف أبدأ ورداً يومياً خفيفاً مستمراً من الأذكار؟',
    qEn: 'How do I start a gentle, consistent daily wird?',
    source: 'المنهج النبوي في دوام العمل',
    answerAr: `خير الذكر ما داوم عليه العبد ولو قلّ؛ قال النبي ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ» (متفق عليه).

الخطة المقترحة لبداية مريحة وراسخة:
1. الصباح: ابدأ بسيد الاستغفار + «باسم الله الذي لا يضر مع اسمه شيء» (3 مرات).
2. المساء: آية الكرسي + «أعوذ بكلمات الله التامات من شر ما خلق» (3 مرات).
3. دبر كل صلاة: الاستغفار ثلاثاً + التسبيح والتحميد والتكبير (33 مرة).
4. النوم: باسمك ربي وضعت جنبي + قراءة المعوذات.

نصيحة سكينة: لا تبدأ بأوراد طويلة تشق عليك؛ بل ثبّت هذه البداية لأسبوعين حتى تستقر في قلبك، ثم زِد ما تشاء براحة وانشراح.`,
    answerEn: 'The best remembrance is that which is performed consistently even if small. Begin with Sayyid al-Istighfar in the morning, Ayat al-Kursi in the evening, and tasbih after prayers.',
  },
  {
    qAr: 'ما هي طريقة حساب مواقيت الصلاة المعتمدة في مصر؟',
    qEn: 'How are prayer times calculated in Egypt?',
    source: 'الهيئة المصرية العامة للمساحة',
    answerAr: `تعتمد جمهورية مصر العربية رسمياً الحسابات الصادرة عن «الهيئة المصرية العامة للمساحة»:
- زاوية انخفاض الشمس وقت الفجر: 19.5 درجة تحت الأفق الشرقي.
- زاوية انخفاض الشمس وقت العشاء: 17.5 درجة تحت الأفق الغربي.
- وقت الظهر: عند زوال الشمس عن كبد السماء (ميلانها نحو الغرب).
- وقت العصر: وفق مذهب الجمهور (الشافعي، المالكي، الحنبلي) عندما يصير ظل كل شيء مثله مضافاً إليه ظل الزوال.
- وقت المغرب: عند اكتمال غروب قرص الشمس تحت الأفق.

تطبيق "سكينة" يضبط طريقة الهيئة المصرية (Method 5) كمعيار افتراضي عند اختيار مصر، مع إمكانية التعديل اليدوي بالدقائق.`,
    answerEn: 'Egypt officially follows the Egyptian General Authority of Survey (Fajr angle 19.5°, Isha angle 17.5°, and Shafi’i standard for Asr).',
  },
  {
    qAr: 'ما هي الأدعية النبوية الثابتة لتفريج الكرب وزوال الهم؟',
    qEn: 'What are the authentic hadith duas for removing distress?',
    source: 'صحيح البخاري وصحيح مسلم والترمذي',
    answerAr: `من أصح ما ثبت عن النبي ﷺ عند الكرب والشدائد:

1. دعاء الكرب العظيم:
«لاَ إِلَهَ إِلاَّ اللَّهُ الْعَظِيمُ الْحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ» (صحيح البخاري 6346 ومسلم 2730).

2. دعاء ذي النون في بطن الحوت:
«لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ» (رواه الترمذي وصححه الألباني، قال ﷺ: لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له).

3. دعاء التيسير المأثور:
«اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الحَزْنَ إِذَا شِئْتَ سَهْلاً» (صحيح ابن حبان 974).`,
    answerEn: 'Authentic prophetic prayers include the Du’a of Distress in Bukhari & Muslim, and the supplication of Yunus (La ilaha illa Anta subhanaka...).',
  },
  {
    qAr: 'كيف أنظم ساعات العمل والدراسة حول أوقات الصلاة؟',
    qEn: 'How to structure study & work hours around prayer?',
    source: 'فقه إيقاع اليوم وبركة الأوقات',
    answerAr: `تنظيم اليوم على إيقاع الصلاة يحول عبادتك إلى محطات تجديد ذهني وبدني:

1. الصباح الباكر (بعد الفجر إلى الظهر): كتلة التركيز العميق الأولى (3 إلى 4 ساعات). هذه ذروة هرمون الكورتيزول والصفاء الذهني، خصصها للمهام الصعبة والدراسة المعقدة.
2. ما بين الظهر والعصر: مهام خفيفة أو قيلولة 20 دقيقة (تطبيقاً للهدي النبوي واستعادة الطاقة).
3. ما بين العصر والمغرب: الاجتماعات، المراسلات، أو التمارين الرياضية قبل الغروب.
4. المساء (المغرب والعشاء): الاسترخاء، صلة الرحم، والهدوء تمهيداً للنوم المبكر.`,
    answerEn: 'Structure work into dedicated focus blocks: Deep work after dawn until Dhuhr, light tasks & power nap before Asr, and family reflection in the evening.',
  },
];

export const AICompanion: React.FC<AICompanionProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isAr
        ? 'مرحباً بك في «رفيق سكينة». أنا هنا لمساعدتك في ترتيب وردك اليومي، البحث عن الأدعية المأثورة الموثقة، وشرح حسابات مواقيت الصلاة وفق الضوابط الشرعية الصارمة.'
        : 'Welcome to SAKINA Companion. I am here to assist with daily remembrance routines, verified prophetic supplications, and prayer calculation principles.',
      sourceBadge: isAr ? 'ضوابط المحتوى المحقق' : 'Verified Knowledge Engine',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendPrompt = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    // First check if this matches any curated verified FAQ directly
    const matchingPreset = PRESET_TOPICS.find(
      (p) => p.qAr.includes(text) || text.includes(p.qAr) || (p.qEn && p.qEn.toLowerCase().includes(text.toLowerCase()))
    );

    if (matchingPreset) {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: isAr ? matchingPreset.answerAr : matchingPreset.answerEn,
          sourceBadge: matchingPreset.source,
        };
        setMessages((prev) => [...prev, replyMsg]);
        setLoading(false);
      }, 500);
      return;
    }

    // Try calling backend Gemini endpoint
    try {
      const response = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data && data.available && data.reply) {
        const replyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.reply,
          sourceBadge: isAr ? 'رفيق سكينة الذكي' : 'SAKINA Companion',
        };
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        // Graceful authentic Islamic knowledge fallback
        const replyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: isAr
            ? `«احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلاَ تَعْجَزْ» (صحيح مسلم 2664).
بخصوص سؤالك: نوصيك بالرجوع إلى الأذكار والأدعية الثابتة في القرآن الكريم وصحيحي البخاري ومسلم المتاحة في تبويب "الورد" ومكتبة "الأذكار"، حيث حُرص فيها على عزو كل ذكر لمصدره المعتمد.`
            : `Prophetic guidance: "Strive for that which benefits you, seek the help of Allah, and do not despair." (Sahih Muslim 2664). Please refer to the verified Adhkar library for sourced prayers.`,
          sourceBadge: isAr ? 'الموسوعة الموثقة' : 'Verified Database',
          isFallback: true,
        };
        setMessages((prev) => [...prev, replyMsg]);
      }
    } catch {
      // Local graceful response
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: isAr
          ? '«وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ» (سورة غافر: 60). للاستفادة الكاملة من أوراد اليوم والصلوات، يمكنك الاطلاع على المقترحات الجاهزة أدناه.'
          : 'Quran: "And your Lord says: Call upon Me; I will respond to you." (40:60). Explore our curated topics below.',
        sourceBadge: isAr ? 'مستودع سكينة' : 'Knowledge Bank',
        isFallback: true,
      };
      setMessages((prev) => [...prev, replyMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white font-thmanyah">
                {isAr ? 'رفيق سكينة' : 'SAKINA Companion'}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {isAr ? 'معتمد وموثق' : 'Traceable Sources'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr
                ? 'مرشدك في بناء الورد اليومي وفهم حسابات الصلاة والتيسير الروحي'
                : 'Spiritual guidance for daily wird, prayer calculations, and authentic supplications'}
            </p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isAr
              ? 'ضوابط سكينة: يُلزم المساعد بالاقتباس من نصوص القرآن وصحيح السنة وعزوها، ولا يُصدر فتاوى خلافية خاصة.'
              : 'Reliability: Quotes from verified Quran and Sahih Sunnah with source references.'}
          </span>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-400 px-1">
          {isAr ? 'أسئلة وتوجيهات مقترحة:' : 'Curated Topics:'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRESET_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(isAr ? topic.qAr : topic.qEn)}
              className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 text-xs font-medium text-slate-200 text-right transition-all flex items-center justify-between gap-2 group"
            >
              <span>{isAr ? topic.qAr : topic.qEn}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#e6c387] shrink-0 opacity-70 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="space-y-3 min-h-[260px] max-h-[440px] overflow-y-auto no-scrollbar p-3 rounded-2xl bg-slate-900/60 border border-white/5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sourceBadge && (
              <span className="text-[10px] text-[#e6c387] mb-1 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {msg.sourceBadge}
              </span>
            )}
            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium rounded-br-sm'
                  : 'bg-black/40 text-slate-100 border border-white/5 rounded-bl-sm font-thmanyah'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-black/30 rounded-2xl w-fit">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>{isAr ? 'رفيق سكينة يراجع المصادر المعتمدة...' : 'Searching verified references...'}</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputPrompt);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={isAr ? 'اسأل رفيق سكينة عن ورد، ذكر، أو مسألة في المواقيت...' : 'Ask about a daily wird, supplication, or prayer time...'}
          className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold transition-all shadow-md active:scale-95"
          title={isAr ? 'إرسال' : 'Send'}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
