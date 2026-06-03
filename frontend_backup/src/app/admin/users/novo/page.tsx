'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('recepcionista');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        body: JSON.stringify({ name, email, role, password }),
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
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>
          ← Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-panel max-w-[680px]">
        {error && (
          <div className="alert alert-danger mb-6">
            {error}
          </div>
        )}

        <div className="form-section-title">Dados pessoais</div>

        <div className="form-grid">
          <div className="form-group">
            <label>Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome do utilizador"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@clinicammq.com"
              className="form-control"
            />
          </div>
        </div>

        <hr />

        <div className="form-section-title">Acesso</div>

        <div className="form-grid mb-4">
          <div className="form-group">
            <label>Nível de acesso</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Senha inicial</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Confirmar senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repetir senha"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions mt-8">
          <button type="submit" disabled={loading} className="btn btn-primary h-12 px-5">
            {loading ? 'Criando...' : 'Criar utilizador'}
          </button>

          <button type="button" onClick={() => router.back()} className="btn btn-outline h-12 px-5">
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  );
}