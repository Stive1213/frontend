/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg': 'var(--bg)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        
        // Surface colors
        'surface': 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-hover': 'var(--surface-hover)',
        'surface-active': 'var(--surface-active)',
        
        // Sidebar
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-hover': 'var(--sidebar-hover)',
        'sidebar-active': 'var(--sidebar-active)',
        'sidebar-text': 'var(--sidebar-text)',
        'sidebar-text-muted': 'var(--sidebar-text-muted)',
        
        // Header
        'header-bg': 'var(--header-bg)',
        'header-border': 'var(--header-border)',
        'header-text': 'var(--header-text)',
        'header-text-muted': 'var(--header-text-muted)',
        
        // Card
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        
        // Input
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'input-border-focus': 'var(--input-border-focus)',
        'input-text': 'var(--input-text)',
        'input-placeholder': 'var(--input-placeholder)',
        'input-disabled-bg': 'var(--input-disabled-bg)',
        'input-disabled-text': 'var(--input-disabled-text)',
        'input-disabled-border': 'var(--input-disabled-border)',
        
        // Borders
        'border': 'var(--border)',
        'border-light': 'var(--border-light)',
        'border-strong': 'var(--border-strong)',
        'divider': 'var(--divider)',
        
        // Primary
        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-active': 'var(--primary-active)',
        'primary-light': 'var(--primary-light)',
        'primary-text': 'var(--primary-text)',
        
        // Secondary
        'secondary': 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        'secondary-active': 'var(--secondary-active)',
        'secondary-light': 'var(--secondary-light)',
        'secondary-text': 'var(--secondary-text)',
        
        // Accent
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-active': 'var(--accent-active)',
        'accent-light': 'var(--accent-light)',
        'accent-text': 'var(--accent-text)',
        
        // Success
        'success': 'var(--success)',
        'success-hover': 'var(--success-hover)',
        'success-active': 'var(--success-active)',
        'success-light': 'var(--success-light)',
        'success-text': 'var(--success-text)',
        
        // Warning
        'warning': 'var(--warning)',
        'warning-hover': 'var(--warning-hover)',
        'warning-active': 'var(--warning-active)',
        'warning-light': 'var(--warning-light)',
        'warning-text': 'var(--warning-text)',
        
        // Error
        'error': 'var(--error)',
        'error-hover': 'var(--error-hover)',
        'error-active': 'var(--error-active)',
        'error-light': 'var(--error-light)',
        'error-text': 'var(--error-text)',
        
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',
        'text-inverse': 'var(--text-inverse)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        'glow-primary': 'var(--glow-primary)',
        'glow-accent': 'var(--glow-accent)',
        'glow-success': 'var(--glow-success)',
      },
      backgroundColor: {
        'overlay-light': 'var(--overlay-light)',
        'overlay-medium': 'var(--overlay-medium)',
        'overlay-heavy': 'var(--overlay-heavy)',
        'overlay-modal': 'var(--overlay-modal)',
        'glass': 'var(--glass-bg)',
      },
      borderColor: {
        'glass': 'var(--glass-border)',
      },
      backdropBlur: {
        'glass': 'var(--glass-backdrop)',
      },
    },
  },
  plugins: [],
}

