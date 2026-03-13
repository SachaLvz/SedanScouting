'use client';
import { useState, useEffect } from 'react';
import { useScoutData } from '@/components/scout/context';
import MatchFormModal from '@/components/admin/modals/MatchFormModal';

interface Match {
  id: string;
  date: string;
  hour: string;
  equipe1: string;
  equipe2: string;
  lieu: string;
  competition: string;
  type: string;
  statut: string;
  scouts: string[];
}

const getScoutId = (): string => {
  try { return JSON.parse(localStorage.getItem('mbarodi_user') ?? '{}').id ?? ''; }
  catch { return ''; }
};

const uid = () => Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split('T')[0];

const blankMatch = (scoutId: string): Match => ({
  id: uid(), date: today(), hour: '', equipe1: '', equipe2: '',
  lieu: 'Dakar', competition: '', type: 'live', statut: 'planifie',
  scouts: scoutId ? [scoutId] : [],
});

export default function ScoutPlanningPage() {
  const { scoutNom } = useScoutData();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [matchForm, setMatchForm] = useState<Match | null>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMatches(d); })
      .finally(() => setLoading(false));
  }, []);

  const saveMatch = async () => {
    if (!matchForm) return;
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchForm),
    }).catch(console.error);
    if (res) {
      const created = await (res as Response).json();
      setMatches(prev => [...prev, created]);
    }
    setShowForm(false);
    setMatchForm(null);
  };

  const scoutId = typeof window !== 'undefined' ? getScoutId() : '';

  // Seulement les matchs du scout
  const myMatches = matches.filter(m => (m.scouts ?? []).includes(scoutId));
  const upcoming = myMatches.filter(m => m.statut === 'planifie').sort((a, b) => a.date.localeCompare(b.date));
  const done = myMatches.filter(m => m.statut === 'termine').sort((a, b) => b.date.localeCompare(a.date));

  const renderMatch = (m: Match) => {
    const isPast = m.statut === 'termine';
    return (
      <div
        key={m.id}
        className="flex items-center gap-3.5 px-[18px] py-3.5 rounded-2xl border-[1.5px]"
        style={{
          background: isPast ? '#fff' : '#eef5fd',
          borderColor: isPast ? '#e2e8f0' : '#4a9de8',
          opacity: isPast ? 0.7 : 1,
        }}
      >
        {/* Date/heure */}
        <div className="shrink-0 text-center min-w-[52px]">
          <div className="text-[13px] font-extrabold text-[#0c2340] font-mono">
            {m.date ? m.date.split('-').slice(1).reverse().join('/') : '—'}
          </div>
          {m.hour && (
            <div className="text-[11px] font-semibold text-[#1e6cb6] mt-px">{m.hour}</div>
          )}
        </div>

        <div className="w-px h-9 bg-[#e2e8f0] shrink-0" />

        {/* Match info */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#0c2340] mb-[3px]">
            {m.equipe1} <span className="text-[#94a3b8] font-medium">vs</span> {m.equipe2}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {m.lieu && <span className="text-[10px] text-[#94a3b8] font-medium">📍 {m.lieu}</span>}
            {m.competition && <span className="text-[10px] text-[#94a3b8] font-medium">🏆 {m.competition}</span>}
            {m.type && <span className="text-[10px] text-[#94a3b8] font-medium">· {m.type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
          </div>
        </div>

        {isPast && (
          <span className="text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] rounded-[6px] px-2 py-[3px] shrink-0">
            ✓ Vu
          </span>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="max-w-[760px] mx-auto px-5 py-10 text-center text-[#94a3b8]">
      Chargement...
    </div>
  );

  return (
    <div className="max-w-[760px] mx-auto px-5 pb-[60px]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">Mon planning</h2>
        <button
          className="btn-p px-4 py-2 text-xs"
          onClick={() => { setMatchForm(blankMatch(scoutId)); setShowForm(true); }}
        >
          + Ajouter un match
        </button>
      </div>

      {/* À venir */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1.5px] mb-2.5">
          À venir · {upcoming.length}
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 px-5 text-[#94a3b8] text-[13px]">
            Aucun match planifié. Cliquez sur &quot;+ Ajouter un match&quot; pour en programmer un.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {upcoming.map(renderMatch)}
          </div>
        )}
      </div>

      {/* Passés */}
      {done.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1.5px] mb-2.5">
            Matchs passés · {done.length}
          </div>
          <div className="flex flex-col gap-1.5">
            {done.map(renderMatch)}
          </div>
        </div>
      )}

      {showForm && matchForm && (
        <MatchFormModal
          matchForm={matchForm}
          setMatchForm={setMatchForm}
          onSave={saveMatch}
          onClose={() => { setShowForm(false); setMatchForm(null); }}
        />
      )}
    </div>
  );
}
