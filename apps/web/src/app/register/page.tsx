'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          organizationName: organizationName || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Kayıt başarısız');
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
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
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Kayıt Ol</h1>
        <input className="af-input" placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="af-input" placeholder="Organizasyon (opsiyonel)" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
        <input className="af-input" type="email" required placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="af-input" type="password" required minLength={8} placeholder="Şifre (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p> : null}
        <button className="af-btn" disabled={loading} type="submit">
          {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
        </button>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Hesabın var mı? <Link href="/login">Giriş yap</Link>
        </p>
      </form>
    </main>
  );
}
