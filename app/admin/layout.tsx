'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminDataProvider, useAdminData } from '@/components/admin/context';
import Nav from '@/components/admin/pages/Nav';

interface User { id: string; firstName: string; lastName: string; role: 'admin' | 'scout'; }

function Sidebar({ open, onClose, user, onLogout }: { open: boolean; onClose: () => void; user: User; onLogout: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { players, matches } = useAdminData();

  const items = [
    { href: '/admin/joueurs',     label: 'Joueurs',     icon: '🦁', count: players.length },
    { href: '/admin/planning',    label: 'Planning',    icon: '📋', count: matches.length },
    { href: '/admin/shadow-team', label: 'Shadow Team', icon: '⚽', count: undefined },
    { href: '/admin/scouts',      label: 'Scouts',      icon: '👥', count: undefined },
  ];

  const go = (href: string) => { router.push(href); onClose(); };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 sm:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 sm:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header sidebar */}
        <div className="bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] px-5 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🦁</span>
              <span className="text-white font-extrabold text-base uppercase tracking-[3px]">MBARODI FC</span>
            </div>
            <div className="text-white/40 text-[10px] mt-1">Admin · {[user.firstName, user.lastName].filter(Boolean).join(' ')}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer">×</button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map(n => {
            const active = pathname.startsWith(n.href);
            return (
              <button
                key={n.href}
                onClick={() => go(n.href)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-[14px] font-semibold transition-all duration-150 cursor-pointer ${active ? 'bg-[#eef5fd] text-[#0c2340] border-r-[3px] border-[#1e6cb6]' : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0c2340]'}`}
              >
                <span className="text-base">{n.icon}</span>
                <span className="flex-1">{n.label}</span>
                {n.count !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${active ? 'bg-[#1e6cb6] text-white' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                    {n.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-[#e2e8f0] shrink-0">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="w-full py-2.5 rounded-xl border border-[#e2e8f0] text-[13px] font-semibold text-[#475569] hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fca5a5] transition-all duration-150 cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}

function AdminHeader({ user, onLogout, onOpenMenu }: { user: User; onLogout: () => void; onOpenMenu: () => void }) {
  return (
    <div className="bg-gradient-to-br from-[#0c2340] to-[#1a3a5c] px-5 pt-5 pb-4 border-b-[3px] border-[#4a9de8] shadow-[0_4px_24px_rgba(12,35,64,0.15)]">
      <div className="max-w-[960px] mx-auto flex items-center justify-between">
        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenMenu}
          className="sm:hidden flex flex-col gap-[5px] cursor-pointer p-1 shrink-0"
          aria-label="Menu"
        >
          <span className="w-5 h-0.5 bg-white/80 rounded" />
          <span className="w-5 h-0.5 bg-white/80 rounded" />
          <span className="w-5 h-0.5 bg-white/80 rounded" />
        </button>

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

        {/* Logout — desktop only */}
        <button
          onClick={onLogout}
          className="hidden sm:block px-3.5 py-2 rounded-[10px] border border-white/20 bg-white/[0.08] text-white/70 text-[11px] font-semibold cursor-pointer shrink-0 transition-all duration-150 hover:bg-white/[0.15] hover:text-white"
        >
          Déconnexion
        </button>
        {/* Spacer pour centrer le titre sur mobile */}
        <div className="sm:hidden w-8 shrink-0" />
      </div>
    </div>
  );
}

function AdminLayoutInner({ user, children, onLogout }: { user: User; children: React.ReactNode; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen text-[#0f172a] bg-[#f4f7fb]">
      <AdminHeader user={user} onLogout={onLogout} onOpenMenu={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={onLogout} />
      <div className="pt-6">
        {/* Nav desktop only */}
        <div className="hidden sm:block">
          <Nav />
        </div>
        {children}
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
      <AdminLayoutInner user={user} onLogout={handleLogout}>
        {children}
      </AdminLayoutInner>
    </AdminDataProvider>
  );
}
