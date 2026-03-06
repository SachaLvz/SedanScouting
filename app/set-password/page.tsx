'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setTokenError('Lien invalide.'); setLoading(false); return; }
    fetch(`/api/auth/set-password?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setTokenError(d.error);
        else setUser({ firstName: d.firstName, lastName: d.lastName });
      })
      .catch(() => setTokenError('Erreur de connexion.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
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
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>Vérification du lien...</div>
  );

  if (tokenError) return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '32px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: '#dc2626', margin: '0 0 8px' }}>Lien invalide</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>{tokenError}</p>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '32px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: '#16a34a', margin: '0 0 8px' }}>Mot de passe créé !</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>Vous pouvez maintenant vous connecter à l&apos;application.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '32px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
      <h2 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: 22, fontWeight: 800 }}>Créer votre mot de passe</h2>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
        Bienvenue, <strong>{[user?.firstName, user?.lastName].filter(Boolean).join(' ')}</strong>
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Mot de passe <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="password"
            className="inp"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            required
            autoFocus
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Confirmer le mot de passe <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="password"
            className="inp"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            required
          />
        </div>
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn-p"
          style={{ padding: '12px', fontSize: 15, fontWeight: 700, opacity: submitting ? 0.6 : 1 }}
          disabled={submitting}
        >
          {submitting ? 'Enregistrement...' : 'Créer mon mot de passe'}
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>Chargement...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
