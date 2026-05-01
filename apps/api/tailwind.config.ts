import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        stable: {
          bg:           'var(--stable-bg)',
          card:         'var(--stable-card)',
          'card-border':'var(--stable-card-border)',
          nav:          'var(--stable-nav)',
          'nav-border': 'var(--stable-nav-border)',
          t1:           'var(--stable-t1)',
          t2:           'var(--stable-t2)',
          t3:           'var(--stable-t3)',
        },
      },
    },
  },
  plugins: [],
}

export default config
