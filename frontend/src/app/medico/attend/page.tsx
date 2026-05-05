'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string } };
}

export default function MedicoAttendPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<{ consultasHoje: { lista: Consulta[] } }>('/dashboard/medico')
      .then(data => setConsultas(data?.consultasHoje?.lista ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge: Record<string, { cls: string; label: string }> = {
    agendada: { cls: 'bw', label: 'Aguarda' },
    realizada: { cls: 'bg', label: 'Realizada' },
    em_curso: { cls: 'bb', label: 'Em curso' },
  };

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Atendimento</h1>
          <p className="sub">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Consultas de Hoje</h3>
        </div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : (
          <table>
            <thead>
              <tr><th>Hora</th><th>Paciente</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {consultas.map(c => {
                const bad = statusBadge[c.status] || { cls: 'bn', label: c.status };
                return (
                  <tr key={c.id}>
                    <td><strong>{new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</strong></td>
                    <td>{c.pacientes?.users?.name ?? 'N/D'}</td>
                    <td><span className={`badge ${bad.cls}`}>{bad.label}</span></td>
                    <td>
                      <Link href={`/medico/consulta/${c.id}`} className="btn btn-outline btn-sm">
                        Atender
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {consultas.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma consulta agendada para hoje.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
