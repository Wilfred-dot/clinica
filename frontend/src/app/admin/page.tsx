'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string } };
}

interface DashboardData {
  totalConsultas: number;
  totalPacientes: number;
  totalMedicos: number;
  consultasHoje: ConsultaItem[];
  ultimasConsultas: ConsultaItem[];
  actividadeRecente: Array<{
    id: number;
    mensagem: string;
    paciente: string;
    data: string;
  }>;
}

const statusBadge: Record<string, { cls: string; label: string }> = {
  agendada: { cls: 'bw', label: 'Agendada' },
  realizada: { cls: 'bg', label: 'Realizada' },
  em_curso: { cls: 'bb', label: 'Em curso' },
  cancelada: { cls: 'br', label: 'Cancelada' },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<DashboardData>('/dashboard/admin')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">A carregar dashboard...</p>;
  if (!data) return <p className="p-8">Erro ao carregar dados.</p>;

  const {
    totalConsultas,
    totalPacientes,
    totalMedicos,
    consultasHoje,
    ultimasConsultas,
    actividadeRecente
  } = data;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="stats">
        <div className="stat c-teal">
          <div className="ic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
          <h3>{totalConsultas}</h3>
          <p>Total de Consultas</p>
        </div>
        <div className="stat c-sky">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
          <h3>{totalPacientes}</h3>
          <p>Pacientes Registados</p>
        </div>
        <div className="stat c-green">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg></div>
          <h3>{totalMedicos}</h3>
          <p>Médicos Activos</p>
        </div>
        <div className="stat c-warn">
          <div className="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
          <h3>{consultasHoje.length}</h3>
          <p>Consultas Hoje</p>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Últimas Consultas</h3>
          <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/admin/consultations'}>Ver todas</button>
        </div>
        <table>
          <thead>
            <tr><th>Paciente</th><th>Médico</th><th>Data / Hora</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {ultimasConsultas.map((c) => {
              const bad = statusBadge[c.status] || { cls: 'bn', label: c.status };
              return (
                <tr key={c.id}>
                  <td><strong>{c.pacientes?.users?.name ?? 'N/D'}</strong></td>
                  <td>{c.medicos?.users?.name ?? 'N/D'}</td>
                  <td>{new Date(c.data_hora).toLocaleString('pt-MZ')}</td>
                  <td><span className={`badge ${bad.cls}`}>{bad.label}</span></td>
                </tr>
              );
            })}
            {ultimasConsultas.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma consulta recente.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Actividade Recente</h3>
        </div>
        <div style={{ padding: 16 }}>
          {actividadeRecente.length > 0 ? actividadeRecente.map((a) => (
            <div key={a.id} className="notif" style={{ marginBottom: 8 }}>
              <div className="nd nd-b"></div>
              <div>
                <strong>{a.mensagem}</strong>
                <span>{new Date(a.data).toLocaleString('pt-MZ')}</span>
              </div>
            </div>
          )) : <p style={{ fontSize: 13, color: 'var(--ink4)', textAlign: 'center', padding: 24 }}>Nenhuma actividade recente.</p>}
        </div>
      </div>
    </Shell>
  );
}
