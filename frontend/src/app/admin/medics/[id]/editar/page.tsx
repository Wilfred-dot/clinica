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
      .catch(() => {});
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Update médico fields
      await request(`/medicos/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          especialidade,
          numero_ordem: numeroOrdem,
          telefone,
          horario_trabalho: horarioTrabalho,
        }),
      });
      // Update user fields (name, email, ativo, optional password)
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

  if (!medico) return <Shell><p className="p-8">A carregar...</p></Shell>;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Editar Médico</h1>
          <p className="sub">{medico.users?.name} · {medico.users?.email}</p>
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

        <div className="form-section-title">Dados profissionais</div>
        <div className="form-row">
          <div className="field">
            <label>Especialidade</label>
            <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} required />
          </div>
          <div className="field">
            <label>N.º de Ordem</label>
            <input type="text" value={numeroOrdem} onChange={e => setNumeroOrdem(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Telefone</label>
            <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} />
          </div>
          <div className="field">
            <label>Horário de Trabalho</label>
            <input type="text" value={horarioTrabalho} onChange={e => setHorarioTrabalho(e.target.value)} placeholder="08:00-16:00" />
          </div>
        </div>

        <div className="form-sep" />

        <div className="form-section-title">Acesso</div>
        <div className="form-row">
          <div className="field">
            <label>Nova senha <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink4)' }}>(deixar em branco para manter)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha" />
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
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
          onClick={() => setShowDelete(true)}
        >
          Eliminar médico
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
