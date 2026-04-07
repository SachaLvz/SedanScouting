import { useEffect, useState } from 'react';
import Tag from '../Tag';
import Radar from '../Radar';
import BarLine from '../BarLine';
import NotesPanel from '../NotesPanel';
import ReportModal from '../modals/ReportModal';
import { CATS, DECISIONS, LISTES, getProfilePhoto, getSc, normalizeDecision } from '../config';
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
  editingReportId: string | null;
  onStartNewReport: () => void;
  onCancelReportEdit: () => void;
  onSaveReport: () => void;
  onEditReport: (report: Rapport) => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onDelete: (id: string) => void;
  onUpdatePhone: (phone: string) => Promise<void>;
}

export default function DetailPage({
  sel, matches, isAdmin, tab, setTab, setView, setForm,
  showR, setShowR, rForm, setRForm, openR, setOpenR,
  pendingMatches, scout, addNote, toggleListe,
  allReports, reportsForPlayer, reportCount, lr, avg, getDec, blankR,
  editingReportId, onStartNewReport, onCancelReportEdit, onSaveReport, onEditReport, onDeleteReport, onDelete, onUpdatePhone,
}: DetailPageProps) {
  const r = lr(sel);
  const d = r ? DECISIONS.find(x => x.v === normalizeDecision(r.decision)) : null;
  const visibleReports = isAdmin ? allReports(sel) : reportsForPlayer(sel);
  const profilePhoto = getProfilePhoto(sel);
  const photos = Array.from(new Set((sel.photos ?? (sel.photo ? [sel.photo] : [])).filter(Boolean)));
  const [phone, setPhone] = useState(sel.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    setPhone(sel.phone || '');
  }, [sel.id, sel.phone]);

  const truncate = (text: string, max = 40) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

  return (
    <div className="fu max-w-[860px] mx-auto px-3 sm:px-5 pb-[60px]">
      <button className="btn-g px-3.5 py-2 text-xs mb-4" onClick={() => setView('list')}>← Liste</button>

      {/* Header */}
      <div className="card p-[26px] mb-4">
        <div className="flex gap-5 items-start flex-wrap">
          <div
            className="w-[100px] h-[100px] rounded-[20px] overflow-hidden shrink-0 flex items-center justify-center border-[3px] border-[#e2e8f0]"
            style={{ background: 'linear-gradient(145deg,#dbeafe,#f1f5f9)', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}
          >
            {profilePhoto ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" /> : <span className="text-[40px] opacity-20">👤</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="m-0 text-[26px] font-extrabold text-[#0c2340]">{sel.lastName.toUpperCase()} <span className="font-medium text-[#475569]">{sel.firstName}</span></h2>
              <span className="text-[11px] font-extrabold text-[#1e6cb6] bg-[#eef5fd] px-2.5 py-[3px] rounded-lg font-mono">{reportCount(sel)} rapport{reportCount(sel) > 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              <Tag color="#1e6cb6" bg="#eef5fd">{sel.poste}</Tag>
              {sel.posteSecondaire && <Tag>{sel.posteSecondaire}</Tag>}
              <Tag>{sel.ville}</Tag>
              <Tag>{sel.pied}</Tag>
              {sel.dateNaissance && <Tag>🎂 {sel.dateNaissance}</Tag>}
              {sel.taille && <Tag>📏 {sel.taille}cm</Tag>}
              {sel.poids && <Tag>⚖️ {sel.poids}kg</Tag>}
              {sel.nationalite && <Tag>🌍 {sel.nationalite}</Tag>}
            </div>
            {(sel.agent || sel.finContrat || sel.valeur || sel.clubActuel) && (
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {sel.clubActuel && <Tag color="#0f766e" bg="#f0fdfa">🏟 {sel.clubActuel}</Tag>}
                {sel.agent && <Tag color="#9333ea" bg="#faf5ff">🤝 {sel.agent}</Tag>}
                {sel.finContrat && <Tag color="#d97706" bg="#fffbeb">📄 Fin: {sel.finContrat}</Tag>}
                {sel.valeur && <Tag color="#16a34a" bg="#f0fdf4">💰 {sel.valeur}</Tag>}
              </div>
            )}
            {sel.pieceIdentite && <div className="mt-2"><a href={sel.pieceIdentite} target="_blank" rel="noreferrer"><Tag color="#16a34a" bg="#f0fdf4">✓ Pièce d&apos;identité</Tag></a></div>}
            {photos.length > 1 && (
              <div className="mt-2.5 flex gap-1.5 flex-wrap">
                {photos.map(url => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-lg overflow-hidden border border-[#e2e8f0]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
            {d && <div className="mt-2"><Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag></div>}
            <div className="flex gap-1.5 mt-3.5 flex-wrap">
              <button className="btn-g px-4 py-2 text-xs" onClick={() => { setForm({ ...sel }); setView('form'); }}>✏️ Modifier</button>
              <button className="btn-p px-[18px] py-2 text-xs" onClick={() => { onStartNewReport(); setRForm(blankR()); setShowR(true); }}>📋 Nouveau rapport</button>
              <button className="btn-g px-3.5 py-2 text-xs text-[#dc2626]" onClick={() => onDelete(sel.id)}>🗑</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 -mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex min-w-max border-b border-[#e2e8f0]">
          {['profil', 'rapports', 'notes', 'listes', 'contact'].map(t => (
            <button key={t} className={`tab px-3 sm:px-[18px] text-[11px] sm:text-xs ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
              {t === 'profil' ? 'Profil' : t === 'rapports' ? `Rapports (${visibleReports.length})` : t === 'notes' ? 'Notes' : t === 'listes' ? 'Listes' : 'Contact'}
            </button>
          ))}
        </div>
      </div>

      {/* PROFIL */}
      {tab === 'profil' && r && (
        <div className="fu flex flex-col lg:flex-row gap-3.5">
          <div className="card p-4 sm:p-[22px] flex flex-col items-center w-full lg:w-auto lg:shrink-0">
            <div className="lbl mb-2.5 text-center">Dernier rapport · {r.date} · par {r.scoutName}</div>
            <Radar ratings={r.ratings} size={170} />
            <div className="mt-1.5">
              <span className="text-[36px] font-extrabold font-mono text-[#0c2340]">{avg(r.ratings).toFixed(1)}</span>
              <span className="text-sm text-[#94a3b8]">/6</span>
            </div>
            {r.locked && <Tag color="#16a34a" bg="#f0fdf4">🔒 Rapport verrouillé</Tag>}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="card p-5">
              {CATS.map(cat => {
                const v = r.ratings[cat.key];
                const s = getSc(v);
                return (
                  <div key={cat.key} className="mb-3.5">
                    <div className="flex justify-between items-center gap-2 flex-wrap mb-[5px]">
                      <span className="text-[13px] font-semibold text-[#0f172a]">{cat.icon} {cat.label}</span>
                      <span className="text-[10px] font-bold px-2 py-px rounded-[6px]" style={{ color: s.c, background: s.bg }}>{s.l}</span>
                    </div>
                    <BarLine v={v} />
                    {r.commentaires[cat.key] && <p className="mt-[5px] mb-0 text-xs text-[#94a3b8] leading-relaxed italic">« {r.commentaires[cat.key]} »</p>}
                  </div>
                );
              })}
            </div>
            <div className="card p-[18px]">
              <div className="flex flex-wrap gap-5 mb-3">
                <div><div className="lbl">Niveau actuel</div><div className="text-sm font-bold text-[#d97706]">{r.niveauActuel}</div></div>
                <div><div className="lbl">Potentiel</div><div className="text-sm font-bold text-[#16a34a]">{r.potentiel}</div></div>
                {d && <div><div className="lbl">Décision</div><div className="text-sm font-bold" style={{ color: d.c }}>{d.i} {d.l}</div></div>}
              </div>
              {r.conclusion && <><div className="lbl">Conclusion</div><p className="m-0 text-[13px] text-[#475569] leading-[1.8] whitespace-pre-wrap">{r.conclusion}</p></>}
            </div>
            {sel.historique && (
              <div className="card p-[18px]">
                <div className="lbl">Parcours / Clubs précédents</div>
                <p className="mt-1.5 mb-0 text-[13px] text-[#475569] leading-[1.7] whitespace-pre-wrap">{sel.historique}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'profil' && !r && <div className="text-center py-[50px] text-[#94a3b8]">Aucun rapport. Créez le premier.</div>}

      {/* RAPPORTS */}
      {tab === 'rapports' && (
        <div className="fu flex flex-col gap-2">
          {!isAdmin && <div className="px-4 py-2.5 bg-[#fffbeb] rounded-[10px] text-xs text-[#92400e] mb-2">⚠️ Vous voyez uniquement vos rapports. L&apos;admin voit tous les rapports.</div>}
          {visibleReports.length === 0
            ? <div className="text-center py-10 text-[#94a3b8]">Aucun rapport visible.</div>
            : visibleReports.map(rp => {
              const dec = DECISIONS.find(x => x.v === normalizeDecision(rp.decision));
              const a = avg(rp.ratings);
              const open = openR === rp.id;
              const match = rp.matchId ? matches.find(m => m.id === rp.matchId) : null;
              const matchLabel = match ? `${truncate(match.equipe1, 18)} vs ${truncate(match.equipe2, 18)}` : '';
              return (
                <div
                  key={rp.id}
                  className="card cursor-pointer"
                  style={{ padding: open ? 16 : 12, borderColor: open ? '#4a9de8' : undefined }}
                  onClick={() => setOpenR(open ? null : rp.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-xs font-bold font-mono text-[#1e6cb6] shrink-0">{rp.date}</span>
                      <Tag>{rp.lieu}</Tag>
                      {rp.scoutName && <Tag color="#9333ea" bg="#faf5ff">✍ {rp.scoutName}</Tag>}
                      {match && <Tag color="#0f766e" bg="#f0fdfa">{matchLabel}</Tag>}
                      {rp.locked && <Tag color="#16a34a" bg="#f0fdf4">🔒</Tag>}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
                      {dec && <Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                      <span className="text-base font-extrabold font-mono shrink-0" style={{ color: a >= 5 ? '#16a34a' : a >= 3.5 ? '#d97706' : '#dc2626' }}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="fu mt-3.5 pt-3.5 border-t border-[#e2e8f0]">
                      <div className="flex sm:justify-end gap-2 mb-2">
                        <button
                          className="btn-g px-3 py-1.5 text-[11px] font-semibold"
                          onClick={(e) => { e.stopPropagation(); onEditReport(rp); }}
                        >
                          ✏️ Modifier ce rapport
                        </button>
                        <button
                          className="btn-g px-3 py-1.5 text-[11px] font-semibold text-[#dc2626]"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm('Supprimer ce rapport ?')) return;
                            await onDeleteReport(rp.id);
                          }}
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                      {rp.contexte && <p className="text-[11px] text-[#94a3b8] m-0 mb-2.5">📍 {rp.contexte}{rp.minutesJouees ? ` · ${rp.minutesJouees} min` : ''}</p>}
                      <div className="rep-grid">
                        {CATS.map(cat => {
                          const v = rp.ratings[cat.key];
                          const s = getSc(v);
                          return (
                            <div key={cat.key}>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-[#475569]">{cat.icon} {cat.label}</span>
                                <span className="font-bold font-mono" style={{ color: s.c }}>{v}</span>
                              </div>
                              <div className="h-1 bg-[#f1f5f9] rounded-sm">
                                <div className="h-full rounded-sm" style={{ width: `${(v / 6) * 100}%`, background: s.c }} />
                              </div>
                              {rp.commentaires[cat.key] && <p className="text-[10px] text-[#94a3b8] mt-1 mb-0 italic">« {rp.commentaires[cat.key]} »</p>}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] mb-2">
                        <span className="font-semibold text-[#d97706]">Niveau: {rp.niveauActuel}</span>
                        <span className="font-semibold text-[#16a34a]">Potentiel: {rp.potentiel}</span>
                        {dec && <span className="font-semibold" style={{ color: dec.c }}>Décision: {dec.i} {dec.l}</span>}
                      </div>
                      {rp.conclusion && <p className="text-xs text-[#475569] m-0 leading-[1.8] whitespace-pre-wrap">{rp.conclusion}</p>}
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
        <div className="fu flex flex-col gap-1.5">
          {LISTES.map(l => {
            const has = (sel.listes ?? []).includes(l);
            return (
              <div
                key={l}
                className="card card-click px-5 py-3.5 flex justify-between items-center"
                onClick={() => toggleListe(l)}
                style={{ borderColor: has ? '#4a9de8' : undefined, background: has ? '#eef5fd' : undefined }}
              >
                <span className="text-[13px] font-semibold" style={{ color: has ? '#1e6cb6' : '#475569' }}>{l}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border-2"
                  style={{ background: has ? '#f0fdf4' : '#f8fafc', borderColor: has ? '#16a34a' : '#e2e8f0', color: has ? '#16a34a' : '#cbd5e1' }}
                >
                  {has ? '✓' : '+'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'contact' && (
        <div className="card p-5 max-w-[460px]">
          <label className="lbl">Téléphone du joueur</label>
          <input
            className="inp"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
          />
          <div className="flex gap-2 mt-3">
            <button
              className="btn-p px-4 py-2 text-xs font-semibold"
              disabled={savingPhone}
              style={{ opacity: savingPhone ? 0.6 : 1 }}
              onClick={async () => {
                setSavingPhone(true);
                await onUpdatePhone(phone.trim());
                setSavingPhone(false);
              }}
            >
              {savingPhone ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            {phone.trim() && (
              <a className="btn-g px-4 py-2 text-xs font-semibold" href={`tel:${phone.trim()}`}>
                Appeler
              </a>
            )}
          </div>
        </div>
      )}

      {showR && rForm && (
        <ReportModal
          rForm={rForm}
          setRForm={setRForm}
          sel={sel}
          scout={scout}
          pendingMatches={pendingMatches}
          title={editingReportId ? 'Modifier le rapport' : 'Rapport de match'}
          submitLabel={editingReportId ? 'Enregistrer les modifications' : 'Valider'}
          onSave={onSaveReport}
          onClose={() => { onCancelReportEdit(); setShowR(false); setRForm(null); }}
        />
      )}
    </div>
  );
}
