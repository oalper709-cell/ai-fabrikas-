'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Result = {
  titleTags?: string[];
  metaDescriptions?: string[];
  headings?: string[];
  keywordSuggestions?: string[];
  contentBrief?: string;
};

export default function SeoPage() {
  const [topic, setTopic] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
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
          module: 'SEO',
          input: {
            topic,
            targetKeyword,
            url: url || undefined,
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
      <h1>SEO</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Konu / sayfa" required minLength={3} style={inputStyle} />
        <input value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} placeholder="Hedef anahtar kelime" required minLength={2} style={inputStyle} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opsiyonel)" style={inputStyle} />
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'SEO üret'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result ? (
        <section style={cardStyle}>
          {result.titleTags?.map((t) => <p key={t}><strong>{t}</strong></p>)}
          {result.metaDescriptions?.map((m) => <p key={m} style={{ color: '#94a3b8' }}>{m}</p>)}
          {result.headings?.length ? <ul>{result.headings.map((h) => <li key={h}>{h}</li>)}</ul> : null}
          {result.keywordSuggestions?.length ? <p>{result.keywordSuggestions.join(', ')}</p> : null}
          {result.contentBrief ? <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.contentBrief}</pre> : null}
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
