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
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    // Tema único em tons de pedra, zinco e âmbar, pensado para projeção em sala clara
    themes: [
      {
        classplay: {
          primary: '#fbbf24',
          'primary-content': '#09090b',
          secondary: '#fef3c7',
          'secondary-content': '#78350f',
          accent: '#d97706',
          'accent-content': '#ffffff',
          neutral: '#18181b',
          'neutral-content': '#fafafa',
          'base-100': '#ffffff',
          'base-200': '#f5f5f4',
          'base-300': '#e4e4e7',
          'base-content': '#18181b',
          info: '#0369a1',
          'info-content': '#ffffff',
          success: '#047857',
          'success-content': '#ffffff',
          warning: '#fbbf24',
          'warning-content': '#451a03',
          error: '#be123c',
          'error-content': '#ffffff',
          '--rounded-box': '1.5rem',
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
