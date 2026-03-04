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
    <div className="fu" style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>📅 Calendrier des matchs</h2>
        <button className="btn-p" style={{ padding: '10px 20px', fontSize: 12 }} onClick={() => { setMatchForm(blankMatch()); setShowMF(true); }}>+ Programmer un match</button>
      </div>

      <div className="lbl" style={{ marginBottom: 10 }}>Mes rendez-vous ({pendingMatches.length})</div>
      {pendingMatches.length === 0
        ? <p style={{ color: 'var(--t3)', fontSize: 13, marginBottom: 24 }}>Aucun match programmé.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
            {pendingMatches.map(m => (
              <div key={m.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{m.equipe1} vs {m.equipe2}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    <Tag>{m.date}</Tag><Tag>{m.lieu}</Tag>
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

      <div className="lbl" style={{ marginBottom: 10 }}>Matchs terminés ({doneMatches.length})</div>
      {doneMatches.length === 0
        ? <p style={{ color: 'var(--t3)', fontSize: 13 }}>Aucun match terminé.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {doneMatches.map(m => (
              <div key={m.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: .7 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>{m.equipe1} vs {m.equipe2}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}><Tag>{m.date}</Tag><Tag>{m.lieu}</Tag></div>
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
