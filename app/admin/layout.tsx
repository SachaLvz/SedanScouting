'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDataProvider } from '@/components/admin/context';
import Nav from '@/components/admin/pages/Nav';
import CSS from '@/components/admin/styles';

interface User { id: string; firstName: string; lastName: string; role: 'admin' | 'scout'; }

function AdminHeader({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#0c2340,#1a3a5c)', padding: '20px 20px 16px', borderBottom: '3px solid var(--blueL)', boxShadow: '0 4px 24px rgba(12,35,64,.15)', marginBottom: 0 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 2 }}>
            <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 8px rgba(255,255,255,.2))' }}>🦁</span>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', background: 'linear-gradient(135deg,#7db8e8,#b8ddf8,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MBARODI FC</h1>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 4, fontFamily: 'var(--m)' }}>Scouting · Détection · Recrutement</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Admin : <strong style={{ color: 'rgba(255,255,255,.6)' }}>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</strong></div>
        </div>
        <button
          onClick={onLogout}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.7)'; }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('mbarodi_user');
    if (saved) {
      try {
        const u: User = JSON.parse(saved);
        if (u.role === 'admin') { setUser(u); return; }
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
    <AdminDataProvider initialUser={user}>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', fontFamily: 'var(--f)', color: 'var(--t1)', background: 'var(--bg)' }}>
        <AdminHeader user={user} onLogout={handleLogout} />
        <div style={{ paddingTop: 24 }}>
          <Nav />
          {children}
        </div>
      </div>
    </AdminDataProvider>
  );
}
