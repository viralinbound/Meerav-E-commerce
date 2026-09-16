/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Same one-red-family brand ramp as the live site's css/style.css —
        // kept identical so this is a faithful rebuild, not a re-brand.
        brand: {
          900: '#4E0D18',
          800: '#6E1423',
          700: '#8C2131',
        },
        gold: {
          500: '#C9922E',
          300: '#E8B75D',
          700: '#A87A22',
          800: '#8F6718',
        },
        ink: '#1F1A17',
        ink2: '#6B625A',
        paper: '#FBF8F3',
        paperdark: '#F0E9DD',
        indigo: '#2B4356',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Merriweather', 'Manrope', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
