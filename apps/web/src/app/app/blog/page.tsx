'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export default function BlogPage() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ title?: string; metaDescription?: string; content?: string } | null>(null);
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
          module: 'BLOG',
          input: {
            topic,
            keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
            wordCount: 800,
            language: 'tr',
          },
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
      <h1>Blog</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Konu" required minLength={3} style={inputStyle} />
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Anahtar kelimeler (virgülle)" style={inputStyle} />
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'Blog Yaz'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result ? (
        <section style={cardStyle}>
          <h2>{result.title}</h2>
          {result.metaDescription ? <p style={{ color: '#94a3b8' }}>{result.metaDescription}</p> : null}
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.content}</pre>
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
