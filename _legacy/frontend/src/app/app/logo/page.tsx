'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { logoApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const styles = ['minimal', 'modern', 'vintage', 'playful', 'luxury', 'tech'] as const;

export default function LogoPage() {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState<string>('modern');
  const [colors, setColors] = useState('');
  const [iconOnly, setIconOnly] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () =>
      logoApi
        .generate({
          brandName,
          industry,
          style,
          colors: colors || undefined,
          iconOnly,
          guidance: guidance || undefined,
        })
        .then((r) => r.data),
    onSuccess: (p) => {
      setResult(p.data);
      toast.success('Logo üretildi!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">AI Logo Üretici</h1>

      <div className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Marka adı..."
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Sektör (ör. teknoloji, kafe, moda)..."
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                style === s ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Renkler (ör. lacivert, altın) — opsiyonel"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Ek yönlendirme (opsiyonel)"
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <label className="flex items-center gap-3 text-sm text-surface-200 cursor-pointer">
          <input
            type="checkbox"
            checked={iconOnly}
            onChange={(e) => setIconOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          Sadece ikon (yazısız logo)
        </label>

        <button
          onClick={() => mutation.mutate()}
          disabled={!brandName || !industry || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...
            </>
          ) : (
            'Logo Üret'
          )}
        </button>
      </div>

      {result?.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-surface-200/10 bg-surface-900/40"
        >
          <img src={result.imageUrl} alt={`${result.brandName} logo`} className="w-full max-w-md mx-auto rounded-lg mb-4 bg-white" />
          <a
            href={result.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition"
          >
            <Download className="w-4 h-4" /> İndir
          </a>
        </motion.div>
      )}
    </div>
  );
}
