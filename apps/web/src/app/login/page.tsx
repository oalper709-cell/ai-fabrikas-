'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Giriş başarısız');
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 12 }}>
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
          ← AI Fabrikası
        </Link>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Giriş Yap</h1>
        <input className="af-input" type="email" required placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="af-input" type="password" required placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p> : null}
        <button className="af-btn" disabled={loading} type="submit">
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Hesabın yok mu? <Link href="/register">Kayıt ol</Link>
        </p>
      </form>
    </main>
  );
}
