'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminData } from '../context';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { players, matches } = useAdminData();

  const items = [
    { href: '/admin/joueurs',     label: '🦁 Joueurs',    count: players.length },
    { href: '/admin/calendrier',  label: '📅 Calendrier', count: matches.length },
    { href: '/admin/shadow-team', label: '⚽ Shadow Team', count: undefined },
    { href: '/admin/scouts',      label: '👥 Scouts',     count: undefined },
  ];

  return (
    <div style={{ display: 'flex', gap: 2, padding: '0 20px', borderBottom: '1px solid var(--border)', maxWidth: 960, margin: '0 auto 24px' }}>
      {items.map(n => {
        const active = pathname.startsWith(n.href);
        return (
          <button
            key={n.href}
            className={`tab ${active ? 'on' : ''}`}
            onClick={() => router.push(n.href)}
            style={{ fontSize: 13, padding: '12px 16px' }}
          >
            {n.label}
            {n.count !== undefined && (
              <span style={{ fontSize: 10, marginLeft: 6, padding: '1px 6px', borderRadius: 10, background: active ? 'var(--blueG)' : '#f1f5f9', color: active ? 'var(--blue)' : 'var(--t3)' }}>
                {n.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
