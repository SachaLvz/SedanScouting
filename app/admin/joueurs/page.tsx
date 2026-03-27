'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminData } from '@/components/admin/context';
import ListPage from '@/components/admin/pages/ListPage';
import DetailPage from '@/components/admin/pages/DetailPage';
import FormPage from '@/components/admin/pages/FormPage';
import TrashPage from '@/components/admin/pages/TrashPage';
import type { Player, Rapport } from '@/components/admin/config';

export default function JoueursPage() {
  const {
    players, matches, scout, isAdmin,
    updatePlayer, createPlayer, deletePlayer, restorePlayer, updateMatch,
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
  const [uploading, setUploading] = useState(false);
  const [rForm, setRForm] = useState<Rapport | null>(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Navigation depuis une autre page (ex: shadow team)
  useEffect(() => {
    const pid = searchParams.get('player');
    if (pid && players.length > 0 && players.some(p => p.id === pid)) {
      setSelId(pid);
      setView('detail');
      setTab('profil');
      router.replace('/admin/joueurs');
    }
  }, [searchParams, players]);

  const sel = players.find(p => p.id === selId);
  const pendingMatches = matches.filter(m => m.statut === 'planifie');

  const filtered = players.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || `${p.lastName} ${p.firstName}`.toLowerCase().includes(q)) &&
      (!fVille || p.ville === fVille) &&
      (!fPoste || p.poste === fPoste) &&
      (!fDec || lr(p)?.decision === fDec)
    );
  });

  const compressImage = (file: File): Promise<{ blob: Blob; name: string }> =>
    new Promise((resolve) => {
      const isPng = file.type === 'image/png';
      const mimeOut = isPng ? 'image/png' : 'image/jpeg';
      const nameOut = isPng ? 'photo.png' : 'photo.jpg';
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ blob: file, name: file.name }); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const MAX = 1200;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => resolve({ blob: blob ?? file, name: nameOut }), mimeOut, isPng ? undefined : 0.82);
        } catch { resolve({ blob: file, name: file.name }); }
      };
      img.src = url;
    });

  const readFile = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Player) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      const { blob, name } = isPdf ? { blob: f, name: f.name } : await compressImage(f);
      const data = new FormData();
      data.append('file', blob, name);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      if (!res.ok) return;
      const json = await res.json();
      if (json.url) setForm(p => p ? { ...p, [field]: json.url } : p);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form?.lastName) return;
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

  const handleRestore = async (id: string, player: Player) => {
    await restorePlayer(id, player);
    setView('list');
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
    await updatePlayer({ ...player, notes: [{ id: uid(), date: today(), text: text.trim(), scout: [scout?.firstName, scout?.lastName].filter(Boolean).join(' ') }, ...(player.notes ?? [])] });
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
          onOpenTrash={() => setView('trash')}
        />
      )}

      {view === 'trash' && (
        <TrashPage
          onBack={() => setView('list')}
          onRestored={handleRestore}
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
          onSave={save} uploading={uploading}
          onCancel={() => setView(players.some(p => p.id === form.id) ? 'detail' : 'list')}
          readFile={readFile}
        />
      )}
    </div>
  );
}
