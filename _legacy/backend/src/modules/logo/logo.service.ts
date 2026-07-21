import { z } from 'zod';
import { generateImage } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  brandName: z.string().min(2),
  industry: z.string().min(2),
  style: z.enum(['minimal', 'modern', 'vintage', 'playful', 'luxury', 'tech']).default('modern'),
  colors: z.string().optional(),
  iconOnly: z.boolean().default(false),
  guidance: z.string().optional(),
});

export class LogoService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const prompt = [
      `Professional brand logo design for "${input.brandName}".`,
      `Industry: ${input.industry}.`,
      `Style: ${input.style}.`,
      input.colors ? `Color palette: ${input.colors}.` : 'Clean, balanced brand colors.',
      input.iconOnly
        ? 'Icon mark only, no text, suitable as app icon.'
        : `Include brand name "${input.brandName}" as clean typography.`,
      input.guidance || '',
      'Flat vector logo on pure white background, centered, high contrast, no mockups, no 3D, no photorealistic textures, suitable for brand identity.',
    ]
      .filter(Boolean)
      .join(' ');

    const imageUrl = await generateImage(prompt, '1024x1024');

    await incrementUsage(userId);
    return { imageUrl, prompt, style: input.style, brandName: input.brandName };
  }
}

export const logoService = new LogoService();
