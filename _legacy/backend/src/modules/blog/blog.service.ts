import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  topic: z.string().min(3),
  keywords: z.array(z.string()).optional(),
  tone: z.enum(['informative', 'conversational', 'authoritative']).default('informative'),
  wordCount: z.number().min(300).max(3000).default(800),
  language: z.string().default('tr'),
});

export class BlogService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen SEO uyumlu blog yazarısın. ${input.language} dilinde yaz.`;
    const userPrompt = `Konu: ${input.topic}
Anahtar kelimeler: ${input.keywords?.join(', ') || 'yok'}
Ton: ${input.tone}
Kelime sayısı: ~${input.wordCount}

JSON formatında döndür:
{
  "title": "...",
  "metaDescription": "...",
  "content": "markdown formatında tam blog yazısı",
  "outline": ["H2 başlıkları"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt, { temperature: 0.6 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: input.topic, content: raw, metaDescription: '', outline: [] };

    await incrementUsage(userId);
    return result;
  }
}

export const blogService = new BlogService();
