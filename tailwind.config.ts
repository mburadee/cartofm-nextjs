import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#070B14',
        panel: '#0D1420',
        'panel-2': '#111A2B',
        line: '#1D293D',
        signal: '#22D3C8',
        beacon: '#F5A623',
        ember: '#F97316',
        mist: '#8CA0B8',
        fog: '#4C5C74'
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 30%, rgba(34,211,200,0.10), transparent 60%)'
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        'spin-slow': {
          'to': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 3s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
