import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Fabrikası',
  description: 'Metin ve görsel içerik üretim platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        {sentryDsn ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__AF_SENTRY_DSN=${JSON.stringify(sentryDsn)};`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
