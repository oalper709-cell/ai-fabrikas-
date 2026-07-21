import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  product: z.string().min(2),
  audience: z.string().min(2),
  goal: z.enum(['awareness', 'conversion', 'engagement', 'retargeting']),
  platform: z.enum(['google', 'meta', 'linkedin', 'tiktok']).default('meta'),
  language: z.string().default('tr'),
});

export class AdService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen dönüşüm odaklı reklam metni uzmanısın. ${input.language} dilinde yaz.`;
    const userPrompt = `Ürün/Hizmet: ${input.product}
Hedef kitle: ${input.audience}
Hedef: ${input.goal}
Platform: ${input.platform}

JSON formatında döndür:
{
  "headlines": ["3 kısa başlık"],
  "descriptions": ["3 açıklama"],
  "cta": ["3 CTA önerisi"],
  "variations": [{"headline": "...", "description": "...", "cta": "..."}]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { headlines: [raw], descriptions: [], cta: [], variations: [] };

    await incrementUsage(userId);
    return result;
  }
}

export const adService = new AdService();
