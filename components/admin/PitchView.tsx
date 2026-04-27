import { FORMATIONS, getProfilePhoto } from './config';
import type { Player } from './config';

interface PitchViewProps {
  formation: string;
  players: Player[];
  shadowTeam: Record<number, string[]>;
  onSlotClick: (idx: number, pos: string) => void;
  portrait?: boolean;
  /** Pas d'assignation de joueurs (consultation) */
  readOnly?: boolean;
}

export default function PitchView({ formation, players, shadowTeam, onSlotClick, portrait = false, readOnly = false }: PitchViewProps) {
  const f = FORMATIONS[formation];
  if (!f) return null;

  const avatarSize = portrait ? 36 : 44;
  const cardWidth  = portrait ? 76 : 96;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: portrait ? '68/105' : '105/68',
      background: portrait
        ? 'linear-gradient(180deg,#22c55e 0%,#16a34a 100%)'
        : 'linear-gradient(90deg,#22c55e 0%,#16a34a 100%)',
      borderRadius: 16,
      overflow: 'visible',
      margin: '0 auto',
      boxShadow: 'inset 0 2px 20px rgba(0,0,0,.15)',
    }}>

      {portrait ? (
        /* ── Terrain SVG portrait (68 × 105) ── */
        <svg viewBox="0 0 68 105" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 16 }}>
          <rect x=".5" y=".5" width="67" height="104" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <line x1="0" y1="52.5" x2="68" y2="52.5" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          {/* Zone bas (GK) */}
          <rect x="13.84" y="88.5" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          {/* Zone haut (attaque adverse) */}
          <rect x="13.84" y="0" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          {/* Surface de but bas */}
          <rect x="24.84" y="99.5" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
          {/* Surface de but haut */}
          <rect x="24.84" y="0" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
        </svg>
      ) : (
        /* ── Terrain SVG paysage (105 × 68) ── */
        <svg viewBox="0 0 105 68" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 16 }}>
          <rect x=".5" y=".5" width="104" height="67" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <rect x="0" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <rect x="88.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5" />
          <rect x="0" y="24.84" width="5.5" height="18.32" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
          <rect x="99.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4" />
        </svg>
      )}

      {f.slots.map((slot, idx) => {
        const ids = shadowTeam[idx] ?? [];
        const player = ids[0] ? players.find(p => p.id === ids[0]) : null;
        const extras = ids.slice(1).map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];

        // Portrait : x=horizontal direct, y=vertical direct (GK y=92 → bas, attaque y=20 → haut)
        // Paysage  : GK (y=92) → gauche, x → vertical
        const lx = portrait ? slot.x       : 100 - slot.y;
        const ly = portrait ? slot.y       : slot.x;

        return (
          <div
            key={idx}
            onClick={readOnly ? undefined : () => onSlotClick(idx, slot.pos)}
            style={{
              position: 'absolute', left: `${lx}%`, top: `${ly}%`,
              transform: 'translate(-50%,-50%)', cursor: readOnly ? 'default' : 'pointer', textAlign: 'center', zIndex: 2,
              width: cardWidth,
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: avatarSize, height: avatarSize, borderRadius: '50%',
                background: player ? '#fff' : 'rgba(255,255,255,.2)',
                border: player ? '2.5px solid #fff' : '2px dashed rgba(255,255,255,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: player ? '0 3px 10px rgba(0,0,0,.25)' : 'none',
                overflow: 'hidden', margin: '0 auto', transition: 'all .15s',
              }}>
                {player && getProfilePhoto(player)
                  ? <img src={getProfilePhoto(player)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: player ? 10 : 16, color: player ? '#94a3b8' : 'rgba(255,255,255,.6)' }}>{player ? '👤' : '+'}</span>
                }
              </div>
            </div>

            {/* Carte info joueurs */}
            <div style={{
              marginTop: 3,
              background: 'rgba(0,0,0,.55)',
              backdropFilter: 'blur(4px)',
              borderRadius: 6,
              padding: portrait ? '2px 3px' : '3px 5px',
              minWidth: portrait ? 68 : 88,
            }}>
              {!player && (
                <div style={{ fontSize: portrait ? 7 : 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {slot.pos}
                </div>
              )}
              {player && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: '#fbbf24', flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: portrait ? 7 : 9, fontWeight: 700, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player.firstName} {(player.lastName ?? '').toUpperCase()}
                  </span>
                </div>
              )}
              {extras.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                  <span style={{ fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,.5)', flexShrink: 0 }}>{i + 2}</span>
                  <span style={{ fontSize: portrait ? 6 : 8, color: 'rgba(255,255,255,.8)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
