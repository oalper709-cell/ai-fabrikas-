import OpenAI from 'openai';
import { z } from 'zod';

let client: OpenAI | null = null;

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY yapılandırılmamış');
  }
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function chatJson<T>(params: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
}): Promise<T> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: params.temperature ?? 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
  });

  const raw = response.choices[0]?.message?.content || '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI JSON parse hatası');
  }
  return params.schema.parse(parsed);
}

export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';

export async function generateImage(prompt: string, size: ImageSize = '1024x1024') {
  const openai = getOpenAI();
  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
    prompt,
    n: 1,
    size,
    quality: 'standard',
  });

  const item = response.data?.[0];
  const imageUrl = item?.url;
  if (!imageUrl) throw new Error('Görsel URL alınamadı');

  return {
    imageUrl,
    revisedPrompt: item.revised_prompt || undefined,
  };
}
