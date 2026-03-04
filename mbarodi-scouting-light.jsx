import { useState, useRef } from "react";

/* ═══════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════ */
const POSITIONS = [
  "Gardien", "Défenseur Central", "Latéral Droit", "Latéral Gauche",
  "Milieu Défensif", "Milieu Central", "Milieu Offensif",
  "Ailier Droit", "Ailier Gauche", "Attaquant", "Avant-Centre"
];
const VILLES = [
  "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack",
  "Tambacounda", "Fatick", "Diourbel", "Rufisque", "Mbour",
  "Louga", "Matam", "Kédougou", "Sédhiou", "Kaffrine", "Autre"
];
const SCALE = [
  { v: 1, l: "Missing", c: "#dc2626", bg: "#fef2f2" },
  { v: 2, l: "Pauvre", c: "#ea580c", bg: "#fff7ed" },
  { v: 3, l: "Moyen", c: "#ca8a04", bg: "#fefce8" },
  { v: 4, l: "Satisfaisant", c: "#65a30d", bg: "#f7fee7" },
  { v: 5, l: "Bon", c: "#16a34a", bg: "#f0fdf4" },
  { v: 6, l: "Très bon", c: "#059669", bg: "#ecfdf5" },
];
const CATS = [
  { key: "physique", label: "Physique", icon: "💪", hint: "Puissance, vitesse, endurance, explosivité" },
  { key: "technique", label: "Technique", icon: "⚽", hint: "Passe, contrôle, dribble, frappe" },
  { key: "tactique", label: "Tactique", icon: "📐", hint: "Positionnement, lecture du jeu, discipline" },
  { key: "mentalite", label: "Mentalité", icon: "🧠", hint: "Leadership, combativité, concentration" },
];
const NIVEAUX = [
  "Sans intérêt", "National / Régional", "Ligue 2 remplaçant", "Ligue 2 titulaire",
  "Ligue 1 remplaçant", "Ligue 1 titulaire", "Top 5 européen", "Classe internationale", "Champions League",
];
const DECISIONS = [
  { v: "sans_interet", l: "Sans intérêt", c: "#dc2626", bg: "#fef2f2", i: "✕" },
  { v: "revoir_detection", l: "À revoir en détection", c: "#d97706", bg: "#fffbeb", i: "◉" },
  { v: "revoir_essai", l: "À revoir à l'essai", c: "#ca8a04", bg: "#fefce8", i: "↻" },
  { v: "retenu_academie", l: "Retenu académie", c: "#16a34a", bg: "#f0fdf4", i: "✓" },
  { v: "test_europe", l: "Test Europe", c: "#2563eb", bg: "#eff6ff", i: "✈" },
  { v: "signer", l: "À signer", c: "#9333ea", bg: "#faf5ff", i: "★" },
];
const LISTES = [
  "Groupe Élite Mbarodi", "Détection Dakar", "Détection Saint-Louis",
  "Détection Thiès", "Shadow Team 2026", "Prospects Europe",
];
const uid = () => Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split("T")[0];
const getSc = v => SCALE.find(s => s.v === v) || SCALE[0];

