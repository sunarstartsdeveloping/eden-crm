/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eden: {
          forest: '#111827', // modern deep graphite
          deep: '#16221c',
          emerald: '#1a3c2c', // understated modern forest green
          moss: '#29543e',
          sage: '#4b755f',
          leaf: '#5e9477',
          mist: '#eaf2ec',
          sand: '#f8f9fa',
          stone: '#f1f3f5',
          parchment: '#fcfcfd',
          gold: {
            DEFAULT: '#b8934d',
            light: '#d4b373',
            dark: '#917133',
            champagne: '#f0e6d2',
          },
          slate: '#374151',
          charcoal: '#111827',
          border: '#e5e7eb',
          borderDark: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'luxury-lg': '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
