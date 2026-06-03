'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';

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

export default function EditMedicPage() {
  const params = useParams();
  const router = useRouter();
  const [medico, setMedico] = useState<Medico | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [numeroOrdem, setNumeroOrdem] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horarioTrabalho, setHorarioTrabalho] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (params?.id) {
      request<Medico>(`/medicos/${params.id}`)
        .then(m => {
          setMedico(m);
          setName(m.users?.name ?? '');
          setEmail(m.users?.email ?? '');
          setEspecialidade(m.especialidade);
          setNumeroOrdem(m.numero_ordem);
          setTelefone(m.telefone);
          setHorarioTrabalho(m.horario_trabalho);
          setAtivo(m.users?.ativo ?? true);
        })
        .catch((err) => console.error(err));
    }
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await request(`/medicos/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          especialidade,
          numero_ordem: numeroOrdem,
          telefone,
          horario_trabalho: horarioTrabalho,
        }),
      });
      const userBody: any = { name, email, ativo };
      if (password) userBody.password = password;
      await request(`/users/${medico?.user_id}`, {
        method: 'PATCH',
        body: JSON.stringify(userBody),
      });
      router.push('/admin/medics');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar médico');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await request(`/medicos/${params.id}`, { method: 'DELETE' });
      router.push('/admin/medics');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar médico');
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (!medico)
    return (
      <Shell>
        <p className="p-12 text-center text-muted">A carregar...</p>
      </Shell>
    );

  return (
    <Shell>
      {/* Cabeçalho da página limpo */}
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Editar Médico</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">
            {medico.users?.name} · {medico.users?.email}
          </p>
        </div>
        <button className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium" onClick={() => router.back()}>
          ← Voltar
        </button>
      </div>

      {/* Painel do formulário unificado */}
      <form onSubmit={handleSubmit} className="form-panel max-w-[680px]">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="form-section-title">
          Dados pessoais
        </div>
        
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

        <div className="form-section-title">
          Dados profissionais
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Especialidade</label>
            <input
              type="text"
              value={especialidade}
              onChange={e => setEspecialidade(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>N.º de Ordem</label>
            <input
              type="text"
              value={numeroOrdem}
              onChange={e => setNumeroOrdem(e.target.value)}
              required
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Horário de Trabalho</label>
            <input
              type="text"
              value={horarioTrabalho}
              onChange={e => setHorarioTrabalho(e.target.value)}
              placeholder="08:00-16:00"
              className="form-control"
            />
          </div>
        </div>

        <hr />

        <div className="form-section-title">
          Acesso
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>
              Nova senha <span className="text-muted font-normal normal-case tracking-normal">(deixar em branco para manter)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="form-control"
            />
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

        {/* Acções principais */}
        <div className="form-actions mt-8">
          <button type="submit" disabled={loading} className="btn btn-primary h-12 px-6">
            {loading ? 'Guardando...' : 'Guardar alterações'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline h-12 px-5">
            Cancelar
          </button>
        </div>

        <hr />
        
        <div className="form-section-title text-danger">
          Operação perigosa
        </div>
        <button
          type="button"
          disabled={deleteLoading}
          className="btn btn-danger-outline btn-sm"
          onClick={() => setShowDelete(true)}
        >
          {deleteLoading ? 'Eliminando...' : 'Eliminar médico'}
        </button>

        <ConfirmModal
          open={showDelete}
          title="Eliminar médico"
          message={`Tem a certeza de que pretende eliminar ${medico.users?.name}? Esta acção é irreversível.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          variant="danger"
        />
      </form>
    </Shell>
  );
}