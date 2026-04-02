import { useRef } from 'react';
import { POSITIONS, VILLES } from '../config';
import type { Player } from '../config';

interface FormPageProps {
  form: Player;
  setForm: React.Dispatch<React.SetStateAction<Player | null>>;
  players: Player[];
  onSave: () => void;
  onCancel: () => void;
  uploading?: boolean;
  uploadError?: boolean;
  readFile: (e: React.ChangeEvent<HTMLInputElement>, field: keyof Player, onUploaded?: (url: string) => void) => void;
}

export default function FormPage({ form, setForm, players, onSave, onCancel, uploading, uploadError, readFile }: FormPageProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const isEdit = players.some(p => p.id === form.id);
  const photos = Array.from(new Set((form.photos ?? []).filter(Boolean)));
  const profilePhoto = form.profilePhoto || form.photo || photos[0] || '';

  return (
    <div className="fu max-w-[700px] mx-auto px-5 pb-[60px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-extrabold text-[#0c2340] m-0">{isEdit ? 'Modifier' : 'Nouveau joueur'}</h2>
        <button className="btn-g px-3.5 py-2 text-xs" onClick={onCancel}>← Retour</button>
      </div>

      <div className="mb-6">
        <div className="flex gap-[18px] items-center mb-3.5">
          <div
            onClick={() => photoRef.current?.click()}
            className="w-[88px] h-[88px] rounded-[18px] overflow-hidden cursor-pointer flex items-center justify-center shrink-0 border-2 border-dashed border-[#e2e8f0]"
            style={{ background: 'linear-gradient(145deg,#dbeafe,#f8fafc)' }}
          >
            {uploading
              ? <div className="text-center text-[11px] text-[#94a3b8]">⏳</div>
              : uploadError
                ? <div className="text-center text-[11px] text-[#dc2626]">❌<br />Erreur</div>
                : profilePhoto
                  ? <img src={profilePhoto} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : <div className="text-center text-[11px] text-[#94a3b8]">📷<br />Photo</div>
            }
          </div>
          <div className="text-xs text-[#64748b]">
            <div className="font-semibold">Photo de profil</div>
            <div>Cliquez pour ajouter une ou plusieurs photos</div>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-2"
        >
          {photos.map(url => (
            <div key={url} className="relative w-[62px] h-[62px] rounded-xl overflow-hidden border border-[#e2e8f0]">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0f172acc] text-white text-[11px] leading-none"
                onClick={() => setForm(p => {
                  if (!p) return p;
                  const nextPhotos = (p.photos ?? []).filter(photo => photo !== url);
                  const nextProfile = (p.profilePhoto === url ? (nextPhotos[0] || '') : (p.profilePhoto || p.photo || ''));
                  return { ...p, photos: nextPhotos, profilePhoto: nextProfile, photo: nextProfile };
                })}
                title="Supprimer"
              >
                ✕
              </button>
              <button
                type="button"
                className="absolute left-1 bottom-1 text-[9px] px-1.5 py-0.5 rounded bg-white/90 text-[#0c2340] font-bold"
                onClick={() => setForm(p => p ? { ...p, profilePhoto: url, photo: url } : p)}
                title="Définir en photo de profil"
              >
                {profilePhoto === url ? 'Profil' : 'Mettre profil'}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="w-[62px] h-[62px] rounded-xl border-2 border-dashed border-[#cbd5e1] text-[#64748b] text-xs font-semibold"
            onClick={() => photoRef.current?.click()}
          >
            + Photo
          </button>
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => readFile(e, 'photo', (url) => {
            setForm(p => {
              if (!p) return p;
              const nextPhotos = Array.from(new Set([...(p.photos ?? []), url]));
              const nextProfile = p.profilePhoto || p.photo || url;
              return { ...p, photos: nextPhotos, profilePhoto: nextProfile, photo: nextProfile };
            });
          })}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div><label className="lbl">Nom *</label><input className="inp" value={form.lastName} onChange={e => setForm(p => p ? { ...p, lastName: e.target.value } : p)} placeholder="Nom" /></div>
        <div><label className="lbl">Prénom</label><input className="inp" value={form.firstName} onChange={e => setForm(p => p ? { ...p, firstName: e.target.value } : p)} placeholder="Prénom" /></div>
        <div><label className="lbl">Date de naissance</label><input type="date" className="inp" value={form.dateNaissance} onChange={e => setForm(p => p ? { ...p, dateNaissance: e.target.value } : p)} /></div>
        <div><label className="lbl">Nationalité</label><input className="inp" value={form.nationalite} onChange={e => setForm(p => p ? { ...p, nationalite: e.target.value } : p)} placeholder="Ex: Sénégalais" /></div>
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

      <div className="card p-[18px] mb-5">
        <div className="lbl mb-3 text-[11px]">🤝 Informations transfert / agent</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="lbl">Club actuel</label><input className="inp" value={form.clubActuel} onChange={e => setForm(p => p ? { ...p, clubActuel: e.target.value } : p)} placeholder="Nom du club" /></div>
          <div><label className="lbl">Agent</label><input className="inp" value={form.agent} onChange={e => setForm(p => p ? { ...p, agent: e.target.value } : p)} placeholder="Nom de l'agent" /></div>
          <div><label className="lbl">Fin de contrat</label><input className="inp" value={form.finContrat} onChange={e => setForm(p => p ? { ...p, finContrat: e.target.value } : p)} placeholder="Juin 2026" /></div>
          <div><label className="lbl">Valeur estimée</label><input className="inp" value={form.valeur} onChange={e => setForm(p => p ? { ...p, valeur: e.target.value } : p)} placeholder="50 000 €" /></div>
        </div>
        <div className="mt-3">
          <label className="lbl">Parcours / clubs précédents</label>
          <textarea className="inp resize-y h-[60px]" value={form.historique} onChange={e => setForm(p => p ? { ...p, historique: e.target.value } : p)} placeholder="Ex: 2022-24 ASC Jaraaf, 2024-25 Dakar Sacré-Cœur..." />
        </div>
      </div>

      <div className="mb-6">
        <label className="lbl">Pièce d&apos;identité</label>
        <div
          className="card card-click px-[18px] py-3.5 flex items-center gap-3"
          onClick={() => idRef.current?.click()}
          style={{ borderStyle: form.pieceIdentite ? 'solid' : 'dashed' }}
        >
          {form.pieceIdentite
            ? <>{form.pieceIdentite.endsWith('.pdf') ? <span className="text-[22px]">📄</span> : <img src={form.pieceIdentite} alt="" className="w-14 h-9 object-cover rounded-[6px]" />}<span className="text-xs text-[#16a34a] font-semibold">✓ Ajouté</span></>
            : <><span className="text-[18px] opacity-30">🪪</span><span className="text-xs text-[#94a3b8]">Ajouter la pièce d&apos;identité</span></>
          }
        </div>
        <input ref={idRef} type="file" accept="image/*,.pdf" onChange={e => readFile(e, 'pieceIdentite')} className="hidden" />
      </div>

      <button className="btn-p w-full py-4 text-[15px]" onClick={onSave} disabled={uploading} style={{ opacity: uploading ? 0.5 : 1 }}>
        {uploading ? 'Upload en cours...' : isEdit ? 'Enregistrer' : 'Ajouter le joueur 🦁'}
      </button>
    </div>
  );
}
