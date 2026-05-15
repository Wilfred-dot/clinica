'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Paciente {
  id: number;
  user_id: number;
  telefone: string;
  endereco: string;
  historico_medico?: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
  ultimo_atendimento?: string;
}

const statusBadgeClasses = {
  activo:   { bg: 'bg-[#edf7f2]', text: 'text-[#1a7a4a]', dot: 'bg-[#1a7a4a]' },
  inactivo: { bg: 'bg-[#fdf0f0]', text: 'text-[#b83232]', dot: 'bg-[#b83232]' },
};

export default function ReceptionPatientsPage() {
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = () => {
    setLoading(true);
    request<{ data: Paciente[] }>('/pacientes')
      .then(res => setPatients(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p =>
    p.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.telefone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Pacientes</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Recepção — Clínica MMQ Oftalmologia</p>
        </div>
        <Link
          href="/recepcionista/patients/novo"
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[#007d74] px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-[#009d92]"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo paciente
        </Link>
      </div>

      {/* Card da tabela */}
      <div className="bg-white rounded-[12px] border border-[#ecf1f6] shadow-[0_1px_3px_rgba(12,26,39,.05)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-[16px_22px] border-b border-[#ecf1f6] flex-wrap">
          <h3 className="text-[14.5px] font-bold text-[#0c1a27]">Lista de Pacientes</h3>
          <div className="relative min-w-[200px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" width="14" height="14" stroke="#a8bfcf" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou contacto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-8 pr-3 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74]"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-center text-[#a8bfcf]">A carregar...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Nome</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Contacto</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Último Atendimento</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Estado</th>
                <th className="bg-[#f1f5f9] text-[11px] font-bold text-[#6b8299] uppercase tracking-[0.7px] p-[10px_18px] text-left border-b border-[#ecf1f6]">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => {
                const ativo = patient.users?.ativo ?? false;
                const badge = ativo ? statusBadgeClasses.activo : statusBadgeClasses.inactivo;
                return (
                  <tr key={patient.id} className="border-b border-[#ecf1f6] last:border-b-0 hover:bg-[#f6fafe] transition">
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27] font-semibold">
                      {patient.users?.name ?? 'N/D'}
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">
                      {patient.telefone}
                    </td>
                    <td className="p-[12px_18px] text-[13.5px] text-[#0c1a27]">
                      {patient.ultimo_atendimento
                        ? new Date(patient.ultimo_atendimento).toLocaleDateString('pt-MZ')
                        : '—'}
                    </td>
                    <td className="p-[12px_18px]">
                      <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {ativo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-[12px_18px]">
                      <Link
                        href={`/recepcionista/patients/${patient.id}`}
                        className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-xs font-semibold border border-[#d6e0ea] bg-white text-[#2e4358] transition hover:bg-[#f1f5f9]"
                      >
                        Histórico
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#a8bfcf] py-6">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}