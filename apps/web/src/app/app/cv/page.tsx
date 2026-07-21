'use client';

import { CSSProperties, FormEvent, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Result = {
  headline?: string;
  summary?: string;
  experienceBullets?: string[];
  skillsGrouped?: { technical?: string[]; soft?: string[] };
  coverLetter?: string;
  atsKeywords?: string[];
};

export default function CvPage() {
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [tone, setTone] = useState('modern');
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
          module: 'CV',
          input: {
            fullName,
            targetRole,
            experience,
            skills,
            education: education || undefined,
            tone,
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
      <h1>CV</h1>
      <p style={{ color: '#94a3b8' }}>1 kredi · ATS uyumlu metin (güvenli React render)</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ad Soyad" required minLength={2} style={inputStyle} />
        <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Hedef pozisyon" required minLength={2} style={inputStyle} />
        <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Deneyim / geçmiş (min 20 karakter)" required minLength={20} rows={5} style={inputStyle} />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Beceriler" required minLength={3} style={inputStyle} />
        <input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Eğitim (opsiyonel)" style={inputStyle} />
        <select value={tone} onChange={(e) => setTone(e.target.value)} style={inputStyle}>
          {['formal', 'modern', 'executive'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button disabled={loading} style={buttonStyle}>{loading ? `Üretiliyor (${status})...` : 'CV üret'}</button>
      </form>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {result ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>{result.headline}</h2>
          <p>{result.summary}</p>
          {result.experienceBullets?.length ? (
            <ul>{result.experienceBullets.map((b) => <li key={b}>{b}</li>)}</ul>
          ) : null}
          {result.skillsGrouped?.technical?.length ? (
            <p><strong>Teknik:</strong> {result.skillsGrouped.technical.join(', ')}</p>
          ) : null}
          {result.skillsGrouped?.soft?.length ? (
            <p><strong>Soft:</strong> {result.skillsGrouped.soft.join(', ')}</p>
          ) : null}
          {result.atsKeywords?.length ? (
            <p style={{ color: '#94a3b8' }}>ATS: {result.atsKeywords.join(', ')}</p>
          ) : null}
          {result.coverLetter ? (
            <>
              <h3>Ön yazı</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result.coverLetter}</pre>
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: CSSProperties = { padding: 12, borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#f8fafc' };
const buttonStyle: CSSProperties = { padding: 12, borderRadius: 10, border: 0, background: '#1666f5', color: 'white', fontWeight: 600 };
const cardStyle: CSSProperties = { marginTop: 24, padding: 20, borderRadius: 16, border: '1px solid #1e293b', background: '#0f172a' };
