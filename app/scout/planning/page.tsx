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
const formatMatchDate = (date: string) => {
  if (!date) return '—';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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
  const todayDate = new Date().toISOString().slice(0, 10);
  const isPastByDate = (m: Match) => Boolean(m.date) && m.date < todayDate;
  const upcoming = myMatches.filter(m => m.statut === 'planifie' && !isPastByDate(m)).sort((a, b) => a.date.localeCompare(b.date));
  const done = myMatches.filter(m => m.statut === 'termine' || isPastByDate(m)).sort((a, b) => b.date.localeCompare(a.date));

  type MatchGroup = {
    id: string;
    date: string;
    hour: string;
    statut: string;
    matches: Match[];
  };

  const combineMatches = (list: Match[]): MatchGroup[] => {
    const groups: MatchGroup[] = [];
    for (const m of list) {
      const idx = groups.findIndex(g => g.date === m.date && g.hour === m.hour);
      if (idx === -1) {
        groups.push({ id: m.id, date: m.date, hour: m.hour, statut: m.statut, matches: [m] });
      } else {
        groups[idx].matches.push(m);
      }
    }
    return groups;
  };

  const upcomingGroups = combineMatches(upcoming);
  const doneGroups = combineMatches(done);

  const renderMatch = (group: MatchGroup) => {
    const isPast = group.statut === 'termine';
    const isCombined = group.matches.length > 1;
    const isOpen = !!openGroups[group.id];
    return (
      <div
        key={group.id}
        className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5 sm:px-[18px] rounded-2xl border-[1.5px]"
        style={{
          background: isPast ? '#fff' : '#eef5fd',
          borderColor: isPast ? '#e2e8f0' : '#4a9de8',
          opacity: isPast ? 0.7 : 1,
        }}
        onClick={() => {
          if (!isCombined) return;
          setOpenGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }));
        }}
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Date/heure */}
          <div className="shrink-0 text-center min-w-[52px]">
            <div className="text-[13px] font-extrabold text-[#0c2340] font-mono">
              {formatMatchDate(group.date)}
            </div>
            {group.hour && (
              <div className="text-[11px] font-semibold text-[#1e6cb6] mt-px">{group.hour}</div>
            )}
          </div>

          <div className="hidden sm:block w-px h-9 bg-[#e2e8f0] shrink-0" />

          {/* Match info */}
          <div className="min-w-0 flex-1">
            {isCombined ? (
              <>
                <div className="text-[13px] font-bold text-[#0c2340] mb-1">{group.matches.length} matchs combinés</div>
                <div className="text-[11px] text-[#475569]">
                  {group.matches[0].equipe1} <span className="text-[#94a3b8]">vs</span> {group.matches[0].equipe2}
                  {group.matches.length > 1 && <span className="text-[#94a3b8]"> +{group.matches.length - 1} autre{group.matches.length - 1 > 1 ? 's' : ''}</span>}
                </div>
                <div className="mt-1 text-[10px] text-[#1e6cb6] font-semibold">{isOpen ? 'Voir moins' : 'Voir plus'}</div>
              </>
            ) : (
              <>
                <div className="text-[13px] font-bold text-[#0c2340] mb-[3px]">
                  {group.matches[0].equipe1} <span className="text-[#94a3b8] font-medium">vs</span> {group.matches[0].equipe2}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {group.matches[0].lieu && <span className="text-[10px] text-[#94a3b8] font-medium">📍 {group.matches[0].lieu}</span>}
                  {group.matches[0].competition && <span className="text-[10px] text-[#94a3b8] font-medium">🏆 {group.matches[0].competition}</span>}
                  {group.matches[0].type && <span className="text-[10px] text-[#94a3b8] font-medium">· {group.matches[0].type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {isCombined && isOpen && (
          <div className="w-full sm:basis-full border-t border-[#e2e8f0] pt-2.5">
            <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Détails des matchs du créneau</div>
            <div className="flex flex-col gap-1.5">
              {group.matches.map(mm => (
                <div key={mm.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2">
                  <div className="text-[12px] font-bold text-[#0c2340]">{mm.equipe1} <span className="text-[#94a3b8] font-medium">vs</span> {mm.equipe2}</div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">
                    {[mm.lieu && `📍 ${mm.lieu}`, mm.competition && `🏆 ${mm.competition}`, mm.type && (mm.type === 'live' ? '🏟 Live' : '📹 Vidéo')].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPast && (
          <span className="text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] rounded-[6px] px-2 py-[3px] shrink-0 ml-auto">
            ✓ Vu
          </span>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-5 py-10 text-center text-[#94a3b8]">
      Chargement...
    </div>
  );

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-5 pb-[60px]">
      <div className="flex justify-between items-start sm:items-center mb-5 gap-2.5 flex-wrap">
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
          À venir · {upcomingGroups.length}
        </div>
        {upcomingGroups.length === 0 ? (
          <div className="text-center py-10 px-5 text-[#94a3b8] text-[13px]">
            Aucun match planifié. Cliquez sur &quot;+ Ajouter un match&quot; pour en programmer un.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {upcomingGroups.map(renderMatch)}
          </div>
        )}
      </div>

      {/* Passés */}
      {done.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1.5px] mb-2.5">
            Matchs passés · {doneGroups.length}
          </div>
          <div className="flex flex-col gap-1.5">
            {doneGroups.map(renderMatch)}
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
