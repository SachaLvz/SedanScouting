import { useRef } from 'react';
import { POSITIONS, VILLES } from '../config';

export default function FormPage({ form, setForm, players, onSave, onBack, readFile }) {
  const photoRef = useRef(null);
  const idRef = useRef(null);
  const isEdit = players.some(p => p.id === form.id);

  return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px" }}>
      <button className="ghost-btn" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }} onClick={onBack}>← Retour</button>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 28 }}>{isEdit ? "Modifier le profil" : "Nouveau joueur"}</h2>

      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 28 }}>
        <div onClick={() => photoRef.current?.click()} style={{ width: 92, height: 92, borderRadius: 20, overflow: "hidden", cursor: "pointer", background: "linear-gradient(145deg, var(--blue-pale), #f8fafc)", border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {form.photo ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>📷<br />Photo</div>}
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={e => readFile(e, "photo")} style={{ display: "none" }} />
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>Cliquez pour ajouter</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div><label className="label">Nom *</label><input className="inp" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Nom" /></div>
        <div><label className="label">Prénom</label><input className="inp" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Prénom" /></div>
        <div><label className="label">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e => setForm(p => ({ ...p, dateNaissance: e.target.value }))} /></div>
        <div><label className="label">Ville</label><select className="inp" value={form.ville} onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
        <div><label className="label">Poste principal</label><select className="inp" value={form.poste} onChange={e => setForm(p => ({ ...p, poste: e.target.value }))}>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="label">Poste secondaire</label><select className="inp" value={form.posteSecondaire} onChange={e => setForm(p => ({ ...p, posteSecondaire: e.target.value }))}><option value="">—</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="label">Pied fort</label><select className="inp" value={form.pied} onChange={e => setForm(p => ({ ...p, pied: e.target.value }))}><option>Droitier</option><option>Gaucher</option><option>Les deux</option></select></div>
        <div><label className="label">Taille (cm)</label><input type="number" className="inp" value={form.taille} onChange={e => setForm(p => ({ ...p, taille: e.target.value }))} placeholder="178" /></div>
        <div><label className="label">Poids (kg)</label><input type="number" className="inp" value={form.poids} onChange={e => setForm(p => ({ ...p, poids: e.target.value }))} placeholder="72" /></div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label className="label">Pièce d'identité</label>
        <div className="card card-click" onClick={() => idRef.current?.click()} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, borderStyle: form.pieceIdentite ? "solid" : "dashed" }}>
          {form.pieceIdentite
            ? <><img src={form.pieceIdentite} alt="" style={{ width: 56, height: 36, objectFit: "cover", borderRadius: 6 }} /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Document ajouté</span></>
            : <><span style={{ fontSize: 20, opacity: 0.3 }}>🪪</span><span style={{ fontSize: 12, color: "var(--text-3)" }}>Ajouter la pièce d'identité</span></>
          }
        </div>
        <input ref={idRef} type="file" accept="image/*" onChange={e => readFile(e, "pieceIdentite")} style={{ display: "none" }} />
      </div>

      <button className="glow-btn" style={{ width: "100%", padding: 16, fontSize: 15 }} onClick={onSave}>
        {isEdit ? "Enregistrer" : "Ajouter le joueur"} 🦁
      </button>
    </div>
  );
}
