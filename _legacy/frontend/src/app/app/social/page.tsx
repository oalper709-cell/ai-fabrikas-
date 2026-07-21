'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { socialApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const platforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'] as const;
const tones = ['professional', 'casual', 'humorous', 'inspirational'] as const;

export default function SocialPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<string>('instagram');
  const [tone, setTone] = useState<string>('professional');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => socialApi.generate({ topic, platform, tone }).then((r) => r.data),
    onSuccess: (payload) => { setResult(payload.data); toast.success('İçerik üretildi!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Kopyalandı!'); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">Sosyal Medya İçerik Üretici</h1>

      <div className="space-y-4 mb-8">
        <input type="text" placeholder="Konu veya açıklama..." value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />

        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${platform === p ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <button key={t} onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tone === t ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        <button onClick={() => mutation.mutate()} disabled={!topic || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}>
          {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...</> : 'Üret'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display font-600 text-lg">Ana Gönderi</h3>
              <button onClick={() => copy(result.mainPost)} className="text-brand-400 hover:text-brand-300"><Copy className="w-4 h-4" /></button>
            </div>
            <p className="text-surface-200 whitespace-pre-wrap">{result.mainPost}</p>
          </div>

          {result.hashtags?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">Hashtag&apos;ler</h3>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((h: string) => (
                  <span key={h} className="text-brand-400 text-sm cursor-pointer hover:underline" onClick={() => copy(h)}>
                    {h.startsWith('#') ? h : `#${h}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.variations?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">Varyasyonlar</h3>
              {result.variations.map((v: string, i: number) => (
                <div key={i} className="flex justify-between items-start gap-4 p-3 rounded-lg bg-surface-800/50 mb-2">
                  <p className="text-surface-200 text-sm">{v}</p>
                  <button onClick={() => copy(v)} className="text-brand-400 hover:text-brand-300 shrink-0"><Copy className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
