'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ativo: boolean;
}

interface PageParams {
  id: string;
}

export default function EditUserPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
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
    if (resolvedParams?.id) {
      request<User>(`/users/${resolvedParams.id}`)
        .then(u => {
          setUser(u);
          setName(u.name);
          setEmail(u.email);
          setRole(u.role);
          setAtivo(u.ativo);
        })
        .catch((err) => {
          console.error(err);
          setError('Não foi possível encontrar o utilizador solicitado.');
        });
    }
  }, [resolvedParams?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: any = { name, email, role, ativo };
      if (password) body.password = password;
      await request(`/users/${resolvedParams.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
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
      await request(`/users/${resolvedParams.id}`, { method: 'DELETE' });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar utilizador');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (error && !user) {
    return (
      <Shell>
        <p className="p-8 text-center text-[#b83232]">{error}</p>
      </Shell>
    );
  }

  if (!user)
    return (
      <Shell>
        <p className="p-8 text-center text-[#a8bfcf]">A carregar...</p>
      </Shell>
    );

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Editar Utilizador</h1>
          <p className="sub">
            {user.name} · {user.email}
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-panel max-w-[680px]">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="form-section-title">Dados pessoais</div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
        </div>

        <hr />

        <div className="form-section-title">Acesso</div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Nível de acesso</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="form-select"
            >
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={ativo ? 'true' : 'false'}
              onChange={e => setAtivo(e.target.value === 'true')}
              className="form-select"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="form-group mt-4">
          <label>
            Nova senha <span className="text-sm font-normal text-[#6b8299] normal-case tracking-normal">(deixar em branco para manter)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nova senha"
            className="form-control"
          />
        </div>

        <div className="form-actions pt-5 mt-5 border-t border-[#ecf1f6]">
          <button type="submit" disabled={loading} className="btn btn-primary h-12 px-5">
            {loading ? 'Guardando...' : 'Guardar alterações'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline h-12 px-5">
            Cancelar
          </button>
        </div>

        <hr />
        
        <div className="form-section-title text-danger">Operação perigosa</div>
        <button
          type="button"
          disabled={deleteLoading}
          className="btn btn-danger-outline btn-sm"
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