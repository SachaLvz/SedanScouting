import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfilePhoto } from '../config';
import type { Player, Rapport, Ratings } from '../config';

interface SlotPickModalProps {
  slotPick: { idx: number; pos: string };
  players: Player[];
  shadowTeam: Record<number, string[]>;
  setShadowTeam: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  onClose: () => void;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
  playerBaseUrl?: string;
}

export default function SlotPickModal({ slotPick, players, shadowTeam, setShadowTeam, onClose, lr, avg, playerBaseUrl = '/admin/joueurs' }: SlotPickModalProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const slotIds = shadowTeam[slotPick.idx] ?? [];
  const slotPlayers = slotIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  const allAssignedIds = new Set(Object.values(shadowTeam).flat());
  const available = players
    .filter(p => !allAssignedIds.has(p.id))
    .filter(p => !search || `${p.lastName} ${p.firstName}`.toLowerCase().includes(search.toLowerCase()));

  const addPlayer = (id: string) => {
    setShadowTeam(prev => ({ ...prev, [slotPick.idx]: [...(prev[slotPick.idx] ?? []), id] }));
  };

  const removePlayer = (id: string) => {
    setShadowTeam(prev => {
      const arr = (prev[slotPick.idx] ?? []).filter(x => x !== id);
      if (arr.length === 0) { const n = { ...prev }; delete n[slotPick.idx]; return n; }
      return { ...prev, [slotPick.idx]: arr };
    });
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    setShadowTeam(prev => {
      const arr = [...(prev[slotPick.idx] ?? [])];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return { ...prev, [slotPick.idx]: arr };
    });
  };

  const moveDown = (i: number) => {
    setShadowTeam(prev => {
      const arr = [...(prev[slotPick.idx] ?? [])];
      if (i === arr.length - 1) return prev;
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return { ...prev, [slotPick.idx]: arr };
    });
  };

  const PRIORITY_LABELS = ['1er choix', '2ème choix', '3ème choix', '4ème choix', '5ème choix'];

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] flex justify-center px-4 py-10 backdrop-blur-[4px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu max-w-[460px] w-full p-6 self-start shadow-[0_12px_40px_rgba(15,23,42,0.1)] max-h-[85vh] overflow-y-auto flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h3 className="m-0 text-base font-extrabold text-[#0c2340]">{slotPick.pos}</h3>
          <button className="btn-g px-2.5 py-1 text-xs" onClick={onClose}>✕</button>
        </div>

        {/* Priorités actuelles */}
        {slotPlayers.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1px] mb-2">Priorités</div>
            <div className="flex flex-col gap-1">
              {slotPlayers.map((p, i) => {
                const report = lr(p);
                const photoUrl = getProfilePhoto(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] border-[1.5px]"
                    style={{ background: i === 0 ? '#eef5fd' : '#f8fafc', borderColor: i === 0 ? '#4a9de8' : '#e2e8f0' }}
                  >
                    <div className="text-[10px] font-extrabold min-w-16" style={{ color: i === 0 ? '#1e6cb6' : '#94a3b8' }}>
                      {PRIORITY_LABELS[i] ?? `${i + 1}ème`}
                    </div>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#f1f5f9] border border-[#e2e8f0] shrink-0 flex items-center justify-center">
                      {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] opacity-30">👤</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        onClick={e => { e.stopPropagation(); router.push(`${playerBaseUrl}?player=${p.id}`); }}
                        className="text-xs font-bold text-[#1e6cb6] truncate cursor-pointer underline decoration-dotted"
                      >
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div className="text-[10px] text-[#94a3b8]">{p.poste} · {p.ville}</div>
                    </div>
                    {report && <span className="text-[11px] font-bold font-mono text-[#1e6cb6] shrink-0">{avg(report.ratings).toFixed(1)}</span>}
                    {/* Flèches */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="px-[5px] py-px text-[10px] border-none rounded-[4px] leading-none"
                        style={{ background: i === 0 ? '#f1f5f9' : '#e2e8f0', color: i === 0 ? '#cbd5e1' : '#475569', cursor: i === 0 ? 'default' : 'pointer' }}
                      >▲</button>
                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === slotPlayers.length - 1}
                        className="px-[5px] py-px text-[10px] border-none rounded-[4px] leading-none"
                        style={{ background: i === slotPlayers.length - 1 ? '#f1f5f9' : '#e2e8f0', color: i === slotPlayers.length - 1 ? '#cbd5e1' : '#475569', cursor: i === slotPlayers.length - 1 ? 'default' : 'pointer' }}
                      >▼</button>
                    </div>
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="px-[7px] py-[3px] text-[11px] border-none bg-[#fef2f2] text-[#dc2626] rounded-[6px] cursor-pointer font-bold shrink-0"
                    >✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ajouter un joueur */}
        <div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1px] mb-2">
            {slotPlayers.length === 0 ? 'Choisir un joueur' : 'Ajouter une alternative'}
          </div>
          <div className="relative mb-2">
            <input
              className="inp pl-9"
              placeholder="Rechercher un joueur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus={slotPlayers.length === 0}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {available.length === 0
            ? <div className="text-center py-5 text-[#94a3b8] text-xs">Aucun joueur disponible</div>
            : <div className="flex flex-col gap-1">
              {available.map(p => {
                const report = lr(p);
                const photoUrl = getProfilePhoto(p);
                return (
                  <div
                    key={p.id}
                    className="card card-click px-3.5 py-2.5 flex items-center gap-2.5"
                    onClick={() => addPlayer(p.id)}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#f1f5f9] flex items-center justify-center border border-[#e2e8f0]">
                      {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs opacity-30">👤</span>}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#0c2340]">{p.lastName.toUpperCase()} {p.firstName}</div>
                      <div className="text-[10px] text-[#94a3b8]">{p.poste} · {p.ville}</div>
                    </div>
                    {report && <span className="text-xs font-bold font-mono text-[#1e6cb6]">{avg(report.ratings).toFixed(1)}</span>}
                    <span className="text-base text-[#1e6cb6] font-bold">+</span>
                  </div>
                );
              })}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
