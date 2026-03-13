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
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <h2 className="m-0 mb-4 text-xl font-extrabold text-[#0c2340]">⚽ Shadow Team</h2>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            className={formation === f ? 'btn-p px-4 py-2 text-xs' : 'btn-g px-4 py-2 text-xs'}
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
      <div className="mt-3 text-[11px] text-[#94a3b8] font-semibold text-right">
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
