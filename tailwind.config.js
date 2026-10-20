import defaultTheme from 'tailwindcss/defaultTheme';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next Variable"', ...defaultTheme.fontFamily.sans],
        display: ['"Bricolage Grotesque Variable"', ...defaultTheme.fontFamily.sans],
        editorial: ['"Literata Variable"', 'Georgia', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    // Tema único: azul-petróleo profundo, vermelho de capa e mostarda; alto contraste para projeção
    themes: [
      {
        classplay: {
          primary: '#0a4d4a',
          'primary-content': '#ffffff',
          secondary: '#f2a900',
          'secondary-content': '#101820',
          accent: '#d62839',
          'accent-content': '#ffffff',
          neutral: '#101820',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',
          'base-200': '#e8f0ee',
          'base-300': '#c9d8d4',
          'base-content': '#101820',
          info: '#0369a1',
          'info-content': '#ffffff',
          success: '#047857',
          'success-content': '#ffffff',
          warning: '#f2a900',
          'warning-content': '#451a03',
          error: '#be123c',
          'error-content': '#ffffff',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--btn-focus-scale': '0.97',
          '--border-btn': '1px',
        },
      },
    ],
    darkTheme: 'classplay',
    logs: false,
  },
}
