'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { emailApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const purposes = [
  { value: 'sales', label: 'Satış' },
  { value: 'newsletter', label: 'Bülten' },
  { value: 'followup', label: 'Takip' },
  { value: 'welcome', label: 'Hoş geldin' },
  { value: 'support', label: 'Destek' },
  { value: 'announcement', label: 'Duyuru' },
] as const;

const tones = [
  { value: 'formal', label: 'Resmi' },
  { value: 'friendly', label: 'Samimi' },
  { value: 'persuasive', label: 'İkna edici' },
  { value: 'urgent', label: 'Acil' },
] as const;

export default function EmailPage() {
  const [purpose, setPurpose] = useState('sales');
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('friendly');
  const [keyPoints, setKeyPoints] = useState('');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () =>
      emailApi
        .generate({
          purpose,
          subject,
          audience,
          tone,
          keyPoints: keyPoints || undefined,
        })
        .then((r) => r.data),
    onSuccess: (p) => {
      setResult(p.data);
      toast.success('E-posta üretildi!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!');
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">AI E-posta Üretici</h1>

      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {purposes.map((p) => (
            <button
              key={p.value}
              onClick={() => setPurpose(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                purpose === p.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Konu / kampanya başlığı..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Hedef kitle..."
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tone === t.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Ana noktalar (opsiyonel)..."
          value={keyPoints}
          onChange={(e) => setKeyPoints(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none resize-none"
        />

        <button
          onClick={() => mutation.mutate()}
          disabled={!subject || !audience || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...
            </>
          ) : (
            'E-posta Üret'
          )}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40"
        >
          {result.subjectLines?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">Konu Satırları</h3>
              {result.subjectLines.map((s: string, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-surface-800/50 mb-2">
                  <span className="text-sm">{s}</span>
                  <button onClick={() => copy(s)} className="text-brand-400 shrink-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {result.previewText && (
            <div>
              <h3 className="font-display font-600 mb-2">Önizleme Metni</h3>
              <p className="text-surface-200/70 text-sm">{result.previewText}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display font-600">E-posta Gövdesi</h3>
              <button onClick={() => copy(result.body)} className="text-brand-400">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-surface-200 whitespace-pre-wrap text-sm leading-relaxed">{result.body}</p>
          </div>

          {result.cta && (
            <div>
              <h3 className="font-display font-600 mb-2">CTA</h3>
              <span
                onClick={() => copy(result.cta)}
                className="inline-block px-4 py-2 rounded-lg bg-brand-600/20 text-brand-400 text-sm cursor-pointer hover:bg-brand-600/30"
              >
                {result.cta}
              </span>
            </div>
          )}

          {result.variations?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">Alternatifler</h3>
              {result.variations.map((v: string, i: number) => (
                <div key={i} className="flex justify-between items-start gap-4 p-3 rounded-lg bg-surface-800/30 mb-2">
                  <p className="text-surface-200 text-sm whitespace-pre-wrap">{v}</p>
                  <button onClick={() => copy(v)} className="text-brand-400 shrink-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
