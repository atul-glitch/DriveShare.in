/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#d5c8bb',
          400: '#23c52e',
          500: '#3dd14e',
          600: '#5adca2',
          700: '#36e120',
          800: '#43cd2b',
          900: '#53d711',
        },
        dark: {
          50:  '#f8f7f4',
          100: '#eeecea',
          200: '#d9d6d0',
          300: '#b8b3aa',
          400: '#918980',
          500: '#736b61',
          600: '#5e5650',
          700: '#4d4741',
          800: '#413c38',
          900: '#1a1714',
          950: '#161310',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(249,115,22,0.3)',
        'glow-sm': '0 0 15px rgba(249,115,22,0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [],
}
