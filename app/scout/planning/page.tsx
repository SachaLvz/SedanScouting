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
      <div key={m.id} style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
        borderRadius: 14, background: isPast ? '#fff' : 'var(--blue-ghost)',
        border: `1.5px solid ${isPast ? 'var(--border)' : 'var(--blue-light)'}`,
        opacity: isPast ? 0.7 : 1,
      }}>
        {/* Date/heure */}
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 52 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--mono)' }}>
            {m.date ? m.date.split('-').slice(1).reverse().join('/') : '—'}
          </div>
          {m.hour && (
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', marginTop: 1 }}>{m.hour}</div>
          )}
        </div>

        <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

        {/* Match info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 3 }}>
            {m.equipe1} <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>vs</span> {m.equipe2}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {m.lieu && <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>📍 {m.lieu}</span>}
            {m.competition && <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>🏆 {m.competition}</span>}
            {m.type && <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>· {m.type === 'live' ? '🏟 Live' : '📹 Vidéo'}</span>}
          </div>
        </div>

        {isPast && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>
            ✓ Vu
          </span>
        )}
      </div>
    );
  };

  if (loading) return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>Mon planning</h2>
        <button
          className="glow-btn"
          style={{ padding: '8px 16px', fontSize: 12 }}
          onClick={() => { setMatchForm(blankMatch(scoutId)); setShowForm(true); }}
        >
          + Ajouter un match
        </button>
      </div>

      {/* À venir */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
          À venir · {upcoming.length}
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)', fontSize: 13 }}>
            Aucun match planifié. Cliquez sur "+ Ajouter un match" pour en programmer un.
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
