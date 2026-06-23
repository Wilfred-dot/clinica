'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Shell from '@/app/components/Shell';
import ConfirmModal from '@/app/components/ConfirmModal';
import { request } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Medico {
  id: number;
  user_id: number;
  especialidade: string;
  numero_ordem: string;
  telefone: string;
  horario_trabalho: string;
  users: {
    name: string;
    email: string;
    ativo: boolean;
  };
  consultasMes?: number;
}

export default function MedicsPage() {
  const router = useRouter();
  const [medics, setMedics] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState('');
  
  const [filterEspecialidade, setFilterEspecialidade] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterOrder, setFilterOrder] = useState<string>('nome_asc');
  const [filterConsultas, setFilterConsultas] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ medicoId: number; userId: number; action: 'activate' | 'deactivate' } | null>(null);
  
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_LOAD = 5;
  const INITIAL_LOAD = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchMedics = () => {
    setLoading(true);
    setError('');
    request<{ data: Medico[] }>('/medicos')
      .then(res => {
        const dados = res.data ?? [];
        const comMock = dados.map(m => ({
          ...m,
          consultasMes: m.consultasMes ?? Math.floor(Math.random() * 50)
        }));
        setMedics(comMock);
        if (comMock.length <= 20) {
          setDisplayCount(comMock.length);
        } else {
          setDisplayCount(INITIAL_LOAD);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar a lista de médicos.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedics(); }, []);

  const executeAction = async () => {
    if (!confirm) return;
    const { userId, action } = confirm;
    setActionLoading(userId);
    try {
      const newState = action === 'activate';
      await request(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: newState }),
      });
      setMedics(prev =>
        prev.map(m =>
          m.user_id === userId
            ? { ...m, users: { ...m.users, ativo: newState } }
            : m
        )
      );
    } catch (err) {
      console.error('Erro ao alterar estado', err);
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterEspecialidade('todos');
    setFilterStatus('todos');
    setFilterOrder('nome_asc');
    setFilterConsultas('todos');
    setShowFilters(false);
    if (medics.length <= 20) {
      setDisplayCount(medics.length);
    } else {
      setDisplayCount(INITIAL_LOAD);
    }
  };

  const hasActiveFilters = filterEspecialidade !== 'todos' || filterStatus !== 'todos' || filterOrder !== 'nome_asc' || filterConsultas !== 'todos' || search !== '';

  const filtered = useMemo(() => {
    let result = medics;

    const cleanSearch = debouncedSearch.toLowerCase().trim();
    if (cleanSearch) {
      result = result.filter(m => 
        (m.users?.name?.toLowerCase() || '').includes(cleanSearch) ||
        (m.users?.email?.toLowerCase() || '').includes(cleanSearch) ||
        (m.especialidade?.toLowerCase() || '').includes(cleanSearch) ||
        (m.numero_ordem?.toLowerCase() || '').includes(cleanSearch)
      );
    }

    if (filterEspecialidade !== 'todos') {
      result = result.filter(m => m.especialidade === filterEspecialidade);
    }

    if (filterStatus !== 'todos') {
      const isActive = filterStatus === 'activo';
      result = result.filter(m => m.users?.ativo === isActive);
    }

    // Ordenar por consultas primeiro
    if (filterConsultas !== 'todos') {
      if (filterConsultas === 'mais') {
        result = [...result].sort((a, b) => (b.consultasMes || 0) - (a.consultasMes || 0));
      } else if (filterConsultas === 'menos') {
        result = [...result].sort((a, b) => (a.consultasMes || 0) - (b.consultasMes || 0));
      }
    }

    // Aplicar ordenação por nome DEPOIS da ordenação por consultas
    if (filterOrder === 'nome_asc') {
      if (filterConsultas !== 'todos') {
        result = [...result].sort((a, b) => {
          const consultasDiff = (b.consultasMes || 0) - (a.consultasMes || 0);
          if (consultasDiff !== 0 && filterConsultas === 'mais') return consultasDiff;
          if (consultasDiff !== 0 && filterConsultas === 'menos') return -consultasDiff;
          return (a.users?.name || '').localeCompare(b.users?.name || '');
        });
      } else {
        result = [...result].sort((a, b) => (a.users?.name || '').localeCompare(b.users?.name || ''));
      }
    } else if (filterOrder === 'nome_desc') {
      if (filterConsultas !== 'todos') {
        result = [...result].sort((a, b) => {
          const consultasDiff = (b.consultasMes || 0) - (a.consultasMes || 0);
          if (consultasDiff !== 0 && filterConsultas === 'mais') return consultasDiff;
          if (consultasDiff !== 0 && filterConsultas === 'menos') return -consultasDiff;
          return (b.users?.name || '').localeCompare(a.users?.name || '');
        });
      } else {
        result = [...result].sort((a, b) => (b.users?.name || '').localeCompare(a.users?.name || ''));
      }
    }

    return result;
  }, [medics, debouncedSearch, filterEspecialidade, filterStatus, filterOrder, filterConsultas]);

  useEffect(() => {
    if (filtered.length <= 20) {
      setDisplayCount(filtered.length);
    } else {
      setDisplayCount(INITIAL_LOAD);
    }
  }, [filtered.length]);

  const displayedMedics = useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_LOAD, filtered.length));
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filtered.length]);

  const especialidades = [
    { value: 'todos', label: 'Todas as especialidades' },
    { value: 'Oftalmologia Geral', label: 'Oftalmologia Geral' },
    { value: 'Catarata', label: 'Catarata' },
    { value: 'Glaucoma', label: 'Glaucoma' },
    { value: 'Retina', label: 'Retina' },
    { value: 'Córnea', label: 'Córnea' },
    { value: 'Plástica Ocular', label: 'Plástica Ocular' },
  ];

  const statuses = [
    { value: 'todos', label: 'Todos os estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  const orders = [
    { value: 'nome_asc', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
  ];

  const consultasFiltro = [
    { value: 'todos', label: 'Todas as consultas' },
    { value: 'mais', label: 'Mais consultas' },
    { value: 'menos', label: 'Menos consultas' },
  ];

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Lista de Médicos</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium">Todos os médicos do corpo clínico</p>
          <p className="text-[13px] text-[var(--mmq-orange)] mt-1 font-medium">
            Mostrando {filtered.length} de {medics.length} médicos
          </p>
        </div>
        <Link href="/admin/medics/novo" className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo médico
        </Link>
      </div>

      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      )}

      <div className="bg-[var(--white)] border border-[var(--border2)] rounded-[12px] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden mt-5">
        <div className="p-5 border-b border-[var(--border2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Pesquisar médico por nome, especialidade ou registo..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 h-10 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  showFilters || hasActiveFilters
                    ? 'bg-[var(--mmq-orange)] text-white border-[var(--mmq-orange)] shadow-sm'
                    : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-white text-[var(--mmq-orange)] rounded-full">
                    {filtered.length}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 h-10 text-sm font-medium rounded-lg bg-[var(--mmq-orange)] text-white border border-[var(--mmq-orange)] hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-[var(--slate)] rounded-lg border border-[var(--border2)] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--ink)]">Filtros Avançados</h4>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-ink-3 hover:text-[var(--ink)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Especialidade</label>
                  <select
                    value={filterEspecialidade}
                    onChange={e => setFilterEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {especialidades.map(esp => (
                      <option key={esp.value} value={esp.value}>{esp.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Consultas</label>
                  <select
                    value={filterConsultas}
                    onChange={e => setFilterConsultas(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {consultasFiltro.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Ordenar por nome</label>
                  <select
                    value={filterOrder}
                    onChange={e => setFilterOrder(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {orders.map(order => (
                      <option key={order.value} value={order.value}>{order.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border2)]">
                <button
                  onClick={clearFilters}
                  className={`w-full sm:w-auto px-4 py-2 h-10 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    hasActiveFilters
                      ? 'bg-[var(--mmq-orange)] text-white border-[var(--mmq-orange)] hover:bg-[var(--mmq-orange-lt)] shadow-sm'
                      : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:bg-[var(--slate)]'
                  }`}
                >
                  Limpar todos
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-[var(--mmq-orange)] text-white rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                >
                  Aplicar filtros
                </button>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border2)]">
                  <span className="text-xs font-medium text-ink-3">Filtros ativos:</span>
                  {filterEspecialidade !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {especialidades.find(e => e.value === filterEspecialidade)?.label}
                      <button onClick={() => setFilterEspecialidade('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterStatus !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {statuses.find(s => s.value === filterStatus)?.label}
                      <button onClick={() => setFilterStatus('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterConsultas !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {consultasFiltro.find(c => c.value === filterConsultas)?.label}
                      <button onClick={() => setFilterConsultas('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterOrder !== 'nome_asc' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {orders.find(o => o.value === filterOrder)?.label}
                      <button onClick={() => setFilterOrder('nome_asc')} className="hover:text-danger">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <p className="p-6 text-center text-ink-3 animate-pulse">A carregar médicos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)] sticky top-0 z-10">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Nome</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Especialidade</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Contacto</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Consultas (Mês)</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3">Estado</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {displayedMedics.map((medico, index) => {
                  const isActive = medico.users?.ativo ?? false;
                  
                  return (
                    <tr 
                      key={medico.id} 
                      className="hover:bg-[var(--slate)] transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/medics/${medico.id}/editar`)}
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${Math.min(index * 0.03, 0.3)}s both`
                      }}
                    >
                      <td className="p-4 pl-5 text-sm font-bold text-[var(--ink)]">{medico.users?.name ?? '—'}</td>
                      <td className="p-4 text-sm font-medium text-ink-3">{medico.especialidade}</td>
                      <td className="p-4 text-sm font-medium text-ink-3">{medico.telefone || '—'}</td>
                      <td className="p-4 text-sm font-semibold text-[var(--ink)]">{medico.consultasMes ?? 0}</td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold ${
                          isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></span>
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirm({ medicoId: medico.id, userId: medico.user_id, action: isActive ? 'deactivate' : 'activate' });
                            }}
                            disabled={actionLoading === medico.user_id}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-colors min-w-[80px] justify-center ${
                              isActive 
                                ? 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)]'
                            }`}
                          >
                            {actionLoading === medico.user_id ? '...' : isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <Link 
                            href={`/admin/medics/${medico.id}/editar`} 
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-md border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] transition-colors min-w-[70px] justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-sm font-medium text-ink-3">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="h-10 w-10 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 9v3a3 3 0 005.196 3H15a3 3 0 005.196-3V9"/>
                          <path d="M9 9h.01"/>
                          <path d="M15 15h.01"/>
                          <path d="M9 22h6"/>
                          <path d="M12 2v4.01"/>
                        </svg>
                        <p>Nenhum médico encontrado com os filtros aplicados.</p>
                        <button
                          onClick={clearFilters}
                          className="text-xs font-medium text-[var(--mmq-orange)] hover:underline"
                        >
                          Limpar filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="py-6 text-center transition-all duration-500"
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--mmq-orange)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-ink-3">A carregar mais médicos...</span>
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

            {!hasMore && filtered.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-xs text-ink-3">
                  ✓ Todos os {filtered.length} médicos carregados
                </p>
              </div>
            )}
          </div>
        )}
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

      {/* Modal de confirmação - centralizado */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--white)] rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-[var(--border2)]">
            <div className="flex flex-col items-center mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                confirm.action === 'deactivate' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[var(--mmq-orange-dim)]'
              }`}>
                <svg className={`w-7 h-7 ${
                  confirm.action === 'deactivate' ? 'text-red-600 dark:text-red-400' : 'text-[var(--mmq-orange)]'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)] mt-3">
                {confirm.action === 'deactivate' ? 'Desactivar médico' : 'Activar médico'}
              </h3>
            </div>
            
            <p className="text-sm text-ink-3 mb-6 text-center">
              {confirm.action === 'deactivate' 
                ? 'Tem a certeza de que pretende desactivar este médico?' 
                : 'Tem a certeza de que pretende activar este médico?'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading === confirm?.userId}
                className={`w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 min-w-[100px] justify-center ${
                  confirm.action === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                    : 'bg-[var(--mmq-orange)] hover:bg-[var(--mmq-orange-lt)]'
                }`}
              >
                {actionLoading === confirm?.userId ? '...' : confirm.action === 'deactivate' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}