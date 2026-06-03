'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/app/components/PortalLayout';
import { request } from '@/lib/api';

export default function PacienteAgendarPage() {
  const router = useRouter();
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!data || !hora) {
      setError('Preencha data e hora.');
      return;
    }
    setLoading(true);
    try {
      const perfil = await request<{ id: number }>('/pacientes/me');
      await request('/consultas', {
        method: 'POST',
        body: JSON.stringify({
          paciente_id: perfil.id,
          data_hora: `${data}T${hora}:00.000Z`,
          observacoes: motivo.trim() || undefined,
        }),
      });
      router.push('/paciente');
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar consulta');
    } finally {
      setLoading(false);
    }
  };

  const horarios = ['08:00','09:00','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];

  return (
    <PortalLayout>
      <div className="max-w-[700px] mx-auto px-6 py-9">
        {/* Cabeçalho da página */}
        <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-[-0.3px]">Solicitar Consulta</h1>
            <p className="text-[13px] text-ink-3 mt-1">Escolha a data e hora preferida. Um médico será atribuído pela recepção.</p>
          </div>
        </div>

        {/* Painel do formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[var(--border2)] rounded-[12px] p-[28px_30px] shadow-[0_1px_3px_rgba(12,26,39,0.05)]"
        >
          {/* Erro geral */}
          {error && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] text-danger text-[11.5px] font-semibold px-2.5 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
              {error}
            </div>
          )}

          {/* Data */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-ink-2 mb-1.5">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] outline-none transition focus:border-mmq-orange focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            />
          </div>

          {/* Hora */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-ink-2 mb-1.5">
              Hora
            </label>
            <select
              value={hora}
              onChange={e => setHora(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] outline-none transition focus:border-mmq-orange focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)] appearance-none bg-no-repeat bg-[right_12px_center] pr-[34px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b8299' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">Seleccione uma hora...</option>
              {horarios.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold uppercase tracking-[0.6px] text-ink-2 mb-1.5">
              Motivo da consulta <span className="font-normal normal-case tracking-normal text-ink-4">(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Descreva brevemente o motivo da sua consulta..."
              className="w-full min-h-[88px] px-4 py-2.5 rounded-[8px] border border-[var(--border)] bg-white text-sm text-[var(--ink)] outline-none transition resize-y focus:border-mmq-orange focus:ring-[0_0_0_3px_rgba(255,127,0,0.1)]"
            ></textarea>
          </div>

          {/* Acções */}
          <div className="flex gap-3 flex-wrap pt-5 mt-5 border-t border-[var(--border2)]">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-mmq-orange px-5 h-12 text-sm font-semibold text-white transition hover:bg-mmq-orange-hover disabled:opacity-50"
            >
              {loading ? 'A processar...' : 'Solicitar Consulta'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--border)] bg-white px-5 h-12 text-sm font-semibold text-ink-2 transition hover:bg-slate hover:border-ink-4"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}