/* ═══════════════════════════════════════════
   CSS — LIGHT THEME
   ═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root {
  --bg: #f4f7fb;
  --bg-card: #ffffff;
  --bg-card-h: #f8fafd;
  --bg-input: #f0f4f9;
  --navy: #0c2340;
  --navy-soft: #1a3a5c;
  --blue: #1e6cb6;
  --blue-light: #4a9de8;
  --blue-sky: #7db8e8;
  --blue-pale: #dbeafe;
  --blue-ghost: #eef5fd;
  --border: #e2e8f0;
  --border-h: #cbd5e1;
  --text-1: #0f172a;
  --text-2: #475569;
  --text-3: #94a3b8;
  --shadow-sm: 0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03);
  --shadow: 0 4px 16px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04);
  --shadow-lg: 0 12px 40px rgba(15,23,42,0.1), 0 4px 12px rgba(15,23,42,0.05);
  --radius: 16px;
  --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
* { box-sizing: border-box; }
input, select, textarea, button { font-family: var(--font); }
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.card:hover { border-color: var(--border-h); box-shadow: var(--shadow); }
.card-click:hover { transform: translateY(-1px); cursor: pointer; }
.glow-btn {
  background: linear-gradient(135deg, var(--navy), var(--navy-soft));
  color: white; border: none; border-radius: 12px;
  font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 16px rgba(12,35,64,0.2);
  transition: box-shadow 0.2s, transform 0.15s;
}
.glow-btn:hover { box-shadow: 0 6px 24px rgba(12,35,64,0.3); transform: translateY(-1px); }
.ghost-btn {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text-2);
  cursor: pointer; transition: all 0.15s;
}
.ghost-btn:hover { background: var(--bg-input); color: var(--text-1); border-color: var(--border-h); }
.tab-btn {
  background: none; border: none; cursor: pointer;
  padding: 10px 20px; font-size: 12px; font-weight: 600;
  color: var(--text-3); border-bottom: 2px solid transparent;
  transition: all 0.15s; letter-spacing: 0.3px;
}
.tab-btn.active { color: var(--navy); border-bottom-color: var(--blue); }
.tab-btn:hover:not(.active) { color: var(--text-2); }
.inp {
  width: 100%; padding: 11px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px; color: var(--text-1);
  font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.inp:focus { border-color: var(--blue-light); box-shadow: 0 0 0 3px rgba(74,157,232,0.1); }
.inp::placeholder { color: var(--text-3); }
select.inp { cursor: pointer; }
.label {
  display: block; font-size: 10px; font-weight: 700;
  color: var(--text-3); margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 1px;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.3s ease-out forwards; }
::selection { background: rgba(30,108,182,0.15); }
`;

/* ═══════════════════════════════════════════
   RADAR (light version)
   ═══════════════════════════════════════════ */
