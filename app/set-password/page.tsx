'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-5"
    style={{ background: 'linear-gradient(160deg, #0c2340 0%, #1a3a5c 45%, #0f2d4a 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

    {/* Branding */}
    <div className="fu text-center mb-9">
      <div className="text-[56px] mb-2.5" style={{ filter: 'drop-shadow(0 0 20px rgba(125,184,232,0.4))' }}>🦁</div>
      <h1
        className="m-0 text-[32px] font-extrabold tracking-[5px] uppercase"
        style={{ background: 'linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        MBARODI FC
      </h1>
      <div className="text-[11px] text-white/40 uppercase tracking-[4px] mt-1.5 font-mono">
        Scouting · Détection · Recrutement
      </div>
    </div>

    {/* Card */}
    <div
      className="fu w-full max-w-[420px] bg-white/[0.97] rounded-3xl overflow-hidden"
      style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.35)', animationDelay: '0.1s' }}
    >
      {children}
    </div>

    <div className="mt-6 text-[10px] text-white/25 text-center font-mono tracking-[1px]">
      v1.0 · Mbarodi FC · {new Date().getFullYear()}
    </div>
  </div>
);

const inputCls = "w-full px-4 py-[13px] bg-[#f0f4f9] border-[1.5px] border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none transition-all duration-200 focus:border-[#4a9de8] focus:shadow-[0_0_0_3px_rgba(74,157,232,0.12)] placeholder:text-[#94a3b8]";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenError, setTokenError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (!token) { setTokenError('Lien invalide.'); setLoading(false); return; }
    fetch(`/api/auth/set-password?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setTokenError(d.error); })
      .catch(() => setTokenError('Erreur de connexion.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError('Prénom et nom sont obligatoires.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, firstName: firstName.trim(), lastName: lastName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setDone(true);
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <PageShell>
      <div className="px-7 py-12 text-center text-[#94a3b8] text-sm">
        Vérification du lien…
      </div>
    </PageShell>
  );

  if (tokenError) return (
    <PageShell>
      <div className="px-7 py-10 text-center">
        <div className="text-[44px] mb-4">⚠️</div>
        <div className="text-[17px] font-extrabold text-[#0c2340] mb-2">Lien invalide</div>
        <div className="text-[13px] text-[#64748b] leading-relaxed">{tokenError}</div>
      </div>
    </PageShell>
  );

  if (done) return (
    <PageShell>
      <div className="px-7 py-10 text-center">
        <div className="text-[44px] mb-4">✅</div>
        <div className="text-[17px] font-extrabold text-[#0c2340] mb-2">
          Bienvenue, {firstName} !
        </div>
        <div className="text-[13px] text-[#64748b] leading-relaxed">
          Votre compte est prêt. Vous pouvez maintenant vous connecter à la plateforme.
        </div>
        <div className="text-[13px] text-[#64748b] leading-relaxed">
          <Link href="/" className="text-[#1e6cb6]">
          <button
            className="flex-1 px-4 py-[11px] bg-transparent border-none border-b-2 text-[13px] font-semibold cursor-pointer transition-all duration-150 text-[#1e6cb6] border-b-transparent hover:text-[#475569]"
          >
            Se connecter
          </button>
          </Link>
        </div>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="px-7 pt-7">
        <div className="text-[13px] font-bold text-[#1e6cb6] mb-1">🔑 Activation du compte</div>
        <div className="text-[20px] font-extrabold text-[#0c2340] mb-1">Créez votre profil</div>
        <div className="text-[13px] text-[#64748b] mb-6 leading-[1.5]">
          Renseignez vos informations personnelles et choisissez un mot de passe.
        </div>
      </div>

      <div className="h-px bg-[#e2e8f0] mx-7" />

      <form onSubmit={handleSubmit} className="px-7 pt-6 pb-7 flex flex-col gap-4">
        {/* Identité */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="lbl">Prénom *</div>
            <input
              className={inputCls}
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setError(''); }}
              placeholder="Votre prénom"
              autoFocus
              required
            />
          </div>
          <div>
            <div className="lbl">Nom *</div>
            <input
              className={inputCls}
              value={lastName}
              onChange={e => { setLastName(e.target.value); setError(''); }}
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        <div className="h-px bg-[#e2e8f0]" />

        {/* Mot de passe */}
        <div>
          <div className="lbl">Mot de passe *</div>
          <input
            className={inputCls}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="6 caractères minimum"
            required
          />
        </div>
        <div>
          <div className="lbl">Confirmer le mot de passe *</div>
          <input
            className={inputCls}
            type="password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            placeholder="Répétez le mot de passe"
            required
          />
        </div>

        {/* Indicateur force */}
        {password.length > 0 && (
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex-1 h-1 rounded transition-colors duration-200"
                style={{ background: password.length >= i * 4 ? (password.length >= 10 ? '#16a34a' : '#f59e0b') : '#e2e8f0' }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="px-3.5 py-2.5 bg-[#fef2f2] rounded-[10px] text-xs text-[#dc2626]">
            {error}
          </div>
        )}

        <button
          className="w-full py-3.5 border-none rounded-xl text-sm font-bold bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] text-white cursor-pointer shadow-[0_4px_16px_rgba(12,35,64,0.25)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(12,35,64,0.35)] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={submitting || !firstName || !lastName || !password || !confirm}
        >
          {submitting ? 'Enregistrement…' : 'Créer mon compte'}
        </button>
      </form>
    </PageShell>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center text-white/50 text-sm"
        style={{ background: 'linear-gradient(160deg, #0c2340 0%, #1a3a5c 45%, #0f2d4a 100%)' }}
      >
        Chargement…
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
