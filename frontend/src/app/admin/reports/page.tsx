'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface ResumoResponse {
  total_consultas: number;
  total_pacientes: number;
  total_medicos: number;
  consultas_realizadas: number;
  taxa_conclusao: string;
}

interface ConsultaPorDia {
  dia: number;
  total: number;
}

interface ConsultaPorMedico {
  nome: string;
  total_consultas: number;
}

interface DiagnosticoComum {
  diagnostico: string;
  total: number;
}

const MESES = [
  { label: 'Janeiro',   value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março',     value: '03' },
  { label: 'Abril',     value: '04' },
  { label: 'Maio',      value: '05' },
  { label: 'Junho',     value: '06' },
  { label: 'Julho',     value: '07' },
  { label: 'Agosto',    value: '08' },
  { label: 'Setembro',  value: '09' },
  { label: 'Outubro',   value: '10' },
  { label: 'Novembro',  value: '11' },
  { label: 'Dezembro',  value: '12' },
];

export default function ReportsPage() {
  const [ano, setAno] = useState('2026');
  const [mes, setMes] = useState('05');

  const [resumo, setResumo] = useState<ResumoResponse | null>(null);
  const [porMedico, setPorMedico] = useState<ConsultaPorMedico[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoComum[]>([]);
  const [dailyData, setDailyData] = useState<ConsultaPorDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    setAno(now.getFullYear().toString());
    setMes((now.getMonth() + 1).toString().padStart(2, '0'));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const mesFull = `${ano}-${mes}`;
        
        const [res, med, diag, daily] = await Promise.all([
          request<ResumoResponse>(`/relatorios/resumo?mes=${mesFull}`),
          request<ConsultaPorMedico[]>(`/relatorios/consultas-por-medico?mes=${mesFull}`),
          request<DiagnosticoComum[]>(`/relatorios/diagnosticos-comuns?mes=${mesFull}`),
          request<ConsultaPorDia[]>(`/relatorios/consultas-por-dia?mes=${mesFull}`),
        ]);
        
        setResumo(res);
        setPorMedico(med ?? []);
        setDiagnosticos(diag ?? []);
        setDailyData(daily ?? []);
      } catch {
        setError('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mes, ano]);

  const mesLabel = MESES.find(m => m.value === mes)?.label ?? mes;

  if (loading)
    return <Shell><p className="p-8 text-center text-ink-4">A carregar relatórios...</p></Shell>;
  if (error)
    return <Shell><p className="p-8 text-center text-danger">{error}</p></Shell>;

  const maxDaily = Math.max(...dailyData.map(d => d.total), 1);
  const maxMedico = Math.max(...porMedico.map(m => m.total_consultas), 1);
  const maxDiag = Math.max(...diagnosticos.map(d => d.total), 1);
  const chartColors = ['#FF7F00', '#1258a8', '#b87a00'];

  return (
    <Shell>
      <style jsx global>{`
        @media print {
          body { background: white; color: black; }
          #shell-sidebar, #shell-header, .no-print, #report-actions { display: none !important; }
          #report-content { width: 100%; max-width: 100%; position: absolute; left: 0; top: 0; }
          .bg-white { border: 1px solid #ecf1f6 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div id="report-content">
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[#102A6B] tracking-[-0.3px]">Relatórios</h1>
            <p className="text-[13px] text-ink-3 mt-1">
              Dados clínicos · {mesLabel} {ano}
            </p>
          </div>
          
          <div id="report-actions" className="flex gap-2 flex-wrap items-center no-print">
            <select
              value={mes}
              onChange={e => setMes(e.target.value)}
              className="px-3 py-2 border border-[#d6e0ea] rounded-[8px] bg-white text-sm text-[#102A6B] outline-none focus:border-mmq-orange transition"
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={ano}
              onChange={e => setAno(e.target.value)}
              className="px-3 py-2 border border-[#d6e0ea] rounded-[8px] bg-white text-sm text-[#102A6B] outline-none focus:border-mmq-orange transition"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate hover:border-ink-4"
              onClick={() => window.print()}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 mb-6">
          {[
            { label: 'Consultas',      val: resumo?.total_consultas ?? 0,      color: '#FF7F00' },
            { label: 'Pacientes',      val: resumo?.total_pacientes ?? 0,      color: '#1258a8' },
            { label: 'Taxa Conclusão', val: resumo?.taxa_conclusao ?? '0%',    color: '#1a7a4a' },
            { label: 'Realizadas',     val: resumo?.consultas_realizadas ?? 0, color: '#b87a00' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden"
              style={{ borderBottom: `3px solid ${card.color}` }}>
              <h4 className="text-[11px] font-bold text-ink-3 uppercase tracking-[0.7px] mb-2.5">{card.label}</h4>
              <h2 className="text-[32px] font-bold text-[#102A6B] tracking-[-1px] leading-none">{card.val}</h2>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden mb-5">
          <div className="p-[16px_22px] border-b border-[#ecf1f6]">
            <h3 className="text-[14.5px] font-bold text-[#102A6B]">
              Consultas por dia — {mesLabel} {ano}
            </h3>
          </div>
          <div className="p-5">
            {dailyData.length === 0 ? (
              <p className="text-center text-ink-4 py-4">Sem dados para este mês.</p>
            ) : (
              <>
                <div className="flex items-end gap-[4px] h-20 px-1">
                  {dailyData.map((d, idx) => (
                    <div
                      key={d.dia}
                      className="flex-1 rounded-t-[3px] transition-opacity hover:opacity-75"
                      style={{
                        height: `${(d.total / maxDaily) * 100}%`,
                        backgroundColor: chartColors[idx % chartColors.length],
                        minHeight: d.total > 0 ? '4px' : '0',
                        opacity: 0.8,
                      }}
                      title={`Dia ${d.dia}: ${d.total} consulta(s)`}
                    />
                  ))}
                </div>
                <div className="flex gap-[4px] px-1 mt-1">
                  {dailyData.map((d) => (
                    <span key={d.dia} className={`flex-1 text-center text-[9px] text-ink-4 ${d.dia % 5 !== 0 ? 'opacity-0' : ''}`}>
                      {d.dia}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-0">
          <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
            <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
              <h3 className="text-[14.5px] font-bold text-[#102A6B]">Consultas por Médico</h3>
            </div>
            <div className="p-5">
              {porMedico.length === 0 ? <p className="text-ink-4 text-sm">Sem dados.</p> : porMedico.map((item, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1 text-[13px]">
                    <span className="text-[#102A6B]">{item.nome}</span>
                    <strong className="text-[#102A6B]">{item.total_consultas}</strong>
                  </div>
                  <div className="w-full h-[5px] bg-[#ecf1f6] rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px]"
                      style={{ width: `${(item.total_consultas / maxMedico) * 100}%`, backgroundColor: chartColors[idx % chartColors.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
            <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
              <h3 className="text-[14.5px] font-bold text-[#102A6B]">Diagnósticos mais comuns</h3>
            </div>
            <div className="p-5">
              {diagnosticos.length === 0 ? <p className="text-ink-4 text-sm">Sem dados.</p> : diagnosticos.map((item, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1 text-[13px]">
                    <span className="text-[#102A6B]">{item.diagnostico}</span>
                    <strong className="text-[#102A6B]">{item.total}%</strong>
                  </div>
                  <div className="w-full h-[5px] bg-[#ecf1f6] rounded-[3px] overflow-hidden">
                    <div className="h-full rounded-[3px]"
                      style={{ width: `${(item.total / maxDiag) * 100}%`, backgroundColor: chartColors[idx % chartColors.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}