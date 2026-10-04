/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 30s linear infinite',
      },
      colors: {
        // ── Identidad original (sin cambios) ──
        primary: '#2554d8',
        secondary: '#00e0ff',
        electric: '#00f5ff',
        'bg-main': '#ffffff',
        'bg-secondary': '#f8fafc',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',

        // ── Colores que estaban escritos a mano en los componentes (mismos valores) ──
        // Pares casi iguales sin unificar a propósito: primary/brand-blue y secondary/brand-cyan.
        'brand-blue': '#2463EB',
        'brand-cyan': '#08CBEF',
        ink: '#101B31',
        muted: '#65748D',
        navy: '#061126',
        'hero-from': '#02050f',
        'hero-to': '#060d24',
        'surface-soft': '#F6F8FC',
        amber: '#FBBF24',
        'nav-glass': 'rgba(2, 8, 30, 0.55)',

        // ── Tema oscuro del rediseño (home-html/Main.dc.html) ──
        surface: '#101B2F',
        'surface-2': '#1A2437',
        line: '#242E40',
        success: '#34D399',
        danger: '#F87171',
        whatsapp: '#25D366', // color oficial de WhatsApp
        'whatsapp-ink': '#06210F', // texto e ícono sobre el verde de WhatsApp
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan':  '0 0 20px rgba(0, 224, 255, 0.35)',
        'glow-blue':  '0 0 20px rgba(37,  84, 216, 0.40)',
      },
    },
  },
  plugins: [],
};
