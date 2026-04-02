'use client';
import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { uid, today, CATS, DECISIONS, VILLES, NIVEAUX } from './config';
import type { Player, Match, Scout, Rapport, Ratings, DecisionItem } from './config';

interface AdminUser { id: string; firstName: string; lastName: string; role: string; }

export interface AdminContextValue {
  players: Player[];
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  matches: Match[];
  setMatches: Dispatch<SetStateAction<Match[]>>;
  scouts: Scout[];
  setScouts: Dispatch<SetStateAction<Scout[]>>;
  curScout: string;
  setCurScout: (id: string) => void;
  scout: Scout | undefined;
  isAdmin: boolean;
  /* CRUD */
  updatePlayer: (player: Player) => Promise<void>;
  createPlayer: (player: Player) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  restorePlayer: (id: string, player: Player) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  createMatch: (match: Match) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  /* Helpers */
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
  getDec: (p: Player) => DecisionItem | null;
  reportsForPlayer: (p: Player) => Rapport[];
  allReports: (p: Player) => Rapport[];
  reportCount: (p: Player) => number;
  blank: () => Player;
  blankR: (selId: string | null, matchId?: string) => Rapport;
  blankMatch: () => Match;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminData(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminData must be inside AdminDataProvider');
  return ctx;
}

export function AdminDataProvider({ initialUser, children }: { initialUser: AdminUser; children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scouts, setScouts] = useState<Scout[]>([
    { id: initialUser.id, firstName: initialUser.firstName, lastName: initialUser.lastName, role: initialUser.role, color: '#2563eb' },
  ]);
  const [curScout, setCurScout] = useState(initialUser.id);

  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(d => { if (Array.isArray(d)) setPlayers(d); }).catch(() => {});
    fetch('/api/matches').then(r => r.json()).then(d => { if (Array.isArray(d)) setMatches(d); }).catch(() => {});
    fetch('/api/scouts').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const fetched = d.map((u: { id: string; firstName: string; lastName: string; email?: string; role: string; hasPassword?: boolean }) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, color: '#2563eb', hasPassword: u.hasPassword }));
        const adminEntry = { id: initialUser.id, firstName: initialUser.firstName, lastName: initialUser.lastName, role: initialUser.role, color: '#2563eb', hasPassword: true };
        setScouts([adminEntry, ...fetched.filter((u: { id: string }) => u.id !== initialUser.id)]);
      }
    }).catch(() => {});
  }, []);

  const scout = scouts.find(s => s.id === curScout);
  const isAdmin = scout?.role === 'admin';

  const updatePlayer = async (player: Player) => {
    await fetch(`/api/players/${player.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(player) }).catch(console.error);
    setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
  };
  const createPlayer = async (player: Player) => {
    await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(player) }).catch(console.error);
    setPlayers(prev => [...prev, player]);
  };
  const deletePlayer = async (id: string) => {
    await fetch(`/api/players/${id}`, { method: 'DELETE' }).catch(console.error);
    setPlayers(prev => prev.filter(p => p.id !== id));
  };
  const restorePlayer = async (id: string, player: Player) => {
    await fetch(`/api/players/${id}/restore`, { method: 'PUT' }).catch(console.error);
    setPlayers(prev => [...prev, player]);
  };
  const updateMatch = async (match: Match) => {
    await fetch(`/api/matches/${match.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(match) }).catch(console.error);
    setMatches(prev => prev.map(m => m.id === match.id ? match : m));
  };
  const createMatch = async (match: Match) => {
    await fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(match) }).catch(console.error);
    setMatches(prev => [...prev, match]);
  };
  const deleteMatch = async (id: string) => {
    await fetch(`/api/matches/${id}`, { method: 'DELETE' }).catch(console.error);
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const lr = (p: Player): Rapport | undefined => (p.rapports ?? [])[0];
  const avg = (r: Ratings): number => CATS.reduce((s, c) => s + (r[c.key] ?? 1), 0) / CATS.length;
  const getDec = (p: Player): DecisionItem | null => { const r = lr(p); return r ? DECISIONS.find(d => d.v === r.decision) ?? null : null; };
  const reportsForPlayer = (p: Player): Rapport[] => isAdmin ? (p.rapports ?? []) : (p.rapports ?? []).filter(r => r.scoutId === curScout);
  const allReports = (p: Player): Rapport[] => p.rapports ?? [];
  const reportCount = (p: Player): number => (p.rapports ?? []).length;

  const blank = (): Player => ({
    id: uid(), firstName: '', lastName: '', dateNaissance: '', ville: VILLES[0], poste: 'Gardien',
    posteSecondaire: '', pied: 'Droitier', taille: '', poids: '', photo: '', photos: [], profilePhoto: '', pieceIdentite: '',
    nationalite: '',
    agent: '', finContrat: '', valeur: '', clubActuel: '', historique: '',
    rapports: [], notes: [], listes: [], createdAt: today(),
  });
  const blankR = (selId: string | null, matchId?: string): Rapport => {
    const sel = selId ? players.find(p => p.id === selId) : null;
    return {
      id: uid(), date: today(), matchId: matchId ?? '', lieu: sel?.ville ?? VILLES[0],
      contexte: '', minutesJouees: '',
      ratings: { physique: 3, technique: 3, tactique: 3, mentalite: 3 },
      commentaires: { physique: '', technique: '', tactique: '', mentalite: '' },
      conclusion: '', niveauActuel: NIVEAUX[2], potentiel: NIVEAUX[3],
      decision: 'revoir', scoutId: curScout, scoutName: [scout?.firstName, scout?.lastName].filter(Boolean).join(' '), locked: false,
    };
  };
  const blankMatch = (): Match => ({
    id: uid(), date: today(), hour: '', equipe1: '', equipe2: '', lieu: VILLES[0],
    competition: 'Détection', type: 'live', statut: 'planifie', scouts: [],
  });

  return (
    <AdminContext.Provider value={{
      players, setPlayers, matches, setMatches, scouts, setScouts,
      curScout, setCurScout, scout, isAdmin,
      updatePlayer, createPlayer, deletePlayer, restorePlayer, updateMatch, createMatch, deleteMatch,
      lr, avg, getDec, reportsForPlayer, allReports, reportCount,
      blank, blankR, blankMatch,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
