'use client';

import { useEffect, useState } from 'react';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  medicos: { users: { name: string }; especialidade: string };
}

interface Notificacao {
  id: number;
  mensagem: string;
  data_envio: string;
  tipo_variavel: string;
}

export default function PacienteDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const perfil = await request<{ id: number; users: { name: string } }>('/pacientes/me');
        setNome(perfil?.users?.name || 'Paciente');
        if (perfil?.id) {
          const cons = await request<Consulta[]>(`/consultas?status=agendada`);
          setConsultas(Array.isArray(cons) ? cons.slice(0, 5) : []);
        }
        const notifs = await request<Notificacao[]>('/notificacoes/minhas');
        setNotificacoes(notifs.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dados do paciente', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função para formato de data
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-ink-4">A carregar dashboard...</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="px-6 py-8">
        {/* Cabeçalho com saudação e botão de logout */}
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div>
            <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">
              Olá, {nome}
            </h1>
            <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
              Clínica MMQ Oftalmologia
            </p>
            <p className="text-[13px] text-[var(--mmq-orange)] mt-1 font-medium">
              {consultas.length} consulta(s) agendada(s)
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 h-10 text-[13.5px] font-bold text-ink-3 transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sair
          </button>
        </div>

        {/* Próximas Consultas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[13px] font-bold text-ink-3 uppercase tracking-[0.8px]">
              Próximas Consultas
            </h2>
            {consultas.length > 0 && (
              <Link
                href="/paciente/historico"
                className="text-[11px] font-bold text-[var(--mmq-orange)] hover:underline"
              >
                Ver todas →
              </Link>
            )}
          </div>
          
          {consultas.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {consultas.map(c => (
                <div 
                  key={c.id} 
                  className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] p-[20px_22px] shadow-[0_2px_4px_rgba(16,42,107,.03)] transition hover:border-[var(--mmq-orange)] hover:shadow-[0_6px_24px_rgba(12,26,39,.10)]"
                >
                  <div className="text-[11px] font-bold text-[var(--mmq-orange)] uppercase tracking-[0.5px] mb-1.5">
                    {formatDate(c.data_hora)} · {formatTime(c.data_hora)}
                  </div>
                  <h4 className="text-[15px] font-bold text-[var(--ink)] mb-0.5">{c.medicos?.users?.name}</h4>
                  <p className="text-[13px] text-ink-3">{c.medicos?.especialidade}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[20px] text-[11px] font-bold uppercase tracking-[0.3px] bg-warn-dim text-warn">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-warn"></span>
                      Agendada
                    </span>
                    <button 
                      className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-[11px] font-bold border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={() => {/* lógica de cancelamento */}}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] p-8 text-center">
              <p className="text-[13px] text-ink-3 font-medium">Nenhuma consulta agendada.</p>
              <Link
                href="/paciente/agendar"
                className="inline-block mt-3 text-[13px] font-bold text-[var(--mmq-orange)] hover:underline"
              >
                Agendar nova consulta →
              </Link>
            </div>
          )}
        </div>

        {/* Grade inferior: notificações + ações */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          
          {/* Notificações */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-[13px] font-bold text-ink-3 uppercase tracking-[0.8px]">
                Notificações
              </h2>
              {notificacoes.length > 0 && (
                <Link
                  href="/paciente/notificacoes"
                  className="text-[11px] font-bold text-[var(--mmq-orange)] hover:underline"
                >
                  Ver todas →
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {notificacoes.length > 0 ? (
                notificacoes.map(n => {
                  const dotColor = n.tipo_variavel === 'confirmacao' 
                    ? 'bg-[var(--sky)]' 
                    : n.tipo_variavel === 'alerta' 
                      ? 'bg-warn' 
                      : 'bg-[var(--mmq-orange)]';
                  return (
                    <div 
                      key={n.id} 
                      className="flex gap-3 items-start p-3 rounded-[8px] border border-[var(--border2)] bg-[var(--white)] shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-[var(--mmq-orange)] transition"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`}></div>
                      <div>
                        <strong className="font-semibold text-[13.5px] text-[var(--ink)]">{n.mensagem}</strong>
                        <span className="block text-xs text-ink-3 mt-0.5">{new Date(n.data_envio).toLocaleString('pt-MZ')}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[var(--white)] rounded-[8px] border border-[var(--border2)] p-6 text-center">
                  <p className="text-[13px] text-ink-3 font-medium">Sem notificações.</p>
                </div>
              )}
            </div>
          </div>

          {/* Acções rápidas */}
          <div>
            <h2 className="text-[13px] font-bold text-ink-3 uppercase tracking-[0.8px] mb-3.5">
              Ações Rápidas
            </h2>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/paciente/agendar"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agendar nova consulta
              </Link>
              <Link
                href="/paciente/historico"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Ver histórico clínico
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-ink-3 transition hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}