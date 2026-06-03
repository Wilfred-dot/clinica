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
  lembrete_consulta: { bg: 'bg-[var(--warn-dim)]', text: 'text-[var(--warn)]', dot: 'bg-[var(--warn)]', label: 'Lembrete' },
  confirmacao:       { bg: 'bg-[var(--success-dim)]', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]', label: 'Confirmação' },
  alerta:            { bg: 'bg-[var(--danger-dim)]', text: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]', label: 'Alerta' },
  resultado_exame:   { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]', label: 'Resultado' },
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
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-[-0.3px]">Notificações</h1>
          <p className="text-[13px] text-[var(--ink3)] mt-1">Gerir notificações enviadas</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-[var(--mmq-orange)]"
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
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-[var(--danger)] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span>
          {error}
        </div>
      )}

      {/* Card com tabela de histórico */}
      <div className="bg-white rounded-[12px] border border-[var(--border2)] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
        <div className="flex items-center justify-between p-[16px_22px] border-b border-[var(--border2)]">
          <h3 className="text-[14.5px] font-bold text-[var(--ink)]">Histórico de notificações</h3>
        </div>
        {loading ? (
          <p className="p-6 text-center text-[var(--ink4)]">A carregar...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[var(--slate)] text-[11px] font-bold text-[var(--ink3)] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[var(--border2)]">Data</th>
                <th className="bg-[var(--slate)] text-[11px] font-bold text-[var(--ink3)] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[var(--border2)]">Paciente</th>
                <th className="bg-[var(--slate)] text-[11px] font-bold text-[var(--ink3)] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[var(--border2)]">Tipo</th>
                <th className="bg-[var(--slate)] text-[11px] font-bold text-[var(--ink3)] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[var(--border2)]">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {notificacoes.map(n => {
                const badge = tipoBadge[n.tipo_variavel] || { bg: 'bg-[var(--slate2)]', text: 'text-[var(--ink3)]', dot: 'bg-[var(--ink4)]', label: n.tipo_variavel };
                return (
                  <tr key={n.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">{new Date(n.data_envio).toLocaleString('pt-MZ')}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)] font-semibold">{n.paciente}</td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">{n.mensagem}</td>
                  </tr>
                );
              })}
              {notificacoes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-[var(--ink4)] py-6">
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