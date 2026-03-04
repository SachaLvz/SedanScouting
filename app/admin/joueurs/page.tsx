'use client';
import { useState } from 'react';
import { useAdminData } from '@/components/admin/context';
import ListPage from '@/components/admin/pages/ListPage';
import DetailPage from '@/components/admin/pages/DetailPage';
import FormPage from '@/components/admin/pages/FormPage';
import type { Player, Rapport } from '@/components/admin/config';

export default function JoueursPage() {
  const {
    players, matches, scout, isAdmin,
    updatePlayer, createPlayer, deletePlayer, updateMatch,
    lr, avg, getDec, reportsForPlayer, allReports, reportCount,
    blank, blankR,
  } = useAdminData();

  const [view, setView] = useState('list');
  const [selId, setSelId] = useState<string | null>(null);
  const [tab, setTab] = useState('profil');
  const [search, setSearch] = useState('');
  const [fVille, setFVille] = useState('');
  const [fPoste, setFPoste] = useState('');
  const [fDec, setFDec] = useState('');
  const [form, setForm] = useState<Player | null>(null);
  const [rForm, setRForm] = useState<Rapport | null>(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);

  const sel = players.find(p => p.id === selId);
  const pendingMatches = matches.filter(m => m.statut === 'planifie');

  const filtered = players.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || `${p.nom} ${p.prenom}`.toLowerCase().includes(q)) &&
      (!fVille || p.ville === fVille) &&
      (!fPoste || p.poste === fPoste) &&
      (!fDec || lr(p)?.decision === fDec)
    );
  });

  const readFile = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Player) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => p ? { ...p, [field]: ev.target?.result as string } : p);
    r.readAsDataURL(f);
  };

  const save = async () => {
    if (!form?.nom) return;
    const isEdit = players.some(p => p.id === form.id);
    if (isEdit) {
      await updatePlayer(form);
    } else {
      await createPlayer(form);
    }
    setSelId(form.id); setView('detail'); setTab('profil');
  };

  const del = async (id: string) => {
    await deletePlayer(id);
    setSelId(null); setView('list');
  };

  const saveReport = async () => {
    if (!rForm?.conclusion) return;
    const player = players.find(p => p.id === selId);
    if (!player) return;
    const locked = { ...rForm, locked: true };
    await updatePlayer({ ...player, rapports: [locked, ...(player.rapports ?? [])] });
    if (rForm.matchId) {
      const m = matches.find(x => x.id === rForm.matchId);
      if (m) await updateMatch({ ...m, statut: 'termine' });
    }
    setShowR(false); setRForm(null); setTab('rapports');
  };

  const addNote = async (text: string) => {
    const player = players.find(p => p.id === selId);
    if (!player || !text.trim()) return;
    const { uid, today } = await import('@/components/admin/config');
    await updatePlayer({ ...player, notes: [{ id: uid(), date: today(), text: text.trim(), scout: scout?.nom ?? '' }, ...(player.notes ?? [])] });
  };

  const toggleListe = async (liste: string) => {
    const player = players.find(p => p.id === selId);
    if (!player) return;
    const has = (player.listes ?? []).includes(liste);
    await updatePlayer({ ...player, listes: has ? player.listes.filter(l => l !== liste) : [...(player.listes ?? []), liste] });
  };

  return (
    <div>
      {view === 'list' && (
        <ListPage
          players={players} matches={matches}
          search={search} setSearch={setSearch}
          fVille={fVille} setFVille={setFVille}
          fPoste={fPoste} setFPoste={setFPoste}
          fDec={fDec} setFDec={setFDec}
          filtered={filtered}
          setSelId={setSelId} setView={setView} setTab={setTab}
          setForm={setForm}
          lr={lr} getDec={getDec} avg={avg} reportCount={reportCount} blank={blank}
        />
      )}

      {view === 'detail' && sel && (
        <DetailPage
          sel={sel} players={players} matches={matches}
          isAdmin={isAdmin} tab={tab} setTab={setTab} setView={setView}
          setForm={setForm}
          showR={showR} setShowR={setShowR} rForm={rForm} setRForm={setRForm}
          openR={openR} setOpenR={setOpenR}
          pendingMatches={pendingMatches} scout={scout}
          addNote={addNote} toggleListe={toggleListe}
          allReports={allReports} reportsForPlayer={reportsForPlayer} reportCount={reportCount}
          lr={lr} avg={avg} getDec={getDec} blankR={(matchId?: string) => blankR(selId, matchId)}
          onSaveReport={saveReport} onDelete={del}
        />
      )}

      {view === 'form' && form && (
        <FormPage
          form={form} setForm={setForm} players={players}
          onSave={save}
          readFile={readFile}
        />
      )}
    </div>
  );
}
