'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

  if (!user) return <Shell><p className="p-8">A carregar...</p></Shell>;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Editar Utilizador</h1>
          <p className="sub">{user.name} · {user.email}</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
      </div>
      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="form-section-title">Dados pessoais</div>
        <div className="form-row">
          <div className="field">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="form-sep" />
        <div className="form-section-title">Acesso</div>
        <div className="form-row">
          <div className="field">
            <label>Nível de acesso</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>
          <div className="field">
            <label>Nova senha <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink4)' }}>(deixar em branco para manter)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha" />
          </div>
        </div>
        <div className="field">
          <label>Estado</label>
          <select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar alterações'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>

        <div className="form-sep" />
        <div className="form-section-title">Operação perigosa</div>
        <button
          type="button"
          className="btn btn-sm"
          style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid #f0c4c4' }}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Eliminar utilizador
        </button>

        <ConfirmModal
          open={showDeleteConfirm}
          title="Eliminar utilizador"
          message={`Tem a certeza de que pretende eliminar ${user?.name}? Esta acção é irreversível.`}
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
