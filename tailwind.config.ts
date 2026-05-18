import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#E8F0EC',
          100: '#D0E1D8',
          500: '#5A8A6F',
          700: '#3A7A68',
          900: '#1F4A35',
        },
        gold: {
          400: '#D4A853',
          500: '#C9923A',
          600: '#B07D2A',
        },
        warm: {
          white: '#FAFAF8',
        },
        body: '#5A6A62',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
} satisfies Config
