/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF9933',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF9933',
          600: '#EA580C',
          700: '#C2410C',
        },
        deepgreen: {
          DEFAULT: '#138808',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#138808',
          600: '#15803D',
          700: '#166534',
          800: '#14532D',
        },
        brandnavy: '#0F172A',
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
