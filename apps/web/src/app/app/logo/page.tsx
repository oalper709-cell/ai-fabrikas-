'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Result = { imageUrl?: string; brandName?: string; style?: string };

export default function LogoPage() {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('modern');
  const [iconOnly, setIconOnly] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function poll(jobId: string) {
    for (let i = 0; i < 60; i++) {
      const res = await fetch(`${API}/generations/${jobId}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Job okunamadı');
      setStatus(json.data.status);
      if (json.data.status === 'SUCCEEDED') {
        setResult(json.data.asset?.outputJson || null);
        return;
      }
      if (json.data.status === 'FAILED') throw new Error(json.data.error || 'Üretim başarısız');
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error('Zaman aşımı');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/generations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'LOGO',
          input: { brandName, industry, style, iconOnly },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Başlatılamadı');
      await poll(json.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Link href="/app" style={{ color: '#94a3b8' }}>← Panel</Link>
      <h1>Logo</h1>
      <p style={{ color: '#94a3b8' }}>5 kredi · DALL·E görsel üretimi</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Marka adı" required minLength={2} style={inputStyle} />
        <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Sektör" required minLength={2} style={inputStyle} />
        <select value={style} onChange={(e) => setStyle(e.target.value)} style={inputStyle}>
          {['minimal', 'modern', 'vintage', 'playful', 'luxury', 'tech'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label style={{ color: '#cbd5e1', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={iconOnly} onChange={(e) => setIconOnly(e.target.checked)} />
          Sadece ikon (yazısız)
        </label>
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'Logo üret'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result?.imageUrl ? (
        <section style={cardStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.imageUrl} alt={`${result.brandName} logo`} style={{ width: '100%', maxWidth: 420, margin: '0 auto', display: 'block', borderRadius: 12, background: '#fff' }} />
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>{result.brandName} · {result.style}</p>
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
