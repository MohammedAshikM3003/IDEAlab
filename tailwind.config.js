/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}',
    './src/frontend/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/frontend/components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-red-400',
    'hover:bg-red-500',
    'bg-blue-600',
    'hover:bg-blue-700',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}