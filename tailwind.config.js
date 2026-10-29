/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: '#CCFF00',
        danger: '#DC2626',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #111',
        'brutal-dark': '6px 6px 0 0 #fff',
      }
    },
  },
  plugins: [],
}
