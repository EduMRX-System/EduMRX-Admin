/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./src/**/*.{js,jsx,ts,tsx,html}",
    ],
    theme: {
      extend: {
        colors: {
          // Indigo ranglari
          indigo: {
            50: '#f5f3ff',
            300: '#c7d2fe',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
          },
          // Slate ranglari
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
          // Red ranglari
          red: {
            50: '#fef2f2',
            400: '#f87171',
            950: '#450a0a',
          }
        },
      },
    },
    plugins: [],
  }