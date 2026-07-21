'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Result = { imageUrl?: string; aspectRatio?: string; platform?: string };

export default function ThumbnailPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [style, setStyle] = useState('bold');
  const [aspectRatio, setAspectRatio] = useState('16:9');
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
          module: 'THUMBNAIL',
          input: { topic, platform, style, aspectRatio },
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
      <h1>Thumbnail</h1>
      <p style={{ color: '#94a3b8' }}>5 kredi · DALL·E görsel üretimi</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Konu" required minLength={3} style={inputStyle} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
          {['youtube', 'instagram', 'tiktok', 'blog'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={style} onChange={(e) => setStyle(e.target.value)} style={inputStyle}>
          {['bold', 'minimal', 'cinematic', 'playful'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={inputStyle}>
          {['16:9', '1:1', '9:16'].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'Görsel üret'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result?.imageUrl ? (
        <section style={cardStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.imageUrl} alt={topic} style={{ width: '100%', borderRadius: 12 }} />
          <p style={{ color: '#94a3b8' }}>{result.platform} · {result.aspectRatio}</p>
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
