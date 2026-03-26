/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#e4e4e7',
          100: '#c9c9cf',
          200: '#93939f',
          300: '#5d5d6f',
          400: '#3a3a4a',
          500: '#1e1e2e',
          600: '#181828',
          700: '#121220',
          800: '#0c0c18',
          900: '#0a0a0f',
          950: '#050508',
        },
        neon: {
          cyan: '#00f0ff',
          'cyan-dim': '#00a8b3',
          violet: '#bf5af2',
          'violet-dim': '#8a3db3',
          emerald: '#30d158',
          'emerald-dim': '#1f8a3a',
          amber: '#ffd60a',
          'amber-dim': '#b39700',
          rose: '#ff375f',
          'rose-dim': '#b32743',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'typing': 'typing 1.5s steps(3) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        typing: {
          '0%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.1)',
        'neon-violet': '0 0 20px rgba(191, 90, 242, 0.3), 0 0 60px rgba(191, 90, 242, 0.1)',
        'neon-emerald': '0 0 20px rgba(48, 209, 88, 0.3), 0 0 60px rgba(48, 209, 88, 0.1)',
        'neon-amber': '0 0 20px rgba(255, 214, 10, 0.3), 0 0 60px rgba(255, 214, 10, 0.1)',
        'neon-rose': '0 0 20px rgba(255, 55, 95, 0.3), 0 0 60px rgba(255, 55, 95, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
