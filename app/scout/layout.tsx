'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoutDataProvider } from '@/components/scout/context';
import CSS from '@/components/scout/styles';

interface User { id: string; nom: string; role: 'admin' | 'scout'; }

function ScoutHeader({ nom, onLogout }: { nom: string; onLogout: () => void }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0c2340, #1a3a5c)', padding: '20px 20px 16px', borderBottom: '3px solid var(--blue-light)', boxShadow: '0 4px 24px rgba(12,35,64,0.15)', marginBottom: 28 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 4 }}>
            <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>🦁</span>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', background: 'linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MBARODI FC</h1>
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 4, fontFamily: 'var(--mono)' }}>Scouting · Détection · Recrutement</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Scout : <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{nom}</strong></div>
        </div>
        <button
          onClick={onLogout}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function ScoutLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('mbarodi_user');
    if (saved) {
      try {
        const u: User = JSON.parse(saved);
        if (u.role === 'scout') { setUser(u); return; }
      } catch { /* ignore */ }
    }
    router.replace('/');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('mbarodi_user');
    router.replace('/');
  };

  if (!user) return null;

  return (
    <ScoutDataProvider initialUser={user}>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', fontFamily: 'var(--font)', color: 'var(--text-1)', background: 'var(--bg)' }}>
        <ScoutHeader nom={user.nom} onLogout={handleLogout} />
        {children}
      </div>
    </ScoutDataProvider>
  );
}
