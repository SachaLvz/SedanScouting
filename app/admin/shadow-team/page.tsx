'use client';
import { useState } from 'react';
import { useAdminData } from '@/components/admin/context';
import ShadowPage from '@/components/admin/pages/ShadowPage';

export default function ShadowTeamRoute() {
  const { players, lr, avg } = useAdminData();
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);

  return (
    <ShadowPage
      players={players} formation={formation} setFormation={setFormation}
      shadowTeam={shadowTeam} setShadowTeam={setShadowTeam}
      slotPick={slotPick} setSlotPick={setSlotPick}
      lr={lr} avg={avg}
    />
  );
}
