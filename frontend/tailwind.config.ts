import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',   // ← ADICIONAR ESTA LINHA (ativa dark mode via classe .dark)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // === CORES BASE MMQ ===
        ink: "#102A6B",           // Azul marinho principal
        "ink-dark": "#0d2455",    // Azul marinho mais escuro (para gradientes)
        "ink-darker": "#0a1e4a",  // Azul marinho ainda mais escuro (para gradientes)
        "ink-2": "#2e4358",
        "ink-3": "#6b8299",
        "ink-4": "#a8bfcf",
        // === SISTEMA DE CORES MMQ (LARANJA INSTITUCIONAL) ===
        "mmq-orange": "#FF7F00",  // Primária/Ações
        "mmq-orange-hover": "#E06F00", // Hover
        "mmq-orange-dim": "#fef8ec",   // Fundo suave para alertas
        "mmq-orange-mid": "#fdefd0",
        // === TONS SECUNDÁRIOS (mantidos para compatibilidade semântica) ===
        sky: "#1258a8",
        "sky-lt": "#1a6ecc",
        "sky-dim": "#e6f0fb",
        slate: "#f1f5f9",
        "slate2": "#e8eef4",
        // === SEMÂNTICA DE ESTADOS CLÍNICOS ===
        danger: "#b83232",
        "danger-dim": "#fdf0f0",
        warn: "#b87a00",
        "warn-dim": "#fef8ec", // Nota: mesma que mmq-orange-dim - proposital
        success: "#1a7a4a",
        "success-dim": "#edf7f2",
      },
    },
  },
  plugins: [],
};

export default config;