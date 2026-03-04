import Tag from '../Tag';
import Radar from '../Radar';
import BarLine from '../BarLine';
import NotesPanel from '../NotesPanel';
import ReportModal from '../modals/ReportModal';
import { CATS, DECISIONS, LISTES, getSc } from '../config';
import type { Player, Match, Scout, Rapport, Ratings, DecisionItem } from '../config';

interface DetailPageProps {
  sel: Player;
  players: Player[];
  matches: Match[];
  isAdmin: boolean;
  tab: string;
  setTab: (t: string) => void;
  setView: (v: string) => void;
  setForm: (p: Player) => void;
  showR: boolean;
  setShowR: (v: boolean) => void;
  rForm: Rapport | null;
  setRForm: React.Dispatch<React.SetStateAction<Rapport | null>>;
  openR: string | null;
  setOpenR: (id: string | null) => void;
  pendingMatches: Match[];
  scout: Scout | undefined;
  addNote: (text: string) => void;
  toggleListe: (liste: string) => void;
  allReports: (p: Player) => Rapport[];
  reportsForPlayer: (p: Player) => Rapport[];
  reportCount: (p: Player) => number;
  lr: (p: Player) => Rapport | undefined;
  avg: (r: Ratings) => number;
  getDec: (p: Player) => DecisionItem | null;
  blankR: (matchId?: string) => Rapport;
  onSaveReport: () => void;
  onDelete: (id: string) => void;
}

