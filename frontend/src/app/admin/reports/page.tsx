'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Resumo {
  totalConsultas: number;
  totalPacientes: number;
  totalMedicos: number;
  taxaConclusao: number;
  consultasPorDia: { data: string; total: number }[];
}

interface ConsultaPorMedico {
  medico: string;
  total: number;
}

interface DiagnosticoComum {
  diagnostico: string;
  total: number;
}

export default function ReportsPage() {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [porMedico, setPorMedico] = useState<ConsultaPorMedico[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoComum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, med, diag] = await Promise.all([
          request<Resumo>('/relatorios/resumo'),
          request<ConsultaPorMedico[]>('/relatorios/consultas-por-medico'),
          request<DiagnosticoComum[]>('/relatorios/diagnosticos-comuns'),
        ]);
        setResumo(res);
        setPorMedico(med ?? []);
        setDiagnosticos(diag ?? []);
      } catch (err) {
        setError('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Shell><p className="p-8">A carregar relatórios...</p></Shell>;
  if (error) return <Shell><p className="p-8">{error}</p></Shell>;

  const maxConsultasDia = resumo?.consultasPorDia?.length
    ? Math.max(...resumo.consultasPorDia.map(d => d.total))
    : 1;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Relatórios</h1>
          <p className="sub">Indicadores de desempenho</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.print()}>
          Exportar PDF
        </button>
      </div>

      <div className="rep-grid">
        <div className="rep-card c-teal">
          <h4>Consultas</h4>
          <h2>{resumo?.totalConsultas ?? 0}</h2>
          <p className="trend">Total</p>
        </div>
        <div className="rep-card c-sky">
          <h4>Pacientes</h4>
          <h2>{resumo?.totalPacientes ?? 0}</h2>
          <p className="trend">Registados</p>
        </div>
        <div className="rep-card c-green">
          <h4>Taxa de Conclusão</h4>
          <h2>{resumo?.taxaConclusao ?? 0}%</h2>
          <p className="trend">Consultas realizadas</p>
        </div>
        <div className="rep-card c-warn">
          <h4>Médicos</h4>
          <h2>{resumo?.totalMedicos ?? 0}</h2>
          <p className="trend">Activos</p>
        </div>
      </div>

      {resumo?.consultasPorDia?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><h3>Consultas por dia (último mês)</h3></div>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, paddingBottom: 24 }}>
              {resumo.consultasPorDia.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${(d.total / maxConsultasDia) * 100}%`,
                    background: 'var(--teal)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 4,
                  }} />
                  <span style={{ fontSize: 10, marginTop: 4, color: 'var(--ink4)' }}>
                    {d.data?.substring(8)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>Consultas por Médico</h3></div>
          <div style={{ padding: 20 }}>
            {porMedico.map((item, i) => {
              const max = Math.max(...porMedico.map(x => x.total));
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{item.medico}</span><strong>{item.total}</strong>
                  </div>
                  <div className="prog"><div className="prog-fill prog-teal" style={{ width: `${(item.total / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Diagnósticos mais comuns</h3></div>
          <div style={{ padding: 20 }}>
            {diagnosticos.map((item, i) => {
              const max = Math.max(...diagnosticos.map(x => x.total));
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{item.diagnostico}</span><strong>{item.total}</strong>
                  </div>
                  <div className="prog"><div className="prog-fill prog-sky" style={{ width: `${(item.total / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
