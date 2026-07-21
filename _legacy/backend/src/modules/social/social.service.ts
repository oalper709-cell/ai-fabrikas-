import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  topic: z.string().min(3),
  platform: z.enum(['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok']),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational']),
  language: z.string().default('tr'),
});

export class SocialService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen profesyonel bir sosyal medya içerik uzmanısın. ${input.language} dilinde içerik üret.`;
    const userPrompt = `Konu: ${input.topic}
Platform: ${input.platform}
Ton: ${input.tone}

Şunları üret:
1. Ana gönderi metni (platforma uygun uzunlukta)
2. 5-10 hashtag
3. 3 alternatif varyasyon

JSON formatında döndür:
{
  "mainPost": "...",
  "hashtags": ["..."],
  "variations": ["...", "...", "..."]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { mainPost: raw, hashtags: [], variations: [] };

    await incrementUsage(userId);
    return result;
  }
}

export const socialService = new SocialService();