export default function DetailPage({
  sel, matches, isAdmin, tab, setTab, setView, setForm,
  showR, setShowR, rForm, setRForm, openR, setOpenR,
  pendingMatches, scout, addNote, toggleListe,
  allReports, reportsForPlayer, reportCount, lr, avg, getDec, blankR, onSaveReport, onDelete,
}: DetailPageProps) {
  const r = lr(sel);
  const d = r ? DECISIONS.find(x => x.v === r.decision) : null;
  const visibleReports = isAdmin ? allReports(sel) : reportsForPlayer(sel);

  return (
    <div className="fu" style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 60px' }}>
      <button className="btn-g" style={{ padding: '8px 14px', fontSize: 12, marginBottom: 16 }} onClick={() => setView('list')}>← Liste</button>

      {/* Header */}
      <div className="card" style={{ padding: 26, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 100, height: 100, borderRadius: 20, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(145deg,var(--blueP),#f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--border)', boxShadow: 'var(--sh)' }}>
            {sel.photo ? <img src={sel.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40, opacity: .2 }}>👤</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--navy)' }}>{sel.nom.toUpperCase()} <span style={{ fontWeight: 500, color: 'var(--t2)' }}>{sel.prenom}</span></h2>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', background: 'var(--blueG)', padding: '3px 10px', borderRadius: 8, fontFamily: 'var(--m)' }}>{reportCount(sel)} rapport{reportCount(sel) > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
              <Tag color="var(--blue)" bg="var(--blueG)">{sel.poste}</Tag>
              {sel.posteSecondaire && <Tag>{sel.posteSecondaire}</Tag>}
              <Tag>{sel.ville}</Tag>
              <Tag>{sel.pied}</Tag>
              {sel.dateNaissance && <Tag>🎂 {sel.dateNaissance}</Tag>}
              {sel.taille && <Tag>📏 {sel.taille}cm</Tag>}
              {sel.poids && <Tag>⚖️ {sel.poids}kg</Tag>}
            </div>
            {(sel.agent || sel.finContrat || sel.valeur || sel.clubActuel) && (
              <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                {sel.clubActuel && <Tag color="#0f766e" bg="#f0fdfa">🏟 {sel.clubActuel}</Tag>}
                {sel.agent && <Tag color="#9333ea" bg="#faf5ff">🤝 {sel.agent}</Tag>}
                {sel.finContrat && <Tag color="#d97706" bg="#fffbeb">📄 Fin: {sel.finContrat}</Tag>}
                {sel.valeur && <Tag color="#16a34a" bg="#f0fdf4">💰 {sel.valeur}</Tag>}
              </div>
            )}
            {sel.pieceIdentite && <div style={{ marginTop: 8 }}><Tag color="#16a34a" bg="#f0fdf4">✓ Pièce d&apos;identité</Tag></div>}
            {d && <div style={{ marginTop: 8 }}><Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag></div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn-g" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => { setForm({ ...sel }); setView('form'); }}>✏️ Modifier</button>
              <button className="btn-p" style={{ padding: '8px 18px', fontSize: 12 }} onClick={() => { setRForm(blankR()); setShowR(true); }}>📋 Nouveau rapport</button>
              <button className="btn-g" style={{ padding: '8px 14px', fontSize: 12, color: '#dc2626' }} onClick={() => onDelete(sel.id)}>🗑</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {['profil', 'rapports', 'notes', 'listes'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t === 'profil' ? 'Profil' : t === 'rapports' ? `Rapports (${visibleReports.length})` : t === 'notes' ? 'Notes' : 'Listes'}
          </button>
        ))}
      </div>

      {/* PROFIL */}
      {tab === 'profil' && r && (
        <div className="fu" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
            <div className="lbl" style={{ marginBottom: 10 }}>Dernier rapport · {r.date} · par {r.scoutNom}</div>
            <Radar ratings={r.ratings} size={190} />
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--m)', color: 'var(--navy)' }}>{avg(r.ratings).toFixed(1)}</span>
              <span style={{ fontSize: 14, color: 'var(--t3)' }}>/6</span>
            </div>
            {r.locked && <Tag color="#16a34a" bg="#f0fdf4">🔒 Rapport verrouillé</Tag>}
          </div>
          <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 20 }}>
              {CATS.map(cat => {
                const v = r.ratings[cat.key];
                const s = getSc(v);
                return (
                  <div key={cat.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{cat.icon} {cat.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: s.c, padding: '2px 8px', borderRadius: 6, background: s.bg }}>{s.l}</span>
                    </div>
                    <BarLine v={v} />
                    {r.commentaires[cat.key] && <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, fontStyle: 'italic' }}>« {r.commentaires[cat.key]} »</p>}
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                <div><div className="lbl">Niveau actuel</div><div style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>{r.niveauActuel}</div></div>
                <div><div className="lbl">Potentiel</div><div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{r.potentiel}</div></div>
              </div>
              {r.conclusion && <><div className="lbl">Conclusion</div><p style={{ margin: 0, fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{r.conclusion}</p></>}
            </div>
            {sel.historique && (
              <div className="card" style={{ padding: 18 }}>
                <div className="lbl">Parcours / Clubs précédents</div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{sel.historique}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'profil' && !r && <div style={{ textAlign: 'center', padding: 50, color: 'var(--t3)' }}>Aucun rapport. Créez le premier.</div>}

      {/* RAPPORTS */}
      {tab === 'rapports' && (
        <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!isAdmin && <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 10, fontSize: 12, color: '#92400e', marginBottom: 8 }}>⚠️ Vous voyez uniquement vos rapports. L&apos;admin voit tous les rapports.</div>}
          {visibleReports.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>Aucun rapport visible.</div>
            : visibleReports.map(rp => {
              const dec = DECISIONS.find(x => x.v === rp.decision);
              const a = avg(rp.ratings);
              const open = openR === rp.id;
              const match = rp.matchId ? matches.find(m => m.id === rp.matchId) : null;
              return (
                <div key={rp.id} className="card" style={{ padding: open ? 20 : 14, cursor: 'pointer', borderColor: open ? 'var(--blueL)' : undefined }} onClick={() => setOpenR(open ? null : rp.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--m)', color: 'var(--blue)' }}>{rp.date}</span>
                      <Tag>{rp.lieu}</Tag>
                      <Tag color="#9333ea" bg="#faf5ff">✍ {rp.scoutNom}</Tag>
                      {match && <Tag color="#0f766e" bg="#f0fdfa">{match.equipe1} vs {match.equipe2}</Tag>}
                      {rp.locked && <Tag color="#16a34a" bg="#f0fdf4">🔒</Tag>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {dec && <Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--m)', color: a >= 5 ? '#16a34a' : a >= 3.5 ? '#d97706' : '#dc2626' }}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="fu" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      {rp.contexte && <p style={{ fontSize: 11, color: 'var(--t3)', margin: '0 0 10px' }}>📍 {rp.contexte}{rp.minutesJouees ? ` · ${rp.minutesJouees} min` : ''}</p>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        {CATS.map(cat => {
                          const v = rp.ratings[cat.key];
                          const s = getSc(v);
                          return (
                            <div key={cat.key}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: 'var(--t2)' }}>{cat.icon} {cat.label}</span>
                                <span style={{ color: s.c, fontWeight: 700, fontFamily: 'var(--m)' }}>{v}</span>
                              </div>
                              <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                                <div style={{ height: '100%', borderRadius: 2, width: `${(v / 6) * 100}%`, background: s.c }} />
                              </div>
                              {rp.commentaires[cat.key] && <p style={{ fontSize: 10, color: 'var(--t3)', margin: '4px 0 0', fontStyle: 'italic' }}>« {rp.commentaires[cat.key]} »</p>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 8 }}>
                        <span style={{ color: '#d97706', fontWeight: 600 }}>Niveau: {rp.niveauActuel}</span>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Potentiel: {rp.potentiel}</span>
                      </div>
                      {rp.conclusion && <p style={{ fontSize: 12, color: 'var(--t2)', margin: 0, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{rp.conclusion}</p>}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {tab === 'notes' && <NotesPanel notes={sel.notes ?? []} onAdd={addNote} />}

      {tab === 'listes' && (
        <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LISTES.map(l => {
            const has = (sel.listes ?? []).includes(l);
            return (
              <div
                key={l}
                className="card card-click"
                onClick={() => toggleListe(l)}
                style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: has ? 'var(--blueL)' : undefined, background: has ? 'var(--blueG)' : undefined }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: has ? 'var(--blue)' : 'var(--t2)' }}>{l}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: has ? '#f0fdf4' : '#f8fafc', border: `2px solid ${has ? '#16a34a' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: has ? '#16a34a' : '#cbd5e1', fontSize: 14, fontWeight: 700 }}>{has ? '✓' : '+'}</div>
              </div>
            );
          })}
        </div>
      )}

      {showR && rForm && (
        <ReportModal
          rForm={rForm}
          setRForm={setRForm}
          sel={sel}
          scout={scout}
          pendingMatches={pendingMatches}
          onSave={onSaveReport}
          onClose={() => { setShowR(false); setRForm(null); }}
        />
      )}
    </div>
  );
}
