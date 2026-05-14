'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    getMe()
      .then((user) => {
        const routes: Record<string, string> = {
          admin: '/admin',
          medico: '/medico',
          recepcionista: '/recepcionista',
          paciente: '/paciente',
        };
        router.replace(routes[user.role] || '/login');
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        router.replace('/login');
      });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-[#6b8299] text-sm">A redirecionar...</p>
    </main>
  );
}
