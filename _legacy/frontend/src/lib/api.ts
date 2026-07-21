import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

export const socialApi = {
  generate: (data: { topic: string; platform: string; tone: string }) =>
    api.post('/social/generate', data),
};

export const blogApi = {
  generate: (data: { topic: string; keywords?: string[]; tone?: string; wordCount?: number }) =>
    api.post('/blog/generate', data),
};

export const adApi = {
  generate: (data: { product: string; audience: string; goal: string; platform?: string }) =>
    api.post('/ad/generate', data),
};

export const seoApi = {
  generate: (data: { topic: string; keywords: string[]; contentType?: string }) =>
    api.post('/seo/generate', data),
  analyze: (data: { content: string; targetKeywords?: string[] }) =>
    api.post('/seo/analyze', data),
};

export const translationApi = {
  translate: (data: { text: string; sourceLanguage?: string; targetLanguage: string; tone?: string }) =>
    api.post('/translation/translate', data),
};

export const thumbnailApi = {
  generate: (data: { topic: string; platform?: string; style?: string; aspectRatio?: string }) =>
    api.post('/thumbnail/generate', data),
};

export const logoApi = {
  generate: (data: {
    brandName: string;
    industry: string;
    style?: string;
    colors?: string;
    iconOnly?: boolean;
    guidance?: string;
  }) => api.post('/logo/generate', data),
};

export const emailApi = {
  generate: (data: {
    purpose: string;
    subject: string;
    audience: string;
    tone?: string;
    keyPoints?: string;
    language?: string;
  }) => api.post('/email/generate', data),
};

export const cvApi = {
  generate: (data: {
    fullName: string;
    targetRole: string;
    experience: string;
    skills: string;
    education?: string;
    tone?: string;
    language?: string;
  }) => api.post('/cv/generate', data),
};

export const historyApi = {
  list: () => api.get('/history'),
  get: (id: string) => api.get(`/history/${id}`),
  remove: (id: string) => api.delete(`/history/${id}`),
};
