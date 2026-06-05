'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

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
        
        // Correção de fuso horário ao formatar para o input de data YYYY-MM-DD
        if (p.data_nascimento) {
          const dateParts = p.data_nascimento.split('T')[0];
          setDataNascimento(dateParts);
        } else {
          setDataNascimento('');
        }
        
        setSexo(p.sexo ?? 'M');
        setTelefone(p.telefone ?? '');
        setEndereco(p.endereco ?? '');
        setHistoricoMedico(p.historico_medico ?? '');
      })
      .catch((err: any) => {
        setError(err.message || 'Erro ao carregar os dados do paciente.');
      });
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
    setLoading(true);
    if (!validate()) return;
    try {
      await request(`/pacientes/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          email: email.trim() || null,
          data_nascimento: dataNascimento,
          sexo,
          telefone,
          endereco,
          historico_medico: historicoMedico.trim() || null,
          password: password || undefined,
        }),
      });
      // Show success toast
      toast('Paciente atualizado com sucesso!', 'success');
      router.push('/admin/patients');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar paciente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await request(`/pacientes/${params.id}`, { method: 'DELETE' });
      router.push('/admin/patients');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar paciente.');
      setShowDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!patient && !error) {
    return (
      <Shell>
        <p className="p-6 text-center text-sm font-medium text-ink-3 animate-pulse">
          A carregar dados do paciente...
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-ink-3">
        <span 
          className="cursor-pointer hover:text-[var(--mmq-orange)] transition-colors"
          onClick={() => router.push('/admin')}
        >
          Dashboard
        </span>
        <span className="mx-2">/</span>
        <span 
          className="cursor-pointer hover:text-[var(--mmq-orange)] transition-colors"
          onClick={() => router.push('/admin/patients')}
        >
          Pacientes
        </span>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)] font-medium">Editar</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Editar Paciente</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Modificar registos cadastrais do utente</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-white px-4 py-2 text-[13.5px] font-bold text-ink-3 transition hover:bg-slate"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[var(--border2)] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_2px_4px_rgba(16,42,107,.03)]"
      >
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-[var(--danger)] text-[11.5px] font-semibold px-2.5 py-1 mb-4 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span>
            {error}
          </div>
        )}

        <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
          Dados pessoais
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Nome completo <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })); }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.name && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.name}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Data de nascimento <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => { setDataNascimento(e.target.value); setFieldErrors(prev => ({ ...prev, dataNascimento: '' })); }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.dataNascimento && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.dataNascimento}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Sexo
            </label>
            <div className="relative">
              <select
                value={sexo}
                onChange={e => setSexo(e.target.value)}
                className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] appearance-none pr-[34px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center'
                }}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Contacto telefónico <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => { setTelefone(e.target.value); setFieldErrors(prev => ({ ...prev, telefone: '' })); }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.telefone && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.telefone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)]"
            />
            {fieldErrors.email && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.email}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Endereço <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={endereco}
              onChange={e => { setEndereco(e.target.value); setFieldErrors(prev => ({ ...prev, endereco: '' })); }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)]"
            />
            {fieldErrors.endereco && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.endereco}</p>}
          </div>
        </div>

        <hr className="border-[var(--border2)] my-5" />

        <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
          Dados clínicos
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
            Observações clínicas
          </label>
          <textarea
            value={historicoMedico}
            onChange={e => setHistoricoMedico(e.target.value)}
            className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition resize-y focus:border-[var(--mmq-orange)]"
          />
        </div>

        <hr className="border-[var(--border2)] my-5" />

        <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
          Alterar Senha de Acesso <span className="font-normal normal-case tracking-normal text-ink-4">(deixar em branco para manter)</span>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
            Nova senha
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
            placeholder="Mínimo 6 caracteres"
            className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)]"
          />
          {fieldErrors.password && <p className="text-xs text-[var(--danger)] mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="flex justify-between items-center gap-3 flex-wrap pt-5 mt-5 border-t border-[var(--border2)]">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-5 h-12 text-sm font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm disabled:opacity-50"
            >
              {loading ? 'A guardar...' : 'Guardar alterações'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-white px-5 h-12 text-sm font-bold text-ink-3 transition hover:bg-slate"
            >
              Cancelar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center rounded-[8px] bg-red-50 text-red-600 border border-red-200 px-4 h-12 text-sm font-bold transition hover:bg-red-100"
          >
            Eliminar paciente
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDelete}
        title="Eliminar registro de paciente"
        message="Tem a certeza de que deseja apagar permanentemente os dados clínicos e de acesso deste utente? Esta ação não pode ser revertida."
        confirmLabel={deleteLoading ? 'A eliminar...' : 'Sim, eliminar'}
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        variant="danger"
      />
    </Shell>
  );
}