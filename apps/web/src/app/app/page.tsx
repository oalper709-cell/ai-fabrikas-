'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type MeResponse = {
  user: { id: string; email: string; name?: string | null };
  organization: {
    id: string;
    name: string;
    plan: string;
    creditBalance: number;
    role: string;
  };
};

const MODULES = [
  { href: '/app/social', title: 'Sosyal', cost: '1 kredi' },
  { href: '/app/blog', title: 'Blog', cost: '1 kredi' },
  { href: '/app/ad', title: 'Reklam', cost: '1 kredi' },
  { href: '/app/seo', title: 'SEO', cost: '1 kredi' },
  { href: '/app/email', title: 'E-posta', cost: '1 kredi' },
  { href: '/app/translation', title: 'Çeviri', cost: '1 kredi' },
  { href: '/app/thumbnail', title: 'Thumbnail', cost: '5 kredi' },
  { href: '/app/logo', title: 'Logo', cost: '5 kredi' },
  { href: '/app/cv', title: 'CV', cost: '1 kredi' },
];

export default function AppHomePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/login');
          return null;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Profil alınamadı');
        setMe(json.data);
        return json;
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'));
  }, [router]);

  if (error) {
    return (
      <div>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Link href="/login">Girişe dön</Link>
      </div>
    );
  }

  if (!me) {
    return <p style={{ color: 'var(--muted)' }}>Yükleniyor...</p>;
  }

  return (
    <div>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Workspace
      </p>
      <h1 style={{ margin: '0.35rem 0 0', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
        {me.organization.name}
      </h1>
      <p style={{ color: 'var(--muted)', marginTop: 8 }}>
        {me.user.name || me.user.email} · {me.organization.role} · {me.organization.plan} ·{' '}
        <strong style={{ color: 'var(--accent)' }}>{me.organization.creditBalance} kredi</strong>
      </p>

      <section style={{ marginTop: 36 }}>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Üretim hatları</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Modül seç, üret, geçmişten yönet.</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 0', display: 'grid', gap: 0 }}>
          {MODULES.map((m) => (
            <li key={m.href} style={{ borderTop: '1px solid var(--line)' }}>
              <Link
                href={m.href}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '0.95rem 0',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontWeight: 600 }}>{m.title}</span>
                <span style={{ color: 'var(--muted)' }}>{m.cost}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
