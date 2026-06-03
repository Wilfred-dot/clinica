'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Paciente {
  id: number;
  users: { name: string };
}

interface Medico {
  id: number;
  especialidade: string;
  users: { name: string };
}

export default function AgendarConsultaPage() {
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
      } catch (err) {
        console.error('Erro ao carregar listas', err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedPaciente || !selectedMedico || !data || !hora) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await request('/consultas', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: +selectedPaciente,
          medico_id: +selectedMedico,
          data_hora: `${data}T${hora}:00.000Z`,
        }),
      });
      router.push('/admin/consultations');
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const horarios = [
    '08:00', '09:00', '10:00', '10:30', '11:00',
    '14:00', '14:30', '15:00', '15:30', '16:00',
  ];

  return (
    <Shell>
      {/* Cabeçalho padrão usando utilitários globais */}
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Agendar Consulta</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">Preencha os dados para marcar uma nova consulta</p>
        </div>
        <button className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium" onClick={() => router.back()}>
          ← Voltar
        </button>
      </div>

      {/* Form-panel limpo herdando do global.css */}
      <form onSubmit={handleSubmit} className="form-panel max-w-[680px]">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="form-section-title">
          Paciente e Médico
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Paciente</label>
            <select
              value={selectedPaciente}
              onChange={e => setSelectedPaciente(e.target.value)}
              required
              disabled={loadingLists}
              className="form-select text-[#102A6B]"
            >
              <option value="">
                {loadingLists ? 'Carregando...' : 'Seleccione um paciente...'}
              </option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.users?.name || `Paciente #${p.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Médico</label>
            <select
              value={selectedMedico}
              onChange={e => setSelectedMedico(e.target.value)}
              required
              disabled={loadingLists}
              className="form-select text-[#102A6B]"
            >
              <option value="">
                {loadingLists ? 'Carregando...' : 'Seleccione um médico...'}
              </option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>
                  Dr(a). {m.users?.name || `Médico #${m.id}`} — {m.especialidade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr />

        <div className="form-section-title">
          Data e Hora
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              required
              className="form-control text-[#102A6B]"
            />
          </div>
          
          <div className="form-group">
            <label>Hora</label>
            <select
              value={hora}
              onChange={e => setHora(e.target.value)}
              required
              className="form-select text-[#102A6B]"
            >
              <option value="">Seleccione uma hora...</option>
              {horarios.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Acções estruturadas via global.css */}
        <div className="form-actions mt-8">
          <button type="submit" disabled={loading} className="btn btn-primary h-12 px-6">
            {loading ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline h-12 px-5">
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}