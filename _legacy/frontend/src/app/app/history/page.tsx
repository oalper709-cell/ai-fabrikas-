'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '@/lib/api';
import { Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const typeLabels: Record<string, string> = {
  SOCIAL: 'Sosyal Medya',
  BLOG: 'Blog',
  AD: 'Reklam',
  SEO: 'SEO',
  TRANSLATION: 'Çeviri',
  THUMBNAIL: 'Thumbnail',
  LOGO: 'Logo',
  EMAIL: 'E-posta',
  CV: 'CV',
};

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyApi.list().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => historyApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['history'] }); toast.success('Silindi'); },
  });

  if (isLoading) return <p className="text-surface-200/60">Yükleniyor...</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">İçerik Geçmişi</h1>

      {!data?.length ? (
        <p className="text-surface-200/60">Henüz içerik üretilmedi.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item: any, i: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-4 rounded-xl border border-surface-200/10 bg-surface-900/40"
            >
              <div className="min-w-0">
                <p className="font-display font-600 truncate">{item.title}</p>
                <p className="text-xs text-surface-200/40 mt-0.5">
                  {typeLabels[item.type] || item.type} · {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => deleteMutation.mutate(item.id)}
                  className="p-2 text-surface-200/40 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
