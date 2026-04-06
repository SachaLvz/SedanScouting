'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useScoutData } from '@/components/scout/context';
import ListPage from '@/components/scout/pages/ListPage';
import DetailPage from '@/components/scout/pages/DetailPage';
import FormPage from '@/components/scout/pages/FormPage';
import { Match } from '@/components/admin/config';

export default function ScoutJoueursPage() {
  const { players, scoutNom, updatePlayer, createPlayer, deletePlayer, lr, avg, getDec, blank, blankR } = useScoutData();

  const [view, setView] = useState('list');
  const [selId, setSelId] = useState<string | null>(null);
  const [tab, setTab] = useState('profil');
  const [search, setSearch] = useState('');
  const [fVille, setFVille] = useState('');
  const [fPoste, setFPoste] = useState('');
  const [fDec, setFDec] = useState('');
  const [fListe, setFListe] = useState('');
  const [form, setForm] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [rForm, setRForm] = useState<any>(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [currentScoutId, setCurrentScoutId] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const scoutId = (() => { try { return JSON.parse(localStorage.getItem('mbarodi_user') ?? '{}').id ?? ''; } catch { return ''; } })();
    setCurrentScoutId(scoutId);
    fetch('/api/matches')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMatches(d.filter((m: Match) => (m.scouts ?? []).includes(scoutId)) as Match[]); })
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

  const readFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string, onUploaded?: (url: string) => void) => {
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
        else setForm((p: any) => ({ ...p, [field]: url }));
      }
      if (!hasSuccess) setUploadError(true);
    } catch { setUploadError(true); }
    finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const normalizePlayerPhotos = (player: any) => {
    const photos = Array.from(new Set((player.photos || []).filter(Boolean)));
    const profilePhoto = player.profilePhoto || player.photo || photos[0] || '';
    const mergedPhotos = profilePhoto && !photos.includes(profilePhoto) ? [profilePhoto, ...photos] : photos;
    return { ...player, photos: mergedPhotos, profilePhoto, photo: profilePhoto };
  };

  const save = async () => {
    if (!form?.lastName) return;
    const normalized = normalizePlayerPhotos(form);
    const isEdit = players.some((p: any) => p.id === form.id);
    if (isEdit) { await updatePlayer(normalized); } else { await createPlayer(normalized); }
    setSelId(normalized.id); setView('detail'); setTab('profil');
  };

  const del = async (id: string) => {
    await deletePlayer(id);
    setSelId(null); setView('list');
  };

  const saveReport = async () => {
    if (!rForm?.conclusion) return;
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    if (editingReportId) {
      const updatedReports = (player.rapports || []).map((r: any) =>
        r.id === editingReportId ? { ...rForm, id: r.id, scoutId: r.scoutId, scoutName: r.scoutName } : r
      );
      await updatePlayer({ ...player, rapports: updatedReports });
    } else {
      await updatePlayer({ ...player, rapports: [rForm, ...(player.rapports || [])] });
    }
    setShowR(false); setRForm(null); setEditingReportId(null); setTab('rapports');
  };

  const startNewReport = () => {
    setEditingReportId(null);
    if (!sel) return;
    setRForm(blankR(sel));
    setShowR(true);
  };

  const cancelReportEdit = () => {
    setEditingReportId(null);
  };

  const editReport = (report: any) => {
    setEditingReportId(report.id);
    setRForm({ ...report });
    setShowR(true);
  };

  const deleteReport = async (reportId: string) => {
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    const target = (player.rapports || []).find((r: any) => r.id === reportId);
    const isOwn = Boolean(target) && (target.scoutId === currentScoutId || target.scoutName === scoutNom);
    if (!target || !isOwn) return;
    await updatePlayer({ ...player, rapports: (player.rapports || []).filter((r: any) => r.id !== reportId) });
    if (openR === reportId) setOpenR(null);
    if (editingReportId === reportId) {
      setEditingReportId(null);
      setShowR(false);
      setRForm(null);
    }
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

  const updatePhone = async (phone: string) => {
    const player = players.find((p: any) => p.id === selId);
    if (!player) return;
    await updatePlayer({ ...player, phone });
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
          showR={showR} setShowR={setShowR}
          rForm={rForm} setRForm={setRForm}
          openR={openR} setOpenR={setOpenR}
          scoutNom={scoutNom} currentScoutId={currentScoutId} avg={avg} matches={matches}
          editingReportId={editingReportId}
          onBack={() => setView('list')}
          onEdit={() => { setForm({ ...sel }); setView('form'); }}
          onDelete={del}
          onStartNewReport={startNewReport}
          onCancelReportEdit={cancelReportEdit}
          onEditReport={editReport}
          onDeleteReport={deleteReport}
          onSaveReport={saveReport}
          onAddNote={addNote}
          onToggleListe={toggleListe}
          onUpdatePhone={updatePhone}
        />
      )}

      {view === 'form' && form && (
        <FormPage
          form={form} setForm={setForm} players={players}
          onSave={save} uploading={uploading} uploadError={uploadError}
          onBack={() => setView(players.some((p: any) => p.id === form.id) ? 'detail' : 'list')}
          readFile={readFile}
        />
      )}
    </div>
  );
}
