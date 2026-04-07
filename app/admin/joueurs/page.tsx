'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminData } from '@/components/admin/context';
import ListPage from '@/components/admin/pages/ListPage';
import DetailPage from '@/components/admin/pages/DetailPage';
import FormPage from '@/components/admin/pages/FormPage';
import TrashPage from '@/components/admin/pages/TrashPage';
import { VILLES } from '@/components/admin/config';
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
  const [sortBy, setSortBy] = useState<'created_desc' | 'note_desc' | 'note_asc'>('created_desc');
  const [form, setForm] = useState<Player | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [rForm, setRForm] = useState<Rapport | null>(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>(VILLES);

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

  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then((d: unknown) => {
        if (!Array.isArray(d)) return;
        const next = Array.from(new Set(d.map(v => String(v).trim()).filter(Boolean)));
        if (next.length > 0) setCities(next);
      })
      .catch(() => {});
  }, []);

  const availableCities = useMemo(() => {
    const fromPlayers = players.map(p => String(p.ville ?? '').trim()).filter(Boolean);
    const currentFormCity = form?.ville ? [String(form.ville).trim()] : [];
    return Array.from(new Set([...cities, ...fromPlayers, ...currentFormCity]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'fr'));
  }, [cities, players, form?.ville]);

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

  const sortedFiltered = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'created_desc') {
      return list.sort((a, b) => {
        const ta = Date.parse(a.createdAt || '');
        const tb = Date.parse(b.createdAt || '');
        return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
      });
    }
    return list.sort((a, b) => {
      const aR = lr(a);
      const bR = lr(b);
      const aN = aR ? avg(aR.ratings) : -1;
      const bN = bR ? avg(bR.ratings) : -1;
      return sortBy === 'note_desc' ? bN - aN : aN - bN;
    });
  }, [filtered, sortBy, lr, avg]);

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

  const uploadFile = async (f: File): Promise<string | null> => {
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    const { blob, name } = isPdf ? { blob: f, name: f.name } : await compressImage(f);
    const data = new FormData();
    data.append('file', blob, name);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    if (!res.ok) return null;
    const json = await res.json();
    return json.url ?? null;
  };

  const readFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Player,
    onUploaded?: (url: string) => void,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(false);
    try {
      let hasSuccess = false;
      for (const file of files) {
        const url = await uploadFile(file);
        if (!url) continue;
        hasSuccess = true;
        if (onUploaded) onUploaded(url);
        else setForm(p => p ? { ...p, [field]: url } : p);
      }
      if (!hasSuccess) setUploadError(true);
    } catch { setUploadError(true); }
    finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const normalizePlayerPhotos = (player: Player): Player => {
    const photos = Array.from(new Set((player.photos ?? []).filter(Boolean)));
    const profilePhoto = player.profilePhoto || player.photo || photos[0] || '';
    const mergedPhotos = profilePhoto && !photos.includes(profilePhoto) ? [profilePhoto, ...photos] : photos;
    return {
      ...player,
      photos: mergedPhotos,
      profilePhoto,
      photo: profilePhoto,
    };
  };

  const save = async () => {
    if (!form?.lastName) return;
    const normalized = normalizePlayerPhotos(form);
    const isEdit = players.some(p => p.id === form.id);
    if (isEdit) {
      await updatePlayer(normalized);
    } else {
      await createPlayer(normalized);
    }
    setSelId(normalized.id); setView('detail'); setTab('profil');
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
    if (editingReportId) {
      const updatedReports = (player.rapports ?? []).map(r =>
        r.id === editingReportId ? { ...rForm, id: r.id, locked: r.locked } : r
      );
      await updatePlayer({ ...player, rapports: updatedReports });
    } else {
      await updatePlayer({ ...player, rapports: [{ ...rForm, locked: false }, ...(player.rapports ?? [])] });
    }
    if (rForm.matchId) {
      const m = matches.find(x => x.id === rForm.matchId);
      if (m) await updateMatch({ ...m, statut: 'termine' });
    }
    setShowR(false); setRForm(null); setEditingReportId(null); setTab('rapports');
  };

  const editReport = (report: Rapport) => {
    setEditingReportId(report.id);
    setRForm({ ...report, locked: false });
    setShowR(true);
  };

  const deleteReport = async (reportId: string) => {
    const player = players.find(p => p.id === selId);
    if (!player) return;
    await updatePlayer({ ...player, rapports: (player.rapports ?? []).filter(r => r.id !== reportId) });
    if (openR === reportId) setOpenR(null);
    if (editingReportId === reportId) {
      setEditingReportId(null);
      setShowR(false);
      setRForm(null);
    }
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

  const updatePhone = async (phone: string) => {
    const player = players.find(p => p.id === selId);
    if (!player) return;
    await updatePlayer({ ...player, phone });
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
          sortBy={sortBy} setSortBy={setSortBy}
          cities={availableCities}
          filtered={sortedFiltered}
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
          editingReportId={editingReportId}
          onStartNewReport={() => setEditingReportId(null)}
          onCancelReportEdit={() => setEditingReportId(null)}
          onSaveReport={saveReport} onEditReport={editReport} onDeleteReport={deleteReport}
          onDelete={del} onUpdatePhone={updatePhone}
        />
      )}

      {view === 'form' && form && (
        <FormPage
          form={form} setForm={setForm} players={players}
          onSave={save} uploading={uploading} uploadError={uploadError}
          cities={availableCities}
          onCancel={() => setView(players.some(p => p.id === form.id) ? 'detail' : 'list')}
          readFile={readFile}
        />
      )}
    </div>
  );
}
