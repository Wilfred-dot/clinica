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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
      </div>
      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="form-section-title">Dados pessoais</div>
        <div className="form-row">
          <div className="field">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nome do utilizador" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@clinica.co.mz" />
          </div>
        </div>
        <div className="form-sep" />
        <div className="form-section-title">Acesso</div>
        <div className="form-row">
          <div className="field">
            <label>Nível de acesso</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="paciente">Paciente</option>
            </select>
          </div>
          <div className="field">
            <label>Senha inicial</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar utilizador'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </Shell>
  );
}
