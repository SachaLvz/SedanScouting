import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Tag from '../Tag';
import Radar from '../Radar';
import NotePicker from '../NotePicker';
import NotesPanel from '../NotesPanel';
import { CATS, DECISIONS, NIVEAUX, VILLES, LISTES, getProfilePhoto, getSc, normalizeDecision } from '../config';

/**
 * @param {Object} props
 * @param {any} props.sel
 * @param {string} props.tab
 * @param {Function} props.setTab
 * @param {boolean} props.showR
 * @param {Function} props.setShowR
 * @param {any} props.rForm
 * @param {Function} props.setRForm
 * @param {string|null} props.openR
 * @param {Function} props.setOpenR
 * @param {string} props.scoutNom
 * @param {string} props.currentScoutId
 * @param {Function} props.avg
 * @param {import('@/components/admin/config').Match[]} [props.matches]
 * @param {string|null} [props.editingReportId]
 * @param {Function} props.onBack
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {Function} props.onStartNewReport
 * @param {Function} props.onCancelReportEdit
 * @param {Function} props.onEditReport
 * @param {Function} props.onDeleteReport
 * @param {Function} props.onSaveReport
 * @param {Function} props.onAddNote
 * @param {Function} props.onToggleListe
 * @param {Function} props.onUpdatePhone
 */
