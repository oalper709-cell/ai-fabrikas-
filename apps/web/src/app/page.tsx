import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1200px 700px at 70% 20%, rgba(46,230,166,0.12), transparent 55%), linear-gradient(160deg, #0b0f14 0%, #101820 45%, #0b0f14 100%)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(36,48,65,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(36,48,65,0.45) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85), transparent 92%)',
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '18%',
          left: '-5%',
          right: '-5%',
          height: 2,
          background: 'linear-gradient(90deg, transparent, #2ee6a6, transparent)',
          animation: 'af-sweep 4.5s ease-in-out infinite alternate',
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          maxWidth: 1120,
          margin: '0 auto',
        }}
      >
        <strong style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', fontSize: '1.15rem' }}>
          AI Fabrikası
        </strong>
        <Link href="/login" className="af-btn-ghost" style={{ padding: '0.55rem 1rem' }}>
          Giriş
        </Link>
      </header>

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1120,
          margin: '0 auto',
          padding: 'clamp(2rem, 8vh, 5rem) 1.5rem 3rem',
          display: 'grid',
          gap: '2.5rem',
          alignItems: 'end',
        }}
      >
        <div>
          <p
            className="af-rise"
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(3.2rem, 9vw, 6.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.05em',
              maxWidth: '14ch',
            }}
          >
            AI Fabrikası
          </p>
          <h1
            className="af-rise-delay"
            style={{
              margin: '1.1rem 0 0',
              fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)',
              fontWeight: 600,
              color: 'var(--ink)',
              maxWidth: '28ch',
            }}
          >
            İçeriği üretim hattına alın.
          </h1>
          <p
            className="af-rise-delay-2"
            style={{ margin: '0.85rem 0 0', color: 'var(--muted)', maxWidth: '42ch', lineHeight: 1.55 }}
          >
            Sosyal, blog, reklam, SEO, e-posta, çeviri, thumbnail, logo ve CV — tek workspace, kredi ile ölçülü üretim.
          </p>
          <div className="af-rise-delay-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <Link href="/register" className="af-btn">
              Ücretsiz başla
            </Link>
            <Link href="/login" className="af-btn-ghost">
              Panele gir
            </Link>
          </div>
        </div>

        <div
          className="af-rise-delay-2"
          aria-label="Üretim hattı önizlemesi"
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '1.25rem',
            display: 'grid',
            gap: '0.75rem',
          }}
        >
          {[
            { label: 'SOCIAL', text: 'Yeni lansman için 3 varyasyon hazır.' },
            { label: 'BLOG', text: 'SEO brief → taslak → meta açıklama.' },
            { label: 'THUMBNAIL', text: '16:9 kare, yüksek kontrast render.' },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: '1rem',
                alignItems: 'center',
                opacity: 0.95 - i * 0.12,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  color: 'var(--accent)',
                  animation: `af-pulse-line 2.4s ease ${i * 0.35}s infinite`,
                }}
              >
                {row.label}
              </span>
              <span style={{ color: 'var(--muted)', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                {row.text}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
