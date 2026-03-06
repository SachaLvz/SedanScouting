'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from '@/components/LoginScreen';

interface User { id: string; firstName: string; lastName: string; role: 'admin' | 'scout'; }

export default function Home() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('mbarodi_user');
    if (saved) {
      try {
        const u: User = JSON.parse(saved);
        router.replace(u.role === 'admin' ? '/admin/joueurs' : '/scout/joueurs');
        return;
      } catch { /* ignore */ }
    }
    setReady(true);
  }, [router]);

  const handleLogin = (u: User) => {
    localStorage.setItem('mbarodi_user', JSON.stringify(u));
    router.push(u.role === 'admin' ? '/admin/joueurs' : '/scout/joueurs');
  };

  if (!ready) return null;
  return <LoginScreen onLogin={handleLogin} />;
}
