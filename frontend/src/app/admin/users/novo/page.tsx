'use client';

import { useState } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('recepcionista');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // novo campo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          role,
          password,
        }),
      });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar utilizador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Novo Utilizador</h1>
          <p className="sub">Criar conta de acesso ao sistema</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.back()}>
          ← Voltar
        </button>
      </div>

      {/* FORM-PANEL – igual ao design original */}
      <div className="bg-white border border-[#ecf1f6] rounded-[12px] p-[28px_30px] shadow-[0_1px_3px_rgba(12,26,39,.05)] max-w-[680px]">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Secção: Dados pessoais */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Dados pessoais
        </div>

        <div className="flex flex-wrap gap-5 mb-0">
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome do utilizador"
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-4 text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"            />
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@clinicammq.com"
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-4 text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"            />
          </div>
        </div>

        {/* Separador visual */}
<hr className="my-5 border-[#ecf1f6]" />
        {/* Secção: Acesso */}
        <div className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
          Acesso
        </div>

        <div className="flex flex-wrap gap-5 mb-5">
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
              Nível de acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-4 text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"            >
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>

        </div>

        <div className="flex flex-wrap gap-5 mb-0">
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
              Senha inicial
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-4 text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"            />
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-[0.8px] text-[#6b8299] mb-4">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repetir senha"
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-4 text-sm text-[#0c1a27] outline-none transition focus:border-[#007d74] focus:ring-[0_0_0_3px_rgba(0,125,116,0.1)]"            />
          </div>
        </div>

        {/* Acções */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
className="h-12 rounded-[8px] bg-[#007d74] px-5 text-sm font-semibold text-white transition hover:bg-[#009d92] disabled:opacity-50"          >
            {loading ? 'Criando...' : 'Criar utilizador'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
className="h-12 rounded-[8px] border border-[#d6e0ea] bg-white px-5 text-sm font-semibold text-[#2e4358] transition hover:bg-[#f1f5f9] hover:border-[#a8bfcf]"          >
            Cancelar
          </button>
        </div>
      </div>
    </Shell>
  );
}