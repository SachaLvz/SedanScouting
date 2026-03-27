import { useState } from 'react';
import { createPortal } from 'react-dom';
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

  const modal = (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] flex justify-center px-4 py-5 overflow-y-auto backdrop-blur-[4px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu max-w-[620px] w-full p-7 self-start shadow-[0_12px_40px_rgba(15,23,42,0.1)]">
        <div className="flex justify-between mb-[22px]">
          <div>
            <h3 className="m-0 text-xl font-extrabold text-[#0c2340]">Rapport de match</h3>
            <p className="mt-1 mb-0 text-xs text-[#94a3b8]">{sel.lastName.toUpperCase()} {sel.firstName} · {sel.poste} · Scout: {[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}</p>
          </div>
          <button className="btn-g px-2.5 py-1.5 text-sm" onClick={onClose}>✕</button>
        </div>

        {pendingMatches.length > 0 && (
          <div className="mb-4">
            <label className="lbl">Rattacher à un match (optionnel)</label>
            <select className="inp" value={rForm.matchId} onChange={e => setRForm(p => p ? { ...p, matchId: e.target.value } : p)}>
              <option value="">— Rapport libre —</option>
              {pendingMatches.map(m => <option key={m.id} value={m.id}>{m.date} · {m.equipe1} vs {m.equipe2}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div>
            <label className="lbl" style={{ color: errors.date ? '#dc2626' : undefined }}>Date *</label>
            <input type="date" className="inp" style={{ borderColor: errors.date ? '#dc2626' : undefined }} value={rForm.date} onChange={e => setRForm(p => p ? { ...p, date: e.target.value } : p)} />
            {errors.date && <div className="text-[10px] text-[#dc2626] mt-[3px]">Date obligatoire</div>}
          </div>
          <div><label className="lbl">Lieu</label><select className="inp" value={rForm.lieu} onChange={e => setRForm(p => p ? { ...p, lieu: e.target.value } : p)}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
          <div>
            <label className="lbl" style={{ color: errors.minutesJouees ? '#dc2626' : undefined }}>Minutes jouées *</label>
            <input type="number" className="inp" style={{ borderColor: errors.minutesJouees ? '#dc2626' : undefined }} value={rForm.minutesJouees} onChange={e => setRForm(p => p ? { ...p, minutesJouees: e.target.value } : p)} placeholder="90" />
            {errors.minutesJouees && <div className="text-[10px] text-[#dc2626] mt-[3px]">Champ obligatoire</div>}
          </div>
          <div>
            <label className="lbl" style={{ color: errors.contexte ? '#dc2626' : undefined }}>Contexte *</label>
            <input className="inp" style={{ borderColor: errors.contexte ? '#dc2626' : undefined }} value={rForm.contexte} onChange={e => setRForm(p => p ? { ...p, contexte: e.target.value } : p)} placeholder="Match amical, détection..." />
            {errors.contexte && <div className="text-[10px] text-[#dc2626] mt-[3px]">Champ obligatoire</div>}
          </div>
        </div>

        {CATS.map(cat => (
          <div key={cat.key} className="bg-[#f8fafc] rounded-2xl p-4 mb-2.5 border border-[#f1f5f9]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-[#0c2340]">{cat.icon} {cat.label}</span>
              <span className="text-[9px] text-[#94a3b8] max-w-[180px] text-right">{cat.hint}</span>
            </div>
            <NotePicker
              value={rForm.ratings[cat.key]}
              onChange={v => setRForm(p => p ? { ...p, ratings: { ...p.ratings, [cat.key]: v } } : p)}
            />
            <textarea
              className="inp mt-2 resize-y bg-white"
              style={{ height: 52, borderColor: missingComments.includes(cat.key) ? '#dc2626' : undefined }}
              value={rForm.commentaires[cat.key]}
              onChange={e => setRForm(p => p ? { ...p, commentaires: { ...p.commentaires, [cat.key]: e.target.value } } : p)}
              placeholder={`Analyse ${cat.label.toLowerCase()}... *`}
            />
            {missingComments.includes(cat.key) && <div className="text-[10px] text-[#dc2626] mt-[3px]">Commentaire obligatoire</div>}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2.5 mb-3.5 mt-1">
          <div><label className="lbl">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e => setRForm(p => p ? { ...p, niveauActuel: e.target.value } : p)}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
          <div><label className="lbl">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e => setRForm(p => p ? { ...p, potentiel: e.target.value } : p)}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
        </div>

        <div className="mb-3.5">
          <label className="lbl" style={{ color: errors.conclusion ? '#dc2626' : undefined }}>Conclusion *</label>
          <textarea
            className="inp resize-y"
            style={{ height: 80, borderColor: errors.conclusion ? '#dc2626' : undefined }}
            value={rForm.conclusion}
            onChange={e => setRForm(p => p ? { ...p, conclusion: e.target.value } : p)}
            placeholder="Profil complet du joueur..."
          />
          {errors.conclusion && <div className="text-[10px] text-[#dc2626] mt-[3px]">Conclusion obligatoire</div>}
        </div>

        <div className="mb-5">
          <label className="lbl text-[#dc2626]">Décision *</label>
          <div className="flex gap-1 flex-wrap">
            {DECISIONS.map(d => (
              <button
                key={d.v}
                onClick={() => setRForm(p => p ? { ...p, decision: d.v } : p)}
                className="px-3 py-2 rounded-[10px] border-2 cursor-pointer text-[11px] font-bold transition-all duration-150"
                style={{
                  borderColor: rForm.decision === d.v ? d.c : 'transparent',
                  background: rForm.decision === d.v ? d.bg : '#f8fafc',
                  color: rForm.decision === d.v ? d.c : '#94a3b8',
                }}
              >
                {d.i} {d.l}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#fffbeb] px-3.5 py-2.5 rounded-[10px] text-[11px] text-[#92400e] mb-4">
          🔒 Une fois validé, le rapport sera verrouillé définitivement.
        </div>

        {submitted && hasError && (
          <div className="mb-3 px-3.5 py-2.5 bg-[#fef2f2] rounded-[10px] text-xs text-[#dc2626] font-semibold">
            Veuillez remplir tous les champs obligatoires (*) avant de valider.
          </div>
        )}
        <div className="flex gap-2.5">
          <button className="btn-g flex-1 py-3.5 text-sm font-semibold" onClick={onClose}>Annuler</button>
          <button
            className="btn-p flex-1 py-3.5 text-sm font-bold"
            onClick={handleSave}
          >
            🔒 Valider et verrouiller
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
