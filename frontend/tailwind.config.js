/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#050B1A',
          900: '#0A1428',
          850: '#0F1E38',
          800: '#142749',
          750: '#1A325E',
          700: '#23417A',
        },
        gradient: {
          mint: '#4FFFC1',
          cyan: '#22D3EE',
          blue: '#3B82F6',
          violet: '#8B5CF6',
          purple: '#A855F7',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        border: {
          subtle: '#1E2E4A',
          glow: '#22D3EE40',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'neon-mint': '0 0 25px rgba(79, 255, 193, 0.25)',
        'neon-cyan': '0 0 25px rgba(34, 211, 238, 0.25)',
        'neon-violet': '0 0 25px rgba(139, 92, 246, 0.25)',
        'neon-multi': '0 0 30px rgba(34, 211, 238, 0.2), 0 0 50px rgba(139, 92, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
