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

const statusBadge: Record<string, { cls: string; label: string }> = {
  agendada: { cls: 'bw', label: 'Aguarda' },
  realizada: { cls: 'bg', label: 'Realizada' },
  em_curso: { cls: 'bb', label: 'Em curso' },
};

export default function MedicoAttendPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<{ consultasHoje: { lista: Consulta[] } }>('/dashboard/medico')
      .then(data => setConsultas(data?.consultasHoje?.lista ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          <h3>Agenda de Hoje</h3>
        </div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : consultas.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink4)' }}>Nenhuma consulta agendada para hoje.</p>
        ) : (
          <div className="clist">
            {consultas.map(c => {
              const bad = statusBadge[c.status] || { cls: 'bn', label: c.status };
              const patientName = c.pacientes?.users?.name ?? 'N/D';
              return (
                <Link href={`/medico/consulta/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                  <div className="citem">
                    <div className="ctime">
                      {new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="divider-v" />
                    <div
                      className="cavatar"
                      style={{ background: 'var(--teal)' }}
                    >
                      {patientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="cinfo">
                      <div className="cname">{patientName}</div>
                      <div className="creason">{c.medicos?.users?.name ?? '—'}</div>
                    </div>
                    <span className={`badge ${bad.cls}`}>{bad.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
