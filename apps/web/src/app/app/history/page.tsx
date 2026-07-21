'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Asset = {
  id: string;
  title: string;
  module: string;
  createdAt: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch(`${API}/assets`, { credentials: 'include' });
    if (res.status === 401) {
      router.replace('/login');
      return;
    }
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Geçmiş alınamadı');
    setAssets(json.data || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Hata'));
  }, [router]);

  async function remove(id: string) {
    const res = await fetch(`${API}/assets/${id}`, { method: 'DELETE', credentials: 'include' });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message || 'Silinemedi');
      return;
    }
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Link href="/app" style={{ color: '#94a3b8' }}>← Panel</Link>
      <h1>Geçmiş</h1>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      {!assets.length ? <p style={{ color: '#94a3b8' }}>Henüz içerik yok.</p> : null}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {assets.map((a) => (
          <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
            <div>
              <strong>{a.title}</strong>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{a.module} · {new Date(a.createdAt).toLocaleString('tr-TR')}</div>
            </div>
            <button onClick={() => remove(a.id)} style={{ background: 'transparent', border: '1px solid #334155', color: '#f87171', borderRadius: 8, padding: '6px 10px' }}>
              Sil
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
