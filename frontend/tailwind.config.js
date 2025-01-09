/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {    
      fontFamily: {
      delius: ['Delius', 'sans-serif'],
      parkinsans: ['Parkinsans', 'sans-serif'],
    }},
  },
  plugins: [],
}

