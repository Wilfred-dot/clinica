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
          <div className="field"><label>Nome completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="field"><label>Data de nascimento</label><input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Sexo</label><select value={sexo} onChange={e => setSexo(e.target.value)}><option value="M">Masculino</option><option value="F">Feminino</option><option value="O">Outro</option></select></div>
          <div className="field"><label>Contacto telefónico</label><input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Email (opcional)</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="field"><label>Endereço</label><input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} required /></div>
        </div>
        <div className="form-sep" />
        <div className="form-section-title">Dados clínicos</div>
        <div className="field"><label>Observações clínicas</label><textarea value={historicoMedico} onChange={e => setHistoricoMedico(e.target.value)}></textarea></div>
        <div className="form-sep" />
        <div className="form-section-title">Acesso ao portal (opcional)</div>
        <div className="field"><label>Senha inicial</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Deixar em branco para não criar conta" /></div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Criando...' : 'Guardar paciente'}</button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>
    </Shell>
  );
}
