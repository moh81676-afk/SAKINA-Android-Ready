import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Lightweight health check for hosting providers.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', app: 'SAKINA' });
});

// API route for "رفيق سكينة" (SAKINA Companion)
app.post('/api/ai/companion', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.json({
        available: false,
        reply: null,
        message: 'No active GEMINI_API_KEY configured. Running in verified knowledge-base mode.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `أنت "رفيق سكينة" (SAKINA Spiritual Companion)، مساعد إسلامي معرفي راقٍ ووقور، مصاحب لتطبيق "سَكينة | SAKINA" وشعاره "يومك على إيقاع الصلاة".
مهمتك بدقة:
1. مساعدة المسلم في بناء وِرد يومي متزن من الأذكار دون مشقة ولا ابتداع.
2. إيجاد الأدعية المأثورة الموثقة من القرآن وصحيح السنة لحالات الحياة المختلفة (تفريج الكرب، الرزق، قضاء الدين، الاستخارة، شكر النعمة، أدعية الصباح والمساء، أذكار النوم).
3. شرح كيفية حساب مواقيت الصلاة (طريقة الهيئة المصرية العامة للمساحة، أم القرى، رابطة العالم الإسلامي، زوايا الفجر والعشاء، مذهب العصر للجمهور مقابل الحنفي، والمواقع ذات خطوط العرض العالية).
4. مساعدة المستخدم في تنظيم يومه وأعماله حول مواقيت الصلاة (إيقاع اليوم).

الضوابط الصارمة والمصداقية:
- لا تخترع إطلاقاً أي آية أو حديث أو فضل أو عدد لم يثبت في كتب السنة المعتمدة.
- اذكر عزو الحديث دائماً (مثل: رواه البخاري، رواه مسلم، في صحيح سنن أبي داود).
- ميّز دائماً بين النص النبوي/القرآني المروي وبين الشرح الإنساني.
- لا تصدر فتاوى تحريم أو تحليل في نوازل فقهية خلافية معقدة؛ بل وضح المسألة بأدب وعزوها لأقوال أهل العلم وأحِل لجهات الإفتاء الرسمية.
- الأسلوب: رصين، مطمئن، يعزز السكينة والقرب من الله دون تكلف ولا عبارات مبتذلة.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 8000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    return res.json({
      available: true,
      provider: 'gemini',
      reply: response.text,
    });
  } catch (error: any) {
    console.warn('Gemini companion fallback triggered:', error?.message);
    return res.json({
      available: false,
      error: error?.message || 'Error communicating with companion',
    });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAKINA server listening on 0.0.0.0:${PORT}`);
  });
}

start();
