'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Notificacao {
  id: number;
  mensagem: string;
  tipo_variavel: string;
  data_envio: string;
  paciente: string;
}

// Mapeamento dos tipos de notificação para badges coloridas
const tipoBadge: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  lembrete_consulta: { bg: 'bg-[var(--warn-dim)]', text: 'text-[var(--warn)]', dot: 'bg-[var(--warn)]', label: 'Lembrete' },
  confirmacao:       { bg: 'bg-[var(--success-dim)]', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]', label: 'Confirmação' },
  alerta:            { bg: 'bg-[var(--danger-dim)]', text: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]', label: 'Alerta' },
  resultado_exame:   { bg: 'bg-[var(--sky-dim)]', text: 'text-[var(--sky)]', dot: 'bg-[var(--sky)]', label: 'Resultado' },
};

export default function ReceptionNotificationsPage() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState('');
  
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterPaciente, setFilterPaciente] = useState<string>('todos');
  const [filterOrder, setFilterOrder] = useState<string>('data_desc');
  const [filterMensagem, setFilterMensagem] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_LOAD = 5;
  const INITIAL_LOAD = 10;

  // Modal state
  const [modalNotificacao, setModalNotificacao] = useState<Notificacao | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchNotificacoes = () => {
    setLoading(true);
    setError('');
    request<Notificacao[]>('/notificacoes')
      .then(data => {
        const dados = data ?? [];
        setNotificacoes(dados);
        if (dados.length <= 20) {
          setDisplayCount(dados.length);
        } else {
          setDisplayCount(INITIAL_LOAD);
        }
      })
      .catch(() => setError('Não foi possível carregar as notificações'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotificacoes(); }, []);

  const clearFilters = () => {
    setSearch('');
    setFilterTipo('todos');
    setFilterPaciente('todos');
    setFilterOrder('data_desc');
    setFilterMensagem('todos');
    setShowFilters(false);
    if (notificacoes.length <= 20) {
      setDisplayCount(notificacoes.length);
    } else {
      setDisplayCount(INITIAL_LOAD);
    }
  };

  const hasActiveFilters = filterTipo !== 'todos' || filterPaciente !== 'todos' || filterOrder !== 'data_desc' || filterMensagem !== 'todos' || search !== '';

  // Extrair lista única de pacientes para o filtro
  const pacientesUnicos = useMemo(() => {
    const nomes = notificacoes.map(n => n.paciente).filter(Boolean);
    return [...new Set(nomes)].sort();
  }, [notificacoes]);

  const filtered = useMemo(() => {
    let result = notificacoes;

    const cleanSearch = debouncedSearch.toLowerCase().trim();
    if (cleanSearch) {
      result = result.filter(n => 
        (n.paciente?.toLowerCase() || '').includes(cleanSearch) ||
        (n.mensagem?.toLowerCase() || '').includes(cleanSearch) ||
        (n.tipo_variavel?.toLowerCase() || '').includes(cleanSearch)
      );
    }

    if (filterTipo !== 'todos') {
      result = result.filter(n => n.tipo_variavel === filterTipo);
    }

    if (filterPaciente !== 'todos') {
      result = result.filter(n => n.paciente === filterPaciente);
    }

    if (filterMensagem !== 'todos') {
      const searchTerm = filterMensagem.toLowerCase().trim();
      result = result.filter(n => n.mensagem?.toLowerCase().includes(searchTerm));
    }

    // Ordenação
    if (filterOrder === 'data_asc') {
      result = [...result].sort((a, b) => new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime());
    } else if (filterOrder === 'data_desc') {
      result = [...result].sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime());
    } else if (filterOrder === 'paciente_asc') {
      result = [...result].sort((a, b) => (a.paciente || '').localeCompare(b.paciente || ''));
    } else if (filterOrder === 'paciente_desc') {
      result = [...result].sort((a, b) => (b.paciente || '').localeCompare(a.paciente || ''));
    }

    return result;
  }, [notificacoes, debouncedSearch, filterTipo, filterPaciente, filterOrder, filterMensagem]);

  useEffect(() => {
    if (filtered.length <= 20) {
      setDisplayCount(filtered.length);
    } else {
      setDisplayCount(INITIAL_LOAD);
    }
  }, [filtered.length]);

  const displayedNotificacoes = useMemo(() => {
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

  const tipos = [
    { value: 'todos', label: 'Todos os tipos' },
    { value: 'lembrete_consulta', label: 'Lembrete' },
    { value: 'confirmacao', label: 'Confirmação' },
    { value: 'alerta', label: 'Alerta' },
    { value: 'resultado_exame', label: 'Resultado' },
  ];

  const orders = [
    { value: 'data_desc', label: 'Data (mais recente)' },
    { value: 'data_asc', label: 'Data (mais antiga)' },
    { value: 'paciente_asc', label: 'Paciente (A-Z)' },
    { value: 'paciente_desc', label: 'Paciente (Z-A)' },
  ];

  const pacientesOptions = [
    { value: 'todos', label: 'Todos os pacientes' },
    ...pacientesUnicos.map(p => ({ value: p, label: p })),
  ];

  return (
    <Shell>
      {/* Cabeçalho da página - padronizado */}
      <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-[-0.5px]">Lista de Notificações</h1>
          <p className="text-[13px] text-ink-3 mt-0.5 font-medium uppercase tracking-[0.2px]">
            Todas as notificações enviadas pelo sistema
          </p>
          <p className="text-[13px] text-[var(--mmq-orange)] mt-1 font-medium">
            Mostrando {filtered.length} de {notificacoes.length} notificações
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 justify-center rounded-[8px] bg-[var(--mmq-orange)] px-4 h-10 text-[13.5px] font-bold text-white transition hover:bg-[var(--mmq-orange-lt)] shadow-sm"
          onClick={() => router.push('/recepcionista/notifications/novo')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova notificação
        </button>
      </div>

      {/* Erro geral */}
      {error && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          {error}
        </div>
      )}

      {/* Card com tabela */}
      <div className="bg-[var(--white)] rounded-[12px] border border-[var(--border2)] shadow-[0_2px_4px_rgba(16,42,107,.03)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Pesquisar notificação por paciente, tipo ou mensagem..." 
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
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Tipo</label>
                  <select
                    value={filterTipo}
                    onChange={e => setFilterTipo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {tipos.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Paciente</label>
                  <select
                    value={filterPaciente}
                    onChange={e => setFilterPaciente(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {pacientesOptions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Ordenar por</label>
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

                <div>
                  <label className="block text-xs font-semibold text-ink-3 mb-1.5">Mensagem</label>
                  <input
                    type="text"
                    placeholder="Filtrar por palavra na mensagem..."
                    value={filterMensagem === 'todos' ? '' : filterMensagem}
                    onChange={e => setFilterMensagem(e.target.value || 'todos')}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
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
                  {filterTipo !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {tipos.find(t => t.value === filterTipo)?.label}
                      <button onClick={() => setFilterTipo('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterPaciente !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {filterPaciente}
                      <button onClick={() => setFilterPaciente('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterOrder !== 'data_desc' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      {orders.find(o => o.value === filterOrder)?.label}
                      <button onClick={() => setFilterOrder('data_desc')} className="hover:text-danger">×</button>
                    </span>
                  )}
                  {filterMensagem !== 'todos' && filterMensagem !== '' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] rounded-full">
                      "{filterMensagem}"
                      <button onClick={() => setFilterMensagem('todos')} className="hover:text-danger">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm font-medium text-ink-3 animate-pulse">A carregar notificações...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[var(--border2)] bg-[var(--slate)] sticky top-0 z-10">
                  <th className="p-3.5 pl-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[20%]">Paciente</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[14%]">Tipo</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[18%] whitespace-nowrap">Data</th>
                  <th className="p-3.5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 w-[33%]">Mensagem</th>
                  <th className="p-3.5 pr-5 text-[11px] font-bold uppercase tracking-[0.6px] text-ink-3 text-right w-[15%]">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border2)]">
                {displayedNotificacoes.map((notificacao, index) => {
                  const badge = tipoBadge[notificacao.tipo_variavel] || { 
                    bg: 'bg-[var(--slate2)]', 
                    text: 'text-[var(--ink3)]', 
                    dot: 'bg-[var(--ink4)]', 
                    label: notificacao.tipo_variavel 
                  };
                  
                  return (
                    <tr 
                      key={notificacao.id} 
                      className="hover:bg-[var(--slate)] transition-colors"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${Math.min(index * 0.03, 0.3)}s both`
                      }}
                    >
                      <td className="p-4 pl-5 text-sm font-semibold text-[var(--ink)] truncate">
                        {notificacao.paciente}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold whitespace-nowrap ${badge.bg} ${badge.text}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-ink-3 whitespace-nowrap">
                        {new Date(notificacao.data_envio).toLocaleString('pt-MZ')}
                      </td>
                      <td className="p-4 text-sm font-medium text-ink-3 truncate max-w-xs">
                        {notificacao.mensagem}
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <button
                          onClick={() => setModalNotificacao(notificacao)}
                          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md border border-[var(--mmq-orange)] text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)] hover:text-white transition-colors min-w-[60px] justify-center"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-sm font-medium text-ink-3">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="h-10 w-10 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 9v3a3 3 0 005.196 3H15a3 3 0 005.196-3V9"/>
                          <path d="M9 9h.01"/>
                          <path d="M15 15h.01"/>
                          <path d="M9 22h6"/>
                          <path d="M12 2v4.01"/>
                        </svg>
                        <p>Nenhuma notificação encontrada com os filtros aplicados.</p>
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
                    <span className="text-sm text-ink-3">A carregar mais notificações...</span>
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
              <div className="py-4 text-center border-t border-[var(--border2)]">
                <p className="text-xs text-ink-3 font-medium">
                  — Fim da lista —
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para ver mensagem completa - centralizado */}
      {modalNotificacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--white)] rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4 border border-[var(--border2)]">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-[var(--ink)] mb-6">Mensagem</h3>

              <div className="w-full p-4 bg-[var(--slate)] rounded-lg border border-[var(--border2)] min-h-[100px]">
                <p className="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap break-words text-center">
                  {modalNotificacao.mensagem}
                </p>
              </div>

              <button
                onClick={() => setModalNotificacao(null)}
                className="mt-6 px-6 py-2 text-sm font-semibold bg-[var(--mmq-orange)] text-white rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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