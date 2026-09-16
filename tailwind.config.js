/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdba5',
          300: '#ffc06d',
          400: '#ff9a33',
          500: '#ff7a0a',
          600: '#f05e00',
          700: '#c74600',
          800: '#9e3703',
          900: '#7f2f08',
        },
        maroon: {
          50: '#fdf3f3',
          100: '#fae3e3',
          200: '#f5cccc',
          300: '#ec9fa0',
          400: '#df6b6e',
          500: '#cf4549',
          600: '#b62d32',
          700: '#92232a',
          800: '#7a2026',
          900: '#681e23',
        },
        mustard: {
          50: '#fef9e7',
          100: '#fdf0c4',
          200: '#fbe088',
          300: '#f8c94b',
          400: '#f5b323',
          500: '#e8950f',
          600: '#c9710a',
          700: '#a44f0c',
          800: '#873f10',
          900: '#713511',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#faf0dc',
          300: '#f5e0bb',
          400: '#eecb91',
          500: '#e5b56d',
        },
        charcoal: {
          50: '#f6f6f5',
          100: '#e7e6e3',
          200: '#d1cfc9',
          300: '#b0ada4',
          400: '#8a877d',
          500: '#6e6b62',
          600: '#575549',
          700: '#46443c',
          800: '#3a382f',
          900: '#312f29',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, rgba(146,35,42,0.85) 0%, rgba(199,70,0,0.7) 100%)",
        'royal-gradient': "linear-gradient(135deg, #7a2026 0%, #92232a 50%, #c74600 100%)",
      },
    },
  },
  plugins: [],
};
