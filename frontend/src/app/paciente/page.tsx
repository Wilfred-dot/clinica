'use client';

import { useEffect, useState } from 'react';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';
import Link from 'next/link';

interface Consulta {
  id: number;
  data_hora: string;
  status: string;
  medicos: { users: { name: string }; especialidade: string };
}

interface Notificacao {
  id: number;
  mensagem: string;
  data_envio: string;
  tipo_variavel: string;
}

export default function PacienteDashboard() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter perfil do paciente
        const perfil = await request<{ nome: string; id: number }>('/pacientes/me');
        setNome(perfil?.nome || 'Paciente');
        const pacienteId = perfil?.id;
        if (pacienteId) {
          // Próximas consultas (apenas agendadas, limitado a 5)
          const cons = await request<{ data: Consulta[] }>(`/consultas?paciente_id=${pacienteId}&status=agendada&limit=5`);
          setConsultas(cons?.data ?? []);
        }
        // Notificações
        const notifs = await request<Notificacao[]>('/notificacoes/minhas');
        setNotificacoes(notifs.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dados do paciente', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PortalLayout>
      <div className="portal-wrap">
        <div className="welcome-banner">
          <div className="wb-avatar">{nome.charAt(0)}</div>
          <div className="wb-text">
            <h2>Bem‑vindo, {nome}</h2>
            <p>Clínica MMQ Oftalmologia</p>
          </div>
        </div>

        <p className="section-title">Próximas Consultas</p>
        <div className="upcoming-grid" style={{ marginBottom: 24 }}>
          {consultas.length > 0 ? consultas.map(c => (
            <div className="uc" key={c.id}>
              <div className="uc-date">{new Date(c.data_hora).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(c.data_hora).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</div>
              <h4>{c.medicos?.users?.name}</h4>
              <p>{c.medicos?.especialidade}</p>
              <span className="badge bw">Agendada</span>
            </div>
          )) : (
            <p style={{ fontSize: 13, color: 'var(--ink4)' }}>Nenhuma consulta agendada.</p>
          )}
        </div>

        <div className="portal-grid">
          <div>
            <p className="section-title">Notificações</p>
            <div className="notifs">
              {notificacoes.length > 0 ? notificacoes.map(n => {
                const ndClass = n.tipo_variavel === 'confirmacao' ? 'nd-b' : n.tipo_variavel === 'alerta' ? 'nd-w' : 'nd-t';
                return (
                  <div className="notif" key={n.id}>
                    <div className={`nd ${ndClass}`}></div>
                    <div><strong>{n.mensagem}</strong><span>{new Date(n.data_envio).toLocaleString('pt-MZ')}</span></div>
                  </div>
                );
              }) : (
                <p style={{ fontSize: 13, color: 'var(--ink4)' }}>Sem notificações.</p>
              )}
            </div>
          </div>
          <div>
            <p className="section-title">Acções</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/paciente/agendar" className="btn btn-primary btn-block">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Agendar nova consulta
              </Link>
              <Link href="/paciente/historico" className="btn btn-outline btn-block">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                Ver histórico clínico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
