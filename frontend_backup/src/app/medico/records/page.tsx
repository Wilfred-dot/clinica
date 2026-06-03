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
      <div className="ph">
        <div>
          <h1>Fichas Clínicas</h1>
          <p className="sub">Últimos atendimentos</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
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
                    <Link href={`/medico/consulta/${f.id}`} className="btn btn-outline btn-sm">
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
