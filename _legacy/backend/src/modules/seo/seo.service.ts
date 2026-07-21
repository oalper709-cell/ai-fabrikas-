import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const generateSchema = z.object({
  topic: z.string().min(3),
  keywords: z.array(z.string()).min(1),
  contentType: z.enum(['article', 'landing', 'product']).default('article'),
  language: z.string().default('tr'),
});

const analyzeSchema = z.object({
  content: z.string().min(50),
  targetKeywords: z.array(z.string()).optional(),
});

export class SeoService {
  async generate(userId: string, data: z.infer<typeof generateSchema>) {
    const input = generateSchema.parse(data);

    const systemPrompt = `Sen SEO uzmanısın. ${input.language} dilinde SEO uyumlu içerik üret.`;
    const userPrompt = `Konu: ${input.topic}
Anahtar kelimeler: ${input.keywords.join(', ')}
İçerik tipi: ${input.contentType}

JSON formatında döndür:
{
  "title": "SEO başlığı (60 karakter)",
  "metaDescription": "meta açıklama (155 karakter)",
  "content": "SEO uyumlu içerik",
  "keywords": ["kullanılan anahtar kelimeler"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: input.topic, content: raw, metaDescription: '', keywords: input.keywords };

    await incrementUsage(userId);
    return result;
  }

  async analyze(userId: string, data: z.infer<typeof analyzeSchema>) {
    const input = analyzeSchema.parse(data);

    const systemPrompt = 'Sen SEO analiz uzmanısın. İçeriği analiz et ve iyileştirme önerileri sun.';
    const userPrompt = `İçerik:\n${input.content}\n\nHedef kelimeler: ${input.targetKeywords?.join(', ') || 'belirtilmedi'}

JSON formatında döndür:
{
  "bullets": ["güçlü yönler"],
  "risks": ["zayıf yönler / riskler"],
  "recommendations": ["iyileştirme önerileri"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { bullets: [], risks: [], recommendations: [raw] };

    await incrementUsage(userId);
    return result;
  }
}

export const seoService = new SeoService();
