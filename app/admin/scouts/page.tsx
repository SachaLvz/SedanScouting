'use client';
import { useAdminData } from '@/components/admin/context';
import ScoutsPage from '@/components/admin/pages/ScoutsPage';

export default function ScoutsRoute() {
  const { scouts, setScouts, curScout, setCurScout } = useAdminData();

  return (
    <ScoutsPage
      scouts={scouts} setScouts={setScouts}
      curScout={curScout} setCurScout={setCurScout}
    />
  );
}
