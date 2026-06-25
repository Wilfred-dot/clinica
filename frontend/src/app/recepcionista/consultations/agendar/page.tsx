'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/app/components/Shell';
import { request } from '@/lib/api';

interface Paciente {
  id: number;
  users: { name: string };
}

interface Medico {
  id: number;
  especialidade: string;
  users: { name: string };
  horario_inicio?: string;
  horario_fim?: string;
  dias_atendimento?: number[];
}

interface DiaDisponivel {
  date: string;
  available: boolean;
}

export default function ReceptionAgendarConsultaPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hora, setHora] = useState('');
  const [manualHora, setManualHora] = useState('');
  
  const [searchPaciente, setSearchPaciente] = useState('');
  const [searchMedico, setSearchMedico] = useState('');
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [showMedicoDropdown, setShowMedicoDropdown] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diasDisponiveis, setDiasDisponiveis] = useState<DiaDisponivel[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);
  const [selectedPacienteIndex, setSelectedPacienteIndex] = useState(-1);
  const [selectedMedicoIndex, setSelectedMedicoIndex] = useState(-1);
  
  const pacienteRef = useRef<HTMLDivElement>(null);
  const medicoRef = useRef<HTMLDivElement>(null);
  const pacienteInputRef = useRef<HTMLInputElement>(null);
  const medicoInputRef = useRef<HTMLInputElement>(null);

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const removerAcentos = (texto: string) => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const ordenarMedicosPorNome = (lista: Medico[]) => {
    return [...lista].sort((a, b) => {
      const nomeA = a.users?.name?.replace(/^(Dr\.|Dra\.)\s*/i, '') || '';
      const nomeB = b.users?.name?.replace(/^(Dr\.|Dra\.)\s*/i, '') || '';
      return nomeA.localeCompare(nomeB, 'pt', { sensitivity: 'base' });
    });
  };

  const getHorariosPorMedico = () => {
    if (!selectedMedico) return [];
    const inicio = parseInt(selectedMedico.horario_inicio?.split(':')[0] || '8');
    const fim = parseInt(selectedMedico.horario_fim?.split(':')[0] || '17');
    const horarios = [];
    for (let i = inicio; i <= fim; i++) {
      horarios.push(`${String(i).padStart(2, '0')}:00`);
      if (i !== fim) horarios.push(`${String(i).padStart(2, '0')}:30`);
    }
    return horarios;
  };
  
  const horariosDisponiveis = getHorariosPorMedico();
  const [manualDate, setManualDate] = useState('');
  const dataCriada = new Date().toLocaleDateString('pt-PT');
  const horaCriada = new Date().toLocaleTimeString('pt-PT');

  const getTituloMedico = (nome: string) => {
    if (!nome) return 'Dr(a).';
    if (nome.includes('Dra.') || nome.includes('Dra ')) return 'Dra.';
    const primeiroNome = nome.split(' ')[0] || '';
    if (primeiroNome.endsWith('a')) {
      return 'Dra.';
    }
    return 'Dr.';
  };

  const getNomeSemTitulo = (nome: string) => {
    if (!nome) return '';
    return nome.replace(/^(Dr\.|Dra\.)\s*/i, '').trim();
  };

  const getPeriodoDia = (horaStr: string) => {
    if (!horaStr) return '';
    const hora = parseInt(horaStr.split(':')[0]);
    if (hora >= 0 && hora < 12) return 'Manhã';
    if (hora >= 12 && hora < 18) return 'Tarde';
    return 'Noite';
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          request<{ data: Paciente[] }>('/pacientes'),
          request<{ data: Medico[] }>('/medicos'),
        ]);
        setPacientes(pRes.data ?? []);
        const medicosComDados = (mRes.data ?? []).map(m => ({
          ...m,
          horario_inicio: '08:00',
          horario_fim: '17:00',
          dias_atendimento: [1, 3, 5]
        }));
        setMedicos(ordenarMedicosPorNome(medicosComDados));
      } catch (err) {
        console.error('Erro ao carregar listas', err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pacienteRef.current && !pacienteRef.current.contains(event.target as Node)) {
        setShowPacienteDropdown(false);
      }
      if (medicoRef.current && !medicoRef.current.contains(event.target as Node)) {
        setShowMedicoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedMedico) {
      fetchDisponibilidade();
    }
  }, [selectedMedico, currentMonth]);

  const fetchDisponibilidade = async () => {
    setLoadingDisponibilidade(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const diasDoMes = new Date(year, month + 1, 0).getDate();
      const disponibilidade: DiaDisponivel[] = [];
      
      for (let i = 1; i <= diasDoMes; i++) {
        const date = new Date(year, month, i);
        const diaSemana = date.getDay();
        const diaSemanaAjustado = diaSemana === 0 ? 7 : diaSemana;
        const isAvailable = selectedMedico?.dias_atendimento?.includes(diaSemanaAjustado) || false;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        disponibilidade.push({ date: dateStr, available: isAvailable });
      }
      setDiasDisponiveis(disponibilidade);
      
      const hojeStr = new Date().toISOString().split('T')[0];
      if (isDateAvailable(hojeStr)) {
        setSelectedDate(hojeStr);
        const [year, month, day] = hojeStr.split('-');
        setManualDate(`${day}/${month}/${year}`);
      }
    } catch (err) {
      console.error('Erro ao carregar disponibilidade', err);
    } finally {
      setLoadingDisponibilidade(false);
    }
  };

  const isDateAvailable = (date: string) => {
    const dia = diasDisponiveis.find(d => d.date === date);
    return dia?.available || false;
  };

  const isToday = (date: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    return date === hoje;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startingDay = firstDay.getDay();
    startingDay = startingDay === 0 ? 7 : startingDay;
    const startingOffset = startingDay - 1;
    
    const days = [];
    for (let i = 0; i < startingOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date });
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setSearchPaciente(paciente.users.name);
    setShowPacienteDropdown(false);
    setSelectedPacienteIndex(-1);
    setTimeout(() => setStep(2), 300);
  };

  const handleSelectMedico = (medico: Medico) => {
    setSelectedMedico(medico);
    setSearchMedico(medico.users.name);
    setShowMedicoDropdown(false);
    setSelectedMedicoIndex(-1);
    setTimeout(() => setStep(3), 300);
  };

  const handleDateSelect = (date: string) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      const [year, month, day] = date.split('-');
      setManualDate(`${day}/${month}/${year}`);
      setTimeout(() => setStep(4), 300);
    }
  };

  const handleHoraSelect = (horaSelecionada: string) => {
    setHora(horaSelecionada);
    setManualHora(horaSelecionada);
    setTimeout(() => setStep(5), 300);
  };

  const handleManualHoraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualHora(value);
  };

  const handleManualHoraKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (manualHora && manualHora.length >= 4) {
        setHora(manualHora);
        setTimeout(() => setStep(5), 300);
      }
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.length > 8) numbers = numbers.slice(0, 8);
    
    let formatted = '';
    if (numbers.length > 0) {
      formatted += numbers.slice(0, 2);
      if (numbers.length >= 3) formatted += '/' + numbers.slice(2, 4);
      if (numbers.length >= 5) formatted += '/' + numbers.slice(4, 8);
    }
    
    setManualDate(formatted);
    
    // Se a data estiver completa (DD/MM/AAAA), verificar disponibilidade
    if (formatted.length === 10) {
      const parts = formatted.split('/');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        if (isDateAvailable(formattedDate)) {
          setSelectedDate(formattedDate);
        }
      }
    }
  };

  const handleManualDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (manualDate.length === 10) {
        const parts = manualDate.split('/');
        if (parts.length === 3) {
          const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          if (isDateAvailable(formattedDate)) {
            setSelectedDate(formattedDate);
            setTimeout(() => setStep(4), 300);
          }
        }
      }
    }
  };

  const goToToday = () => {
    const hoje = new Date();
    setCurrentMonth(hoje);
    const hojeStr = hoje.toISOString().split('T')[0];
    if (isDateAvailable(hojeStr)) {
      setSelectedDate(hojeStr);
      const [year, month, day] = hojeStr.split('-');
      setManualDate(`${day}/${month}/${year}`);
    }
  };

  const editStep = (stepNumber: number) => {
    setStep(stepNumber);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await request('/consultas', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: selectedPaciente?.id,
          medico_id: selectedMedico?.id,
          data_hora: `${selectedDate}T${hora}:00.000Z`,
        }),
      });
      router.push('/recepcionista/consultations');
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const filteredPacientes = searchPaciente 
    ? pacientes.filter(p => {
        const nomeSemAcento = removerAcentos(p.users?.name?.toLowerCase() || '');
        const buscaSemAcento = removerAcentos(searchPaciente.toLowerCase());
        return nomeSemAcento.includes(buscaSemAcento);
      })
    : pacientes;
    
  const filteredMedicos = searchMedico
    ? ordenarMedicosPorNome(medicos.filter(m => {
        const nomeSemAcento = removerAcentos(m.users?.name?.toLowerCase() || '');
        const buscaSemAcento = removerAcentos(searchMedico.toLowerCase());
        return nomeSemAcento.includes(buscaSemAcento);
      }))
    : ordenarMedicosPorNome(medicos);

  const handlePacienteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleMedicoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMedicoDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowMedicoDropdown(true);
      return;
    }
    
    if (e.key === 'Tab' && !showMedicoDropdown) {
      setShowMedicoDropdown(true);
    }
    
    if (showMedicoDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMedicoIndex(prev => {
            const newIndex = prev < filteredMedicos.length - 1 ? prev + 1 : prev;
            const dropdown = document.querySelector('.medico-dropdown');
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
          setSelectedMedicoIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : -1;
            if (newIndex >= 0) {
              const dropdown = document.querySelector('.medico-dropdown');
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
          if (selectedMedicoIndex >= 0 && filteredMedicos[selectedMedicoIndex]) {
            handleSelectMedico(filteredMedicos[selectedMedicoIndex]);
          }
          break;
        case 'Escape':
          setShowMedicoDropdown(false);
          setSelectedMedicoIndex(-1);
          break;
      }
    }
  };

  const formatDateCapitalized = (dateStr: string) => {
    const date = new Date(dateStr);
    const diaSemana = date.toLocaleDateString('pt-PT', { weekday: 'long' });
    const dia = date.getDate();
    const mes = date.toLocaleDateString('pt-PT', { month: 'long' });
    const ano = date.getFullYear();
    return {
      diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
      dia,
      mes: mes.charAt(0).toUpperCase() + mes.slice(1),
      ano
    };
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
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              step >= s ? 'bg-[var(--mmq-orange)] text-white shadow-md' : 'bg-[var(--slate)] text-ink-3'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-6 h-0.5 mx-1 ${step > s ? 'bg-[var(--mmq-orange)]' : 'bg-[var(--border)]'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Shell>
      <div className="w-full py-6 px-4 relative">
        {/* Botão Voltar - posição absoluta no canto superior direito */}
        <div className="absolute top-6 right-4 z-10">
          <button
            onClick={() => router.push('/recepcionista/consultations')}
            className="border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--slate)] hover:border-[var(--ink4)] hover:text-[var(--ink)] px-4 py-2 rounded-md font-medium transition-all duration-200"
          >
            ← Voltar
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight mb-1">Agendar Consulta</h1>
            <p className="text-sm text-ink-3">Siga os passos abaixo para marcar uma nova consulta</p>
          </div>

          <StepIndicator />

          {/* Etapa 1 - Paciente */}
          {step === 1 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">1. Quem é o paciente?</h2>
              </div>
              
              <div ref={pacienteRef} className="relative">
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">Selecione o paciente</label>
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
                    }}
                    onFocus={() => setShowPacienteDropdown(true)}
                    onKeyDown={handlePacienteKeyDown}
                    placeholder="Digite para pesquisar..."
                    disabled={loadingLists}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>
                
                {showPacienteDropdown && !loadingLists && (
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
              </div>
            </div>
          )}

          {/* Etapa 2 - Médico */}
          {step === 2 && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">2. Qual médico?</h2>
              </div>
              
              <div ref={medicoRef} className="relative">
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">Selecione o médico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </div>
                  <input
                    ref={medicoInputRef}
                    type="text"
                    value={searchMedico}
                    onChange={(e) => {
                      setSearchMedico(e.target.value);
                      setShowMedicoDropdown(true);
                      setSelectedMedicoIndex(-1);
                    }}
                    onFocus={() => setShowMedicoDropdown(true)}
                    onKeyDown={handleMedicoKeyDown}
                    placeholder="Digite para pesquisar..."
                    disabled={loadingLists}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)] transition-all duration-200"
                  />
                </div>
                
                {showMedicoDropdown && !loadingLists && (
                  <div className="absolute z-50 w-full mt-1 bg-[var(--white)] border border-[var(--border)] rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar medico-dropdown">
                    {filteredMedicos.length > 0 ? (
                      filteredMedicos.map((medico, idx) => (
                        <button
                          key={medico.id}
                          onClick={() => handleSelectMedico(medico)}
                          onMouseEnter={() => setSelectedMedicoIndex(idx)}
                          className={`w-full px-3 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between ${
                            selectedMedicoIndex === idx ? 'bg-[var(--mmq-orange)] text-white' : 'hover:bg-[var(--slate)] text-[var(--ink)]'
                          }`}
                        >
                          <span className="font-medium">{medico.users?.name}</span>
                          <span className={`text-xs ${selectedMedicoIndex === idx ? 'text-white/70' : 'text-ink-3'}`}>{medico.especialidade}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-xs text-ink-3">Nenhum médico encontrado</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etapa 3 - Data com calendário compacto */}
          {step === 3 && selectedMedico && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                  <h2 className="text-base font-bold text-[var(--ink)]">3. Escolha a data</h2>
                </div>
                <p className="text-xs text-ink-3">
                  Datas de atendimento disponíveis da{' '}
                  <span className="font-semibold text-[var(--mmq-orange)]">
                    {getTituloMedico(selectedMedico?.users?.name || '')} {getNomeSemTitulo(selectedMedico?.users?.name || '')}
                  </span>
                </p>
              </div>
              
              {/* Calendário compacto */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-1 hover:bg-[var(--slate)] rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    {meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-[var(--slate)] rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {diasSemana.map(day => <div key={day} className="text-center text-[10px] font-semibold text-ink-3 py-1">{day}</div>)}
                </div>

                {loadingDisponibilidade ? (
                  <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--mmq-orange)]" /></div>
                ) : (
                  <div className="grid grid-cols-7 gap-0.5">
                    {getDaysInMonth().map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
                      const available = isDateAvailable(day.date);
                      const selected = selectedDate === day.date;
                      const today = isToday(day.date);
                      return (
                        <button
                          key={day.date}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={!available}
                          className={`aspect-square rounded text-xs font-medium transition-all duration-200 ${
                            available ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                          } ${selected 
                            ? 'bg-[var(--mmq-orange)] text-white shadow-sm ring-2 ring-[var(--mmq-orange)] ring-offset-1' 
                            : today && available
                              ? 'bg-[var(--mmq-orange)]/20 text-[var(--mmq-orange)] font-bold border border-[var(--mmq-orange)]'
                              : available 
                                ? 'bg-[var(--mmq-orange-dim)] text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)] hover:text-white hover:ring-2 hover:ring-[var(--mmq-orange)] hover:ring-offset-1' 
                                : 'bg-[var(--white)] text-ink-3 border border-[var(--border2)]'
                          }`}
                        >
                          {day.day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input manual de data */}
              <div className="mt-4 pt-4 border-t border-[var(--border2)]">
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">Digite a data manualmente</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={manualDate}
                  onChange={handleManualDateChange}
                  onKeyDown={handleManualDateKeyDown}
                  className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)]"
                />
                {manualDate.length === 10 && isDateAvailable(manualDate.split('/').reverse().join('-')) && (
                  <p className="text-xs text-success mt-1">✓ Data disponível. Pressione Enter para confirmar.</p>
                )}
              </div>
            </div>
          )}

          {/* Etapa 4 - Horário com lista vertical */}
          {step === 4 && selectedDate && (
            <div className="bg-[var(--white)] rounded-xl border border-[var(--border2)] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-[var(--mmq-orange)] rounded-full" />
                <h2 className="text-base font-bold text-[var(--ink)]">4. Escolha o horário</h2>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-xs text-ink-3 mb-1">Data selecionada</p>
                <div className="text-base font-bold text-[var(--ink)]">
                  <div>{formatDateCapitalized(selectedDate).diaSemana}</div>
                  <div>{formatDateCapitalized(selectedDate).dia} de {formatDateCapitalized(selectedDate).mes} de {formatDateCapitalized(selectedDate).ano}</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {horariosDisponiveis.map(h => (
                  <button
                    key={h}
                    onClick={() => handleHoraSelect(h)}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      hora === h 
                        ? 'bg-[var(--mmq-orange)] text-white shadow-sm' 
                        : 'bg-[var(--white)] border border-[var(--border)] text-ink-3 hover:border-[var(--mmq-orange)] hover:text-[var(--mmq-orange)]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>

              {/* Input manual de horário */}
              <div className="mt-4 pt-4 border-t border-[var(--border2)]">
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">Ou digite o horário manualmente</label>
                <input
                  type="time"
                  value={manualHora}
                  onChange={handleManualHoraChange}
                  onKeyDown={handleManualHoraKeyDown}
                  className="w-full px-3 py-2 text-sm bg-[var(--white)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mmq-orange)]/20 focus:border-[var(--mmq-orange)]"
                />
              </div>
            </div>
          )}

          {/* Etapa 5 - Dados da Consulta */}
          {step === 5 && (
            <div>
              <div className="bg-[var(--white)] rounded-xl shadow-lg p-6 border border-[var(--border2)]">
                <h2 className="text-xl font-bold text-[var(--ink)] text-center mb-6">Dados da Consulta</h2>

                {error && (
                  <div className="mb-4 p-3 bg-[var(--danger-dim)] border border-danger/20 rounded-lg">
                    <p className="text-xs text-danger text-center">{error}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--slate)] rounded-lg p-3 min-h-[80px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-ink-3 uppercase tracking-wide">Paciente</p>
                      <button onClick={() => editStep(1)} className="text-xs px-2 py-1 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm font-semibold text-[var(--ink)]">{selectedPaciente?.users?.name}</p>
                      <p className="text-xs text-ink-3">ID: {selectedPaciente?.id}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--slate)] rounded-lg p-3 min-h-[80px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-ink-3 uppercase tracking-wide">Médico</p>
                      <button onClick={() => editStep(2)} className="text-xs px-2 py-1 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm font-semibold text-[var(--ink)]">{selectedMedico?.users?.name}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{selectedMedico?.especialidade}</p>
                    </div>
                  </div>

                  <div className="bg-[var(--slate)] rounded-lg p-3 min-h-[80px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-ink-3 uppercase tracking-wide">Data</p>
                      <button onClick={() => editStep(3)} className="text-xs px-2 py-1 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm font-semibold text-[var(--ink)]">{selectedDate && formatDateCapitalized(selectedDate).diaSemana}</p>
                      <p className="text-sm text-[var(--ink)]">{selectedDate && formatDateCapitalized(selectedDate).dia} de {selectedDate && formatDateCapitalized(selectedDate).mes} de {selectedDate && formatDateCapitalized(selectedDate).ano}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--slate)] rounded-lg p-3 min-h-[80px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-ink-3 uppercase tracking-wide">Horário</p>
                      <button onClick={() => editStep(4)} className="text-xs px-2 py-1 rounded-md bg-[var(--mmq-orange)]/10 text-[var(--mmq-orange)] hover:bg-[var(--mmq-orange)]/20 transition-colors font-medium">
                        Editar
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm font-semibold text-[var(--ink)]">{hora}</p>
                      <p className="text-xs text-ink-3">{getPeriodoDia(hora)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[var(--border2)] text-xs text-ink-3">
                  <span>Data Criada: {dataCriada}</span>
                  <span>Hora Criada: {horaCriada}</span>
                </div>
              </div>

              {/* Botões fora da div */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <button 
                  onClick={() => router.push('/recepcionista/consultations')} 
                  className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-ink-3 bg-[var(--white)] border border-[var(--border)] rounded-lg hover:bg-[var(--slate)] transition-all duration-200"
                >
                  Cancelar
                </button>
                <button 
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
                      Confirmando...
                    </>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--slate); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--ink-3); }
      `}</style>
    </Shell>
  );
}