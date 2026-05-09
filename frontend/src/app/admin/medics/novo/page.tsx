'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

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
          name,
          email,
          especialidade,
          numero_ordem: numeroOrdem,
          telefone,
          horario_trabalho: horarioTrabalho,
          password,
        }),
      });
      router.push('/admin/medics');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Novo Médico</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Registar médico no corpo clínico</p>
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
        {/* Mensagem de erro */}
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f0] text-[#b83232] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b83232]"></span>
            {error}
          </div>
        )}

        {/* Secção: Dados profissionais */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados profissionais
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Ex: Dra. Ana Cossa"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Especialidade
            </label>
            <input
              type="text"
              value={especialidade}
              onChange={e => setEspecialidade(e.target.value)}
              required
              placeholder="Ex: Oftalmologia Geral"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              N.º de Registo
            </label>
            <input
              type="text"
              value={numeroOrdem}
              onChange={e => setNumeroOrdem(e.target.value)}
              required
              placeholder="OM-AAAA-XXXX"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="+258 8X XXX XXXX"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
        </div>
        {/* Linha extra para horário de trabalho */}
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
            Horário de trabalho
          </label>
          <input
            type="text"
            value={horarioTrabalho}
            onChange={e => setHorarioTrabalho(e.target.value)}
            placeholder="Ex: Seg-Sex 08:00-16:00"
            className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
          />
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Acesso ao sistema */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Acesso ao sistema
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="medico@clinica.co.mz"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Senha inicial
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Será alterada no 1.º acesso"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
        </div>

        {/* Acções */}
        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#007d74] px-5 h-12 text-sm font-semibold text-white transition hover:bg-[#009d92] disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Guardar médico'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-5 h-12 text-sm font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}