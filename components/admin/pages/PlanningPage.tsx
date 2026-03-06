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
      <div key={m.id} style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
        borderRadius: 14, background: '#fff',
        border: `1.5px solid ${isPast ? 'var(--border)' : attendees.length > 0 ? '#bfdbfe' : 'var(--border)'}`,
        opacity: isPast ? 0.65 : 1,
      }}>
        {/* Date/heure */}
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 48 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--mono)', lineHeight: 1 }}>
            {m.date ? m.date.split('-').slice(1).reverse().join('/') : '—'}
          </div>
          {m.hour && (
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', marginTop: 3 }}>{m.hour}</div>
          )}
        </div>

        <div style={{ width: 1, height: 40, background: 'var(--border)', flexShrink: 0 }} />

        {/* Match info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
            {m.equipe1} <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 11 }}>vs</span> {m.equipe2}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {m.lieu && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>📍 {m.lieu}</span>}
            {m.competition && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>🏆 {m.competition}</span>}
            {m.type && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
          </div>
        </div>

        {/* Scouts — avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {attendees.length === 0 ? (
            <span style={{ fontSize: 11, color: '#cbd5e1', fontStyle: 'italic', paddingRight: 4 }}>—</span>
          ) : (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 240 }}>
              {attendees.map(id => {
                const c = colorOf(id);
                const scout = scoutList.find(s => s.id === id);
                const isFiltered = filterScout === id;
                return (
                  <div
                    key={id}
                    title={[scout?.firstName, scout?.lastName].filter(Boolean).join(' ')}
                    onClick={() => setFilterScout(filterScout === id ? 'all' : id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                      padding: '4px 10px 4px 5px', borderRadius: 20,
                      background: isFiltered ? c.color : c.bg,
                      border: `1.5px solid ${isFiltered ? c.color : c.border}`,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: isFiltered ? 'rgba(255,255,255,0.25)' : c.border,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800,
                      color: isFiltered ? '#fff' : c.color,
                      flexShrink: 0,
                    }}>
                      {scout ? initials(scout.lastName, scout.firstName) : '?'}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isFiltered ? '#fff' : c.color, whiteSpace: 'nowrap' }}>
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
          style={{
            flexShrink: 0, padding: '5px 11px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            border: 'none', cursor: 'pointer',
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
    <div className="fu" style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>Planning</h2>
        <button
          className="btn-p"
          style={{ padding: '8px 18px', fontSize: 12 }}
          onClick={() => { setMatchForm(blankMatch()); setShowForm(true); }}
        >
          + Programmer un match
        </button>
      </div>

      {/* Filtre scouts — cartes avec compteur */}
      {scoutList.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterScout('all')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderRadius: 12, border: `1.5px solid ${filterScout === 'all' ? 'var(--blue)' : 'var(--border)'}`,
              background: filterScout === 'all' ? 'var(--blue-ghost)' : '#fff',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: filterScout === 'all' ? 'var(--blue)' : 'var(--navy)' }}>Tous</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: filterScout === 'all' ? 'var(--blue)' : '#f1f5f9', color: filterScout === 'all' ? '#fff' : 'var(--text-3)' }}>
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
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  borderRadius: 12, border: `1.5px solid ${active ? c.color : c.border}`,
                  background: active ? c.bg : '#fff',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: active ? c.color : c.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: active ? '#fff' : c.color,
                }}>
                  {initials(s.lastName, s.firstName)}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? c.color : 'var(--navy)' }}>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: active ? c.color : '#f1f5f9', color: active ? '#fff' : 'var(--text-3)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* À venir */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
          À venir · {upcoming.length}
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)', fontSize: 13 }}>
            {filterScout !== 'all' ? `${[scoutList.find(s => s.id === filterScout)?.firstName, scoutList.find(s => s.id === filterScout)?.lastName].filter(Boolean).join(' ')} n'a aucun match planifié.` : 'Aucun match à venir.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcoming.map(renderMatch)}
          </div>
        )}
      </div>

      {/* Passés */}
      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
            Matchs passés · {done.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
