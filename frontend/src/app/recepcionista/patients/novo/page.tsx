'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

export default function ReceptionNewPatientPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !dataNascimento || !telefone || !endereco) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      await request('/pacientes', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email: email || undefined,
          data_nascimento: dataNascimento,
          sexo,
          telefone,
          endereco,
          historico_medico: historicoMedico || undefined,
          password: password || undefined,
        }),
      });
      router.push('/recepcionista/patients');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#0c1a27] tracking-[-0.3px]">Novo Paciente</h1>
          <p className="text-[13px] text-[#6b8299] mt-1">Registar novo paciente — Recepção</p>
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
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Nome do paciente"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Data de nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => setDataNascimento(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="mb-4">
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
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Contacto telefónico
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              required
              placeholder="+258 8X XXX XXXX"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="paciente@email.com"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              required
              placeholder="Rua, Bairro, Cidade"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
            />
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
            placeholder="Alergias conhecidas, condições pré-existentes..."
            className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition resize-y focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
          ></textarea>
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Acesso ao portal (opcional) */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Acesso ao portal <span className="font-normal normal-case tracking-normal text-[#a8bfcf]">(opcional)</span>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-[#2e4358] mb-1.5">
            Senha inicial
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Deixar em branco para não criar conta"
            className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"
          />
        </div>

        {/* Acções */}
        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#007d74] px-5 h-12 text-sm font-semibold text-white transition hover:bg-[#009d92] disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Guardar paciente'}
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