function Radar({ ratings, size = 200 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 32;
  const n = CATS.length;
  const pt = (i, v, mx = 6) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (v / mx) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const poly = vals => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="rfill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e6cb6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7db8e8" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4, 5, 6].map(lv => (
        <polygon key={lv} points={poly(Array(n).fill(lv))}
          fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 6);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon
        points={poly(CATS.map(c => ratings[c.key] || 1))}
        fill="url(#rfill)" stroke="#1e6cb6" strokeWidth="2.5"
      />
      {CATS.map((c, i) => {
        const [x, y] = pt(i, ratings[c.key] || 1);
        const s = getSc(ratings[c.key] || 1);
        return <circle key={c.key} cx={x} cy={y} r="5.5" fill={s.c} stroke="white" strokeWidth="2.5" />;
      })}
      {CATS.map((c, i) => {
        const [x, y] = pt(i, 8.2);
        return (
          <text key={c.key + "t"} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="#94a3b8" fontSize="14" fontFamily="var(--font)">
            {c.icon}
          </text>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   NOTATION PICKER
   ═══════════════════════════════════════════ */
function NotePicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {SCALE.map(s => (
        <button key={s.v} onClick={() => onChange(s.v)} style={{
          flex: 1, padding: "8px 4px", borderRadius: 10,
          border: value === s.v ? `2px solid ${s.c}` : "2px solid transparent",
          cursor: "pointer",
          background: value === s.v ? s.bg : "#f8fafc",
          transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: value === s.v ? s.c : "#cbd5e1", fontFamily: "var(--mono)" }}>{s.v}</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: value === s.v ? s.c : "#cbd5e1", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAG
   ═══════════════════════════════════════════ */
function Tag({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
      background: bg || "#f1f5f9", color: color || "#64748b",
      letterSpacing: 0.3, whiteSpace: "nowrap", display: "inline-block", lineHeight: "18px"
    }}>{children}</span>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function MbarodiScout() {
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState("list");
  const [selId, setSelId] = useState(null);
  const [search, setSearch] = useState("");
  const [fVille, setFVille] = useState("");
  const [fPoste, setFPoste] = useState("");
  const [fDec, setFDec] = useState("");
  const [fListe, setFListe] = useState("");
  const [form, setForm] = useState(null);
  const [rForm, setRForm] = useState(null);
  const [showR, setShowR] = useState(false);
  const [openR, setOpenR] = useState(null);
  const [tab, setTab] = useState("profil");
  const photoRef = useRef(null);
  const idRef = useRef(null);

  const sel = players.find(p => p.id === selId);

  const readFile = (e, field) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, [field]: ev.target.result }));
    r.readAsDataURL(f);
  };

  const blank = () => ({
    id: uid(), prenom: "", nom: "", dateNaissance: "",
    ville: VILLES[0], poste: POSITIONS[0], posteSecondaire: "",
    pied: "Droitier", taille: "", poids: "",
    photo: "", pieceIdentite: "",
    rapports: [], notes: [], listes: [],
    createdAt: today(),
  });

  const blankR = () => ({
    id: uid(), date: today(), lieu: sel?.ville || VILLES[0],
    contexte: "", minutesJouees: "",
    ratings: { physique: 3, technique: 3, tactique: 3, mentalite: 3 },
    commentaires: { physique: "", technique: "", tactique: "", mentalite: "" },
    conclusion: "", niveauActuel: NIVEAUX[1], potentiel: NIVEAUX[2],
    decision: "revoir_detection", scout: "",
  });

  const save = () => {
    if (!form.nom) return;
    setPlayers(prev => {
      const ex = prev.find(p => p.id === form.id);
      return ex ? prev.map(p => p.id === form.id ? form : p) : [...prev, form];
    });
    setSelId(form.id); setView("detail"); setTab("profil");
  };
  const del = id => { setPlayers(p => p.filter(x => x.id !== id)); setSelId(null); setView("list"); };
  const saveReport = () => {
    if (!rForm.conclusion) return;
    setPlayers(prev => prev.map(p => p.id === selId ? { ...p, rapports: [rForm, ...(p.rapports || [])] } : p));
    setShowR(false); setRForm(null); setTab("rapports");
  };
  const addNote = text => {
    if (!text.trim()) return;
    setPlayers(prev => prev.map(p => p.id === selId ? { ...p, notes: [{ id: uid(), date: today(), text: text.trim() }, ...(p.notes || [])] } : p));
  };
  const toggleListe = liste => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== selId) return p;
      const has = (p.listes || []).includes(liste);
      return { ...p, listes: has ? p.listes.filter(l => l !== liste) : [...(p.listes || []), liste] };
    }));
  };

  const lr = p => (p.rapports || [])[0];
  const avg = r => r ? CATS.reduce((s, c) => s + (r[c.key] || 1), 0) / CATS.length : 0;
  const getDec = p => { const r = lr(p); return r ? DECISIONS.find(d => d.v === r.decision) : null; };

  const filtered = players.filter(p => {
    const q = search.toLowerCase();
    return (!q || `${p.nom} ${p.prenom}`.toLowerCase().includes(q))
      && (!fVille || p.ville === fVille) && (!fPoste || p.poste === fPoste)
      && (!fDec || lr(p)?.decision === fDec) && (!fListe || (p.listes || []).includes(fListe));
  });

  /* ━━━━━ LIST ━━━━━ */
  const renderList = () => (
    <div className="fade-up" style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 60px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input className="inp" placeholder="Rechercher un joueur..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
        <button className="glow-btn" style={{ padding: "12px 26px", fontSize: 13 }} onClick={() => { setForm(blank()); setView("form"); }}>
          + Nouveau joueur
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
        {[
          { v: fPoste, set: setFPoste, opts: POSITIONS, ph: "Poste" },
          { v: fVille, set: setFVille, opts: VILLES, ph: "Ville" },
          { v: fDec, set: setFDec, opts: DECISIONS.map(d => d.v), labels: Object.fromEntries(DECISIONS.map(d => [d.v, d.l])), ph: "Décision" },
          { v: fListe, set: setFListe, opts: LISTES, ph: "Liste" },
        ].map((f, i) => (
          <select key={i} className="inp" value={f.v} onChange={e => f.set(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 11 }}>
            <option value="">{f.ph}</option>
            {f.opts.map(o => <option key={o} value={o}>{f.labels ? f.labels[o] : o}</option>)}
          </select>
        ))}
        {(fPoste || fVille || fDec || fListe) && (
          <button className="ghost-btn" style={{ padding: "8px 12px", fontSize: 10 }} onClick={() => { setFPoste(""); setFVille(""); setFDec(""); setFListe(""); }}>✕ Reset</button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
        {[
          { l: "Joueurs", v: players.length, c: "var(--blue)", bg: "var(--blue-ghost)" },
          { l: "Rapports", v: players.reduce((s, p) => s + (p.rapports?.length || 0), 0), c: "#9333ea", bg: "#faf5ff" },
          { l: "Retenus", v: players.filter(p => ["retenu_academie", "signer", "test_europe"].includes(lr(p)?.decision)).length, c: "#16a34a", bg: "#f0fdf4" },
          { l: "Villes", v: [...new Set(players.map(p => p.ville))].length, c: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.l} style={{
            padding: "18px 12px", textAlign: "center", borderRadius: 16,
            background: s.bg, border: "1px solid transparent"
          }}>
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
              <div key={p.id} className="card card-click" style={{
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                animationDelay: `${idx * 25}ms`, animation: "fadeUp 0.3s ease-out forwards", opacity: 0
              }} onClick={() => { setSelId(p.id); setView("detail"); setTab("profil"); }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                  background: "linear-gradient(145deg, var(--blue-pale), #f1f5f9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid var(--border)"
                }}>
                  {p.photo ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 20, opacity: 0.3 }}>👤</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.nom.toUpperCase()} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{p.prenom}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <Tag color="var(--blue)" bg="var(--blue-ghost)">{p.poste}</Tag>
                    <Tag>{p.ville}</Tag>
                    <Tag>{p.pied}</Tag>
                    {(p.rapports?.length || 0) > 0 && <Tag color="var(--blue)" bg="var(--blue-ghost)">{p.rapports.length} rpt</Tag>}
                  </div>
                </div>
                {d && <Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div style={{
                  width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                  background: a ? `${aC}08` : "#f8fafc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${a ? `${aC}20` : "#e2e8f0"}`
                }}>
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

  /* ━━━━━ DETAIL ━━━━━ */
  const renderDetail = () => {
    if (!sel) return null;
    const r = lr(sel); const d = r ? DECISIONS.find(x => x.v === r.decision) : null;
    return (
      <div className="fade-up" style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 60px" }}>
        <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }} onClick={() => setView("list")}>← Liste</button>

        {/* Header */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{
              width: 110, height: 110, borderRadius: 22, overflow: "hidden", flexShrink: 0,
              background: "linear-gradient(145deg, var(--blue-pale), #f1f5f9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid var(--border)", boxShadow: "var(--shadow)"
            }}>
              {sel.photo ? <img src={sel.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 44, opacity: 0.2 }}>👤</span>}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--navy)", letterSpacing: -0.5, lineHeight: 1.2 }}>
                {sel.nom.toUpperCase()} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{sel.prenom}</span>
              </h2>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <Tag color="var(--blue)" bg="var(--blue-ghost)">{sel.poste}</Tag>
                {sel.posteSecondaire && <Tag>{sel.posteSecondaire}</Tag>}
                <Tag>{sel.ville}</Tag>
                <Tag>{sel.pied}</Tag>
                {sel.dateNaissance && <Tag>🎂 {sel.dateNaissance}</Tag>}
                {sel.taille && <Tag>📏 {sel.taille}cm</Tag>}
                {sel.poids && <Tag>⚖️ {sel.poids}kg</Tag>}
              </div>
              {sel.pieceIdentite && <div style={{ marginTop: 8 }}><Tag color="#16a34a" bg="#f0fdf4">✓ Pièce d'identité</Tag></div>}
              {d && <div style={{ marginTop: 8 }}><Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag></div>}
              <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                <button className="ghost-btn" style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => { setForm({ ...sel }); setView("form"); }}>✏️ Modifier</button>
                <button className="glow-btn" style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => { setRForm(blankR()); setShowR(true); }}>📋 Rapport</button>
                <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, color: "#dc2626" }} onClick={() => del(sel.id)}>🗑</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
          {["profil", "rapports", "notes", "listes"].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "profil" ? "Profil" : t === "rapports" ? `Rapports (${sel.rapports?.length || 0})` : t === "notes" ? "Notes" : "Listes"}
            </button>
          ))}
        </div>

        {/* PROFIL */}
        {tab === "profil" && r && (
          <div className="fade-up" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Dernier rapport · {r.date}</div>
              <Radar ratings={r.ratings} size={200} />
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--navy)" }}>{avg(r.ratings).toFixed(1)}</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-3)" }}>/6</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="card" style={{ padding: 22 }}>
                {CATS.map(cat => {
                  const v = r.ratings[cat.key]; const s = getSc(v);
                  return (
                    <div key={cat.key} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{cat.icon} {cat.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: s.c, padding: "2px 8px", borderRadius: 6, background: s.bg }}>{s.l}</span>
                          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--mono)", color: s.c }}>{v}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, width: `${(v / 6) * 100}%`, background: `linear-gradient(90deg, ${s.c}88, ${s.c})`, transition: "width 0.5s ease" }} />
                      </div>
                      {r.commentaires[cat.key] && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, fontStyle: "italic" }}>« {r.commentaires[cat.key]} »</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Niveau actuel</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>{r.niveauActuel}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Potentiel</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{r.potentiel}</div>
                  </div>
                </div>
                {r.conclusion && (
                  <>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Conclusion</div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{r.conclusion}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === "profil" && !r && <div style={{ textAlign: "center", padding: 50, color: "var(--text-3)" }}>Aucun rapport. Créez le premier.</div>}

        {/* RAPPORTS */}
        {tab === "rapports" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(sel.rapports || []).length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}>Aucun rapport.</div>
            : sel.rapports.map(rp => {
              const dec = DECISIONS.find(x => x.v === rp.decision);
              const a = avg(rp.ratings); const open = openR === rp.id;
              return (
                <div key={rp.id} className="card" style={{ padding: open ? 20 : 16, cursor: "pointer", borderColor: open ? "var(--blue-light)" : undefined }}
                  onClick={() => setOpenR(open ? null : rp.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--blue)" }}>{rp.date}</span>
                      <Tag>{rp.lieu}</Tag>
                      {rp.scout && <Tag>✍ {rp.scout}</Tag>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {dec && <Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--mono)", color: a >= 5 ? "#16a34a" : a >= 3.5 ? "#d97706" : "#dc2626" }}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      {rp.contexte && <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 12px" }}>📍 {rp.contexte}{rp.minutesJouees ? ` · ${rp.minutesJouees} min` : ""}</p>}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                        {CATS.map(cat => {
                          const v = rp.ratings[cat.key]; const s = getSc(v);
                          return (
                            <div key={cat.key}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: "var(--text-2)" }}>{cat.icon} {cat.label}</span>
                                <span style={{ color: s.c, fontWeight: 700, fontFamily: "var(--mono)" }}>{v}</span>
                              </div>
                              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                                <div style={{ height: "100%", borderRadius: 2, width: `${(v / 6) * 100}%`, background: s.c }} />
                              </div>
                              {rp.commentaires[cat.key] && <p style={{ fontSize: 10, color: "var(--text-3)", margin: "4px 0 0", fontStyle: "italic" }}>« {rp.commentaires[cat.key]} »</p>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, marginBottom: 10 }}>
                        <span style={{ color: "#d97706", fontWeight: 600 }}>Niveau: {rp.niveauActuel}</span>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>Potentiel: {rp.potentiel}</span>
                      </div>
                      {rp.conclusion && <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{rp.conclusion}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTES */}
        {tab === "notes" && <NotesPanel notes={sel.notes || []} onAdd={addNote} />}

        {/* LISTES */}
        {tab === "listes" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {LISTES.map(l => {
              const has = (sel.listes || []).includes(l);
              return (
                <div key={l} className="card card-click" onClick={() => toggleListe(l)}
                  style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: has ? "var(--blue-light)" : undefined, background: has ? "var(--blue-ghost)" : undefined }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: has ? "var(--blue)" : "var(--text-2)" }}>{l}</span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: has ? "#f0fdf4" : "#f8fafc",
                    border: `2px solid ${has ? "#16a34a" : "#e2e8f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: has ? "#16a34a" : "#cbd5e1", fontSize: 14, fontWeight: 700
                  }}>{has ? "✓" : "+"}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── REPORT MODAL ── */}
        {showR && rForm && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000,
            display: "flex", justifyContent: "center", padding: "24px 16px",
            overflowY: "auto", backdropFilter: "blur(4px)"
          }} onClick={e => { if (e.target === e.currentTarget) { setShowR(false); setRForm(null); } }}>
            <div className="card fade-up" style={{ maxWidth: 620, width: "100%", padding: 30, alignSelf: "flex-start", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>Rapport de match</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-3)" }}>{sel.nom.toUpperCase()} {sel.prenom} · {sel.poste}</p>
                </div>
                <button className="ghost-btn" style={{ padding: "6px 10px", fontSize: 16 }} onClick={() => { setShowR(false); setRForm(null); }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div><label className="label">Date *</label><input type="date" className="inp" value={rForm.date} onChange={e => setRForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><label className="label">Lieu</label><select className="inp" value={rForm.lieu} onChange={e => setRForm(p => ({ ...p, lieu: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
                <div><label className="label">Scout</label><input className="inp" value={rForm.scout} onChange={e => setRForm(p => ({ ...p, scout: e.target.value }))} placeholder="Nom" /></div>
                <div><label className="label">Minutes jouées</label><input type="number" className="inp" value={rForm.minutesJouees} onChange={e => setRForm(p => ({ ...p, minutesJouees: e.target.value }))} placeholder="90" /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label className="label">Contexte</label><input className="inp" value={rForm.contexte} onChange={e => setRForm(p => ({ ...p, contexte: e.target.value }))} placeholder="Ex: Amical Dakar FC vs Thiès United" /></div>

              {CATS.map(cat => (
                <div key={cat.key} style={{ background: "#f8fafc", borderRadius: 14, padding: 18, marginBottom: 10, border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", maxWidth: 200, textAlign: "right" }}>{cat.hint}</span>
                  </div>
                  <NotePicker value={rForm.ratings[cat.key]} onChange={v => setRForm(p => ({ ...p, ratings: { ...p.ratings, [cat.key]: v } }))} />
                  <textarea className="inp" style={{ marginTop: 10, height: 56, resize: "vertical", background: "white" }}
                    value={rForm.commentaires[cat.key]}
                    onChange={e => setRForm(p => ({ ...p, commentaires: { ...p.commentaires, [cat.key]: e.target.value } }))}
                    placeholder={`Analyse ${cat.label.toLowerCase()}...`} />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, marginTop: 6 }}>
                <div><label className="label">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e => setRForm(p => ({ ...p, niveauActuel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
                <div><label className="label">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e => setRForm(p => ({ ...p, potentiel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label" style={{ color: !rForm.conclusion ? "#dc2626" : undefined }}>Conclusion * (obligatoire)</label>
                <textarea className="inp" style={{ height: 88, resize: "vertical", borderColor: !rForm.conclusion ? "#fca5a5" : undefined }}
                  value={rForm.conclusion} onChange={e => setRForm(p => ({ ...p, conclusion: e.target.value }))}
                  placeholder="Profil complet : points forts, faiblesses, projection..." />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label" style={{ color: "#dc2626" }}>Décision *</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {DECISIONS.map(d => (
                    <button key={d.v} onClick={() => setRForm(p => ({ ...p, decision: d.v }))} style={{
                      padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                      border: rForm.decision === d.v ? `2px solid ${d.c}` : "2px solid transparent",
                      background: rForm.decision === d.v ? d.bg : "#f8fafc",
                      color: rForm.decision === d.v ? d.c : "#94a3b8",
                      fontSize: 11, fontWeight: 700, transition: "all 0.15s"
                    }}>{d.i} {d.l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="ghost-btn" style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 600 }} onClick={() => { setShowR(false); setRForm(null); }}>Annuler</button>
                <button className={rForm.conclusion ? "glow-btn" : "ghost-btn"} disabled={!rForm.conclusion}
                  style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 700, opacity: rForm.conclusion ? 1 : 0.4, cursor: rForm.conclusion ? "pointer" : "not-allowed" }}
                  onClick={saveReport}>Valider le rapport</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ━━━━━ FORM ━━━━━ */
  const renderForm = () => {
    if (!form) return null;
    const isEdit = players.some(p => p.id === form.id);
    return (
      <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px" }}>
        <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }} onClick={() => setView(isEdit ? "detail" : "list")}>← Retour</button>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 28 }}>{isEdit ? "Modifier le profil" : "Nouveau joueur"}</h2>

        <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 28 }}>
          <div onClick={() => photoRef.current?.click()} style={{
            width: 92, height: 92, borderRadius: 20, overflow: "hidden", cursor: "pointer",
            background: "linear-gradient(145deg, var(--blue-pale), #f8fafc)",
            border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "border-color 0.2s"
          }}>
            {form.photo ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>📷<br />Photo</div>}
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={e => readFile(e, "photo")} style={{ display: "none" }} />
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>Cliquez pour ajouter</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <div><label className="label">Nom *</label><input className="inp" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Nom" /></div>
          <div><label className="label">Prénom</label><input className="inp" value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} placeholder="Prénom" /></div>
          <div><label className="label">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e => setForm(p => ({ ...p, dateNaissance: e.target.value }))} /></div>
          <div><label className="label">Ville</label><select className="inp" value={form.ville} onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label className="label">Poste principal</label><select className="inp" value={form.poste} onChange={e => setForm(p => ({ ...p, poste: e.target.value }))}>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label">Poste secondaire</label><select className="inp" value={form.posteSecondaire} onChange={e => setForm(p => ({ ...p, posteSecondaire: e.target.value }))}><option value="">—</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label">Pied fort</label><select className="inp" value={form.pied} onChange={e => setForm(p => ({ ...p, pied: e.target.value }))}><option>Droitier</option><option>Gaucher</option><option>Les deux</option></select></div>
          <div><label className="label">Taille (cm)</label><input type="number" className="inp" value={form.taille} onChange={e => setForm(p => ({ ...p, taille: e.target.value }))} placeholder="178" /></div>
          <div><label className="label">Poids (kg)</label><input type="number" className="inp" value={form.poids} onChange={e => setForm(p => ({ ...p, poids: e.target.value }))} placeholder="72" /></div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label className="label">Pièce d'identité</label>
          <div className="card card-click" onClick={() => idRef.current?.click()} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, borderStyle: form.pieceIdentite ? "solid" : "dashed" }}>
            {form.pieceIdentite ? (
              <><img src={form.pieceIdentite} alt="" style={{ width: 56, height: 36, objectFit: "cover", borderRadius: 6 }} /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Document ajouté</span></>
            ) : (
              <><span style={{ fontSize: 20, opacity: 0.3 }}>🪪</span><span style={{ fontSize: 12, color: "var(--text-3)" }}>Ajouter la pièce d'identité</span></>
            )}
          </div>
          <input ref={idRef} type="file" accept="image/*" onChange={e => readFile(e, "pieceIdentite")} style={{ display: "none" }} />
        </div>

        <button className="glow-btn" style={{ width: "100%", padding: 16, fontSize: 15 }} onClick={save}>
          {isEdit ? "Enregistrer" : "Ajouter le joueur"} 🦁
        </button>
      </div>
    );
  };

  /* ━━━━━ RENDER ━━━━━ */
  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg)" }}>
      <style>{CSS}</style>

      {/* Header — navy band */}
      <div style={{
        background: "linear-gradient(135deg, #0c2340, #1a3a5c)",
        padding: "28px 20px 24px", textAlign: "center", marginBottom: 28,
        borderBottom: "3px solid var(--blue-light)",
        boxShadow: "0 4px 24px rgba(12,35,64,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 4 }}>
          <span style={{ fontSize: 30, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}>🦁</span>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase",
            background: "linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MBARODI FC</h1>
        </div>
        <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 4, fontFamily: "var(--mono)" }}>
          Scouting · Détection · Recrutement
        </div>
      </div>

      {view === "list" && renderList()}
      {view === "detail" && renderDetail()}
      {view === "form" && renderForm()}
    </div>
  );
}

/* ═══ NOTES PANEL ═══ */
function NotesPanel({ notes, onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input className="inp" style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)}
          placeholder="Info agent, famille, salaire, discussions..."
          onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text); setText(""); } }} />
        <button className="glow-btn" style={{ padding: "10px 18px", fontSize: 12 }}
          onClick={() => { if (text.trim()) { onAdd(text); setText(""); } }}>+</button>
      </div>
      {notes.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: 30 }}>Aucune note. Ajoutez des infos extra-sportives.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {notes.map(n => (
            <div key={n.id} className="card" style={{ padding: "14px 18px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--blue)" }}>{n.date}</span>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
