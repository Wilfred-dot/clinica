'use client';

import { useEffect, useState, useMemo } from 'react';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConsultaItem {
  id: number;
  data_hora: string;
  status: string;
  pacientes: { users: { name: string } };
  medicos: { users: { name: string }; id: number };
}

interface DayMap {
  [hour: string]: ConsultaItem[];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekDays(start: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Cores dinâmicas mantidas apenas para o mapeamento visual dos médicos na agenda
const DOCTOR_COLOR_CLASSES = [
  'bg-[var(--sky-dim)] text-[var(--ink)] border-l-[3px] border-l-[var(--ink)]',
  'bg-warn-dim text-warn border-l-[3px] border-l-[var(--mmq-orange)]',
  'bg-success-dim text-[var(--success)] border-l-[3px] border-l-[var(--success)]',
  'bg-[var(--danger-dim)] text-danger border-l-[3px] border-l-[var(--danger)]',
  'bg-slate text-[var(--ink2)] border-l-[3px] border-l-[var(--ink2)]',
];

export default function ConsultationsPage() {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const medicoColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    let idx = 0;
    consultas.forEach(c => {
      if (c.medicos?.id !== undefined && !(c.medicos.id in map)) {
        map[c.medicos.id] = DOCTOR_COLOR_CLASSES[idx % DOCTOR_COLOR_CLASSES.length];
        idx++;
      }
    });
    return map;
  }, [consultas]);

  const weekDays = getWeekDays(currentWeekStart);

  const fetchWeek = async (startDate: Date) => {
    setLoading(true);
    try {
      const response = await request<ConsultaItem[]>(`/consultas/semana?data=${formatDate(startDate)}`);
      setConsultas(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Erro ao carregar consultas da semana', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek(currentWeekStart);
  }, [currentWeekStart]);

  const goToWeek = (offset: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + offset * 7);
    setCurrentWeekStart(getWeekStart(newStart));
  };

  const schedule: DayMap[] = weekDays.map(() => ({}));

  consultas.forEach(c => {
    const d = new Date(c.data_hora);
    const dayIndex = weekDays.findIndex(wd =>
      wd.getFullYear() === d.getFullYear() &&
      wd.getMonth() === d.getMonth() &&
      wd.getDate() === d.getDate()
    );
    if (dayIndex < 0) return;

    const hour = d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (!schedule[dayIndex][hour]) {
      schedule[dayIndex][hour] = [];
    }
    schedule[dayIndex][hour].push(c);
  });

  const hours = useMemo(() => {
    if (consultas.length === 0) {
      return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    }
    const slotSet = new Set<string>();
    consultas.forEach(c => {
      const d = new Date(c.data_hora);
      const h = d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false });
      slotSet.add(h);
    });
    return Array.from(slotSet).sort();
  }, [consultas]);

  return (
    <Shell>
      {/* Cabeçalho da página */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-[-0.5px]">Agenda de Consultas</h1>
          <p className="text-base font-medium text-ink-3 mt-[3px]">
            Semana de {weekDays[0]?.toLocaleDateString('pt-MZ')} a {weekDays[4]?.toLocaleDateString('pt-MZ')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => goToWeek(-1)} className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium">
            ← Semana anterior
          </button>
          <button onClick={() => goToWeek(1)} className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium">
            Semana seguinte →
          </button>
          <Link href="/admin/consultations/agendar" className="bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)] px-4 py-2 rounded-md font-medium transition shadow-[0_1px_3px_rgba(255,127,0,0.1)] hover:shadow-[0_4px_14px_rgba(255,127,0,0.25)]">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agendar Consulta
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="p-8 text-center text-muted animate-pulse">A carregar agenda da clínica...</p>
      ) : (
        <div className="card-panel overflow-hidden">
          
          {/* Barra superior da grelha */}
          <div className="grid grid-cols-[68px_repeat(5,1fr)] bg-[var(--mmq-orange)]">
            <div className="p-3 border-r border-[rgba(255,255,255,0.12)]"></div>
            {weekDays.map((day, i) => (
              <div 
                key={i} 
                className="p-3 text-[11px] font-bold uppercase tracking-[0.7px] text-white text-center border-r border-[rgba(255,255,255,0.12)] last:border-r-0"
              >
                {day.toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </div>
            ))}
          </div>

          {/* Corpo da grelha com overflow-x-auto */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-[68px_repeat(5,1fr)] border-b border-[var(--border2)] last:border-b-0">
                  {/* Coluna de Horas */}
                  <div className="p-2 text-[11px] font-bold text-muted text-right border-r border-[var(--border2)] bg-[var(--slate)] flex items-center justify-end">
                    {hour}
                  </div>
                  
                  {/* Células de Dias */}
                  {weekDays.map((_, dayIdx) => (
                    <div key={dayIdx} className="p-1.5 border-r border-[var(--border2)] min-h-[46px] last:border-r-0 bg-[var(--white)]">
                      {(schedule[dayIdx][hour] || []).map(c => {
                        const colorClass = medicoColorMap[c.medicos?.id] ?? DOCTOR_COLOR_CLASSES[0];
                        return (
                          <div
                            key={c.id}
                            className={`rounded-[6px] p-2 text-[11.5px] font-bold cursor-pointer transition hover:brightness-[1.04] hover:shadow-sm block ${colorClass}`}
                            onClick={() => router.push(`/medico/consulta/${c.id}`)}
                            title={`${c.pacientes?.users?.name ?? 'N/D'} - ${c.medicos?.users?.name ?? 'N/D'}`}
                          >
                            <span className="block truncate">{c.pacientes?.users?.name ?? 'N/D'}</span>
                            <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
                              Dr(a). {c.medicos?.users?.name ?? 'N/D'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && consultas.length === 0 && (
        <p className="text-center text-muted py-12 font-medium">
          Nenhuma consulta agendada para esta semana.
        </p>
      )}
    </Shell>
  );
}