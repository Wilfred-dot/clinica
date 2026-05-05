'use client';

import { useEffect, useState } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string }; id: number };
}

interface DayMap { [hour: string]: ConsultaItem[] }

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function formatDate(date: Date): string { return date.toISOString().split('T')[0]; }
function getWeekDays(start: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
  return days;
}
const doctorColors: Record<number, string> = { 2: 'ev-teal', 5: 'ev-sky', 0: 'ev-warn' };

export default function ReceptionConsultationsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const weekDays = getWeekDays(currentWeekStart);

  const fetchWeek = async (startDate: Date) => {
    setLoading(true);
    try {
      const response = await request<any>(`/consultas/semana?data=${formatDate(startDate)}`);
      const all: ConsultaItem[] = [];
      if (response && typeof response === 'object') {
        Object.values(response).forEach((day: any) => {
          if (day && typeof day === 'object') Object.values(day).forEach((arr: any) => { if (Array.isArray(arr)) all.push(...arr); });
        });
      }
      setConsultas(all);
    } catch (err) { console.error('Erro ao carregar consultas da semana', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeek(currentWeekStart); }, [currentWeekStart]);

  const goToWeek = (offset: number) => { const newStart = new Date(currentWeekStart); newStart.setDate(newStart.getDate() + offset * 7); setCurrentWeekStart(getWeekStart(newStart)); };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await request(`/consultas/${cancelId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelada' }),
      });
      setConsultas(prev => prev.map(c => c.id === cancelId ? { ...c, status: 'cancelada' } : c));
    } catch (err) {
      console.error('Erro ao cancelar consulta', err);
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const schedule: DayMap[] = weekDays.map(() => ({}));
  consultas.forEach(c => {
    const d = new Date(c.data_hora);
    const dayIndex = weekDays.findIndex(wd => wd.getFullYear() === d.getFullYear() && wd.getMonth() === d.getMonth() && wd.getDate() === d.getDate());
    if (dayIndex < 0) return;
    const hour = d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (!schedule[dayIndex][hour]) schedule[dayIndex][hour] = [];
    schedule[dayIndex][hour].push(c);
  });

  const hours = ['08:00','09:00','10:00','10:30','11:00','14:00','15:00','16:00'];

  return (
    <Shell>
      <div className="ph">
        <div><h1>Consultas</h1><p className="sub">Semana de {weekDays[0]?.toLocaleDateString('pt-MZ')} a {weekDays[4]?.toLocaleDateString('pt-MZ')}</p></div>
        <div className="ph-actions">
          <button className="btn btn-outline" onClick={() => goToWeek(-1)}>← Semana anterior</button>
          <button className="btn btn-outline" onClick={() => goToWeek(1)}>Semana seguinte →</button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/recepcionista/consultations/agendar'}><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Agendar consulta</button>
        </div>
      </div>
      {loading ? <p style={{ textAlign:'center', color:'var(--ink4)', padding:40 }}>A carregar agenda...</p> : (
        <div className="sched-wrap">
          <div className="sched-head"><div className="sched-th"></div>{weekDays.map((day,i)=>(<div className="sched-th" key={i}>{day.toLocaleDateString('pt-MZ',{weekday:'short',day:'2-digit',month:'2-digit'})}</div>))}</div>
          <div className="sched-body">
            {hours.map(hour => (
              <div className="sched-row" key={hour}>
                <div className="sched-time">{hour}</div>
                {weekDays.map((_,dayIdx) => (
                  <div className="sched-cell" key={dayIdx}>
                    {(schedule[dayIdx][hour]||[]).map(c => {
                      const colorClass = doctorColors[c.medicos?.id] || 'ev-warn';
                      return (
                        <div key={c.id}>
                          <div className={`ev ${colorClass}`} onClick={() => window.location.href = `/medico/consulta/${c.id}`} title={`${c.pacientes?.users?.name ?? 'N/D'} - ${c.medicos?.users?.name ?? 'N/D'}`}>
                            {c.pacientes?.users?.name ?? 'N/D'}
                            <div className="ev-doc">{c.medicos?.users?.name ?? 'N/D'}</div>
                          </div>
                          {c.status === 'agendada' && (
                            <button
                              className="btn btn-sm"
                              style={{ marginTop: 4, background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid #f0c4c4', fontSize: 10, padding: '2px 6px' }}
                              onClick={() => setCancelId(c.id)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && consultas.length === 0 && <p style={{ textAlign:'center', color:'var(--ink4)', padding:40 }}>Nenhuma consulta agendada para esta semana.</p>}

      <ConfirmModal
        open={!!cancelId}
        title="Cancelar consulta"
        message="Tem a certeza de que pretende cancelar esta consulta?"
        confirmLabel="Cancelar consulta"
        cancelLabel="Não cancelar"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
        variant="danger"
      />
    </Shell>
  );
}
