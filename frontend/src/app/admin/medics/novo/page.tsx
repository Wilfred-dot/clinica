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
      <div className="ph">
        <div>
          <h1>Novo Médico</h1>
          <p className="sub">Registar médico no corpo clínico</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
      </div>

      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-section-title">Dados profissionais</div>
        <div className="form-row">
          <div className="field">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Dra. Ana Cossa" />
          </div>
          <div className="field">
            <label>Especialidade</label>
            <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} required placeholder="Ex: Oftalmologia Geral" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>N.º de Registo</label>
            <input type="text" value={numeroOrdem} onChange={e => setNumeroOrdem(e.target.value)} required placeholder="OM-AAAA-XXXX" />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="+258 8X XXX XXXX" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Horário de trabalho</label>
            <input type="text" value={horarioTrabalho} onChange={e => setHorarioTrabalho(e.target.value)} placeholder="08:00-16:00" />
          </div>
        </div>

        <div className="form-sep" />

        <div className="form-section-title">Acesso ao sistema</div>
        <div className="form-row">
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="medico@clinica.co.mz" />
          </div>
          <div className="field">
            <label>Senha inicial</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Será alterada no 1.º acesso" />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Guardar médico'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </Shell>
  );
}
