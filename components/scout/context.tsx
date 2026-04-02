'use client';
import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { uid, today, CATS, VILLES, NIVEAUX } from './config';

interface ScoutUser { id: string; firstName: string; lastName: string; role: string; }

export interface ScoutContextValue {
  players: any[];
  setPlayers: Dispatch<SetStateAction<any[]>>;
  scoutNom: string;
  /* CRUD */
  updatePlayer: (player: any) => Promise<void>;
  createPlayer: (player: any) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  /* Helpers */
  lr: (p: any) => any;
  avg: (r: any) => number;
  getDec: (p: any) => any;
  blank: () => any;
  blankR: (sel: any) => any;
}

const ScoutContext = createContext<ScoutContextValue | null>(null);

export function useScoutData(): ScoutContextValue {
  const ctx = useContext(ScoutContext);
  if (!ctx) throw new Error('useScoutData must be inside ScoutDataProvider');
  return ctx;
}

export function ScoutDataProvider({ initialUser, children }: { initialUser: ScoutUser; children: ReactNode }) {
  const [players, setPlayers] = useState<any[]>([]);
  const scoutNom = [initialUser.firstName, initialUser.lastName].filter(Boolean).join(' ');

  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(d => { if (Array.isArray(d)) setPlayers(d); }).catch(() => {});
  }, []);

  const updatePlayer = async (player: any) => {
    const res = await fetch(`/api/players/${player.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(player) }).catch(console.error);
    if (!res?.ok) return;
    const saved = await res.json();
    setPlayers(prev => prev.map((p: any) => p.id === player.id ? saved : p));
  };
  const createPlayer = async (player: any) => {
    const res = await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(player) }).catch(console.error);
    if (!res?.ok) return;
    const created = await res.json();
    setPlayers(prev => [...prev, created]);
  };
  const deletePlayer = async (id: string) => {
    await fetch(`/api/players/${id}`, { method: 'DELETE' }).catch(console.error);
    setPlayers(prev => prev.filter((p: any) => p.id !== id));
  };

  const lr = (p: any) => (p.rapports || [])[0];
  const avg = (r: any) => r ? CATS.reduce((s: number, c: any) => s + (r[c.key] || 1), 0) / CATS.length : 0;
  const getDec = (p: any) => {
    const r = lr(p);
    if (!r) return null;
    return ({
      sans_interet: { c: '#dc2626', bg: '#fef2f2', i: '✕', l: 'Sans intérêt' },
      revoir_detection: { c: '#d97706', bg: '#fffbeb', i: '◉', l: 'À revoir' },
      revoir_essai: { c: '#ca8a04', bg: '#fefce8', i: '↻', l: 'À l\'essai' },
      retenu_academie: { c: '#16a34a', bg: '#f0fdf4', i: '✓', l: 'Retenu' },
      test_europe: { c: '#2563eb', bg: '#eff6ff', i: '✈', l: 'Europe' },
      signer: { c: '#9333ea', bg: '#faf5ff', i: '★', l: 'À signer' },
    } as any)[r.decision] || null;
  };

  const blank = () => ({
    id: uid(), firstName: '', lastName: '', dateNaissance: '',
    ville: VILLES[0], poste: 'Gardien', posteSecondaire: '',
    pied: 'Droitier', taille: '', poids: '',
    photo: '', photos: [], profilePhoto: '', nationalite: '', pieceIdentite: '',
    clubActuel: '', phone: '',
    rapports: [], notes: [], listes: [], createdAt: today(),
  });
  const blankR = (sel: any) => ({
    id: uid(), date: today(), lieu: sel?.ville || VILLES[0],
    contexte: '', minutesJouees: '',
    ratings: { physique: 3, technique: 3, tactique: 3, mentalite: 3 },
    commentaires: { physique: '', technique: '', tactique: '', mentalite: '' },
    conclusion: '', niveauActuel: NIVEAUX[1], potentiel: NIVEAUX[2],
    decision: 'revoir_detection', scoutName: scoutNom,
  });

  return (
    <ScoutContext.Provider value={{ players, setPlayers, scoutNom, updatePlayer, createPlayer, deletePlayer, lr, avg, getDec, blank, blankR }}>
      {children}
    </ScoutContext.Provider>
  );
}
