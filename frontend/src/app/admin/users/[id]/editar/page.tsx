'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';
import { toast } from '@/components/Toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ativo: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await request<User>(`/users/${params.id}`);
        setUser(u);
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
        setAtivo(u.ativo);
      } catch (err) {
        console.error('Erro ao carregar utilizador', err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [params.id]);

  // Detetar alterações nos campos
  useEffect(() => {
    if (user) {
      const changed = 
        name !== user.name ||
        email !== user.email ||
        role !== user.role ||
        ativo !== user.ativo ||
        password !== '' ||
        confirmPassword !== '';
      setHasChanges(changed);
    }
  }, [name, email, role, ativo, password, confirmPassword, user]);

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelPopup(true);
    } else {
      router.push('/admin/users');
    }
  };

  const confirmCancel = () => {
    setShowCancelPopup(false);
    router.push('/admin/users');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar se há alterações
    if (!hasChanges) {
      setError('Nenhuma alteração foi feita para guardar.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password && password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const body: any = { name, email, role, ativo };
      if (password) body.password = password;
      await request(`/users/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      toast('Utilizador atualizado com sucesso!', 'success');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar utilizador');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await request(`/users/${params.id}`, { method: 'DELETE' });
      toast('Utilizador eliminado com sucesso!', 'success');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar utilizador');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleLabel = (roleValue: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      medico: 'Médico',
      recepcionista: 'Recepcionista',
      paciente: 'Paciente'
    };
    return roles[roleValue] || roleValue;
  };

  if (!mounted || loadingUser) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-ink-4">A carregar...</p>
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="p-8 text-center">
          <p className="text-danger">Utilizador não encontrado.</p>
          <button onClick={() => router.push('/admin/users')} className="mt-4 px-4 py-2 bg-[var(--mmq-orange)] text-white rounded-md">
            Voltar para lista
          </button>
        </div>
      </Shell>
    );
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
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Editar Utilizador</h1>
            <p className="text-sm text-ink-3">Atualizar dados, permissões e segurança do utilizador</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              {/* Dados pessoais */}
              <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
                Dados pessoais
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Nome completo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>
              </div>

              <hr className="border-[var(--border2)] my-5" />

              {/* Acesso */}
              <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
                Acesso
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Nível de acesso
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 cursor-pointer"
                  >
                    <option value="admin">Administrador</option>
                    <option value="medico">Médico</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="paciente">Paciente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-2">
                    Estado
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAtivo(true)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        ativo === true
                          ? 'bg-success text-white border-success shadow-sm'
                          : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-success hover:text-success'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${ativo === true ? 'bg-white' : 'bg-success'}`}></span>
                      Activo
                    </button>
                    <button
                      type="button"
                      onClick={() => setAtivo(false)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        ativo === false
                          ? 'bg-[var(--danger)] text-white border-[var(--danger)] shadow-sm'
                          : 'bg-[var(--white)] border-[var(--border)] text-ink-3 hover:border-danger hover:text-danger'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${ativo === false ? 'bg-white' : 'bg-[var(--danger)]'}`}></span>
                      Desativado
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-[var(--border2)] my-5" />

              {/* Nova senha */}
              <div className="text-xs font-bold uppercase tracking-[0.8px] text-ink-3 mb-4">
                Segurança
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Nova senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Deixar em branco para manter"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-[var(--mmq-orange)] transition-colors mt-6"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repetir a nova senha"
                    className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>

                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-danger">As senhas não coincidem.</p>
                )}
                {password && confirmPassword && password === confirmPassword && password.length >= 8 && (
                  <p className="text-xs text-success">✓ Senhas coincidem.</p>
                )}
              </div>

              {/* Operação perigosa */}
              <div className="pt-5 mt-5 border-t border-[var(--border2)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.8px] text-danger">
                  Operação perigosa
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteLoading}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/80 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleteLoading ? 'Eliminando...' : 'Eliminar utilizador'}
                </button>
              </div>
            </div>

            {/* Botões fora do div com mensagem de erro em baixo */}
            <div className="mt-6">
              {error && (
                <div className="mb-4 p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                  <p className="text-xs text-danger text-center">{error}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[var(--mmq-orange)] rounded-lg hover:bg-[var(--mmq-orange-lt)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar alterações'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Popup de confirmação de cancelamento - CENTRALIZADO */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--white)] rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-[var(--border2)]">
            <div className="flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[var(--danger-dim)] flex items-center justify-center">
                <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)] mt-3">Sair sem guardar</h3>
            </div>
            
            <p className="text-sm text-ink-3 mb-6 text-center">
              Tem alterações não guardadas.
              <br />
              Tem a certeza que deseja sair?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
              >
                Continuar
              </button>
              <button
                onClick={confirmCancel}
                className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/80 transition-all duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmação de eliminação - CENTRALIZADO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--white)] rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-[var(--border2)]">
            <div className="flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[var(--danger-dim)] flex items-center justify-center">
                <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)] mt-3">Eliminar utilizador</h3>
            </div>
            
            <p className="text-sm text-ink-3 mb-6 text-center">
              Tem a certeza que deseja eliminar <strong>{user.name}</strong>?
              <br />
              Esta ação é irreversível e todos os dados associados serão perdidos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/80 transition-all duration-200 disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Sim, eliminar'}
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