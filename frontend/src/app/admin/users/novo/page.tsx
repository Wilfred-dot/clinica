'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

export default function NewUserPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  
  // Etapa 1 - Nome
  const [name, setName] = useState('');
  
  // Etapa 2 - Email
  const [email, setEmail] = useState('');
  
  // Etapa 3 - Nível de acesso
  const [role, setRole] = useState('recepcionista');
  
  // Etapa 4 - Senha
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCancel = () => {
    if (step === 5) {
      setShowCancelPopup(true);
    } else {
      router.push('/admin/users');
    }
  };

  const confirmCancel = () => {
    setShowCancelPopup(false);
    router.push('/admin/users');
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

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, role, password }),
      });
      toast('Utilizador criado com sucesso!', 'success');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar utilizador');
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

  const getRoleLabel = (roleValue: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      medico: 'Médico',
      recepcionista: 'Recepcionista',
      paciente: 'Paciente'
    };
    return roles[roleValue] || roleValue;
  };

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
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Novo Utilizador</h1>
            <p className="text-sm text-ink-3">Criar conta de acesso ao sistema</p>
          </div>

          <StepIndicator />

          {/* Etapa 1 - Nome Completo */}
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
                    placeholder="Nome do utilizador"
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

          {/* Etapa 2 - Email */}
          {step === 2 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">2. Email</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                    required
                    placeholder="email@clinicammq.com"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (email) {
                        handleNextStep(3);
                      } else {
                        setError('Preencha o email');
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

          {/* Etapa 3 - Nível de Acesso */}
          {step === 3 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">3. Nível de Acesso</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 4)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    <option value="admin">Administrador</option>
                    <option value="medico">Médico</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="paciente">Paciente</option>
                  </select>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      if (role) {
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

          {/* Etapa 4 - Senha */}
          {step === 4 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">4. Senha</h2>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-[var(--mmq-orange)] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>

                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repetir senha"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
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
                      if (password && confirmPassword) {
                        if (password === confirmPassword && password.length >= 8) {
                          setStep(5);
                        } else if (password !== confirmPassword) {
                          setError('As senhas não coincidem');
                          setTimeout(() => setError(''), 3000);
                        } else if (password.length < 8) {
                          setError('A senha deve ter no mínimo 8 caracteres');
                          setTimeout(() => setError(''), 3000);
                        }
                      } else {
                        setError('Preencha todos os campos');
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

          {/* Etapa 5 - Confirmar Dados */}
          {step === 5 && (
            <div>
              <div className="bg-[var(--white)] rounded-xl shadow-lg p-6 border border-[var(--border2)]">
                <h2 className="text-xl font-bold text-[var(--ink)] text-center mb-6">Confirmar Dados do Utilizador</h2>

                {error && (
                  <div className="mb-4 p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                    <p className="text-xs text-danger text-center">{error}</p>
                  </div>
                )}
                
                <div className="bg-[var(--slate)] rounded-lg p-5 border border-[var(--border2)]">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-ink-3 uppercase tracking-wide font-bold">Dados do Utilizador</p>
                    <button onClick={() => editStep(1)} className="text-xs px-3 py-1.5 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                      Editar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm flex justify-between">
                      <span className="text-ink-3">Nome completo:</span>
                      <span className="font-semibold text-[var(--ink)]">{name}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-ink-3">Email:</span>
                      <span className="font-semibold text-[var(--ink)]">{email}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-ink-3">Nível de acesso:</span>
                      <span className="font-semibold text-[var(--ink)]">{getRoleLabel(role)}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-ink-3">Senha:</span>
                      <span className="font-semibold text-[var(--ink)]">{password}</span>
                    </p>
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
                    'Criar utilizador'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
              Tem a certeza que deseja cancelar a criação do utilizador?
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