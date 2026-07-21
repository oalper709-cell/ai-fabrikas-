import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AI Fabrikası — Yapay Zeka İçerik Platformu',
  description: 'Sosyal medya, blog, reklam, SEO, çeviri ve thumbnail içeriklerinizi AI ile saniyeler içinde üretin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-surface-950 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
