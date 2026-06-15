'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ativo: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    request<User>(`/users/${params.id}`)
      .then(u => {
        setUser(u);
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
        setAtivo(u.ativo);
      })
      .catch(() => {});
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: any = { name, email, role, ativo };
      if (password) body.password = password;
      await request(`/users/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      // Show success toast
      toast('Utilizador atualizado com sucesso!', 'success');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar utilizador');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await request(`/users/${params.id}`, { method: 'DELETE' });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar utilizador');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user)
    return (
      <Shell>
        <p className="p-8 text-center text-[var(--ink4)]">A carregar...</p>
      </Shell>
    );

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-[-0.3px]">Editar Utilizador</h1>
          <p className="text-[13px] text-[var(--ink3)] mt-1">
            {user.name} · {user.email}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink2)] transition hover:bg-[var(--slate)] hover:border-[var(--ink4)]"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      </div>

      {/* Painel do formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--white)] border border-[var(--border2)] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_1px_3px_rgba(12,26,39,0.05)]"
      >
        {/* Mensagem de erro */}
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-[var(--danger)] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span>
            {error}
          </div>
        )}

        {/* Secção: Dados pessoais */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[var(--ink3)] mb-4">
          Dados pessoais
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[var(--ink2)] mb-1.5">
              Nome completo <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.15)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[var(--ink2)] mb-1.5">
              Email <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.15)]"
            />
          </div>
        </div>

        <hr className="border-[var(--border2)] my-5" />

        {/* Secção: Acesso */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[var(--ink3)] mb-4">
          Acesso
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[var(--ink2)] mb-1.5">
              Nível de acesso
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.15)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[var(--ink2)] mb-1.5">
              Estado
            </label>
            <select
              value={ativo ? 'true' : 'false'}
              onChange={e => setAtivo(e.target.value === 'true')}
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.15)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Nova senha (linha inteira) */}
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[var(--ink2)] mb-1.5">
            Nova senha{' '}
            <span className="font-normal normal-case tracking-normal text-[var(--ink4)]">
              (deixar em branco para manter)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nova senha"
            className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.15)]"
          />
        </div>

        {/* Acções */}
        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[var(--border2)]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-5 h-12 text-sm font-semibold text-white transition hover:bg-[var(--mmq-orange)] disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar alterações'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-5 h-12 text-sm font-semibold text-[var(--ink2)] transition hover:bg-[var(--slate)] hover:border-[var(--ink4)]"
          >
            Cancelar
          </button>
        </div>

        {/* Operação perigosa */}
        <hr className="border-[var(--border2)] my-5" />
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[var(--ink3)] mb-4">
          Operação perigosa
        </div>
        <button
          type="button"
          disabled={deleteLoading}
          className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-xs font-semibold bg-[var(--danger-dim)] text-[var(--danger)] border border-[var(--danger-dim)] transition hover:bg-[var(--danger-dim)] disabled:opacity-50"
          onClick={() => setShowDeleteConfirm(true)}
        >
          {deleteLoading ? 'Eliminando...' : 'Eliminar utilizador'}
        </button>

        <ConfirmModal
          open={showDeleteConfirm}
          title="Eliminar utilizador"
          message={`Tem a certeza de que pretende eliminar ${user.name}? Esta acção é irreversível.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          variant="danger"
        />
      </form>
    </Shell>
  );
}