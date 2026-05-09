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

  if (!patient)
    return (
      <Shell>
        <p className="p-8 text-center text-[#a8bfcf]">A carregar...</p>
      </Shell>
    );

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Editar Paciente</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">
            {patient.users?.name} · {patient.users?.email || 'Sem email'}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      </div>

      {/* Painel do formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#ecf1f6] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_1px_3px_rgba(12,26,39,0.05)]"
      >
        {/* Erro geral */}
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f0] text-[#b83232] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b83232]"></span>
            {error}
          </div>
        )}

        {/* Secção: Dados pessoais */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados pessoais
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setFieldErrors(prev => ({ ...prev, name: '' }));
              }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.name && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.name}</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Data de nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => {
                setDataNascimento(e.target.value);
                setFieldErrors(prev => ({ ...prev, dataNascimento: '' }));
              }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.dataNascimento && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.dataNascimento}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Sexo
            </label>
            <select
              value={sexo}
              onChange={e => setSexo(e.target.value)}
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Contacto telefónico
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => {
                setTelefone(e.target.value);
                setFieldErrors(prev => ({ ...prev, telefone: '' }));
              }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.telefone && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.telefone}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.email && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.email}</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={e => {
                setEndereco(e.target.value);
                setFieldErrors(prev => ({ ...prev, endereco: '' }));
              }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.endereco && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.endereco}</p>
            )}
          </div>
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Dados clínicos */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados clínicos
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
            Observações clínicas
          </label>
          <textarea
            value={historicoMedico}
            onChange={e => setHistoricoMedico(e.target.value)}
            className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition resize-y focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
          ></textarea>
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Acesso */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Acesso
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Nova senha{' '}
              <span className="font-normal normal-case tracking-normal text-[#a8bfcf]">
                (deixar em branco para manter)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
            {fieldErrors.password && (
              <p className="text-xs text-[#b83232] mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Estado
            </label>
            <select
              value={ativo ? 'true' : 'false'}
              onChange={e => setAtivo(e.target.value === 'true')}
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Acções principais */}
        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#007d74] px-5 h-12 text-sm font-semibold text-white transition hover:bg-[#009d92] disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar alterações'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-5 h-12 text-sm font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
          >
            Cancelar
          </button>
        </div>

        {/* Operação perigosa */}
        <hr className="border-[#ecf1f6] my-5" />
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Operação perigosa
        </div>
        <button
          type="button"
          disabled={deleteLoading}
          className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-xs font-semibold bg-[#fdf0f0] text-[#b83232] border border-[#f0c4c4] transition hover:bg-[#fdf0f0] disabled:opacity-50"
          onClick={() => setShowDelete(true)}
        >
          {deleteLoading ? 'Eliminando...' : 'Eliminar paciente'}
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