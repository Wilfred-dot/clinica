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
      <div className="ph">
        <div>
          <h1>Pacientes</h1>
          <p className="sub">Base de dados de pacientes registados</p>
        </div>
        <Link href="/recepcionista/patients/novo" className="btn btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo paciente
        </Link>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Lista de Pacientes</h3>
          <div className="search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--ink4)' }}>A carregar...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contacto</th>
                <th>Último Atendimento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => (
                <tr key={patient.id}>
                  <td><strong>{patient.users?.name}</strong></td>
                  <td>{patient.telefone}</td>
                  <td>{patient.ultimo_atendimento ? new Date(patient.ultimo_atendimento).toLocaleDateString('pt-MZ') : '—'}</td>
                  <td>
                    <span className={`badge ${patient.users?.ativo ? 'bg' : 'br'}`}>
                      {patient.users?.ativo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>
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
