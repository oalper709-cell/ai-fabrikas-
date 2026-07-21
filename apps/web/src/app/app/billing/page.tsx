'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

type Plan = {
  id: string;
  name: string;
  monthlyCredits: number;
  priceUsd: number;
  stripeConfigured: boolean;
};

type Usage = {
  plan: string;
  creditBalance: number;
  monthlyCredits: number;
  ledger: Array<{ id: string; delta: number; reason: string; createdAt: string }>;
};

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loadingPlan, setLoadingPlan] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) setMessage('Ödeme tamamlandı. Plan kısa süre içinde güncellenir.');
    if (params.get('canceled')) setMessage('Ödeme iptal edildi.');

    Promise.all([
      fetch(`${API}/billing/plans`).then((r) => r.json()),
      fetch(`${API}/billing/usage`, { credentials: 'include' }).then(async (r) => {
        if (r.status === 401) {
          router.replace('/login');
          return null;
        }
        return r.json();
      }),
    ])
      .then(([plansRes, usageRes]) => {
        if (plansRes?.data) setPlans(plansRes.data);
        if (usageRes?.data) setUsage(usageRes.data);
        if (usageRes && !usageRes.success) setError(usageRes.message || 'Kullanım alınamadı');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Hata'));
  }, [router]);

  async function checkout(plan: 'STARTER' | 'PRO') {
    setLoadingPlan(plan);
    setError('');
    try {
      const res = await fetch(`${API}/billing/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Checkout başlatılamadı');
      if (json.data?.url) {
        window.location.href = json.data.url;
        return;
      }
      throw new Error('Checkout URL yok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout hatası');
    } finally {
      setLoadingPlan('');
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/app" style={{ color: '#94a3b8' }}>← Panele dön</Link>
        <h1>Billing & Krediler</h1>
        {usage ? (
          <p style={{ color: '#94a3b8' }}>
            Plan: {usage.plan} · Bakiye: {usage.creditBalance} / {usage.monthlyCredits} kredi
          </p>
        ) : (
          <p style={{ color: '#94a3b8' }}>Yükleniyor...</p>
        )}
        {message ? <p style={{ color: '#4ade80' }}>{message}</p> : null}
        {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      </div>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {plans.map((plan) => (
          <article key={plan.id} style={{ border: '1px solid #1e293b', borderRadius: 16, padding: 20, background: '#0f172a' }}>
            <h2 style={{ marginTop: 0 }}>{plan.name}</h2>
            <p style={{ fontSize: 28, margin: '8px 0' }}>
              {plan.priceUsd === 0 ? 'Ücretsiz' : `$${plan.priceUsd}/ay`}
            </p>
            <p style={{ color: '#94a3b8' }}>{plan.monthlyCredits} kredi / ay</p>
            {plan.id === 'FREE' ? (
              <p style={{ color: '#64748b', fontSize: 14 }}>Varsayılan plan</p>
            ) : (
              <button
                disabled={!!loadingPlan || !plan.stripeConfigured}
                onClick={() => checkout(plan.id as 'STARTER' | 'PRO')}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 0,
                  background: plan.stripeConfigured ? '#1666f5' : '#334155',
                  color: 'white',
                  cursor: plan.stripeConfigured ? 'pointer' : 'not-allowed',
                }}
              >
                {!plan.stripeConfigured
                  ? 'Stripe price ID gerekli'
                  : loadingPlan === plan.id
                    ? 'Yönlendiriliyor...'
                    : 'Yükselt'}
              </button>
            )}
          </article>
        ))}
      </section>

      {usage?.ledger?.length ? (
        <section style={{ marginTop: 32 }}>
          <h2>Kredi hareketleri</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {usage.ledger.slice(0, 20).map((row) => (
              <li
                key={row.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #1e293b',
                  color: '#cbd5e1',
                  fontSize: 14,
                }}
              >
                <span>{row.reason}</span>
                <span style={{ color: row.delta < 0 ? '#f87171' : '#4ade80' }}>
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
