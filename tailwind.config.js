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
        primary: '#2E7D32',
        'primary-dark': '#1B5E20',
        'primary-light': '#4CAF50',
        beige: '#F5F5DC',
        'beige-dark': '#E8E8CD',
      },
    },
  },
  plugins: [],
};
