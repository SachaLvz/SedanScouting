import { useEffect, useState } from 'react';
import { VILLES } from '../config';
import type { Match, Scout } from '../config';

interface MatchFormModalProps {
  matchForm: Match;
  setMatchForm: React.Dispatch<React.SetStateAction<Match | null>>;
  people?: Scout[];
  title?: string;
  submitLabel?: string;
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

export default function MatchFormModal({ matchForm, setMatchForm, people = [], title = 'Programmer un match', submitLabel = 'Programmer', onSave, onClose }: MatchFormModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [cities, setCities] = useState<string[]>(VILLES);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch('/api/cities').catch(() => null);
      const data = res?.ok ? await res.json() : null;
      const next = Array.isArray(data)
        ? Array.from(new Set(data.map(v => String(v).trim()).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'fr'))
        : VILLES;
      if (alive) setCities(next.length > 0 ? next : VILLES);
    })().catch(() => {
      if (alive) setCities(VILLES);
    });
    return () => { alive = false; };
  }, []);

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

  const errBorder = (key: keyof Match) => errors[key] ? '#dc2626' : undefined;

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] flex justify-center px-4 py-10 backdrop-blur-[4px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu max-w-[480px] w-full p-7 self-start shadow-[0_12px_40px_rgba(15,23,42,0.1)]">
        <h3 className="m-0 mb-5 text-lg font-extrabold text-[#0c2340]">{title}</h3>
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div>
            <label className="lbl">Équipe 1 *</label>
            <input className="inp" style={{ borderColor: errBorder('equipe1') }} value={matchForm.equipe1} onChange={e => setMatchForm(p => p ? { ...p, equipe1: e.target.value } : p)} placeholder="Dakar FC" />
            {errors.equipe1 && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.equipe1}</div>}
          </div>
          <div>
            <label className="lbl">Équipe 2 *</label>
            <input className="inp" style={{ borderColor: errBorder('equipe2') }} value={matchForm.equipe2} onChange={e => setMatchForm(p => p ? { ...p, equipe2: e.target.value } : p)} placeholder="Thiès United" />
            {errors.equipe2 && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.equipe2}</div>}
          </div>
          <div>
            <label className="lbl">Date *</label>
            <input type="date" className="inp" style={{ borderColor: errBorder('date') }} value={matchForm.date} onChange={e => setMatchForm(p => p ? { ...p, date: e.target.value } : p)} />
            {errors.date && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.date}</div>}
          </div>
          <div>
            <label className="lbl">Lieu *</label>
            <select className="inp" style={{ borderColor: errBorder('lieu') }} value={matchForm.lieu} onChange={e => setMatchForm(p => p ? { ...p, lieu: e.target.value } : p)}>
              <option value="">— Choisir —</option>
              {cities.map(v => <option key={v}>{v}</option>)}
            </select>
            {errors.lieu && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.lieu}</div>}
          </div>
          <div>
            <label className="lbl">Horaire *</label>
            <input type="time" className="inp" style={{ borderColor: errBorder('hour') }} value={matchForm.hour} onChange={e => setMatchForm(p => p ? { ...p, hour: e.target.value } : p)} />
            {errors.hour && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.hour}</div>}
          </div>
          <div>
            <label className="lbl">Compétition *</label>
            <input className="inp" style={{ borderColor: errBorder('competition') }} value={matchForm.competition} onChange={e => setMatchForm(p => p ? { ...p, competition: e.target.value } : p)} placeholder="Détection, Championnat..." />
            {errors.competition && <div className="text-[10px] text-[#dc2626] mt-[3px]">{errors.competition}</div>}
          </div>
          <div>
            <label className="lbl">Type</label>
            <select className="inp" value={matchForm.type} onChange={e => setMatchForm(p => p ? { ...p, type: e.target.value } : p)}>
              <option value="live">🏟 Live / Terrain</option>
              <option value="video">📹 Vidéo</option>
            </select>
          </div>
        </div>
        {people.length > 0 && (
          <div className="mb-4">
            <label className="lbl">Assigner des personnes</label>
            <div className="flex flex-wrap gap-1.5">
              {people.map(person => {
                const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ');
                const active = (matchForm.scouts ?? []).includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setMatchForm(p => {
                      if (!p) return p;
                      const has = (p.scouts ?? []).includes(person.id);
                      return {
                        ...p,
                        scouts: has
                          ? (p.scouts ?? []).filter(id => id !== person.id)
                          : [...(p.scouts ?? []), person.id],
                      };
                    })}
                    className="px-3 py-1.5 rounded-[999px] border text-[11px] font-semibold cursor-pointer transition-all"
                    style={{
                      borderColor: active ? '#1e6cb6' : '#e2e8f0',
                      background: active ? '#eef5fd' : '#fff',
                      color: active ? '#1e6cb6' : '#475569',
                    }}
                  >
                    {fullName || person.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex gap-2.5">
          <button className="btn-g flex-1 py-3 text-[13px]" onClick={onClose}>Annuler</button>
          <button className="btn-p flex-1 py-3 text-[13px]" onClick={handleSave}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
