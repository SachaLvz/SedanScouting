import type { Player, Rapport, Ratings } from '../config';

interface SlotPickModalProps {
  slotPick: { idx: number; pos: string };
  players: Player[];
  shadowTeam: Record<number, string>;
  setShadowTeam: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onClose: () => void;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
}

export default function SlotPickModal({ slotPick, players, shadowTeam, setShadowTeam, onClose, lr, avg }: SlotPickModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '40px 16px', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu" style={{ maxWidth: 420, width: '100%', padding: 24, alignSelf: 'flex-start', boxShadow: 'var(--shL)', maxHeight: '70vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>Choisir — {slotPick.pos}</h3>
        <button
          className="btn-g"
          style={{ width: '100%', padding: 10, fontSize: 12, marginBottom: 8 }}
          onClick={() => { setShadowTeam(p => { const n = { ...p }; delete n[slotPick.idx]; return n; }); onClose(); }}
        >
          Retirer le joueur
        </button>
        {players.filter(p => !Object.values(shadowTeam).includes(p.id)).map(p => {
          const lastReport = lr(p);
          return (
            <div
              key={p.id}
              className="card card-click"
              style={{ padding: '10px 14px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}
              onClick={() => { setShadowTeam(prev => ({ ...prev, [slotPick.idx]: p.id })); onClose(); }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                {p.photo
                  ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 12, opacity: .3 }}>👤</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{p.nom.toUpperCase()} {p.prenom}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{p.poste} · {p.ville}</div>
              </div>
              {lastReport && (
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--m)', color: 'var(--blue)' }}>
                  {avg(lastReport.ratings).toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
