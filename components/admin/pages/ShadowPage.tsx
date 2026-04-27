import { useState, useEffect, type ReactNode } from 'react';
import PitchView from '../PitchView';
import SlotPickModal from '../modals/SlotPickModal';
import { FORMATIONS } from '../config';
import type { Player, Rapport, Ratings, ShadowTeamItem, ShadowCategory } from '../config';

interface ShadowPageProps {
  teams: ShadowTeamItem[];
  categories: ShadowCategory[];
  activeTeamId: string | null;
  onSelectTeam: (team: ShadowTeamItem) => void;
  onCreateTeam: (name: string, categoryId?: string | null) => Promise<void>;
  onDeleteTeam: (id: string) => void;
  onRenameTeam: (id: string, name: string) => void;
  onMoveTeam: (teamId: string, categoryId: string | null) => void;
  onCreateCategory: (name: string) => Promise<void>;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  players: Player[];
  formation: string;
  setFormation: (f: string) => void;
  shadowTeam: Record<number, string[]>;
  setShadowTeam: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  slotPick: { idx: number; pos: string } | null;
  setSlotPick: (v: { idx: number; pos: string } | null) => void;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
  playerBaseUrl?: string;
  /** Consultation d'un autre compte : pas de création / édition */
  readOnly?: boolean;
  /** Ex. sélecteur de compte (admin) */
  viewAccountSelect?: ReactNode;
}

const NONE = '__none__'; // sentinel pour "Sans catégorie"

