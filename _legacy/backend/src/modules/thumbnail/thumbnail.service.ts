import { z } from 'zod';
import { generateImage } from '../../services/openai.service';
import { incrementUsage } from '../../middleware/usage.middleware';

const schema = z.object({
  topic: z.string().min(3),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'blog']).default('youtube'),
  style: z.enum(['bold', 'minimal', 'cinematic', 'playful']).default('bold'),
  aspectRatio: z.enum(['16:9', '1:1', '9:16']).default('16:9'),
  brandColors: z.string().optional(),
  guidance: z.string().optional(),
});

const SIZE_MAP: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
  '16:9': '1792x1024',
  '1:1': '1024x1024',
  '9:16': '1024x1792',
};

export class ThumbnailService {
  async generate(userId: string, data: z.infer<typeof schema>) {
    const input = schema.parse(data);

    const prompt = `Professional ${input.platform} thumbnail image. Topic: ${input.topic}. Style: ${input.style}. ${input.brandColors ? `Brand colors: ${input.brandColors}.` : ''} ${input.guidance || ''} High contrast, eye-catching, no text overlay, photorealistic or illustrated as appropriate.`;

    const imageUrl = await generateImage(prompt, SIZE_MAP[input.aspectRatio]);

    await incrementUsage(userId);
    return { imageUrl, prompt, aspectRatio: input.aspectRatio };
  }
}

export const thumbnailService = new ThumbnailService();
