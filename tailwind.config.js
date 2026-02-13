/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gart Brand Palette
        'dark-green': '#143221',
        'leaf': '#2D5A3C',
        'sage': '#768D5D',
        'border-cream': '#D9D7C8',
        'off-white': '#FDFDFB',
        // Semantic aliases
        primary: '#143221',
        'primary-light': '#2D5A3C',
        secondary: '#768D5D',
        background: '#FDFDFB',
        border: '#D9D7C8',
        // Utility colors
        error: '#B91C1C',
        'error-light': '#FEE2E2',
        success: '#15803D',
        'success-light': '#DCFCE7',
        warning: '#A16207',
        'warning-light': '#FEF3C7',
        gray: '#6B7280',
        'gray-light': '#9CA3AF',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      letterSpacing: {
        'widest': '0.15em',
      },
    },
  },
  plugins: [],
};
