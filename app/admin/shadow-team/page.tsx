'use client';
import { useState, useEffect, useRef } from 'react';
import { useAdminData } from '@/components/admin/context';
import ShadowPage from '@/components/admin/pages/ShadowPage';
import type { ShadowTeamItem, ShadowCategory } from '@/components/admin/config';

const OWNER = 'main';

function parseSlots(raw: unknown): Record<number, string[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const parsed: Record<number, string[]> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([k, v]) => {
    parsed[Number(k)] = Array.isArray(v) ? v : [v as string];
  });
  return parsed;
}

export default function ShadowTeamRoute() {
  const { players, lr, avg } = useAdminData();
  const [teams, setTeams] = useState<ShadowTeamItem[]>([]);
  const [categories, setCategories] = useState<ShadowCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string[]>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    // Charger catégories et équipes en parallèle
    Promise.all([
      fetch(`/api/shadow-categories?ownerId=${OWNER}`).then(r => r.json()),
      fetch(`/api/shadow-team?ownerId=${OWNER}`).then(r => r.json()),
    ]).then(async ([cats, data]) => {
      if (Array.isArray(cats)) setCategories(cats);

      const list = Array.isArray(data) ? data : [];
      if (list.length === 0) {
        const res = await fetch('/api/shadow-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId: OWNER, name: 'Shadow Team', formation: '4-3-3' }),
        });
        const team = await res.json();
        const t: ShadowTeamItem = {
          id: (team.id as string) ?? crypto.randomUUID(),
          name: (team.name as string) ?? 'Shadow Team',
          formation: (team.formation as string) ?? '4-3-3',
          slots: {},
          categoryId: null,
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
          categoryId: (d.categoryId as string | null) ?? null,
        }));
        setTeams(parsed);
        setActiveId(parsed[0].id);
        setFormation(parsed[0].formation);
        setShadowTeam(parsed[0].slots);
      }
      loaded.current = true;
    }).catch(() => { loaded.current = true; });
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

  /* ── Teams ── */
  const handleCreateTeam = async (name: string, categoryId?: string | null) => {
    const res = await fetch('/api/shadow-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: OWNER, name, formation: '4-3-3', categoryId: categoryId ?? null }),
    });
    const team = await res.json();
    const newTeam: ShadowTeamItem = {
      id: (team.id as string) ?? crypto.randomUUID(),
      name: (team.name as string) ?? name,
      formation: (team.formation as string) ?? '4-3-3',
      slots: {},
      categoryId: categoryId ?? null,
    };
    setTeams(prev => [...prev, newTeam]);
    selectTeam(newTeam);
  };

  const handleDeleteTeam = async (id: string) => {
    if (teams.length <= 1) return;
    await fetch(`/api/shadow-team?id=${id}`, { method: 'DELETE' });
    const remaining = teams.filter(t => t.id !== id);
    setTeams(remaining);
    if (activeId === id) selectTeam(remaining[0]);
  };

  const handleMoveTeam = async (teamId: string, categoryId: string | null) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, categoryId } : t));
    await fetch(`/api/shadow-team?id=${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
    }).catch(console.error);
  };

  const handleRenameTeam = async (id: string, name: string) => {
    if (!name.trim()) return;
    await fetch(`/api/shadow-team?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name: name.trim() } : t));
  };

  /* ── Categories ── */
  const handleCreateCategory = async (name: string) => {
    const res = await fetch('/api/shadow-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: OWNER, name }),
    });
    const cat = await res.json();
    setCategories(prev => [...prev, cat as ShadowCategory]);
  };

  const handleRenameCategory = async (id: string, name: string) => {
    await fetch(`/api/shadow-categories?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleDeleteCategory = async (id: string) => {
    await fetch(`/api/shadow-categories?id=${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
    // Les équipes de cette catégorie passent à categoryId = null côté DB (onDelete: SetNull)
    setTeams(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: null } : t));
  };

  return (
    <ShadowPage
      teams={teams}
      categories={categories}
      activeTeamId={activeId}
      onSelectTeam={selectTeam}
      onCreateTeam={handleCreateTeam}
      onDeleteTeam={handleDeleteTeam}
      onRenameTeam={handleRenameTeam}
      onMoveTeam={handleMoveTeam}
      onCreateCategory={handleCreateCategory}
      onRenameCategory={handleRenameCategory}
      onDeleteCategory={handleDeleteCategory}
      players={players}
      formation={formation}
      setFormation={(f) => { setFormation(f); setShadowTeam({}); }}
      shadowTeam={shadowTeam}
      setShadowTeam={setShadowTeam}
      slotPick={slotPick}
      setSlotPick={setSlotPick}
      lr={lr}
      avg={avg}
    />
  );
}
