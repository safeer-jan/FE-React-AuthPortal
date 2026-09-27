/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: 'var(--bg)', surface: 'var(--surface)' },
        border: 'var(--border)',
        text: { DEFAULT: 'var(--text)', muted: 'var(--text-muted)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      borderRadius: { md: '6px', lg: '10px' },
    },
  },
  plugins: [],
};
