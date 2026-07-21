'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function AdPage() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('conversion');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ headlines?: string[]; descriptions?: string[]; cta?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function poll(jobId: string) {
    for (let i = 0; i < 40; i++) {
      const res = await fetch(`${API}/generations/${jobId}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Job okunamadı');
      setStatus(json.data.status);
      if (json.data.status === 'SUCCEEDED') {
        setResult(json.data.asset?.outputJson || null);
        return;
      }
      if (json.data.status === 'FAILED') throw new Error(json.data.error || 'Üretim başarısız');
      await new Promise((r) => setTimeout(r, 1500));
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
          module: 'AD',
          input: { product, audience, goal, platform: 'meta', language: 'tr' },
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
      <h1>Reklam</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ürün / hizmet" required style={inputStyle} />
        <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Hedef kitle" required style={inputStyle} />
        <select value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle}>
          {['awareness', 'conversion', 'engagement', 'retargeting'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'Üret'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result ? (
        <section style={cardStyle}>
          {result.headlines?.map((h) => <p key={h}><strong>{h}</strong></p>)}
          {result.descriptions?.map((d) => <p key={d} style={{ color: '#cbd5e1' }}>{d}</p>)}
          {result.cta?.map((c) => <p key={c} style={{ color: '#60a5fa' }}>{c}</p>)}
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
