'use client';
import { useState, useEffect, useRef } from 'react';
import { useAdminData } from '@/components/admin/context';
import ShadowPage from '@/components/admin/pages/ShadowPage';

export default function ShadowTeamRoute() {
  const { players, lr, avg } = useAdminData();
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);
  const loaded = useRef(false);

  /* Charger depuis la DB au montage */
  useEffect(() => {
    fetch('/api/shadow-team')
      .then(r => r.json())
      .then(d => {
        if (d.formation) setFormation(d.formation);
        if (d.slots && typeof d.slots === 'object') {
          const parsed: Record<number, string> = {};
          Object.entries(d.slots).forEach(([k, v]) => { parsed[Number(k)] = v as string; });
          setShadowTeam(parsed);
        }
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; });
  }, []);

  /* Sauvegarder automatiquement à chaque changement */
  useEffect(() => {
    if (!loaded.current) return;
    fetch('/api/shadow-team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formation, slots: shadowTeam }),
    }).catch(console.error);
  }, [formation, shadowTeam]);

  const handleSetFormation = (f: string) => {
    setFormation(f);
    setShadowTeam({});
  };

  return (
    <ShadowPage
      players={players} formation={formation} setFormation={handleSetFormation}
      shadowTeam={shadowTeam} setShadowTeam={setShadowTeam}
      slotPick={slotPick} setSlotPick={setSlotPick}
      lr={lr} avg={avg}
    />
  );
}
