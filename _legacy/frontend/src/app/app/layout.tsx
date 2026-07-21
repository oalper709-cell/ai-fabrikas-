'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  LayoutDashboard, MessageSquare, FileText, Megaphone,
  Search, Languages, Image, Hexagon, Mail, Briefcase, History, LogOut,
} from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app' },
  { icon: MessageSquare, label: 'Sosyal Medya', href: '/app/social' },
  { icon: FileText, label: 'Blog', href: '/app/blog' },
  { icon: Megaphone, label: 'Reklam', href: '/app/ad' },
  { icon: Search, label: 'SEO', href: '/app/seo' },
  { icon: Languages, label: 'Çeviri', href: '/app/translation' },
  { icon: Image, label: 'Thumbnail', href: '/app/thumbnail' },
  { icon: Hexagon, label: 'Logo', href: '/app/logo' },
  { icon: Mail, label: 'E-posta', href: '/app/email' },
  { icon: Briefcase, label: 'CV', href: '/app/cv' },
  { icon: History, label: 'Geçmiş', href: '/app/history' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface-gradient)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-surface-200/10 bg-surface-900/60 backdrop-blur p-4 gap-1">
        <Link href="/" className="font-display text-xl font-800 text-gradient mb-8 px-3">
          AI Fabrikası
        </Link>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-surface-200 hover:bg-surface-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-surface-200/10 pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium truncate">{user.name || user.email}</p>
            <p className="text-xs text-surface-200/60">{user.plan} Plan</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-surface-200/60 hover:text-red-400 transition w-full"
          >
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-surface-900/90 backdrop-blur border-b border-surface-200/10 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-800 text-gradient">AI Fabrikası</Link>
        <button onClick={() => { logout(); router.push('/'); }} className="text-surface-200/60 hover:text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
        {children}
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-900/90 backdrop-blur border-t border-surface-200/10 flex justify-around py-2">
        {nav.slice(0, 6).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center text-[10px] gap-0.5 py-1',
              pathname === item.href ? 'text-brand-400' : 'text-surface-200/60'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
