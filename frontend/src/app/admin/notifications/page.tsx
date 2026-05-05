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
    if (!mensagem.trim() || !pacienteId) return;
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
      <div className="ph">
        <div>
          <h1>Notificações</h1>
          <p className="sub">Gerir notificações enviadas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova notificação
        </button>
      </div>

      {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSend} className="form-panel" style={{ marginBottom: 20 }}>
          <div className="form-section-title">Enviar notificação manual</div>
          <div className="form-row">
            <div className="field">
              <label>Paciente ID</label>
              <input type="number" value={pacienteId} onChange={e => setPacienteId(e.target.value)} required />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="lembrete_consulta">Lembrete de consulta</option>
                <option value="confirmacao">Confirmação</option>
                <option value="alerta">Alerta</option>
                <option value="resultado_exame">Resultado de exame</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Mensagem</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} required rows={3} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Enviando...' : 'Enviar notificação'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-head"><h3>Histórico de notificações</h3></div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Paciente</th><th>Tipo</th><th>Mensagem</th></tr></thead>
            <tbody>
              {notificacoes.map(n => (
                <tr key={n.id}>
                  <td>{new Date(n.data_envio).toLocaleString('pt-MZ')}</td>
                  <td><strong>{n.paciente}</strong></td>
                  <td><span className={`badge ${n.tipo_variavel === 'lembrete_consulta' ? 'bw' : n.tipo_variavel === 'confirmacao' ? 'bg' : 'bb'}`}>{n.tipo_variavel}</span></td>
                  <td>{n.mensagem}</td>
                </tr>
              ))}
              {notificacoes.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma notificação enviada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
