import { VILLES } from '../config';
import type { Match } from '../config';

interface MatchFormModalProps {
  matchForm: Match;
  setMatchForm: React.Dispatch<React.SetStateAction<Match | null>>;
  onSave: () => void;
  onClose: () => void;
}

export default function MatchFormModal({ matchForm, setMatchForm, onSave, onClose }: MatchFormModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '40px 16px', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu" style={{ maxWidth: 480, width: '100%', padding: 28, alignSelf: 'flex-start', boxShadow: 'var(--shL)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Programmer un match</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div><label className="lbl">Équipe 1 *</label><input className="inp" value={matchForm.equipe1} onChange={e => setMatchForm(p => p ? { ...p, equipe1: e.target.value } : p)} placeholder="Dakar FC" /></div>
          <div><label className="lbl">Équipe 2 *</label><input className="inp" value={matchForm.equipe2} onChange={e => setMatchForm(p => p ? { ...p, equipe2: e.target.value } : p)} placeholder="Thiès United" /></div>
          <div><label className="lbl">Date</label><input type="date" className="inp" value={matchForm.date} onChange={e => setMatchForm(p => p ? { ...p, date: e.target.value } : p)} /></div>
          <div><label className="lbl">Lieu</label><select className="inp" value={matchForm.lieu} onChange={e => setMatchForm(p => p ? { ...p, lieu: e.target.value } : p)}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label className="lbl">Horaire</label><input type="time" className="inp" value={matchForm.hour} onChange={e => setMatchForm(p => p ? { ...p, horaire: e.target.value } : p)} /></div>
          <div><label className="lbl">Compétition</label><input className="inp" value={matchForm.competition} onChange={e => setMatchForm(p => p ? { ...p, competition: e.target.value } : p)} placeholder="Détection, Championnat..." /></div>
          <div>
            <label className="lbl">Type</label>
            <select className="inp" value={matchForm.type} onChange={e => setMatchForm(p => p ? { ...p, type: e.target.value } : p)}>
              <option value="live">🏟 Live / Terrain</option>
              <option value="video">📹 Vidéo</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-g" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={onClose}>Annuler</button>
          <button className="btn-p" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={onSave}>Programmer</button>
        </div>
      </div>
    </div>
  );
}
