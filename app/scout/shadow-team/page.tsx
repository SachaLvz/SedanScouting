'use client';
import { useState, useEffect, useRef } from 'react';
import { useScoutData } from '@/components/scout/context';
import PitchView from '@/components/admin/PitchView';
import SlotPickModal from '@/components/admin/modals/SlotPickModal';
import { FORMATIONS } from '@/components/admin/config';

export default function ScoutShadowTeamPage() {
  const { players, lr, avg } = useScoutData();
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string[]>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);
  const loaded = useRef(false);

  // Récupérer l'ID du scout depuis localStorage
  const getScoutId = () => {
    try {
      const u = JSON.parse(localStorage.getItem('mbarodi_user') ?? '{}');
      return u.id ?? 'scout-default';
    } catch { return 'scout-default'; }
  };

  /* Charger depuis la DB */
  useEffect(() => {
    const id = getScoutId();
    fetch(`/api/shadow-team?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.formation) setFormation(d.formation);
        if (d.slots && typeof d.slots === 'object') {
          const parsed: Record<number, string[]> = {};
          Object.entries(d.slots).forEach(([k, v]) => {
            parsed[Number(k)] = Array.isArray(v) ? v : [v as string];
          });
          setShadowTeam(parsed);
        }
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; });
  }, []);

  /* Sauvegarder automatiquement */
  useEffect(() => {
    if (!loaded.current) return;
    const id = getScoutId();
    fetch(`/api/shadow-team?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formation, slots: shadowTeam }),
    }).catch(console.error);
  }, [formation, shadowTeam]);

  const slots = FORMATIONS[formation]?.slots ?? [];
  const assignedCount = Object.values(shadowTeam).filter(ids => ids.length > 0).length;

  const handleSetFormation = (f: string) => {
    setFormation(f);
    setShadowTeam({});
  };

  return (
    <div className="max-w-[960px] mx-auto px-5 pb-[60px]">
      <h2 className="m-0 mb-4 text-xl font-extrabold text-[#0c2340]">Shadow Team</h2>

      {/* Sélection formation */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            className={formation === f ? 'btn-p px-4 py-2 text-xs' : 'btn-g px-4 py-2 text-xs'}
            onClick={() => handleSetFormation(f)}
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
          lr={lr as any}
          avg={(r: any) => avg(r)}
          playerBaseUrl="/scout/joueurs"
        />
      )}
    </div>
  );
}
