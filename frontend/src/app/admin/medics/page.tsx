'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Medico {
  id: number;
  user_id: number;
  especialidade: string;
  numero_ordem: string;
  telefone: string;
  horario_trabalho: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
}

export default function MedicsPage() {
  const [medics, setMedics] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ medicoId: number; userId: number; action: 'activate' | 'deactivate' } | null>(null);

  const fetchMedics = () => {
    setLoading(true);
    request<{ data: Medico[] }>('/medicos')
      .then(res => setMedics(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedics(); }, []);

  const executeAction = async () => {
    if (!confirm) return;
    const { userId, action } = confirm;
    setActionLoading(userId);
    try {
      const newState = action === 'activate';
      await request(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: newState }),
      });
      setMedics(prev =>
        prev.map(m =>
          m.user_id === userId
            ? { ...m, users: { ...m.users, ativo: newState } }
            : m
        )
      );
    } catch (err) {
      console.error('Erro ao alterar estado', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filtered = medics.filter(m =>
    m.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Médicos</h1>
          <p className="sub">Corpo clínico da Clínica MMQ Oftalmologia</p>
        </div>
        <Link href="/admin/medics/novo" className="btn btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo médico
        </Link>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Lista de Médicos</h3>
          <div className="search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Pesquisar médico..."
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
                <th>Email</th>
                <th>Especialidade</th>
                <th>N.º Ordem</th>
                <th>Estado</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(medico => (
                <tr key={medico.id}>
                  <td><strong>{medico.users?.name}</strong></td>
                  <td>{medico.users?.email}</td>
                  <td>{medico.especialidade}</td>
                  <td>{medico.numero_ordem}</td>
                  <td>
                    <span className={`badge ${medico.users?.ativo ? 'bg' : 'br'}`}>
                      {medico.users?.ativo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap8">
                      <Link href={`/admin/medics/${medico.id}/editar`} className="btn btn-outline btn-sm">
                        Editar
                      </Link>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: medico.users?.ativo ? 'var(--warn-dim)' : 'var(--success-dim)',
                          color: medico.users?.ativo ? 'var(--warn)' : 'var(--success)',
                          border: medico.users?.ativo ? '1px solid #f3d98a' : '1px solid #a8ddc0',
                        }}
                        onClick={() =>
                          setConfirm({
                            medicoId: medico.id,
                            userId: medico.user_id,
                            action: medico.users?.ativo ? 'deactivate' : 'activate',
                          })
                        }
                        disabled={actionLoading === medico.user_id}
                      >
                        {actionLoading === medico.user_id
                          ? '...'
                          : medico.users?.ativo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink4)', padding: 24 }}>
                    Nenhum médico encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === 'deactivate' ? 'Desactivar médico' : 'Activar médico'}
        message={
          confirm?.action === 'deactivate'
            ? 'Tem a certeza de que pretende desactivar este médico?'
            : 'Tem a certeza de que pretende activar este médico?'
        }
        confirmLabel={confirm?.action === 'deactivate' ? 'Desactivar' : 'Activar'}
        cancelLabel="Cancelar"
        onConfirm={executeAction}
        onCancel={() => setConfirm(null)}
        variant={confirm?.action === 'deactivate' ? 'danger' : 'warning'}
      />
    </Shell>
  );
}
