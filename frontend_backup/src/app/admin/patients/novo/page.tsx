'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importação corrigida aqui
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

export default function NewPatientPage() {
  const router = useRouter(); // Simplificado sem alias redundante
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'O nome é obrigatório.';
    if (!dataNascimento.trim()) errs.dataNascimento = 'A data de nascimento é obrigatória.';
    if (!telefone.trim()) {
      errs.telefone = 'O telefone é obrigatório.';
    } else if (!/^\+?\d[\d\s]{7,}$/.test(telefone)) {
      errs.telefone = 'Formato de telefone inválido. Exemplo: +258 84 555 1234';
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
      router.push('/admin/patients');
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
          <h1 className="text-[24px] font-bold text-[#102A6B] tracking-[-0.5px]">Novo Paciente</h1>
          <p className="text-[13px] text-[#6b8299] mt-0.5 font-medium">Registar utente na base de dados</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-4 py-2 text-[13.5px] font-bold text-[#6b8299] transition hover:bg-[#f1f5f9]"
          onClick={() => router.back()}
        >
          &larr; Voltar
        </button>
      </div>

      {/* Painel do formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#ecf1f6] rounded-[12px] p-[28px_30px] max-w-[680px] shadow-[0_2px_4px_rgba(16,42,107,.03)]"
      >
        {error && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f0] text-[#ef4444] text-[11.5px] font-semibold px-2.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
            {error}
          </div>
        )}

        {/* Secção: Dados pessoais */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados pessoais
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })); }}
              required
              placeholder="Nome do paciente"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.name && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.name}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Data de nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => { setDataNascimento(e.target.value); setFieldErrors(prev => ({ ...prev, dataNascimento: '' })); }}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.dataNascimento && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.dataNascimento}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Sexo
            </label>
            <div className="relative">
              <select
                value={sexo}
                onChange={e => setSexo(e.target.value)}
                className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)] appearance-none pr-[34px]"
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
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Contacto telefónico
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={e => { setTelefone(e.target.value); setFieldErrors(prev => ({ ...prev, telefone: '' })); }}
              required
              placeholder="+258 8X XXX XXXX"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.telefone && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.telefone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
              placeholder="paciente@email.com"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.email && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.email}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={e => { setEndereco(e.target.value); setFieldErrors(prev => ({ ...prev, endereco: '' })); }}
              required
              placeholder="Rua, Bairro, Cidade"
              className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
            {fieldErrors.endereco && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.endereco}</p>}
          </div>
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Dados clínicos */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados clínicos
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
            Observações clínicas
          </label>
          <textarea
            value={historicoMedico}
            onChange={e => setHistoricoMedico(e.target.value)}
            placeholder="Alergias conhecidas, condições pré-existentes..."
            className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition resize-y focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
          />
        </div>

        <hr className="border-[#ecf1f6] my-5" />

        {/* Secção: Acesso ao portal */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Acesso ao portal <span className="font-normal normal-case tracking-normal text-[#a8bfcf]">(opcional)</span>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.6px] text-[#102A6B] mb-1.5">
            Senha inicial
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
            placeholder="Deixar em branco para não criar conta"
            className="w-full h-12 px-4 rounded-[8px] border border-[#d6e0ea] bg-white text-sm text-[#102A6B] font-medium outline-none transition focus:border-[#FF7F00] focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
          />
          {fieldErrors.password && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.password}</p>}
        </div>

        {/* Ações */}
        <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[#ecf1f6]">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FF7F00] px-5 h-12 text-sm font-bold text-white transition hover:bg-[#E06F00] shadow-sm disabled:opacity-50"
          >
            {loading ? 'A criar...' : 'Guardar paciente'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d6e0ea] bg-white px-5 h-12 text-sm font-bold text-[#6b8299] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}