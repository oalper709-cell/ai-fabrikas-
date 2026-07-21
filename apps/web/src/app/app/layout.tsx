'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

const NAV = [
  { href: '/app', label: 'Panel' },
  { href: '/app/social', label: 'Sosyal' },
  { href: '/app/blog', label: 'Blog' },
  { href: '/app/ad', label: 'Reklam' },
  { href: '/app/seo', label: 'SEO' },
  { href: '/app/email', label: 'E-posta' },
  { href: '/app/translation', label: 'Çeviri' },
  { href: '/app/thumbnail', label: 'Thumbnail' },
  { href: '/app/logo', label: 'Logo' },
  { href: '/app/cv', label: 'CV' },
  { href: '/app/history', label: 'Geçmiş' },
  { href: '/app/billing', label: 'Billing' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    router.replace('/login');
  }

  return (
    <div className="af-shell">
      <aside className="af-side">
        <Link
          href="/app"
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontSize: '1.2rem',
            marginBottom: '1.25rem',
            textDecoration: 'none',
            color: 'var(--ink)',
          }}
        >
          AI Fabrikası
        </Link>
        <nav>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  active
                    ? { color: 'var(--ink)', background: 'rgba(46, 230, 166, 0.12)' }
                    : undefined
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="af-btn-ghost"
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          Çıkış
        </button>
      </aside>
      <div className="af-main">{children}</div>
    </div>
  );
}
