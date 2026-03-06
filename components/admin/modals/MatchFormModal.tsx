import { useState } from 'react';
import { VILLES } from '../config';
import type { Match } from '../config';

interface MatchFormModalProps {
  matchForm: Match;
  setMatchForm: React.Dispatch<React.SetStateAction<Match | null>>;
  onSave: () => void;
  onClose: () => void;
}

const REQUIRED_FIELDS: { key: keyof Match; label: string }[] = [
  { key: 'equipe1',     label: 'Équipe 1' },
  { key: 'equipe2',     label: 'Équipe 2' },
  { key: 'date',        label: 'Date' },
  { key: 'lieu',        label: 'Lieu' },
  { key: 'hour',        label: 'Horaire' },
  { key: 'competition', label: 'Compétition' },
];

export default function MatchFormModal({ matchForm, setMatchForm, onSave, onClose }: MatchFormModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const errors: Partial<Record<keyof Match, string>> = {};
  if (submitted) {
    for (const f of REQUIRED_FIELDS) {
      if (!matchForm[f.key]) errors[f.key] = `${f.label} est obligatoire`;
    }
  }

  const handleSave = () => {
    setSubmitted(true);
    const hasError = REQUIRED_FIELDS.some(f => !matchForm[f.key]);
    if (hasError) return;
    onSave();
  };

  const field = (key: keyof Match) => ({
    borderColor: errors[key] ? '#dc2626' : undefined,
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '40px 16px', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu" style={{ maxWidth: 480, width: '100%', padding: 28, alignSelf: 'flex-start', boxShadow: 'var(--shL)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Programmer un match</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="lbl">Équipe 1 *</label>
            <input className="inp" style={field('equipe1')} value={matchForm.equipe1} onChange={e => setMatchForm(p => p ? { ...p, equipe1: e.target.value } : p)} placeholder="Dakar FC" />
            {errors.equipe1 && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.equipe1}</div>}
          </div>
          <div>
            <label className="lbl">Équipe 2 *</label>
            <input className="inp" style={field('equipe2')} value={matchForm.equipe2} onChange={e => setMatchForm(p => p ? { ...p, equipe2: e.target.value } : p)} placeholder="Thiès United" />
            {errors.equipe2 && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.equipe2}</div>}
          </div>
          <div>
            <label className="lbl">Date *</label>
            <input type="date" className="inp" style={field('date')} value={matchForm.date} onChange={e => setMatchForm(p => p ? { ...p, date: e.target.value } : p)} />
            {errors.date && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.date}</div>}
          </div>
          <div>
            <label className="lbl">Lieu *</label>
            <select className="inp" style={field('lieu')} value={matchForm.lieu} onChange={e => setMatchForm(p => p ? { ...p, lieu: e.target.value } : p)}>
              <option value="">— Choisir —</option>
              {VILLES.map(v => <option key={v}>{v}</option>)}
            </select>
            {errors.lieu && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.lieu}</div>}
          </div>
          <div>
            <label className="lbl">Horaire *</label>
            <input type="time" className="inp" style={field('hour')} value={matchForm.hour} onChange={e => setMatchForm(p => p ? { ...p, hour: e.target.value } : p)} />
            {errors.hour && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.hour}</div>}
          </div>
          <div>
            <label className="lbl">Compétition *</label>
            <input className="inp" style={field('competition')} value={matchForm.competition} onChange={e => setMatchForm(p => p ? { ...p, competition: e.target.value } : p)} placeholder="Détection, Championnat..." />
            {errors.competition && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{errors.competition}</div>}
          </div>
          <div>
            <label className="lbl">Type</label>
            <select className="inp" value={matchForm.type} onChange={e => setMatchForm(p => p ? { ...p, type: e.target.value } : p)}>
              <option value="live">🏟 Live / Terrain</option>
              <option value="video">📹 Vidéo</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="ghost-btn" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={onClose}>Annuler</button>
          <button className="glow-btn" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={handleSave}>Programmer</button>
        </div>
      </div>
    </div>
  );
}
