/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  safelist: [
    'bg-pink-100', 'bg-pink-200', 'bg-pink-300',
    'bg-green-300', 'bg-green-400',
    'bg-blue-200', 'bg-blue-300',
    'text-pink-600'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

