export const POSITIONS = [
  "Gardien", "Défenseur Central", "Latéral Droit", "Latéral Gauche",
  "Milieu Défensif", "Milieu Central", "Milieu Offensif",
  "Ailier Droit", "Ailier Gauche", "Attaquant", "Avant-Centre",
];

export const VILLES = [
  "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack",
  "Tambacounda", "Fatick", "Diourbel", "Rufisque", "Mbour",
  "Louga", "Matam", "Kédougou", "Sédhiou", "Kaffrine", "Autre",
];

export const SCALE = [
  { v: 1, l: "Missing",      c: "#dc2626", bg: "#fef2f2" },
  { v: 2, l: "Pauvre",       c: "#ea580c", bg: "#fff7ed" },
  { v: 3, l: "Moyen",        c: "#ca8a04", bg: "#fefce8" },
  { v: 4, l: "Satisfaisant", c: "#65a30d", bg: "#f7fee7" },
  { v: 5, l: "Bon",          c: "#16a34a", bg: "#f0fdf4" },
  { v: 6, l: "Très bon",     c: "#059669", bg: "#ecfdf5" },
];

export const CATS = [
  { key: "physique",  label: "Physique",  icon: "💪", hint: "Puissance, vitesse, endurance, explosivité" },
  { key: "technique", label: "Technique", icon: "⚽", hint: "Passe, contrôle, dribble, frappe" },
  { key: "tactique",  label: "Tactique",  icon: "📐", hint: "Positionnement, lecture du jeu, discipline" },
  { key: "mentalite", label: "Mentalité", icon: "🧠", hint: "Leadership, combativité, concentration" },
];

export const NIVEAUX = [
  "Sans intérêt", "National / Régional", "U17 nationaux", "U19 nationaux", "N2/N3", "Ligue 2 remplaçant", "Ligue 2 titulaire",
  "Ligue 1 remplaçant", "Ligue 1 titulaire", "Top 5 européen", "Classe internationale", "Champions League",
];

export const DECISIONS = [
  { v: "sans_interet",    l: "Sans intérêt",          c: "#dc2626", bg: "#fef2f2", i: "✕" },
  { v: "revoir_detection",l: "À revoir en détection",  c: "#d97706", bg: "#fffbeb", i: "◉" },
  { v: "revoir_essai",    l: "À revoir à l'essai",     c: "#ca8a04", bg: "#fefce8", i: "↻" },
  { v: "retenu_academie", l: "Retenu académie",         c: "#16a34a", bg: "#f0fdf4", i: "✓" },
  { v: "test_europe",     l: "Test Europe",             c: "#2563eb", bg: "#eff6ff", i: "✈" },
  { v: "signer",          l: "À signer",                c: "#9333ea", bg: "#faf5ff", i: "★" },
];

export const LISTES = [
  "Groupe Élite Mbarodi", "Détection Dakar", "Détection Saint-Louis",
  "Détection Thiès", "Shadow Team 2026", "Prospects Europe",
];

export const uid = () => crypto.randomUUID();
export const today = () => new Date().toISOString().split("T")[0];
export const getSc = v => SCALE.find(s => s.v === v) || SCALE[0];
