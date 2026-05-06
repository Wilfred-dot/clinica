'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface ResumoResponse {
  total_consultas: number;
  total_pacientes: number;
  total_medicos: number;
  consultas_realizadas: number;
  taxa_conclusao: string; // "28.57%"
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

  // Mapeia os campos snake_case para os nomes usados na UI
  const totalConsultas = resumo?.total_consultas ?? 0;
  const totalPacientes = resumo?.total_pacientes ?? 0;
  const totalMedicos = resumo?.total_medicos ?? 0;
  const taxaConclusao = resumo?.taxa_conclusao ?? '0%';

  // Por enquanto, o gráfico de consultas por dia não será exibido,
  // porque o endpoint atual não faz parte do /resumo.
  // Podes adicionar essa funcionalidade mais tarde chamando
  // /relatorios/consultas-por-dia?mes=YYYY-MM

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
          <h2>{totalConsultas}</h2>
          <p className="trend">Total</p>
        </div>
        <div className="rep-card c-sky">
          <h4>Pacientes</h4>
          <h2>{totalPacientes}</h2>
          <p className="trend">Registados</p>
        </div>
        <div className="rep-card c-green">
          <h4>Taxa de Conclusão</h4>
          <h2>{taxaConclusao}</h2>
          <p className="trend">Consultas realizadas</p>
        </div>
        <div className="rep-card c-warn">
          <h4>Médicos</h4>
          <h2>{totalMedicos}</h2>
          <p className="trend">Activos</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>Consultas por Médico</h3></div>
          <div style={{ padding: 20 }}>
            {porMedico.map((item, i) => {
              const max = Math.max(...porMedico.map(x => x.total_consultas));
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{item.nome}</span><strong>{item.total_consultas}</strong>
                  </div>
                  <div className="prog"><div className="prog-fill prog-teal" style={{ width: `${(item.total_consultas / max) * 100}%` }} /></div>
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
