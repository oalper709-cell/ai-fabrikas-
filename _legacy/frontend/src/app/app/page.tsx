'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  MessageSquare, FileText, Megaphone, Search, Languages, Image, Hexagon, Mail, Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';

const modules = [
  { icon: MessageSquare, title: 'Sosyal Medya', desc: 'Platform bazlı içerik üretimi', href: '/app/social', color: 'from-pink-500 to-rose-600' },
  { icon: FileText, title: 'Blog', desc: 'SEO uyumlu blog yazıları', href: '/app/blog', color: 'from-blue-500 to-cyan-600' },
  { icon: Megaphone, title: 'Reklam', desc: 'Dönüşüm odaklı reklam kopyaları', href: '/app/ad', color: 'from-amber-500 to-orange-600' },
  { icon: Search, title: 'SEO', desc: 'Meta, başlık ve içerik optimizasyonu', href: '/app/seo', color: 'from-emerald-500 to-green-600' },
  { icon: Languages, title: 'Çeviri', desc: 'Bağlama duyarlı profesyonel çeviriler', href: '/app/translation', color: 'from-violet-500 to-purple-600' },
  { icon: Image, title: 'Thumbnail', desc: 'AI ile görsel tasarımı', href: '/app/thumbnail', color: 'from-red-500 to-pink-600' },
  { icon: Hexagon, title: 'Logo', desc: 'Marka logosu ve ikon üretimi', href: '/app/logo', color: 'from-sky-500 to-indigo-600' },
  { icon: Mail, title: 'E-posta', desc: 'Satış, bülten ve takip mailleri', href: '/app/email', color: 'from-teal-500 to-cyan-700' },
  { icon: Briefcase, title: 'CV', desc: 'ATS uyumlu özgeçmiş ve ön yazı', href: '/app/cv', color: 'from-slate-500 to-zinc-700' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="font-display text-3xl font-700 mb-1">
        Hoş geldin, <span className="text-gradient">{user?.name || 'Kullanıcı'}</span>
      </h1>
      <p className="text-surface-200/60 mb-8">Ne üretmek istersin?</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={m.href}
              className="group block p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40 hover:border-brand-500/30 transition-all">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${m.color} mb-4`}>
                <m.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-600 mb-1">{m.title}</h3>
              <p className="text-surface-200/60 text-sm">{m.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
