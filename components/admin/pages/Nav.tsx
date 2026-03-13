'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminData } from '../context';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { players, matches } = useAdminData();

  const items = [
    { href: '/admin/joueurs',     label: '🦁 Joueurs',    count: players.length },
    { href: '/admin/planning',    label: '📋 Planning',   count: matches.length },
    { href: '/admin/shadow-team', label: '⚽ Shadow Team', count: undefined },
    { href: '/admin/scouts',      label: '👥 Scouts',     count: undefined },
  ];

  return (
    <div className="nav-scroll">
      {items.map(n => {
        const active = pathname.startsWith(n.href);
        return (
          <button
            key={n.href}
            className={`tab ${active ? 'on' : ''}`}
            onClick={() => router.push(n.href)}
          >
            {n.label}
            {n.count !== undefined && (
              <span className={`text-[10px] ml-1.5 px-1.5 py-px rounded-[10px] ${active ? 'bg-[#eef5fd] text-[#1e6cb6]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                {n.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
