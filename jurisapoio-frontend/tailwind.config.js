/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wine: "#500416",
        rose: "#c4617a",
        blush: "#f2dde3",
        cream: "#fdf8f5"
      }
    }
  },
  plugins: []
}