'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import Link from 'next/link';
import { request } from '@/lib/api';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string } };
}

interface MedicoDashboardData {
  consultasHoje: {
    total: number;
    lista: ConsultaItem[];
  };
  ultimasFichas?: ConsultaItem[];   // pode vir vazio
  // outros campos possíveis
  aguardando?: number;
  concluidas?: number;
  consultasMes?: number;
}

const statusBadge: Record<string, { cls: string; label: string }> = {
  agendada: { cls: 'bg-warn-dim text-warn', label: 'Aguarda'},
  realizada: { cls: 'bg-success-dim text-success', label: 'Realizada' },
  em_curso: { cls: 'bg-sky-dim text-sky', label: 'Em curso' },
  cancelada: { cls: 'bg-danger-dim text-danger', label: 'Cancelada' },
};

export default function MedicoDashboard() {
  const [data, setData] = useState<MedicoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<MedicoDashboardData>('/dashboard/medico')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Shell>
      <p className="text-ink-4 text-center p-8">A carregar dashboard...</p>
    </Shell>
  );
  if (!data) return (
    <Shell>
      <p className="text-danger text-center p-8">Erro ao carregar dados.</p>
    </Shell>
  );

  const { consultasHoje, ultimasFichas = [] } = data;
  // Usa valores padrão para campos que possam não vir
  const aguardando = data.aguardando ?? 0;
  const concluidas = data.concluidas ?? 0;
  const consultasMes = data.consultasMes ?? 0;

  return (
    <Shell>
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Bom dia</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/medico/attend" className="bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)] px-4 py-2 rounded-md font-medium transition shadow-[0_1px_3px_rgba(255,127,0,0.1)] hover:shadow-[0_4px_14px_rgba(255,127,0,0.25)]">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Iniciar Atendimento
        </Link>
      </div>
      <div className="stats">
        <div className="bg-sky-dim text-sky">
          <div className="ic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
          <h3>{consultasHoje.total}</h3>
          <p>Consultas Hoje</p>
        </div>
        <div className="bg-warn-dim text-warn">
          <div className="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
          <h3>{aguardando}</h3>
          <p>Aguardando</p>
        </div>
        <div className="bg-success-dim text-success">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
          <h3>{concluidas}</h3>
          <p>Concluídas</p>
        </div>
        <div className="bg-sky-dim text-sky">
          <div className="ic"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /></svg></div>
          <h3>{consultasMes}</h3>
          <p>Consultas este mês</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[var(--border2)] shadow-md">
        <div className="mb-4">
          <h3>Agenda de Hoje</h3>
          <Link href="/medico/attend" className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-3 py-1.5 rounded-md text-xs font-medium">Iniciar</Link>
        </div>
        <table>
          <thead>
            <tr><th>Hora</th><th>Paciente</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {consultasHoje.lista.map((c) => {
              const bad = statusBadge[c.status] || { cls: 'bn', label: c.status };
              return (
                <tr key={c.id}>
                  <td><strong>{new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</strong></td>
                  <td>{c.pacientes?.users?.name ?? 'N/D'}</td>
                  <td><span className={`badge ${bad.cls}`}>{bad.label}</span></td>
                </tr>
              );
            })}
            {consultasHoje.lista.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma consulta para hoje.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {ultimasFichas.length > 0 && (
        <div className="bg-white rounded-xl border border-[var(--border2)] shadow-md">
          <div className="mb-4"><h3>Últimas Fichas</h3></div>
          <table>
            <thead><tr><th>Paciente</th><th>Data</th><th>Estado</th></tr></thead>
            <tbody>
              {ultimasFichas.map((c) => (
                <tr key={c.id}>
                  <td>{c.pacientes?.users?.name ?? 'N/D'}</td>
                  <td>{new Date(c.data_hora).toLocaleDateString('pt-MZ')}</td>
                  <td><span className={`badge ${statusBadge[c.status]?.cls || 'bn'}`}>{statusBadge[c.status]?.label || c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
