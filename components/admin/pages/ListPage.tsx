import Tag from '../Tag';
import type { Player, Match, DecisionItem, Rapport, Ratings } from '../config';
import { POSITIONS, VILLES, DECISIONS } from '../config';

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
  const stats = [
    { l: 'Joueurs',  v: players.length,                                                                          c: 'var(--blue)',   bg: 'var(--blueG)' },
    { l: 'Rapports', v: players.reduce((s, p) => s + reportCount(p), 0),                                        c: '#9333ea',       bg: '#faf5ff' },
    { l: 'Retenus',  v: players.filter(p => ['retenu','signer','europe'].includes(lr(p)?.decision ?? '')).length, c: '#16a34a',       bg: '#f0fdf4' },
    { l: 'Matchs',   v: matches.length,                                                                          c: '#d97706',       bg: '#fffbeb' },
  ];

  return (
    <div className="fu" style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input className="inp" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className="btn-p" style={{ padding: '12px 24px', fontSize: 13 }} onClick={() => { setForm(blank()); setView('form'); }}>+ Nouveau joueur</button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
        <select className="inp" value={fPoste} onChange={e => setFPoste(e.target.value)} style={{ width: 'auto', padding: '8px 12px', fontSize: 11 }}>
          <option value="">Poste</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="inp" value={fVille} onChange={e => setFVille(e.target.value)} style={{ width: 'auto', padding: '8px 12px', fontSize: 11 }}>
          <option value="">Ville</option>{VILLES.map(v => <option key={v}>{v}</option>)}
        </select>
        <select className="inp" value={fDec} onChange={e => setFDec(e.target.value)} style={{ width: 'auto', padding: '8px 12px', fontSize: 11 }}>
          <option value="">Décision</option>{DECISIONS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.l} style={{ padding: '16px 10px', textAlign: 'center', borderRadius: 14, background: s.bg }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: 'var(--m)' }}>{s.v}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: s.c, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1.5, opacity: .6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🦁</div>
          <p style={{ fontSize: 14, color: 'var(--t3)' }}>{players.length === 0 ? 'Aucun joueur. Lancez la détection !' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((p, idx) => {
            const r = lr(p);
            const d = getDec(p);
            const a = r ? avg(r.ratings) : null;
            const aC = a ? (a >= 5 ? '#16a34a' : a >= 3.5 ? '#d97706' : '#dc2626') : null;
            const rc = reportCount(p);
            return (
              <div
                key={p.id}
                className="card card-click"
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, animationDelay: `${idx * 25}ms`, animation: 'fu .3s ease-out forwards', opacity: 0 }}
                onClick={() => { setSelId(p.id); setView('detail'); setTab('profil'); }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 13, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(145deg,var(--blueP),#f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)' }}>
                  {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18, opacity: .3 }}>👤</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nom.toUpperCase()} <span style={{ fontWeight: 500, color: 'var(--t2)' }}>{p.prenom}</span>
                    </span>
                    {rc > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', background: 'var(--blueG)', padding: '2px 7px', borderRadius: 6, fontFamily: 'var(--m)' }}>{rc}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    <Tag color="var(--blue)" bg="var(--blueG)">{p.poste}</Tag>
                    <Tag>{p.ville}</Tag>
                    <Tag>{p.pied}</Tag>
                    {p.agent && <Tag color="#9333ea" bg="#faf5ff">Agent: {p.agent}</Tag>}
                  </div>
                </div>
                {d && <Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: a ? `${aC}08` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${a ? `${aC}20` : '#e2e8f0'}` }}>
                  <span style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 700, color: aC ?? '#cbd5e1' }}>{a ? a.toFixed(1) : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
