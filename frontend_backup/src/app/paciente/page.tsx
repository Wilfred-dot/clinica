'use client';

import { useEffect, useState } from 'react';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';
import Link from 'next/link';

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

  return (
    <PortalLayout>
      {/* Container com largura máxima e padding centralizado */}
      <div className="max-w-[960px] mx-auto px-6 py-8">
        {/* Banner de boas-vindas */}
        <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#0c1a27] via-[#0b2640] to-[#073c34] p-8 flex items-center gap-5 mb-7">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_500px_300px_at_80%_50%,rgba(0,125,116,.18),transparent_65%)] pointer-events-none" />
          <div className="relative w-14 h-14 rounded-full bg-[rgba(0,125,116,.3)] border-2 border-[rgba(0,157,146,.5)] flex items-center justify-center text-white font-bold text-lg shrink-0">
            {nome.charAt(0)}
          </div>
          <div className="relative">
            <h2 className="text-xl font-bold text-white">Olá, {nome}</h2>
            <p className="text-[13px] text-[rgba(255,255,255,.45)] mt-1">Clínica MMQ Oftalmologia · Paciente desde Janeiro de 2023</p>
          </div>
        </div>

        {/* Próximas Consultas */}
        <div className="text-[11.5px] font-bold text-[#6b8299] uppercase tracking-[0.8px] mb-3.5">
          Próximas Consultas
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5 mb-6">
          {consultas.length > 0 ? consultas.map(c => (
            <div key={c.id} className="bg-white rounded-[12px] border border-[#ecf1f6] p-4 shadow-[0_1px_3px_rgba(12,26,39,.05)] transition hover:shadow-[0_6px_24px_rgba(12,26,39,.10)]">
              <div className="text-[11px] font-bold text-[#007d74] uppercase tracking-[0.5px] mb-1.5">
                {formatDate(c.data_hora)} · {formatTime(c.data_hora)}
              </div>
              <h4 className="text-[14px] font-bold text-[#0c1a27] mb-0.5">{c.medicos?.users?.name}</h4>
              <p className="text-[12.5px] text-[#6b8299]">{c.medicos?.especialidade}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold bg-[#fef8ec] text-[#b87a00]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#b87a00]"></span>
                  Agendada
                </span>
                {/* Botão cancelar opcional – mantemos o comportamento do original */}
                <button className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-xs font-semibold bg-transparent text-[#b83232] border border-[#f0c4c4] transition hover:bg-[#fdf0f0]"
                  onClick={() => {/* lógica de cancelamento */}}>
                  Cancelar
                </button>
              </div>
            </div>
          )) : (
            <p className="text-[13px] text-[#a8bfcf] col-span-full">Nenhuma consulta agendada.</p>
          )}
        </div>

        {/* Grade inferior: notificações + ações */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-start">
          {/* Notificações */}
          <div>
            <div className="text-[11.5px] font-bold text-[#6b8299] uppercase tracking-[0.8px] mb-3.5">
              Notificações
            </div>
            <div className="flex flex-col gap-2">
              {notificacoes.length > 0 ? notificacoes.map(n => {
                const dotColor = n.tipo_variavel === 'confirmacao' ? 'bg-[#1258a8]' : n.tipo_variavel === 'alerta' ? 'bg-[#b87a00]' : 'bg-[#007d74]';
                return (
                  <div key={n.id} className="flex gap-3 items-start p-3 rounded-[8px] border border-[#ecf1f6] bg-white shadow-[0_1px_3px_rgba(12,26,39,.05)]">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotColor}`}></div>
                    <div>
                      <strong className="font-semibold text-[13.5px] text-[#0c1a27]">{n.mensagem}</strong>
                      <span className="block text-xs text-[#6b8299] mt-0.5">{new Date(n.data_envio).toLocaleString('pt-MZ')}</span>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-[13px] text-[#a8bfcf]">Sem notificações.</p>
              )}
            </div>
          </div>

          {/* Acções rápidas */}
          <div>
            <div className="text-[11.5px] font-bold text-[#6b8299] uppercase tracking-[0.8px] mb-3.5">
              Acções
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/paciente/agendar"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] bg-[#007d74] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agendar nova consulta
              </Link>
              <Link href="/paciente/historico"
                className="w-full flex items-center justify-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9]">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                </svg>
                Ver histórico clínico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}