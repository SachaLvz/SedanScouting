/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */
export type CategoryKey = 'physique' | 'technique' | 'tactique' | 'mentalite';

export interface ScaleItem {
  v: number;
  l: string;
  c: string;
  bg: string;
}

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  hint: string;
}

export interface DecisionItem {
  v: string;
  l: string;
  c: string;
  bg: string;
  i: string;
}

export interface FormationSlot {
  pos: string;
  x: number;
  y: number;
}

export interface Formation {
  label: string;
  slots: FormationSlot[];
}

export type Ratings = Record<CategoryKey, number>;
export type Commentaires = Record<CategoryKey, string>;

export interface Rapport {
  id: string;
  date: string;
  matchId: string;
  lieu: string;
  contexte: string;
  minutesJouees: string;
  ratings: Ratings;
  commentaires: Commentaires;
  conclusion: string;
  niveauActuel: string;
  potentiel: string;
  decision: string;
  scoutId: string;
  scoutNom: string;
  locked: boolean;
}

export interface Note {
  id: string;
  date: string;
  text: string;
  scout: string;
}

export interface Player {
  id: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  ville: string;
  poste: string;
  posteSecondaire: string;
  pied: string;
  taille: string;
  poids: string;
  photo: string;
  pieceIdentite: string;
  agent: string;
  finContrat: string;
  valeur: string;
  clubActuel: string;
  historique: string;
  rapports: Rapport[];
  notes: Note[];
  listes: string[];
  createdAt: string;
}

export interface Match {
  id: string;
  date: string;
  hour: string;
  equipe1: string;
  equipe2: string;
  lieu: string;
  competition: string;
  type: string;
  statut: string;
}

export interface Scout {
  id: string;
  nom: string;
  role: string;
  color: string;
}

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
export const POSITIONS: string[] = [
  'Gardien','Déf. Central','Latéral Droit','Latéral Gauche',
  'Milieu Défensif','Milieu Central','Milieu Offensif',
  'Ailier Droit','Ailier Gauche','Attaquant','Avant-Centre',
];

export const VILLES: string[] = [
  'Dakar','Thiès','Saint-Louis','Ziguinchor','Kaolack','Tambacounda',
  'Fatick','Diourbel','Rufisque','Mbour','Louga','Matam','Kédougou','Autre',
];

export const SCALE: ScaleItem[] = [
  { v:1, l:'Missing',      c:'#dc2626', bg:'#fef2f2' },
  { v:2, l:'Pauvre',       c:'#ea580c', bg:'#fff7ed' },
  { v:3, l:'Moyen',        c:'#ca8a04', bg:'#fefce8' },
  { v:4, l:'Satisfaisant', c:'#65a30d', bg:'#f7fee7' },
  { v:5, l:'Bon',          c:'#16a34a', bg:'#f0fdf4' },
  { v:6, l:'Très bon',     c:'#059669', bg:'#ecfdf5' },
];

export const CATS: Category[] = [
  { key:'physique',  label:'Physique',   icon:'💪', hint:'Puissance, vitesse, endurance, explosivité, volume' },
  { key:'technique', label:'Technique',  icon:'⚽', hint:'Passe, contrôle, dribble, frappe, jeu de tête' },
  { key:'tactique',  label:'Tactique',   icon:'📐', hint:'Positionnement, lecture du jeu, discipline' },
  { key:'mentalite', label:'Mentalité',  icon:'🧠', hint:'Leadership, combativité, concentration' },
];

export const NIVEAUX: string[] = [
  'Sans intérêt','Régional','National','Ligue 2 remplaçant','Ligue 2 titulaire',
  'Ligue 1 remplaçant','Ligue 1 titulaire','Top 5 européen','Champions League',
];

export const DECISIONS: DecisionItem[] = [
  { v:'sans_interet', l:'Sans intérêt',         c:'#dc2626', bg:'#fef2f2', i:'✕' },
  { v:'revoir',       l:'À revoir en détection', c:'#d97706', bg:'#fffbeb', i:'◉' },
  { v:'essai',        l:'À l\'essai',             c:'#ca8a04', bg:'#fefce8', i:'↻' },
  { v:'retenu',       l:'Retenu académie',        c:'#16a34a', bg:'#f0fdf4', i:'✓' },
  { v:'europe',       l:'Test Europe',            c:'#2563eb', bg:'#eff6ff', i:'✈' },
  { v:'signer',       l:'À signer',               c:'#9333ea', bg:'#faf5ff', i:'★' },
];

export const FORMATIONS: Record<string, Formation> = {
  '4-3-3': { label:'4-3-3', slots:[
    {pos:'Gardien',x:50,y:92},{pos:'Latéral Gauche',x:10,y:72},{pos:'Déf. Central',x:35,y:74},{pos:'Déf. Central',x:65,y:74},{pos:'Latéral Droit',x:90,y:72},
    {pos:'Milieu Central',x:30,y:50},{pos:'Milieu Défensif',x:50,y:55},{pos:'Milieu Central',x:70,y:50},
    {pos:'Ailier Gauche',x:15,y:25},{pos:'Avant-Centre',x:50,y:20},{pos:'Ailier Droit',x:85,y:25},
  ]},
  '4-4-2': { label:'4-4-2', slots:[
    {pos:'Gardien',x:50,y:92},{pos:'Latéral Gauche',x:10,y:72},{pos:'Déf. Central',x:35,y:74},{pos:'Déf. Central',x:65,y:74},{pos:'Latéral Droit',x:90,y:72},
    {pos:'Ailier Gauche',x:12,y:48},{pos:'Milieu Central',x:38,y:50},{pos:'Milieu Central',x:62,y:50},{pos:'Ailier Droit',x:88,y:48},
    {pos:'Attaquant',x:35,y:22},{pos:'Avant-Centre',x:65,y:22},
  ]},
  '4-2-3-1': { label:'4-2-3-1', slots:[
    {pos:'Gardien',x:50,y:92},{pos:'Latéral Gauche',x:10,y:72},{pos:'Déf. Central',x:35,y:74},{pos:'Déf. Central',x:65,y:74},{pos:'Latéral Droit',x:90,y:72},
    {pos:'Milieu Défensif',x:38,y:56},{pos:'Milieu Défensif',x:62,y:56},
    {pos:'Ailier Gauche',x:15,y:35},{pos:'Milieu Offensif',x:50,y:36},{pos:'Ailier Droit',x:85,y:35},
    {pos:'Avant-Centre',x:50,y:18},
  ]},
  '3-5-2': { label:'3-5-2', slots:[
    {pos:'Gardien',x:50,y:92},{pos:'Déf. Central',x:25,y:74},{pos:'Déf. Central',x:50,y:76},{pos:'Déf. Central',x:75,y:74},
    {pos:'Latéral Gauche',x:8,y:50},{pos:'Milieu Central',x:32,y:52},{pos:'Milieu Défensif',x:50,y:55},{pos:'Milieu Central',x:68,y:52},{pos:'Latéral Droit',x:92,y:50},
    {pos:'Attaquant',x:36,y:22},{pos:'Avant-Centre',x:64,y:22},
  ]},
};

export const LISTES: string[] = [
  'Groupe Élite Mbarodi','Détection Dakar','Détection Saint-Louis',
  'Détection Thiès','Shadow Team 2026','Prospects Europe',
];

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
export const uid = (): string => Math.random().toString(36).substr(2, 9);
export const today = (): string => new Date().toISOString().split('T')[0];
export const getSc = (v: number): ScaleItem => SCALE.find(s => s.v === v) ?? SCALE[0];
