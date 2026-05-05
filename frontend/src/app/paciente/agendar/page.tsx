'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';

interface Medico { id: number; especialidade: string; users: { name: string } }

export default function PacienteAgendarPage() {
  const router = useRouter();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedico, setSelectedMedico] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    request<{ data: Medico[] }>('/medicos')
      .then(res => setMedicos(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingLists(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedMedico || !data || !hora) { setError('Preencha todos os campos obrigatórios.'); return; }
    setLoading(true);
    try {
      // Obter o paciente_id do utilizador actual
      const perfil = await request<{ id: number }>('/pacientes/me');
      await request('/consultas', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: perfil.id,
          medico_id: +selectedMedico,
          data_hora: `${data}T${hora}:00.000Z`,
          motivo,
          status: 'agendada',
        }),
      });
      router.push('/paciente');
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const horarios = ['08:00','09:00','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];

  return (
    <PortalLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 24px' }}>
        <div className="ph"><div><h1>Agendar Consulta</h1><p className="sub">Escolha o médico e um horário disponível</p></div></div>
        <form onSubmit={handleSubmit} className="form-panel">
          {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="field">
            <label>Médico</label>
            <select value={selectedMedico} onChange={e => setSelectedMedico(e.target.value)} required disabled={loadingLists}>
              <option value="">{loadingLists ? 'Carregando...' : 'Seleccione um médico...'}</option>
              {medicos.map(m => (<option key={m.id} value={m.id}>{m.users?.name} — {m.especialidade}</option>))}
            </select>
          </div>
          <div className="field">
            <label>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} required />
          </div>
          <div className="field">
            <label>Hora</label>
            <select value={hora} onChange={e => setHora(e.target.value)} required>
              <option value="">Seleccione uma hora...</option>
              {horarios.map(h => (<option key={h} value={h}>{h}</option>))}
            </select>
          </div>
          <div className="field">
            <label>Motivo da consulta (opcional)</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Descreva brevemente o motivo..." />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Agendando...' : 'Confirmar agendamento'}</button>
            <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
