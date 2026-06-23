'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

export default function NewPatientPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  
  // Etapa 1 - Nome
  const [name, setName] = useState('');
  
  // Etapa 2 - Data de Nascimento
  const [dataNascimento, setDataNascimento] = useState('');
  
  // Etapa 3 - Sexo
  const [sexo, setSexo] = useState('M');
  
  // Etapa 4 - Telefone
  const [telefone, setTelefone] = useState('');
  
  // Etapa 5 - Endereço
  const [endereco, setEndereco] = useState('');
  
  // Etapa 6 - Observações Clínicas
  const [historicoMedico, setHistoricoMedico] = useState('');
  
  // Dados gerados
  const [numeroPaciente, setNumeroPaciente] = useState('');
  const [emailGerado, setEmailGerado] = useState('');
  const [senhaGerada, setSenhaGerada] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gerar número de paciente
  const gerarNumeroPaciente = () => {
    const ano = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PAC-${ano}-${random}`;
  };

  // Gerar email baseado no nome com fallbacks
  const gerarEmail = (nome: string) => {
    if (!nome) return '';
    const nomeLimpo = nome.toLowerCase().trim().replace(/\s+/g, '');
    
    const emailExistente = (email: string) => {
      return false;
    };
    
    let emailBase = `${nomeLimpo}@paciente.mmq.com`;
    let emailFinal = emailBase;
    let contador = 1;
    
    if (nome.trim().includes(' ')) {
      const nomeCompleto = nome.toLowerCase().trim().replace(/\s+/g, '');
      emailBase = `${nomeCompleto}@paciente.mmq.com`;
      emailFinal = emailBase;
      
      while (emailExistente(emailFinal)) {
        emailFinal = `${nomeCompleto}${contador}@paciente.mmq.com`;
        contador++;
      }
    }
    
    contador = 1;
    while (emailExistente(emailFinal)) {
      emailFinal = `${nomeLimpo}${contador}@paciente.mmq.com`;
      contador++;
    }
    
    return emailFinal;
  };

  const gerarSenha = (email: string) => {
    if (!email) return '';
    return email.split('@')[0] || '';
  };

  // Atualizar dados gerados quando o nome mudar
  useEffect(() => {
    if (name) {
      const email = gerarEmail(name);
      setEmailGerado(email);
      setSenhaGerada(gerarSenha(email));
    }
  }, [name]);

  // Gerar número de paciente ao entrar na etapa 7
  useEffect(() => {
    if (step === 7) {
      setNumeroPaciente(gerarNumeroPaciente());
    }
  }, [step]);

  const handleCancel = () => {
    if (step === 7) {
      setShowCancelPopup(true);
    } else {
      router.push('/admin/patients');
    }
  };

  const confirmCancel = () => {
    setShowCancelPopup(false);
    router.push('/admin/patients');
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

  const validarDataNascimento = (data: string): { valida: boolean; mensagem: string } => {
    if (!data) return { valida: false, mensagem: 'A data de nascimento é obrigatória.' };
    
    const partes = data.split('-');
    if (partes.length !== 3) return { valida: false, mensagem: 'Data inválida.' };
    
    const ano = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const dia = parseInt(partes[2]);
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
      return { valida: false, mensagem: 'Data inválida.' };
    }
    
    if (ano < 1900) {
      return { valida: false, mensagem: 'Data muito antiga. O ano deve ser superior a 1900.' };
    }
    
    if (ano > anoAtual) {
      return { valida: false, mensagem: `Data no futuro. O ano não pode ser superior a ${anoAtual}.` };
    }
    
    if (ano < 1900 || ano > anoAtual) {
      return { valida: false, mensagem: `O ano deve estar entre 1900 e ${anoAtual}.` };
    }
    
    if (mes < 1 || mes > 12) {
      return { valida: false, mensagem: 'Mês inválido (1-12).' };
    }
    
    const diasNoMes = new Date(ano, mes, 0).getDate();
    if (dia < 1 || dia > diasNoMes) {
      return { valida: false, mensagem: `Dia inválido para o mês ${mes}.` };
    }
    
    return { valida: true, mensagem: '' };
  };

  const validarTelefone = (tel: string): { valida: boolean; mensagem: string } => {
    const numeros = tel.replace(/\s/g, '');
    
    if (!numeros || numeros.length === 0) {
      return { valida: false, mensagem: 'O telefone é obrigatório.' };
    }
    
    if (numeros.length < 9) {
      return { valida: false, mensagem: 'O telefone deve ter 9 dígitos.' };
    }
    
    if (numeros.length > 9) {
      return { valida: false, mensagem: 'O telefone deve ter 9 dígitos.' };
    }
    
    if (!numeros.startsWith('8')) {
      return { valida: false, mensagem: 'O telefone deve começar com 8 (ex: 84 474 2029).' };
    }
    
    return { valida: true, mensagem: '' };
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    
    if (!name.trim()) errs.name = 'O nome é obrigatório.';
    
    const dataValidation = validarDataNascimento(dataNascimento);
    if (!dataValidation.valida) {
      errs.dataNascimento = dataValidation.mensagem;
    }
    
    const telefoneValidation = validarTelefone(telefone);
    if (!telefoneValidation.valida) {
      errs.telefone = telefoneValidation.mensagem;
    }
    
    if (!endereco.trim()) errs.endereco = 'O endereço é obrigatório.';
    
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validate()) {
      setError('Corrija os erros antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      await request('/pacientes', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email: emailGerado,
          data_nascimento: dataNascimento,
          sexo,
          telefone,
          endereco,
          historico_medico: historicoMedico || undefined,
          password: senhaGerada,
        }),
      });
      toast('Paciente criado com sucesso!', 'success');
      router.push('/admin/patients');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar paciente.');
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
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= s ? 'bg-[var(--mmq-orange)] text-white shadow-md' : 'bg-[var(--slate)] text-ink-3'
            }`}>
              {s}
            </div>
            {s < 6 && <div className={`w-6 h-0.5 mx-1 ${step > s ? 'bg-[var(--mmq-orange)]' : 'bg-[var(--border)]'}`} />}
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
        <div className="absolute top-6 right-4 z-10">
          <button
            onClick={handleCancel}
            className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium transition-all duration-200"
          >
            ← Voltar
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Novo Paciente</h1>
            <p className="text-sm text-ink-3">Registar paciente na base de dados</p>
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
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                    required
                    placeholder="Nome do paciente"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                  {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (name.trim()) {
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

          {/* Etapa 2 - Data de Nascimento */}
          {step === 2 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">2. Data de Nascimento</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => {
                      setDataNascimento(e.target.value);
                      setFieldErrors(prev => ({ ...prev, dataNascimento: '' }));
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                  {fieldErrors.dataNascimento && <p className="text-xs text-danger mt-1">{fieldErrors.dataNascimento}</p>}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (dataNascimento) {
                        const validation = validarDataNascimento(dataNascimento);
                        if (validation.valida) {
                          handleNextStep(3);
                        } else {
                          setError(validation.mensagem);
                          setTimeout(() => setError(''), 3000);
                        }
                      } else {
                        setError('Preencha a data de nascimento');
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

          {/* Etapa 3 - Sexo */}
          {step === 3 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">3. Sexo</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-3">
                    Selecione o sexo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSexo('M')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        sexo === 'M'
                          ? 'bg-[var(--mmq-orange)] text-white border-[var(--mmq-orange)] shadow-sm'
                          : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setSexo('F')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        sexo === 'F'
                          ? 'bg-[var(--mmq-orange)] text-white border-[var(--mmq-orange)] shadow-sm'
                          : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]'
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (sexo) {
                        handleNextStep(4);
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

          {/* Etapa 4 - Telefone */}
          {step === 4 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">4. Telefone</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    onKeyDown={(e) => handleKeyDown(e, 5)}
                    required
                    placeholder="84 474 2029"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                  {fieldErrors.telefone && <p className="text-xs text-danger mt-1">{fieldErrors.telefone}</p>}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (telefone.trim()) {
                        const validation = validarTelefone(telefone);
                        if (validation.valida) {
                          handleNextStep(5);
                        } else {
                          setError(validation.mensagem);
                          setTimeout(() => setError(''), 3000);
                        }
                      } else {
                        setError('Preencha o telefone');
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

          {/* Etapa 5 - Endereço */}
          {step === 5 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">5. Endereço</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => {
                      setEndereco(e.target.value);
                      setFieldErrors(prev => ({ ...prev, endereco: '' }));
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 6)}
                    required
                    placeholder="Rua, Bairro, Cidade"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                  {fieldErrors.endereco && <p className="text-xs text-danger mt-1">{fieldErrors.endereco}</p>}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (endereco.trim()) {
                        handleNextStep(6);
                      } else {
                        setError('Preencha o endereço');
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

          {/* Etapa 6 - Observações Clínicas */}
          {step === 6 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">6. Observações Clínicas</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={historicoMedico}
                    onChange={e => setHistoricoMedico(e.target.value)}
                    placeholder="Alergias conhecidas, condições pré-existentes..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 resize-y"
                  />
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
                        setStep(7);
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

          {/* Etapa 7 - Confirmar Dados */}
          {step === 7 && (
            <div>
              <div className="bg-[var(--white)] rounded-xl shadow-lg p-6 border border-[var(--border2)]">
                <h2 className="text-xl font-bold text-[var(--ink)] text-center mb-6">Confirmar Dados do Paciente</h2>

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
                        <span className="text-ink-3">Data de nascimento:</span>
                        <span className="font-semibold text-[var(--ink)]">
                          {dataNascimento ? new Date(dataNascimento).toLocaleDateString('pt-PT') : '—'}
                        </span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Sexo:</span>
                        <span className="font-semibold text-[var(--ink)]">
                          {sexo === 'M' ? 'Masculino' : 'Feminino'}
                        </span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Telefone:</span>
                        <span className="font-semibold text-[var(--ink)]">{telefone}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Endereço:</span>
                        <span className="font-semibold text-[var(--ink)]">{endereco}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Observações clínicas:</span>
                        <span className="font-semibold text-[var(--ink)]">{historicoMedico || '—'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--slate)] rounded-lg p-4 border border-[var(--border2)]">
                    <p className="text-xs text-ink-3 italic mb-3">Gerado automaticamente baseado nos dados inseridos</p>
                    <div className="space-y-2">
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">N.º de Paciente:</span>
                        <span className="font-semibold text-[var(--ink)]">{numeroPaciente}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Email:</span>
                        <span className="font-semibold text-[var(--ink)]">{emailGerado}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-ink-3">Senha:</span>
                        <span className="font-semibold text-[var(--ink)]">{senhaGerada}</span>
                      </p>
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
                      A criar...
                    </>
                  ) : (
                    'Guardar paciente'
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
              Tem a certeza que deseja cancelar o registo do paciente?
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