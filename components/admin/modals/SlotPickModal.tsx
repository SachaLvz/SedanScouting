import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '40px 16px', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card fu" style={{ maxWidth: 460, width: '100%', padding: 24, alignSelf: 'flex-start', boxShadow: 'var(--shL)', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>{slotPick.pos}</h3>
          <button className="btn-g" style={{ padding: '4px 10px', fontSize: 12 }} onClick={onClose}>✕</button>
        </div>

        {/* Priorités actuelles */}
        {slotPlayers.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Priorités</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {slotPlayers.map((p, i) => {
                const report = lr(p);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: i === 0 ? 'var(--blue-ghost)' : '#f8fafc', border: `1.5px solid ${i === 0 ? 'var(--blueL)' : 'var(--border)'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? 'var(--blue)' : 'var(--t3)', minWidth: 64 }}>
                      {PRIORITY_LABELS[i] ?? `${i + 1}ème`}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, opacity: .3 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={e => { e.stopPropagation(); router.push(`${playerBaseUrl}?player=${p.id}`); }}
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                      >
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{p.poste} · {p.ville}</div>
                    </div>
                    {report && <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--m)', color: 'var(--blue)', flexShrink: 0 }}>{avg(report.ratings).toFixed(1)}</span>}
                    {/* Flèches */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: '1px 5px', fontSize: 10, border: 'none', background: i === 0 ? '#f1f5f9' : '#e2e8f0', color: i === 0 ? '#cbd5e1' : '#475569', borderRadius: 4, cursor: i === 0 ? 'default' : 'pointer', lineHeight: 1 }}>▲</button>
                      <button onClick={() => moveDown(i)} disabled={i === slotPlayers.length - 1} style={{ padding: '1px 5px', fontSize: 10, border: 'none', background: i === slotPlayers.length - 1 ? '#f1f5f9' : '#e2e8f0', color: i === slotPlayers.length - 1 ? '#cbd5e1' : '#475569', borderRadius: 4, cursor: i === slotPlayers.length - 1 ? 'default' : 'pointer', lineHeight: 1 }}>▼</button>
                    </div>
                    <button onClick={() => removePlayer(p.id)} style={{ padding: '3px 7px', fontSize: 11, border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ajouter un joueur */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {slotPlayers.length === 0 ? 'Choisir un joueur' : 'Ajouter une alternative'}
          </div>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              className="inp"
              placeholder="Rechercher un joueur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
              autoFocus={slotPlayers.length === 0}
            />
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {available.length === 0
            ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--t3)', fontSize: 12 }}>Aucun joueur disponible</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {available.map(p => {
                const report = lr(p);
                return (
                  <div
                    key={p.id}
                    className="card card-click"
                    style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
                    onClick={() => addPlayer(p.id)}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 12, opacity: .3 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{p.lastName.toUpperCase()} {p.firstName}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{p.poste} · {p.ville}</div>
                    </div>
                    {report && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--m)', color: 'var(--blue)' }}>{avg(report.ratings).toFixed(1)}</span>}
                    <span style={{ fontSize: 16, color: 'var(--blue)', fontWeight: 700 }}>+</span>
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
