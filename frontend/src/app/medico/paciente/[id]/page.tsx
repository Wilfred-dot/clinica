'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';

interface ConsultaResumo {
  id: number;
  data_hora: string;
  medicos: { users: { name: string } };
  diagnostico?: string;
  prescricao?: string;
  status: string;
}

interface Paciente {
  id: number;
  users: { name: string; email: string };
  data_nascimento: string;
  sexo: string;
  telefone: string;
  endereco: string;
  historico_medico?: string;
}

export default function PacienteHistoricoPage() {
  const params = useParams();
  const router = useRouter();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [consultas, setConsultas] = useState<ConsultaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pac, cons] = await Promise.all([
          request<Paciente>(`/pacientes/${params.id}`),
          request<ConsultaResumo[]>(`/consultas?paciente_id=${params.id}`),
        ]);
        setPaciente(pac);
        setConsultas(cons ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return <Shell><p className="p-8">A carregar...</p></Shell>;
  if (!paciente) return <Shell><p className="p-8">Paciente não encontrado.</p></Shell>;

  const totalConsultas = consultas.length;
  const totalPrescricoes = consultas.filter(c => c.prescricao).length;
  const totalExames = consultas.filter(c => c.diagnostico?.toLowerCase().includes('exame')).length;

  return (
    <Shell>
      <div className="ph">
        <div>
          <h1>Ficha Clínica</h1>
          <p className="sub">{paciente.users.name} · Paciente #{paciente.id}</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-outline" onClick={() => router.back()}>← Voltar</button>
          <Link href={`/medico/consulta/novo?paciente_id=${paciente.id}`} className="btn btn-primary">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nova Consulta
          </Link>
        </div>
      </div>

      <div className="ficha-layout">
        <div>
          <div className="patient-card">
            <div className="pc-header">
              <div className="pc-avatar">{paciente.users.name.charAt(0).toUpperCase()}</div>
              <h3>{paciente.users.name}</h3>
              <p>{paciente.data_nascimento ? `${new Date().getFullYear() - new Date(paciente.data_nascimento).getFullYear()} anos` : 'Idade desconhecida'} · {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
            </div>
            <div className="pc-body">
              <div className="pc-row"><span className="lbl">Nascimento</span><span className="val">{paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-MZ') : '—'}</span></div>
              <div className="pc-row"><span className="lbl">Contacto</span><span className="val">{paciente.telefone || '—'}</span></div>
              <div className="pc-row"><span className="lbl">Email</span><span className="val">{paciente.users.email || '—'}</span></div>
              <div className="pc-row"><span className="lbl">Endereço</span><span className="val">{paciente.endereco || '—'}</span></div>
              <div className="pc-row"><span className="lbl">Alergias / Histórico</span><span className="val" style={{ color: 'var(--danger)' }}>{paciente.historico_medico || 'Nenhum'}</span></div>
            </div>
            <div className="pc-footer">
              <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => router.push(`/admin/patients/${paciente.id}/editar`)}>Editar dados</button>
            </div>
          </div>
        </div>
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="stat c-teal"><div className="ic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><h3>{totalConsultas}</h3><p>Consultas</p></div>
            <div className="stat c-sky"><div className="ic"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><h3>{totalPrescricoes}</h3><p>Prescrições</p></div>
            <div className="stat c-green"><div className="ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><h3>{totalExames}</h3><p>Exames</p></div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Consultas Realizadas</h3></div>
            <table>
              <thead><tr><th>Data</th><th>Médico</th><th>Diagnóstico</th><th>Prescrição</th><th></th></tr></thead>
              <tbody>
                {consultas.map(c => (
                  <tr key={c.id}>
                    <td>{new Date(c.data_hora).toLocaleDateString('pt-MZ')}</td>
                    <td>{c.medicos?.users?.name || '—'}</td>
                    <td>{c.diagnostico || '—'}</td>
                    <td>{c.prescricao || '—'}</td>
                    <td><Link href={`/medico/consulta/${c.id}`} className="btn btn-ghost btn-sm">Abrir</Link></td>
                  </tr>
                ))}
                {consultas.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Nenhuma consulta registada.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
