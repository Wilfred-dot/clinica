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

interface ConsultaPorMedico {
  nome: string;
  total_consultas: number;
}

interface DiagnosticoComum {
  diagnostico: string;
  total: number;
}

export default function ReportsPage() {
  const [resumo, setResumo] = useState<ResumoResponse | null>(null);
  const [porMedico, setPorMedico] = useState<ConsultaPorMedico[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoComum[]>([]);
  const [dailyData, setDailyData] = useState<number[]>([]);
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, med, diag] = await Promise.all([
          request<ResumoResponse>('/relatorios/resumo'),
          request<ConsultaPorMedico[]>('/relatorios/consultas-por-medico'),
          request<DiagnosticoComum[]>('/relatorios/diagnosticos-comuns'),
        ]);
        setResumo(res);
        setPorMedico(med ?? []);
        setDiagnosticos(diag ?? []);

        // Dados simulados para o gráfico de barras (30 dias de abril)
        const mockData = [4,6,5,7,3,8,6,4,5,7,6,8,5,4,6,7,5,8,7,6,4,5,6,4,7,6,5,4,6,5];
        const mockLabels = Array.from({ length: 30 }, (_, i) => `${i+1}/04`);
        setDailyData(mockData);
        setDailyLabels(mockLabels);
      } catch (err) {
        setError('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <Shell><p className="p-8 text-center text-[#a8bfcf]">A carregar relatórios...</p></Shell>;
  if (error)
    return <Shell><p className="p-8 text-center text-[#b83232]">{error}</p></Shell>;

  const totalConsultas = resumo?.total_consultas ?? 0;
  const totalPacientes = resumo?.total_pacientes ?? 0;
  const totalMedicos = resumo?.total_medicos ?? 0;
  const taxaConclusao = resumo?.taxa_conclusao ?? '0%';

  // Cores para as barras do gráfico (teal, sky, warn, repetidas)
  const chartColors = ['#007d74', '#1258a8', '#b87a00', '#007d74', '#1258a8'];

  // Cálculo do máximo para as consultas por médico
  const maxConsultasMedico = Math.max(...porMedico.map(m => m.total_consultas), 1);
  // Cálculo do máximo para diagnósticos
  const maxDiagnosticos = Math.max(...diagnosticos.map(d => d.total), 1);

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Relatórios</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Dados clínicos e operacionais · Abril 2025</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="px-3 py-2 border border-[#d6e0ea] rounded-[8px] bg-white text-sm text-[#0c1a27] outline-none focus:border-[#007d74] transition">
            <option>Abril 2025</option>
            <option>Março 2025</option>
            <option>Fevereiro 2025</option>
          </select>
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
            onClick={() => window.print()}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Grid de cards de resumo */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 mb-6">
        {/* Card Teal */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#007d74]">
          <h4 className="text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] mb-2.5">Consultas</h4>
          <h2 className="text-[32px] font-bold text-[#0c1a27] tracking-[-1px] leading-none">{totalConsultas}</h2>
          <p className="text-xs font-medium text-[#007d74] mt-1.5">↑ +12 vs Março</p>
        </div>
        {/* Card Sky */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#1258a8]">
          <h4 className="text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] mb-2.5">Novos Pacientes</h4>
          <h2 className="text-[32px] font-bold text-[#0c1a27] tracking-[-1px] leading-none">{totalPacientes}</h2>
          <p className="text-xs font-medium text-[#1258a8] mt-1.5">↑ +3 vs Março</p>
        </div>
        {/* Card Green */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#1a7a4a]">
          <h4 className="text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] mb-2.5">Taxa de Conclusão</h4>
          <h2 className="text-[32px] font-bold text-[#0c1a27] tracking-[-1px] leading-none">{taxaConclusao}</h2>
          <p className="text-xs font-medium text-[#1a7a4a] mt-1.5">↑ +2pp vs Março</p>
        </div>
        {/* Card Warn */}
        <div className="bg-white rounded-[12px] p-[20px_22px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-[#b87a00]">
          <h4 className="text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] mb-2.5">Cancelamentos</h4>
          <h2 className="text-[32px] font-bold text-[#0c1a27] tracking-[-1px] leading-none">8</h2>
          <p className="text-xs font-medium text-[#b87a00] mt-1.5">↓ −2 vs Março</p>
        </div>
      </div>

      {/* Gráfico de consultas por dia (barras) */}
      <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden mb-5">
        <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
          <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Consultas por dia (Abril 2025)</h3>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-[6px] h-20 px-1">
            {dailyData.map((val, idx) => {
              const maxVal = Math.max(...dailyData, 1);
              const heightPercent = (val / maxVal) * 100;
              const color = chartColors[idx % chartColors.length];
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t-[4px] cursor-pointer transition-opacity hover:opacity-75"
                  style={{ height: `${heightPercent}%`, backgroundColor: color, opacity: 0.75 }}
                />
              );
            })}
          </div>
          <div className="flex gap-[6px] px-1 mt-1">
            {dailyLabels.map((label, idx) => (
              <span
                key={idx}
                className={`flex-1 text-center text-[10px] text-[#a8bfcf] font-medium ${idx % 5 !== 0 ? 'opacity-0' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Duas colunas: Consultas por Médico e Diagnósticos comuns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-0">
        {/* Consultas por Médico */}
        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
            <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Consultas por Médico</h3>
          </div>
          <div className="p-5">
            {porMedico.map((item, idx) => {
              const widthPercent = (item.total_consultas / maxConsultasMedico) * 100;
              let progressColor = '#007d74';
              if (idx === 1) progressColor = '#1258a8';
              else if (idx === 2) progressColor = '#b87a00';
              else if (idx > 2) progressColor = '#007d74'; // fallback
              return (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1 text-[13px]">
                    <span className="text-[#0c1a27]">{item.nome}</span>
                    <strong className="text-[#0c1a27]">{item.total_consultas}</strong>
                  </div>
                  <div className="w-full h-[5px] bg-[#ecf1f6] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full rounded-[3px]"
                      style={{ width: `${widthPercent}%`, backgroundColor: progressColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnósticos mais comuns */}
        <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_22px] border-b border-[#ecf1f6]">
            <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Diagnósticos mais comuns</h3>
          </div>
          <div className="p-5">
            {diagnosticos.map((item, idx) => {
              const widthPercent = (item.total / maxDiagnosticos) * 100;
              let progressColor = '#007d74';
              if (idx === 1) progressColor = '#1258a8';
              else if (idx === 2) progressColor = '#b87a00';
              else if (idx > 2) progressColor = '#007d74'; // fallback
              return (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1 text-[13px]">
                    <span className="text-[#0c1a27]">{item.diagnostico}</span>
                    <strong className="text-[#0c1a27]">{item.total}%</strong>
                  </div>
                  <div className="w-full h-[5px] bg-[#ecf1f6] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full rounded-[3px]"
                      style={{ width: `${widthPercent}%`, backgroundColor: progressColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}