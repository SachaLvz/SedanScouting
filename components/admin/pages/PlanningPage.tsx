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
const formatMatchDate = (date: string) => {
  if (!date) return '—';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

export default function PlanningPage() {
  const { matches, scouts, curScout, blankMatch, createMatch, updateMatch, deleteMatch } = useAdminData();
  const [filterScout, setFilterScout] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [matchForm, setMatchForm] = useState<Match | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const scoutList = scouts;
  const colorOf = (id: string) => SCOUT_COLORS[scoutList.findIndex(s => s.id === id) % SCOUT_COLORS.length] ?? SCOUT_COLORS[0];

  const saveMatch = async () => {
    if (!matchForm) return;
    const withCreator = {
      ...matchForm,
      scouts: Array.from(new Set([...(matchForm.scouts ?? []), curScout].filter(Boolean))),
    };
    if (editingMatchId) {
      await updateMatch(withCreator);
    } else {
      await createMatch(withCreator);
    }
    setShowForm(false);
    setMatchForm(null);
    setEditingMatchId(null);
  };

  const toggleStatut = async (m: Match) => {
    await updateMatch({ ...m, statut: m.statut === 'planifie' ? 'termine' : 'planifie' });
  };

  const filtered = filterScout === 'all'
    ? matches
    : matches.filter(m => (m.scouts ?? []).includes(filterScout));

  const todayDate = new Date().toISOString().slice(0, 10);
  const isPastByDate = (m: Match) => Boolean(m.date) && m.date < todayDate;

  const upcoming = filtered
    .filter(m => m.statut === 'planifie' && !isPastByDate(m))
    .sort((a, b) => a.date.localeCompare(b.date));
  const done = filtered
    .filter(m => m.statut === 'termine' || isPastByDate(m))
    .sort((a, b) => b.date.localeCompare(a.date));

  type MatchGroup = {
    id: string;
    date: string;
    hour: string;
    statut: string;
    matches: Match[];
    scouts: string[];
  };

  const combineMatches = (list: Match[]): MatchGroup[] => {
    const groups: MatchGroup[] = [];
    for (const m of list) {
      const scoutsForMatch = m.scouts ?? [];
      const idx = groups.findIndex(g => {
        if (g.date !== m.date || g.hour !== m.hour) return false;
        const gLieu = (g.matches[0]?.lieu ?? '').trim().toLowerCase();
        const mLieu = (m.lieu ?? '').trim().toLowerCase();
        if (gLieu !== mLieu) return false;
        return true;
      });

      if (idx === -1) {
        groups.push({
          id: m.id,
          date: m.date,
          hour: m.hour,
          statut: m.statut,
          matches: [m],
          scouts: Array.from(new Set(scoutsForMatch)),
        });
      } else {
        const g = groups[idx];
        g.matches.push(m);
        g.scouts = Array.from(new Set([...g.scouts, ...scoutsForMatch]));
      }
    }
    return groups;
  };

  const upcomingGroups = combineMatches(upcoming);
  const doneGroups = combineMatches(done);

  const renderScoutChips = (attendees: string[], showName = true) => {
    if (attendees.length === 0) {
      return <span className="text-[11px] text-[#cbd5e1] italic pr-1">—</span>;
    }
    return (
      <div className="flex gap-1 flex-wrap sm:justify-end max-w-full sm:max-w-[240px]">
        {attendees.map(id => {
          const c = colorOf(id);
          const scout = scoutList.find(s => s.id === id);
          const isFiltered = filterScout === id;
          return (
            <div
              key={id}
              title={[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}
              onClick={(e) => { e.stopPropagation(); setFilterScout(filterScout === id ? 'all' : id); }}
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
              {showName ? (
                <span className="hidden sm:inline text-[11px] font-bold whitespace-nowrap max-w-[132px] truncate" style={{ color: isFiltered ? '#fff' : c.color }}>
                  {[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}
                </span>
              ) : (
                <span className="text-[10px] font-extrabold" style={{ color: isFiltered ? '#fff' : c.color }}>
                  {scout ? initials(scout.lastName, scout.firstName) : '?'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const toggleGroupStatut = async (group: MatchGroup) => {
    await Promise.all(group.matches.map(m => updateMatch({ ...m, statut: m.statut === 'planifie' ? 'termine' : 'planifie' })));
  };

  const renderMatch = (group: MatchGroup) => {
    const attendees = group.scouts.filter(id => scoutList.find(s => s.id === id));
    const isPast = group.statut === 'termine';
    const isCombined = group.matches.length > 1;
    const isOpen = !!openGroups[group.id];

    return (
      <div
        key={group.id}
        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5 sm:px-[18px] rounded-2xl bg-white border-[1.5px]"
        style={{ borderColor: isPast ? '#e2e8f0' : attendees.length > 0 ? '#bfdbfe' : '#e2e8f0', opacity: isPast ? 0.65 : 1 }}
        onClick={() => {
          if (!isCombined) return;
          setOpenGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }));
        }}
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Date/heure */}
          <div className="shrink-0 text-center min-w-[52px]">
            <div className="text-sm font-extrabold text-[#0c2340] font-mono leading-none">
              {formatMatchDate(group.date)}
            </div>
            {group.hour && (
              <div className="text-[11px] font-semibold text-[#1e6cb6] mt-[3px]">{group.hour}</div>
            )}
          </div>

          <div className="hidden sm:block w-px h-10 bg-[#e2e8f0] shrink-0" />

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
                <div className="text-[13px] font-bold text-[#0c2340] mb-1">
                  {group.matches[0].equipe1} <span className="text-[#94a3b8] font-normal text-[11px]">vs</span> {group.matches[0].equipe2}
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {group.matches[0].lieu && <span className="text-[10px] text-[#94a3b8]">📍 {group.matches[0].lieu}</span>}
                  {group.matches[0].competition && <span className="text-[10px] text-[#94a3b8]">🏆 {group.matches[0].competition}</span>}
                  {group.matches[0].type && <span className="text-[10px] text-[#94a3b8]">{group.matches[0].type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {renderScoutChips(attendees, true)}
        </div>

        {isCombined && isOpen && (
          <div className="w-full sm:basis-full border-t border-[#e2e8f0] pt-2.5">
            <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Détails des matchs du créneau</div>
            <div className="flex flex-col gap-1.5">
              {group.matches.map(mm => (
                <div key={mm.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-bold text-[#0c2340]">{mm.equipe1} <span className="text-[#94a3b8] font-medium">vs</span> {mm.equipe2}</div>
                    {mm.statut !== 'termine' && (
                      <button
                        className="btn-g px-2 py-1 text-[10px] font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMatchId(mm.id);
                          setMatchForm({ ...mm });
                          setShowForm(true);
                        }}
                      >
                        ✏️ Modifier
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">
                    {[mm.lieu && `📍 ${mm.lieu}`, mm.competition && `🏆 ${mm.competition}`, mm.type && (mm.type === 'live' ? '🏟 Live' : '📹 Vidéo')].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2">
          {!isPast && group.matches.length === 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingMatchId(group.matches[0].id);
                setMatchForm({ ...group.matches[0] });
                setShowForm(true);
              }}
              className="btn-g px-[11px] py-[5px] text-[10px] font-bold"
            >
              ✏️ Modifier
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleGroupStatut(group); }}
            className="shrink-0 px-[11px] py-[5px] rounded-lg text-[10px] font-bold border-none cursor-pointer"
            style={{
              background: isPast ? '#f0fdf4' : '#fffbeb',
              color: isPast ? '#16a34a' : '#d97706',
            }}
          >
            {isPast ? '✓ Terminé' : '⏳ Planifié'}
          </button>

          {confirmDelete === group.id ? (
            <div className="flex gap-1 items-center shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); group.matches.forEach(mm => deleteMatch(mm.id)); setConfirmDelete(null); }}
                className="px-2.5 py-[5px] rounded-lg bg-[#dc2626] text-white text-[10px] font-bold border-none cursor-pointer"
              >
                Confirmer
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                className="px-2 py-[5px] rounded-lg border border-[#e2e8f0] bg-white text-[#94a3b8] text-[10px] border-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(group.id); }}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-[#e2e8f0] bg-white text-[#cbd5e1] text-sm cursor-pointer hover:border-[#fca5a5] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fu max-w-[960px] mx-auto px-4 sm:px-5 pb-[60px]">

      {/* En-tête */}
      <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
        <h2 className="m-0 text-xl font-extrabold text-[#0c2340]">Planning</h2>
        <button
          className="btn-p px-[18px] py-2 text-xs"
          onClick={() => { setEditingMatchId(null); setMatchForm(blankMatch()); setShowForm(true); }}
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
              {matches.filter(m => m.statut === 'planifie' && !isPastByDate(m)).length}
            </span>
          </button>
          {scoutList.map(s => {
            const c = colorOf(s.id);
            const count = matches.filter(m => m.statut === 'planifie' && !isPastByDate(m) && (m.scouts ?? []).includes(s.id)).length;
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
          À venir · {upcomingGroups.length}
        </div>
        {upcomingGroups.length === 0 ? (
          <div className="text-center py-10 px-5 text-[#94a3b8] text-[13px]">
            {filterScout !== 'all' ? `${[scoutList.find(s => s.id === filterScout)?.firstName, scoutList.find(s => s.id === filterScout)?.lastName].filter(Boolean).join(' ')} n'a aucun match planifié.` : 'Aucun match à venir.'}
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
          people={scoutList}
          title={editingMatchId ? 'Modifier le match' : 'Programmer un match'}
          submitLabel={editingMatchId ? 'Enregistrer' : 'Programmer'}
          onSave={saveMatch}
          onClose={() => { setShowForm(false); setMatchForm(null); setEditingMatchId(null); }}
        />
      )}
    </div>
  );
}
