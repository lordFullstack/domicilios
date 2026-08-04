import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#004E89',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
} satisfies Config
