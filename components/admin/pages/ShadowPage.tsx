import { useState } from 'react';
import PitchView from '../PitchView';
import SlotPickModal from '../modals/SlotPickModal';
import { FORMATIONS } from '../config';
import type { Player, Rapport, Ratings, ShadowTeamItem } from '../config';

interface ShadowPageProps {
  teams: ShadowTeamItem[];
  activeTeamId: string | null;
  onSelectTeam: (team: ShadowTeamItem) => void;
  onCreateTeam: (name: string) => Promise<void>;
  onDeleteTeam: (id: string) => void;
  onRenameTeam: (id: string, name: string) => void;
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
}

function CreateTeamControl({
  showCreate, newName, onNameChange, onCreate, onOpen, onCancel,
}: {
  showCreate: boolean;
  newName: string;
  onNameChange: (v: string) => void;
  onCreate: () => void;
  onOpen: () => void;
  onCancel: () => void;
}) {
  if (showCreate) {
    return (
      <div className="flex gap-1.5 items-center">
        <input
          className="border border-[#0c2340] rounded px-2 py-1.5 text-xs outline-none w-36"
          placeholder="Nom de l'équipe…"
          value={newName}
          onChange={e => onNameChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onCreate(); if (e.key === 'Escape') onCancel(); }}
          autoFocus
        />
        <button className="btn-p px-3 py-1.5 text-xs" onClick={onCreate}>Créer</button>
        <button className="btn-g px-3 py-1.5 text-xs" onClick={onCancel}>✕</button>
      </div>
    );
  }
  return (
    <button className="btn-g px-3 py-1.5 text-xs" onClick={onOpen}>
      + Nouvelle équipe
    </button>
  );
}

export default function ShadowPage({
  teams, activeTeamId, onSelectTeam, onCreateTeam, onDeleteTeam, onRenameTeam,
  players, formation, setFormation, shadowTeam, setShadowTeam,
  slotPick, setSlotPick, lr, avg, playerBaseUrl,
}: ShadowPageProps) {
  const slots = FORMATIONS[formation]?.slots ?? [];
  const assignedCount = Object.values(shadowTeam).filter(ids => ids.length > 0).length;

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    const name = newName.trim() || 'Nouvelle équipe';
    await onCreateTeam(name);
    setNewName('');
    setShowCreate(false);
  };

  const commitRename = (id: string) => {
    if (editName.trim()) onRenameTeam(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <h2 className="m-0 mb-4 text-xl font-extrabold text-[#0c2340]">⚽ Shadow Team</h2>

      {/* Sélecteur d'équipes */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {teams.map(t => (
          <div key={t.id} className="flex items-center gap-0.5">
            {editingId === t.id ? (
              <input
                className="border border-[#0c2340] rounded px-2 py-1 text-xs font-semibold outline-none w-36"
                value={editName ?? ''}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => commitRename(t.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename(t.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
              />
            ) : (
              <button
                className={activeTeamId === t.id ? 'btn-p px-3 py-1.5 text-xs' : 'btn-g px-3 py-1.5 text-xs'}
                onClick={() => onSelectTeam(t)}
                onDoubleClick={() => { setEditingId(t.id); setEditName(t.name ?? ''); }}
                title="Double-clic pour renommer"
              >
                {t.name}
              </button>
            )}
            {teams.length > 1 && editingId !== t.id && (
              <button
                className="text-[#94a3b8] hover:text-red-500 text-[10px] px-1 leading-none"
                onClick={() => onDeleteTeam(t.id)}
                title="Supprimer cette équipe"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <CreateTeamControl
          showCreate={showCreate}
          newName={newName ?? ''}
          onNameChange={setNewName}
          onCreate={handleCreate}
          onOpen={() => setShowCreate(true)}
          onCancel={() => { setShowCreate(false); setNewName(''); }}
        />
      </div>

      {/* Sélection formation */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {Object.keys(FORMATIONS).map(f => (
          <button
            key={f}
            className={formation === f ? 'btn-p px-4 py-2 text-xs' : 'btn-g px-4 py-2 text-xs'}
            onClick={() => { setFormation(f); setShadowTeam({}); }}
          >
            {FORMATIONS[f].label}
          </button>
        ))}
      </div>

      {/* Terrain */}
      <PitchView
        formation={formation}
        players={players}
        shadowTeam={shadowTeam}
        onSlotClick={(idx, pos) => setSlotPick({ idx, pos })}
      />

      <div className="mt-3 text-[11px] text-[#94a3b8] font-semibold text-right">
        {assignedCount}/{slots.length} postes assignés · Cliquer sur un poste pour gérer les joueurs
      </div>

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
