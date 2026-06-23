'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

interface EspecialidadeExistente {
  id: number;
  nome: string;
}

const diasDaSemana = [
  { id: 'segunda', nome: 'Segunda-feira', abreviado: 'Seg' },
  { id: 'terca', nome: 'Terça-feira', abreviado: 'Ter' },
  { id: 'quarta', nome: 'Quarta-feira', abreviado: 'Qua' },
  { id: 'quinta', nome: 'Quinta-feira', abreviado: 'Qui' },
  { id: 'sexta', nome: 'Sexta-feira', abreviado: 'Sex' },
  { id: 'sabado', nome: 'Sábado', abreviado: 'Sáb' },
  { id: 'domingo', nome: 'Domingo', abreviado: 'Dom' }
];

export default function NewMedicPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  
  // Etapa 1 - Nome
  const [name, setName] = useState('');
  
  // Etapa 2 - Especialidade
  const [especialidade, setEspecialidade] = useState('');
  const [especialidadesExistentes, setEspecialidadesExistentes] = useState<EspecialidadeExistente[]>([]);
  const [showEspecialidades, setShowEspecialidades] = useState(false);
  
  // Etapa 3 - Telefone
  const [telefone, setTelefone] = useState('');
  
  // Etapa 4 - Horários (apenas para exibição)
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [diaAtivo, setDiaAtivo] = useState<string | null>(null);
  const [intervalosPorDia, setIntervalosPorDia] = useState<Record<string, { inicio: string; fim: string }[]>>({});
  const [novoIntervalo, setNovoIntervalo] = useState({ inicio: '08:00', fim: '12:00' });
  const [erroIntervalo, setErroIntervalo] = useState('');
  const [erroHorarioVazio, setErroHorarioVazio] = useState('');
  
  // Etapa 5 - Resumo final
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [numeroOrdem, setNumeroOrdem] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const especialidadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar especialidades existentes
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await request<{ data: EspecialidadeExistente[] }>('/medicos/especialidades');
        setEspecialidadesExistentes(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar especialidades', err);
      }
    };
    fetchEspecialidades();
  }, []);

  // Gerar email baseado no nome
  const gerarEmail = (nome: string) => {
    if (!nome) return '';
    const nomeLimpo = nome.toLowerCase().trim().replace(/\s+/g, '');
    return `${nomeLimpo}@mmq.com`;
  };

  const gerarSenha = (emailGerado: string) => {
    return emailGerado.split('@')[0] || '';
  };

  const gerarNumeroRegisto = () => {
    const ano = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OM-${ano}-${random}`;
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 12)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setTelefone(formatted);
  };

  const getTelefoneCompleto = () => {
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    return `+258 ${telefone}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (especialidadeRef.current && !especialidadeRef.current.contains(event.target as Node)) {
        setShowEspecialidades(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDiaSelecionado = (diaId: string) => {
    setDiasSelecionados(prev => {
      if (prev.includes(diaId)) {
        const novos = prev.filter(d => d !== diaId);
        const novosIntervalos = { ...intervalosPorDia };
        delete novosIntervalos[diaId];
        setIntervalosPorDia(novosIntervalos);
        return novos;
      } else {
        return [...prev, diaId];
      }
    });
    setErroHorarioVazio('');
  };

  const adicionarIntervalo = () => {
    if (!diaAtivo) return;
    setErroIntervalo('');
    
    if (novoIntervalo.inicio && novoIntervalo.fim) {
      const intervalosExistentes = intervalosPorDia[diaAtivo] || [];
      const duplicado = intervalosExistentes.some(
        i => i.inicio === novoIntervalo.inicio && i.fim === novoIntervalo.fim
      );
      
      if (duplicado) {
        setErroIntervalo('Este horário já foi adicionado para este dia');
        return;
      }
      
      const novosIntervalos = { ...intervalosPorDia };
      if (!novosIntervalos[diaAtivo]) {
        novosIntervalos[diaAtivo] = [];
      }
      novosIntervalos[diaAtivo] = [...novosIntervalos[diaAtivo], { ...novoIntervalo }];
      setIntervalosPorDia(novosIntervalos);
      setNovoIntervalo({ inicio: '08:00', fim: '12:00' });
      setErroIntervalo('');
      setErroHorarioVazio('');
    }
  };

  const removerIntervalo = (dia: string, index: number) => {
    const novosIntervalos = { ...intervalosPorDia };
    novosIntervalos[dia] = novosIntervalos[dia].filter((_, i) => i !== index);
    if (novosIntervalos[dia].length === 0) {
      delete novosIntervalos[dia];
    }
    setIntervalosPorDia(novosIntervalos);
  };

  const getDiasOrdenados = () => {
    const ordem = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    return [...diasSelecionados].sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b));
  };

  const getResumoHorarios = () => {
    const diasOrdenados = getDiasOrdenados();
    return diasOrdenados.map(diaId => {
      const diaInfo = diasDaSemana.find(d => d.id === diaId);
      const intervalos = intervalosPorDia[diaId] || [];
      return { dia: diaInfo?.nome || diaId, intervalos };
    });
  };

  const verificarHorariosVazios = () => {
    const diasComHorarios = getDiasOrdenados();
    for (const diaId of diasComHorarios) {
      const intervalos = intervalosPorDia[diaId] || [];
      if (intervalos.length === 0) {
        const diaInfo = diasDaSemana.find(d => d.id === diaId);
        setErroHorarioVazio(`O dia ${diaInfo?.nome} não tem horários definidos`);
        return false;
      }
    }
    setErroHorarioVazio('');
    return true;
  };

  // Gerar horario_trabalho no formato esperado pelo backend: HH:MM-HH:MM
  const gerarHorarioTrabalho = () => {
    const resumo = getResumoHorarios();
    if (resumo.length === 0) return '';
    
    const primeiroDia = resumo.find(item => item.intervalos.length > 0);
    if (!primeiroDia) return '';
    
    const primeiroIntervalo = primeiroDia.intervalos[0];
    if (!primeiroIntervalo) return '';
    
    return `${primeiroIntervalo.inicio}-${primeiroIntervalo.fim}`;
  };

  useEffect(() => {
    if (name) {
      const emailGerado = gerarEmail(name);
      setEmail(emailGerado);
      setPassword(gerarSenha(emailGerado));
    }
  }, [name]);

  useEffect(() => {
    if (step === 5) {
      setNumeroOrdem(gerarNumeroRegisto());
    }
  }, [step]);

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNextStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextStep: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextStep(nextStep);
    }
  };

  const handleCancel = () => {
    // Pergunta na etapa 4 (horários) e etapa 5 (confirmação)
    if (step === 4 || step === 5) {
      setShowCancelPopup(true);
    } else {
      router.push('/admin/medics');
    }
  };

  const confirmCancel = () => {
    setShowCancelPopup(false);
    router.push('/admin/medics');
  };

  const handleSubmit = async () => {
    setError('');
    
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    const horarioTrabalho = gerarHorarioTrabalho();
    
    setLoading(true);
    try {
      await request('/medicos', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          email,
          especialidade,
          numero_ordem: numeroOrdem,
          telefone: getTelefoneCompleto(),
          horario_trabalho: horarioTrabalho,
          password,
        }),
      });
      toast('Médico criado com sucesso!', 'success');
      router.push('/admin/medics');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar médico');
    } finally {
      setLoading(false);
    }
  };

  const editStep = (stepNumber: number) => {
    setStep(stepNumber);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-2">
        {step > 1 && (
          <button
            onClick={goToPreviousStep}
            className="p-1 rounded-full text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/10 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= s ? 'bg-[var(--mmq-orange)] text-white shadow-md' : 'bg-[var(--slate)] text-ink-3'
            }`}>
              {s}
            </div>
            {s < 5 && <div className={`w-6 h-0.5 mx-1 ${step > s ? 'bg-[var(--mmq-orange)]' : 'bg-[var(--border)]'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return (
    <Shell>
      <div className="w-full py-6 px-4 relative">
        {/* Botão Voltar - posição absoluta no canto superior direito */}
        <div className="absolute top-6 right-4 z-10">
          <button
            onClick={handleCancel}
            className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium transition-all duration-200"
          >
            ← Voltar
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header com título e subtítulo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Novo Médico</h1>
            <p className="text-sm text-ink-3">Registrar profissional no corpo clínico</p>
          </div>

          <StepIndicator />

          {/* Etapa 1 - Nome */}
          {step === 1 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">1. Nome Completo</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                    required
                    placeholder="Ex: Ana Cossa"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (name) {
                        handleNextStep(2);
                      } else {
                        setError('Preencha o nome completo');
                        setTimeout(() => setError(''), 3000);
                      }
                    }}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2 - Especialidade */}
          {step === 2 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">2. Especialidade</h2>
              </div>
              
              <div className="space-y-6">
                <div ref={especialidadeRef} className="relative">
                  <input
                    type="text"
                    value={especialidade}
                    onChange={(e) => {
                      setEspecialidade(e.target.value);
                      setShowEspecialidades(true);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                    onFocus={() => setShowEspecialidades(true)}
                    placeholder="Digite a especialidade..."
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                  
                  {showEspecialidades && especialidadesExistentes.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[var(--white)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                      {especialidadesExistentes.map((esp) => (
                        <button
                          key={esp.id}
                          type="button"
                          onClick={() => {
                            setEspecialidade(esp.nome);
                            setShowEspecialidades(false);
                            setTimeout(() => handleNextStep(3), 300);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--slate)] transition-colors duration-150"
                        >
                          {esp.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (especialidade) {
                        handleNextStep(3);
                      } else {
                        setError('Preencha a especialidade');
                        setTimeout(() => setError(''), 3000);
                      }
                    }}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3 - Telefone */}
          {step === 3 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">3. Telefone</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    onKeyDown={(e) => handleKeyDown(e, 4)}
                    placeholder="84 419 0271"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => handleNextStep(4)}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4 - Horários de Atendimento */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                  <h2 className="text-base font-bold text-[var(--ink)]">4. Selecione os dias de atendimento</h2>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {diasDaSemana.map((dia) => (
                    <button
                      key={dia.id}
                      onClick={() => toggleDiaSelecionado(dia.id)}
                      className={`py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        diasSelecionados.includes(dia.id)
                          ? 'bg-[var(--mmq-orange)] text-white shadow-sm'
                          : 'bg-[var(--slate)] text-ink-3 hover:bg-[var(--mmq-orange-dim)] hover:text-[var(--mmq-orange)]'
                      }`}
                    >
                      {dia.abreviado}
                    </button>
                  ))}
                </div>
              </div>

              {diasSelecionados.length > 0 && (
                <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                    <h2 className="text-base font-bold text-[var(--ink)]">Definir horários por dia</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink)] mb-2">
                        Dias selecionados
                      </label>
                      <div className="space-y-2">
                        {getDiasOrdenados().map(diaId => {
                          const diaInfo = diasDaSemana.find(d => d.id === diaId);
                          const intervalos = intervalosPorDia[diaId] || [];
                          return (
                            <button
                              key={diaId}
                              onClick={() => setDiaAtivo(diaId)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                                diaAtivo === diaId
                                  ? 'border-[var(--mmq-orange)] bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)]'
                                  : 'border-[var(--border)] hover:border-[var(--mmq-orange)]'
                              }`}
                            >
                              <span className="font-medium">{diaInfo?.nome}</span>
                              {intervalos.length > 0 && (
                                <span className="text-xs text-success">{intervalos.length} intervalo(s)</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {diaAtivo && (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink)] mb-3">
                          Horários para {diasDaSemana.find(d => d.id === diaAtivo)?.nome}
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <input
                            type="time"
                            value={novoIntervalo.inicio}
                            onChange={(e) => setNovoIntervalo({ ...novoIntervalo, inicio: e.target.value })}
                            className="flex-1 min-w-[80px] px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20"
                          />
                          <span className="text-ink-3 self-center">até</span>
                          <input
                            type="time"
                            value={novoIntervalo.fim}
                            onChange={(e) => setNovoIntervalo({ ...novoIntervalo, fim: e.target.value })}
                            className="flex-1 min-w-[80px] px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20"
                          />
                        </div>

                        <div className="flex justify-center mb-3">
                          <button
                            type="button"
                            onClick={adicionarIntervalo}
                            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-[var(--mmq-orange)] text-white hover:bg-[var(--mmq-orange-lt)] transition-all duration-200"
                          >
                            Adicionar
                          </button>
                        </div>

                        {erroIntervalo && (
                          <p className="text-xs text-danger mb-2 text-center">{erroIntervalo}</p>
                        )}

                        {intervalosPorDia[diaAtivo] && intervalosPorDia[diaAtivo].length > 0 && (
                          <div className="mt-3 space-y-2">
                            <label className="block text-xs font-semibold text-[var(--ink)]">
                              Intervalos adicionados:
                            </label>
                            {intervalosPorDia[diaAtivo].map((intervalo, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-[var(--slate)] rounded-lg px-3 py-2">
                                <span className="text-sm text-[var(--ink)]">{intervalo.inicio} - {intervalo.fim}</span>
                                <button
                                  type="button"
                                  onClick={() => removerIntervalo(diaAtivo, idx)}
                                  className="text-danger hover:text-danger/80 text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {erroHorarioVazio && (
                <div className="bg-[var(--danger-dim)] border border-danger/20 rounded-lg p-3">
                  <p className="text-xs text-danger text-center">{erroHorarioVazio}</p>
                </div>
              )}

              {Object.keys(intervalosPorDia).length > 0 && (
                <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                    <h2 className="text-base font-bold text-[var(--ink)]">Resumo dos Horários</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {getResumoHorarios().map((item, idx) => (
                      <div key={idx} className="bg-[var(--slate)] rounded-lg p-3 border border-[var(--border2)]">
                        <p className="text-sm font-semibold text-[var(--mmq-orange)]">{item.dia}</p>
                        <div className="mt-1 space-y-0.5">
                          {item.intervalos.length > 0 ? (
                            item.intervalos.map((intervalo, i) => (
                              <p key={i} className="text-sm text-[var(--ink)]">{intervalo.inicio} - {intervalo.fim}</p>
                            ))
                          ) : (
                            <p className="text-sm text-ink-3">—</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        if (verificarHorariosVazios()) {
                          setNumeroOrdem(gerarNumeroRegisto());
                          setStep(5);
                        }
                      }}
                      className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                    >
                      Confirmar Horários →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Etapa 5 - Resumo Final */}
          {step === 5 && (
            <div>
              <div className="bg-[var(--white)] rounded-xl shadow-lg p-6 border border-[var(--border2)]">
                <h2 className="text-xl font-bold text-[var(--ink)] text-center mb-6">Confirmar Dados do Médico</h2>

                {error && (
                  <div className="mb-4 p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                    <p className="text-xs text-danger text-center">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs text-ink-3 uppercase tracking-wide font-bold">Dados Pessoais</p>
                      <button onClick={() => editStep(1)} className="text-xs px-3 py-1.5 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Nome completo:</span>
                        <span className="font-semibold text-[var(--ink)]">{name}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Especialidade:</span>
                        <span className="font-semibold text-[var(--ink)]">{especialidade}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Telefone:</span>
                        <span className="font-semibold text-[var(--ink)]">{getTelefoneCompleto() || '—'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <p className="text-xs text-ink-3 italic mb-3">Gerado automaticamente baseado nos dados inseridos</p>
                    <div className="space-y-2">
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">N.º de Registo:</span>
                        <span className="font-semibold text-[var(--ink)]">{numeroOrdem}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Email:</span>
                        <span className="font-semibold text-[var(--ink)]">{email}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Senha inicial:</span>
                        <span className="font-semibold text-[var(--ink)]">{password}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs text-ink-3 uppercase tracking-wide font-bold">Horários de Atendimento</p>
                      <button onClick={() => editStep(4)} className="text-xs px-3 py-1.5 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {getResumoHorarios().length > 0 ? (
                        getResumoHorarios().map((item, idx) => (
                          <div key={idx} className="bg-[var(--white)] rounded-lg p-3 border border-[var(--border2)]">
                            <p className="text-sm font-semibold text-[var(--mmq-orange)]">{item.dia}</p>
                            <div className="mt-1 space-y-0.5">
                              {item.intervalos.length > 0 ? (
                                item.intervalos.map((intervalo, i) => (
                                  <p key={i} className="text-sm text-[var(--ink)]">{intervalo.inicio} - {intervalo.fim}</p>
                                ))
                              ) : (
                                <p className="text-sm text-ink-3">—</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-ink-3">Nenhum horário definido</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Criando...
                    </>
                  ) : (
                    'Guardar médico'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup de confirmação de cancelamento */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--white)] rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-[var(--border2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--danger-dim)] flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)]">Cancelar operação</h3>
            </div>
            
            <p className="text-sm text-ink-3 mb-6">
              Tem a certeza que deseja cancelar o registo do médico?
              <br />
              Todos os dados inseridos serão perdidos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
              >
                Continuar
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/80 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--slate); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--ink-3); }
      `}</style>
    </Shell>
  );
}