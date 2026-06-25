'use client';

import { useEffect, useState, useCallback } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string } };
}

const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn' },
  realizada: { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  em_curso:  { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]' },
  cancelada: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger' },
};

export default function MedicoAttendPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadConsultas = useCallback(() => {
    setLoading(true);
    setError(false);
    request<{ consultasHoje: { lista: Consulta[] } }>('/dashboard/medico')
      .then(data => setConsultas(data?.consultasHoje?.lista ?? []))
      .catch((err) => {
        console.error("Erro ao carregar consultas:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConsultas();
  }, [loadConsultas]);

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/D';
    try {
      return new Date(isoString).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/D';
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-ink-4">A carregar consultas...</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="p-8 text-center">
          <p className="text-danger">Erro ao carregar dados.</p>
          <button onClick={loadConsultas} className="mt-4 px-4 py-2 bg-[var(--mmq-orange)] text-white rounded-md">
            Tentar novamente
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Atendimento</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
            {new Date().toLocaleDateString('pt-MZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-[13px] text-[var(--mmq-orange)] mt-1 font-medium">
            {consultas.length} consulta(s) agendada(s) para hoje
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/medico/records/novo"
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-5 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Ficha
          </Link>
        </div>
      </div>

      {/* Card da lista de consultas */}
      <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border2)]">
          <h3 className="text-[15px] font-bold text-[var(--ink)]">Agenda de Hoje</h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--sky-dim)] text-[var(--sky)]">
            {consultas.length} registos
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-ink-3 animate-pulse">A carregar consultas...</p>
        ) : consultas.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <svg className="h-10 w-10 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm font-medium text-ink-3">Nenhuma consulta agendada para hoje.</p>
              <p className="text-xs text-ink-4">Volte mais tarde para ver novas consultas</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border2)]">
            {consultas.map((c, index) => {
              const statusKey = c.status?.toLowerCase() || 'agendada';
              const bad = statusBadgeClasses[statusKey] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4' };
              const patientName = c.pacientes?.users?.name ?? 'N/D';
              
              return (
                <Link
                  href={`/medico/consulta/${c.id}`}
                  key={c.id}
                  className="block hover:bg-[var(--slate)] transition-colors"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${Math.min(index * 0.05, 0.3)}s both`
                  }}
                >
                  <div className="flex items-center gap-4 p-4 px-5">
                    {/* Hora */}
                    <div className="min-w-[60px] text-sm font-semibold text-[var(--ink)]">
                      {formatTime(c.data_hora)}
                    </div>

                    {/* Separador vertical */}
                    <div className="w-px h-8 bg-[var(--border2)] flex-shrink-0" />

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[var(--mmq-orange)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {patientName.charAt(0).toUpperCase()}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--ink)] truncate">
                        {patientName}
                      </div>
                      <div className="text-xs text-ink-3 truncate">
                        {c.medicos?.users?.name ?? '—'}
                      </div>
                    </div>

                    {/* Badge de status */}
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[20px] text-[11px] font-bold uppercase tracking-[0.3px] ${bad.bg} ${bad.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${bad.dot}`}></span>
                        {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ') : 'N/D'}
                      </span>
                    </div>

                    {/* Seta indicadora */}
                    <svg className="w-4 h-4 text-ink-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Shell>
  );
}