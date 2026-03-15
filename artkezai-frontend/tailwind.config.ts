import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#1A1710',
        'surface-hover': '#1E1B14',
        border: '#2E2A22',
        gold: '#C9A84C',
        'gold-hover': '#D4B55A',
        cream: '#F5F0E8',
        muted: '#8A8070',
        subtle: '#5A5548',
        dark: '#0F0F0F',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
