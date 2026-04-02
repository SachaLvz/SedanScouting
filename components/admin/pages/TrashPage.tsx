'use client';
import { useState, useEffect } from 'react';
import { getProfilePhoto } from '../config';
import type { Player } from '../config';

interface TrashedPlayer extends Player {
  deletedAt: string;
}

interface TrashPageProps {
  onBack: () => void;
  onRestored: (id: string, player: Player) => void;
}

const TRASH_DAYS = 30;

function daysLeft(deletedAt: string): number {
  const d = new Date(deletedAt);
  const diff = TRASH_DAYS - Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TrashPage({ onBack, onRestored }: TrashPageProps) {
  const [players, setPlayers] = useState<TrashedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    fetch('/api/players/trash')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPlayers(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const restore = async (p: TrashedPlayer) => {
    const res = await fetch(`/api/players/${p.id}/restore`, { method: 'PUT' });
    if (res.ok) {
      setPlayers(prev => prev.filter(x => x.id !== p.id));
      const { deletedAt, ...player } = p;
      onRestored(p.id, player as Player);
    }
  };

  const deletePermanent = async (id: string) => {
    const res = await fetch(`/api/players/${id}?permanent=true`, { method: 'DELETE' });
    if (res.ok) {
      setPlayers(prev => prev.filter(x => x.id !== id));
      setConfirmId(null);
    }
  };

  const emptyTrash = async () => {
    const res = await fetch('/api/players/trash', { method: 'DELETE' });
    if (res.ok) { setPlayers([]); setConfirmAll(false); }
  };

  return (
    <div className="fu max-w-[860px] mx-auto px-5 pb-[60px]">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button className="btn-g px-3.5 py-2 text-xs" onClick={onBack}>← Joueurs</button>
          <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">🗑 Corbeille</h2>
          {players.length > 0 && (
            <span className="text-[11px] font-bold bg-[#fef2f2] text-[#dc2626] px-2.5 py-[3px] rounded-lg">
              {players.length} joueur{players.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {players.length > 0 && (
          confirmAll ? (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-[#dc2626] font-semibold">Vider définitivement ?</span>
              <button className="px-3 py-1.5 rounded-lg bg-[#dc2626] text-white text-xs font-bold cursor-pointer" onClick={emptyTrash}>Confirmer</button>
              <button className="btn-g px-3 py-1.5 text-xs" onClick={() => setConfirmAll(false)}>Annuler</button>
            </div>
          ) : (
            <button
              className="px-3.5 py-2 rounded-xl border-[1.5px] border-[#fca5a5] text-[#dc2626] text-xs font-semibold bg-[#fef2f2] cursor-pointer hover:bg-[#fee2e2]"
              onClick={() => setConfirmAll(true)}
            >
              Vider la corbeille
            </button>
          )
        )}
      </div>

      <div className="card p-4 mb-5 text-[12px] text-[#475569] flex items-start gap-2.5">
        <span className="text-base shrink-0">ℹ️</span>
        <span>Les joueurs supprimés sont conservés <strong>30 jours</strong> avant suppression définitive automatique. Vous pouvez les restaurer à tout moment pendant ce délai.</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#94a3b8]">Chargement…</div>
      ) : players.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-[52px] mb-3">🗑</div>
          <p className="text-sm text-[#94a3b8]">La corbeille est vide.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {players.map(p => {
            const jours = daysLeft(p.deletedAt);
            const urgent = jours <= 3;
            const photoUrl = getProfilePhoto(p);
            return (
              <div key={p.id} className="card px-4 py-3 flex items-center gap-3">
                <div
                  className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shrink-0 flex items-center justify-center border-2 border-[#e2e8f0] opacity-60"
                  style={{ background: 'linear-gradient(145deg,#f1f5f9,#e2e8f0)' }}
                >
                  {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[18px] opacity-30">👤</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#475569]">
                    {(p.lastName ?? '').toUpperCase()} <span className="font-medium">{p.firstName}</span>
                  </div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">
                    {p.poste} · {p.ville} · supprimé le {formatDate(p.deletedAt)}
                  </div>
                </div>

                <div
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0"
                  style={{
                    background: urgent ? '#fef2f2' : '#fffbeb',
                    color: urgent ? '#dc2626' : '#d97706',
                  }}
                >
                  {jours === 0 ? 'Dernière chance' : `${jours}j`}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#4a9de8] text-[#1e6cb6] text-[11px] font-semibold bg-[#eef5fd] cursor-pointer hover:bg-[#dbeafe]"
                    onClick={() => restore(p)}
                  >
                    ↩ Restaurer
                  </button>
                  {confirmId === p.id ? (
                    <div className="flex gap-1 items-center">
                      <button
                        className="px-2.5 py-1.5 rounded-lg bg-[#dc2626] text-white text-[11px] font-bold cursor-pointer"
                        onClick={() => deletePermanent(p.id)}
                      >
                        Confirmer
                      </button>
                      <button className="btn-g px-2 py-1.5 text-[11px]" onClick={() => setConfirmId(null)}>✕</button>
                    </div>
                  ) : (
                    <button
                      className="px-2.5 py-1.5 rounded-lg border-[1.5px] border-[#fca5a5] text-[#dc2626] text-[11px] font-semibold bg-[#fef2f2] cursor-pointer hover:bg-[#fee2e2]"
                      onClick={() => setConfirmId(p.id)}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
