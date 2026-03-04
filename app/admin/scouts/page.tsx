'use client';
import { useState } from 'react';
import { useAdminData } from '@/components/admin/context';
import ScoutsPage from '@/components/admin/pages/ScoutsPage';

export default function ScoutsRoute() {
  const { scouts, setScouts, curScout, setCurScout } = useAdminData();
  const [scoutForm, setScoutForm] = useState({ nom: '', role: 'scout' });

  return (
    <ScoutsPage
      scouts={scouts} setScouts={setScouts}
      curScout={curScout} setCurScout={setCurScout}
      scoutForm={scoutForm} setScoutForm={setScoutForm}
    />
  );
}
