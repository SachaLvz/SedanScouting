import { useState } from 'react';
import { CATS, VILLES, NIVEAUX, DECISIONS } from '../config';
import NotePicker from '../NotePicker';
import type { Rapport, Player, Scout, Match } from '../config';

interface ReportModalProps {
  rForm: Rapport;
  setRForm: React.Dispatch<React.SetStateAction<Rapport | null>>;
  sel: Player;
  scout: Scout | undefined;
  pendingMatches: Match[];
  onSave: () => void;
  onClose: () => void;
}

export default function ReportModal({ rForm, setRForm, sel, scout, pendingMatches, onSave, onClose }: ReportModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const missingComments = submitted
    ? CATS.filter(c => !rForm.commentaires[c.key]?.trim()).map(c => c.key)
    : [];

  const errors = submitted ? {
    date: !rForm.date,
    minutesJouees: !rForm.minutesJouees,
    contexte: !rForm.contexte?.trim(),
    conclusion: !rForm.conclusion?.trim(),
  } : {} as Record<string, boolean>;

  const hasError = !rForm.date || !rForm.minutesJouees || !rForm.contexte?.trim()
    || CATS.some(c => !rForm.commentaires[c.key]?.trim()) || !rForm.conclusion?.trim();

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    onSave();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu" style={{ maxWidth: 620, width: '100%', padding: 28, alignSelf: 'flex-start', boxShadow: 'var(--shL)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>Rapport de match</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--t3)' }}>{sel.lastName.toUpperCase()} {sel.firstName} · {sel.poste} · Scout: {[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}</p>
          </div>
          <button className="btn-g" style={{ padding: '6px 10px', fontSize: 14 }} onClick={onClose}>✕</button>
        </div>

        {pendingMatches.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Rattacher à un match (optionnel)</label>
            <select className="inp" value={rForm.matchId} onChange={e => setRForm(p => p ? { ...p, matchId: e.target.value } : p)}>
              <option value="">— Rapport libre —</option>
              {pendingMatches.map(m => <option key={m.id} value={m.id}>{m.date} · {m.equipe1} vs {m.equipe2}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="lbl" style={{ color: errors.date ? '#dc2626' : undefined }}>Date *</label>
            <input type="date" className="inp" style={{ borderColor: errors.date ? '#dc2626' : undefined }} value={rForm.date} onChange={e => setRForm(p => p ? { ...p, date: e.target.value } : p)} />
            {errors.date && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Date obligatoire</div>}
          </div>
          <div><label className="lbl">Lieu</label><select className="inp" value={rForm.lieu} onChange={e => setRForm(p => p ? { ...p, lieu: e.target.value } : p)}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
          <div>
            <label className="lbl" style={{ color: errors.minutesJouees ? '#dc2626' : undefined }}>Minutes jouées *</label>
            <input type="number" className="inp" style={{ borderColor: errors.minutesJouees ? '#dc2626' : undefined }} value={rForm.minutesJouees} onChange={e => setRForm(p => p ? { ...p, minutesJouees: e.target.value } : p)} placeholder="90" />
            {errors.minutesJouees && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Champ obligatoire</div>}
          </div>
          <div>
            <label className="lbl" style={{ color: errors.contexte ? '#dc2626' : undefined }}>Contexte *</label>
            <input className="inp" style={{ borderColor: errors.contexte ? '#dc2626' : undefined }} value={rForm.contexte} onChange={e => setRForm(p => p ? { ...p, contexte: e.target.value } : p)} placeholder="Match amical, détection..." />
            {errors.contexte && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Champ obligatoire</div>}
          </div>
        </div>

        {CATS.map(cat => (
          <div key={cat.key} style={{ background: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 10, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{cat.icon} {cat.label}</span>
              <span style={{ fontSize: 9, color: 'var(--t3)', maxWidth: 180, textAlign: 'right' }}>{cat.hint}</span>
            </div>
            <NotePicker
              value={rForm.ratings[cat.key]}
              onChange={v => setRForm(p => p ? { ...p, ratings: { ...p.ratings, [cat.key]: v } } : p)}
            />
            <textarea
              className="inp"
              style={{ marginTop: 8, height: 52, resize: 'vertical', background: '#fff', borderColor: missingComments.includes(cat.key) ? '#dc2626' : undefined }}
              value={rForm.commentaires[cat.key]}
              onChange={e => setRForm(p => p ? { ...p, commentaires: { ...p.commentaires, [cat.key]: e.target.value } } : p)}
              placeholder={`Analyse ${cat.label.toLowerCase()}... *`}
            />
            {missingComments.includes(cat.key) && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Commentaire obligatoire</div>}
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, marginTop: 4 }}>
          <div><label className="lbl">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e => setRForm(p => p ? { ...p, niveauActuel: e.target.value } : p)}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
          <div><label className="lbl">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e => setRForm(p => p ? { ...p, potentiel: e.target.value } : p)}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="lbl" style={{ color: errors.conclusion ? '#dc2626' : undefined }}>Conclusion *</label>
          <textarea
            className="inp"
            style={{ height: 80, resize: 'vertical', borderColor: errors.conclusion ? '#dc2626' : undefined }}
            value={rForm.conclusion}
            onChange={e => setRForm(p => p ? { ...p, conclusion: e.target.value } : p)}
            placeholder="Profil complet du joueur..."
          />
          {errors.conclusion && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>Conclusion obligatoire</div>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="lbl" style={{ color: '#dc2626' }}>Décision *</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {DECISIONS.map(d => (
              <button
                key={d.v}
                onClick={() => setRForm(p => p ? { ...p, decision: d.v } : p)}
                style={{
                  padding: '8px 12px', borderRadius: 10,
                  border: rForm.decision === d.v ? `2px solid ${d.c}` : '2px solid transparent',
                  cursor: 'pointer', background: rForm.decision === d.v ? d.bg : '#f8fafc',
                  color: rForm.decision === d.v ? d.c : '#94a3b8',
                  fontSize: 11, fontWeight: 700, transition: 'all .15s',
                }}
              >
                {d.i} {d.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: 10, fontSize: 11, color: '#92400e', marginBottom: 16 }}>
          🔒 Une fois validé, le rapport sera verrouillé définitivement.
        </div>

        {submitted && hasError && (
          <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 10, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            Veuillez remplir tous les champs obligatoires (*) avant de valider.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-g" style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 600 }} onClick={onClose}>Annuler</button>
          <button
            className="btn-p"
            style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 700 }}
            onClick={handleSave}
          >
            🔒 Valider et verrouiller
          </button>
        </div>
      </div>
    </div>
  );
}
