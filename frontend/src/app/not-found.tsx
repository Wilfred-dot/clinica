'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-[#f1f5f9]">
      <div className="max-w-[400px] px-6">
        {/* Número 404 gigante e quase transparente */}
        <div
          className="font-serif text-[110px] font-normal text-[#0c1a27] opacity-[0.06] leading-none tracking-[-6px] -mb-7 select-none"
        >
          404
        </div>

        <h2 className="text-[22px] font-bold text-[#0c1a27] mb-2.5">
          Página não encontrada
        </h2>

        <p className="text-[14px] text-[#6b8299] mb-6">
          A página que procura não existe ou foi removida do sistema.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#0c1a27] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#1a2d40] hover:shadow-[0_6px_24px_rgba(12,26,39,.10)] border border-[#0c1a27]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}