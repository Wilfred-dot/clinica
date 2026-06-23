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
    const fetchPatientData = async () => {
      try {
        const p = await request<PacienteInfo>(`/pacientes/${params.id}`);
        setPaciente(p);
        
        const allConsultas = await request<ConsultaItem[]>(`/consultas?paciente_id=${params.id}`);
        setConsultas(Array.isArray(allConsultas) ? allConsultas : []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar o histórico clínico.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [params.id]);

  const formatarDataLocal = (dataStr: string) => {
    if (!dataStr) return '—';
    const [year, month, day] = dataStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Shell>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">
            {loading ? 'A carregar...' : paciente?.users?.name ?? 'Paciente'}
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Histórico clínico detalhado do paciente</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/patients/${params.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-4 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
          >
            Editar paciente
          </Link>
          <Link
            href="/admin/patients"
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 h-10 text-[13.5px] font-bold text-ink-3 transition hover:bg-slate"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[8px] bg-[var(--danger-dim)] text-[var(--danger)] text-[13px] font-semibold">
          {error}
        </div>
      )}

      {/* Dados do paciente - 3 em cima e 3 em baixo */}
      {paciente && (
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-5 shadow-[0_2px_4px_rgba(16,42,107,.03)]">
          {/* Linha 1 - 3 colunas */}
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Email</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">{paciente.users?.email ?? '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Telefone</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">{paciente.telefone || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Data nascimento</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">{formatarDataLocal(paciente.data_nascimento)}</div>
          </div>
          
          {/* Linha 2 - 3 colunas */}
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Sexo</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">
              {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Endereço</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">{paciente.endereco}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px] mb-1">Histórico médico</div>
            <div className="text-[14px] text-[var(--ink)] font-medium break-words">{paciente.historico_medico || '—'}</div>
          </div>
        </div>
      )}

      {/* Tabela de consultas - sem Status */}
      <div className="bg-[var(--white)] border border-[var(--border2)] rounded-[12px] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border2)]">
          <h3 className="text-[15px] font-bold text-[var(--ink)]">Historico Clinico</h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--sky-dim)] text-[var(--sky)]">
            {consultas.length} registos
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-ink-3 animate-pulse">A carregar registos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left table-fixed">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)]">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[12%]">Data</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[18%]">Médico</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[22%]">Motivo</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[23%]">Diagnóstico</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[25%]">Prescrições</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {consultas.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--white)] transition-colors">
                    <td className="p-4 pl-5 text-sm font-medium text-ink-3 whitespace-nowrap">
                      {formatarDataLocal(c.data_hora)}
                    </td>
                    <td className="p-4 text-sm font-bold text-[var(--ink)] truncate">
                      {c.medicos?.users?.name ?? 'Não atribuído'}
                    </td>
                    <td className="p-4 text-sm font-medium text-ink-3 truncate" title={c.motivo ?? ''}>
                      {c.motivo ?? '—'}
                    </td>
                    <td className="p-4 text-sm font-medium text-ink-3 truncate" title={c.diagnostico ?? ''}>
                      {c.diagnostico ?? '—'}
                    </td>
                    <td className="p-4 pr-5 text-sm font-medium text-ink-3 break-words">
                      {c.prescricoes && c.prescricoes.length > 0
                        ? c.prescricoes.map(p => `${p.medicamento} (${p.dosagem})`).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {consultas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-sm font-medium text-ink-3">
                      Nenhuma consulta registada no histórico deste paciente.
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