/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 30s linear infinite',
      },
      colors: {
        primary: '#2554d8',
        secondary: '#00e0ff',
        electric: '#00f5ff',
        'bg-main': '#ffffff',
        'bg-secondary': '#f8fafc',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter:   ['Inter',   'sans-serif'],
        playfair: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan':  '0 0 20px rgba(0, 224, 255, 0.35)',
        'glow-blue':  '0 0 20px rgba(37,  84, 216, 0.40)',
      },
    },
  },
  plugins: [],
};
