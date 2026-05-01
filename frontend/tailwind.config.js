/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: '',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#03AED2',
        secondary: '#68D2E8',
        ternary: '#FDDE55',
        quad: '#FEEFAD',
      }
    }
    
  },
  plugins: [],
}