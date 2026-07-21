'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { cvApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Download, Loader2, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

const tones = [
  { value: 'formal', label: 'Resmi' },
  { value: 'modern', label: 'Modern' },
  { value: 'executive', label: 'Yönetici' },
] as const;

function buildCvText(fullName: string, education: string, result: any) {
  return [
    fullName,
    result.headline,
    '',
    'ÖZET',
    result.summary,
    '',
    'DENEYİM',
    ...(result.experienceBullets || []).map((b: string) => `• ${b}`),
    '',
    'BECERİLER',
    'Teknik: ' + (result.skillsGrouped?.technical || []).join(', '),
    'Soft: ' + (result.skillsGrouped?.soft || []).join(', '),
    education ? `\nEĞİTİM\n${education}` : '',
    '',
    'ATS ANAHTAR KELİMELER',
    (result.atsKeywords || []).join(', '),
    '',
    'ÖN YAZI',
    result.coverLetter || '',
  ]
    .filter((line) => line !== undefined)
    .join('\n');
}

export default function CvPage() {
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [tone, setTone] = useState('modern');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () =>
      cvApi
        .generate({
          fullName,
          targetRole,
          experience,
          skills,
          education: education || undefined,
          tone,
        })
        .then((r) => r.data),
    onSuccess: (p) => {
      setResult(p.data);
      toast.success('CV üretildi!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Hata oluştu'),
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!');
  };

  const downloadTxt = () => {
    if (!result) return;
    const text = buildCvText(fullName, education, result);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, '_')}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT indirildi!');
  };

  const downloadPdf = () => {
    if (!result) return;
    const technical = (result.skillsGrouped?.technical || []).join(', ');
    const soft = (result.skillsGrouped?.soft || []).join(', ');
    const bullets = (result.experienceBullets || [])
      .map((b: string) => `<li>${b}</li>`)
      .join('');
    const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/>
<title>${fullName} — CV</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#111;line-height:1.5}
  h1{margin:0;font-size:28px} .role{color:#1666f5;margin:4px 0 20px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:24px}
  ul{padding-left:18px} @media print{body{margin:0}}
</style></head><body>
  <h1>${fullName}</h1>
  <p class="role">${result.headline || ''}</p>
  <h2>Özet</h2><p>${result.summary || ''}</p>
  <h2>Deneyim</h2><ul>${bullets}</ul>
  <h2>Beceriler</h2>
  <p><strong>Teknik:</strong> ${technical}</p>
  <p><strong>Soft:</strong> ${soft}</p>
  ${education ? `<h2>Eğitim</h2><p>${education}</p>` : ''}
  ${result.coverLetter ? `<h2>Ön Yazı</h2><p style="white-space:pre-wrap">${result.coverLetter}</p>` : ''}
  <script>window.onload=()=>{window.print()}</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      toast.error('Popup engellendi — tarayıcı izni verin');
      return;
    }
    w.document.write(html);
    w.document.close();
    toast.success('PDF için yazdır penceresi açıldı');
  };

  const copyAll = () => {
    if (!result) return;
    copy(buildCvText(fullName, education, result));
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-700 mb-6">AI CV Üretici</h1>

      <div className="space-y-4 mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Hedef pozisyon"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <textarea
          placeholder="Deneyim ve geçmiş (görevler, başarılar)..."
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none resize-none"
        />

        <input
          type="text"
          placeholder="Beceriler (virgülle ayır)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Eğitim (opsiyonel)"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-200/10 text-white placeholder:text-surface-200/40 focus:border-brand-500 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tone === t.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!fullName || !targetRole || experience.length < 20 || !skills || mutation.isPending}
          className="px-8 py-3 rounded-lg font-display font-600 text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--brand-gradient)' }}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Üretiliyor...
            </>
          ) : (
            'CV Üret'
          )}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6 rounded-2xl border border-surface-200/10 bg-surface-900/40"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="font-display text-xl font-700">{fullName}</h2>
              <p className="text-brand-400">{result.headline}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={copyAll} className="p-2 rounded-lg bg-surface-800 text-brand-400 hover:text-brand-300" title="Kopyala">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={downloadTxt} className="p-2 rounded-lg bg-surface-800 text-brand-400 hover:text-brand-300" title="TXT indir">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={downloadPdf} className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-brand-700" title="PDF olarak kaydet">
                <Printer className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display font-600 mb-2">Özet</h3>
            <p className="text-surface-200 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {result.experienceBullets?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">Deneyim Maddeleri</h3>
              <ul className="space-y-2">
                {result.experienceBullets.map((b: string, i: number) => (
                  <li key={i} className="flex justify-between items-start gap-3 text-sm text-surface-200">
                    <span>• {b}</span>
                    <button onClick={() => copy(b)} className="text-brand-400 shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.skillsGrouped && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-display font-600 mb-2 text-sm">Teknik</h3>
                <div className="flex flex-wrap gap-2">
                  {(result.skillsGrouped.technical || []).map((s: string) => (
                    <span key={s} className="px-2 py-1 rounded bg-surface-800 text-xs text-surface-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display font-600 mb-2 text-sm">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(result.skillsGrouped.soft || []).map((s: string) => (
                    <span key={s} className="px-2 py-1 rounded bg-surface-800 text-xs text-surface-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result.atsKeywords?.length > 0 && (
            <div>
              <h3 className="font-display font-600 mb-2">ATS Anahtar Kelimeler</h3>
              <div className="flex flex-wrap gap-2">
                {result.atsKeywords.map((k: string) => (
                  <span key={k} className="px-2 py-1 rounded bg-brand-600/20 text-brand-400 text-xs">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.coverLetter && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-display font-600">Ön Yazı</h3>
                <button onClick={() => copy(result.coverLetter)} className="text-brand-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-surface-200 text-sm whitespace-pre-wrap leading-relaxed">{result.coverLetter}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
