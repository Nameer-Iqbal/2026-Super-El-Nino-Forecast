/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        climate: {
          dark: "#0b0f19",
          card: "#161f30",
          accent: "#38bdf8",
          ninoHot: "#f43f5e",
          iodCool: "#06b6d4",
          border: "#1e293b"
        }
      }
    },
  },
  plugins: [],
}
