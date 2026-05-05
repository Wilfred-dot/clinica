'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

export default function NewPatientPage() {
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
      <div className="ph">
        <div>
          <h1>Novo Paciente</h1>
          <p className="sub">Registar paciente na base de dados</p>
        </div>
        <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
      </div>
      <form onSubmit={handleSubmit} className="form-panel">
        {error && <div className="badge br" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="form-section-title">Dados pessoais</div>
        <div className="form-row">
          <div className="field">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })); }} required />
            {fieldErrors.name && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.name}</span>}
          </div>
          <div className="field">
            <label>Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={e => { setDataNascimento(e.target.value); setFieldErrors(prev => ({ ...prev, dataNascimento: '' })); }} required />
            {fieldErrors.dataNascimento && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.dataNascimento}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Sexo</label>
            <select value={sexo} onChange={e => setSexo(e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div className="field">
            <label>Contacto telefónico</label>
            <input type="tel" value={telefone} onChange={e => { setTelefone(e.target.value); setFieldErrors(prev => ({ ...prev, telefone: '' })); }} required placeholder="+258 8X XXX XXXX" />
            {fieldErrors.telefone && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.telefone}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Email (opcional)</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }} placeholder="paciente@email.com" />
            {fieldErrors.email && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label>Endereço</label>
            <input type="text" value={endereco} onChange={e => { setEndereco(e.target.value); setFieldErrors(prev => ({ ...prev, endereco: '' })); }} required placeholder="Rua, Bairro, Cidade" />
            {fieldErrors.endereco && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.endereco}</span>}
          </div>
        </div>

        <div className="form-sep" />
        <div className="form-section-title">Dados clínicos</div>
        <div className="field">
          <label>Observações clínicas</label>
          <textarea value={historicoMedico} onChange={e => setHistoricoMedico(e.target.value)} placeholder="Alergias conhecidas, condições pré-existentes..."></textarea>
        </div>

        <div className="form-sep" />
        <div className="form-section-title">Acesso ao portal (opcional)</div>
        <div className="field">
          <label>Senha inicial</label>
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }} placeholder="Deixar em branco para não criar conta" />
          {fieldErrors.password && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{fieldErrors.password}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Guardar paciente'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </Shell>
  );
}
