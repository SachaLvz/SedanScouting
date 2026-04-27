'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAdminData } from '@/components/admin/context';
import ShadowPage from '@/components/admin/pages/ShadowPage';
import type { ShadowTeamItem, ShadowCategory } from '@/components/admin/config';

function parseSlots(raw: unknown): Record<number, string[]> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const parsed: Record<number, string[]> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([k, v]) => {
    parsed[Number(k)] = Array.isArray(v) ? v : [v as string];
  });
  return parsed;
}

export default function ShadowTeamRoute() {
  const { players, lr, avg, currentUserId, scouts, isAdmin } = useAdminData();
  const [viewOwnerId, setViewOwnerId] = useState(currentUserId);
  const [teams, setTeams] = useState<ShadowTeamItem[]>([]);
  const [categories, setCategories] = useState<ShadowCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formation, setFormation] = useState('4-3-3');
  const [shadowTeam, setShadowTeam] = useState<Record<number, string[]>>({});
  const [slotPick, setSlotPick] = useState<{ idx: number; pos: string } | null>(null);
  const loaded = useRef(false);

  const readOnly = isAdmin && viewOwnerId !== currentUserId;
  const effectiveOwnerId = isAdmin ? viewOwnerId : currentUserId;
  const ownerQuery = useMemo(() => encodeURIComponent(effectiveOwnerId), [effectiveOwnerId]);

  const sortedAccounts = useMemo(() => {
    return [...scouts].sort((a, b) => {
      const ln = (a.lastName || '').localeCompare(b.lastName || '', 'fr', { sensitivity: 'base' });
      if (ln !== 0) return ln;
      return (a.firstName || '').localeCompare(b.firstName || '', 'fr', { sensitivity: 'base' });
    });
  }, [scouts]);

  const viewAccountSelect = isAdmin ? (
    <label className="flex flex-col gap-1.5 w-full sm:max-w-[min(100%,360px)] sm:ml-auto">
      <span className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">Voir la shadow team de</span>
      <select
        className="inp text-sm font-semibold py-2.5"
        value={viewOwnerId}
        onChange={(e) => {
          setViewOwnerId(e.target.value);
          setSlotPick(null);
        }}
      >
        {sortedAccounts.map((s) => (
          <option key={s.id} value={s.id}>
            {[s.firstName, s.lastName].filter(Boolean).join(' ')}
            {s.id === currentUserId ? ' (moi)' : ''} — {s.role?.toLowerCase() === 'admin' ? 'Admin' : 'Scout'}
          </option>
        ))}
      </select>
    </label>
  ) : null;

  useEffect(() => {
    loaded.current = false;

    Promise.all([
      fetch(`/api/shadow-categories?ownerId=${ownerQuery}`).then((r) => r.json()),
      fetch(`/api/shadow-team?ownerId=${ownerQuery}`).then((r) => r.json()),
    ])
      .then(async ([cats, data]) => {
        if (Array.isArray(cats)) setCategories(cats);

        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          if (readOnly) {
            setTeams([]);
            setActiveId(null);
            setFormation('4-3-3');
            setShadowTeam({});
          } else {
            const res = await fetch('/api/shadow-team', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ownerId: effectiveOwnerId, name: 'Shadow Team', formation: '4-3-3' }),
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
          }
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
      })
      .catch(() => {
        loaded.current = true;
      });
  }, [ownerQuery, readOnly, effectiveOwnerId]);

  useEffect(() => {
    if (readOnly || !loaded.current || !activeId) return;
    setTeams((prev) => prev.map((t) => (t.id === activeId ? { ...t, formation, slots: shadowTeam } : t)));
    fetch(`/api/shadow-team?id=${activeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formation, slots: shadowTeam }),
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation, shadowTeam, activeId, readOnly]);

  const selectTeam = (team: ShadowTeamItem) => {
    setActiveId(team.id);
    setFormation(team.formation);
    setShadowTeam(team.slots);
    setSlotPick(null);
  };

  const handleCreateTeam = async (name: string, categoryId?: string | null) => {
    if (readOnly) return;
    const res = await fetch('/api/shadow-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: effectiveOwnerId, name, formation: '4-3-3', categoryId: categoryId ?? null }),
    });
    const team = await res.json();
    const newTeam: ShadowTeamItem = {
      id: (team.id as string) ?? crypto.randomUUID(),
      name: (team.name as string) ?? name,
      formation: (team.formation as string) ?? '4-3-3',
      slots: {},
      categoryId: categoryId ?? null,
    };
    setTeams((prev) => [...prev, newTeam]);
    selectTeam(newTeam);
  };

  const handleDeleteTeam = async (id: string) => {
    if (readOnly) return;
    if (teams.length <= 1) return;
    await fetch(`/api/shadow-team?id=${id}`, { method: 'DELETE' });
    const remaining = teams.filter((t) => t.id !== id);
    setTeams(remaining);
    if (activeId === id) selectTeam(remaining[0]);
  };

  const handleMoveTeam = async (teamId: string, categoryId: string | null) => {
    if (readOnly) return;
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, categoryId } : t)));
    await fetch(`/api/shadow-team?id=${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
    }).catch(console.error);
  };

  const handleRenameTeam = async (id: string, name: string) => {
    if (readOnly) return;
    if (!name.trim()) return;
    await fetch(`/api/shadow-team?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)));
  };

  const handleCreateCategory = async (name: string) => {
    if (readOnly) return;
    const res = await fetch('/api/shadow-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: effectiveOwnerId, name }),
    });
    const cat = await res.json();
    setCategories((prev) => [...prev, cat as ShadowCategory]);
  };

  const handleRenameCategory = async (id: string, name: string) => {
    if (readOnly) return;
    await fetch(`/api/shadow-categories?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleDeleteCategory = async (id: string) => {
    if (readOnly) return;
    await fetch(`/api/shadow-categories?id=${id}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTeams((prev) => prev.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)));
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
      setFormation={(f) => {
        if (readOnly) return;
        setFormation(f);
        setShadowTeam({});
      }}
      shadowTeam={shadowTeam}
      setShadowTeam={setShadowTeam}
      slotPick={readOnly ? null : slotPick}
      setSlotPick={setSlotPick}
      lr={lr}
      avg={avg}
      readOnly={readOnly}
      viewAccountSelect={viewAccountSelect}
    />
  );
}
