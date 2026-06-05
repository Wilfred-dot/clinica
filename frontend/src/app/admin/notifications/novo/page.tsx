'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

export default function NovaNotificacaoPage() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [tipo, setTipo] = useState('lembrete_consulta');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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
      router.push('/admin/notifications');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar notificacao');
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell>
      {/* Cabecalho */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Nova Notificacao</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">Enviar notificacao manual para um paciente</p>
        </div>
        <button className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium" onClick={() => router.back()}>
          Voltar
        </button>
      </div>

      {/* Form panel  */}
      <form onSubmit={handleSend} className="form-panel max-w-[680px]">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="form-section-title">
          Dados da Notificacao
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>ID do Paciente</label>
            <input
              type="number"
              value={pacienteId}
              onChange={e => setPacienteId(e.target.value)}
              required
              className="form-control"
              placeholder="Ex: 123"
            />
          </div>
          <div className="form-group">
            <label>Tipo de Alerta</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="form-select"
            >
              <option value="lembrete_consulta">Lembrete de consulta</option>
              <option value="confirmacao">Confirmacao</option>
              <option value="alerta">Alerta</option>
              <option value="resultado_exame">Resultado de exame</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Conteudo da mensagem</label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            required
            rows={4}
            className="form-control"
            placeholder="Digite a mensagem a ser enviada ao paciente..."
          />
        </div>

        <div className="form-actions mt-8">
          <button type="submit" disabled={sending} className="btn btn-primary h-12 px-6">
            {sending ? 'A enviar...' : 'Enviar notificacao'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline h-12 px-5">
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}