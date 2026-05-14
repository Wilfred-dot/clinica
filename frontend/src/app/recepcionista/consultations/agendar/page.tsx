'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Paciente { id: number; users: { name: string } }
interface Medico { id: number; especialidade: string; users: { name: string } }

export default function ReceptionAgendarPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          request<{ data: Paciente[] }>('/pacientes'),
          request<{ data: Medico[] }>('/medicos'),
        ]);
        setPacientes(pRes.data ?? []);
        setMedicos(mRes.data ?? []);
      } catch (err) { console.error('Erro ao carregar listas', err); }
      finally { setLoadingLists(false); }
    };
    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedPaciente || !selectedMedico || !data || !hora) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      await request('/consultas', { method:'POST', body: JSON.stringify({ paciente_id: +selectedPaciente, medico_id: +selectedMedico, data_hora: `${data}T${hora}:00.000Z` }) });
      router.push('/recepcionista/consultations');
    } catch (err: any) { setError(err.message || 'Erro ao agendar consulta'); }
    finally { setLoading(false); }
  };

  const horarios = ['08:00','09:00','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];

  return (
    <Shell>
      <div className="ph"><div><h1>Agendar Consulta</h1><p className="sub">Preencha os dados para marcar uma nova consulta</p></div><button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button></div>
      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom:16 }}>{error}</div>}
        <div className="form-section-title">Paciente e Médico</div>
        <div className="form-row">
          <div className="field"><label>Paciente</label><select value={selectedPaciente} onChange={e => setSelectedPaciente(e.target.value)} required disabled={loadingLists}><option value="">{loadingLists?'Carregando...':'Seleccione um paciente...'}</option>{pacientes.map(p => (<option key={p.id} value={p.id}>{p.users?.name || `Paciente #${p.id}`}</option>))}</select></div>
          <div className="field"><label>Médico</label><select value={selectedMedico} onChange={e => setSelectedMedico(e.target.value)} required disabled={loadingLists}><option value="">{loadingLists?'Carregando...':'Seleccione um médico...'}</option>{medicos.map(m => (<option key={m.id} value={m.id}>{m.users?.name || `Médico #${m.id}`} — {m.especialidade}</option>))}</select></div>
        </div>
        <div className="form-sep" />
        <div className="form-section-title">Data e Hora</div>
        <div className="form-row">
          <div className="field"><label>Data</label><input type="date" value={data} onChange={e => setData(e.target.value)} required /></div>
          <div className="field"><label>Hora</label><select value={hora} onChange={e => setHora(e.target.value)} required><option value="">Seleccione uma hora...</option>{horarios.map(h => (<option key={h} value={h}>{h}</option>))}</select></div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Agendando...':'Confirmar agendamento'}</button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </Shell>
  );
}
