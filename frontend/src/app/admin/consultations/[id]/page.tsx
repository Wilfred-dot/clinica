'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import Link from 'next/link';
import { request } from '@/lib/api';

interface ConsultaDetalhes {
  id: number;
  data_hora: string;
  status: string;
  motivo: string | null;
  acuidade_visual: string | null;
  pressao_intraocular: string | null;
  diagnostico: string | null;
  plano_tratamento: string | null;
  observacoes: string | null;
  pacientes: {
    id: number;
    users: { name: string };
  };
  medicos: {
    id: number;
    users: { name: string };
  };
  prescricoes: { medicamento: string; dosagem: string }[];
}

export default function AdminConsultaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [consulta, setConsulta] = useState<ConsultaDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsulta = async () => {
      try {
        const data = await request<ConsultaDetalhes>(`/consultas/${params.id}`);
        setConsulta(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar os detalhes da consulta');
      } finally {
        setLoading(false);
      }
    };

    fetchConsulta();
  }, [params.id]);

  const statusColors: Record<string, string> = {
    realizada: 'bg-[var(--success-dim)] text-[var(--success)]',
    agendada: 'bg-[var(--warn-dim)] text-[var(--warn)]',
    pendente: 'bg-[var(--warn-dim)] text-[var(--warn)]',
    cancelada: 'bg-[var(--danger-dim)] text-[var(--danger)]',
    confirmada: 'bg-[var(--sky-dim)] text-[var(--sky)]',
  };

  const formatarDataLocal = (dataStr: string) => {
    if (!dataStr) return '—';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatarHoraLocal = (dataStr: string) => {
    if (!dataStr) return '—';
    const d = new Date(dataStr);
    return d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--mmq-orange)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-ink-3">A carregar detalhes da consulta...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      </Shell>
    );
  }

  if (!consulta) {
    return (
      <Shell>
        <div className="text-center p-12">
          <p className="text-sm font-medium text-ink-3">Consulta não encontrada</p>
          <Link href="/admin/consultations" className="text-[var(--mmq-orange)] hover:underline text-sm mt-2 inline-block">
            Voltar para lista
          </Link>
        </div>
      </Shell>
    );
  }

  const statusNormalizado = consulta.status?.toLowerCase() ?? 'pendente';

  return (
    <Shell>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">
            Detalhes da Consulta #{consulta.id}
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">
            {formatarDataLocal(consulta.data_hora)} às {formatarHoraLocal(consulta.data_hora)}
          </p>
        </div>
        <Link
          href="/admin/consultations"
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 h-10 text-[13.5px] font-bold text-ink-3 transition hover:bg-[var(--slate)]"
        >
          ← Voltar
        </Link>
      </div>

      {/* Informações da consulta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Coluna 1 */}
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          <h3 className="text-[14px] font-bold text-[var(--ink)] mb-4">Informações Gerais</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Paciente</span>
              <p className="text-[15px] font-bold text-[var(--ink)]">{consulta.pacientes?.users?.name || 'N/D'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Médico</span>
              <p className="text-[15px] font-bold text-[var(--ink)]">Dr(a). {consulta.medicos?.users?.name || 'N/D'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold mt-1 ${statusColors[statusNormalizado] || 'bg-[var(--slate)] text-ink-3'}`}>
                {statusNormalizado}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Data e Hora</span>
              <p className="text-[15px] font-medium text-[var(--ink)]">
                {formatarDataLocal(consulta.data_hora)} às {formatarHoraLocal(consulta.data_hora)}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          <h3 className="text-[14px] font-bold text-[var(--ink)] mb-4">Informações Clínicas</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Motivo</span>
              <p className="text-[14px] text-[var(--ink)]">{consulta.motivo || '—'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Diagnóstico</span>
              <p className="text-[14px] text-[var(--ink)]">{consulta.diagnostico || '—'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.6px]">Plano de Tratamento</span>
              <p className="text-[14px] text-[var(--ink)]">{consulta.plano_tratamento || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescrições */}
      {consulta.prescricoes && consulta.prescricoes.length > 0 && (
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6 mb-6">
          <h3 className="text-[14px] font-bold text-[var(--ink)] mb-4">Prescrições</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)]">
                  <th className="p-3 text-left text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Medicamento</th>
                  <th className="p-3 text-left text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Dosagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {consulta.prescricoes.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[var(--slate)] transition-colors">
                    <td className="p-3 text-sm font-medium text-[var(--ink)]">{p.medicamento}</td>
                    <td className="p-3 text-sm font-medium text-ink-3">{p.dosagem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Observações */}
      {consulta.observacoes && (
        <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] p-6">
          <h3 className="text-[14px] font-bold text-[var(--ink)] mb-4">Observações</h3>
          <p className="text-[14px] text-[var(--ink)] whitespace-pre-wrap">{consulta.observacoes}</p>
        </div>
      )}
    </Shell>
  );
}