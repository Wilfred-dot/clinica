'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Shell from '@/app/components/Shell';
import Link from 'next/link';
import { request } from '@/lib/api';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  observacoes: string | null;
  motivo: string | null;
  acuidade_visual: string | null;
  pressao_intraocular: string | null;
  diagnostico: string | null;
  plano_tratamento: string | null;
  medicos: { id: number; users: { name: string } } | null;
  prescricoes: { medicamento: string; dosagem: string }[];
}

interface PacienteInfo {
  id: number;
  data_nascimento: string;
  sexo: string;
  telefone: string | null;
  endereco: string;
  historico_medico: string | null;
  users: { name: string; email: string } | null;
}

export default function PatientDetailPage() {
  const params = useParams();
  const [paciente, setPaciente] = useState<PacienteInfo | null>(null);
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const p = await request<PacienteInfo>(`/pacientes/${params.id}`);
        setPaciente(p);
        const allConsultas = await request<ConsultaItem[]>(`/consultas?paciente_id=${params.id}`);
        setConsultas(Array.isArray(allConsultas) ? allConsultas : []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [params.id]);

  const statusColors: Record<string, string> = {
    realizada:  'bg-success-dim text-[var(--success)]',
    agendada:   'bg-warn-dim text-warn',
    pendente:   'bg-warn-dim text-warn',
    cancelada:  'bg-[var(--danger-dim)] text-danger',
    confirmada: 'bg-[var(--sky-dim)] text-[var(--sky)]',
  };

  return (
    <Shell>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-[-0.3px]">
            {loading ? 'A carregar...' : paciente?.users?.name ?? 'Paciente'}
          </h1>
          <p className="text-[13px] text-ink-3 mt-1">Histórico clínico</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/recepcionista/patients/${params.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-white px-4 h-10 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate"
          >
            Editar paciente
          </Link>
          <Link
            href="/recepcionista/patients"
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-white px-4 h-10 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[8px] bg-[var(--danger-dim)] text-danger text-[13px]">
          {error}
        </div>
      )}

      {/* Dados do paciente */}
      {paciente && (
        <div className="bg-white rounded-[12px] border border-[var(--border2)] p-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-[0_1px_3px_rgba(12,26,39,.05)]">
          {[
            { label: 'Email', val: paciente.users?.email ?? '—' },
            { label: 'Telefone', val: paciente.telefone || '—' },
            { label: 'Data nascimento', val: paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-MZ') : '—' },
            { label: 'Sexo', val: paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro' },
            { label: 'Endereço', val: paciente.endereco },
            { label: 'Histórico médico', val: paciente.historico_medico || '—' },
          ].map(f => (
            <div key={f.label} className={f.label === 'Endereço' || f.label === 'Histórico médico' ? 'col-span-2' : ''}>
              <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">{f.label}</div>
              <div className="text-[13.5px] text-[var(--ink)]">{f.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de consultas */}
      <div className="bg-white border border-[var(--border2)] rounded-[12px] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
        <div className="flex items-center justify-between p-[16px_22px] border-b border-[var(--border2)]">
          <h3 className="text-[14.5px] font-bold text-[var(--ink)]">Consultas</h3>
          <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold bg-warn-dim text-mmq-orange">
            {consultas.length} registos
          </span>
        </div>

        {loading ? (
          <p className="p-6 text-center text-ink-4">A carregar...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Data', 'Médico', 'Status', 'Motivo', 'Diagnóstico', 'Prescrições'].map(h => (
                  <th key={h} className="bg-slate text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[var(--border2)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultas.map(c => (
                <tr key={c.id} className="border-b border-[var(--border2)] last:border-b-0 hover:bg-[var(--slate)] transition">
                  <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)] whitespace-nowrap">
                    {new Date(c.data_hora).toLocaleDateString('pt-MZ')}
                  </td>
                  <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">
                    {c.medicos?.users?.name ?? 'Não atribuído'}
                  </td>
                  <td className="p-[12px_18px]">
                    <span className={`inline-flex items-center px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${statusColors[c.status] || 'bg-slate text-ink-3'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">{c.motivo ?? '—'}</td>
                  <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">{c.diagnostico ?? '—'}</td>
                  <td className="p-[12px_18px] text-[13.5px] text-[var(--ink)]">
                    {c.prescricoes?.length > 0
                      ? c.prescricoes.map(p => `${p.medicamento} (${p.dosagem})`).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
              {consultas.length === 0 && (
                <tr><td colSpan={6} className="text-center text-ink-4 py-6">Nenhuma consulta registada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}