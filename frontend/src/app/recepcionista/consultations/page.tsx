'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
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
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// Cores dinâmicas para os médicos na agenda
const DOCTOR_COLOR_CLASSES = [
  'bg-[var(--sky-dim)] text-[var(--ink)] border-l-[3px] border-l-[var(--ink)]',
  'bg-[var(--warn-dim)] text-[var(--warn)] border-l-[3px] border-l-[var(--mmq-orange)]',
  'bg-[var(--success-dim)] text-[var(--success)] border-l-[3px] border-l-[var(--success)]',
  'bg-[var(--danger-dim)] text-[var(--danger)] border-l-[3px] border-l-[var(--danger)]',
  'bg-[var(--slate)] text-[var(--ink3)] border-l-[3px] border-l-[var(--ink3)]',
];

export default function ReceptionConsultationsPage() {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [consultas, setConsultas] = useState<ConsultaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMedico, setFilterMedico] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  
  // Infinite scroll states
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_LOAD = 5;
  const INITIAL_LOAD = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

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
      const dados = Array.isArray(response) ? response : [];
      setConsultas(dados);
      if (dados.length <= 20) {
        setDisplayCount(dados.length);
      } else {
        setDisplayCount(INITIAL_LOAD);
      }
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

  // Filtrar consultas
  const filteredConsultas = useMemo(() => {
    let result = consultas;

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase().trim();
      result = result.filter(c =>
        (c.pacientes?.users?.name?.toLowerCase() || '').includes(term) ||
        (c.medicos?.users?.name?.toLowerCase() || '').includes(term)
      );
    }

    if (filterMedico !== 'todos') {
      result = result.filter(c => c.medicos?.users?.name === filterMedico);
    }

    if (filterStatus !== 'todos') {
      result = result.filter(c => c.status === filterStatus);
    }

    return result;
  }, [consultas, debouncedSearch, filterMedico, filterStatus]);

  // Reset display count when filters change
  useEffect(() => {
    if (filteredConsultas.length <= 20) {
      setDisplayCount(filteredConsultas.length);
    } else {
      setDisplayCount(INITIAL_LOAD);
    }
  }, [filteredConsultas.length]);

  // Displayed consultations with pagination
  const displayedConsultas = useMemo(() => {
    return filteredConsultas.slice(0, displayCount);
  }, [filteredConsultas, displayCount]);

  const hasMore = displayCount < filteredConsultas.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredConsultas.length));
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredConsultas.length]);

  const schedule: DayMap[] = weekDays.map(() => ({}));

  filteredConsultas.forEach(c => {
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

  // Horas de 00:00 a 23:00
  const hours = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = h.toString().padStart(2, '0') + ':00';
      slots.push(hourStr);
    }
    return slots;
  }, []);

  // Calcular semana do ano
  const getWeekNumber = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const weekNumber = getWeekNumber(currentWeekStart);
  const totalWeeks = 52;

  // Formatar data para exibição
  const formatWeekRange = () => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    const end = weekDays[6].toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Estatísticas da semana
  const weekStats = useMemo(() => {
    const total = filteredConsultas.length;
    const porDia = weekDays.map((_, idx) => {
      return Object.values(schedule[idx] || {}).reduce((acc, curr) => acc + curr.length, 0);
    });
    const porMedico: Record<string, number> = {};
    filteredConsultas.forEach(c => {
      const nome = c.medicos?.users?.name || 'N/D';
      porMedico[nome] = (porMedico[nome] || 0) + 1;
    });
    return { total, porDia, porMedico };
  }, [filteredConsultas, schedule, weekDays]);

  // Lista de médicos únicos para o filtro
  const medicosUnicos = useMemo(() => {
    const nomes = consultas.map(c => c.medicos?.users?.name).filter(Boolean);
    return [...new Set(nomes)].sort();
  }, [consultas]);

  const statusOptions = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'agendada', label: 'Agendada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'realizada', label: 'Realizada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  return (
    <Shell>
      {/* Cabeçalho da página - lado esquerdo */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Agenda de Consultas</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
            Agendamento semanal de consultas
          </p>
          <p className="text-[13px] font-bold text-[var(--mmq-orange)] mt-0.5">
            {weekStats.total} consulta(s) agendada(s) essa semana
          </p>
        </div>
        <Link
          href="/recepcionista/consultations/agendar"
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agendar
        </Link>
      </div>

      {/* Navegação da semana - com Anterior/Próxima nas pontas e Semana no centro */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => goToWeek(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 h-10 text-sm font-medium rounded-lg border border-[var(--border)] text-ink-3 hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)] transition-all duration-200 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-bold text-[var(--mmq-orange)]">Semana {weekNumber} de {totalWeeks} semanas</p>
          <p className="text-sm font-medium text-[var(--ink)]">{formatWeekRange()}</p>
        </div>

        <button
          onClick={() => goToWeek(1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 h-10 text-sm font-medium rounded-lg border border-[var(--border)] text-ink-3 hover:bg-[var(--slate)] hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)] transition-all duration-200 flex-shrink-0"
        >
          Próxima
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendário da agenda */}
      <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Barra superior da grelha - Sem cor no primeiro bloco */}
            <div className="grid grid-cols-[68px_repeat(7,1fr)]">
              <div className="p-3 bg-[var(--slate)] border-r border-[var(--border2)]"></div>
              {weekDays.map((day, i) => {
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
                const isWeekday = i >= 1 && i <= 5;
                return (
                  <div
                    key={i}
                    className={`p-3 text-[13px] font-bold uppercase tracking-[0.7px] text-center border-r border-[rgba(255,255,255,0.12)] last:border-r-0 ${
                      isWeekday
                        ? 'bg-[var(--mmq-orange)] text-white'
                        : 'bg-[var(--slate)] text-ink-3'
                    }`}
                  >
                    {dayNames[i]}
                    <br />
                    <span className={`text-[11px] font-normal ${isWeekday ? 'text-white/80' : 'text-ink-3/60'}`}>
                      {day.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Corpo da grelha */}
            <div className="max-h-[500px] overflow-y-auto">
              {hours.map(hour => {
                const hourNum = parseInt(hour.split(':')[0]);
                const isBusinessHour = hourNum >= 6 && hourNum <= 18;
                return (
                  <div key={hour} className="grid grid-cols-[68px_repeat(7,1fr)] border-b border-[var(--border2)] last:border-b-0">
                    {/* Coluna de Horas - bloco laranja para 6-18 */}
                    <div className={`p-2 text-[11px] font-bold text-right border-r border-[var(--border2)] flex items-center justify-end sticky left-0 z-10 ${
                      isBusinessHour ? 'bg-[var(--mmq-orange)] text-white' : 'bg-[var(--slate)] text-ink-3'
                    }`}>
                      {hour}
                    </div>

                    {/* Células de Dias */}
                    {weekDays.map((_, dayIdx) => {
                      const isWeekday = dayIdx >= 1 && dayIdx <= 5;
                      return (
                        <div
                          key={dayIdx}
                          className={`p-1 border-r border-[var(--border2)] min-h-[52px] last:border-r-0 ${
                            isWeekday ? 'bg-[var(--white)]' : 'bg-[var(--slate)]/30'
                          }`}
                        >
                          {(schedule[dayIdx][hour] || []).map(c => {
                            const colorClass = medicoColorMap[c.medicos?.id] ?? DOCTOR_COLOR_CLASSES[0];
                            return (
                              <div
                                key={c.id}
                                className={`rounded-[6px] p-1.5 text-[11px] font-bold cursor-pointer transition hover:brightness-[1.04] hover:shadow-sm block ${colorClass}`}
                                onClick={() => router.push(`/recepcionista/consultations/${c.id}`)}
                                title={`${c.pacientes?.users?.name ?? 'N/D'} - ${c.medicos?.users?.name ?? 'N/D'}`}
                              >
                                <span className="block truncate text-[10px]">{c.pacientes?.users?.name ?? 'N/D'}</span>
                                <div className="text-[9px] font-medium opacity-80 mt-0.5 truncate">
                                  Dr(a). {c.medicos?.users?.name ?? 'N/D'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé laranja com total */}
        <div className="px-5 py-3 bg-[var(--mmq-orange)] flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-bold text-white">
            Total: <span className="text-white">{weekStats.total}</span> consulta(s) essa semana
          </span>
          <div className="flex items-center gap-4 text-sm font-semibold text-white">
            <span>Seg: {weekStats.porDia[1] || 0}</span>
            <span>Ter: {weekStats.porDia[2] || 0}</span>
            <span>Qua: {weekStats.porDia[3] || 0}</span>
            <span>Qui: {weekStats.porDia[4] || 0}</span>
            <span>Sex: {weekStats.porDia[5] || 0}</span>
          </div>
        </div>
      </div>

      {/* Lista de Consultas - com cabeçalho em linha: título à esquerda, contador à direita */}
      <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        {/* Cabeçalho da lista - em linha */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border2)] flex-wrap">
          <h2 className="text-[15px] font-bold text-[var(--ink)] whitespace-nowrap">Lista de Consultas</h2>
          <p className="text-[13px] text-[var(--mmq-orange)] font-medium whitespace-nowrap">
            Mostrando {filteredConsultas.length} de {consultas.length} consulta(s)
          </p>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="p-4 border-b border-[var(--border2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar por paciente ou médico..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 h-10 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  showFilters || filterMedico !== 'todos' || filterStatus !== 'todos'
                    ? 'bg-[var(--mmq-orange)] text-white border-[var(--mmq-orange)] shadow-sm'
                    : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
                {(filterMedico !== 'todos' || filterStatus !== 'todos') && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-white text-[var(--mmq-orange)] rounded-full">
                    {(filterMedico !== 'todos' ? 1 : 0) + (filterStatus !== 'todos' ? 1 : 0)}
                  </span>
                )}
              </button>
              {(filterMedico !== 'todos' || filterStatus !== 'todos' || search) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterMedico('todos');
                    setFilterStatus('todos');
                  }}
                  className="inline-flex items-center px-4 py-2 h-10 text-sm font-medium rounded-lg bg-[var(--mmq-orange)] text-white border border-[var(--mmq-orange)] hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-[var(--slate)] rounded-lg border border-[var(--border2)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Médico</label>
                  <select
                    value={filterMedico}
                    onChange={e => setFilterMedico(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    <option value="todos">Todos os médicos</option>
                    {medicosUnicos.map(nome => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de consultas com infinite scroll */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border2)] bg-[var(--slate)] sticky top-0 z-10">
                <th className="p-3 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[8%]">#</th>
                <th className="p-3 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[22%]">Paciente</th>
                <th className="p-3 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[22%]">Médico</th>
                <th className="p-3 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[18%]">Data</th>
                <th className="p-3 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[12%]">Hora</th>
                <th className="p-3 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[18%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border2)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[var(--mmq-orange)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-ink-3">A carregar consultas...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedConsultas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <svg className="h-10 w-10 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <p className="text-sm font-medium text-ink-3">Nenhuma consulta agendada para esta semana</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedConsultas.map((c, index) => {
                  const d = new Date(c.data_hora);
                  const statusColors: Record<string, string> = {
                    agendada: 'bg-[var(--sky-dim)] text-[var(--sky)]',
                    confirmada: 'bg-[var(--success-dim)] text-[var(--success)]',
                    realizada: 'bg-[var(--slate)] text-[var(--ink3)]',
                    cancelada: 'bg-[var(--danger-dim)] text-[var(--danger)]',
                  };
                  const statusColor = statusColors[c.status] || 'bg-[var(--slate)] text-[var(--ink3)]';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--slate)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/recepcionista/consultations/${c.id}`)}
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${Math.min(index * 0.03, 0.3)}s both`
                      }}
                    >
                      <td className="p-3 pl-5 text-sm font-bold text-[var(--mmq-orange)]">{index + 1}</td>
                      <td className="p-3 text-sm font-semibold text-[var(--ink)]">{c.pacientes?.users?.name || 'N/D'}</td>
                      <td className="p-3 text-sm font-medium text-ink-3">Dr(a). {c.medicos?.users?.name || 'N/D'}</td>
                      <td className="p-3 text-sm font-medium text-ink-3">
                        {d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-sm font-medium text-ink-3">
                        {d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </td>
                      <td className="p-3 pr-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColor}`}>
                          {c.status || 'N/D'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Infinite scroll trigger */}
          {!loading && hasMore && (
            <div 
              ref={loadMoreRef}
              className="py-4 text-center transition-all duration-500 border-t border-[var(--border2)]"
            >
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-[var(--mmq-orange)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-ink-3">A carregar mais consultas...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-ink-3 animate-pulse">
                  <span>Role para baixo para carregar mais</span>
                  <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {!loading && !hasMore && filteredConsultas.length > 0 && (
            <div className="py-3 text-center border-t border-[var(--border2)]">
              <p className="text-xs text-ink-3 font-medium">
                — Fim da lista —
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Shell>
  );
}