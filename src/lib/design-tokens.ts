/**
 * 🎨 Design Tokens - Sistema de Diseño BioFincas
 * Tokens coherentes para spacing, typography, colors, shadows, etc.
 */

export const spacing = {
  xxs: '0.25rem',  // 4px
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
} as const

export const typography = {
  // Display - Para headers principales muy grandes
  display: {
    size: '3rem',         // 48px
    lineHeight: '3.5rem', // 56px
    weight: 700,
    letterSpacing: '-0.02em'
  },
  // Headings
  h1: {
    size: '2.25rem',      // 36px
    lineHeight: '2.75rem', // 44px
    weight: 700,
    letterSpacing: '-0.01em'
  },
  h2: {
    size: '1.875rem',     // 30px
    lineHeight: '2.25rem', // 36px
    weight: 600,
    letterSpacing: '-0.01em'
  },
  h3: {
    size: '1.5rem',       // 24px
    lineHeight: '2rem',    // 32px
    weight: 600,
    letterSpacing: '0'
  },
  h4: {
    size: '1.25rem',      // 20px
    lineHeight: '1.75rem', // 28px
    weight: 600,
    letterSpacing: '0'
  },
  h5: {
    size: '1.125rem',     // 18px
    lineHeight: '1.75rem', // 28px
    weight: 600,
    letterSpacing: '0'
  },
  h6: {
    size: '1rem',         // 16px
    lineHeight: '1.5rem',  // 24px
    weight: 600,
    letterSpacing: '0'
  },
  // Body text
  large: {
    size: '1.125rem',     // 18px
    lineHeight: '1.75rem', // 28px
    weight: 400,
    letterSpacing: '0'
  },
  base: {
    size: '1rem',         // 16px
    lineHeight: '1.5rem',  // 24px
    weight: 400,
    letterSpacing: '0'
  },
  small: {
    size: '0.875rem',     // 14px
    lineHeight: '1.25rem', // 20px
    weight: 400,
    letterSpacing: '0'
  },
  tiny: {
    size: '0.75rem',      // 12px
    lineHeight: '1rem',    // 16px
    weight: 400,
    letterSpacing: '0'
  },
  // Special
  caption: {
    size: '0.75rem',      // 12px
    lineHeight: '1rem',    // 16px
    weight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const
  }
} as const

export const borderRadius = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

// Brand colors específicos de BioFincas
export const brandColors = {
  primary: {
    50: 'oklch(0.95 0.02 142)',
    100: 'oklch(0.90 0.04 142)',
    200: 'oklch(0.80 0.08 142)',
    300: 'oklch(0.70 0.12 142)',
    400: 'oklch(0.60 0.14 142)',
    500: 'oklch(0.45 0.15 142)', // Main primary
    600: 'oklch(0.40 0.15 142)',
    700: 'oklch(0.35 0.12 142)',
    800: 'oklch(0.30 0.10 142)',
    900: 'oklch(0.25 0.08 142)',
  },
  success: {
    light: 'oklch(0.90 0.04 145)',
    base: 'oklch(0.60 0.15 145)',
    dark: 'oklch(0.35 0.12 145)',
  },
  warning: {
    light: 'oklch(0.95 0.06 80)',
    base: 'oklch(0.70 0.14 80)',
    dark: 'oklch(0.45 0.12 80)',
  },
  error: {
    light: 'oklch(0.95 0.04 15)',
    base: 'oklch(0.60 0.22 15)',
    dark: 'oklch(0.40 0.18 15)',
  },
  info: {
    light: 'oklch(0.90 0.04 220)',
    base: 'oklch(0.55 0.18 220)',
    dark: 'oklch(0.35 0.14 220)',
  }
} as const

// Helper para crear clases Tailwind type-safe
export const createTypographyClass = (variant: keyof typeof typography) => {
  const style = typography[variant]
  return `text-[${style.size}] leading-[${style.lineHeight}] font-[${style.weight}]`
}

// Helper para spacing
export const createSpacingClass = (size: keyof typeof spacing, type: 'p' | 'm' | 'gap' = 'p') => {
  return `${type}-[${spacing[size]}]`
}
