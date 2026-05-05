'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';

interface Paciente {
  id: number;
  user_id: number;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  endereco: string;
  historico_medico?: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
}

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('M');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [historicoMedico, setHistoricoMedico] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    request<Paciente>(`/pacientes/${params.id}`)
      .then(p => {
        setPatient(p);
        setName(p.users?.name ?? '');
        setEmail(p.users?.email ?? '');
        setDataNascimento(p.data_nascimento ? new Date(p.data_nascimento).toISOString().split('T')[0] : '');
        setSexo(p.sexo ?? 'M');
        setTelefone(p.telefone ?? '');
        setEndereco(p.endereco ?? '');
        setHistoricoMedico(p.historico_medico ?? '');
        setAtivo(p.users?.ativo ?? true);
      })
      .catch(() => {});
  }, [params.id]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'O nome é obrigatório.';
    if (!dataNascimento.trim()) errs.dataNascimento = 'A data de nascimento é obrigatória.';
    if (!telefone.trim()) {
      errs.telefone = 'O telefone é obrigatório.';
    } else if (!/^\+?\d[\d\s]{7,}$/.test(telefone)) {
      errs.telefone = 'Formato de telefone inválido.';
    }
    if (!endereco.trim()) errs.endereco = 'O endereço é obrigatório.';
    if (password && password.length < 6) {
      errs.password = 'A senha deve ter no mínimo 6 caracteres.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Formato de email inválido.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await request(`/pacientes/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          data_nascimento: dataNascimento,
          sexo,
          telefone,
          endereco,
          historico_medico: historicoMedico,
        }),
      });
      // atualizar dados do user associado
      if (patient?.user_id) {
        const userBody: any = { name, ativo };
        if (email) userBody.email = email;
        if (password) userBody.password = password;
        await request(`/users/${patient.user_id}`, {
          method: 'PATCH',
          body: JSON.stringify(userBody),
        });
      }
      router.push('/admin/patients');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await request(`/pacientes/${params.id}`, { method: 'DELETE' });
      router.push('/admin/patients');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar paciente');
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (!patient) return <Shell><p className="p-8">A carregar...</p></Shell>;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Editar Paciente</h1>
          <p className="sub">{patient.users?.name} · {patient.users?.email || 'Sem email'}</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
      </div>
      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-section-title">Dados pessoais</div>
        <div className="form-row">
          <div className="field">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })); }} required />
            {fieldErrors.name && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.name}</span>}
          </div>
          <div className="field">
            <label>Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={e => { setDataNascimento(e.target.value); setFieldErrors(prev => ({ ...prev, dataNascimento: '' })); }} required />
            {fieldErrors.dataNascimento && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.dataNascimento}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Sexo</label>
            <select value={sexo} onChange={e => setSexo(e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div className="field">
            <label>Contacto telefónico</label>
            <input type="tel" value={telefone} onChange={e => { setTelefone(e.target.value); setFieldErrors(prev => ({ ...prev, telefone: '' })); }} required />
            {fieldErrors.telefone && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.telefone}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Email (opcional)</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }} />
            {fieldErrors.email && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label>Endereço</label>
            <input type="text" value={endereco} onChange={e => { setEndereco(e.target.value); setFieldErrors(prev => ({ ...prev, endereco: '' })); }} required />
            {fieldErrors.endereco && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.endereco}</span>}
          </div>
        </div>

        <div className="form-sep" />
        <div className="form-section-title">Dados clínicos</div>
        <div className="field">
          <label>Observações clínicas</label>
          <textarea value={historicoMedico} onChange={e => setHistoricoMedico(e.target.value)}></textarea>
        </div>

        <div className="form-sep" />
        <div className="form-section-title">Acesso</div>
        <div className="form-row">
          <div className="field">
            <label>Nova senha <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink4)' }}>(deixar em branco para manter)</span></label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }} />
            {fieldErrors.password && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.password}</span>}
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
          Eliminar paciente
        </button>

        <ConfirmModal
          open={showDelete}
          title="Eliminar paciente"
          message={`Tem a certeza de que pretende eliminar ${patient.users?.name}?`}
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
