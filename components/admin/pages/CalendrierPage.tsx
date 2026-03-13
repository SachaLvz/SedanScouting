import Tag from '../Tag';
import MatchFormModal from '../modals/MatchFormModal';
import type { Match } from '../config';

interface CalendrierPageProps {
  pendingMatches: Match[];
  doneMatches: Match[];
  showMF: boolean;
  setShowMF: (v: boolean) => void;
  matchForm: Match | null;
  setMatchForm: React.Dispatch<React.SetStateAction<Match | null>>;
  onSaveMatch: () => void;
  blankMatch: () => Match;
}

export default function CalendrierPage({ pendingMatches, doneMatches, showMF, setShowMF, matchForm, setMatchForm, onSaveMatch, blankMatch }: CalendrierPageProps) {
  return (
    <div className="fu max-w-[800px] mx-auto px-5 pb-[60px]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">📅 Calendrier des matchs</h2>
        <button className="btn-p px-5 py-2.5 text-xs" onClick={() => { setMatchForm(blankMatch()); setShowMF(true); }}>+ Programmer un match</button>
      </div>

      <div className="lbl mb-2.5">Mes rendez-vous ({pendingMatches.length})</div>
      {pendingMatches.length === 0
        ? <p className="text-[#94a3b8] text-[13px] mb-6">Aucun match programmé.</p>
        : (
          <div className="flex flex-col gap-1.5 mb-7">
            {pendingMatches.map(m => (
              <div key={m.id} className="card px-[18px] py-3.5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-[#0c2340]">{m.equipe1} vs {m.equipe2}</div>
                  <div className="flex gap-1.5 mt-1">
                    <Tag>{m.date}</Tag><Tag>{m.lieu}</Tag>
                    <Tag>{m.hour} H</Tag>
                    <Tag color="#2563eb" bg="#eff6ff">{m.competition}</Tag>
                    <Tag>{m.type === 'live' ? '🏟 Live' : '📹 Vidéo'}</Tag>
                  </div>
                </div>
                <Tag color="#d97706" bg="#fffbeb">⏳ Planifié</Tag>
              </div>
            ))}
          </div>
        )
      }

      <div className="lbl mb-2.5">Matchs terminés ({doneMatches.length})</div>
      {doneMatches.length === 0
        ? <p className="text-[#94a3b8] text-[13px]">Aucun match terminé.</p>
        : (
          <div className="flex flex-col gap-1.5">
            {doneMatches.map(m => (
              <div key={m.id} className="card px-[18px] py-3.5 flex justify-between items-center opacity-70">
                <div>
                  <div className="text-sm font-semibold text-[#475569]">{m.equipe1} vs {m.equipe2}</div>
                  <div className="flex gap-1.5 mt-1"><Tag>{m.date}</Tag><Tag>{m.lieu}</Tag></div>
                  <div className="flex gap-1.5 mt-1"><Tag>{m.hour}</Tag></div>
                </div>
                <Tag color="#16a34a" bg="#f0fdf4">✓ Terminé</Tag>
              </div>
            ))}
          </div>
        )
      }

      {showMF && matchForm && (
        <MatchFormModal
          matchForm={matchForm}
          setMatchForm={setMatchForm}
          onSave={onSaveMatch}
          onClose={() => { setShowMF(false); setMatchForm(null); }}
        />
      )}
    </div>
  );
}
