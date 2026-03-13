'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDataProvider } from '@/components/admin/context';
import Nav from '@/components/admin/pages/Nav';

interface User { id: string; firstName: string; lastName: string; role: 'admin' | 'scout'; }

function AdminHeader({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] px-5 pt-5 pb-4 border-b-[3px] border-[#4a9de8] shadow-[0_4px_24px_rgba(12,35,64,0.15)]">
      <div className="max-w-[960px] mx-auto flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-3 mb-0.5">
            <span className="text-[26px]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,.2))' }}>🦁</span>
            <h1
              className="m-0 text-[clamp(18px,4vw,24px)] font-extrabold uppercase tracking-[clamp(2px,1vw,4px)]"
              style={{ background: 'linear-gradient(135deg,#7db8e8,#b8ddf8,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              MBARODI FC
            </h1>
          </div>
          <div className="header-sub text-[9px] text-white/40 uppercase tracking-[4px] font-mono">
            Scouting · Détection · Recrutement
          </div>
          <div className="text-[10px] text-white/30 mt-1">
            Admin : <strong className="text-white/60">{[user.firstName, user.lastName].filter(Boolean).join(' ')}</strong>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-3.5 py-2 rounded-[10px] border border-white/20 bg-white/[0.08] text-white/70 text-[11px] font-semibold cursor-pointer shrink-0 transition-all duration-150 hover:bg-white/[0.15] hover:text-white"
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
      <div className="min-h-screen text-[#0f172a] bg-[#f4f7fb]">
        <AdminHeader user={user} onLogout={handleLogout} />
        <div className="pt-6">
          <Nav />
          {children}
        </div>
      </div>
    </AdminDataProvider>
  );
}
