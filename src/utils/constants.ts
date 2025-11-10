/**
 * Centralized constants for SPFx Showcase
 * Ensures consistency across all demos and components
 */

/**
 * Color palette for consistent theming
 */
export const COLORS = {
  // Primary colors
  primary: '#0078d4',
  primaryHover: '#106ebe',
  primaryPressed: '#005a9e',

  // Semantic colors
  success: '#107c10',
  successLight: '#dff6dd',
  warning: '#f7630c',
  warningLight: '#fff4ce',
  error: '#d13438',
  errorLight: '#fde7e9',
  info: '#0078d4',
  infoLight: '#deecf9',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray10: '#faf9f8',
  gray20: '#f3f2f1',
  gray30: '#edebe9',
  gray40: '#e1dfdd',
  gray50: '#d2d0ce',
  gray60: '#c8c6c4',
  gray70: '#a19f9d',
  gray80: '#605e5c',
  gray90: '#484644',
  gray100: '#323130',
  gray110: '#201f1e',

  // Code editor colors
  codeDark: '#1e1e1e',
  codeLight: '#ffffff',

  // Gradient backgrounds for heroes
  gradients: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    purple: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    teal: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    pink: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
};

/**
 * Spacing units for consistent layout
 * Based on 8px grid system
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

/**
 * Border radius values for consistent rounding
 */
export const BORDER_RADIUS = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
  round: '50%',
};

/**
 * Typography settings
 */
export const TYPOGRAPHY = {
  fontFamily: {
    default: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    monospace: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  fontSize: {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    hero: 32,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Shadow elevations for depth
 */
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xxl: '0 16px 32px rgba(0, 0, 0, 0.25)',
};

/**
 * Animation durations
 */
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

/**
 * Z-index layers for stacking
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  popover: 1040,
  tooltip: 1050,
};

/**
 * Common demo configuration defaults
 */
export const DEMO_DEFAULTS = {
  cardElevation: 2,
  codeMaxHeight: 600,
  codeTheme: 'dark' as 'dark' | 'light',
  showLineNumbers: true,
  enableCopy: true,
};

/**
 * Badge variants for consistent styling
 */
export const BADGE_VARIANTS = {
  primary: {
    background: COLORS.primary,
    color: COLORS.white,
  },
  success: {
    background: COLORS.success,
    color: COLORS.white,
  },
  warning: {
    background: COLORS.warning,
    color: COLORS.white,
  },
  error: {
    background: COLORS.error,
    color: COLORS.white,
  },
  info: {
    background: COLORS.info,
    color: COLORS.white,
  },
  neutral: {
    background: COLORS.gray80,
    color: COLORS.white,
  },
};

/**
 * Icon names for common actions
 * Based on Fluent UI icon names
 */
export const ICONS = {
  copy: 'Copy',
  check: 'CheckMark',
  download: 'Download',
  expand: 'ChevronDown',
  collapse: 'ChevronUp',
  close: 'Cancel',
  info: 'Info',
  warning: 'Warning',
  error: 'ErrorBadge',
  success: 'CompletedSolid',
  settings: 'Settings',
  code: 'Code',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  refresh: 'Refresh',
};

/**
 * Common messages and text
 */
export const MESSAGES = {
  copySuccess: 'Code copied to clipboard!',
  copyError: 'Failed to copy code',
  loadingData: 'Loading data...',
  noData: 'No data available',
  errorOccurred: 'An error occurred',
  tryAgain: 'Please try again',
};

/**
 * Regular expressions for validation
 */
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  guid: /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/,
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  ANIMATION,
  BREAKPOINTS,
  Z_INDEX,
  DEMO_DEFAULTS,
  BADGE_VARIANTS,
  ICONS,
  MESSAGES,
  REGEX,
};
