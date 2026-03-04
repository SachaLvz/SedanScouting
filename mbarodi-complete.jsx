import { useState, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════ */
const POSITIONS = ["Gardien","Déf. Central","Latéral Droit","Latéral Gauche","Milieu Défensif","Milieu Central","Milieu Offensif","Ailier Droit","Ailier Gauche","Attaquant","Avant-Centre"];
const VILLES = ["Dakar","Thiès","Saint-Louis","Ziguinchor","Kaolack","Tambacounda","Fatick","Diourbel","Rufisque","Mbour","Louga","Matam","Kédougou","Autre"];
const SCALE = [
  { v:1, l:"Missing", c:"#dc2626", bg:"#fef2f2" },
  { v:2, l:"Pauvre", c:"#ea580c", bg:"#fff7ed" },
  { v:3, l:"Moyen", c:"#ca8a04", bg:"#fefce8" },
  { v:4, l:"Satisfaisant", c:"#65a30d", bg:"#f7fee7" },
  { v:5, l:"Bon", c:"#16a34a", bg:"#f0fdf4" },
  { v:6, l:"Très bon", c:"#059669", bg:"#ecfdf5" },
];
const CATS = [
  { key:"physique", label:"Physique", icon:"💪", hint:"Puissance, vitesse, endurance, explosivité, volume" },
  { key:"technique", label:"Technique", icon:"⚽", hint:"Passe, contrôle, dribble, frappe, jeu de tête" },
  { key:"tactique", label:"Tactique", icon:"📐", hint:"Positionnement, lecture du jeu, discipline" },
  { key:"mentalite", label:"Mentalité", icon:"🧠", hint:"Leadership, combativité, concentration" },
];
const NIVEAUX = ["Sans intérêt","Régional","National","Ligue 2 remplaçant","Ligue 2 titulaire","Ligue 1 remplaçant","Ligue 1 titulaire","Top 5 européen","Champions League"];
const DECISIONS = [
  { v:"sans_interet", l:"Sans intérêt", c:"#dc2626", bg:"#fef2f2", i:"✕" },
  { v:"revoir", l:"À revoir en détection", c:"#d97706", bg:"#fffbeb", i:"◉" },
  { v:"essai", l:"À l'essai", c:"#ca8a04", bg:"#fefce8", i:"↻" },
  { v:"retenu", l:"Retenu académie", c:"#16a34a", bg:"#f0fdf4", i:"✓" },
  { v:"europe", l:"Test Europe", c:"#2563eb", bg:"#eff6ff", i:"✈" },
  { v:"signer", l:"À signer", c:"#9333ea", bg:"#faf5ff", i:"★" },
];
const FORMATIONS = {
  "4-3-3": { label:"4-3-3", slots:[
    {pos:"Gardien",x:50,y:92},{pos:"Latéral Gauche",x:10,y:72},{pos:"Déf. Central",x:35,y:74},{pos:"Déf. Central",x:65,y:74},{pos:"Latéral Droit",x:90,y:72},
    {pos:"Milieu Central",x:30,y:50},{pos:"Milieu Défensif",x:50,y:55},{pos:"Milieu Central",x:70,y:50},
    {pos:"Ailier Gauche",x:15,y:25},{pos:"Avant-Centre",x:50,y:20},{pos:"Ailier Droit",x:85,y:25}
  ]},
  "4-4-2": { label:"4-4-2", slots:[
    {pos:"Gardien",x:50,y:92},{pos:"Latéral Gauche",x:10,y:72},{pos:"Déf. Central",x:35,y:74},{pos:"Déf. Central",x:65,y:74},{pos:"Latéral Droit",x:90,y:72},
    {pos:"Ailier Gauche",x:12,y:48},{pos:"Milieu Central",x:38,y:50},{pos:"Milieu Central",x:62,y:50},{pos:"Ailier Droit",x:88,y:48},
    {pos:"Attaquant",x:35,y:22},{pos:"Avant-Centre",x:65,y:22}
  ]},
  "4-2-3-1": { label:"4-2-3-1", slots:[
    {pos:"Gardien",x:50,y:92},{pos:"Latéral Gauche",x:10,y:72},{pos:"Déf. Central",x:35,y:74},{pos:"Déf. Central",x:65,y:74},{pos:"Latéral Droit",x:90,y:72},
    {pos:"Milieu Défensif",x:38,y:56},{pos:"Milieu Défensif",x:62,y:56},
    {pos:"Ailier Gauche",x:15,y:35},{pos:"Milieu Offensif",x:50,y:36},{pos:"Ailier Droit",x:85,y:35},
    {pos:"Avant-Centre",x:50,y:18}
  ]},
  "3-5-2": { label:"3-5-2", slots:[
    {pos:"Gardien",x:50,y:92},{pos:"Déf. Central",x:25,y:74},{pos:"Déf. Central",x:50,y:76},{pos:"Déf. Central",x:75,y:74},
    {pos:"Latéral Gauche",x:8,y:50},{pos:"Milieu Central",x:32,y:52},{pos:"Milieu Défensif",x:50,y:55},{pos:"Milieu Central",x:68,y:52},{pos:"Latéral Droit",x:92,y:50},
    {pos:"Attaquant",x:36,y:22},{pos:"Avant-Centre",x:64,y:22}
  ]},
};
const SCOUTS_INIT = [
  { id:"s1", nom:"Admin", role:"admin", color:"#2563eb" },
];
const uid = () => Math.random().toString(36).substr(2,9);
const today = () => new Date().toISOString().split("T")[0];
const getSc = v => SCALE.find(s=>s.v===v)||SCALE[0];

/* ═══════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root{--bg:#f4f7fb;--card:#fff;--input:#f0f4f9;--navy:#0c2340;--navy2:#1a3a5c;--blue:#1e6cb6;--blueL:#4a9de8;--blueP:#dbeafe;--blueG:#eef5fd;--border:#e2e8f0;--borderH:#cbd5e1;--t1:#0f172a;--t2:#475569;--t3:#94a3b8;--sh:0 4px 16px rgba(15,23,42,0.06);--shL:0 12px 40px rgba(15,23,42,0.1);--r:16px;--f:'Plus Jakarta Sans',sans-serif;--m:'JetBrains Mono',monospace;}
*{box-sizing:border-box}input,select,textarea,button{font-family:var(--f)}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);box-shadow:0 1px 3px rgba(15,23,42,0.04);transition:border-color .2s,box-shadow .2s,transform .15s}
.card:hover{border-color:var(--borderH);box-shadow:var(--sh)}.card-click:hover{transform:translateY(-1px);cursor:pointer}
.btn-p{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(12,35,64,.2);transition:box-shadow .2s,transform .15s}
.btn-p:hover{box-shadow:0 6px 24px rgba(12,35,64,.3);transform:translateY(-1px)}
.btn-g{background:var(--card);border:1px solid var(--border);border-radius:10px;color:var(--t2);cursor:pointer;transition:all .15s}.btn-g:hover{background:var(--input);color:var(--t1)}
.tab{background:none;border:none;cursor:pointer;padding:10px 18px;font-size:12px;font-weight:600;color:var(--t3);border-bottom:2px solid transparent;transition:all .15s;letter-spacing:.3px}
.tab.on{color:var(--navy);border-bottom-color:var(--blue)}.tab:hover:not(.on){color:var(--t2)}
.inp{width:100%;padding:11px 14px;background:var(--input);border:1px solid var(--border);border-radius:10px;color:var(--t1);font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--blueL);box-shadow:0 0 0 3px rgba(74,157,232,.1)}.inp::placeholder{color:var(--t3)}select.inp{cursor:pointer}
.lbl{display:block;font-size:10px;font-weight:700;color:var(--t3);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .3s ease-out forwards}
::selection{background:rgba(30,108,182,.15)}
`;

/* ═══════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════ */
const Tag = ({children,color,bg})=><span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,background:bg||"#f1f5f9",color:color||"#64748b",letterSpacing:.3,whiteSpace:"nowrap",display:"inline-block",lineHeight:"18px"}}>{children}</span>;

