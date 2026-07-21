'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const goals = ['awareness', 'conversion', 'engagement', 'retargeting'] as const;
const adPlatforms = ['google', 'meta', 'linkedin', 'tiktok'] as const;

export default function AdPage() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState<string>('conversion');
  const [platform, setPlatform] = useState<string>('meta');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => adApi.generate({ product, audience, goal, platform }).then((r) => r.data),
    onSuccess: (payload) => { setResult(payload.data); toast.success('Reklam metni üretildi!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Kopyalandı!'); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">Reklam Metni Üretici</h1>

      <div className="space-y-4 mb-8">
        <input type="text" placeholder="Ürün veya hizmet..." value={product} onChange={(e) => setProduct(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />

        <input type="text" placeholder="Hedef kitle..." value={audience} onChange={(e) => setAudience(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />

        <div className="flex flex-wrap gap-2">
          {goals.map((g) => (
            <button key={g} onClick={() => setGoal(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${goal === g ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {adPlatforms.map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${platform === p ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>

        <button onClick={() => mutation.mutate()} disabled={!product || !audience || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}>
          {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...</> : 'Üret'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          {result.headlines?.map((h: string, i: number) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-surface-800/50">
              <span className="font-display font-600">{h}</span>
              <button onClick={() => copy(h)} className="text-brand-400"><Copy className="w-4 h-4" /></button>
            </div>
          ))}
          {result.descriptions?.map((d: string, i: number) => (
            <div key={i} className="flex justify-between items-start gap-4 p-3 rounded-lg bg-surface-800/30">
              <p className="text-surface-200 text-sm">{d}</p>
              <button onClick={() => copy(d)} className="text-brand-400 shrink-0"><Copy className="w-4 h-4" /></button>
            </div>
          ))}
          {result.cta?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {result.cta.map((c: string, i: number) => (
                <span key={i} onClick={() => copy(c)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-400 text-sm cursor-pointer hover:bg-brand-600/30">
                  {c}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
