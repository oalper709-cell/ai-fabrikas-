'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { seoApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function SeoPage() {
  const [tab, setTab] = useState<'generate' | 'analyze'>('generate');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<any>(null);

  const genMutation = useMutation({
    mutationFn: () => seoApi.generate({
      topic,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    }).then((r) => r.data),
    onSuccess: (p) => { setResult(p.data); toast.success('SEO içerik üretildi!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata'),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => seoApi.analyze({
      content,
      targetKeywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    }).then((r) => r.data),
    onSuccess: (p) => { setResult(p.data); toast.success('Analiz tamamlandı!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata'),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Kopyalandı!'); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">SEO Aracı</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => { setTab('generate'); setResult(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'generate' ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60'}`}>
          İçerik Üret
        </button>
        <button onClick={() => { setTab('analyze'); setResult(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'analyze' ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60'}`}>
          Analiz Et
        </button>
      </div>

      {tab === 'generate' ? (
        <div className="space-y-4 mb-8">
          <input type="text" placeholder="Konu..." value={topic} onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />
          <input type="text" placeholder="Anahtar kelimeler (virgülle ayır)" value={keywords} onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />
          <button onClick={() => genMutation.mutate()} disabled={!topic || !keywords || genMutation.isPending}
            className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'var(--brand-gradient)' }}>
            {genMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...</> : 'SEO İçerik Üret'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          <textarea placeholder="Analiz edilecek içerik..." value={content} onChange={(e) => setContent(e.target.value)} rows={6}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none resize-none" />
          <input type="text" placeholder="Hedef anahtar kelimeler (opsiyonel)" value={keywords} onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none" />
          <button onClick={() => analyzeMutation.mutate()} disabled={content.length < 50 || analyzeMutation.isPending}
            className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'var(--brand-gradient)' }}>
            {analyzeMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Analiz ediliyor...</> : 'Analiz Et'}
          </button>
        </div>
      )}

      {result && tab === 'generate' && result.content && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-700">{result.title}</h2>
            <button onClick={() => copy(result.content)} className="text-brand-400"><Copy className="w-5 h-5" /></button>
          </div>
          {result.metaDescription && <p className="text-surface-200/60 text-sm italic mb-4">{result.metaDescription}</p>}
          <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{result.content}</ReactMarkdown></div>
        </motion.div>
      )}

      {result && tab === 'analyze' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40">
          {result.bullets?.length > 0 && (
            <div><h3 className="font-display font-600 text-emerald-400 mb-2">Güçlü Yönler</h3>
              <ul className="space-y-1">{result.bullets.map((b: string, i: number) => <li key={i} className="text-surface-200 text-sm">• {b}</li>)}</ul>
            </div>
          )}
          {result.risks?.length > 0 && (
            <div><h3 className="font-display font-600 text-amber-400 mb-2">Riskler</h3>
              <ul className="space-y-1">{result.risks.map((r: string, i: number) => <li key={i} className="text-surface-200 text-sm">• {r}</li>)}</ul>
            </div>
          )}
          {result.recommendations?.length > 0 && (
            <div><h3 className="font-display font-600 text-brand-400 mb-2">Öneriler</h3>
              <ul className="space-y-1">{result.recommendations.map((r: string, i: number) => <li key={i} className="text-surface-200 text-sm">• {r}</li>)}</ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
