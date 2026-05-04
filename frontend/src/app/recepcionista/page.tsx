'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  pacientes: {
    users: {
      name: string;
    };
  };
  medicos: {
    users: {
      name: string;
    };
  };
}

interface DashboardData {
  consultasHoje: {
    total: number;
    lista: Consulta[];
  };
  aguardando: number;
  atendidos: number;
}

const statusBadge: Record<string, { cls: string; label: string }> = {
  agendada: { cls: 'bw', label: 'Aguarda' },
  realizada: { cls: 'bg', label: 'Realizada' },
  em_curso: { cls: 'bb', label: 'Em curso' },
  cancelada: { cls: 'br', label: 'Cancelada' },
};

export default function RecepcionistaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<DashboardData>('/dashboard/recepcao')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">A carregar dashboard...</p>;
  if (!data) return <p className="p-8">Erro ao carregar dados.</p>;

  const { consultasHoje, aguardando, atendidos } = data;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Bom dia</h1>
          <p className="sub">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-outline" onClick={() => window.location.href = '/recepcionista/patients'}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Novo Paciente
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/recepcionista/consultations'}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Agendar Consulta
          </button>
        </div>
      </div>
      <div className="stats">
        <div className="stat c-warn">
          <div className="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
          <h3>{consultasHoje.total}</h3>
          <p>Consultas Hoje</p>
        </div>
        <div className="stat c-sky">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
          <h3>{aguardando}</h3>
          <p>Aguardando</p>
        </div>
        <div className="stat c-green">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
          <h3>{atendidos}</h3>
          <p>Atendidos</p>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Consultas de Hoje</h3>
          <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/recepcionista/consultations'}>Ver todas</button>
        </div>
        <table>
          <thead>
            <tr><th>Hora</th><th>Paciente</th><th>Médico</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {consultasHoje.lista.map((c) => {
              const bad = statusBadge[c.status] || { cls: 'bn', label: c.status };
              return (
                <tr key={c.id}>
                  <td><strong>{new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</strong></td>
                  <td>{c.pacientes?.users?.name ?? 'N/D'}</td>
                  <td>{c.medicos?.users?.name ?? 'N/D'}</td>
                  <td><span className={`badge ${bad.cls}`}>{bad.label}</span></td>
                </tr>
              );
            })}
            {consultasHoje.lista.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma consulta agendada para hoje.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
