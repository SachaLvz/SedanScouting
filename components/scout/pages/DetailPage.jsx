import Tag from '../Tag';
import Radar from '../Radar';
import NotePicker from '../NotePicker';
import NotesPanel from '../NotesPanel';
import { CATS, DECISIONS, NIVEAUX, VILLES, LISTES, getSc } from '../config';

export default function DetailPage({
  sel, tab, setTab,
  showR, setShowR, rForm, setRForm, openR, setOpenR,
  scoutNom, avg,
  onBack, onEdit, onDelete, onSaveReport, onAddNote, onToggleListe,
}) {
  if (!sel) return null;
  const lr = (p) => (p.rapports || [])[0];
  const r = lr(sel);
  const d = r ? DECISIONS.find(x => x.v === r.decision) : null;

  return (
    <div className="fade-up" style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 60px" }}>
      <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }} onClick={onBack}>← Liste</button>

      {/* Header */}
      <div className="card" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 110, height: 110, borderRadius: 22, overflow: "hidden", flexShrink: 0, background: "linear-gradient(145deg, var(--blue-pale), #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--border)", boxShadow: "var(--shadow)" }}>
            {sel.photo ? <img src={sel.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 44, opacity: 0.2 }}>👤</span>}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--navy)", letterSpacing: -0.5, lineHeight: 1.2 }}>
              {sel.nom.toUpperCase()} <span style={{ fontWeight: 500, color: "var(--text-2)" }}>{sel.prenom}</span>
            </h2>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <Tag color="var(--blue)" bg="var(--blue-ghost)">{sel.poste}</Tag>
              {sel.posteSecondaire && <Tag>{sel.posteSecondaire}</Tag>}
              <Tag>{sel.ville}</Tag>
              <Tag>{sel.pied}</Tag>
              {sel.dateNaissance && <Tag>🎂 {sel.dateNaissance}</Tag>}
              {sel.taille && <Tag>📏 {sel.taille}cm</Tag>}
              {sel.poids && <Tag>⚖️ {sel.poids}kg</Tag>}
            </div>
            {sel.pieceIdentite && <div style={{ marginTop: 8 }}><Tag color="#16a34a" bg="#f0fdf4">✓ Pièce d'identité</Tag></div>}
            {d && <div style={{ marginTop: 8 }}><Tag bg={d.bg} color={d.c}>{d.i} {d.l}</Tag></div>}
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              <button className="ghost-btn" style={{ padding: "8px 16px", fontSize: 12 }} onClick={onEdit}>✏️ Modifier</button>
              <button className="glow-btn" style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => setShowR(true)}>📋 Rapport</button>
              <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, color: "#dc2626" }} onClick={() => onDelete(sel.id)}>🗑</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {["profil", "rapports", "notes", "listes"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "profil" ? "Profil" : t === "rapports" ? `Rapports (${sel.rapports?.length || 0})` : t === "notes" ? "Notes" : "Listes"}
          </button>
        ))}
      </div>

      {/* PROFIL */}
      {tab === "profil" && r && (
        <div className="fade-up" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Dernier rapport · {r.date}</div>
            <Radar ratings={r.ratings} size={200} />
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--navy)" }}>{avg(r.ratings).toFixed(1)}</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-3)" }}>/6</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 22 }}>
              {CATS.map(cat => {
                const v = r.ratings[cat.key]; const s = getSc(v);
                return (
                  <div key={cat.key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{cat.icon} {cat.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: s.c, padding: "2px 8px", borderRadius: 6, background: s.bg }}>{s.l}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--mono)", color: s.c }}>{v}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${(v / 6) * 100}%`, background: `linear-gradient(90deg, ${s.c}88, ${s.c})`, transition: "width 0.5s ease" }} />
                    </div>
                    {r.commentaires[cat.key] && (
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, fontStyle: "italic" }}>« {r.commentaires[cat.key]} »</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Niveau actuel</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>{r.niveauActuel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Potentiel</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{r.potentiel}</div>
                </div>
              </div>
              {r.conclusion && (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Conclusion</div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{r.conclusion}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {tab === "profil" && !r && (
        <div style={{ textAlign: "center", padding: 50, color: "var(--text-3)" }}>Aucun rapport. Créez le premier.</div>
      )}

      {/* RAPPORTS */}
      {tab === "rapports" && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(sel.rapports || []).length === 0
            ? <div style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}>Aucun rapport.</div>
            : (sel.rapports || []).map(rp => {
              const dec = DECISIONS.find(x => x.v === rp.decision);
              const a = avg(rp.ratings); const open = openR === rp.id;
              return (
                <div key={rp.id} className="card" style={{ padding: open ? 20 : 16, cursor: "pointer", borderColor: open ? "var(--blue-light)" : undefined }}
                  onClick={() => setOpenR(open ? null : rp.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--blue)" }}>{rp.date}</span>
                      <Tag>{rp.lieu}</Tag>
                      {rp.scout && <Tag>✍ {rp.scout}</Tag>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {dec && <Tag bg={dec.bg} color={dec.c}>{dec.i} {dec.l}</Tag>}
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--mono)", color: a >= 5 ? "#16a34a" : a >= 3.5 ? "#d97706" : "#dc2626" }}>{a.toFixed(1)}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      {rp.contexte && <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 12px" }}>📍 {rp.contexte}{rp.minutesJouees ? ` · ${rp.minutesJouees} min` : ""}</p>}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                        {CATS.map(cat => {
                          const v = rp.ratings[cat.key]; const s = getSc(v);
                          return (
                            <div key={cat.key}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: "var(--text-2)" }}>{cat.icon} {cat.label}</span>
                                <span style={{ color: s.c, fontWeight: 700, fontFamily: "var(--mono)" }}>{v}</span>
                              </div>
                              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                                <div style={{ height: "100%", borderRadius: 2, width: `${(v / 6) * 100}%`, background: s.c }} />
                              </div>
                              {rp.commentaires[cat.key] && <p style={{ fontSize: 10, color: "var(--text-3)", margin: "4px 0 0", fontStyle: "italic" }}>« {rp.commentaires[cat.key]} »</p>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, marginBottom: 10 }}>
                        <span style={{ color: "#d97706", fontWeight: 600 }}>Niveau: {rp.niveauActuel}</span>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>Potentiel: {rp.potentiel}</span>
                      </div>
                      {rp.conclusion && <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{rp.conclusion}</p>}
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
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LISTES.map(l => {
            const has = (sel.listes || []).includes(l);
            return (
              <div key={l} className="card card-click" onClick={() => onToggleListe(l)}
                style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: has ? "var(--blue-light)" : undefined, background: has ? "var(--blue-ghost)" : undefined }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: has ? "var(--blue)" : "var(--text-2)" }}>{l}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: has ? "#f0fdf4" : "#f8fafc", border: `2px solid ${has ? "#16a34a" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", color: has ? "#16a34a" : "#cbd5e1", fontSize: 14, fontWeight: 700 }}>
                  {has ? "✓" : "+"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RAPPORT MODAL */}
      {showR && rForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", padding: "24px 16px", overflowY: "auto", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowR(false); setRForm(null); } }}>
          <div className="card fade-up" style={{ maxWidth: 620, width: "100%", padding: 30, alignSelf: "flex-start", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>Rapport de match</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-3)" }}>{sel.nom.toUpperCase()} {sel.prenom} · {sel.poste} · Scout: {scoutNom}</p>
              </div>
              <button className="ghost-btn" style={{ padding: "6px 10px", fontSize: 16 }} onClick={() => { setShowR(false); setRForm(null); }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div><label className="label">Date *</label><input type="date" className="inp" value={rForm.date} onChange={e => setRForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="label">Lieu</label><select className="inp" value={rForm.lieu} onChange={e => setRForm(p => ({ ...p, lieu: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
              <div><label className="label">Minutes jouées</label><input type="number" className="inp" value={rForm.minutesJouees} onChange={e => setRForm(p => ({ ...p, minutesJouees: e.target.value }))} placeholder="90" /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Contexte</label>
              <input className="inp" value={rForm.contexte} onChange={e => setRForm(p => ({ ...p, contexte: e.target.value }))} placeholder="Ex: Amical Dakar FC vs Thiès United" />
            </div>

            {CATS.map(cat => (
              <div key={cat.key} style={{ background: "#f8fafc", borderRadius: 14, padding: 18, marginBottom: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text-3)", maxWidth: 200, textAlign: "right" }}>{cat.hint}</span>
                </div>
                <NotePicker value={rForm.ratings[cat.key]} onChange={v => setRForm(p => ({ ...p, ratings: { ...p.ratings, [cat.key]: v } }))} />
                <textarea className="inp" style={{ marginTop: 10, height: 56, resize: "vertical", background: "white" }}
                  value={rForm.commentaires[cat.key]}
                  onChange={e => setRForm(p => ({ ...p, commentaires: { ...p.commentaires, [cat.key]: e.target.value } }))}
                  placeholder={`Analyse ${cat.label.toLowerCase()}...`} />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, marginTop: 6 }}>
              <div><label className="label">Niveau actuel</label><select className="inp" value={rForm.niveauActuel} onChange={e => setRForm(p => ({ ...p, niveauActuel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
              <div><label className="label">Potentiel</label><select className="inp" value={rForm.potentiel} onChange={e => setRForm(p => ({ ...p, potentiel: e.target.value }))}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label" style={{ color: !rForm.conclusion ? "#dc2626" : undefined }}>Conclusion * (obligatoire)</label>
              <textarea className="inp" style={{ height: 88, resize: "vertical", borderColor: !rForm.conclusion ? "#fca5a5" : undefined }}
                value={rForm.conclusion} onChange={e => setRForm(p => ({ ...p, conclusion: e.target.value }))}
                placeholder="Profil complet : points forts, faiblesses, projection..." />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label" style={{ color: "#dc2626" }}>Décision *</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {DECISIONS.map(d => (
                  <button key={d.v} onClick={() => setRForm(p => ({ ...p, decision: d.v }))} style={{
                    padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                    border: rForm.decision === d.v ? `2px solid ${d.c}` : "2px solid transparent",
                    background: rForm.decision === d.v ? d.bg : "#f8fafc",
                    color: rForm.decision === d.v ? d.c : "#94a3b8",
                    fontSize: 11, fontWeight: 700, transition: "all 0.15s",
                  }}>{d.i} {d.l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost-btn" style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 600 }} onClick={() => { setShowR(false); setRForm(null); }}>Annuler</button>
              <button className={rForm.conclusion ? "glow-btn" : "ghost-btn"} disabled={!rForm.conclusion}
                style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 700, opacity: rForm.conclusion ? 1 : 0.4, cursor: rForm.conclusion ? "pointer" : "not-allowed" }}
                onClick={onSaveReport}>Valider le rapport</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
