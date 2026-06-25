'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

interface Paciente {
  id: number;
  users: { name: string };
}

export default function ReceptionNovaNotificacaoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  
  // Etapa 1 - Paciente
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [selectedPacienteIndex, setSelectedPacienteIndex] = useState(-1);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  
  // Etapa 2 - Tipo de Alerta
  const [tipo, setTipo] = useState('lembrete_consulta');
  
  // Etapa 3 - Conteúdo da Mensagem
  const [mensagem, setMensagem] = useState('');
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const pacienteRef = useRef<HTMLDivElement>(null);
  const pacienteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoadingPacientes(true);
      try {
        const response = await request<{ data: Paciente[] }>('/pacientes');
        setPacientes(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar pacientes', err);
      } finally {
        setLoadingPacientes(false);
      }
    };
    fetchPacientes();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pacienteRef.current && !pacienteRef.current.contains(event.target as Node)) {
        setShowPacienteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tiposAlerta = [
    { 
      value: 'lembrete_consulta', 
      label: 'Lembrete de consulta',
      mensagemTemplate: (nome: string) => `Prezado(a) ${nome},

Recordamos que tem uma consulta agendada para breve. Por favor, confirme a sua presença.

Atenciosamente,
Clínica MMQ`
    },
    { 
      value: 'confirmacao', 
      label: 'Confirmação',
      mensagemTemplate: (nome: string) => `Prezado(a) ${nome},

A sua consulta foi confirmada. Agradecemos a sua preferência pela Clínica MMQ.

Atenciosamente,
Clínica MMQ`
    },
    { 
      value: 'alerta', 
      label: 'Alerta',
      mensagemTemplate: (nome: string) => `Prezado(a) ${nome},

Informamos que há uma atualização importante sobre o seu caso. Por favor, contacte a Clínica MMQ para mais informações.

Atenciosamente,
Clínica MMQ`
    },
    { 
      value: 'resultado_exame', 
      label: 'Resultado de exame',
      mensagemTemplate: (nome: string) => `Prezado(a) ${nome},

Os resultados dos seus exames já estão disponíveis. Pode consultá-los no seu portal de paciente ou dirigir-se à Clínica MMQ.

Atenciosamente,
Clínica MMQ`
    },
  ];

  const getTipoLabel = (tipoValue: string) => {
    const tipo = tiposAlerta.find(t => t.value === tipoValue);
    return tipo ? tipo.label : tipoValue;
  };

  const getMensagemTemplate = (tipoValue: string, nome: string) => {
    const tipo = tiposAlerta.find(t => t.value === tipoValue);
    return tipo ? tipo.mensagemTemplate(nome) : '';
  };

  // Atualizar mensagem quando tipo ou paciente mudar
  useEffect(() => {
    if (selectedPaciente && tipo) {
      const template = getMensagemTemplate(tipo, selectedPaciente.users.name);
      setMensagem(template);
    }
  }, [tipo, selectedPaciente]);

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setSearchPaciente(paciente.users.name);
    setShowPacienteDropdown(false);
    setSelectedPacienteIndex(-1);
    const template = getMensagemTemplate(tipo, paciente.users.name);
    setMensagem(template);
    setTimeout(() => setStep(2), 300);
  };

  const handleCancel = () => {
    if (step === 4) {
      setShowCancelPopup(true);
    } else {
      router.push('/recepcionista/notifications');
    }
  };

  const confirmCancel = () => {
    setShowCancelPopup(false);
    router.push('/recepcionista/notifications');
  };

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

  const handlePacienteKeyDown = (e: React.KeyboardEvent) => {
    if (!showPacienteDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowPacienteDropdown(true);
      return;
    }
    
    if (e.key === 'Tab' && !showPacienteDropdown) {
      setShowPacienteDropdown(true);
    }
    
    if (showPacienteDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedPacienteIndex(prev => {
            const newIndex = prev < filteredPacientes.length - 1 ? prev + 1 : prev;
            const dropdown = document.querySelector('.paciente-dropdown');
            if (dropdown) {
              const items = dropdown.querySelectorAll('button');
              if (items[newIndex]) {
                items[newIndex].scrollIntoView({ block: 'nearest' });
              }
            }
            return newIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedPacienteIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : -1;
            if (newIndex >= 0) {
              const dropdown = document.querySelector('.paciente-dropdown');
              if (dropdown) {
                const items = dropdown.querySelectorAll('button');
                if (items[newIndex]) {
                  items[newIndex].scrollIntoView({ block: 'nearest' });
                }
              }
            }
            return newIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedPacienteIndex >= 0 && filteredPacientes[selectedPacienteIndex]) {
            handleSelectPaciente(filteredPacientes[selectedPacienteIndex]);
          }
          break;
        case 'Escape':
          setShowPacienteDropdown(false);
          setSelectedPacienteIndex(-1);
          break;
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedPaciente) {
      errs.paciente = 'Selecione um paciente.';
    }
    if (!mensagem.trim()) {
      errs.mensagem = 'A mensagem é obrigatória.';
    } else if (mensagem.trim().length < 5) {
      errs.mensagem = 'A mensagem deve ter pelo menos 5 caracteres.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    setError('');
    if (!validate()) {
      setError('Corrija os erros antes de continuar.');
      return;
    }

    setSending(true);
    try {
      await request('/notificacoes', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: selectedPaciente?.id,
          mensagem: mensagem.trim(),
          tipo_variavel: tipo,
        }),
      });
      toast('Notificação enviada com sucesso!', 'success');
      router.push('/recepcionista/notifications');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  const editStep = (stepNumber: number) => {
    setStep(stepNumber);
  };

  const filteredPacientes = searchPaciente 
    ? pacientes.filter(p => {
        const searchTerm = searchPaciente.toLowerCase().trim();
        const nome = p.users?.name?.toLowerCase() || '';
        const id = String(p.id);
        return nome.includes(searchTerm) || id.includes(searchTerm);
      })
    : pacientes;

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
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= s ? 'bg-[var(--mmq-orange)] text-white shadow-md' : 'bg-[var(--slate)] text-ink-3'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-6 h-0.5 mx-1 ${step > s ? 'bg-[var(--mmq-orange)]' : 'bg-[var(--border)]'}`} />}
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
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Nova Notificação</h1>
            <p className="text-sm text-ink-3">Enviar notificação manual para um paciente</p>
          </div>

          <StepIndicator />

          {/* Etapa 1 - Paciente */}
          {step === 1 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">1. Selecionar Paciente</h2>
              </div>
              
              <div className="space-y-6">
                <div ref={pacienteRef} className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      ref={pacienteInputRef}
                      type="text"
                      value={searchPaciente}
                      onChange={(e) => {
                        setSearchPaciente(e.target.value);
                        setShowPacienteDropdown(true);
                        setSelectedPacienteIndex(-1);
                        if (e.target.value === '') {
                          setSelectedPaciente(null);
                        }
                      }}
                      onFocus={() => setShowPacienteDropdown(true)}
                      onKeyDown={handlePacienteKeyDown}
                      placeholder="Digite o nome ou ID do paciente..."
                      disabled={loadingPacientes}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                    />
                  </div>
                  
                  {showPacienteDropdown && !loadingPacientes && (
                    <div className="absolute z-50 w-full mt-1 bg-[var(--white)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar paciente-dropdown">
                      {filteredPacientes.length > 0 ? (
                        filteredPacientes.map((paciente, idx) => (
                          <button
                            key={paciente.id}
                            onClick={() => handleSelectPaciente(paciente)}
                            onMouseEnter={() => setSelectedPacienteIndex(idx)}
                            className={`w-full px-3 py-2 text-left text-sm transition-all duration-200 ${
                              selectedPacienteIndex === idx ? 'bg-[var(--mmq-orange)] text-white' : 'hover:bg-[var(--slate)] text-[var(--ink)]'
                            }`}
                          >
                            <span className="font-medium">{paciente.users?.name}</span>
                            <span className={`ml-2 text-xs ${selectedPacienteIndex === idx ? 'text-white/70' : 'text-ink-3'}`}>ID: {paciente.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-xs text-ink-3">Nenhum paciente encontrado</div>
                      )}
                    </div>
                  )}
                  {fieldErrors.paciente && <p className="text-xs text-danger mt-1">{fieldErrors.paciente}</p>}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (selectedPaciente) {
                        handleNextStep(2);
                      } else {
                        setError('Selecione um paciente');
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

          {/* Etapa 2 - Tipo de Alerta */}
          {step === 2 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">2. Tipo de Alerta</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    {tiposAlerta.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => handleNextStep(3)}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3 - Conteúdo da Mensagem */}
          {step === 3 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">3. Conteúdo da Mensagem</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-ink-3 mb-2">
                    Paciente: <span className="font-semibold text-[var(--ink)]">{selectedPaciente?.users?.name}</span>
                  </p>
                  <textarea
                    value={mensagem}
                    onChange={(e) => {
                      setMensagem(e.target.value);
                      setFieldErrors(prev => ({ ...prev, mensagem: '' }));
                    }}
                    required
                    rows={8}
                    placeholder="Digite a mensagem a ser enviada ao paciente..."
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 resize-y font-mono"
                  />
                  {fieldErrors.mensagem && <p className="text-xs text-danger mt-1">{fieldErrors.mensagem}</p>}
                </div>

                {error && (
                  <div className="p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                    <p className="text-xs text-danger text-center">{error}</p>
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (validate()) {
                        setStep(4);
                      } else {
                        setError('Corrija os erros antes de continuar.');
                      }
                    }}
                    className="px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] transition-all duration-200 shadow-sm"
                  >
                    Ver Resumo →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4 - Confirmar Dados */}
          {step === 4 && (
            <div>
              <div className="bg-[var(--white)] rounded-xl shadow-lg p-6 border border-[var(--border2)]">
                <h2 className="text-xl font-bold text-[var(--ink)] text-center mb-6">Confirmar Dados da Notificação</h2>

                {error && (
                  <div className="mb-4 p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                    <p className="text-xs text-danger text-center">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* DIV 1 - Dados do Paciente */}
                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs text-ink-3 uppercase tracking-wide font-bold">Dados do Paciente</p>
                      <button onClick={() => editStep(1)} className="text-xs px-3 py-1.5 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Paciente:</span>
                        <span className="font-semibold text-[var(--ink)]">{selectedPaciente?.users?.name}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">ID do Paciente:</span>
                        <span className="font-semibold text-[var(--ink)]">{selectedPaciente?.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* DIV 2 - Dados da Notificação */}
                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs text-ink-3 uppercase tracking-wide font-bold">Dados da Notificação</p>
                      <button onClick={() => editStep(2)} className="text-xs px-3 py-1.5 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Tipo de Alerta:</span>
                        <span className="font-semibold text-[var(--ink)]">{getTipoLabel(tipo)}</span>
                      </p>
                      <div className="text-sm">
                        <span className="text-ink-3 block mb-1">Mensagem:</span>
                        <div className="bg-[var(--white)] rounded-lg p-3 border border-[var(--border2)] font-mono text-sm whitespace-pre-wrap text-[var(--ink)]">
                          {mensagem}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões fora da div */}
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
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      A enviar...
                    </>
                  ) : (
                    'Enviar notificação'
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
              Tem a certeza que deseja cancelar o envio da notificação?
              <br />
              Os dados inseridos serão perdidos.
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