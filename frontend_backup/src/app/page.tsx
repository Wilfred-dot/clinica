'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';

const ROUTE_MAP: Record<string, string> = {
  admin: '/admin',
  medico: '/medico',
  recepcionista: '/recepcionista',
  paciente: '/paciente',
};

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
        if (user && user.role && ROUTE_MAP[user.role]) {
          router.replace(ROUTE_MAP[user.role]);
        } else {
          throw new Error('Papel inválido');
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.replace('/login');
      });
  }, [router]);

  return (
    <main className="flex-center-screen">
      <p style={{ color: 'var(--ink3)', fontSize: '14px', fontWeight: 500 }}>
        A validar credenciais e redirecionar...
      </p>
    </main>
  );
}