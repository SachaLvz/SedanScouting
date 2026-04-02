import Tag from '../Tag';
import { POSITIONS, VILLES, DECISIONS, LISTES, getProfilePhoto } from '../config';

export default function ListPage({
  players, filtered,
  search, setSearch,
  fPoste, setFPoste, fVille, setFVille, fDec, setFDec, fListe, setFListe,
  lr, getDec, avg,
  onNewPlayer, onSelectPlayer,
}) {
  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <input className="inp pl-[42px]" placeholder="Rechercher un joueur..." value={search} onChange={e => setSearch(e.target.value)} />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className="btn-p px-[26px] py-3 text-[13px]" onClick={onNewPlayer}>
          + Nouveau joueur
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-[22px]">
        {[
          { v: fPoste, set: setFPoste, opts: POSITIONS, ph: "Poste" },
          { v: fVille, set: setFVille, opts: VILLES, ph: "Ville" },
          { v: fDec,   set: setFDec,   opts: DECISIONS.map(d => d.v), labels: Object.fromEntries(DECISIONS.map(d => [d.v, d.l])), ph: "Décision" },
          { v: fListe, set: setFListe, opts: LISTES, ph: "Liste" },
        ].map((f, i) => (
          <select key={i} className="inp w-auto px-3 py-2 text-[11px]" value={f.v} onChange={e => f.set(e.target.value)}>
            <option value="">{f.ph}</option>
            {f.opts.map(o => <option key={o} value={o}>{f.labels ? f.labels[o] : o}</option>)}
          </select>
        ))}
        {(fPoste || fVille || fDec || fListe) && (
          <button className="btn-g px-3 py-2 text-[10px]"
            onClick={() => { setFPoste(""); setFVille(""); setFDec(""); setFListe(""); }}>
            ✕ Reset
          </button>
        )}
      </div>

      <div className="stats-grid mb-7">
        {[
          { l: "Joueurs",  v: players.length, c: "#1e6cb6", bg: "#eef5fd" },
          { l: "Rapports", v: players.reduce((s, p) => s + (p.rapports?.length || 0), 0), c: "#9333ea", bg: "#faf5ff" },
          { l: "Retenus",  v: players.filter(p => ["retenu_academie", "signer", "test_europe"].includes(lr(p)?.decision)).length, c: "#16a34a", bg: "#f0fdf4" },
          { l: "Villes",   v: [...new Set(players.map(p => p.ville))].length, c: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.l} className="px-3 py-[18px] text-center rounded-2xl border border-transparent" style={{ background: s.bg }}>
            <div className="text-[28px] font-extrabold font-mono leading-none" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] font-bold mt-2 uppercase tracking-[1.5px] opacity-60" style={{ color: s.c }}>{s.l}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-[60px] px-5">
          <div className="text-[56px] mb-4">🦁</div>
          <p className="text-sm text-[#94a3b8] max-w-[300px] mx-auto leading-[1.7]">
            {players.length === 0 ? "Aucun joueur enregistré. Lancez votre première détection." : "Aucun résultat pour ces filtres."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((p, idx) => {
            const r = lr(p); const d = getDec(p);
            const a = r ? avg(r.ratings) : null;
            const aC = a ? (a >= 5 ? "#16a34a" : a >= 3.5 ? "#d97706" : "#dc2626") : null;
            return (
              <div
                key={p.id}
                className="card card-click px-[18px] py-3.5 flex items-center gap-3.5"
                style={{ animationDelay: `${idx * 25}ms`, animation: "fadeUp 0.3s ease-out forwards", opacity: 0 }}
                onClick={() => onSelectPlayer(p.id)}
              >
                <div
                  className="w-[50px] h-[50px] rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center border-2 border-[#e2e8f0]"
                  style={{ background: "linear-gradient(145deg, #dbeafe, #f1f5f9)" }}
                >
                  {getProfilePhoto(p) ? <img src={getProfilePhoto(p)} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xl opacity-30">👤</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#0c2340] truncate">
                    {(p.lastName ?? '').toUpperCase()} <span className="font-medium text-[#475569]">{p.firstName}</span>
                  </div>
                  <div className="flex gap-[5px] mt-[5px] items-center flex-wrap">
                    <Tag color="#1e6cb6" bg="#eef5fd">{p.poste}</Tag>
                    <Tag>{p.ville}</Tag>
                    <Tag>{p.pied}</Tag>
                    {(p.rapports?.length || 0) > 0 && <Tag color="#1e6cb6" bg="#eef5fd">{p.rapports.length} rpt</Tag>}
                  </div>
                </div>
                {d && <Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div
                  className="w-[46px] h-[46px] rounded-[13px] shrink-0 flex items-center justify-center border-2"
                  style={{ background: a ? `${aC}08` : "#f8fafc", borderColor: a ? `${aC}20` : "#e2e8f0" }}
                >
                  <span className="font-mono text-[15px] font-bold" style={{ color: aC || "#cbd5e1" }}>
                    {a ? a.toFixed(1) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
