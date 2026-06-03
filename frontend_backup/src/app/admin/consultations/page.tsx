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
  'bg-[#e6f0fb] text-[#102A6B] border-l-[3px] border-l-[#102A6B]',
  'bg-[#fef8ec] text-[#b87a00] border-l-[3px] border-l-[#FF7F00]',
  'bg-[#edf7f2] text-[#1a7a4a] border-l-[3px] border-l-[#1a7a4a]',
  'bg-[#fdf0f0] text-[#b83232] border-l-[3px] border-l-[#b83232]',
  'bg-[#f1f5f9] text-[#475569] border-l-[3px] border-l-[#475569]',
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
      {/* Cabeçalho da página limpo usando as classes globais .ph e .sub */}
      <div className="ph">
        <div>
          <h1>Agenda de Consultas</h1>
          <p className="sub">
            Semana de {weekDays[0]?.toLocaleDateString('pt-MZ')} a {weekDays[4]?.toLocaleDateString('pt-MZ')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => goToWeek(-1)} className="btn btn-outline">
            ← Semana anterior
          </button>
          <button onClick={() => goToWeek(1)} className="btn btn-outline">
            Semana seguinte →
          </button>
          <Link href="/admin/consultations/agendar" className="btn btn-primary">
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
        /* Content Card herdando as propriedades do global.css */
        <div className="card-panel overflow-hidden">
          
          {/* Barra superior da grelha (Mudada para bg-[#FF7F00] - Laranja da marca) */}
          <div className="grid grid-cols-[68px_repeat(5,1fr)] bg-[#FF7F00]">
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

          {/* Corpo estruturado da Grelha */}
          <div>
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[68px_repeat(5,1fr)] border-b border-[#ecf1f6] last:border-b-0">
                {/* Coluna de Horas */}
                <div className="p-2 text-[11px] font-bold text-muted text-right border-r border-[#ecf1f6] bg-[#f8fafc] flex items-center justify-end">
                  {hour}
                </div>
                
                {/* Células de Dias */}
                {weekDays.map((_, dayIdx) => (
                  <div key={dayIdx} className="p-1.5 border-r border-[#ecf1f6] min-h-[46px] last:border-r-0 bg-white">
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
      )}

      {!loading && consultas.length === 0 && (
        <p className="text-center text-muted py-12 font-medium">
          Nenhuma consulta agendada para esta semana.
        </p>
      )}
    </Shell>
  );
}