'use client';

import { useEffect, useState, useMemo } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
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

const DOCTOR_COLOR_CLASSES = [
  'bg-warn-dim text-mmq-orange border-l-[3px] border-l-[#FF7F00]',
  'bg-[#e6f0fb] text-[#1258a8] border-l-[3px] border-l-[#1258a8]',
  'bg-warn-dim text-warn border-l-[3px] border-l-[#b87a00]',
  'bg-success-dim text-[#1a7a4a] border-l-[3px] border-l-[#1a7a4a]',
  'bg-[#fdf0f0] text-danger border-l-[3px] border-l-[#b83232]',
];

export default function ReceptionConsultationsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const weekDays = getWeekDays(currentWeekStart);

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

  const fetchWeek = async (startDate: Date) => {
    setLoading(true);
    try {
      const response = await request<ConsultaItem[]>(`/consultas/semana?data=${formatDate(startDate)}`);
      setConsultas(Array.isArray(response) ? response : []);
    } catch (err) { console.error('Erro ao carregar consultas da semana', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeek(currentWeekStart); }, [currentWeekStart]);

  const router = useRouter();

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
          <h1 className="text-[22px] font-bold text-[#102A6B] tracking-[-0.3px]">Consultas</h1>
          <p className="text-[13px] text-ink-3 mt-1">
            Semana de {weekDays[0]?.toLocaleDateString('pt-MZ')} a {weekDays[4]?.toLocaleDateString('pt-MZ')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="inline-flex items-center justify-center rounded-[8px] border border-[#d6e0ea] bg-white px-4 h-10 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate hover:border-ink-4"
            onClick={() => goToWeek(-1)}
          >
            ← Semana anterior
          </button>
          <button
            className="inline-flex items-center justify-center rounded-[8px] border border-[#d6e0ea] bg-white px-4 h-10 text-[13.5px] font-semibold text-ink-2 transition hover:bg-slate hover:border-ink-4"
            onClick={() => goToWeek(1)}
          >
            Semana seguinte →
          </button>
          <Link
            href="/recepcionista/consultations/agendar"
            className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-mmq-orange px-5 h-10 text-[13.5px] font-semibold text-white transition hover:bg-mmq-orange-hover"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agendar consulta
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-ink-4 py-10">A carregar agenda...</p>
      ) : (
        <div className="bg-white border border-[#ecf1f6] rounded-[12px] shadow-[0_1px_3px_rgba(12,26,39,0.05)] overflow-hidden">
          {/* Cabeçalho da grelha */}
          <div className="grid grid-cols-[68px_repeat(5,1fr)] bg-[#102A6B]">
            <div className="p-[11px_10px] text-[11px] font-bold uppercase tracking-[0.6px] text-[rgba(255,255,255,0.55)] text-center border-r border-[rgba(255,255,255,0.07)] last:border-r-0"></div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-[11px_10px] text-[11px] font-bold uppercase tracking-[0.6px] text-[rgba(255,255,255,0.55)] text-center border-r border-[rgba(255,255,255,0.07)] last:border-r-0">
                {day.toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </div>
            ))}
          </div>

          {/* Corpo da grelha */}
          <div>
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[68px_repeat(5,1fr)] border-b border-[#ecf1f6] last:border-b-0">
                <div className="p-[8px_10px] text-[11px] font-semibold text-ink-4 text-right border-r border-[#ecf1f6] bg-slate flex items-center justify-end">
                  {hour}
                </div>
                {weekDays.map((_, dayIdx) => (
                  <div key={dayIdx} className="p-[5px_7px] border-r border-[#ecf1f6] min-h-[42px] last:border-r-0">
                    {(schedule[dayIdx][hour] || []).map(c => {
                      const colorClass = medicoColorMap[c.medicos?.id] ?? DOCTOR_COLOR_CLASSES[0];
                      return (
                        <div key={c.id}>
                          <div
                            className={`rounded-[5px] p-[5px_8px] text-[11px] font-semibold cursor-pointer transition hover:brightness-[1.07] hover:translate-y-[-1px] ${colorClass}`}
                            onClick={() => router.push(`/medico/consulta/${c.id}`)}
                            title={`${c.pacientes?.users?.name ?? 'N/D'} - ${c.medicos?.users?.name ?? 'N/D'}`}
                          >
                            {c.pacientes?.users?.name ?? 'N/D'}
                            <div className="text-[10px] font-normal opacity-70 mt-[1px]">
                              {c.medicos?.users?.name ?? 'N/D'}
                            </div>
                          </div>
                          {c.status === 'agendada' && (
                            <button
                              className="mt-1 text-[10px] px-[6px] py-[2px] rounded bg-[#fdf0f0] text-danger border border-[#f0c4c4] transition hover:bg-[#fdf0f0]"
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

      {!loading && consultas.length === 0 && (
        <p className="text-center text-ink-4 py-10">Nenhuma consulta agendada para esta semana.</p>
      )}

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