export default function DetailPage({
  sel, tab, setTab,
  showR, setShowR, rForm, setRForm, openR, setOpenR,
  scoutNom, currentScoutId, avg, matches = [], editingReportId = null,
  onBack, onEdit, onDelete, onStartNewReport, onCancelReportEdit, onEditReport, onDeleteReport,
  onSaveReport, onAddNote, onToggleListe, onUpdatePhone,
}) {
  if (!sel) return null;
  const lr = (p) => (p.rapports || [])[0];
  const r = lr(sel);
  const d = r ? DECISIONS.find(x => x.v === normalizeDecision(r.decision)) : null;
  const profilePhoto = getProfilePhoto(sel);
  const photos = Array.from(new Set((sel.photos || (sel.photo ? [sel.photo] : [])).filter(Boolean)));
  const [phone, setPhone] = useState(sel.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    setPhone(sel.phone || '');
  }, [sel?.id, sel?.phone]);

  const closeReportModal = () => {
    onCancelReportEdit();
    setShowR(false);
    setRForm(null);
  };

  return (
    <div className="fu max-w-[860px] mx-auto px-5 pb-[60px]">
      <button className="btn-g px-3.5 py-2 text-xs mb-4" onClick={onBack}>← Liste</button>

      {/* Header */}
      <div className="card p-7 mb-4">
        <div className="flex gap-[22px] items-start flex-wrap">
          <div
            className="w-[110px] h-[110px] rounded-[22px] overflow-hidden shrink-0 flex items-center justify-center border-[3px] border-[#e2e8f0]"
            style={{ background: "linear-gradient(145deg, #dbeafe, #f1f5f9)", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}
          >
            {profilePhoto ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
              : <span className="text-[44px] opacity-20">👤</span>}
          </div>
          <div className="flex-1">
            <h2 className="m-0 text-[28px] font-extrabold text-[#0c2340] tracking-[-0.5px] leading-[1.2]">
              {(sel.lastName ?? '').toUpperCase()} <span className="font-medium text-[#475569]">{sel.firstName}</span>
            </h2>
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
              <button className="btn-g px-4 py-2 text-xs" onClick={onEdit}>✏️ Modifier</button>
              <button className="btn-p px-[18px] py-2 text-xs" onClick={onStartNewReport}>📋 Rapport</button>
              <button className="btn-g px-3.5 py-2 text-xs text-[#dc2626]" onClick={() => onDelete(sel.id)}>🗑</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 -mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex min-w-max border-b border-[#e2e8f0]">
          {["profil", "rapports", "notes", "listes", "contact"].map(t => (
            <button key={t} className={`tab px-3 sm:px-[18px] text-[11px] sm:text-xs ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
              {t === "profil" ? "Profil" : t === "rapports" ? `Rapports (${sel.rapports?.length || 0})` : t === "notes" ? "Notes" : t === "listes" ? "Listes" : "Contact"}
            </button>
          ))}
        </div>
      </div>

      {/* PROFIL */}
      {tab === "profil" && r && (
        <div className="relative">
          <div
            className="fu flex gap-4 flex-wrap"
            style={{
              filter: r.scoutName === scoutNom ? undefined : "blur(6px)",
              userSelect: r.scoutName === scoutNom ? undefined : "none",
              pointerEvents: r.scoutName === scoutNom ? undefined : "none",
            }}
          >
            <div className="card p-6 flex flex-col items-center shrink-0">
              <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[2px] mb-3">Dernier rapport · {r.date}</div>
              <Radar ratings={r.ratings} size={200} />
              <div className="mt-2">
                <span className="text-[38px] font-extrabold font-mono text-[#0c2340]">{avg(r.ratings).toFixed(1)}</span>
                <span className="text-base font-medium text-[#94a3b8]">/6</span>
              </div>
            </div>
            <div className="flex-1 min-w-[260px] flex flex-col gap-3">
              <div className="card p-[22px]">
                {CATS.map(cat => {
                  const v = r.ratings[cat.key]; const s = getSc(v);
                  return (
                    <div key={cat.key} className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] font-semibold text-[#0f172a]">{cat.icon} {cat.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-px rounded-[6px]" style={{ color: s.c, background: s.bg }}>{s.l}</span>
                          <span className="text-lg font-extrabold font-mono" style={{ color: s.c }}>{v}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#f1f5f9] rounded-[3px] overflow-hidden">
                        <div
                          className="h-full rounded-[3px] transition-[width] duration-500"
                          style={{ width: `${(v / 6) * 100}%`, background: `linear-gradient(90deg, ${s.c}88, ${s.c})` }}
                        />
                      </div>
                      {r.commentaires[cat.key] && (
                        <p className="mt-1.5 mb-0 text-xs text-[#94a3b8] leading-relaxed italic">« {r.commentaires[cat.key]} »</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="card p-5">
                <div className="flex gap-6 mb-3.5">
                  <div>
                    <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[1px] mb-[3px]">Niveau actuel</div>
                    <div className="text-sm font-bold text-[#d97706]">{r.niveauActuel}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[1px] mb-[3px]">Potentiel</div>
                    <div className="text-sm font-bold text-[#16a34a]">{r.potentiel}</div>
                  </div>
                </div>
                {r.conclusion && (
                  <>
                    <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[1px] mb-2">Conclusion</div>
                    <p className="m-0 text-[13px] text-[#475569] leading-[1.8] whitespace-pre-wrap">{r.conclusion}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          {r.scoutName !== scoutNom && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[28px] mb-1.5">🔒</div>
                <div className="text-[13px] font-bold text-[#475569]">Rapport confidentiel</div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "profil" && !r && (
        <div className="text-center py-[50px] text-[#94a3b8]">Aucun rapport. Créez le premier.</div>
      )}

      {/* RAPPORTS */}
      {tab === "rapports" && (
        <div className="fu flex flex-col gap-2">
          {(sel.rapports || []).length === 0
            ? <div className="text-center py-10 text-[#94a3b8]">Aucun rapport.</div>
            : (sel.rapports || []).map(rp => {
              const dec = DECISIONS.find(x => x.v === normalizeDecision(rp.decision));
              const a = avg(rp.ratings); const open = openR === rp.id;
              const isOwn = rp.scoutId === currentScoutId || rp.scoutName === scoutNom;
              return (
                <div key={rp.id} className="relative">
                  <div
                    className="card"
                    style={{
                      padding: open ? 20 : 16,
                      cursor: isOwn ? "pointer" : "default",
                      borderColor: open ? "#4a9de8" : undefined,
                      filter: isOwn ? undefined : "blur(6px)",
                      userSelect: isOwn ? undefined : "none",
                      pointerEvents: isOwn ? undefined : "none",
                    }}
                    onClick={() => isOwn && setOpenR(open ? null : rp.id)}
                  >
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#1e6cb6]">{rp.date}</span>
                        <Tag>{rp.lieu}</Tag>
                        {rp.scoutName && <Tag>✍ {rp.scoutName}</Tag>}
                      </div>
                      <div className="flex items-center gap-2">
                        {dec && <Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                        <span className="text-base font-extrabold font-mono" style={{ color: a >= 5 ? "#16a34a" : a >= 3.5 ? "#d97706" : "#dc2626" }}>{a.toFixed(1)}</span>
                      </div>
                    </div>
                    {open && (
                      <div className="fu mt-4 pt-4 border-t border-[#e2e8f0]">
                        <div className="flex justify-end gap-2 mb-2.5">
                          <button
                            className="btn-g px-3 py-1.5 text-[11px] font-semibold"
                            onClick={(e) => { e.stopPropagation(); onEditReport(rp); }}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            className="btn-g px-3 py-1.5 text-[11px] font-semibold text-[#dc2626]"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!window.confirm('Supprimer ce rapport ?')) return;
                              onDeleteReport(rp.id);
                            }}
                          >
                            🗑 Supprimer
                          </button>
                        </div>
                        {rp.contexte && <p className="text-[11px] text-[#94a3b8] m-0 mb-3">📍 {rp.contexte}{rp.minutesJouees ? ` · ${rp.minutesJouees} min` : ""}</p>}
                        <div className="rep-grid gap-3 mb-3.5">
                          {CATS.map(cat => {
                            const v = rp.ratings[cat.key]; const s = getSc(v);
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
                        <div className="flex gap-4 text-[11px] mb-2.5">
                          <span className="font-semibold text-[#d97706]">Niveau: {rp.niveauActuel}</span>
                          <span className="font-semibold text-[#16a34a]">Potentiel: {rp.potentiel}</span>
                        </div>
                        {rp.conclusion && <p className="text-xs text-[#475569] m-0 leading-[1.8] whitespace-pre-wrap">{rp.conclusion}</p>}
                      </div>
                    )}
                  </div>
                  {!isOwn && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                      <div className="text-center">
                        <div className="text-xl mb-1">🔒</div>
                        <div className="text-[11px] font-bold text-[#475569]">Rapport confidentiel</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* NOTES */}
      {tab === "notes" && <NotesPanel notes={sel.notes || []} onAdd={onAddNote} />}

      {/* LISTES */}
      {tab === "listes" && (
        <div className="fu flex flex-col gap-1.5">
          {LISTES.map(l => {
            const has = (sel.listes || []).includes(l);
            return (
              <div
                key={l}
                className="card card-click px-5 py-3.5 flex justify-between items-center"
                onClick={() => onToggleListe(l)}
                style={{ borderColor: has ? "#4a9de8" : undefined, background: has ? "#eef5fd" : undefined }}
              >
                <span className="text-[13px] font-semibold" style={{ color: has ? "#1e6cb6" : "#475569" }}>{l}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border-2"
                  style={{ background: has ? "#f0fdf4" : "#f8fafc", borderColor: has ? "#16a34a" : "#e2e8f0", color: has ? "#16a34a" : "#cbd5e1" }}
                >
                  {has ? "✓" : "+"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "contact" && (
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

      {/* RAPPORT MODAL */}
      {showR && rForm && createPortal(
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.5)] z-[1000] flex justify-center px-4 py-6 overflow-y-auto backdrop-blur-[6px]"
          onClick={e => { if (e.target === e.currentTarget) closeReportModal(); }}
        >
          <div className="card fu max-w-[620px] w-full p-[30px] self-start shadow-[0_12px_40px_rgba(15,23,42,0.1)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="m-0 text-[22px] font-extrabold text-[#0c2340]">{editingReportId ? 'Modifier le rapport' : 'Rapport de match'}</h3>
                <p className="mt-1 mb-0 text-xs text-[#94a3b8]">{(sel.lastName ?? '').toUpperCase()} {sel.firstName} · {sel.poste} · Scout: {scoutNom}</p>
              </div>
              <button className="btn-g px-2.5 py-1.5 text-base" onClick={closeReportModal}>✕</button>
            </div>

            {matches.length > 0 && (
              <div className="mb-4">
                <label className="lbl">Rattacher à un match</label>
                <select className="inp" value={rForm.matchId ?? ''} onChange={e => {
                  const m = matches.find(x => x.id === e.target.value);
                  setRForm(p => m
                    ? { ...p, matchId: m.id, date: m.date, lieu: m.lieu, contexte: `${m.equipe1} vs ${m.equipe2}${m.competition ? ' · ' + m.competition : ''}` }
                    : { ...p, matchId: '' });
                }}>
                  <option value="">— Rapport libre —</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>{m.date} · {m.equipe1} vs {m.equipe2}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="rep-grid gap-2.5 mb-4">
              <div><label className="lbl">Date *</label><input type="date" className="inp" value={rForm.date} onChange={e => setRForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="lbl">Lieu</label><select className="inp" value={rForm.lieu} onChange={e => setRForm(p => ({ ...p, lieu: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
              <div><label className="lbl">Minutes jouées</label><input type="number" className="inp" value={rForm.minutesJouees} onChange={e => setRForm(p => ({ ...p, minutesJouees: e.target.value }))} placeholder="90" /></div>
            </div>
            <div className="mb-5">
              <label className="lbl">Contexte</label>
              <input className="inp" value={rForm.contexte} onChange={e => setRForm(p => ({ ...p, contexte: e.target.value }))} placeholder="Ex: Amical Dakar FC vs Thiès United" />
            </div>

            {CATS.map(cat => (
              <div key={cat.key} className="bg-[#f8fafc] rounded-2xl p-[18px] mb-2.5 border border-[#f1f5f9]">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold text-[#0c2340]">{cat.icon} {cat.label}</span>
                  <span className="text-[10px] text-[#94a3b8] max-w-[200px] text-right">{cat.hint}</span>
                </div>
                <NotePicker value={rForm.ratings[cat.key]} onChange={v => setRForm(p => ({ ...p, ratings: { ...p.ratings, [cat.key]: v } }))} />
                <textarea
                  className="inp mt-2.5 h-14 resize-y bg-white"
                  value={rForm.commentaires[cat.key]}
                  onChange={e => setRForm(p => ({ ...p, commentaires: { ...p.commentaires, [cat.key]: e.target.value } }))}
                  placeholder={`Analyse ${cat.label.toLowerCase()}...`}
                />
              </div>
            ))}

            <div className="rep-grid gap-2.5 mb-4 mt-1.5">
              <div><label className="lbl">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e => setRForm(p => ({ ...p, niveauActuel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
              <div><label className="lbl">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e => setRForm(p => ({ ...p, potentiel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
            </div>

            <div className="mb-4">
              <label className="lbl" style={{ color: !rForm.conclusion ? "#dc2626" : undefined }}>Conclusion * (obligatoire)</label>
              <textarea
                className="inp resize-y h-[88px]"
                style={{ borderColor: !rForm.conclusion ? "#fca5a5" : undefined }}
                value={rForm.conclusion}
                onChange={e => setRForm(p => ({ ...p, conclusion: e.target.value }))}
                placeholder="Profil complet : points forts, faiblesses, projection..."
              />
            </div>

            <div className="mb-6">
              <label className="lbl text-[#dc2626]">Décision *</label>
              <div className="flex gap-[5px] flex-wrap">
                {DECISIONS.map(d => (
                  <button
                    key={d.v}
                    onClick={() => setRForm(p => ({ ...p, decision: d.v }))}
                    className="px-3.5 py-[9px] rounded-[10px] cursor-pointer text-[11px] font-bold transition-all duration-150 border-2"
                    style={{
                      borderColor: normalizeDecision(rForm.decision) === d.v ? d.c : 'transparent',
                      background: normalizeDecision(rForm.decision) === d.v ? d.bg : "#f8fafc",
                      color: normalizeDecision(rForm.decision) === d.v ? d.c : "#94a3b8",
                    }}
                  >
                    {d.i} {d.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="btn-g flex-1 py-3.5 text-sm font-semibold" onClick={closeReportModal}>Annuler</button>
              <button
                className={rForm.conclusion ? "btn-p flex-1 py-3.5 text-sm font-bold" : "btn-g flex-1 py-3.5 text-sm font-bold"}
                disabled={!rForm.conclusion}
                style={{ opacity: rForm.conclusion ? 1 : 0.4, cursor: rForm.conclusion ? "pointer" : "not-allowed" }}
                onClick={onSaveReport}
              >
                {editingReportId ? 'Enregistrer les modifications' : 'Valider le rapport'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
