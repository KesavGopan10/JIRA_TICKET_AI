/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        text: 'var(--text)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
    },
  },
  plugins: [],
}
