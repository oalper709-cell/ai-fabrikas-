'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { translationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const languages = [
  { code: 'tr', name: 'Türkçe' }, { code: 'en', name: 'İngilizce' }, { code: 'de', name: 'Almanca' },
  { code: 'fr', name: 'Fransızca' }, { code: 'es', name: 'İspanyolca' }, { code: 'ar', name: 'Arapça' },
  { code: 'zh', name: 'Çince' }, { code: 'ja', name: 'Japonca' }, { code: 'ko', name: 'Korece' },
  { code: 'ru', name: 'Rusça' }, { code: 'pt', name: 'Portekizce' }, { code: 'it', name: 'İtalyanca' },
];

export default function TranslationPage() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('auto');
  const [target, setTarget] = useState('en');
  const [tone, setTone] = useState('formal');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => translationApi.translate({ text, sourceLanguage: source, targetLanguage: target, tone }).then((r) => r.data),
    onSuccess: (p) => { setResult(p.data); toast.success('Çeviri tamamlandı!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('Kopyalandı!'); };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">AI Çeviri</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <select value={source} onChange={(e) => setSource(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-200/10 text-white text-sm focus:border-brand-500 focus:outline-none">
              <option value="auto">Otomatik Algıla</option>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Çevrilecek metin..."
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none resize-none" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-200/10 text-white text-sm focus:border-brand-500 focus:outline-none">
              {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="w-full min-h-[200px] px-4 py-3 rounded-lg bg-surface-800/50 border border-surface-200/10 text-surface-200">
            {result ? (
              <div className="flex justify-between items-start">
                <p className="whitespace-pre-wrap">{result.translatedText}</p>
                <button onClick={() => copy(result.translatedText)} className="text-brand-400 shrink-0 ml-2"><Copy className="w-4 h-4" /></button>
              </div>
            ) : <span className="text-surface-200/40">Çeviri burada görünecek...</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select value={tone} onChange={(e) => setTone(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-200/10 text-white text-sm focus:border-brand-500 focus:outline-none">
          <option value="formal">Resmi</option>
          <option value="casual">Günlük</option>
          <option value="marketing">Pazarlama</option>
        </select>

        <button onClick={() => mutation.mutate()} disabled={text.length < 10 || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}>
          {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Çevriliyor...</> : <><ArrowRightLeft className="w-5 h-5" /> Çevir</>}
        </button>
      </div>

      {result?.notes?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-surface-800/30 border border-surface-200/10">
          <h3 className="font-display font-600 text-sm text-brand-400 mb-2">Notlar</h3>
          <ul className="space-y-1">{result.notes.map((n: string, i: number) => <li key={i} className="text-surface-200/60 text-sm">• {n}</li>)}</ul>
        </motion.div>
      )}
    </div>
  );
}
