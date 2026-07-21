import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  text: z.string().min(10),
  sourceLanguage: z.string().default('auto'),
  targetLanguage: z.string().min(2),
  tone: z.enum(['formal', 'casual', 'marketing']).default('formal'),
});

export class TranslationService {
  async translate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen profesyonel çevirmensin. ${input.tone} tonunda çeviri yap.`;
    const userPrompt = `Kaynak dil: ${input.sourceLanguage}
Hedef dil: ${input.targetLanguage}

Metin:
${input.text}

JSON formatında döndür:
{
  "translatedText": "çevrilmiş metin",
  "detectedLanguage": "algılanan dil",
  "notes": ["kültürel uyarlama notları varsa"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt, { temperature: 0.3 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { translatedText: raw, detectedLanguage: input.sourceLanguage, notes: [] };

    await incrementUsage(userId);
    return result;
  }
}

export const translationService = new TranslationService();
