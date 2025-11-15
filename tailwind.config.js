/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          dark: '#0052CC',
          light: '#00A3FF',
        },
        secondary: {
          DEFAULT: '#0052CC',
        },
        accent: {
          DEFAULT: '#00A3FF',
        },
        success: {
          DEFAULT: '#00C853',
        },
        warning: {
          DEFAULT: '#FFB300',
        },
        error: {
          DEFAULT: '#FF3D00',
        },
        background: {
          DEFAULT: '#F5F5F5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  important: true,
}
