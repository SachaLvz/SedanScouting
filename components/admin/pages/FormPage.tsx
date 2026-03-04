import { useRef } from 'react';
import { POSITIONS, VILLES } from '../config';
import type { Player } from '../config';

interface FormPageProps {
  form: Player;
  setForm: React.Dispatch<React.SetStateAction<Player | null>>;
  players: Player[];
  onSave: () => void;
  readFile: (e: React.ChangeEvent<HTMLInputElement>, field: keyof Player) => void;
}

export default function FormPage({ form, setForm, players, onSave, readFile }: FormPageProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const isEdit = players.some(p => p.id === form.id);

  return (
    <div className="fu" style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 60px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 24 }}>{isEdit ? 'Modifier' : 'Nouveau joueur'}</h2>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 24 }}>
        <div
          onClick={() => photoRef.current?.click()}
          style={{ width: 88, height: 88, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', background: 'linear-gradient(145deg,var(--blueP),#f8fafc)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {form.photo
            ? <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)' }}>📷<br />Photo</div>
          }
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={e => readFile(e, 'photo')} style={{ display: 'none' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div><label className="lbl">Nom *</label><input className="inp" value={form.nom} onChange={e => setForm(p => p ? { ...p, nom: e.target.value } : p)} placeholder="Nom" /></div>
        <div><label className="lbl">Prénom</label><input className="inp" value={form.prenom} onChange={e => setForm(p => p ? { ...p, prenom: e.target.value } : p)} placeholder="Prénom" /></div>
        <div><label className="lbl">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e => setForm(p => p ? { ...p, dateNaissance: e.target.value } : p)} /></div>
        <div><label className="lbl">Ville</label><select className="inp" value={form.ville} onChange={e => setForm(p => p ? { ...p, ville: e.target.value } : p)}>{VILLES.map(v => <option key={v}>{v}</option>)}</select></div>
        <div><label className="lbl">Poste</label><select className="inp" value={form.poste} onChange={e => setForm(p => p ? { ...p, poste: e.target.value } : p)}>{POSITIONS.map(pos => <option key={pos}>{pos}</option>)}</select></div>
        <div><label className="lbl">Poste secondaire</label>
          <select className="inp" value={form.posteSecondaire} onChange={e => setForm(p => p ? { ...p, posteSecondaire: e.target.value } : p)}>
            <option value="">—</option>{POSITIONS.map(pos => <option key={pos}>{pos}</option>)}
          </select>
        </div>
        <div><label className="lbl">Pied fort</label>
          <select className="inp" value={form.pied} onChange={e => setForm(p => p ? { ...p, pied: e.target.value } : p)}>
            <option>Droitier</option><option>Gaucher</option><option>Les deux</option>
          </select>
        </div>
        <div><label className="lbl">Taille (cm)</label><input type="number" className="inp" value={form.taille} onChange={e => setForm(p => p ? { ...p, taille: e.target.value } : p)} placeholder="178" /></div>
        <div><label className="lbl">Poids (kg)</label><input type="number" className="inp" value={form.poids} onChange={e => setForm(p => p ? { ...p, poids: e.target.value } : p)} placeholder="72" /></div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <div className="lbl" style={{ marginBottom: 12, fontSize: 11 }}>🤝 Informations transfert / agent</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label className="lbl">Club actuel</label><input className="inp" value={form.clubActuel} onChange={e => setForm(p => p ? { ...p, clubActuel: e.target.value } : p)} placeholder="Nom du club" /></div>
          <div><label className="lbl">Agent</label><input className="inp" value={form.agent} onChange={e => setForm(p => p ? { ...p, agent: e.target.value } : p)} placeholder="Nom de l'agent" /></div>
          <div><label className="lbl">Fin de contrat</label><input className="inp" value={form.finContrat} onChange={e => setForm(p => p ? { ...p, finContrat: e.target.value } : p)} placeholder="Juin 2026" /></div>
          <div><label className="lbl">Valeur estimée</label><input className="inp" value={form.valeur} onChange={e => setForm(p => p ? { ...p, valeur: e.target.value } : p)} placeholder="50 000 €" /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="lbl">Parcours / clubs précédents</label>
          <textarea className="inp" style={{ height: 60, resize: 'vertical' }} value={form.historique} onChange={e => setForm(p => p ? { ...p, historique: e.target.value } : p)} placeholder="Ex: 2022-24 ASC Jaraaf, 2024-25 Dakar Sacré-Cœur..." />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="lbl">Pièce d&apos;identité</label>
        <div
          className="card card-click"
          onClick={() => idRef.current?.click()}
          style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderStyle: form.pieceIdentite ? 'solid' : 'dashed' }}
        >
          {form.pieceIdentite
            ? <><img src={form.pieceIdentite} alt="" style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 6 }} /><span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Ajouté</span></>
            : <><span style={{ fontSize: 18, opacity: .3 }}>🪪</span><span style={{ fontSize: 12, color: 'var(--t3)' }}>Ajouter la pièce d&apos;identité</span></>
          }
        </div>
        <input ref={idRef} type="file" accept="image/*" onChange={e => readFile(e, 'pieceIdentite')} style={{ display: 'none' }} />
      </div>

      <button className="btn-p" style={{ width: '100%', padding: 16, fontSize: 15 }} onClick={onSave}>
        {isEdit ? 'Enregistrer' : 'Ajouter le joueur'} 🦁
      </button>
    </div>
  );
}
