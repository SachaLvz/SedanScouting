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
    <div className="fu max-w-[600px] mx-auto px-5 pb-[60px]">
      <h2 className="m-0 mb-4 text-xl font-extrabold text-[#0c2340]">Gestion des scouts</h2>

      <div className="flex flex-col gap-1.5 mb-5">
        {scouts.map(s => (
          <div key={s.id} className="card px-[18px] py-3.5" style={{ borderColor: s.id === curScout ? '#4a9de8' : undefined }}>
            {editId === s.id ? (
              <div className="flex gap-2 items-center">
                <input
                  className="inp flex-1"
                  value={editForm.lastName}
                  onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                  autoFocus
                  disabled={loading}
                />
                <select className="inp w-auto" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
                  <option value="scout">Scout</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn-p px-3.5 py-2 text-xs" onClick={saveEdit} disabled={loading}>✓</button>
                <button onClick={() => setEditId(null)} className="bg-transparent border-none cursor-pointer text-[#94a3b8] text-lg leading-none">✕</button>
              </div>
            ) : deleteConfirm === s.id ? (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#dc2626]">Supprimer <strong>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</strong> ?</span>
                <div className="flex gap-2">
                  <button onClick={() => deleteScout(s.id)} disabled={loading} className="bg-[#dc2626] text-white border-none rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer">Supprimer</button>
                  <button onClick={() => setDeleteConfirm(null)} className="bg-transparent border border-[#e2e8f0] rounded-lg px-3.5 py-1.5 text-xs cursor-pointer text-[#475569]">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-[#0c2340]">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</div>
                  <div className="text-[11px] text-[#94a3b8]">{s.role === 'admin' ? 'Admin — voit tous les rapports' : 'Scout — voit ses rapports uniquement'}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <Tag color={s.role === 'admin' ? '#9333ea' : '#1e6cb6'} bg={s.role === 'admin' ? '#faf5ff' : '#eef5fd'}>{s.role}</Tag>
                  <button onClick={() => startEdit(s)} className="bg-transparent border border-[#e2e8f0] rounded-lg px-2.5 py-[5px] text-xs cursor-pointer text-[#475569]">Éditer</button>
                  <button onClick={() => { setDeleteConfirm(s.id); setEditId(null); }} className="bg-transparent border border-[#fecaca] rounded-lg px-2.5 py-[5px] text-xs cursor-pointer text-[#dc2626]">Suppr.</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card p-[18px]">
        <div className="lbl mb-3">Inviter un scout</div>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <div>
            <label className="block text-[11px] font-bold mb-1" style={{ color: fieldError('firstName') ? '#dc2626' : '#94a3b8' }}>Prénom *</label>
            <input
              className="inp"
              style={{ borderColor: fieldError('firstName') ? '#dc2626' : undefined }}
              value={form.firstName}
              onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
              placeholder="Prénom"
              disabled={loading}
            />
            {fieldError('firstName') && <div className="text-[10px] text-[#dc2626] mt-[3px]">Obligatoire</div>}
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1" style={{ color: fieldError('lastName') ? '#dc2626' : '#94a3b8' }}>Nom *</label>
            <input
              className="inp"
              style={{ borderColor: fieldError('lastName') ? '#dc2626' : undefined }}
              value={form.lastName}
              onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
              placeholder="Nom de famille"
              disabled={loading}
            />
            {fieldError('lastName') && <div className="text-[10px] text-[#dc2626] mt-[3px]">Obligatoire</div>}
          </div>
        </div>
        <div className="mb-2.5">
          <label className="block text-[11px] font-bold mb-1" style={{ color: fieldError('email') ? '#dc2626' : '#94a3b8' }}>Email *</label>
          <input
            type="email"
            className="inp"
            style={{ borderColor: fieldError('email') ? '#dc2626' : undefined }}
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="scout@exemple.com"
            disabled={loading}
          />
          {fieldError('email') && <div className="text-[10px] text-[#dc2626] mt-[3px]">Email valide obligatoire</div>}
        </div>
        <div className="flex gap-2">
          <select className="inp w-auto" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
            <option value="scout">Scout</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="btn-p flex-1 px-[18px] py-2.5 text-[13px] font-bold"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onClick={addScout}
            disabled={loading}
          >
            {loading ? '…' : "Envoyer l'invitation"}
          </button>
        </div>
        {error && (
          <div className="mt-2.5 px-3 py-2 bg-[#fef2f2] rounded-lg text-xs text-[#dc2626]">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-2.5 px-3 py-2 bg-[#f0fdf4] rounded-lg text-xs text-[#16a34a] font-semibold">
            ✓ {success}
          </div>
        )}
      </div>

      <div className="mt-4 px-4 py-3 bg-[#eff6ff] rounded-[10px] text-xs text-[#1e40af]">
        En mode <strong>Admin</strong>, vous voyez tous les rapports de tous les scouts.<br />
        En mode <strong>Scout</strong>, vous ne voyez que vos propres rapports (objectivité).
      </div>
    </div>
  );
}
