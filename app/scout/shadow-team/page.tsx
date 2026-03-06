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
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>Shadow Team</h2>

      {/* Sélection formation */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            className={formation === f ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '8px 16px', fontSize: 12 }}
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
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textAlign: 'right' }}>
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
