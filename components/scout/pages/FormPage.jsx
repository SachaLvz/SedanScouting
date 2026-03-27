import { useRef } from 'react';
import { POSITIONS, VILLES } from '../config';

export default function FormPage({ form, setForm, players, onSave, onBack, uploading, uploadError, readFile }) {
  const photoRef = useRef(null);
  const idRef = useRef(null);
  const isEdit = players.some(p => p.id === form.id);

  return (
    <div className="fu max-w-[680px] mx-auto px-5 pb-[60px]">
      <button className="btn-g px-3.5 py-2 text-xs mb-4" onClick={onBack}>← Retour</button>
      <h2 className="text-[22px] font-extrabold text-[#0c2340] mb-7">{isEdit ? "Modifier le profil" : "Nouveau joueur"}</h2>

      <div className="flex gap-[18px] items-center mb-7">
        <div
          onClick={() => photoRef.current?.click()}
          className="w-[92px] h-[92px] rounded-[20px] overflow-hidden cursor-pointer flex items-center justify-center shrink-0 border-2 border-dashed border-[#e2e8f0]"
          style={{ background: "linear-gradient(145deg, #dbeafe, #f8fafc)" }}
        >
          {uploading
            ? <div className="text-center text-[11px] text-[#94a3b8]">⏳</div>
            : uploadError
              ? <div className="text-center text-[11px] text-[#dc2626]">❌<br />Erreur</div>
              : form.photo
                ? <img src={form.photo} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                : <div className="text-center text-[11px] text-[#94a3b8] leading-[1.5]">📷<br />Photo</div>}
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={e => readFile(e, "photo")} className="hidden" />
        <div className="text-xs text-[#94a3b8]">Cliquez pour ajouter</div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 mb-[22px]">
        <div><label className="lbl">Nom *</label><input className="inp" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Nom" /></div>
        <div><label className="lbl">Prénom</label><input className="inp" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Prénom" /></div>
        <div><label className="lbl">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e => setForm(p => ({ ...p, dateNaissance: e.target.value }))} /></div>
        <div><label className="lbl">Nationalité</label><input className="inp" value={form.nationalite} onChange={e => setForm(p => ({ ...p, nationalite: e.target.value }))} placeholder="Ex: Sénégalais" /></div>
        <div><label className="lbl">Ville</label><select className="inp" value={form.ville} onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
        <div><label className="lbl">Poste principal</label><select className="inp" value={form.poste} onChange={e => setForm(p => ({ ...p, poste: e.target.value }))}>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="lbl">Poste secondaire</label><select className="inp" value={form.posteSecondaire} onChange={e => setForm(p => ({ ...p, posteSecondaire: e.target.value }))}><option value="">—</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label className="lbl">Pied fort</label><select className="inp" value={form.pied} onChange={e => setForm(p => ({ ...p, pied: e.target.value }))}><option>Droitier</option><option>Gaucher</option><option>Les deux</option></select></div>
        <div><label className="lbl">Taille (cm)</label><input type="number" className="inp" value={form.taille} onChange={e => setForm(p => ({ ...p, taille: e.target.value }))} placeholder="178" /></div>
        <div><label className="lbl">Poids (kg)</label><input type="number" className="inp" value={form.poids} onChange={e => setForm(p => ({ ...p, poids: e.target.value }))} placeholder="72" /></div>
      </div>

      <div className="mb-7">
        <label className="lbl">Pièce d&apos;identité</label>
        <div
          className="card card-click px-5 py-4 flex items-center gap-3.5"
          onClick={() => idRef.current?.click()}
          style={{ borderStyle: form.pieceIdentite ? "solid" : "dashed" }}
        >
          {form.pieceIdentite
            ? <>{form.pieceIdentite.endsWith('.pdf') ? <span className="text-[22px]">📄</span> : <img src={form.pieceIdentite} alt="" className="w-14 h-9 object-cover rounded-[6px]" />}<span className="text-xs text-[#16a34a] font-semibold">✓ Document ajouté</span></>
            : <><span className="text-xl opacity-30">🪪</span><span className="text-xs text-[#94a3b8]">Ajouter la pièce d&apos;identité</span></>
          }
        </div>
        <input ref={idRef} type="file" accept="image/*,.pdf" onChange={e => readFile(e, "pieceIdentite")} className="hidden" />
      </div>

      <button className="btn-p w-full py-4 text-[15px]" onClick={onSave} disabled={uploading} style={{ opacity: uploading ? 0.5 : 1 }}>
        {uploading ? 'Upload en cours...' : isEdit ? 'Enregistrer' : 'Ajouter le joueur 🦁'}
      </button>
    </div>
  );
}
