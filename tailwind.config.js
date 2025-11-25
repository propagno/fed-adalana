/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    // Cores Adalana - Nova Paleta Rebranding
    'bg-adalana', 'bg-adalana-light', 'bg-adalana-dark', 'bg-adalana-accent',
    'text-adalana', 'text-adalana-light', 'text-adalana-dark', 'text-adalana-accent',
    // Cores primárias (Indigo profundo)
    'bg-primary', 'bg-primary-dark', 'bg-primary-light', 'text-primary',
    'active:bg-primary-dark', 'active:bg-[#0E1117]',
    // Cores secundárias (Vermelho vibrante iFood)
    'bg-secondary', 'bg-secondary-dark', 'bg-secondary-light', 'text-secondary',
    'active:bg-secondary-dark', 'active:bg-[#E6392E]',
    // Cores de accent (Amarelo Mercado Livre)
    'bg-accent', 'bg-accent-dark', 'bg-accent-light', 'text-accent',
    'active:bg-accent-dark', 'active:bg-[#E6B201]',
    // Cores de accent 2 (Verde Amazon)
    'bg-accent-2', 'bg-accent-2-dark', 'bg-accent-2-light', 'text-accent-2',
    // Cores semânticas
    'bg-success', 'bg-success-dark', 'bg-success-light', 'text-success',
    'bg-warning', 'bg-warning-dark', 'bg-warning-light', 'text-warning',
    'bg-error', 'bg-error-dark', 'bg-error-light', 'text-error',
    'active:bg-error-dark', 'active:bg-[#E6392E]',
    'bg-info', 'bg-info-dark', 'bg-info-light', 'text-info',
    // Backgrounds e surfaces
    'bg-background', 'bg-background-secondary', 'bg-background-tertiary',
    'bg-surface', 'bg-surface-elevated',
    // Gradientes
    'bg-gradient-primary', 'bg-gradient-secondary', 'bg-gradient-accent', 'bg-gradient-hero', 'bg-gradient-card',
    'bg-gradient-marketplace',
    // Shadows
    'shadow-elevation-0', 'shadow-elevation-1', 'shadow-elevation-2', 'shadow-elevation-3', 'shadow-elevation-4',
    'shadow-brand-md', 'shadow-brand-lg',
  ],
  theme: {
    extend: {
      colors: {
        // Adalana Brand Colors - Nova Paleta Rebranding (Marketplace Premium)
        adalana: {
          light: '#3128B2',        // Indigo médio - destaques
          DEFAULT: '#1A1F71',      // Indigo profundo - cor base primária
          dark: '#0E1117',         // Preto azulado - fundos e contrastes
          accent: '#FF4E42',       // Vermelho vibrante iFood - CTAs e destaques
          accent2: '#FEC601',      // Amarelo Mercado Livre - ratings e indicadores
          accent3: '#16B39A',      // Verde Amazon - sucesso e status positivos
          50: '#E8E9F5',
          100: '#C5C7E8',
          200: '#9FA2D9',
          300: '#787CC9',
          400: '#5256B8',
          500: '#1A1F71',
          600: '#15195D',
          700: '#101349',
          800: '#0C0E35',
          900: '#0E1117',
        },
        // Cores semânticas (Indigo como primário)
        primary: {
          DEFAULT: '#1A1F71',      // Indigo profundo como primário
          dark: '#0E1117',
          light: '#3128B2',
          50: '#E8E9F5',
          100: '#C5C7E8',
          200: '#9FA2D9',
          300: '#787CC9',
          400: '#5256B8',
          500: '#1A1F71',
          600: '#15195D',
          700: '#101349',
          800: '#0C0E35',
          900: '#0E1117',
        },
        secondary: {
          DEFAULT: '#FF4E42',      // Vermelho vibrante iFood como secundário
          dark: '#E6392E',
          light: '#FF6B60',
          50: '#FFE5E3',
          100: '#FFCCC7',
          200: '#FFB3AB',
          300: '#FF9A8F',
          400: '#FF8173',
          500: '#FF4E42',
          600: '#E6392E',
          700: '#CC241A',
          800: '#B30F06',
          900: '#990000',
        },
        accent: {
          DEFAULT: '#FEC601',      // Amarelo Mercado Livre como accent
          dark: '#E6B201',
          light: '#FFD933',
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFEDB3',
          300: '#FFE799',
          400: '#FFE180',
          500: '#FEC601',
          600: '#E6B201',
          700: '#CC9E01',
          800: '#B38A01',
          900: '#997601',
        },
        'accent-2': {
          DEFAULT: '#16B39A',      // Verde Amazon como accent 2
          dark: '#129F89',
          light: '#1AC7B0',
          50: '#E6F7F4',
          100: '#CCEFE9',
          200: '#B3E7DE',
          300: '#99DFD3',
          400: '#80D7C8',
          500: '#16B39A',
          600: '#129F89',
          700: '#0E8B78',
          800: '#0A7767',
          900: '#066356',
        },
        success: {
          DEFAULT: '#16B39A',      // Verde Amazon para sucesso
          light: '#1AC7B0',
          dark: '#129F89',
        },
        warning: {
          DEFAULT: '#FEC601',      // Amarelo Mercado Livre para avisos
          light: '#FFD933',
          dark: '#E6B201',
        },
        error: {
          DEFAULT: '#FF4E42',      // Vermelho iFood para erros
          light: '#FF6B60',
          dark: '#E6392E',
        },
        info: {
          DEFAULT: '#3128B2',      // Indigo médio para informações
          light: '#5256B8',
          dark: '#1A1F71',
        },
        // Neutros profissionais
        gray: {
          50: '#F5F7FA',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#111827',
          900: '#0E1117',
        },
        background: {
          DEFAULT: '#F5F7FA',      // Background principal - cinza suave
          secondary: '#FFFFFF',
          tertiary: '#E5E7EB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          overlay: 'rgba(14, 17, 23, 0.5)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Hierarquia Tipográfica do Design System Rebranding
        'display': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['36px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['30px', { lineHeight: '38px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        // Espaçamento padronizado baseado em 4px
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
      boxShadow: {
        // Sistema de elevações - Marketplace Premium
        'elevation-0': 'none',
        'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Shadows específicas da marca
        'brand-md': '0 15px 35px -10px rgba(26, 31, 113, 0.4)',
        'brand-lg': '0 25px 50px -12px rgba(26, 31, 113, 0.5)',
      },
      borderRadius: {
        'xs': '4px',
        'small': '4px',
        'medium': '8px',
        'large': '12px',
        'lg': '16px',
        'xlarge': '16px',
        'pill': '999px',
      },
      screens: {
        // Breakpoints responsivos
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      zIndex: {
        'modal-backdrop': '1040',
        'modal': '1050',
        'floating-cart': '1000',
        'navbar': '1020',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1A1F71 0%, #0E1117 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF4E42 0%, #E6392E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FEC601 0%, #E6B201 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0E1117 0%, #1A1F71 50%, #3128B2 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(26, 31, 113, 0.05) 0%, transparent 100%)',
        'gradient-marketplace': 'linear-gradient(135deg, #1A1F71 0%, #3128B2 50%, #FF4E42 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      transitionDuration: {
        'brand': '250ms',
      },
    },
  },
  plugins: [],
}

