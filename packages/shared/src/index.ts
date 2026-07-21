import { z } from 'zod';

export const MODULES = [
  'SOCIAL',
  'BLOG',
  'AD',
  'SEO',
  'TRANSLATION',
  'THUMBNAIL',
  'LOGO',
  'EMAIL',
  'CV',
] as const;

export type ModuleType = (typeof MODULES)[number];

export const MVP_MODULES: ModuleType[] = ['SOCIAL', 'BLOG', 'AD'];

/** Faz 6 soft-launch text modules */
export const PHASE6_MODULES: ModuleType[] = ['SEO', 'EMAIL', 'TRANSLATION'];

/** Faz 7 görsel + CV */
export const PHASE7_MODULES: ModuleType[] = ['THUMBNAIL', 'LOGO', 'CV'];

export const ACTIVE_MODULES: ModuleType[] = [
  ...MVP_MODULES,
  ...PHASE6_MODULES,
  ...PHASE7_MODULES,
];

export const MEMBERSHIP_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const CREDIT_COSTS: Record<ModuleType, number> = {
  SOCIAL: 1,
  BLOG: 1,
  AD: 1,
  SEO: 1,
  TRANSLATION: 1,
  EMAIL: 1,
  CV: 1,
  THUMBNAIL: 5,
  LOGO: 5,
};

export const PLANS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    monthlyCredits: 10,
    priceUsd: 0,
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    monthlyCredits: 100,
    priceUsd: 9.99,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    monthlyCredits: 1000,
    priceUsd: 29.99,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createGenerationSchema = z.object({
  module: z.enum([
    'SOCIAL',
    'BLOG',
    'AD',
    'SEO',
    'EMAIL',
    'TRANSLATION',
    'THUMBNAIL',
    'LOGO',
    'CV',
  ]),
  input: z.record(z.unknown()),
});

export const socialInputSchema = z.object({
  topic: z.string().min(3).max(500),
  platform: z.enum(['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok']),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational']),
  language: z.string().default('tr'),
});

export const blogInputSchema = z.object({
  topic: z.string().min(3).max(500),
  keywords: z.array(z.string()).max(20).default([]),
  tone: z.enum(['informative', 'conversational', 'authoritative']).default('informative'),
  wordCount: z.number().min(300).max(3000).default(800),
  language: z.string().default('tr'),
});

export const adInputSchema = z.object({
  product: z.string().min(2).max(300),
  audience: z.string().min(2).max(300),
  goal: z.enum(['awareness', 'conversion', 'engagement', 'retargeting']),
  platform: z.enum(['google', 'meta', 'linkedin', 'tiktok']).default('meta'),
  language: z.string().default('tr'),
});

export const socialOutputSchema = z.object({
  mainPost: z.string(),
  hashtags: z.array(z.string()).default([]),
  variations: z.array(z.string()).default([]),
});

export const blogOutputSchema = z.object({
  title: z.string(),
  metaDescription: z.string().default(''),
  content: z.string(),
  outline: z.array(z.string()).default([]),
});

export const adOutputSchema = z.object({
  headlines: z.array(z.string()).default([]),
  descriptions: z.array(z.string()).default([]),
  cta: z.array(z.string()).default([]),
});

export const seoInputSchema = z.object({
  topic: z.string().min(3).max(500),
  targetKeyword: z.string().min(2).max(120),
  url: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().url().optional()
  ),
  language: z.string().default('tr'),
});

export const emailInputSchema = z.object({
  purpose: z.string().min(3).max(500),
  audience: z.string().min(2).max(300),
  tone: z.enum(['professional', 'friendly', 'urgent', 'promotional']).default('professional'),
  language: z.string().default('tr'),
});

export const translationInputSchema = z.object({
  text: z.string().min(1).max(12000),
  sourceLang: z.string().min(2).max(16).default('auto'),
  targetLang: z.string().min(2).max(16),
  preserveTone: z.boolean().default(true),
});

export const seoOutputSchema = z.object({
  titleTags: z.array(z.string()).default([]),
  metaDescriptions: z.array(z.string()).default([]),
  headings: z.array(z.string()).default([]),
  keywordSuggestions: z.array(z.string()).default([]),
  contentBrief: z.string().default(''),
});

export const emailOutputSchema = z.object({
  subjectLines: z.array(z.string()).default([]),
  previewText: z.string().default(''),
  body: z.string(),
  cta: z.string().default(''),
});

export const translationOutputSchema = z.object({
  detectedSourceLang: z.string().default(''),
  translatedText: z.string(),
  notes: z.array(z.string()).default([]),
});

export const thumbnailInputSchema = z.object({
  topic: z.string().min(3).max(500),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'blog']).default('youtube'),
  style: z.enum(['bold', 'minimal', 'cinematic', 'playful']).default('bold'),
  aspectRatio: z.enum(['16:9', '1:1', '9:16']).default('16:9'),
  brandColors: z.string().max(120).optional(),
  guidance: z.string().max(500).optional(),
});

export const logoInputSchema = z.object({
  brandName: z.string().min(2).max(80),
  industry: z.string().min(2).max(120),
  style: z.enum(['minimal', 'modern', 'vintage', 'playful', 'luxury', 'tech']).default('modern'),
  colors: z.string().max(120).optional(),
  iconOnly: z.boolean().default(false),
  guidance: z.string().max(500).optional(),
});

export const cvInputSchema = z.object({
  fullName: z.string().min(2).max(120),
  targetRole: z.string().min(2).max(120),
  experience: z.string().min(20).max(8000),
  skills: z.string().min(3).max(2000),
  education: z.string().max(2000).optional(),
  tone: z.enum(['formal', 'modern', 'executive']).default('modern'),
  language: z.string().default('tr'),
});

export const imageOutputSchema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string(),
  revisedPrompt: z.string().optional(),
});

export const thumbnailOutputSchema = imageOutputSchema.extend({
  aspectRatio: z.enum(['16:9', '1:1', '9:16']),
  platform: z.string(),
});

export const logoOutputSchema = imageOutputSchema.extend({
  brandName: z.string(),
  style: z.string(),
});

export const cvOutputSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  experienceBullets: z.array(z.string()).default([]),
  skillsGrouped: z
    .object({
      technical: z.array(z.string()).default([]),
      soft: z.array(z.string()).default([]),
    })
    .default({ technical: [], soft: [] }),
  coverLetter: z.string().default(''),
  atsKeywords: z.array(z.string()).default([]),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;

export const SESSION_COOKIE = 'af_session';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80).optional(),
  organizationName: z.string().min(2).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createOrgSchema = z.object({
  name: z.string().min(2).max(80),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(MEMBERSHIP_ROLES).default('MEMBER'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
