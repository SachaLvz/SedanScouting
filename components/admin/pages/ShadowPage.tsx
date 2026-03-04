import PitchView from '../PitchView';
import SlotPickModal from '../modals/SlotPickModal';
import { FORMATIONS } from '../config';
import type { Player, Rapport, Ratings } from '../config';

interface ShadowPageProps {
  players: Player[];
  formation: string;
  setFormation: (f: string) => void;
  shadowTeam: Record<number, string>;
  setShadowTeam: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  slotPick: { idx: number; pos: string } | null;
  setSlotPick: (v: { idx: number; pos: string } | null) => void;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
}

export default function ShadowPage({ players, formation, setFormation, shadowTeam, setShadowTeam, slotPick, setSlotPick, lr, avg }: ShadowPageProps) {
  const slots = FORMATIONS[formation]?.slots ?? [];
  const assignedCount = Object.keys(shadowTeam).length;

  return (
    <div className="fu" style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>⚽ Shadow Team</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            className={formation === f ? 'btn-p' : 'btn-g'}
            style={{ padding: '8px 16px', fontSize: 12 }}
            onClick={() => { setFormation(f); setShadowTeam({}); }}
          >
            {FORMATIONS[f].label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Terrain */}
        <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 380 }}>
          <PitchView
            formation={formation}
            players={players}
            shadowTeam={shadowTeam}
            onSlotClick={(idx, pos) => setSlotPick({ idx, pos })}
          />
        </div>

        {/* Liste joueurs assignés */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Composition</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{assignedCount}/{slots.length}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {slots.map((slot, idx) => {
              const playerId = shadowTeam[idx];
              const player = playerId ? players.find(p => p.id === playerId) : null;
              return (
                <div
                  key={idx}
                  onClick={() => setSlotPick({ idx, pos: slot.pos })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    background: player ? '#fff' : '#f8fafc',
                    border: player ? '1.5px solid var(--border)' : '1.5px dashed #e2e8f0',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blueL)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = player ? 'var(--border)' : '#e2e8f0'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: player ? 'var(--blue-pale)' : '#f1f5f9',
                    border: player ? '2px solid var(--blueL)' : '2px dashed #cbd5e1',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {player?.photo
                      ? <img src={player.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 13, opacity: 0.4 }}>{player ? '👤' : '+'}</span>
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: player ? 'var(--navy)' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {player ? `${player.prenom} ${player.nom}`.trim() : '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500 }}>{slot.pos}</div>
                  </div>
                  {/* Remove */}
                  {player && (
                    <button
                      onClick={e => { e.stopPropagation(); setShadowTeam(prev => { const n = { ...prev }; delete n[idx]; return n; }); }}
                      style={{ padding: '2px 6px', fontSize: 11, border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {slotPick && (
        <SlotPickModal
          slotPick={slotPick}
          players={players}
          shadowTeam={shadowTeam}
          setShadowTeam={setShadowTeam}
          onClose={() => setSlotPick(null)}
          lr={lr}
          avg={avg}
        />
      )}
    </div>
  );
}
