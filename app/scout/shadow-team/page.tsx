'use client';
import { useState, useEffect, useRef } from 'react';
import { useScoutData } from '@/components/scout/context';
import ShadowPage from '@/components/admin/pages/ShadowPage';
import type { ShadowTeamItem } from '@/components/admin/config';

function parseSlots(raw: unknown): Record<number, string[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const parsed: Record<number, string[]> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([k, v]) => {
    parsed[Number(k)] = Array.isArray(v) ? v : [v as string];
  });
  return parsed;
}

function getScoutId(): string {
  try {
    const u = JSON.parse(localStorage.getItem('mbarodi_user') ?? '{}');
    return u.id ?? 'scout-default';
  } catch { return 'scout-default'; }
}

export default function ScoutShadowTeamPage() {
  const { players, lr, avg } = useScoutData();
  const [teams, setTeams] = useState<ShadowTeamItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string[]>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);
  const loaded = useRef(false);
  const ownerId = useRef('scout-default');

  /* Charger toutes les équipes au montage */
  useEffect(() => {
    ownerId.current = getScoutId();
    fetch(`/api/shadow-team?ownerId=${ownerId.current}`)
      .then(r => r.json())
      .then(async (data: unknown) => {
        const list = Array.isArray(data) ? data : [];

        if (list.length === 0) {
          const res = await fetch('/api/shadow-team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ownerId: ownerId.current, name: 'Shadow Team', formation: '4-3-3' }),
          });
          const team = await res.json();
          const t: ShadowTeamItem = {
            id: (team.id as string) ?? crypto.randomUUID(),
            name: (team.name as string) ?? 'Shadow Team',
            formation: (team.formation as string) ?? '4-3-3',
            slots: {},
          };
          setTeams([t]);
          setActiveId(t.id);
          setFormation(t.formation);
          setShadowTeam({});
        } else {
          const parsed: ShadowTeamItem[] = list.map((d: Record<string, unknown>) => ({
            id: (d.id as string) ?? '',
            name: (d.name as string) ?? 'Shadow Team',
            formation: (d.formation as string) ?? '4-3-3',
            slots: parseSlots(d.slots),
          }));
          setTeams(parsed);
          setActiveId(parsed[0].id);
          setFormation(parsed[0].formation);
          setShadowTeam(parsed[0].slots);
        }
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; });
  }, []);

  /* Sauvegarder automatiquement */
  useEffect(() => {
    if (!loaded.current || !activeId) return;
    setTeams(prev => prev.map(t => t.id === activeId ? { ...t, formation, slots: shadowTeam } : t));
    fetch(`/api/shadow-team?id=${activeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formation, slots: shadowTeam }),
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation, shadowTeam, activeId]);

  const selectTeam = (team: ShadowTeamItem) => {
    setActiveId(team.id);
    setFormation(team.formation);
    setShadowTeam(team.slots);
    setSlotPick(null);
  };

  const handleCreate = async (name: string) => {
    const res = await fetch('/api/shadow-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: ownerId.current, name, formation: '4-3-3' }),
    });
    const team = await res.json();
    const newTeam: ShadowTeamItem = {
      id: (team.id as string) ?? crypto.randomUUID(),
      name: (team.name as string) ?? name,
      formation: (team.formation as string) ?? '4-3-3',
      slots: {},
    };
    setTeams(prev => [...prev, newTeam]);
    selectTeam(newTeam);
  };

  const handleDelete = async (id: string) => {
    if (teams.length <= 1) return;
    await fetch(`/api/shadow-team?id=${id}`, { method: 'DELETE' });
    const remaining = teams.filter(t => t.id !== id);
    setTeams(remaining);
    if (activeId === id) selectTeam(remaining[0]);
  };

  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    await fetch(`/api/shadow-team?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name: name.trim() } : t));
  };

  return (
    <ShadowPage
      teams={teams}
      activeTeamId={activeId}
      onSelectTeam={selectTeam}
      onCreateTeam={handleCreate}
      onDeleteTeam={handleDelete}
      onRenameTeam={handleRename}
      players={players}
      formation={formation}
      setFormation={(f) => { setFormation(f); setShadowTeam({}); }}
      shadowTeam={shadowTeam}
      setShadowTeam={setShadowTeam}
      slotPick={slotPick}
      setSlotPick={setSlotPick}
      lr={lr as (p: Parameters<typeof lr>[0]) => ReturnType<typeof lr>}
      avg={(r) => avg(r)}
      playerBaseUrl="/scout/joueurs"
    />
  );
}
