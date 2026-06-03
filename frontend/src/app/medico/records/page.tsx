'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Ficha {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string } };
}

export default function MedicoRecordsPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<{ ultimasFichas: Ficha[] }>('/dashboard/medico')
      .then(data => setFichas(data?.ultimasFichas ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Fichas Clínicas</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">Últimos atendimentos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border2)] shadow-md">
        <div className="mb-4">
          <h3>Pacientes Atendidos</h3>
        </div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : (
          <table>
            <thead>
              <tr><th>Paciente</th><th>Data</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {fichas.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.pacientes?.users?.name ?? 'N/D'}</strong></td>
                  <td>{new Date(f.data_hora).toLocaleDateString('pt-MZ')}</td>
                  <td>{f.status}</td>
                  <td>
                    <Link href={`/medico/consulta/${f.id}`} className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-3 py-1.5 rounded-md text-xs font-medium">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {fichas.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma ficha encontrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