export default function ShadowPage({
  teams, categories, activeTeamId,
  onSelectTeam, onCreateTeam, onDeleteTeam, onRenameTeam, onMoveTeam,
  onCreateCategory, onRenameCategory, onDeleteCategory,
  players, formation, setFormation, shadowTeam, setShadowTeam,
  slotPick, setSlotPick, lr, avg, playerBaseUrl,
  readOnly = false, viewAccountSelect,
}: ShadowPageProps) {
  const slots = FORMATIONS[formation]?.slots ?? [];
  const assignedCount = Object.values(shadowTeam).filter(ids => ids.length > 0).length;

  // Détection mobile pour orientation portrait du terrain
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Tab de catégorie sélectionné
  const [selectedCat, setSelectedCat] = useState<string>(
    categories.length > 0 ? categories[0].id : NONE
  );

  // Quand les catégories chargent, sélectionner la première
  useEffect(() => {
    if (categories.length > 0 && selectedCat === NONE) {
      setSelectedCat(categories[0].id);
    }
  }, [categories]);

  // États team
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // États catégorie
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [showCreateCat, setShowCreateCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Drag & drop
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  /* ── Drag & drop ── */
  const onDragStart = (e: React.DragEvent, teamId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', teamId);
    setDraggingId(teamId);
  };
  const onDragEnd = () => { setDraggingId(null); setDropTarget(null); };

  const onTabDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(zoneId);
  };
  const onTabDrop = (e: React.DragEvent, catId: string | null) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    if (id) {
      const team = teams.find(t => t.id === id);
      if (team && team.categoryId !== catId) {
        onMoveTeam(id, catId);
        setSelectedCat(catId ?? NONE);
      }
    }
    setDraggingId(null);
    setDropTarget(null);
  };

  /* ── Handlers ── */
  const commitRenameTeam = (id: string) => {
    if (editTeamName.trim()) onRenameTeam(id, editTeamName.trim());
    setEditingTeamId(null);
  };

  const handleCreateTeam = async () => {
    const catId = selectedCat === NONE ? null : selectedCat;
    const name = newTeamName.trim() || 'Nouvelle équipe';
    await onCreateTeam(name, catId);
    setNewTeamName('');
    setShowCreateTeam(false);
  };

  const commitRenameCategory = (id: string) => {
    if (editCatName.trim()) onRenameCategory(id, editCatName.trim());
    setEditingCatId(null);
  };

  const handleCreateCategory = async () => {
    const name = newCatName.trim() || 'Nouvelle catégorie';
    await onCreateCategory(name);
    setNewCatName('');
    setShowCreateCat(false);
  };

  const handleDeleteCategory = (id: string) => {
    onDeleteCategory(id);
    if (selectedCat === id) setSelectedCat(categories.find(c => c.id !== id)?.id ?? NONE);
  };

  /* ── Équipes à afficher selon tab ── */
  const visibleTeams = selectedCat === NONE
    ? teams.filter(t => !t.categoryId)
    : teams.filter(t => t.categoryId === selectedCat);

  const uncategorizedCount = teams.filter(t => !t.categoryId).length;

  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">⚽ Shadow Team</h2>
        {viewAccountSelect}
      </div>
      {readOnly && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <strong className="font-bold">Lecture seule</strong>
          {' — '}Vous consultez la shadow team d’un autre compte. Les modifications ne sont pas possibles depuis cet écran.
        </div>
      )}

      {/* ══════════ TABS CATÉGORIES ══════════ */}
      <div className="flex items-center gap-2 mb-1">

        {/* Tabs défilables horizontalement — pas de wrapping */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 pb-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map(cat => {
            const isSelected = selectedCat === cat.id;
            const isDragTarget = dropTarget === cat.id && !!draggingId;
            return (
              <div key={cat.id} className="flex-shrink-0">
                {editingCatId === cat.id ? (
                  <input
                    className="border border-[#1e6cb6] rounded-lg px-3 py-2 text-xs font-bold outline-none w-32 bg-[#eff6ff]"
                    value={editCatName}
                    onChange={e => setEditCatName(e.target.value)}
                    onBlur={() => commitRenameCategory(cat.id)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRenameCategory(cat.id); if (e.key === 'Escape') setEditingCatId(null); }}
                    autoFocus
                  />
                ) : (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-[1.5px] whitespace-nowrap"
                    style={{
                      background: isDragTarget ? '#dbeafe' : isSelected ? '#0c2340' : '#f8fafc',
                      color: isDragTarget ? '#1d4ed8' : isSelected ? '#fff' : '#475569',
                      borderColor: isDragTarget ? '#4a9de8' : isSelected ? '#0c2340' : '#e2e8f0',
                      transform: isDragTarget ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onClick={() => setSelectedCat(cat.id)}
                    onDoubleClick={() => { if (!readOnly) { setEditingCatId(cat.id); setEditCatName(cat.name); } }}
                    onDragOver={e => onTabDragOver(e, cat.id)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={e => onTabDrop(e, cat.id)}
                    title="Double-clic pour renommer"
                  >
                    <span>{cat.name}</span>
                    <span
                      className="inline-flex items-center justify-center text-[9px] font-extrabold px-[5px] py-[1px] rounded-full leading-none"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: isSelected ? '#fff' : '#94a3b8',
                      }}
                    >
                      {teams.filter(t => t.categoryId === cat.id).length}
                    </span>
                    {!readOnly && (
                    <span
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold leading-none transition-all opacity-30 hover:opacity-100"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isSelected ? '#fff' : '#64748b',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0'; e.currentTarget.style.color = isSelected ? '#fff' : '#64748b'; }}
                      onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      title="Supprimer la catégorie"
                    >
                      ✕
                    </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          {/* Tab "Sans catégorie" */}
          {(uncategorizedCount > 0 || categories.length === 0) && (
            <button
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border-[1.5px] whitespace-nowrap"
              style={{
                background: dropTarget === NONE && draggingId ? '#dbeafe' : selectedCat === NONE ? '#0c2340' : '#f8fafc',
                color: dropTarget === NONE && draggingId ? '#1d4ed8' : selectedCat === NONE ? '#fff' : '#94a3b8',
                borderColor: dropTarget === NONE && draggingId ? '#4a9de8' : selectedCat === NONE ? '#0c2340' : '#e2e8f0',
              }}
              onClick={() => setSelectedCat(NONE)}
              onDragOver={e => onTabDragOver(e, NONE)}
              onDragLeave={() => setDropTarget(null)}
              onDrop={e => onTabDrop(e, null)}
            >
              <span>Mbarodi</span>
              <span
                className="inline-flex items-center justify-center text-[9px] font-extrabold px-[5px] py-[1px] rounded-full leading-none"
                style={{
                  background: selectedCat === NONE ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: selectedCat === NONE ? '#fff' : '#94a3b8',
                }}
              >
                {uncategorizedCount}
              </span>
            </button>
          )}
        </div>

        {/* Séparateur + bouton créer (hors scroll, toujours visible) */}
        {!readOnly && (
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <div className="w-px h-5 bg-[#e2e8f0]" />
          {showCreateCat ? (
            <div className="flex gap-1.5 items-center">
              <input
                className="border border-[#1e6cb6] rounded-lg px-2.5 py-2 text-xs outline-none w-28 bg-[#eff6ff]"
                placeholder="Nom…"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateCategory(); if (e.key === 'Escape') { setShowCreateCat(false); setNewCatName(''); } }}
                autoFocus
              />
              <button className="btn-p px-2.5 py-2 text-xs" onClick={handleCreateCategory}>OK</button>
              <button className="btn-g px-2 py-2 text-xs" onClick={() => { setShowCreateCat(false); setNewCatName(''); }}>✕</button>
            </div>
          ) : (
            <button
              className="flex-shrink-0 px-3 py-2 rounded-xl border border-dashed border-[#cbd5e1] bg-white text-[#94a3b8] text-xs font-semibold cursor-pointer hover:border-[#4a9de8] hover:text-[#1e6cb6] transition-colors whitespace-nowrap"
              onClick={() => setShowCreateCat(true)}
            >
              + Catégorie
            </button>
          )}
        </div>
        )}
      </div>

      {/* ══════════ ÉQUIPES DU TAB SÉLECTIONNÉ ══════════ */}
      <div className="flex items-center gap-2 flex-wrap mb-5 min-h-[44px] px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
        {visibleTeams.map(t => {
          const isActive = activeTeamId === t.id;
          return (
            <div
              key={t.id}
              className="group relative"
              draggable={!readOnly && editingTeamId !== t.id && categories.length > 0}
              onDragStart={e => { if (!readOnly) onDragStart(e, t.id); }}
              onDragEnd={onDragEnd}
              style={{ opacity: draggingId === t.id ? 0.4 : 1 }}
            >
              {editingTeamId === t.id ? (
                <input
                  className="border border-[#0c2340] rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none w-32"
                  value={editTeamName}
                  onChange={e => setEditTeamName(e.target.value)}
                  onBlur={() => commitRenameTeam(t.id)}
                  onKeyDown={e => { if (e.key === 'Enter') commitRenameTeam(t.id); if (e.key === 'Escape') setEditingTeamId(null); }}
                  autoFocus
                />
              ) : (
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-[1.5px] transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? '#0c2340' : '#fff',
                    color: isActive ? '#fff' : '#475569',
                    borderColor: isActive ? '#0c2340' : '#e2e8f0',
                    cursor: readOnly ? 'pointer' : categories.length > 0 ? 'grab' : 'pointer',
                  }}
                  onClick={() => onSelectTeam(t)}
                  onDoubleClick={() => { if (!readOnly) { setEditingTeamId(t.id); setEditTeamName(t.name ?? ''); } }}
                  title={readOnly ? undefined : 'Double-clic pour renommer'}
                >
                  {t.name}
                  {/* Bouton supprimer — toujours présent, discret au repos */}
                  {!readOnly && teams.length > 1 && (
                    <span
                      className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold leading-none transition-all opacity-30 group-hover:opacity-100 hover:!opacity-100"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: isActive ? '#fff' : '#64748b',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fecaca', e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={e => (e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0', e.currentTarget.style.color = isActive ? '#fff' : '#64748b')}
                      onClick={e => { e.stopPropagation(); onDeleteTeam(t.id); }}
                      title="Supprimer"
                    >
                      ✕
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {visibleTeams.length === 0 && !showCreateTeam && (
          <span className="text-[11px] text-[#cbd5e1] italic">Aucune équipe dans cette catégorie</span>
        )}

        {/* Créer équipe */}
        {!readOnly && (showCreateTeam ? (
          <div className="flex gap-1.5 items-center">
            <input
              className="border border-[#0c2340] rounded px-2 py-1.5 text-xs outline-none w-32"
              placeholder="Nom de l'équipe…"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateTeam(); if (e.key === 'Escape') { setShowCreateTeam(false); setNewTeamName(''); } }}
              autoFocus
            />
            <button className="btn-p px-3 py-1.5 text-xs" onClick={handleCreateTeam}>Créer</button>
            <button className="btn-g px-2 py-1.5 text-xs" onClick={() => { setShowCreateTeam(false); setNewTeamName(''); }}>✕</button>
          </div>
        ) : (
          <button className="btn-g px-3 py-1.5 text-xs" onClick={() => setShowCreateTeam(true)}>
            + Équipe
          </button>
        ))}
      </div>

      {readOnly && teams.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-5 py-8 text-center text-sm text-[#64748b]">
          Aucune shadow team enregistrée pour ce compte.
        </div>
      )}

      {/* ══════════ FORMATION + TERRAIN ══════════ */}
      {activeTeamId && (
        <>
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {Object.keys(FORMATIONS).map(f => (
              <button
                key={f}
                type="button"
                disabled={readOnly}
                className={formation === f ? 'btn-p px-4 py-2 text-xs' : 'btn-g px-4 py-2 text-xs'}
                style={readOnly ? { opacity: 0.65, cursor: 'not-allowed', pointerEvents: 'none' } : undefined}
                onClick={() => { if (!readOnly) { setFormation(f); setShadowTeam({}); } }}
              >
                {FORMATIONS[f].label}
              </button>
            ))}
          </div>

          <PitchView
            formation={formation}
            players={players}
            shadowTeam={shadowTeam}
            onSlotClick={(idx, pos) => setSlotPick({ idx, pos })}
            portrait={isMobile}
            readOnly={readOnly}
          />

          <div className="mt-3 text-[11px] text-[#94a3b8] font-semibold text-right">
            {assignedCount}/{slots.length} postes assignés
            {readOnly ? ' · Consultation' : ' · Cliquer sur un poste pour gérer les joueurs'}
          </div>
        </>
      )}

      {slotPick && (
        <SlotPickModal
          slotPick={slotPick}
          players={players}
          shadowTeam={shadowTeam}
          setShadowTeam={setShadowTeam}
          onClose={() => setSlotPick(null)}
          lr={lr}
          avg={avg}
          playerBaseUrl={playerBaseUrl}
        />
      )}
    </div>
  );
}
