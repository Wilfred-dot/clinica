'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

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
}

export default function MedicoConsultaPage() {
  const params = useParams();
  const router = useRouter();
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState('');
  const [acuidadeOD, setAcuidadeOD] = useState('');
  const [acuidadeOE, setAcuidadeOE] = useState('');
  const [pressaoOD, setPressaoOD] = useState<number | ''>('');
  const [pressaoOE, setPressaoOE] = useState<number | ''>('');
  const [diagnostico, setDiagnostico] = useState('');
  const [planoTratamento, setPlanoTratamento] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    request<Consulta>(`/consultas/${params.id}`)
      .then(data => {
        setConsulta(data);
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

  if (loading) return <Shell><p className="p-8">A carregar consulta...</p></Shell>;
  if (!consulta) return <Shell><p className="p-8">Consulta não encontrada.</p></Shell>;

  const patient = consulta.pacientes;
  const doctor = consulta.medicos;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Atendimento</h1>
          <p className="sub">
            {patient?.users?.name} · {new Date(consulta.data_hora).toLocaleDateString('pt-MZ')} às{' '}
            {new Date(consulta.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-outline" onClick={() => router.push('/medico/attend')}>
            ← Agenda
          </button>
          {consulta.status !== 'realizada' && (
            <button className="btn btn-primary" onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? 'Finalizando...' : 'Concluir Consulta'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="ficha-layout">
        <div>
          <div className="patient-card">
            <div className="pc-header">
              <div className="pc-avatar">
                {patient?.users?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h3>{patient?.users?.name}</h3>
              <p>
                {patient?.data_nascimento
                  ? `${new Date().getFullYear() - new Date(patient.data_nascimento).getFullYear()} anos`
                  : 'Idade desconhecida'}{' '}
                · {patient?.sexo === 'M' ? 'Masculino' : patient?.sexo === 'F' ? 'Feminino' : 'Outro'}
              </p>
            </div>
            <div className="pc-body">
              <div className="pc-row"><span className="lbl">Contacto</span><span className="val">{patient?.telefone || '—'}</span></div>
              <div className="pc-row"><span className="lbl">Alergias</span><span className="val" style={{ color: 'var(--danger)' }}>{patient?.historico_medico || 'Nenhuma'}</span></div>
              <div className="pc-row"><span className="lbl">Médico</span><span className="val">{doctor?.users?.name} · {doctor?.especialidade}</span></div>
              <div className="pc-row"><span className="lbl">Estado</span><span className="val">{consulta.status}</span></div>
            </div>
          </div>
        </div>

        <div className="clinical-card">
          <div className="cc-section">
            <div className="cc-title">Motivo da consulta</div>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none', resize: 'vertical' }}
              disabled={consulta.status === 'realizada'}
            />
          </div>

          <div className="cc-section">
            <div className="cc-title">Acuidade Visual</div>
            <div className="rx-grid">
              <div className="rx-eye">
                <div className="eye-label">Olho Direito (OD)</div>
                <input
                  type="text"
                  value={acuidadeOD}
                  onChange={e => setAcuidadeOD(e.target.value)}
                  placeholder="Ex: 20/40"
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                  disabled={consulta.status === 'realizada'}
                />
              </div>
              <div className="rx-eye">
                <div className="eye-label">Olho Esquerdo (OE)</div>
                <input
                  type="text"
                  value={acuidadeOE}
                  onChange={e => setAcuidadeOE(e.target.value)}
                  placeholder="Ex: 20/60"
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                  disabled={consulta.status === 'realizada'}
                />
              </div>
            </div>
          </div>

          <div className="cc-section">
            <div className="cc-title">Pressão Intra-Ocular (mmHg)</div>
            <div className="rx-grid">
              <input
                type="number"
                value={pressaoOD}
                onChange={e => setPressaoOD(e.target.value ? +e.target.value : '')}
                placeholder="OD"
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                disabled={consulta.status === 'realizada'}
              />
              <input
                type="number"
                value={pressaoOE}
                onChange={e => setPressaoOE(e.target.value ? +e.target.value : '')}
                placeholder="OE"
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                disabled={consulta.status === 'realizada'}
              />
            </div>
          </div>

          <div className="cc-section">
            <div className="cc-title">Diagnóstico</div>
            <input
              type="text"
              value={diagnostico}
              onChange={e => setDiagnostico(e.target.value)}
              placeholder="Diagnóstico"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
              disabled={consulta.status === 'realizada'}
            />
          </div>

          <div className="cc-section">
            <div className="cc-title">Plano de Tratamento</div>
            <textarea
              value={planoTratamento}
              onChange={e => setPlanoTratamento(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none', resize: 'vertical' }}
              disabled={consulta.status === 'realizada'}
            />
          </div>

          <div className="cc-section" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || consulta.status === 'realizada'}
            >
              {saving ? 'Guardando...' : 'Guardar Dados'}
            </button>
            {consulta.status !== 'realizada' && (
              <button
                className="btn btn-secondary"
                onClick={handleFinalize}
                disabled={finalizing}
              >
                {finalizing ? 'Finalizando...' : 'Concluir Consulta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
