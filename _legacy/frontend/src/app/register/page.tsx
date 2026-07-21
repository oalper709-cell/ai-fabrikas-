'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, name: name || undefined });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Hoş geldiniz!');
      router.push('/app');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="block text-center mb-8">
          <span className="font-display text-3xl font-800 text-gradient">AI Fabrikası</span>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl border border-surface-200/10 bg-surface-900/60 backdrop-blur">
          <h2 className="font-display text-2xl font-600 text-center">Hesap Oluştur</h2>

          <input type="text" placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none transition" />

          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none transition" />

          <input type="password" placeholder="Şifre (min 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none transition" />

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-display font-600 text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'var(--brand-gradient)' }}>
            {loading ? 'Oluşturuluyor...' : 'Kayıt Ol'}
          </button>

          <p className="text-center text-sm text-surface-200/60">
            Hesabınız var mı?{' '}
            <Link href="/login" className="text-brand-400 hover:underline">Giriş Yap</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
