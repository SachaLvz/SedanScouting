import { FORMATIONS } from './config';
import type { Player } from './config';

interface PitchViewProps {
  formation: string;
  players: Player[];
  shadowTeam: Record<number, string>;
  onSlotClick: (idx: number, pos: string) => void;
}

export default function PitchView({ formation, players, shadowTeam, onSlotClick }: PitchViewProps) {
  const f = FORMATIONS[formation];
  if (!f) return null;

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '68/105',
      background: 'linear-gradient(180deg,#22c55e 0%,#16a34a 100%)',
      borderRadius: 16, overflow: 'hidden', margin: '0 auto',
      boxShadow: 'inset 0 2px 20px rgba(0,0,0,.15)',
    }}>
      <svg viewBox="0 0 68 105" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect x="0.5" y="0.5" width="67" height="104" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <line x1="0" y1="52.5" x2="68" y2="52.5" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="13.84" y="0" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="13.84" y="88.5" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="24.84" y="0" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
        <rect x="24.84" y="99.5" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
      </svg>
      {f.slots.map((slot, idx) => {
        const assigned = shadowTeam[idx];
        const player = assigned ? players.find(p => p.id === assigned) : null;
        return (
          <div
            key={idx}
            onClick={() => onSlotClick(idx, slot.pos)}
            style={{
              position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
              transform: 'translate(-50%,-50%)', cursor: 'pointer', textAlign: 'center', zIndex: 2,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: player ? '#fff' : 'rgba(255,255,255,.2)',
              border: player ? '2px solid #fff' : '2px dashed rgba(255,255,255,.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: player ? '0 2px 8px rgba(0,0,0,.2)' : 'none',
              overflow: 'hidden', margin: '0 auto', transition: 'all .15s',
            }}>
              {player?.photo
                ? <img src={player.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: player ? 10 : 14, color: player ? '#94a3b8' : 'rgba(255,255,255,.6)' }}>{player ? '👤' : '+'}</span>
              }
            </div>
            <div style={{
              fontSize: 8, fontWeight: 700, color: '#fff', marginTop: 3,
              textShadow: '0 1px 3px rgba(0,0,0,.4)', lineHeight: 1.2,
              maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {player ? player.nom.toUpperCase() : slot.pos}
            </div>
          </div>
        );
      })}
    </div>
  );
}
