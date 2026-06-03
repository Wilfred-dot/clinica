'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Notificacao {
  id: number;
  mensagem: string;
  tipo_variavel: string;
  data_envio: string;
  paciente: string;
}

// Mapeamento dos tipos de notificação para badges coloridas
const tipoBadge: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  lembrete_consulta: { bg: 'bg-[#fef8ec]', text: 'text-[#b87a00]', dot: 'bg-[#b87a00]', label: 'Lembrete' },
  confirmacao:       { bg: 'bg-[#edf7f2]', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]', label: 'Confirmação' },
  alerta:            { bg: 'bg-[#fdf0f0]', text: 'text-[#b83232]', dot: 'bg-[#b83232]', label: 'Alerta' },
  resultado_exame:   { bg: 'bg-[#e6f0fb]', text: 'text-[#1258a8]', dot: 'bg-[#1258a8]', label: 'Resultado' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotificacoes = () => {
    setLoading(true);
    request<Notificacao[]>('/notificacoes')
      .then(data => setNotificacoes(data ?? []))
      .catch(() => setError('Erro ao carregar notificações'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotificacoes(); }, []);

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Notificações</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Gerir notificações enviadas</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#007d74] px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]"
          onClick={() => router.push('/admin/notifications/novo')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova notificação
        </button>
      </div>

      {/* Erro geral */}
      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f0] text-[#b83232] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b83232]"></span>
          {error}
        </div>
      )}

      {/* Card com tabela de histórico */}
      <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
        <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
          <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Histórico de notificações</h3>
        </div>
        {loading ? (
          <p className="p-6 text-center text-[#a8bfcf]">A carregar...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Data</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Paciente</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Tipo</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {notificacoes.map(n => {
                const badge = tipoBadge[n.tipo_variavel] || { bg: 'bg-[#e8eef4]', text: 'text-[#6b8299]', dot: 'bg-[#a8bfcf]', label: n.tipo_variavel };
                return (
                  <tr key={n.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{new Date(n.data_envio).toLocaleString('pt-MZ')}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27] font-semibold">{n.paciente}</td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{n.mensagem}</td>
                  </tr>
                );
              })}
              {notificacoes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-[#a8bfcf] py-6">
                    Nenhuma notificação enviada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}