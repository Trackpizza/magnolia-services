import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2f7f5',
          100: '#e0ede8',
          200: '#c1dbd1',
          300: '#97c3b5',
          400: '#68a693',
          500: '#4d8e7b',
          600: '#3d7464',
          700: '#325f52',
          800: '#2a4d43',
          900: '#244039',
        },
        plum: {
          900: '#1e1428',
          800: '#2d1f3d',
          700: '#3d2b54',
        },
        cream: {
          50:  '#fdfaf7',
          100: '#f7f3ee',
          200: '#ede5d8',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
