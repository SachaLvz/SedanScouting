'use client';
import { useState } from 'react';
import { useAdminData } from '../context';
import MatchFormModal from '../modals/MatchFormModal';
import type { Match, Scout } from '../config';

const SCOUT_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  { bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  { bg: '#cffafe', color: '#155e75', border: '#67e8f9' },
];

const initials = (lastName: string, firstName?: string) => [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase();

export default function PlanningPage() {
  const { matches, scouts, blankMatch, createMatch, updateMatch } = useAdminData();
  const [filterScout, setFilterScout] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [matchForm, setMatchForm] = useState<Match | null>(null);

  const scoutList = scouts.filter(s => s.role === 'scout');
  const colorOf = (id: string) => SCOUT_COLORS[scoutList.findIndex(s => s.id === id) % SCOUT_COLORS.length] ?? SCOUT_COLORS[0];

  const saveMatch = async () => {
    if (!matchForm) return;
    await createMatch(matchForm);
    setShowForm(false);
    setMatchForm(null);
  };

  const toggleStatut = async (m: Match) => {
    await updateMatch({ ...m, statut: m.statut === 'planifie' ? 'termine' : 'planifie' });
  };

  const filtered = filterScout === 'all'
    ? matches
    : matches.filter(m => (m.scouts ?? []).includes(filterScout));

  const upcoming = filtered.filter(m => m.statut === 'planifie').sort((a, b) => a.date.localeCompare(b.date));
  const done = filtered.filter(m => m.statut === 'termine').sort((a, b) => b.date.localeCompare(a.date));

  const renderMatch = (m: Match) => {
    const attendees = (m.scouts ?? []).filter(id => scoutList.find(s => s.id === id));
    const isPast = m.statut === 'termine';

    return (
      <div
        key={m.id}
        className="flex items-center gap-3.5 px-[18px] py-4 rounded-2xl bg-white border-[1.5px]"
        style={{ borderColor: isPast ? '#e2e8f0' : attendees.length > 0 ? '#bfdbfe' : '#e2e8f0', opacity: isPast ? 0.65 : 1 }}
      >
        {/* Date/heure */}
        <div className="shrink-0 text-center min-w-[48px]">
          <div className="text-sm font-extrabold text-[#0c2340] font-mono leading-none">
            {m.date ? m.date.split('-').slice(1).reverse().join('/') : '—'}
          </div>
          {m.hour && (
            <div className="text-[11px] font-semibold text-[#1e6cb6] mt-[3px]">{m.hour}</div>
          )}
        </div>

        <div className="w-px h-10 bg-[#e2e8f0] shrink-0" />

        {/* Match info */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#0c2340] mb-1">
            {m.equipe1} <span className="text-[#94a3b8] font-normal text-[11px]">vs</span> {m.equipe2}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {m.lieu && <span className="text-[10px] text-[#94a3b8]">📍 {m.lieu}</span>}
            {m.competition && <span className="text-[10px] text-[#94a3b8]">🏆 {m.competition}</span>}
            {m.type && <span className="text-[10px] text-[#94a3b8]">{m.type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
          </div>
        </div>

        {/* Scouts — avatars */}
        <div className="flex items-center gap-1.5 shrink-0">
          {attendees.length === 0 ? (
            <span className="text-[11px] text-[#cbd5e1] italic pr-1">—</span>
          ) : (
            <div className="flex gap-1 flex-wrap justify-end max-w-[240px]">
              {attendees.map(id => {
                const c = colorOf(id);
                const scout = scoutList.find(s => s.id === id);
                const isFiltered = filterScout === id;
                return (
                  <div
                    key={id}
                    title={[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}
                    onClick={() => setFilterScout(filterScout === id ? 'all' : id)}
                    className="flex items-center gap-[5px] cursor-pointer px-2.5 py-1 rounded-[20px] border-[1.5px] transition-all duration-150"
                    style={{
                      background: isFiltered ? c.color : c.bg,
                      borderColor: isFiltered ? c.color : c.border,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                      style={{
                        background: isFiltered ? 'rgba(255,255,255,0.25)' : c.border,
                        color: isFiltered ? '#fff' : c.color,
                      }}
                    >
                      {scout ? initials(scout.lastName, scout.firstName) : '?'}
                    </div>
                    <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: isFiltered ? '#fff' : c.color }}>
                      {[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statut toggle */}
        <button
          onClick={() => toggleStatut(m)}
          className="shrink-0 px-[11px] py-[5px] rounded-lg text-[10px] font-bold border-none cursor-pointer"
          style={{
            background: isPast ? '#f0fdf4' : '#fffbeb',
            color: isPast ? '#16a34a' : '#d97706',
          }}
        >
          {isPast ? '✓ Terminé' : '⏳ Planifié'}
        </button>
      </div>
    );
  };

  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">

      {/* En-tête */}
      <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
        <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">Planning</h2>
        <button
          className="btn-p px-[18px] py-2 text-xs"
          onClick={() => { setMatchForm(blankMatch()); setShowForm(true); }}
        >
          + Programmer un match
        </button>
      </div>

      {/* Filtre scouts */}
      {scoutList.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterScout('all')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150"
            style={{
              borderColor: filterScout === 'all' ? '#1e6cb6' : '#e2e8f0',
              background: filterScout === 'all' ? '#eef5fd' : '#fff',
            }}
          >
            <span className="text-xs font-bold" style={{ color: filterScout === 'all' ? '#1e6cb6' : '#0c2340' }}>Tous</span>
            <span
              className="text-[10px] font-bold px-1.5 py-px rounded-[6px]"
              style={{ background: filterScout === 'all' ? '#1e6cb6' : '#f1f5f9', color: filterScout === 'all' ? '#fff' : '#94a3b8' }}
            >
              {matches.filter(m => m.statut === 'planifie').length}
            </span>
          </button>
          {scoutList.map(s => {
            const c = colorOf(s.id);
            const count = matches.filter(m => m.statut === 'planifie' && (m.scouts ?? []).includes(s.id)).length;
            const active = filterScout === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFilterScout(active ? 'all' : s.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150"
                style={{ borderColor: active ? c.color : c.border, background: active ? c.bg : '#fff' }}
              >
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-extrabold"
                  style={{ background: active ? c.color : c.border, color: active ? '#fff' : c.color }}
                >
                  {initials(s.lastName, s.firstName)}
                </div>
                <span className="text-xs font-bold" style={{ color: active ? c.color : '#0c2340' }}>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-px rounded-[6px]"
                  style={{ background: active ? c.color : '#f1f5f9', color: active ? '#fff' : '#94a3b8' }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* À venir */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1.5px] mb-2.5">
          À venir · {upcoming.length}
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 px-5 text-[#94a3b8] text-[13px]">
            {filterScout !== 'all' ? `${[scoutList.find(s => s.id === filterScout)?.firstName, scoutList.find(s => s.id === filterScout)?.lastName].filter(Boolean).join(' ')} n'a aucun match planifié.` : 'Aucun match à venir.'}
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
