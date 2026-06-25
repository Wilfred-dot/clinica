'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Prescricao {
  id: number;
  medicamento: string;
  dosagem: string;
  instrucoes?: string;
  data_prescricao: string;
}

interface Consulta {
  id: number;
  paciente_id: number;
  medico_id: number;
  data_hora: string;
  status: string;
  observacoes: string | null;
  pacientes: {
    id: number;
    users: { name: string; email: string };
    data_nascimento: string;
    sexo: string;
    telefone: string;
    endereco: string;
    historico_medico: string | null;
  };
  medicos: {
    id: number;
    especialidade: string;
    numero_ordem: string;
    users: { name: string; email: string };
  };
  prescricoes: Prescricao[];
}

const statusBadgeClasses: Record<string, { bg: string; text: string; dot: string }> = {
  agendada:  { bg: 'bg-warn-dim', text: 'text-warn', dot: 'bg-warn' },
  realizada: { bg: 'bg-success-dim', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  em_curso:  { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]' },
  cancelada: { bg: 'bg-[var(--danger-dim)]', text: 'text-danger', dot: 'bg-danger' },
};

export default function MedicoConsultaPage() {
  const params = useParams();
  const router = useRouter();
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  // campos clínicos
  const [motivo, setMotivo] = useState('');
  const [acuidadeOD, setAcuidadeOD] = useState('');
  const [acuidadeOE, setAcuidadeOE] = useState('');
  const [pressaoOD, setPressaoOD] = useState<number | ''>('');
  const [pressaoOE, setPressaoOE] = useState<number | ''>('');
  const [diagnostico, setDiagnostico] = useState('');
  const [planoTratamento, setPlanoTratamento] = useState('');
  // prescrição
  const [medicamento, setMedicamento] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  // estados
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [prescribing, setPrescribing] = useState(false);

  useEffect(() => {
    request<Consulta>(`/consultas/${params.id}`)
      .then(data => {
        setConsulta(data);
        setPrescricoes(data.prescricoes ?? []);
        if (data.observacoes) {
          try {
            const clinico = JSON.parse(data.observacoes);
            setMotivo(clinico.motivo || '');
            setAcuidadeOD(clinico.acuidade_visual_od || '');
            setAcuidadeOE(clinico.acuidade_visual_oe || '');
            setPressaoOD(clinico.pressao_od || '');
            setPressaoOE(clinico.pressao_oe || '');
            setDiagnostico(clinico.diagnostico || '');
            setPlanoTratamento(clinico.plano_tratamento || '');
          } catch {}
        }
      })
      .catch(() => setError('Erro ao carregar consulta'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const buildObservacoes = () =>
    JSON.stringify({
      motivo,
      acuidade_visual_od: acuidadeOD,
      acuidade_visual_oe: acuidadeOE,
      pressao_od: pressaoOD,
      pressao_oe: pressaoOE,
      diagnostico,
      plano_tratamento: planoTratamento,
    });

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await request(`/consultas/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ observacoes: buildObservacoes() }),
      });
      const updated = await request<Consulta>(`/consultas/${params.id}`);
      setConsulta(updated);
    } catch (err: any) {
      setError(err.message || 'Erro ao guardar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setError('');
    setFinalizing(true);
    try {
      await request(`/consultas/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ observacoes: buildObservacoes(), status: 'realizada' }),
      });
      router.push('/medico/attend');
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar consulta');
      setFinalizing(false);
    }
  };

  const handleAddPrescricao = async () => {
    if (!medicamento.trim() || !dosagem.trim()) return;
    setPrescribing(true);
    try {
      const nova = await request<Prescricao>('/prescricoes', {
        method: 'POST',
        body: JSON.stringify({
          consulta_id: +params.id,
          medicamento: medicamento.trim(),
          dosagem: dosagem.trim(),
          instrucoes: instrucoes.trim() || undefined,
        }),
      });
      setPrescricoes(prev => [...prev, nova]);
      setMedicamento('');
      setDosagem('');
      setInstrucoes('');
    } catch (err: any) {
      setError(err.message || 'Erro ao emitir prescrição');
    } finally {
      setPrescribing(false);
    }
  };

  if (loading) return (
    <Shell>
      <div className="flex items-center justify-center h-64">
        <p className="text-ink-4">A carregar consulta...</p>
      </div>
    </Shell>
  );
  
  if (!consulta) return (
    <Shell>
      <div className="p-8 text-center">
        <p className="text-danger">Consulta não encontrada.</p>
        <button onClick={() => router.push('/medico/attend')} className="mt-4 px-4 py-2 bg-[var(--mmq-orange)] text-white rounded-md">
          Voltar para agenda
        </button>
      </div>
    </Shell>
  );

  const patient = consulta.pacientes;
  const doctor = consulta.medicos;
  const isRealizada = consulta.status === 'realizada';
  const statusBadge = statusBadgeClasses[consulta.status] || { bg: 'bg-slate2', text: 'text-ink-3', dot: 'bg-ink-4' };

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Atendimento</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
            {patient?.users?.name} · {new Date(consulta.data_hora).toLocaleDateString('pt-MZ')} às{' '}
            {new Date(consulta.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusBadge.bg} ${statusBadge.text}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
              {consulta.status ? consulta.status.charAt(0).toUpperCase() + consulta.status.slice(1).replace('_', ' ') : 'N/D'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 h-10 text-[13.5px] font-bold text-ink-3 transition hover:bg-slate"
            onClick={() => router.push('/medico/attend')}
          >
            ← Agenda
          </button>
          {!isRealizada && (
            <button
              className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-5 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
              onClick={handleFinalize}
              disabled={finalizing}
            >
              {finalizing ? 'Finalizando...' : 'Concluir Consulta'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      )}

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Coluna Esquerda - Dados do Paciente e Prescrições */}
        <div className="flex flex-col gap-6">
          {/* Card do Paciente */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--mmq-orange)] text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                  {patient?.users?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--ink)]">{patient?.users?.name}</h3>
                  <p className="text-sm text-ink-3">
                    {patient?.data_nascimento
                      ? `${new Date().getFullYear() - new Date(patient.data_nascimento).getFullYear()} anos`
                      : 'Idade desconhecida'}{' '}
                    · {patient?.sexo === 'M' ? 'Masculino' : patient?.sexo === 'F' ? 'Feminino' : 'Outro'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px]">Contacto</div>
                  <div className="text-sm font-medium text-[var(--ink)]">{patient?.telefone || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px]">Alergias</div>
                  <div className="text-sm font-medium text-danger">{patient?.historico_medico || 'Nenhuma'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px]">Médico</div>
                  <div className="text-sm font-medium text-[var(--ink)]">{doctor?.users?.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px]">Especialidade</div>
                  <div className="text-sm font-medium text-[var(--ink)]">{doctor?.especialidade}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prescrições */}
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border2)]">
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Prescrições</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--sky-dim)] text-[var(--sky)]">
                {prescricoes.length} registos
              </span>
            </div>
            <div className="p-5">
              {prescricoes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-ink-3">Nenhuma prescrição emitida.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[var(--slate)]">
                        <th className="text-[11px] font-bold uppercase tracking-[0.6px] p-3 text-left text-ink-3">Medicamento</th>
                        <th className="text-[11px] font-bold uppercase tracking-[0.6px] p-3 text-left text-ink-3">Dosagem</th>
                        <th className="text-[11px] font-bold uppercase tracking-[0.6px] p-3 text-left text-ink-3">Instruções</th>
                        <th className="text-[11px] font-bold uppercase tracking-[0.6px] p-3 text-left text-ink-3">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border2)]">
                      {prescricoes.map(p => (
                        <tr key={p.id} className="hover:bg-[var(--slate)] transition-colors">
                          <td className="p-3 text-sm font-bold text-[var(--ink)]">{p.medicamento}</td>
                          <td className="p-3 text-sm font-medium text-ink-3">{p.dosagem}</td>
                          <td className="p-3 text-sm font-medium text-ink-3">{p.instrucoes || '—'}</td>
                          <td className="p-3 text-sm font-medium text-ink-3">
                            {new Date(p.data_prescricao).toLocaleDateString('pt-MZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isRealizada && (
                <div className="mt-4 pt-4 border-t border-[var(--border2)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Medicamento</label>
                      <input
                        type="text"
                        value={medicamento}
                        onChange={e => setMedicamento(e.target.value)}
                        placeholder="Nome do medicamento"
                        className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Dosagem</label>
                      <input
                        type="text"
                        value={dosagem}
                        onChange={e => setDosagem(e.target.value)}
                        placeholder="Ex: 500mg 2x/dia"
                        className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Instruções (opcional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={instrucoes}
                          onChange={e => setInstrucoes(e.target.value)}
                          placeholder="Tomar após refeição"
                          className="flex-1 px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                        />
                        <button
                          onClick={handleAddPrescricao}
                          disabled={prescribing || !medicamento.trim() || !dosagem.trim()}
                          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] disabled:opacity-50 transition-all duration-200 shadow-sm"
                        >
                          {prescribing ? '...' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Dados Clínicos */}
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden transition hover:border-[var(--mmq-orange)] p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Motivo da consulta</label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  rows={3}
                  disabled={isRealizada}
                  className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 resize-y disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Acuidade Visual</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-ink-3 mb-0.5">Olho Direito (OD)</label>
                    <input
                      type="text"
                      value={acuidadeOD}
                      onChange={e => setAcuidadeOD(e.target.value)}
                      placeholder="Ex: 20/40"
                      disabled={isRealizada}
                      className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-ink-3 mb-0.5">Olho Esquerdo (OE)</label>
                    <input
                      type="text"
                      value={acuidadeOE}
                      onChange={e => setAcuidadeOE(e.target.value)}
                      placeholder="Ex: 20/60"
                      disabled={isRealizada}
                      className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Pressão Intra-Ocular (mmHg)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={pressaoOD}
                    onChange={e => setPressaoOD(e.target.value ? +e.target.value : '')}
                    placeholder="OD"
                    disabled={isRealizada}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 disabled:opacity-60"
                  />
                  <input
                    type="number"
                    value={pressaoOE}
                    onChange={e => setPressaoOE(e.target.value ? +e.target.value : '')}
                    placeholder="OE"
                    disabled={isRealizada}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Diagnóstico</label>
                <input
                  type="text"
                  value={diagnostico}
                  onChange={e => setDiagnostico(e.target.value)}
                  placeholder="Diagnóstico"
                  disabled={isRealizada}
                  className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Plano de Tratamento</label>
                <textarea
                  value={planoTratamento}
                  onChange={e => setPlanoTratamento(e.target.value)}
                  rows={3}
                  disabled={isRealizada}
                  className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 resize-y disabled:opacity-60"
                />
              </div>

              {!isRealizada && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Guardando...' : 'Guardar Dados'}
                  </button>
                  <button
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2.5 text-[13.5px] font-bold text-ink-3 transition hover:bg-slate"
                  >
                    {finalizing ? 'Finalizando...' : 'Concluir'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}