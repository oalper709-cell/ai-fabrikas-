import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  purpose: z.enum(['sales', 'newsletter', 'followup', 'welcome', 'support', 'announcement']),
  subject: z.string().min(3),
  audience: z.string().min(2),
  tone: z.enum(['formal', 'friendly', 'persuasive', 'urgent']).default('friendly'),
  keyPoints: z.string().optional(),
  language: z.string().default('tr'),
});

export class EmailService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen profesyonel e-posta copywriter'ısın. ${input.language} dilinde, yüksek açılma ve tıklama oranı hedefleyen e-postalar yazarsın.`;
    const userPrompt = `Amaç: ${input.purpose}
Konu / başlık fikri: ${input.subject}
Hedef kitle: ${input.audience}
Ton: ${input.tone}
Ana noktalar: ${input.keyPoints || 'belirtilmedi'}

JSON formatında döndür:
{
  "subjectLines": ["3 konu satırı önerisi"],
  "previewText": "inbox önizleme metni",
  "body": "e-posta gövdesi (paragraflı)",
  "cta": "ana CTA metni",
  "variations": ["2 alternatif kısa gövde"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { subjectLines: [input.subject], previewText: '', body: raw, cta: '', variations: [] };

    await incrementUsage(userId);
    return result;
  }
}

export const emailService = new EmailService();
