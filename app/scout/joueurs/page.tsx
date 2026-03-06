'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useScoutData } from '@/components/scout/context';
import ListPage from '@/components/scout/pages/ListPage';
import DetailPage from '@/components/scout/pages/DetailPage';
import FormPage from '@/components/scout/pages/FormPage';

export default function ScoutJoueursPage() {
  const { players, setPlayers, scoutNom, updatePlayer, createPlayer, deletePlayer, lr, avg, getDec, blank, blankR } = useScoutData();

  const [view, setView] = useState('list');
  const [selId, setSelId] = useState<string | null>(null);
  const [tab, setTab] = useState('profil');
  const [search, setSearch] = useState('');
  const [fVille, setFVille] = useState('');
  const [fPoste, setFPoste] = useState('');
  const [fDec, setFDec] = useState('');
  const [fListe, setFListe] = useState('');
  const [form, setForm] = useState<any>(null);
  const [rForm, setRForm] = useState<any>(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const scoutId = (() => { try { return JSON.parse(localStorage.getItem('mbarodi_user') ?? '{}').id ?? ''; } catch { return ''; } })();
    fetch('/api/matches')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMatches(d.filter((m: any) => (m.scouts ?? []).includes(scoutId))); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const pid = searchParams.get('player');
    if (pid && players.length > 0 && players.some((p: any) => p.id === pid)) {
      setSelId(pid);
      setView('detail');
      setTab('profil');
      router.replace('/scout/joueurs');
    }
  }, [searchParams, players]);

  const sel = players.find((p: any) => p.id === selId);

  const filtered = players.filter((p: any) => {
    const q = search.toLowerCase();
    return (!q || `${p.lastName} ${p.firstName}`.toLowerCase().includes(q))
      && (!fVille || p.ville === fVille)
      && (!fPoste || p.poste === fPoste)
      && (!fDec || lr(p)?.decision === fDec)
      && (!fListe || (p.listes || []).includes(fListe));
  });

  const readFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const f = e.target.files?.[0]; if (!f) return;
    const data = new FormData();
    data.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (json.url) setForm((p: any) => ({ ...p, [field]: json.url }));
  };

  const save = async () => {
    if (!form?.lastName) return;
    const isEdit = players.some((p: any) => p.id === form.id);
    if (isEdit) { await updatePlayer(form); } else { await createPlayer(form); }
    setSelId(form.id); setView('detail'); setTab('profil');
  };

  const del = async (id: string) => {
    await deletePlayer(id);
    setSelId(null); setView('list');
  };

  const saveReport = async () => {
    if (!rForm?.conclusion) return;
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    await updatePlayer({ ...player, rapports: [rForm, ...(player.rapports || [])] });
    setShowR(false); setRForm(null); setTab('rapports');
  };

  const addNote = async (text: string) => {
    if (!text.trim()) return;
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    const { uid, today } = await import('@/components/scout/config');
    await updatePlayer({ ...player, notes: [{ id: uid(), date: today(), text: text.trim() }, ...(player.notes || [])] });
  };

  const toggleListe = async (liste: string) => {
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    const has = (player.listes || []).includes(liste);
    await updatePlayer({ ...player, listes: has ? player.listes.filter((l: string) => l !== liste) : [...(player.listes || []), liste] });
  };

  return (
    <div>
      {view === 'list' && (
        <ListPage
          players={players} filtered={filtered}
          search={search} setSearch={setSearch}
          fPoste={fPoste} setFPoste={setFPoste}
          fVille={fVille} setFVille={setFVille}
          fDec={fDec} setFDec={setFDec}
          fListe={fListe} setFListe={setFListe}
          lr={lr} getDec={getDec} avg={avg}
          onNewPlayer={() => { setForm(blank()); setView('form'); }}
          onSelectPlayer={(id: string) => { setSelId(id); setView('detail'); setTab('profil'); }}
        />
      )}

      {view === 'detail' && sel && (
        <DetailPage
          sel={sel} tab={tab} setTab={setTab}
          showR={showR} setShowR={(v: boolean) => { setShowR(v); if (v) setRForm(blankR(sel)); }}
          rForm={rForm} setRForm={setRForm}
          openR={openR} setOpenR={setOpenR}
          scoutNom={scoutNom} avg={avg} matches={matches}
          onBack={() => setView('list')}
          onEdit={() => { setForm({ ...sel }); setView('form'); }}
          onDelete={del}
          onSaveReport={saveReport}
          onAddNote={addNote}
          onToggleListe={toggleListe}
        />
      )}

      {view === 'form' && form && (
        <FormPage
          form={form} setForm={setForm} players={players}
          onSave={save}
          onBack={() => setView(players.some((p: any) => p.id === form.id) ? 'detail' : 'list')}
          readFile={readFile}
        />
      )}
    </div>
  );
}
