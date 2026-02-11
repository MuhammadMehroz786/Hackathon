/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sarmaya: {
          primary: '#1B4D3E',
          light: '#2D7A5F',
          accent: '#F5A623',
        }
      }
    },
  },
  plugins: [],
}
