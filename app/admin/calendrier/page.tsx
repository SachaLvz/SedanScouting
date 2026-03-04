'use client';
import { useState } from 'react';
import { useAdminData } from '@/components/admin/context';
import CalendrierPage from '@/components/admin/pages/CalendrierPage';
import type { Match } from '@/components/admin/config';

export default function CalendrierRoute() {
  const { matches, createMatch, blankMatch } = useAdminData();
  const [showMF, setShowMF] = useState(false);
  const [matchForm, setMatchForm] = useState<Match | null>(null);

  const saveMatch = async () => {
    if (!matchForm?.equipe1) return;
    await createMatch(matchForm);
    setShowMF(false); setMatchForm(null);
  };

  return (
    <CalendrierPage
      pendingMatches={matches.filter(m => m.statut === 'planifie')}
      doneMatches={matches.filter(m => m.statut === 'termine')}
      showMF={showMF} setShowMF={setShowMF}
      matchForm={matchForm} setMatchForm={setMatchForm}
      onSaveMatch={saveMatch} blankMatch={blankMatch}
    />
  );
}
