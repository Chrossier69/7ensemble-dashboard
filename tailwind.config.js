/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Outfit"', 'sans-serif'], body: ['"Outfit"', 'sans-serif'] },
      colors: {
        cosmos: { 50:'#e8e8f0', 100:'#9999bb', 200:'#6060a0', 300:'#3a3a70', 400:'#1e1e46', 500:'#12122e', 600:'#0a0a1a', 700:'#060612' },
        em7: '#00e5a0', gold7: '#f0c040', coral7: '#ff6b6b', purp7: '#7c5cfc', cyan7: '#00b4d8',
      },
    },
  },
  plugins: [],
}
