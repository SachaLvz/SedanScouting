import { useState } from 'react';
import Tag from '../Tag';
import type { Scout } from '../config';

interface ScoutsPageProps {
  scouts: Scout[];
  setScouts: React.Dispatch<React.SetStateAction<Scout[]>>;
  curScout: string;
  setCurScout: (id: string) => void;
}

const blankForm = { firstName: '', lastName: '', email: '', role: 'scout' };

export default function ScoutsPage({ scouts, setScouts, curScout, setCurScout }: ScoutsPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ lastName: '', role: 'scout' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [submitted, setSubmitted] = useState(false);

  const hasFormError = !form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !/\S+@\S+\.\S+/.test(form.email);

  const addScout = async () => {
    setSubmitted(true);
    if (hasFormError) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setScouts(prev => [...prev, data as Scout]);
      setForm(blankForm);
      setSubmitted(false);
      setSuccess(`Invitation envoyée à ${data.email ?? form.email}`);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: Scout) => {
    setEditId(s.id);
    setEditForm({ lastName: s.lastName, role: s.role });
    setDeleteConfirm(null);
  };

  const saveEdit = async () => {
    if (!editId || !editForm.lastName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scouts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: editForm.lastName, role: editForm.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setScouts(prev => prev.map(s => s.id === editId ? { ...s, lastName: data.lastName, role: data.role } : s));
      setEditId(null);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const deleteScout = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scouts/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur serveur'); return; }
      setScouts(prev => prev.filter(s => s.id !== id));
      if (curScout === id) setCurScout(scouts.find(s => s.id !== id)?.id ?? '');
      setDeleteConfirm(null);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: 'firstName' | 'lastName' | 'email') => {
    if (!submitted) return false;
    if (field === 'email') return !form.email.trim() || !/\S+@\S+\.\S+/.test(form.email);
    return !form[field].trim();
  };

  return (
    <div className="fu" style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px 60px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>Gestion des scouts</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {scouts.map(s => (
          <div key={s.id} className="card" style={{ padding: '14px 18px', borderColor: s.id === curScout ? 'var(--blueL)' : undefined }}>
            {editId === s.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="inp"
                  style={{ flex: 1 }}
                  value={editForm.lastName}
                  onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                  autoFocus
                  disabled={loading}
                />
                <select className="inp" style={{ width: 'auto' }} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
                  <option value="scout">Scout</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn-p" style={{ padding: '8px 14px', fontSize: 12 }} onClick={saveEdit} disabled={loading}>✓</button>
                <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>
            ) : deleteConfirm === s.id ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#dc2626' }}>Supprimer <strong>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</strong> ?</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => deleteScout(s.id)} disabled={loading} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Supprimer</button>
                  <button onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--t2)' }}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{s.role === 'admin' ? 'Admin — voit tous les rapports' : 'Scout — voit ses rapports uniquement'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tag color={s.role === 'admin' ? '#9333ea' : 'var(--blue)'} bg={s.role === 'admin' ? '#faf5ff' : 'var(--blueG)'}>{s.role}</Tag>
                  <button onClick={() => startEdit(s)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--t2)' }}>Éditer</button>
                  <button onClick={() => { setDeleteConfirm(s.id); setEditId(null); }} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Suppr.</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="lbl" style={{ marginBottom: 12 }}>Inviter un scout</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: fieldError('firstName') ? '#dc2626' : 'var(--t3)', marginBottom: 4 }}>Prénom *</label>
            <input
              className="inp"
              style={{ borderColor: fieldError('firstName') ? '#dc2626' : undefined }}
              value={form.firstName}
              onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
              placeholder="Prénom"
              disabled={loading}
            />
            {fieldError('firstName') && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Obligatoire</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: fieldError('lastName') ? '#dc2626' : 'var(--t3)', marginBottom: 4 }}>Nom *</label>
            <input
              className="inp"
              style={{ borderColor: fieldError('lastName') ? '#dc2626' : undefined }}
              value={form.lastName}
              onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
              placeholder="Nom de famille"
              disabled={loading}
            />
            {fieldError('lastName') && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Obligatoire</div>}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: fieldError('email') ? '#dc2626' : 'var(--t3)', marginBottom: 4 }}>Email *</label>
          <input
            type="email"
            className="inp"
            style={{ borderColor: fieldError('email') ? '#dc2626' : undefined }}
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="scout@exemple.com"
            disabled={loading}
          />
          {fieldError('email') && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Email valide obligatoire</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="inp" style={{ width: 'auto' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
            <option value="scout">Scout</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="btn-p"
            style={{ flex: 1, padding: '10px 18px', fontSize: 13, fontWeight: 700, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={addScout}
            disabled={loading}
          >
            {loading ? '…' : 'Envoyer l\'invitation'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            ✓ {success}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, fontSize: 12, color: '#1e40af' }}>
        En mode <strong>Admin</strong>, vous voyez tous les rapports de tous les scouts.<br />
        En mode <strong>Scout</strong>, vous ne voyez que vos propres rapports (objectivité).
      </div>
    </div>
  );
}
