'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Megaphone,
  Search,
  Languages,
  Image,
  Hexagon,
  Mail,
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

const modules = [
  { icon: MessageSquare, title: 'Sosyal Medya', desc: 'Instagram, Twitter, LinkedIn için içerikler', href: '/app/social', color: 'from-pink-500 to-rose-600' },
  { icon: FileText, title: 'Blog Yazıları', desc: 'SEO uyumlu, uzun formatlı blog içerikleri', href: '/app/blog', color: 'from-blue-500 to-cyan-600' },
  { icon: Megaphone, title: 'Reklam Metinleri', desc: 'Google, Meta, TikTok reklam kopyaları', href: '/app/ad', color: 'from-amber-500 to-orange-600' },
  { icon: Search, title: 'SEO Optimizasyonu', desc: 'SEO başlık, meta ve içerik üretimi', href: '/app/seo', color: 'from-emerald-500 to-green-600' },
  { icon: Languages, title: 'Çeviri', desc: 'Bağlama duyarlı profesyonel çeviriler', href: '/app/translation', color: 'from-violet-500 to-purple-600' },
  { icon: Image, title: 'Thumbnail', desc: 'YouTube, Instagram için AI görseller', href: '/app/thumbnail', color: 'from-red-500 to-pink-600' },
  { icon: Hexagon, title: 'Logo', desc: 'Marka logosu ve ikon üretimi', href: '/app/logo', color: 'from-sky-500 to-indigo-600' },
  { icon: Mail, title: 'E-posta', desc: 'Satış, bülten ve takip mailleri', href: '/app/email', color: 'from-teal-500 to-cyan-700' },
  { icon: Briefcase, title: 'CV', desc: 'ATS uyumlu özgeçmiş ve ön yazı', href: '/app/cv', color: 'from-slate-500 to-zinc-700' },
];

const features = [
  { icon: Sparkles, title: 'GPT-4o Destekli', desc: 'En gelişmiş dil modelleriyle üretim.' },
  { icon: Zap, title: 'Saniyeler İçinde', desc: 'İçerikleriniz anında hazır.' },
  { icon: Shield, title: 'Güvenli & Gizli', desc: 'Verileriniz şifrelenerek saklanır.' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 100%)' }}>

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2e88ff 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-800 tracking-tight leading-none mb-4">
              <span className="text-gradient">AI Fabrikası</span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-surface-200 max-w-xl mx-auto mb-10 leading-relaxed">
              İçerik üretimini yapay zekâyla dönüştürün. Sosyal medyadan SEO'ya, tek platformda.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-display font-600 text-white text-lg transition-transform hover:scale-105"
              style={{ background: 'var(--brand-gradient)' }}>
              Ücretsiz Başla <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-display font-500 text-surface-200 border border-surface-200/20 hover:bg-surface-800 transition text-lg">
              Giriş Yap
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="relative py-24 px-6" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-700 text-center mb-16">
            9 Güçlü <span className="text-gradient">AI Modülü</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={m.href}
                  className="group block p-6 rounded-2xl border border-surface-200/10 bg-surface-900/50 backdrop-blur hover:border-brand-500/40 transition-all">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${m.color} mb-4`}>
                    <m.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-600 mb-1">{m.title}</h3>
                  <p className="text-surface-200 text-sm">{m.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }}>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-10 text-center">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <f.icon className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <h3 className="font-display text-lg font-600 mb-1">{f.title}</h3>
              <p className="text-surface-200 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-surface-200/60 text-sm border-t border-surface-200/10">
        © 2026 AI Fabrikası. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
