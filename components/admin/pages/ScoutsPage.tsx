'use client';
import { useState } from 'react';
import Tag from '../Tag';
import type { Scout } from '../config';

interface PasswordState {
  id: string;
  newPwd: string;
  confirmPwd: string;
  loading: boolean;
  error: string;
  success: boolean;
}

interface ScoutsPageProps {
  scouts: Scout[];
  setScouts: React.Dispatch<React.SetStateAction<Scout[]>>;
  curScout: string;
  setCurScout: (id: string) => void;
}

const blankForm = { email: '', role: 'scout' };

function CopyLinkBox({ link, onClose }: { link: string; onClose?: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-[#1e40af]">🔗 Lien d&apos;activation (valable 48h)</span>
        {onClose && (
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#94a3b8] text-sm leading-none">✕</button>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <code className="flex-1 text-[10px] bg-white px-2 py-1.5 rounded-lg border border-[#e2e8f0] text-[#0c2340] break-all leading-relaxed">
          {link}
        </code>
        <button
          onClick={copy}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer shrink-0 border-none transition-colors"
          style={{ background: copied ? '#16a34a' : '#1e6cb6', color: '#fff' }}
        >
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
    </div>
  );
}

export default function ScoutsPage({ scouts, setScouts, curScout, setCurScout }: ScoutsPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ lastName: '', role: 'scout', newPwd: '', confirmPwd: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [submitted, setSubmitted] = useState(false);
  const [regenState, setRegenState] = useState<{ id: string; link: string } | null>(null);
  const [regenLoading, setRegenLoading] = useState<string | null>(null);
  const [pwdState, setPwdState] = useState<PasswordState | null>(null);

  const hasFormError = !form.email.trim() || !/\S+@\S+\.\S+/.test(form.email);

  const addScout = async () => {
    setSubmitted(true);
    if (hasFormError) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCreatedLink(null);
    try {
      const res = await fetch('/api/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setScouts(prev => [...prev, data as Scout]);
      setForm(blankForm);
      setSubmitted(false);
      setSuccess(`Invitation envoyée à ${data.email ?? form.email}`);
      if (data.inviteLink) setCreatedLink(data.inviteLink);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const openPwd = (id: string) => {
    setPwdState(prev => prev?.id === id ? null : { id, newPwd: '', confirmPwd: '', loading: false, error: '', success: false });
    setRegenState(null);
  };

  const savePwd = async () => {
    if (!pwdState) return;
    if (pwdState.newPwd.length < 6) { setPwdState(p => p ? { ...p, error: 'Au moins 6 caractères.' } : p); return; }
    if (pwdState.newPwd !== pwdState.confirmPwd) { setPwdState(p => p ? { ...p, error: 'Les mots de passe ne correspondent pas.' } : p); return; }
    setPwdState(p => p ? { ...p, loading: true, error: '' } : p);
    try {
      const res = await fetch(`/api/scouts/${pwdState.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwdState.newPwd, requesterId: curScout }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdState(p => p ? { ...p, loading: false, error: data.error ?? 'Erreur serveur' } : p); return; }
      setPwdState(p => p ? { ...p, loading: false, success: true } : p);
      setTimeout(() => setPwdState(null), 2000);
    } catch {
      setPwdState(p => p ? { ...p, loading: false, error: 'Erreur réseau.' } : p);
    }
  };

  const regenerateLink = async (id: string) => {
    setRegenLoading(id);
    setRegenState(null);
    try {
      const res = await fetch(`/api/scouts/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail: true }),
      });
      const data = await res.json();
      if (res.ok && data.inviteLink) setRegenState({ id, link: data.inviteLink });
    } catch {/* ignore */} finally {
      setRegenLoading(null);
    }
  };

  const startEdit = (s: Scout) => {
    setEditId(s.id);
    setEditForm({ lastName: s.lastName, role: s.role, newPwd: '', confirmPwd: '' });
    setDeleteConfirm(null);
    setRegenState(null);
    setPwdState(null);
  };

  const saveEdit = async () => {
    if (!editId || !editForm.lastName) return;

    // Validation mot de passe si renseigné
    if (editForm.newPwd) {
      if (editForm.newPwd.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
      if (editForm.newPwd !== editForm.confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }
    }

    setLoading(true);
    setError(null);
    try {
      // Sauvegarde nom + rôle
      const res = await fetch(`/api/scouts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: editForm.lastName, role: editForm.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
      setScouts(prev => prev.map(s => s.id === editId ? { ...s, lastName: data.lastName, role: data.role } : s));

      // Sauvegarde mot de passe si renseigné
      if (editForm.newPwd) {
        const resPwd = await fetch(`/api/scouts/${editId}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: editForm.newPwd, requesterId: curScout }),
        });
        if (!resPwd.ok) { const d = await resPwd.json(); setError(d.error ?? 'Erreur mot de passe'); return; }
      }

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

  const fieldError = (field: 'email') => {
    if (!submitted) return false;
    return !form.email.trim() || !/\S+@\S+\.\S+/.test(form.email);
  };

  return (
    <div className="fu max-w-[600px] mx-auto px-5 pb-[60px]">
      <h2 className="m-0 mb-4 text-xl font-extrabold text-[#0c2340]">Gestion des accès</h2>

      <div className="flex flex-col gap-1.5 mb-5">
        {scouts.map(s => (
          <div key={s.id} className="card px-[18px] py-3.5" style={{ borderColor: s.id === curScout ? '#4a9de8' : undefined }}>
            {editId === s.id ? (
              <div className="flex flex-col gap-2.5">
                <div className="text-[11px] font-bold text-[#475569] mb-0.5">Éditer le compte</div>

                {/* Nom + rôle */}
                <div className="flex gap-2 items-center">
                  <input
                    className="inp flex-1 text-xs py-2"
                    value={editForm.lastName}
                    onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Nom de famille"
                    autoFocus
                    disabled={loading}
                  />
                  <select className="inp w-auto text-xs py-2" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} disabled={loading}>
                    <option value="scout">Scout</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Mot de passe (scouts + compte propre uniquement) */}
                {(s.role === 'scout' || s.id === curScout) && (
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#e2e8f0]">
                    <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">Mot de passe — laisser vide pour ne pas changer</div>
                    <input
                      className="inp text-xs py-2"
                      type="password"
                      placeholder="Nouveau mot de passe (6 car. min)"
                      value={editForm.newPwd}
                      onChange={e => { setEditForm(p => ({ ...p, newPwd: e.target.value })); setError(null); }}
                      disabled={loading}
                    />
                    {editForm.newPwd && (
                      <input
                        className="inp text-xs py-2"
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        value={editForm.confirmPwd}
                        onChange={e => { setEditForm(p => ({ ...p, confirmPwd: e.target.value })); setError(null); }}
                        disabled={loading}
                      />
                    )}
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div className="px-3 py-2 bg-[#fef2f2] rounded-lg text-[11px] text-[#dc2626]">{error}</div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-0.5">
                  <button className="btn-p flex-1 py-2 text-xs" onClick={saveEdit} disabled={loading}>{loading ? '…' : '✓ Enregistrer'}</button>
                  <button onClick={() => { setEditId(null); setError(null); }} className="btn-g px-3.5 py-2 text-xs">Annuler</button>
                </div>
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
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div>
                      <div className="text-sm font-bold text-[#0c2340]">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</div>
                      <div className="text-[11px] text-[#94a3b8]">{s.email ?? ''}</div>
                    </div>
                    {s.hasPassword === false && (
                      <span className="text-[10px] font-bold bg-[#fffbeb] text-[#d97706] px-2 py-[3px] rounded-lg border border-[#fde68a]">⏳ Invitation en attente</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 items-center flex-wrap">
                    <Tag color={s.role === 'admin' ? '#9333ea' : '#1e6cb6'} bg={s.role === 'admin' ? '#faf5ff' : '#eef5fd'}>{s.role}</Tag>
                    {s.hasPassword === false && (
                      <button
                        onClick={() => regenState?.id === s.id ? setRegenState(null) : regenerateLink(s.id)}
                        disabled={regenLoading === s.id}
                        className="border border-[#bfdbfe] bg-[#eff6ff] rounded-lg px-2.5 py-[5px] text-[11px] font-semibold cursor-pointer text-[#1e40af] hover:bg-[#dbeafe]"
                      >
                        {regenLoading === s.id ? '…' : '🔗 Lien'}
                      </button>
                    )}
                    <button onClick={() => startEdit(s)} className="bg-transparent border border-[#e2e8f0] rounded-lg px-2.5 py-[5px] text-xs cursor-pointer text-[#475569]">Éditer</button>
                    <button onClick={() => { setDeleteConfirm(s.id); setEditId(null); setRegenState(null); setPwdState(null); }} className="bg-transparent border border-[#fecaca] rounded-lg px-2.5 py-[5px] text-xs cursor-pointer text-[#dc2626]">Suppr.</button>
                  </div>
                </div>
                {regenState?.id === s.id && (
                  <CopyLinkBox link={regenState.link} onClose={() => setRegenState(null)} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card p-[18px]">
        <div className="lbl mb-1">Inviter un nouvel utilisateur</div>
        <div className="text-[11px] text-[#94a3b8] mb-3 leading-relaxed">
          La personne invitée renseignera elle-même son nom et son mot de passe via le lien.
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
        {createdLink && (
          <CopyLinkBox link={createdLink} onClose={() => setCreatedLink(null)} />
        )}
      </div>

      <div className="mt-4 px-4 py-3 bg-[#eff6ff] rounded-[10px] text-xs text-[#1e40af]">
        En mode <strong>Admin</strong>, vous voyez tous les rapports de tous les scouts.<br />
        En mode <strong>Scout</strong>, vous ne voyez que vos propres rapports (objectivité).
      </div>
    </div>
  );
}
