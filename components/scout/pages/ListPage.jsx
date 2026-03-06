import Tag from '../Tag';
import { POSITIONS, VILLES, DECISIONS, LISTES } from '../config';

export default function ListPage({
  players, filtered,
  search, setSearch,
  fPoste, setFPoste, fVille, setFVille, fDec, setFDec, fListe, setFListe,
  lr, getDec, avg,
  onNewPlayer, onSelectPlayer,
}) {
  return (
    <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 60px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input className="inp" placeholder="Rechercher un joueur..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className="glow-btn" style={{ padding: "12px 26px", fontSize: 13 }} onClick={onNewPlayer}>
          + Nouveau joueur
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
        {[
          { v: fPoste, set: setFPoste, opts: POSITIONS, ph: "Poste" },
          { v: fVille, set: setFVille, opts: VILLES, ph: "Ville" },
          { v: fDec,   set: setFDec,   opts: DECISIONS.map(d => d.v), labels: Object.fromEntries(DECISIONS.map(d => [d.v, d.l])), ph: "Décision" },
          { v: fListe, set: setFListe, opts: LISTES, ph: "Liste" },
        ].map((f, i) => (
          <select key={i} className="inp" value={f.v} onChange={e => f.set(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 11 }}>
            <option value="">{f.ph}</option>
            {f.opts.map(o => <option key={o} value={o}>{f.labels ? f.labels[o] : o}</option>)}
          </select>
        ))}
        {(fPoste || fVille || fDec || fListe) && (
          <button className="ghost-btn" style={{ padding: "8px 12px", fontSize: 10 }}
            onClick={() => { setFPoste(""); setFVille(""); setFDec(""); setFListe(""); }}>
            ✕ Reset
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
        {[
          { l: "Joueurs",  v: players.length, c: "var(--blue)", bg: "var(--blue-ghost)" },
          { l: "Rapports", v: players.reduce((s, p) => s + (p.rapports?.length || 0), 0), c: "#9333ea", bg: "#faf5ff" },
          { l: "Retenus",  v: players.filter(p => ["retenu_academie", "signer", "test_europe"].includes(lr(p)?.decision)).length, c: "#16a34a", bg: "#f0fdf4" },
          { l: "Villes",   v: [...new Set(players.map(p => p.ville))].length, c: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.l} style={{ padding: "18px 12px", textAlign: "center", borderRadius: 16, background: s.bg, border: "1px solid transparent" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: "var(--mono)", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: s.c, marginTop: 8, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🦁</div>
          <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 300, margin: "0 auto", lineHeight: 1.7 }}>
            {players.length === 0 ? "Aucun joueur enregistré. Lancez votre première détection." : "Aucun résultat pour ces filtres."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((p, idx) => {
            const r = lr(p); const d = getDec(p);
            const a = r ? avg(r.ratings) : null;
            const aC = a ? (a >= 5 ? "#16a34a" : a >= 3.5 ? "#d97706" : "#dc2626") : null;
            return (
              <div key={p.id} className="card card-click" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, animationDelay: `${idx * 25}ms`, animation: "fadeUp 0.3s ease-out forwards", opacity: 0 }}
                onClick={() => onSelectPlayer(p.id)}>
                <div style={{ width: 50, height: 50, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "linear-gradient(145deg, var(--blue-pale), #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--border)" }}>
                  {p.photo ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 20, opacity: 0.3 }}>👤</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(p.lastName ?? '').toUpperCase()} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{p.firstName}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <Tag color="var(--blue)" bg="var(--blue-ghost)">{p.poste}</Tag>
                    <Tag>{p.ville}</Tag>
                    <Tag>{p.pied}</Tag>
                    {(p.rapports?.length || 0) > 0 && <Tag color="var(--blue)" bg="var(--blue-ghost)">{p.rapports.length} rpt</Tag>}
                  </div>
                </div>
                {d && <Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: a ? `${aC}08` : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${a ? `${aC}20` : "#e2e8f0"}` }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: aC || "#cbd5e1" }}>
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
