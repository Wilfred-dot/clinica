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
        const perfil = await request<{ id: number; users: { name: string } }>('/pacientes/me');
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
      <div className="max-w-[960px] mx-auto px-6 py-8">
        {/* Cabeçalho da página */}
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Meu Histórico</h1>
            <p className="text-[13px] text-[#6b8299] mt-1">Todos os registos clínicos</p>
          </div>
        </div>

        {/* Card da tabela */}
        <div className="bg-white border border-[#ecf1f6] rounded-[12px] shadow-[0_1px_3px_rgba(12,26,39,0.05)] overflow-hidden">
          {/* Cabeçalho do card */}
          <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
            <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Consultas Realizadas</h3>
            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold bg-[#e4f5f4] text-[#007d74]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#007d74]"></span>
              {consultas.length} registos
            </span>
          </div>

          {loading ? (
            <p className="p-6 text-center text-[#a8bfcf]">A carregar...</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Data</th>
                  <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Médico</th>
                  <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Diagnóstico</th>
                  <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Prescrição</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map(c => (
                  <tr key={c.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{new Date(c.data).toLocaleDateString('pt-MZ')}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{c.medico}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">{c.diagnostico || '—'}</td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">
                      {c.prescricoes?.length > 0
                        ? c.prescricoes.map(p => `${p.medicamento} (${p.dosagem})`).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {consultas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-[#a8bfcf] py-6">Nenhuma consulta realizada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}