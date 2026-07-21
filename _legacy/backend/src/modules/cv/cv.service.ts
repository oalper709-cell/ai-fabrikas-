import { z } from 'zod';
import { chatCompletion } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  fullName: z.string().min(2),
  targetRole: z.string().min(2),
  experience: z.string().min(20),
  skills: z.string().min(3),
  education: z.string().optional(),
  tone: z.enum(['formal', 'modern', 'executive']).default('modern'),
  language: z.string().default('tr'),
});

export class CvService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const systemPrompt = `Sen kariyer danışmanı ve CV uzmanısın. ${input.language} dilinde, ATS uyumlu, ölçülebilir başarı odaklı CV içerikleri üret.`;
    const userPrompt = `Ad: ${input.fullName}
Hedef pozisyon: ${input.targetRole}
Deneyim / geçmiş: ${input.experience}
Beceriler: ${input.skills}
Eğitim: ${input.education || 'belirtilmedi'}
Ton: ${input.tone}

JSON formatında döndür:
{
  "headline": "profesyonel unvan satırı",
  "summary": "2-4 cümlelik profesyonel özet",
  "experienceBullets": ["deneyim maddeleri"],
  "skillsGrouped": { "technical": ["..."], "soft": ["..."] },
  "coverLetter": "kısa ön yazı",
  "atsKeywords": ["ATS anahtar kelimeleri"]
}`;

    const raw = await chatCompletion(systemPrompt, userPrompt, { temperature: 0.5 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : {
          headline: input.targetRole,
          summary: raw,
          experienceBullets: [],
          skillsGrouped: { technical: [], soft: [] },
          coverLetter: '',
          atsKeywords: [],
        };

    await incrementUsage(userId);
    return result;
  }
}

export const cvService = new CvService();
