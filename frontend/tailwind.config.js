/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f1115',
          800: '#1a1d23',
          700: '#2a2f3a',
        },
        brand: {
          new: '#10b981',      // Emerald
          updated: '#f59e0b',  // Amber
          inactive: '#6b7280', // Gray
          imported: '#3b82f6', // Blue
        }
      },
    },
  },
  plugins: [],
}