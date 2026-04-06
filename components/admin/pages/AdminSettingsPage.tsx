'use client';

import { useEffect, useMemo, useState } from 'react';
import { VILLES } from '@/components/admin/config';

interface CityRow {
  id: string;
  name: string;
}

export default function AdminSettingsPage() {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCities = async () => {
    const res = await fetch('/api/cities').catch(() => null);
    const data = res?.ok ? await res.json() : [];
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      setCities(
        Array.from(new Set(data.map(v => String(v).trim()).filter(Boolean)))
          .sort((a, b) => a.localeCompare(b, 'fr'))
          .map(v => ({ id: v, name: v }))
      );
      return;
    }
    if (Array.isArray(data)) {
      setCities(data);
      return;
    }
    setCities(VILLES.map(v => ({ id: v, name: v })));
  };

  useEffect(() => {
    loadCities().catch(() => setCities(VILLES.map(v => ({ id: v, name: v }))));
  }, []);

  const normalized = useMemo(
    () => cities.map(c => c.name.toLowerCase().trim()),
    [cities]
  );

  const addCity = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (normalized.includes(cleanName.toLowerCase())) {
      setError('Cette ville existe deja.');
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch('/api/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setError('Impossible d\'ajouter la ville.');
      return;
    }
    setName('');
    await loadCities();
  };

  const deleteCity = async (city: CityRow) => {
    if (!window.confirm(`Supprimer "${city.name}" ?`)) return;
    if (city.id === city.name) {
      setError('Cette ville provient de la liste par defaut et ne peut pas etre supprimee ici.');
      return;
    }
    const res = await fetch(`/api/cities?id=${encodeURIComponent(city.id)}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      setError('Suppression impossible.');
      return;
    }
    setError(null);
    await loadCities();
  };

  return (
    <div className="fu max-w-[960px] mx-auto px-5 pb-[60px]">
      <div className="card p-5 mb-4">
        <h2 className="m-0 text-[22px] font-extrabold text-[#0c2340]">Admin</h2>
        <p className="mt-1.5 mb-0 text-xs text-[#64748b]">
          Parametres d&apos;administration.
        </p>
      </div>

      <div className="card p-5 mb-4">
        <h3 className="m-0 text-[16px] font-extrabold text-[#0c2340]">Ville</h3>
        <p className="mt-1.5 mb-0 text-xs text-[#64748b]">
          Ajoutez ou supprimez les villes disponibles dans le formulaire joueur.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <label className="lbl">Ajouter une ville</label>
        <div className="flex gap-2 flex-wrap">
          <input
            className="inp flex-1 min-w-[240px]"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Kolda"
          />
          <button className="btn-p px-4 py-2.5 text-sm" disabled={saving} onClick={addCity}>
            {saving ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
        {error && <div className="mt-2 text-xs text-[#dc2626] font-semibold">{error}</div>}
      </div>

      <div className="card p-3">
        <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-[1px] px-2 pb-2">
          Villes disponibles ({cities.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {cities.map(city => (
            <div key={city.id} className="flex items-center justify-between gap-2 bg-[#f8fafc] rounded-xl px-3 py-2.5 border border-[#e2e8f0]">
              <span className="text-[13px] font-semibold text-[#0f172a]">{city.name}</span>
              <button
                className="btn-g px-2.5 py-1.5 text-[11px] text-[#dc2626]"
                onClick={() => deleteCity(city)}
                disabled={city.id === city.name}
                style={{ opacity: city.id === city.name ? 0.45 : 1 }}
                title={city.id === city.name ? 'Ville par defaut' : 'Supprimer'}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
