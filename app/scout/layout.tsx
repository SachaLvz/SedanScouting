'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ScoutDataProvider } from '@/components/scout/context';

interface User { id: string; firstName: string; lastName: string; role: 'admin' | 'scout'; }

function ScoutHeader({ nom, onLogout }: { nom: string; onLogout: () => void }) {
  return (
    <div className="bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] px-5 pt-5 pb-4 border-b-[3px] border-[#4a9de8] shadow-[0_4px_24px_rgba(12,35,64,0.15)] mb-7">
      <div className="max-w-[960px] mx-auto flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-3.5 mb-1">
            <span className="text-[28px]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>🦁</span>
            <h1
              className="m-0 text-[clamp(18px,4vw,26px)] font-extrabold uppercase tracking-[clamp(2px,1vw,4px)]"
              style={{ background: 'linear-gradient(135deg, #7db8e8, #b8ddf8, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              MBARODI FC
            </h1>
          </div>
          <div className="header-sub text-[10px] font-medium text-white/45 uppercase tracking-[4px] font-mono">
            Scouting · Détection · Recrutement
          </div>
          <div className="text-[10px] text-white/35 mt-1">
            Scout : <strong className="text-white/65">{nom}</strong>
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

function ScoutNav() {
  const pathname = usePathname();
  const NAV = [
    { href: '/scout/joueurs', label: '👥 Joueurs' },
    { href: '/scout/planning', label: '📅 Planning' },
    { href: '/scout/shadow-team', label: '⚽ Shadow Team' },
  ];
  return (
    <div className="nav-scroll max-w-[960px] mx-auto px-5 pb-5">
      {NAV.map(n => (
        <Link
          key={n.href}
          href={n.href}
          className="px-[18px] py-2 rounded-[10px] text-[13px] font-semibold no-underline transition-all duration-150"
          style={{
            background: pathname === n.href ? '#1e6cb6' : 'transparent',
            color: pathname === n.href ? '#fff' : '#475569',
            border: `1.5px solid ${pathname === n.href ? '#1e6cb6' : '#e2e8f0'}`,
          }}
        >
          {n.label}
        </Link>
      ))}
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
      <div className="min-h-screen text-[#0f172a] bg-[#f4f7fb]">
        <ScoutHeader nom={[user.firstName, user.lastName].filter(Boolean).join(' ')} onLogout={handleLogout} />
        <ScoutNav />
        {children}
      </div>
    </ScoutDataProvider>
  );
}
