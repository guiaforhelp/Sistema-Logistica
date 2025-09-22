/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B4D8', // exemplo de cor customizada
        techno: '#f75c03'   // cor da marca se quiser
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  darkMode: 'class', // permite alternar modo escuro manualmente
  plugins: [],
}
