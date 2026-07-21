import {
  adInputSchema,
  adOutputSchema,
  blogInputSchema,
  blogOutputSchema,
  cvInputSchema,
  cvOutputSchema,
  emailInputSchema,
  emailOutputSchema,
  logoInputSchema,
  logoOutputSchema,
  seoInputSchema,
  seoOutputSchema,
  socialInputSchema,
  socialOutputSchema,
  thumbnailInputSchema,
  thumbnailOutputSchema,
  translationInputSchema,
  translationOutputSchema,
} from '@ai-fabrikasi/shared';
import { chatJson, generateImage, ImageSize } from './provider';

const THUMBNAIL_SIZE: Record<string, ImageSize> = {
  '16:9': '1792x1024',
  '1:1': '1024x1024',
  '9:16': '1024x1792',
};

export async function runSocial(inputUnknown: unknown) {
  const input = socialInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen profesyonel bir sosyal medya uzmanısın. ${input.language} dilinde JSON üret.`,
    user: `Konu: ${input.topic}
Platform: ${input.platform}
Ton: ${input.tone}

JSON alanları: mainPost (string), hashtags (string[]), variations (string[3])`,
    schema: socialOutputSchema,
  });
}

export async function runBlog(inputUnknown: unknown) {
  const input = blogInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen SEO uyumlu blog yazarısın. ${input.language} dilinde JSON üret.`,
    user: `Konu: ${input.topic}
Anahtar kelimeler: ${input.keywords.join(', ') || 'yok'}
Ton: ${input.tone}
Hedef kelime: ~${input.wordCount}

JSON alanları: title, metaDescription, content (markdown), outline (string[])`,
    schema: blogOutputSchema,
    temperature: 0.6,
  });
}

export async function runAd(inputUnknown: unknown) {
  const input = adInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen dönüşüm odaklı reklam copywriter'ısın. ${input.language} dilinde JSON üret.`,
    user: `Ürün: ${input.product}
Kitle: ${input.audience}
Hedef: ${input.goal}
Platform: ${input.platform}

JSON alanları: headlines (string[3]), descriptions (string[3]), cta (string[3])`,
    schema: adOutputSchema,
  });
}

export async function runSeo(inputUnknown: unknown) {
  const input = seoInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen teknik SEO ve içerik stratejisi uzmanısın. ${input.language} dilinde JSON üret.`,
    user: `Konu: ${input.topic}
Hedef kelime: ${input.targetKeyword}
URL: ${input.url || 'yok'}

JSON alanları: titleTags (string[3]), metaDescriptions (string[3]), headings (string[]), keywordSuggestions (string[]), contentBrief (string)`,
    schema: seoOutputSchema,
    temperature: 0.5,
  });
}

export async function runEmail(inputUnknown: unknown) {
  const input = emailInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen e-posta pazarlama copywriter'ısın. ${input.language} dilinde JSON üret.`,
    user: `Amaç: ${input.purpose}
Kitle: ${input.audience}
Ton: ${input.tone}

JSON alanları: subjectLines (string[3]), previewText, body (markdown), cta`,
    schema: emailOutputSchema,
  });
}

export async function runTranslation(inputUnknown: unknown) {
  const input = translationInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen profesyonel çevirmensin. Anlamı koruyarak doğal çeviri yap. JSON üret.`,
    user: `Kaynak dil: ${input.sourceLang}
Hedef dil: ${input.targetLang}
Ton koru: ${input.preserveTone ? 'evet' : 'hayır'}

Metin:
${input.text}

JSON alanları: detectedSourceLang, translatedText, notes (string[])`,
    schema: translationOutputSchema,
    temperature: 0.3,
  });
}

export async function runThumbnail(inputUnknown: unknown) {
  const input = thumbnailInputSchema.parse(inputUnknown);
  const prompt = [
    `Professional ${input.platform} thumbnail image.`,
    `Topic: ${input.topic}.`,
    `Style: ${input.style}.`,
    input.brandColors ? `Brand colors: ${input.brandColors}.` : '',
    input.guidance || '',
    'High contrast, eye-catching, no text overlay, suitable for social platforms.',
  ]
    .filter(Boolean)
    .join(' ');

  const image = await generateImage(prompt, THUMBNAIL_SIZE[input.aspectRatio]);
  return thumbnailOutputSchema.parse({
    imageUrl: image.imageUrl,
    prompt,
    revisedPrompt: image.revisedPrompt,
    aspectRatio: input.aspectRatio,
    platform: input.platform,
  });
}

export async function runLogo(inputUnknown: unknown) {
  const input = logoInputSchema.parse(inputUnknown);
  const prompt = [
    `Professional brand logo design for "${input.brandName}".`,
    `Industry: ${input.industry}.`,
    `Style: ${input.style}.`,
    input.colors ? `Color palette: ${input.colors}.` : 'Clean, balanced brand colors.',
    input.iconOnly
      ? 'Icon mark only, no text, suitable as app icon.'
      : `Include brand name "${input.brandName}" as clean typography.`,
    input.guidance || '',
    'Flat vector logo on pure white background, centered, high contrast, no mockups, no 3D, no photorealistic textures.',
  ]
    .filter(Boolean)
    .join(' ');

  const image = await generateImage(prompt, '1024x1024');
  return logoOutputSchema.parse({
    imageUrl: image.imageUrl,
    prompt,
    revisedPrompt: image.revisedPrompt,
    brandName: input.brandName,
    style: input.style,
  });
}

export async function runCv(inputUnknown: unknown) {
  const input = cvInputSchema.parse(inputUnknown);
  return chatJson({
    system: `Sen kariyer danışmanı ve CV uzmanısın. ${input.language} dilinde ATS uyumlu JSON üret. HTML yazma.`,
    user: `Ad: ${input.fullName}
Hedef pozisyon: ${input.targetRole}
Deneyim: ${input.experience}
Beceriler: ${input.skills}
Eğitim: ${input.education || 'belirtilmedi'}
Ton: ${input.tone}

JSON alanları: headline, summary, experienceBullets (string[]), skillsGrouped { technical, soft }, coverLetter, atsKeywords`,
    schema: cvOutputSchema,
    temperature: 0.5,
  });
}
