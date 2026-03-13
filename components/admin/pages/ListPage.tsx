import { useState, useEffect } from 'react';
import Tag from '../Tag';
import type { Player, Match, DecisionItem, Rapport, Ratings } from '../config';
import { POSITIONS, VILLES, DECISIONS } from '../config';

const PAGE_SIZE = 20;

interface ListPageProps {
  players: Player[];
  matches: Match[];
  search: string;
  setSearch: (v: string) => void;
  fVille: string;
  setFVille: (v: string) => void;
  fPoste: string;
  setFPoste: (v: string) => void;
  fDec: string;
  setFDec: (v: string) => void;
  filtered: Player[];
  setSelId: (id: string) => void;
  setView: (v: string) => void;
  setTab: (t: string) => void;
  setForm: (p: Player) => void;
  lr: (p: Player) => Rapport | undefined;
  getDec: (p: Player) => DecisionItem | null;
  avg: (r: Ratings) => number;
  reportCount: (p: Player) => number;
  blank: () => Player;
}

export default function ListPage({
  players, matches, search, setSearch, fVille, setFVille, fPoste, setFPoste, fDec, setFDec,
  filtered, setSelId, setView, setTab, setForm, lr, getDec, avg, reportCount, blank,
}: ListPageProps) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, fVille, fPoste, fDec]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = [
    { l: 'Joueurs',  v: players.length,                                                                          c: '#1e6cb6',  bg: '#eef5fd' },
    { l: 'Rapports', v: players.reduce((s, p) => s + reportCount(p), 0),                                        c: '#9333ea',  bg: '#faf5ff' },
    { l: 'Retenus',  v: players.filter(p => ['retenu','signer','europe'].includes(lr(p)?.decision ?? '')).length, c: '#16a34a',  bg: '#f0fdf4' },
    { l: 'Matchs',   v: matches.length,                                                                          c: '#d97706',  bg: '#fffbeb' },
  ];

  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <input className="inp pl-10" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className="btn-p px-6 py-3 text-[13px]" onClick={() => { setForm(blank()); setView('form'); }}>+ Nouveau joueur</button>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-[22px]">
        <select className="inp w-auto px-3 py-2 text-[11px]" value={fPoste} onChange={e => setFPoste(e.target.value)}>
          <option value="">Poste</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="inp w-auto px-3 py-2 text-[11px]" value={fVille} onChange={e => setFVille(e.target.value)}>
          <option value="">Ville</option>{VILLES.map(v => <option key={v}>{v}</option>)}
        </select>
        <select className="inp w-auto px-3 py-2 text-[11px]" value={fDec} onChange={e => setFDec(e.target.value)}>
          <option value="">Décision</option>{DECISIONS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
        </select>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.l} className="px-2.5 py-4 text-center rounded-2xl" style={{ background: s.bg }}>
            <div className="text-[24px] font-extrabold font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] font-bold mt-1.5 uppercase tracking-[1.5px] opacity-60" style={{ color: s.c }}>{s.l}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-[60px]">
          <div className="text-[52px] mb-3.5">🦁</div>
          <p className="text-sm text-[#94a3b8]">{players.length === 0 ? 'Aucun joueur. Lancez la détection !' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {paginated.map((p, idx) => {
            const r = lr(p);
            const d = getDec(p);
            const a = r ? avg(r.ratings) : null;
            const aC = a ? (a >= 5 ? '#16a34a' : a >= 3.5 ? '#d97706' : '#dc2626') : null;
            const rc = reportCount(p);
            return (
              <div
                key={p.id}
                className="card card-click px-4 py-3 flex items-center gap-3"
                style={{ animationDelay: `${idx * 25}ms`, animation: 'fadeUp .3s ease-out forwards', opacity: 0 }}
                onClick={() => { setSelId(p.id); setView('detail'); setTab('profil'); }}
              >
                <div className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shrink-0 flex items-center justify-center border-2 border-[#e2e8f0]" style={{ background: 'linear-gradient(145deg,#dbeafe,#f1f5f9)' }}>
                  {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-[18px] opacity-30">👤</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0c2340] truncate">
                      {(p.lastName ?? '').toUpperCase()} <span className="font-medium text-[#475569]">{p.firstName}</span>
                    </span>
                    {rc > 0 && <span className="text-[10px] font-extrabold text-[#1e6cb6] bg-[#eef5fd] px-[7px] py-px rounded-[6px] font-mono">{rc}</span>}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Tag color="#1e6cb6" bg="#eef5fd">{p.poste}</Tag>
                    <Tag>{p.ville}</Tag>
                    <Tag>{p.pied}</Tag>
                    {p.agent && <Tag color="#9333ea" bg="#faf5ff">Agent: {p.agent}</Tag>}
                  </div>
                </div>
                {d && <Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div
                  className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border-2"
                  style={{ background: a ? `${aC}08` : '#f8fafc', borderColor: a ? `${aC}20` : '#e2e8f0' }}
                >
                  <span className="font-mono text-[15px] font-bold" style={{ color: aC ?? '#cbd5e1' }}>{a ? a.toFixed(1) : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-[7px] rounded-[10px] border-[1.5px] border-[#e2e8f0] bg-white text-[13px] font-bold"
            style={{ color: page === 1 ? '#cbd5e1' : '#0c2340', cursor: page === 1 ? 'default' : 'pointer' }}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="px-3 py-[7px] rounded-[10px] border-[1.5px] cursor-pointer text-[13px] font-bold min-w-9"
              style={{ borderColor: n === page ? '#1e6cb6' : '#e2e8f0', background: n === page ? '#1e6cb6' : '#fff', color: n === page ? '#fff' : '#0c2340' }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-[7px] rounded-[10px] border-[1.5px] border-[#e2e8f0] bg-white text-[13px] font-bold"
            style={{ color: page === totalPages ? '#cbd5e1' : '#0c2340', cursor: page === totalPages ? 'default' : 'pointer' }}
          >
            ›
          </button>
          <span className="text-[11px] text-[#94a3b8] ml-2">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
        </div>
      )}
    </div>
  );
}
