import PitchView from '../PitchView';
import SlotPickModal from '../modals/SlotPickModal';
import { FORMATIONS } from '../config';
import type { Player, Rapport, Ratings } from '../config';

interface ShadowPageProps {
  players: Player[];
  formation: string;
  setFormation: (f: string) => void;
  shadowTeam: Record<number, string[]>;
  setShadowTeam: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  slotPick: { idx: number; pos: string } | null;
  setSlotPick: (v: { idx: number; pos: string } | null) => void;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
}

export default function ShadowPage({ players, formation, setFormation, shadowTeam, setShadowTeam, slotPick, setSlotPick, lr, avg }: ShadowPageProps) {
  const slots = FORMATIONS[formation]?.slots ?? [];
  const assignedCount = Object.values(shadowTeam).filter(ids => ids.length > 0).length;

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

      {/* Terrain pleine largeur */}
      <PitchView
        formation={formation}
        players={players}
        shadowTeam={shadowTeam}
        onSlotClick={(idx, pos) => setSlotPick({ idx, pos })}
      />

      {/* Compteur */}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--t3)', fontWeight: 600, textAlign: 'right' }}>
        {assignedCount}/{slots.length} postes assignés · Cliquer sur un poste pour gérer les joueurs
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
