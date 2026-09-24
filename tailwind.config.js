/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#d4f0e1',
          200: '#a8e0c3',
          300: '#7fcc9e',
          400: '#4caf82',
          500: '#2d7a4f',
          600: '#1a6b3c',
          700: '#145a30',
          800: '#0d4a22',
          900: '#07320f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
