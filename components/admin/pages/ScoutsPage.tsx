import { useState } from 'react';
import Tag from '../Tag';
import type { Scout } from '../config';

interface ScoutsPageProps {
  scouts: Scout[];
  setScouts: React.Dispatch<React.SetStateAction<Scout[]>>;
  curScout: string;
  setCurScout: (id: string) => void;
  scoutForm: { nom: string; role: string };
  setScoutForm: React.Dispatch<React.SetStateAction<{ nom: string; role: string }>>;
}

export default function ScoutsPage({ scouts, setScouts, curScout, setCurScout, scoutForm, setScoutForm }: ScoutsPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addScout = async () => {
    if (!scoutForm.nom) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: scoutForm.nom, role: scoutForm.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setScouts(prev => [...prev, data as Scout]);
      setScoutForm({ nom: '', role: 'scout' });
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fu" style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px 60px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>👥 Gestion des scouts</h2>

      <div style={{ marginBottom: 16 }}>
        <div className="lbl" style={{ marginBottom: 8 }}>Connecté en tant que</div>
        <select className="inp" value={curScout} onChange={e => setCurScout(e.target.value)}>
          {scouts.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.role})</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {scouts.map(s => (
          <div key={s.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: s.id === curScout ? 'var(--blueL)' : undefined }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{s.nom}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{s.role === 'admin' ? 'Admin — voit tous les rapports' : 'Scout — voit ses rapports uniquement'}</div>
            </div>
            <Tag color={s.role === 'admin' ? '#9333ea' : 'var(--blue)'} bg={s.role === 'admin' ? '#faf5ff' : 'var(--blueG)'}>{s.role}</Tag>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="lbl" style={{ marginBottom: 10 }}>Ajouter un scout</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="inp"
            style={{ flex: 1 }}
            value={scoutForm.nom}
            onChange={e => setScoutForm(p => ({ ...p, nom: e.target.value }))}
            placeholder="Nom du scout"
            onKeyDown={e => { if (e.key === 'Enter') addScout(); }}
            disabled={loading}
          />
          <select className="inp" style={{ width: 'auto' }} value={scoutForm.role} onChange={e => setScoutForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
            <option value="scout">Scout</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="btn-p"
            style={{ padding: '10px 18px', fontSize: 12, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={addScout}
            disabled={loading}
          >
            {loading ? '…' : '+'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, fontSize: 12, color: '#1e40af' }}>
        ℹ️ En mode <strong>Admin</strong>, vous voyez tous les rapports de tous les scouts.<br />
        En mode <strong>Scout</strong>, vous ne voyez que vos propres rapports (objectivité).
      </div>
    </div>
  );
}