function Radar({ratings,size=190}){
  const cx=size/2,cy=size/2,r=size/2-30,n=CATS.length;
  const pt=(i,v)=>{const a=(Math.PI*2*i)/n-Math.PI/2;const d=(v/6)*r;return[cx+d*Math.cos(a),cy+d*Math.sin(a)]};
  const poly=vals=>vals.map((v,i)=>pt(i,v).join(",")).join(" ");
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
      <defs><linearGradient id="rf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1e6cb6" stopOpacity=".18"/><stop offset="100%" stopColor="#7db8e8" stopOpacity=".08"/></linearGradient></defs>
      {[1,2,3,4,5,6].map(lv=><polygon key={lv} points={poly(Array(n).fill(lv))} fill="none" stroke="#e2e8f0" strokeWidth="1"/>)}
      {Array.from({length:n},(_,i)=>{const[x,y]=pt(i,6);return<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1"/>})}
      <polygon points={poly(CATS.map(c=>ratings[c.key]||1))} fill="url(#rf)" stroke="#1e6cb6" strokeWidth="2.5"/>
      {CATS.map((c,i)=>{const[x,y]=pt(i,ratings[c.key]||1);const s=getSc(ratings[c.key]||1);return<circle key={c.key} cx={x} cy={y} r="5.5" fill={s.c} stroke="#fff" strokeWidth="2.5"/>})}
      {CATS.map((c,i)=>{const[x,y]=pt(i,8);return<text key={c.key+"t"} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="13">{c.icon}</text>})}
    </svg>
  );
}

function NotePicker({value,onChange}){
  return(<div style={{display:"flex",gap:4}}>{SCALE.map(s=>(
    <button key={s.v} onClick={()=>onChange(s.v)} style={{flex:1,padding:"7px 2px",borderRadius:9,border:value===s.v?`2px solid ${s.c}`:"2px solid transparent",cursor:"pointer",background:value===s.v?s.bg:"#f8fafc",transition:"all .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:15,fontWeight:800,color:value===s.v?s.c:"#cbd5e1",fontFamily:"var(--m)"}}>{s.v}</span>
      <span style={{fontSize:7,fontWeight:700,color:value===s.v?s.c:"#cbd5e1",textTransform:"uppercase"}}>{s.l}</span>
    </button>
  ))}</div>);
}

function BarLine({v}){const s=getSc(v);return(
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${(v/6)*100}%`,background:`linear-gradient(90deg,${s.c}88,${s.c})`,transition:"width .4s"}}/></div>
    <span style={{fontSize:14,fontWeight:800,fontFamily:"var(--m)",color:s.c,minWidth:16,textAlign:"right"}}>{v}</span>
  </div>
);}

/* ═══════════════════════════════════════════════════
   PITCH (Shadow Team)
   ═══════════════════════════════════════════════════ */
function PitchView({formation,players,shadowTeam,onSlotClick}){
  const f = FORMATIONS[formation];
  if(!f) return null;
  return(
    <div style={{position:"relative",width:"100%",maxWidth:420,aspectRatio:"68/105",background:"linear-gradient(180deg,#22c55e 0%,#16a34a 100%)",borderRadius:16,overflow:"hidden",margin:"0 auto",boxShadow:"inset 0 2px 20px rgba(0,0,0,.15)"}}>
      {/* pitch lines */}
      <svg viewBox="0 0 68 105" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        <rect x="0.5" y="0.5" width="67" height="104" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5"/>
        <line x1="0" y1="52.5" x2="68" y2="52.5" stroke="rgba(255,255,255,.35)" strokeWidth=".5"/>
        <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5"/>
        <rect x="13.84" y="0" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5"/>
        <rect x="13.84" y="88.5" width="40.32" height="16.5" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".5"/>
        <rect x="24.84" y="0" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4"/>
        <rect x="24.84" y="99.5" width="18.32" height="5.5" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".4"/>
      </svg>
      {f.slots.map((slot,idx)=>{
        const assigned = shadowTeam[idx];
        const player = assigned ? players.find(p=>p.id===assigned) : null;
        return(
          <div key={idx} onClick={()=>onSlotClick(idx,slot.pos)} style={{
            position:"absolute", left:`${slot.x}%`, top:`${slot.y}%`, transform:"translate(-50%,-50%)",
            cursor:"pointer", textAlign:"center", zIndex:2
          }}>
            <div style={{
              width:36,height:36,borderRadius:"50%",
              background:player?"#fff":"rgba(255,255,255,.2)",
              border:player?"2px solid #fff":"2px dashed rgba(255,255,255,.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:player?"0 2px 8px rgba(0,0,0,.2)":"none",
              overflow:"hidden",margin:"0 auto",transition:"all .15s"
            }}>
              {player?.photo ? <img src={player.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:player?10:14,color:player?"#94a3b8":"rgba(255,255,255,.6)"}}>{player?"👤":"+"}</span>}
            </div>
            <div style={{fontSize:8,fontWeight:700,color:"#fff",marginTop:3,textShadow:"0 1px 3px rgba(0,0,0,.4)",lineHeight:1.2,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {player ? player.nom.toUpperCase() : slot.pos}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function App(){
  // Data
  const [players,setPlayers] = useState([]);
  const [matches,setMatches] = useState([]);
  const [scouts,setScouts] = useState(SCOUTS_INIT);
  const [curScout,setCurScout] = useState("s1");

  // Navigation
  const [page,setPage] = useState("joueurs"); // joueurs, calendrier, shadow, scouts
  const [view,setView] = useState("list"); // list, detail, form
  const [selId,setSelId] = useState(null);
  const [tab,setTab] = useState("profil");

  // Filters
  const [search,setSearch] = useState("");
  const [fVille,setFVille] = useState("");
  const [fPoste,setFPoste] = useState("");
  const [fDec,setFDec] = useState("");

  // Forms
  const [form,setForm] = useState(null);
  const [rForm,setRForm] = useState(null);
  const [showR,setShowR] = useState(false);
  const [openR,setOpenR] = useState(null);
  const [matchForm,setMatchForm] = useState(null);
  const [showMF,setShowMF] = useState(false);
  const photoRef = useRef(null);
  const idRef = useRef(null);

  // Shadow team
  const [formation,setFormation] = useState("4-3-3");
  const [shadowTeam,setShadowTeam] = useState({});
  const [slotPick,setSlotPick] = useState(null); // {idx,pos}

  // Scout management
  const [showScoutForm,setShowScoutForm] = useState(false);
  const [scoutForm,setScoutForm] = useState({nom:"",role:"scout"});

  const sel = players.find(p=>p.id===selId);
  const scout = scouts.find(s=>s.id===curScout);
  const isAdmin = scout?.role === "admin";

  // Helpers
  const readFile=(e,field)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setForm(p=>({...p,[field]:ev.target.result}));r.readAsDataURL(f)};
  const blank=()=>({id:uid(),prenom:"",nom:"",dateNaissance:"",ville:VILLES[0],poste:POSITIONS[0],posteSecondaire:"",pied:"Droitier",taille:"",poids:"",photo:"",pieceIdentite:"",agent:"",finContrat:"",valeur:"",clubActuel:"",historique:"",rapports:[],notes:[],listes:[],createdAt:today()});
  const blankR=(matchId)=>({id:uid(),date:today(),matchId:matchId||"",lieu:sel?.ville||VILLES[0],contexte:"",minutesJouees:"",ratings:{physique:3,technique:3,tactique:3,mentalite:3},commentaires:{physique:"",technique:"",tactique:"",mentalite:""},conclusion:"",niveauActuel:NIVEAUX[2],potentiel:NIVEAUX[3],decision:"revoir",scoutId:curScout,scoutNom:scout?.nom||"",locked:false});
  const blankMatch=()=>({id:uid(),date:today(),equipe1:"",equipe2:"",lieu:VILLES[0],competition:"Détection",type:"live",statut:"planifie"});

  const save=()=>{if(!form.nom)return;setPlayers(prev=>{const ex=prev.find(p=>p.id===form.id);return ex?prev.map(p=>p.id===form.id?form:p):[...prev,form]});setSelId(form.id);setView("detail");setTab("profil")};
  const del=id=>{setPlayers(p=>p.filter(x=>x.id!==id));setSelId(null);setView("list")};

  const saveReport=()=>{
    if(!rForm.conclusion)return;
    const locked = {...rForm, locked:true};
    setPlayers(prev=>prev.map(p=>p.id===selId?{...p,rapports:[locked,...(p.rapports||[])]}:p));
    // update match status
    if(rForm.matchId){setMatches(prev=>prev.map(m=>m.id===rForm.matchId?{...m,statut:"termine"}:m))}
    setShowR(false);setRForm(null);setTab("rapports");
  };

  const addNote=(text)=>{if(!text.trim())return;setPlayers(prev=>prev.map(p=>p.id===selId?{...p,notes:[{id:uid(),date:today(),text:text.trim(),scout:scout?.nom||""},...(p.notes||[])]}:p))};
  const toggleListe=(liste)=>{setPlayers(prev=>prev.map(p=>{if(p.id!==selId)return p;const has=(p.listes||[]).includes(liste);return{...p,listes:has?p.listes.filter(l=>l!==liste):[...(p.listes||[]),liste]}}))};

  const saveMatch=()=>{if(!matchForm.equipe1)return;setMatches(prev=>[...prev,matchForm]);setShowMF(false);setMatchForm(null)};

  const lr=p=>(p.rapports||[])[0];
  const avg=r=>r?CATS.reduce((s,c)=>s+(r[c.key]||1),0)/CATS.length:0;
  const getDec=p=>{const r=lr(p);return r?DECISIONS.find(d=>d.v===r.decision):null};
  const reportsForPlayer=(p)=>isAdmin?(p.rapports||[]):(p.rapports||[]).filter(r=>r.scoutId===curScout);
  const allReports=(p)=>p.rapports||[];
  const reportCount=p=>(p.rapports||[]).length;

  const filtered=players.filter(p=>{
    const q=search.toLowerCase();
    return(!q||`${p.nom} ${p.prenom}`.toLowerCase().includes(q))&&(!fVille||p.ville===fVille)&&(!fPoste||p.poste===fPoste)&&(!fDec||lr(p)?.decision===fDec);
  });

  const pendingMatches = matches.filter(m=>m.statut==="planifie");
  const doneMatches = matches.filter(m=>m.statut==="termine");

  /* ━━━━━━ NAV ━━━━━━ */
  const Nav=()=>(
    <div style={{display:"flex",gap:2,padding:"0 20px",marginBottom:24,borderBottom:"1px solid var(--border)",maxWidth:960,margin:"0 auto 24px"}}>
      {[{k:"joueurs",l:"🦁 Joueurs",count:players.length},{k:"calendrier",l:"📅 Calendrier",count:matches.length},{k:"shadow",l:"⚽ Shadow Team"},{k:"scouts",l:"👥 Scouts"}].map(n=>(
        <button key={n.k} className={`tab ${page===n.k?"on":""}`} onClick={()=>{setPage(n.k);setView("list")}} style={{fontSize:13,padding:"12px 16px"}}>
          {n.l}{n.count!==undefined?<span style={{fontSize:10,marginLeft:6,padding:"1px 6px",borderRadius:10,background:page===n.k?"var(--blueG)":"#f1f5f9",color:page===n.k?"var(--blue)":"var(--t3)"}}>{n.count}</span>:""}
        </button>
      ))}
    </div>
  );

  /* ━━━━━━ JOUEURS LIST ━━━━━━ */
  const ListPage=()=>(
    <div className="fu" style={{maxWidth:960,margin:"0 auto",padding:"0 20px 60px"}}>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,position:"relative"}}>
          <input className="inp" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:40}}/>
          <svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <button className="btn-p" style={{padding:"12px 24px",fontSize:13}} onClick={()=>{setForm(blank());setView("form")}}>+ Nouveau joueur</button>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:22}}>
        <select className="inp" value={fPoste} onChange={e=>setFPoste(e.target.value)} style={{width:"auto",padding:"8px 12px",fontSize:11}}><option value="">Poste</option>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select>
        <select className="inp" value={fVille} onChange={e=>setFVille(e.target.value)} style={{width:"auto",padding:"8px 12px",fontSize:11}}><option value="">Ville</option>{VILLES.map(v=><option key={v}>{v}</option>)}</select>
        <select className="inp" value={fDec} onChange={e=>setFDec(e.target.value)} style={{width:"auto",padding:"8px 12px",fontSize:11}}><option value="">Décision</option>{DECISIONS.map(d=><option key={d.v} value={d.v}>{d.l}</option>)}</select>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
        {[{l:"Joueurs",v:players.length,c:"var(--blue)",bg:"var(--blueG)"},{l:"Rapports",v:players.reduce((s,p)=>s+reportCount(p),0),c:"#9333ea",bg:"#faf5ff"},{l:"Retenus",v:players.filter(p=>["retenu","signer","europe"].includes(lr(p)?.decision)).length,c:"#16a34a",bg:"#f0fdf4"},{l:"Matchs",v:matches.length,c:"#d97706",bg:"#fffbeb"}].map(s=>(
          <div key={s.l} style={{padding:"16px 10px",textAlign:"center",borderRadius:14,background:s.bg}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"var(--m)"}}>{s.v}</div>
            <div style={{fontSize:8,fontWeight:700,color:s.c,marginTop:6,textTransform:"uppercase",letterSpacing:1.5,opacity:.6}}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* List */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:60}}><div style={{fontSize:52,marginBottom:14}}>🦁</div><p style={{fontSize:14,color:"var(--t3)"}}>{players.length===0?"Aucun joueur. Lancez la détection !":"Aucun résultat."}</p></div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtered.map((p,idx)=>{
            const r=lr(p);const d=getDec(p);const a=r?avg(r.ratings):null;const aC=a?(a>=5?"#16a34a":a>=3.5?"#d97706":"#dc2626"):null;const rc=reportCount(p);
            return(
              <div key={p.id} className="card card-click" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,animationDelay:`${idx*25}ms`,animation:"fu .3s ease-out forwards",opacity:0}}
                onClick={()=>{setSelId(p.id);setView("detail");setTab("profil")}}>
                <div style={{width:46,height:46,borderRadius:13,overflow:"hidden",flexShrink:0,background:"linear-gradient(145deg,var(--blueP),#f1f5f9)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--border)"}}>
                  {p.photo?<img src={p.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18,opacity:.3}}>👤</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:"var(--navy)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nom.toUpperCase()} <span style={{fontWeight:500,color:"var(--t2)"}}>{p.prenom}</span></span>
                    {rc>0&&<span style={{fontSize:10,fontWeight:800,color:"var(--blue)",background:"var(--blueG)",padding:"2px 7px",borderRadius:6,fontFamily:"var(--m)"}}>{rc}</span>}
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                    <Tag color="var(--blue)" bg="var(--blueG)">{p.poste}</Tag><Tag>{p.ville}</Tag><Tag>{p.pied}</Tag>
                    {p.agent&&<Tag color="#9333ea" bg="#faf5ff">Agent: {p.agent}</Tag>}
                  </div>
                </div>
                {d&&<Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag>}
                <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:a?`${aC}08`:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${a?`${aC}20`:"#e2e8f0"}`}}>
                  <span style={{fontFamily:"var(--m)",fontSize:15,fontWeight:700,color:aC||"#cbd5e1"}}>{a?a.toFixed(1):"—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ━━━━━━ DETAIL ━━━━━━ */
  const DetailPage=()=>{
    if(!sel)return null;
    const r=lr(sel);const d=r?DECISIONS.find(x=>x.v===r.decision):null;
    const visibleReports = isAdmin ? allReports(sel) : reportsForPlayer(sel);
    return(
      <div className="fu" style={{maxWidth:860,margin:"0 auto",padding:"0 20px 60px"}}>
        <button className="btn-g" style={{padding:"8px 14px",fontSize:12,marginBottom:16}} onClick={()=>setView("list")}>← Liste</button>
        {/* Header */}
        <div className="card" style={{padding:26,marginBottom:16}}>
          <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{width:100,height:100,borderRadius:20,overflow:"hidden",flexShrink:0,background:"linear-gradient(145deg,var(--blueP),#f1f5f9)",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid var(--border)",boxShadow:"var(--sh)"}}>
              {sel.photo?<img src={sel.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:40,opacity:.2}}>👤</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <h2 style={{margin:0,fontSize:26,fontWeight:800,color:"var(--navy)"}}>{sel.nom.toUpperCase()} <span style={{fontWeight:500,color:"var(--t2)"}}>{sel.prenom}</span></h2>
                <span style={{fontSize:11,fontWeight:800,color:"var(--blue)",background:"var(--blueG)",padding:"3px 10px",borderRadius:8,fontFamily:"var(--m)"}}>{reportCount(sel)} rapport{reportCount(sel)>1?"s":""}</span>
              </div>
              <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
                <Tag color="var(--blue)" bg="var(--blueG)">{sel.poste}</Tag>
                {sel.posteSecondaire&&<Tag>{sel.posteSecondaire}</Tag>}
                <Tag>{sel.ville}</Tag><Tag>{sel.pied}</Tag>
                {sel.dateNaissance&&<Tag>🎂 {sel.dateNaissance}</Tag>}
                {sel.taille&&<Tag>📏 {sel.taille}cm</Tag>}
                {sel.poids&&<Tag>⚖️ {sel.poids}kg</Tag>}
              </div>
              {/* Transfer info */}
              {(sel.agent||sel.finContrat||sel.valeur||sel.clubActuel)&&(
                <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                  {sel.clubActuel&&<Tag color="#0f766e" bg="#f0fdfa">🏟 {sel.clubActuel}</Tag>}
                  {sel.agent&&<Tag color="#9333ea" bg="#faf5ff">🤝 {sel.agent}</Tag>}
                  {sel.finContrat&&<Tag color="#d97706" bg="#fffbeb">📄 Fin: {sel.finContrat}</Tag>}
                  {sel.valeur&&<Tag color="#16a34a" bg="#f0fdf4">💰 {sel.valeur}</Tag>}
                </div>
              )}
              {sel.pieceIdentite&&<div style={{marginTop:8}}><Tag color="#16a34a" bg="#f0fdf4">✓ Pièce d'identité</Tag></div>}
              {d&&<div style={{marginTop:8}}><Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag></div>}
              <div style={{display:"flex",gap:6,marginTop:14,flexWrap:"wrap"}}>
                <button className="btn-g" style={{padding:"8px 16px",fontSize:12}} onClick={()=>{setForm({...sel});setView("form")}}>✏️ Modifier</button>
                <button className="btn-p" style={{padding:"8px 18px",fontSize:12}} onClick={()=>{setRForm(blankR());setShowR(true)}}>📋 Nouveau rapport</button>
                <button className="btn-g" style={{padding:"8px 14px",fontSize:12,color:"#dc2626"}} onClick={()=>del(sel.id)}>🗑</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:20}}>
          {["profil","rapports","notes","listes"].map(t=>(
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
              {t==="profil"?"Profil":t==="rapports"?`Rapports (${visibleReports.length})`:t==="notes"?"Notes":"Listes"}
            </button>
          ))}
        </div>

        {/* PROFIL */}
        {tab==="profil"&&r&&(
          <div className="fu" style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <div className="card" style={{padding:22,display:"flex",flexDirection:"column",alignItems:"center",flex:"0 0 auto"}}>
              <div className="lbl" style={{marginBottom:10}}>Dernier rapport · {r.date} · par {r.scoutNom}</div>
              <Radar ratings={r.ratings} size={190}/>
              <div style={{marginTop:6}}><span style={{fontSize:36,fontWeight:800,fontFamily:"var(--m)",color:"var(--navy)"}}>{avg(r.ratings).toFixed(1)}</span><span style={{fontSize:14,color:"var(--t3)"}}>/6</span></div>
              {r.locked&&<Tag color="#16a34a" bg="#f0fdf4">🔒 Rapport verrouillé</Tag>}
            </div>
            <div style={{flex:1,minWidth:240,display:"flex",flexDirection:"column",gap:12}}>
              <div className="card" style={{padding:20}}>
                {CATS.map(cat=>{const v=r.ratings[cat.key];const s=getSc(v);return(
                  <div key={cat.key} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{cat.icon} {cat.label}</span>
                      <span style={{fontSize:10,fontWeight:700,color:s.c,padding:"2px 8px",borderRadius:6,background:s.bg}}>{s.l}</span>
                    </div>
                    <BarLine v={v}/>
                    {r.commentaires[cat.key]&&<p style={{margin:"5px 0 0",fontSize:12,color:"var(--t3)",lineHeight:1.6,fontStyle:"italic"}}>« {r.commentaires[cat.key]} »</p>}
                  </div>
                )})}
              </div>
              <div className="card" style={{padding:18}}>
                <div style={{display:"flex",gap:20,marginBottom:12}}>
                  <div><div className="lbl">Niveau actuel</div><div style={{fontSize:14,fontWeight:700,color:"#d97706"}}>{r.niveauActuel}</div></div>
                  <div><div className="lbl">Potentiel</div><div style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>{r.potentiel}</div></div>
                </div>
                {r.conclusion&&<><div className="lbl">Conclusion</div><p style={{margin:0,fontSize:13,color:"var(--t2)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{r.conclusion}</p></>}
              </div>
              {/* Historique clubs */}
              {sel.historique&&(
                <div className="card" style={{padding:18}}>
                  <div className="lbl">Parcours / Clubs précédents</div>
                  <p style={{margin:"6px 0 0",fontSize:13,color:"var(--t2)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{sel.historique}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {tab==="profil"&&!r&&<div style={{textAlign:"center",padding:50,color:"var(--t3)"}}>Aucun rapport. Créez le premier.</div>}

        {/* RAPPORTS */}
        {tab==="rapports"&&(
          <div className="fu" style={{display:"flex",flexDirection:"column",gap:8}}>
            {!isAdmin&&<div style={{padding:"10px 16px",background:"#fffbeb",borderRadius:10,fontSize:12,color:"#92400e",marginBottom:8}}>⚠️ Vous voyez uniquement vos rapports. L'admin voit tous les rapports.</div>}
            {visibleReports.length===0?<div style={{textAlign:"center",padding:40,color:"var(--t3)"}}>Aucun rapport visible.</div>
            :visibleReports.map(rp=>{
              const dec=DECISIONS.find(x=>x.v===rp.decision);const a=avg(rp.ratings);const open=openR===rp.id;
              const match=rp.matchId?matches.find(m=>m.id===rp.matchId):null;
              return(
                <div key={rp.id} className="card" style={{padding:open?20:14,cursor:"pointer",borderColor:open?"var(--blueL)":undefined}} onClick={()=>setOpenR(open?null:rp.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:"var(--blue)"}}>{rp.date}</span>
                      <Tag>{rp.lieu}</Tag>
                      <Tag color="#9333ea" bg="#faf5ff">✍ {rp.scoutNom}</Tag>
                      {match&&<Tag color="#0f766e" bg="#f0fdfa">{match.equipe1} vs {match.equipe2}</Tag>}
                      {rp.locked&&<Tag color="#16a34a" bg="#f0fdf4">🔒</Tag>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {dec&&<Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                      <span style={{fontSize:16,fontWeight:800,fontFamily:"var(--m)",color:a>=5?"#16a34a":a>=3.5?"#d97706":"#dc2626"}}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  {open&&(
                    <div className="fu" style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                      {rp.contexte&&<p style={{fontSize:11,color:"var(--t3)",margin:"0 0 10px"}}>📍 {rp.contexte}{rp.minutesJouees?` · ${rp.minutesJouees} min`:""}</p>}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                        {CATS.map(cat=>{const v=rp.ratings[cat.key];const s=getSc(v);return(
                          <div key={cat.key}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"var(--t2)"}}>{cat.icon} {cat.label}</span><span style={{color:s.c,fontWeight:700,fontFamily:"var(--m)"}}>{v}</span></div>
                          <div style={{height:4,background:"#f1f5f9",borderRadius:2}}><div style={{height:"100%",borderRadius:2,width:`${(v/6)*100}%`,background:s.c}}/></div>
                          {rp.commentaires[cat.key]&&<p style={{fontSize:10,color:"var(--t3)",margin:"4px 0 0",fontStyle:"italic"}}>« {rp.commentaires[cat.key]} »</p>}</div>
                        )})}
                      </div>
                      <div style={{display:"flex",gap:16,fontSize:11,marginBottom:8}}><span style={{color:"#d97706",fontWeight:600}}>Niveau: {rp.niveauActuel}</span><span style={{color:"#16a34a",fontWeight:600}}>Potentiel: {rp.potentiel}</span></div>
                      {rp.conclusion&&<p style={{fontSize:12,color:"var(--t2)",margin:0,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{rp.conclusion}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab==="notes"&&<NotesPanel notes={sel.notes||[]} onAdd={addNote}/>}
        {tab==="listes"&&(
          <div className="fu" style={{display:"flex",flexDirection:"column",gap:6}}>
            {["Groupe Élite Mbarodi","Détection Dakar","Détection Saint-Louis","Détection Thiès","Shadow Team 2026","Prospects Europe"].map(l=>{
              const has=(sel.listes||[]).includes(l);
              return(<div key={l} className="card card-click" onClick={()=>toggleListe(l)} style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:has?"var(--blueL)":undefined,background:has?"var(--blueG)":undefined}}>
                <span style={{fontSize:13,fontWeight:600,color:has?"var(--blue)":"var(--t2)"}}>{l}</span>
                <div style={{width:28,height:28,borderRadius:8,background:has?"#f0fdf4":"#f8fafc",border:`2px solid ${has?"#16a34a":"#e2e8f0"}`,display:"flex",alignItems:"center",justifyContent:"center",color:has?"#16a34a":"#cbd5e1",fontSize:14,fontWeight:700}}>{has?"✓":"+"}</div>
              </div>);
            })}
          </div>
        )}

        {/* REPORT MODAL */}
        {showR&&rForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:1000,display:"flex",justifyContent:"center",padding:"20px 16px",overflowY:"auto",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget){setShowR(false);setRForm(null)}}}>
            <div className="card fu" style={{maxWidth:620,width:"100%",padding:28,alignSelf:"flex-start",boxShadow:"var(--shL)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
                <div><h3 style={{margin:0,fontSize:20,fontWeight:800,color:"var(--navy)"}}>Rapport de match</h3><p style={{margin:"4px 0 0",fontSize:12,color:"var(--t3)"}}>{sel.nom.toUpperCase()} {sel.prenom} · {sel.poste} · Scout: {scout?.nom}</p></div>
                <button className="btn-g" style={{padding:"6px 10px",fontSize:14}} onClick={()=>{setShowR(false);setRForm(null)}}>✕</button>
              </div>
              {/* Link to match */}
              {pendingMatches.length>0&&(
                <div style={{marginBottom:16}}>
                  <label className="lbl">Rattacher à un match (optionnel)</label>
                  <select className="inp" value={rForm.matchId} onChange={e=>setRForm(p=>({...p,matchId:e.target.value}))}>
                    <option value="">— Rapport libre —</option>
                    {pendingMatches.map(m=><option key={m.id} value={m.id}>{m.date} · {m.equipe1} vs {m.equipe2}</option>)}
                  </select>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div><label className="lbl">Date *</label><input type="date" className="inp" value={rForm.date} onChange={e=>setRForm(p=>({...p,date:e.target.value}))}/></div>
                <div><label className="lbl">Lieu</label><select className="inp" value={rForm.lieu} onChange={e=>setRForm(p=>({...p,lieu:e.target.value}))}>{VILLES.map(v=><option key={v}>{v}</option>)}</select></div>
                <div><label className="lbl">Minutes jouées</label><input type="number" className="inp" value={rForm.minutesJouees} onChange={e=>setRForm(p=>({...p,minutesJouees:e.target.value}))} placeholder="90"/></div>
                <div><label className="lbl">Contexte</label><input className="inp" value={rForm.contexte} onChange={e=>setRForm(p=>({...p,contexte:e.target.value}))} placeholder="Match amical, détection..."/></div>
              </div>
              {CATS.map(cat=>(
                <div key={cat.key} style={{background:"#f8fafc",borderRadius:14,padding:16,marginBottom:10,border:"1px solid #f1f5f9"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:"var(--navy)"}}>{cat.icon} {cat.label}</span>
                    <span style={{fontSize:9,color:"var(--t3)",maxWidth:180,textAlign:"right"}}>{cat.hint}</span>
                  </div>
                  <NotePicker value={rForm.ratings[cat.key]} onChange={v=>setRForm(p=>({...p,ratings:{...p.ratings,[cat.key]:v}}))}/>
                  <textarea className="inp" style={{marginTop:8,height:52,resize:"vertical",background:"#fff"}} value={rForm.commentaires[cat.key]} onChange={e=>setRForm(p=>({...p,commentaires:{...p.commentaires,[cat.key]:e.target.value}}))} placeholder={`Analyse ${cat.label.toLowerCase()}...`}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,marginTop:4}}>
                <div><label className="lbl">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e=>setRForm(p=>({...p,niveauActuel:e.target.value}))}>{NIVEAUX.map(n=><option key={n}>{n}</option>)}</select></div>
                <div><label className="lbl">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e=>setRForm(p=>({...p,potentiel:e.target.value}))}>{NIVEAUX.map(n=><option key={n}>{n}</option>)}</select></div>
              </div>
              <div style={{marginBottom:14}}><label className="lbl" style={{color:!rForm.conclusion?"#dc2626":undefined}}>Conclusion * (obligatoire)</label><textarea className="inp" style={{height:80,resize:"vertical",borderColor:!rForm.conclusion?"#fca5a5":undefined}} value={rForm.conclusion} onChange={e=>setRForm(p=>({...p,conclusion:e.target.value}))} placeholder="Profil complet du joueur..."/></div>
              <div style={{marginBottom:20}}><label className="lbl" style={{color:"#dc2626"}}>Décision *</label>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{DECISIONS.map(d=>(
                  <button key={d.v} onClick={()=>setRForm(p=>({...p,decision:d.v}))} style={{padding:"8px 12px",borderRadius:10,border:rForm.decision===d.v?`2px solid ${d.c}`:"2px solid transparent",cursor:"pointer",background:rForm.decision===d.v?d.bg:"#f8fafc",color:rForm.decision===d.v?d.c:"#94a3b8",fontSize:11,fontWeight:700,transition:"all .15s"}}>{d.i} {d.l}</button>
                ))}</div>
              </div>
              <div style={{background:"#fffbeb",padding:"10px 14px",borderRadius:10,fontSize:11,color:"#92400e",marginBottom:16}}>🔒 Une fois validé, le rapport sera verrouillé définitivement. Vous ne pourrez plus le modifier.</div>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-g" style={{flex:1,padding:14,fontSize:14,fontWeight:600}} onClick={()=>{setShowR(false);setRForm(null)}}>Annuler</button>
                <button className={rForm.conclusion?"btn-p":"btn-g"} disabled={!rForm.conclusion} style={{flex:1,padding:14,fontSize:14,fontWeight:700,opacity:rForm.conclusion?1:.4,cursor:rForm.conclusion?"pointer":"not-allowed"}} onClick={saveReport}>🔒 Valider et verrouiller</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ━━━━━━ FORM ━━━━━━ */
  const FormPage=()=>{
    if(!form)return null;const isEdit=players.some(p=>p.id===form.id);
    return(
      <div className="fu" style={{maxWidth:700,margin:"0 auto",padding:"0 20px 60px"}}>
        <button className="btn-g" style={{padding:"8px 14px",fontSize:12,marginBottom:16}} onClick={()=>setView(isEdit?"detail":"list")}>← Retour</button>
        <h2 style={{fontSize:22,fontWeight:800,color:"var(--navy)",marginBottom:24}}>{isEdit?"Modifier":"Nouveau joueur"}</h2>
        <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:24}}>
          <div onClick={()=>photoRef.current?.click()} style={{width:88,height:88,borderRadius:18,overflow:"hidden",cursor:"pointer",background:"linear-gradient(145deg,var(--blueP),#f8fafc)",border:"2px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center",fontSize:11,color:"var(--t3)"}}>📷<br/>Photo</div>}
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={e=>readFile(e,"photo")} style={{display:"none"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          <div><label className="lbl">Nom *</label><input className="inp" value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Nom"/></div>
          <div><label className="lbl">Prénom</label><input className="inp" value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))} placeholder="Prénom"/></div>
          <div><label className="lbl">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e=>setForm(p=>({...p,dateNaissance:e.target.value}))}/></div>
          <div><label className="lbl">Ville</label><select className="inp" value={form.ville} onChange={e=>setForm(p=>({...p,ville:e.target.value}))}>{VILLES.map(v=><option key={v}>{v}</option>)}</select></div>
          <div><label className="lbl">Poste</label><select className="inp" value={form.poste} onChange={e=>setForm(p=>({...p,poste:e.target.value}))}>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select></div>
          <div><label className="lbl">Poste secondaire</label><select className="inp" value={form.posteSecondaire} onChange={e=>setForm(p=>({...p,posteSecondaire:e.target.value}))}><option value="">—</option>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select></div>
          <div><label className="lbl">Pied fort</label><select className="inp" value={form.pied} onChange={e=>setForm(p=>({...p,pied:e.target.value}))}><option>Droitier</option><option>Gaucher</option><option>Les deux</option></select></div>
          <div><label className="lbl">Taille (cm)</label><input type="number" className="inp" value={form.taille} onChange={e=>setForm(p=>({...p,taille:e.target.value}))} placeholder="178"/></div>
          <div><label className="lbl">Poids (kg)</label><input type="number" className="inp" value={form.poids} onChange={e=>setForm(p=>({...p,poids:e.target.value}))} placeholder="72"/></div>
        </div>
        {/* Agent / Transfer info */}
        <div className="card" style={{padding:18,marginBottom:20}}>
          <div className="lbl" style={{marginBottom:12,fontSize:11}}>🤝 Informations transfert / agent</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="lbl">Club actuel</label><input className="inp" value={form.clubActuel} onChange={e=>setForm(p=>({...p,clubActuel:e.target.value}))} placeholder="Nom du club"/></div>
            <div><label className="lbl">Agent</label><input className="inp" value={form.agent} onChange={e=>setForm(p=>({...p,agent:e.target.value}))} placeholder="Nom de l'agent"/></div>
            <div><label className="lbl">Fin de contrat</label><input className="inp" value={form.finContrat} onChange={e=>setForm(p=>({...p,finContrat:e.target.value}))} placeholder="Juin 2026"/></div>
            <div><label className="lbl">Valeur estimée</label><input className="inp" value={form.valeur} onChange={e=>setForm(p=>({...p,valeur:e.target.value}))} placeholder="50 000 €"/></div>
          </div>
          <div style={{marginTop:12}}><label className="lbl">Parcours / clubs précédents</label><textarea className="inp" style={{height:60,resize:"vertical"}} value={form.historique} onChange={e=>setForm(p=>({...p,historique:e.target.value}))} placeholder="Ex: 2022-24 ASC Jaraaf, 2024-25 Dakar Sacré-Cœur..."/></div>
        </div>
        {/* ID */}
        <div style={{marginBottom:24}}>
          <label className="lbl">Pièce d'identité</label>
          <div className="card card-click" onClick={()=>idRef.current?.click()} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderStyle:form.pieceIdentite?"solid":"dashed"}}>
            {form.pieceIdentite?<><img src={form.pieceIdentite} alt="" style={{width:56,height:36,objectFit:"cover",borderRadius:6}}/><span style={{fontSize:12,color:"#16a34a",fontWeight:600}}>✓ Ajouté</span></>
              :<><span style={{fontSize:18,opacity:.3}}>🪪</span><span style={{fontSize:12,color:"var(--t3)"}}>Ajouter la pièce d'identité</span></>}
          </div>
          <input ref={idRef} type="file" accept="image/*" onChange={e=>readFile(e,"pieceIdentite")} style={{display:"none"}}/>
        </div>
        <button className="btn-p" style={{width:"100%",padding:16,fontSize:15}} onClick={save}>{isEdit?"Enregistrer":"Ajouter le joueur"} 🦁</button>
      </div>
    );
  };

  /* ━━━━━━ CALENDRIER ━━━━━━ */
  const CalendrierPage=()=>(
    <div className="fu" style={{maxWidth:800,margin:"0 auto",padding:"0 20px 60px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800,color:"var(--navy)"}}>📅 Calendrier des matchs</h2>
        <button className="btn-p" style={{padding:"10px 20px",fontSize:12}} onClick={()=>{setMatchForm(blankMatch());setShowMF(true)}}>+ Programmer un match</button>
      </div>
      {/* Pending */}
      <div className="lbl" style={{marginBottom:10}}>Mes rendez-vous ({pendingMatches.length})</div>
      {pendingMatches.length===0?<p style={{color:"var(--t3)",fontSize:13,marginBottom:24}}>Aucun match programmé.</p>
      :<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28}}>
        {pendingMatches.map(m=>(
          <div key={m.id} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--navy)"}}>{m.equipe1} vs {m.equipe2}</div>
              <div style={{display:"flex",gap:5,marginTop:4}}><Tag>{m.date}</Tag><Tag>{m.lieu}</Tag><Tag color="#2563eb" bg="#eff6ff">{m.competition}</Tag><Tag>{m.type==="live"?"🏟 Live":"📹 Vidéo"}</Tag></div>
            </div>
            <Tag color="#d97706" bg="#fffbeb">⏳ Planifié</Tag>
          </div>
        ))}
      </div>}
      {/* Done */}
      <div className="lbl" style={{marginBottom:10}}>Matchs terminés ({doneMatches.length})</div>
      {doneMatches.length===0?<p style={{color:"var(--t3)",fontSize:13}}>Aucun match terminé.</p>
      :<div style={{display:"flex",flexDirection:"column",gap:6}}>
        {doneMatches.map(m=>(
          <div key={m.id} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.7}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--t2)"}}>{m.equipe1} vs {m.equipe2}</div><div style={{display:"flex",gap:5,marginTop:4}}><Tag>{m.date}</Tag><Tag>{m.lieu}</Tag></div></div>
            <Tag color="#16a34a" bg="#f0fdf4">✓ Terminé</Tag>
          </div>
        ))}
      </div>}
      {/* Match form modal */}
      {showMF&&matchForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:1000,display:"flex",justifyContent:"center",padding:"40px 16px",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget){setShowMF(false);setMatchForm(null)}}}>
          <div className="card fu" style={{maxWidth:480,width:"100%",padding:28,alignSelf:"flex-start",boxShadow:"var(--shL)"}}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:800,color:"var(--navy)"}}>Programmer un match</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div><label className="lbl">Équipe 1 *</label><input className="inp" value={matchForm.equipe1} onChange={e=>setMatchForm(p=>({...p,equipe1:e.target.value}))} placeholder="Dakar FC"/></div>
              <div><label className="lbl">Équipe 2 *</label><input className="inp" value={matchForm.equipe2} onChange={e=>setMatchForm(p=>({...p,equipe2:e.target.value}))} placeholder="Thiès United"/></div>
              <div><label className="lbl">Date</label><input type="date" className="inp" value={matchForm.date} onChange={e=>setMatchForm(p=>({...p,date:e.target.value}))}/></div>
              <div><label className="lbl">Lieu</label><select className="inp" value={matchForm.lieu} onChange={e=>setMatchForm(p=>({...p,lieu:e.target.value}))}>{VILLES.map(v=><option key={v}>{v}</option>)}</select></div>
              <div><label className="lbl">Compétition</label><input className="inp" value={matchForm.competition} onChange={e=>setMatchForm(p=>({...p,competition:e.target.value}))} placeholder="Détection, Championnat..."/></div>
              <div><label className="lbl">Type</label><select className="inp" value={matchForm.type} onChange={e=>setMatchForm(p=>({...p,type:e.target.value}))}><option value="live">🏟 Live / Terrain</option><option value="video">📹 Vidéo</option></select></div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-g" style={{flex:1,padding:12,fontSize:13}} onClick={()=>{setShowMF(false);setMatchForm(null)}}>Annuler</button>
              <button className="btn-p" style={{flex:1,padding:12,fontSize:13}} onClick={saveMatch}>Programmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ━━━━━━ SHADOW TEAM ━━━━━━ */
  const ShadowPage=()=>(
    <div className="fu" style={{maxWidth:800,margin:"0 auto",padding:"0 20px 60px"}}>
      <h2 style={{margin:"0 0 16px",fontSize:20,fontWeight:800,color:"var(--navy)"}}>⚽ Shadow Team</h2>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {Object.keys(FORMATIONS).map(f=>(
          <button key={f} className={formation===f?"btn-p":"btn-g"} style={{padding:"8px 16px",fontSize:12}} onClick={()=>{setFormation(f);setShadowTeam({})}}>{FORMATIONS[f].label}</button>
        ))}
      </div>
      <PitchView formation={formation} players={players} shadowTeam={shadowTeam} onSlotClick={(idx,pos)=>setSlotPick({idx,pos})}/>
      {slotPick&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:1000,display:"flex",justifyContent:"center",padding:"40px 16px",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)setSlotPick(null)}}>
          <div className="card fu" style={{maxWidth:420,width:"100%",padding:24,alignSelf:"flex-start",boxShadow:"var(--shL)",maxHeight:"70vh",overflowY:"auto"}}>
            <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:800,color:"var(--navy)"}}>Choisir — {slotPick.pos}</h3>
            <button className="btn-g" style={{width:"100%",padding:10,fontSize:12,marginBottom:8}} onClick={()=>{setShadowTeam(p=>{const n={...p};delete n[slotPick.idx];return n});setSlotPick(null)}}>Retirer le joueur</button>
            {players.filter(p=>!Object.values(shadowTeam).includes(p.id)).map(p=>(
              <div key={p.id} className="card card-click" style={{padding:"10px 14px",marginBottom:4,display:"flex",alignItems:"center",gap:10}} onClick={()=>{setShadowTeam(prev=>({...prev,[slotPick.idx]:p.id}));setSlotPick(null)}}>
                <div style={{width:32,height:32,borderRadius:8,overflow:"hidden",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--border)"}}>
                  {p.photo?<img src={p.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:12,opacity:.3}}>👤</span>}
                </div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"var(--navy)"}}>{p.nom.toUpperCase()} {p.prenom}</div><div style={{fontSize:10,color:"var(--t3)"}}>{p.poste} · {p.ville}</div></div>
                {lr(p)&&<span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:"var(--blue)"}}>{avg(lr(p).ratings).toFixed(1)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ━━━━━━ SCOUTS ━━━━━━ */
  const ScoutsPage=()=>(
    <div className="fu" style={{maxWidth:600,margin:"0 auto",padding:"0 20px 60px"}}>
      <h2 style={{margin:"0 0 16px",fontSize:20,fontWeight:800,color:"var(--navy)"}}>👥 Gestion des scouts</h2>
      <div style={{marginBottom:16}}>
        <div className="lbl" style={{marginBottom:8}}>Connecté en tant que</div>
        <select className="inp" value={curScout} onChange={e=>setCurScout(e.target.value)}>
          {scouts.map(s=><option key={s.id} value={s.id}>{s.nom} ({s.role})</option>)}
        </select>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
        {scouts.map(s=>(
          <div key={s.id} className="card" style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:s.id===curScout?"var(--blueL)":undefined}}>
            <div><div style={{fontSize:14,fontWeight:700,color:"var(--navy)"}}>{s.nom}</div><div style={{fontSize:11,color:"var(--t3)"}}>{s.role==="admin"?"Admin — voit tous les rapports":"Scout — voit ses rapports uniquement"}</div></div>
            <Tag color={s.role==="admin"?"#9333ea":"var(--blue)"} bg={s.role==="admin"?"#faf5ff":"var(--blueG)"}>{s.role}</Tag>
          </div>
        ))}
      </div>
      {/* Add scout */}
      <div className="card" style={{padding:18}}>
        <div className="lbl" style={{marginBottom:10}}>Ajouter un scout</div>
        <div style={{display:"flex",gap:8}}>
          <input className="inp" style={{flex:1}} value={scoutForm.nom} onChange={e=>setScoutForm(p=>({...p,nom:e.target.value}))} placeholder="Nom du scout"/>
          <select className="inp" style={{width:"auto"}} value={scoutForm.role} onChange={e=>setScoutForm(p=>({...p,role:e.target.value}))}>
            <option value="scout">Scout</option><option value="admin">Admin</option>
          </select>
          <button className="btn-p" style={{padding:"10px 18px",fontSize:12}} onClick={()=>{if(!scoutForm.nom)return;setScouts(prev=>[...prev,{id:uid(),nom:scoutForm.nom,role:scoutForm.role,color:"#"+Math.floor(Math.random()*16777215).toString(16)}]);setScoutForm({nom:"",role:"scout"})}}>+</button>
        </div>
      </div>
      <div style={{marginTop:16,padding:"12px 16px",background:"#eff6ff",borderRadius:10,fontSize:12,color:"#1e40af"}}>
        ℹ️ En mode <strong>Admin</strong>, vous voyez tous les rapports de tous les scouts.<br/>
        En mode <strong>Scout</strong>, vous ne voyez que vos propres rapports (objectivité).
      </div>
    </div>
  );

  /* ━━━━━━ RENDER ━━━━━━ */
  return(
    <div style={{minHeight:"100vh",fontFamily:"var(--f)",color:"var(--t1)",background:"var(--bg)"}}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0c2340,#1a3a5c)",padding:"24px 20px 20px",textAlign:"center",borderBottom:"3px solid var(--blueL)",boxShadow:"0 4px 24px rgba(12,35,64,.15)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:4}}>
          <span style={{fontSize:28,filter:"drop-shadow(0 0 8px rgba(255,255,255,.2))"}}>🦁</span>
          <h1 style={{margin:0,fontSize:26,fontWeight:800,letterSpacing:4,textTransform:"uppercase",background:"linear-gradient(135deg,#7db8e8,#b8ddf8,#fff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MBARODI FC</h1>
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:4,fontFamily:"var(--m)"}}>Scouting · Détection · Recrutement</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:6}}>Connecté : <strong style={{color:"rgba(255,255,255,.6)"}}>{scout?.nom}</strong> ({scout?.role})</div>
      </div>
      <Nav/>
      {page==="joueurs"&&view==="list"&&<ListPage/>}
      {page==="joueurs"&&view==="detail"&&<DetailPage/>}
      {page==="joueurs"&&view==="form"&&<FormPage/>}
      {page==="calendrier"&&<CalendrierPage/>}
      {page==="shadow"&&<ShadowPage/>}
      {page==="scouts"&&<ScoutsPage/>}
    </div>
  );
}

function NotesPanel({notes,onAdd}){
  const[text,setText]=useState("");
  return(
    <div className="fu">
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input className="inp" style={{flex:1}} value={text} onChange={e=>setText(e.target.value)} placeholder="Info agent, famille, salaire, discussions..." onKeyDown={e=>{if(e.key==="Enter"&&text.trim()){onAdd(text);setText("")}}}/>
        <button className="btn-p" style={{padding:"10px 18px",fontSize:12}} onClick={()=>{if(text.trim()){onAdd(text);setText("")}}}>+</button>
      </div>
      {notes.length===0?<p style={{textAlign:"center",color:"var(--t3)",fontSize:13,padding:30}}>Aucune note.</p>
      :<div style={{display:"flex",flexDirection:"column",gap:6}}>
        {notes.map(n=>(
          <div key={n.id} className="card" style={{padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:700,fontFamily:"var(--m)",color:"var(--blue)"}}>{n.date}</span>
              {n.scout&&<Tag>par {n.scout}</Tag>}
            </div>
            <p style={{margin:"6px 0 0",fontSize:13,color:"var(--t2)",lineHeight:1.7}}>{n.text}</p>
          </div>
        ))}
      </div>}
    </div>
  );
}
