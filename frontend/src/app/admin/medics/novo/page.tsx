'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

export default function NewMedicPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [numeroOrdem, setNumeroOrdem] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horarioTrabalho, setHorarioTrabalho] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await request('/medicos', {
        method: 'POST',
        body: JSON.stringify({
          name, // O backend deve interceptar para popular a tabela 'users'
          email,
          especialidade,
          numero_ordem: numeroOrdem,
          telefone,
          horario_trabalho: horarioTrabalho,
          password,
        }),
      });
      // Show success toast
      toast('Médico criado com sucesso!', 'success');
      router.push('/admin/medics');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">
            Novo Médico
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">
            Registrar médico no corpo clínico
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-4 py-2 text-[13.5px] font-bold text-[var(--ink)] transition hover:bg-slate hover:border-ink-4 shadow-sm"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--white)] border border-[var(--border2)] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_2px_4px_rgba(16,42,107,.03)]"
      >
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
            {error}
          </div>
        )}

        <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
          Dados profissionais
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Nome completo <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Ex: Dra. Ana Cossa"
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Especialidade <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={especialidade}
              onChange={e => setEspecialidade(e.target.value)}
              required
              placeholder="Ex: Oftalmologia Geral"
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              N.º de Registo
            </label>
            <input
              type="text"
              value={numeroOrdem}
              onChange={e => setNumeroOrdem(e.target.value)}
              required
              placeholder="OM-AAAA-XXXX"
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="Ex: +258 84 123 4567"
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
            Horário de trabalho
          </label>
          <input
            type="text"
            value={horarioTrabalho}
            onChange={e => setHorarioTrabalho(e.target.value)}
            placeholder="Ex: Seg-Sex 08:00-16:00"
            className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
          />
        </div>

        <hr className="border-[var(--border2)] my-5" />

        <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
          Acesso ao sistema
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="medico@clinica.co.mz"
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--ink)] mb-1.5">
              Senha inicial
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--white)] text-sm text-[var(--ink)] font-medium outline-none transition focus:border-[var(--mmq-orange)] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>
        </div>

        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[var(--border2)]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--mmq-orange)] px-6 h-12 text-sm font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Guardar médico'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--white)] px-5 h-12 text-sm font-bold text-ink-3 transition hover:bg-slate hover:border-ink-4"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}