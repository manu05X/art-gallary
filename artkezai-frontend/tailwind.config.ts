import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // .container alone (no center/padding config) does not self-center —
    // used bare by the admin/artist/buyer dashboard layouts.
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        gold: 'var(--color-gold)',
        'gold-hover': 'var(--color-gold-hover)',
        cream: 'var(--color-cream)',
        muted: 'var(--color-muted)',
        subtle: 'var(--color-subtle)',
        dark: 'var(--color-dark)',
        // Fixed workspace tokens (see globals.css) — already referenced as
        // text-brand/bg-brand/text-accent across the dashboard pages.
        brand: 'var(--color-brand)',
        'brand-hover': 'var(--color-brand-hover)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        workspace: 'var(--color-workspace)',
        'workspace-border': 'var(--color-workspace-border)',
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
