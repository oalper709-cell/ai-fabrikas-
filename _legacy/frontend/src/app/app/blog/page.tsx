'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function BlogPage() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('informative');
  const [wordCount, setWordCount] = useState(800);
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => blogApi.generate({
      topic,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      tone,
      wordCount,
    }).then((r) => r.data),
    onSuccess: (payload) => { setResult(payload.data); toast.success('Blog yazısı üretildi!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Kopyalandı!'); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">Blog Yazısı Üretici</h1>

      <div className="space-y-4 mb-8">
        <input type="text" placeholder="Blog konusu..." value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />

        <input type="text" placeholder="Anahtar kelimeler (virgülle ayır)" value={keywords} onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />

        <div className="flex gap-4 flex-wrap">
          <select value={tone} onChange={(e) => setTone(e.target.value)}
            className="px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white focus:border-brand-500 focus:outline-none">
            <option value="informative">Bilgilendirici</option>
            <option value="conversational">Sohbet</option>
            <option value="authoritative">Otoriter</option>
          </select>

          <select value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}
            className="px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white focus:border-brand-500 focus:outline-none">
            <option value={300}>~300 kelime</option>
            <option value={800}>~800 kelime</option>
            <option value={1500}>~1500 kelime</option>
            <option value={3000}>~3000 kelime</option>
          </select>
        </div>

        <button onClick={() => mutation.mutate()} disabled={!topic || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}>
          {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...</> : 'Blog Yaz'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-700">{result.title}</h2>
            <button onClick={() => copy(result.content)} className="text-brand-400 hover:text-brand-300"><Copy className="w-5 h-5" /></button>
          </div>
          {result.metaDescription && (
            <p className="text-surface-200/60 text-sm italic mb-4">{result.metaDescription}</p>
          )}
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
