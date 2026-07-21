'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { thumbnailApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const platforms = ['youtube', 'instagram', 'tiktok', 'blog'] as const;
const styles = ['bold', 'minimal', 'cinematic', 'playful'] as const;

export default function ThumbnailPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<string>('youtube');
  const [style, setStyle] = useState<string>('bold');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => thumbnailApi.generate({ topic, platform, style, aspectRatio }).then((r) => r.data),
    onSuccess: (p) => { setResult(p.data); toast.success('Thumbnail üretildi!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">Thumbnail Üretici</h1>

      <div className="space-y-4 mb-8">
        <input type="text" placeholder="Görsel konusu..." value={topic} onChange={(e) => setTopic(e.target.value)}
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
          {styles.map((s) => (
            <button key={s} onClick={() => setStyle(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${style === s ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {['16:9', '1:1', '9:16'].map((r) => (
            <button key={r} onClick={() => setAspectRatio(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${aspectRatio === r ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>

        <button onClick={() => mutation.mutate()} disabled={!topic || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}>
          {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...</> : 'Görsel Üret'}
        </button>
      </div>

      {result?.imageUrl && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          <img src={result.imageUrl} alt="Thumbnail" className="w-full rounded-lg mb-4" />
          <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition">
            <Download className="w-4 h-4" /> İndir
          </a>
        </motion.div>
      )}
    </div>
  );
}
