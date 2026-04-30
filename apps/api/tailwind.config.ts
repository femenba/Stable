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
        brand: {
          50:  '#f0f4ff',
          100: '#dde7ff',
          500: '#4f6ef7',
          600: '#3b5af0',
          700: '#2c46dc',
          900: '#1a2d9e',
        },
      },
    },
  },
  plugins: [],
}

export default config
