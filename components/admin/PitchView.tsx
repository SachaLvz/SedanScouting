import { FORMATIONS } from './config';
import type { Player } from './config';

interface PitchViewProps {
  formation: string;
  players: Player[];
  shadowTeam: Record<number, string[]>;
  onSlotClick: (idx: number, pos: string) => void;
}

export default function PitchView({ formation, players, shadowTeam, onSlotClick }: PitchViewProps) {
  const f = FORMATIONS[formation];
  if (!f) return null;

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '105/68',
      background: 'linear-gradient(90deg,#22c55e 0%,#16a34a 100%)',
      borderRadius: 16, overflow: 'visible', margin: '0 auto',
      boxShadow: 'inset 0 2px 20px rgba(0,0,0,.15)',
    }}>
      {/* Terrain SVG — orientation paysage */}
      <svg viewBox="0 0 105 68" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 16 }}>
        <rect x="0.5" y="0.5" width="104" height="67" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
        <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
        <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
      </svg>

      {f.slots.map((slot, idx) => {
        const ids = shadowTeam[idx] ?? [];
        const player = ids[0] ? players.find(p => p.id === ids[0]) : null;
        const extras = ids.slice(1).map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];

        // Conversion portrait → paysage : GK (y=92) → gauche (x=8%), attaque (y~20) → droite
        const lx = 100 - slot.y;
        const ly = slot.x;

        return (
          <div
            key={idx}
            onClick={() => onSlotClick(idx, slot.pos)}
            style={{
              position: 'absolute', left: `${lx}%`, top: `${ly}%`,
              transform: 'translate(-50%,-50%)', cursor: 'pointer', textAlign: 'center', zIndex: 2,
              width: 96,
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: player ? '#fff' : 'rgba(255,255,255,.2)',
                border: player ? '2.5px solid #fff' : '2px dashed rgba(255,255,255,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: player ? '0 3px 10px rgba(0,0,0,.25)' : 'none',
                overflow: 'hidden', margin: '0 auto', transition: 'all .15s',
              }}>
                {player?.photo
                  ? <img src={player.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: player ? 12 : 18, color: player ? '#94a3b8' : 'rgba(255,255,255,.6)' }}>{player ? '👤' : '+'}</span>
                }
              </div>
            </div>

            {/* Carte info joueurs */}
            <div style={{
              marginTop: 4,
              background: 'rgba(0,0,0,.55)',
              backdropFilter: 'blur(4px)',
              borderRadius: 7,
              padding: '3px 5px',
              minWidth: 88,
            }}>
              {/* Poste si vide */}
              {!player && (
                <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {slot.pos}
                </div>
              )}
              {/* #1 */}
              {player && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: '#fbbf24', flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                    {player.firstName} {(player.lastName ?? '').toUpperCase()}
                  </span>
                </div>
              )}
              {/* Alternatives */}
              {extras.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,.5)', flexShrink: 0 }}>{i + 2}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,.8)', lineHeight: 1.3 }}>
                    {p.firstName} {(p.lastName ?? '').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
