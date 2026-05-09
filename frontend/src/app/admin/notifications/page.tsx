'use client';

import { useEffect, useState } from 'react';
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
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [tipo, setTipo] = useState('lembrete_consulta');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fetchNotificacoes = () => {
    setLoading(true);
    request<Notificacao[]>('/notificacoes')
      .then(data => setNotificacoes(data ?? []))
      .catch(() => setError('Erro ao carregar notificações'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotificacoes(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!mensagem.trim() || !pacienteId) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSending(true);
    try {
      await request('/notificacoes', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: +pacienteId,
          mensagem: mensagem.trim(),
          tipo_variavel: tipo,
        }),
      });
      setMensagem('');
      setPacienteId('');
      setShowForm(false);
      fetchNotificacoes();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

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
          onClick={() => setShowForm(!showForm)}
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

      {/* Formulário condicional */}
      {showForm && (
        <form
          onSubmit={handleSend}
          className="bg-white border border-[#ecf1f6] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_1px_3px_rgba(12,26,39,0.05)] mb-5"
        >
          <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
            Enviar notificação manual
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
                Paciente ID
              </label>
              <input
                type="number"
                value={pacienteId}
                onChange={e => setPacienteId(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="lembrete_consulta">Lembrete de consulta</option>
                <option value="confirmacao">Confirmação</option>
                <option value="alerta">Alerta</option>
                <option value="resultado_exame">Resultado de exame</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              required
              rows={3}
              className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition resize-y focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#007d74] px-5 h-12 text-sm font-semibold text-white transition hover:bg-[#009d92] disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar notificação'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-5 h-12 text-sm font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
            >
              Cancelar
            </button>
          </div>
        </form>
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