'use client';

import { useEffect, useState } from 'react';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';

interface HistoricoItem {
  id: number;
  data: string;
  medico: string;
  diagnostico: string;
  prescricoes: { medicamento: string; dosagem: string }[];
}

export default function PacienteHistoricoPage() {
  const [consultas, setConsultas] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const perfil = await request<{ id: number; nome: string }>('/pacientes/me');
        const hist = await request<{ consultas: HistoricoItem[] }>(`/pacientes/${perfil.id}/historico`);
        setConsultas(hist?.consultas ?? []);
      } catch (err) {
        console.error('Erro ao carregar histórico', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorico();
  }, []);

  return (
    <PortalLayout>
      <div className="portal-wrap">
        <div className="ph"><div><h1>Meu Histórico</h1><p className="sub">Todos os registos clínicos</p></div></div>
        <div className="card">
          <div className="card-head"><h3>Consultas Realizadas</h3><span className="badge bt">{consultas.length} registos</span></div>
          {loading ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
          ) : (
            <table>
              <thead>
                <tr><th>Data</th><th>Médico</th><th>Diagnóstico</th><th>Prescrição</th></tr>
              </thead>
              <tbody>
                {consultas.map(c => (
                  <tr key={c.id}>
                    <td>{new Date(c.data).toLocaleDateString('pt-MZ')}</td>
                    <td>{c.medico}</td>
                    <td>{c.diagnostico || '—'}</td>
                    <td>{c.prescricoes?.length > 0 ? c.prescricoes.map(p => `${p.medicamento} (${p.dosagem})`).join(', ') : '—'}</td>
                  </tr>
                ))}
                {consultas.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>Nenhuma consulta realizada.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
