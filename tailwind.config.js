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
        // Títulos: Inter, desenhada para tela e próxima da San Francisco da Apple
        display: ['"Inter Variable"', '-apple-system', 'BlinkMacSystemFont', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    // Tema único "sala clara": cores de alto contraste do sistema da Apple (Increase Contrast, modo claro),
    // pensadas para datashow em sala com a luz acesa. Azul só para ação; cada modelo tem a sua cor de capa.
    themes: [
      {
        classplay: {
          primary: '#0040dd',
          'primary-content': '#ffffff',
          secondary: '#ffcc00',
          'secondary-content': '#000000',
          accent: '#c93400',
          'accent-content': '#ffffff',
          neutral: '#1c1c1e',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',
          'base-200': '#f2f2f7',
          'base-300': '#c6c6c8',
          'base-content': '#000000',
          info: '#0040dd',
          'info-content': '#ffffff',
          success: '#248a3d',
          'success-content': '#ffffff',
          warning: '#b25000',
          'warning-content': '#ffffff',
          error: '#d70015',
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
