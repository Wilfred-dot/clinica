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

const tipoBadge: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  lembrete_consulta: { bg: 'bg-[#fef8ec]', text: 'text-[#b87a00]', dot: 'bg-[#b87a00]', label: 'Lembrete' },
  confirmacao:       { bg: 'bg-[#edf7f2]', text: 'text-[#10b981]', dot: 'bg-[#10b981]', label: 'Confirmação' },
  alerta:            { bg: 'bg-[#fdf0f0]', text: 'text-[#ef4444]', dot: 'bg-[#ef4444]', label: 'Alerta' },
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
  const [isMounted, setIsMounted] = useState(false);

  // Garante a sincronização de datas no lado do cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          paciente_id: parseInt(pacienteId, 10),
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
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[#102A6B] tracking-[-0.5px]">
            Notificações
          </h1>
          <p className="text-[13px] text-[#6b8299] mt-0.5 font-medium">
            Gerir notificações enviadas aos utentes da clínica
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#FF7F00] px-4 py-2 text-[13.5px] font-bold text-white transition hover:bg-[#E06F00] shadow-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showForm ? 'Fechar formulário' : 'Nova notificação'}
        </button>
      </div>

      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f0] text-[#b83232] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b83232]"></span>
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSend}
          className="bg-white border border-[#ecf1f6] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_2px_4px_rgba(16,42,107,.03)] mb-6"
        >
          <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
            Enviar notificação manual
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
                ID do Paciente
              </label>
              <input
                type="number"
                value={pacienteId}
                onChange={e => setPacienteId(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
                Tipo de Alerta
              </label>
              <div className="relative">
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] pr-[34px] appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                >
                  <option value="lembrete_consulta">Lembrete de consulta</option>
                  <option value="confirmacao">Confirmação</option>
                  <option value="alerta">Alerta</option>
                  <option value="resultado_exame">Resultado de exame</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Conteúdo da mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              required
              rows={3}
              className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition resize-y focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
          <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FF7F00] px-5 h-12 text-sm font-bold text-white transition hover:bg-[#E06F00] shadow-sm disabled:opacity-50"
            >
              {sending ? 'A enviar...' : 'Enviar notificação'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-5 h-12 text-sm font-bold text-[#6b8299] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#ecf1f6] rounded-[12px] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="p-5 border-b border-[#ecf1f6]">
          <h3 className="text-[15px] font-bold text-[#102A6B]">
            Histórico de Notificações
          </h3>
        </div>
        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-[#6b8299]">A carregar...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#ecf1f6] bg-[#f8fafc]">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b8299] w-48">Data de Envio</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b8299] w-56">Paciente</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b8299] w-36">Tipo</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b8299]">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecf1f6]">
                {notificacoes.map(n => {
                  const badge = tipoBadge[n.tipo_variavel] || { 
                    bg: 'bg-[#e8eef4]', 
                    text: 'text-[#6b8299]', 
                    dot: 'bg-[#a8bfcf]', 
                    label: n.tipo_variavel 
                  };
                  return (
                    <tr key={n.id} className="hover:bg-[#fdfeff] transition-colors">
                      <td className="p-4 pl-5 text-sm font-medium text-[#6b8299]">
                        {isMounted ? new Date(n.data_envio).toLocaleString('pt-MZ') : '—'}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#102A6B]">
                        {n.paciente}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#4a5e73] font-medium max-w-md truncate" title={n.mensagem}>
                        {n.mensagem}
                      </td>
                    </tr>
                  );
                })}
                {notificacoes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-12 text-sm font-medium text-[#6b8299]">
                      Nenhuma notificação encontrada no histórico.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}