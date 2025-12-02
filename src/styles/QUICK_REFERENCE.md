# LifeHub Design System - Quick Reference

## 🎨 Color Tokens Quick Lookup

### Backgrounds
```css
var(--bg)              /* Main background */
var(--bg-secondary)    /* Secondary background */
var(--bg-tertiary)     /* Tertiary background */
var(--surface)         /* Default surface */
var(--surface-elevated) /* Elevated surfaces (modals, dropdowns) */
```

### Text
```css
var(--text-primary)    /* Main text */
var(--text-secondary) /* Secondary text */
var(--text-muted)      /* Muted text */
var(--text-disabled)   /* Disabled text */
var(--text-inverse)    /* Inverse text (white/black) */
```

### Semantic Colors
```css
/* Primary */
var(--primary)         /* Base */
var(--primary-hover)   /* Hover */
var(--primary-active)  /* Active */
var(--primary-light)   /* Light background */
var(--primary-text)    /* Text on primary */

/* Secondary */
var(--secondary)       /* Base */
var(--secondary-hover) /* Hover */
var(--secondary-active) /* Active */
var(--secondary-light) /* Light background */
var(--secondary-text)  /* Text on secondary */

/* Accent */
var(--accent)          /* Base */
var(--accent-hover)    /* Hover */
var(--accent-active)   /* Active */
var(--accent-light)    /* Light background */
var(--accent-text)     /* Text on accent */

/* Success */
var(--success)         /* Base */
var(--success-hover)   /* Hover */
var(--success-active)  /* Active */
var(--success-light)   /* Light background */
var(--success-text)    /* Text on success */

/* Warning */
var(--warning)         /* Base */
var(--warning-hover)   /* Hover */
var(--warning-active)  /* Active */
var(--warning-light)   /* Light background */
var(--warning-text)    /* Text on warning */

/* Error */
var(--error)           /* Base */
var(--error-hover)     /* Hover */
var(--error-active)    /* Active */
var(--error-light)     /* Light background */
var(--error-text)      /* Text on error */
```

### Borders & Dividers
```css
var(--border)          /* Default border */
var(--border-light)    /* Light border */
var(--border-strong)   /* Strong border */
var(--divider)         /* Divider line */
```

### Inputs
```css
var(--input-bg)              /* Background */
var(--input-border)          /* Border */
var(--input-border-focus)    /* Focus border */
var(--input-text)            /* Text */
var(--input-placeholder)     /* Placeholder */
var(--input-disabled-bg)     /* Disabled background */
var(--input-disabled-text)   /* Disabled text */
var(--input-disabled-border) /* Disabled border */
```

### Cards
```css
var(--card-bg)           /* Background */
var(--card-border)       /* Border */
var(--card-shadow)       /* Shadow */
var(--card-shadow-hover) /* Hover shadow */
```

### Sidebar
```css
var(--sidebar-bg)         /* Background */
var(--sidebar-border)    /* Border */
var(--sidebar-hover)      /* Hover */
var(--sidebar-active)    /* Active */
var(--sidebar-text)      /* Text */
var(--sidebar-text-muted) /* Muted text */
```

### Header
```css
var(--header-bg)         /* Background */
var(--header-border)     /* Border */
var(--header-text)       /* Text */
var(--header-text-muted) /* Muted text */
```

### Shadows
```css
var(--shadow-sm)  /* Small shadow */
var(--shadow)    /* Default shadow */
var(--shadow-md) /* Medium shadow */
var(--shadow-lg) /* Large shadow */
var(--shadow-xl) /* Extra large shadow */

/* Dark mode glows */
var(--glow-primary)  /* Primary glow */
var(--glow-accent)   /* Accent glow */
var(--glow-success)  /* Success glow */
```

### Overlays
```css
var(--overlay-light)   /* Light overlay */
var(--overlay-medium)  /* Medium overlay */
var(--overlay-heavy)   /* Heavy overlay */
var(--overlay-modal)   /* Modal overlay */
```

### Glass Effects
```css
var(--glass-bg)        /* Glass background */
var(--glass-border)   /* Glass border */
var(--glass-backdrop) /* Backdrop blur */
```

### Scrollbars
```css
var(--scrollbar-track)        /* Track */
var(--scrollbar-thumb)        /* Thumb */
var(--scrollbar-thumb-hover)  /* Thumb hover */
```

---

## 🚀 Tailwind Classes Quick Reference

### Backgrounds
```jsx
className="bg-bg"
className="bg-bg-secondary"
className="bg-surface"
className="bg-surface-elevated"
className="bg-card-bg"
```

### Text
```jsx
className="text-text-primary"
className="text-text-secondary"
className="text-text-muted"
className="text-text-disabled"
```

### Borders
```jsx
className="border-border"
className="border-border-light"
className="border-border-strong"
className="border-divider"
```

### Buttons
```jsx
className="bg-primary text-primary-text hover:bg-primary-hover"
className="bg-secondary text-secondary-text hover:bg-secondary-hover"
className="bg-accent text-accent-text hover:bg-accent-hover"
className="bg-transparent border border-border hover:bg-surface-hover"
```

### Shadows
```jsx
className="shadow-sm"
className="shadow"
className="shadow-md"
className="shadow-lg"
className="shadow-xl"
className="shadow-glow-primary"  /* Dark mode only */
```

### Inputs
```jsx
className="bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder focus:border-input-border-focus"
```

---

## 📋 Common Patterns

### Card Pattern
```jsx
<div className="bg-card-bg border border-card-border shadow rounded-xl p-6">
  <h3 className="text-text-primary font-semibold mb-2">Title</h3>
  <p className="text-text-secondary">Content</p>
</div>
```

### Button Pattern
```jsx
<button className="bg-primary text-primary-text hover:bg-primary-hover active:bg-primary-active shadow-md hover:shadow-lg rounded-lg px-6 py-3 font-medium transition-all">
  Click me
</button>
```

### Input Pattern
```jsx
<input
  className="w-full bg-input-bg border border-input-border text-input-text placeholder:text-input-placeholder rounded-lg px-4 py-3 focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
/>
```

### Modal Pattern
```jsx
<div className="fixed inset-0 bg-overlay-modal backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-surface-elevated border border-border shadow-xl rounded-2xl p-6 max-w-md w-full">
    {/* Content */}
  </div>
</div>
```

### Dropdown Pattern
```jsx
<div className="relative">
  <button>Trigger</button>
  <div className="absolute top-full right-0 mt-2 bg-surface-elevated border border-border shadow-lg rounded-lg min-w-[12rem] z-50">
    <button className="w-full text-left px-4 py-3 text-text-primary hover:bg-surface-hover">
      Item
    </button>
  </div>
</div>
```

---

## 🎯 Theme Switching

### JavaScript
```javascript
// Enable dark mode
document.documentElement.setAttribute('data-theme', 'dark');
// or
document.documentElement.classList.add('dark');

// Enable light mode
document.documentElement.setAttribute('data-theme', 'light');
// or
document.documentElement.classList.remove('dark');
```

### React Hook Example
```jsx
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

---

## ✅ Pre-Ship Checklist

- [ ] All backgrounds use tokens (no hardcoded colors)
- [ ] All text uses tokens
- [ ] All borders use tokens
- [ ] All shadows use tokens
- [ ] Hover states implemented
- [ ] Focus/active states implemented
- [ ] Disabled states implemented
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Scrollbars styled
- [ ] Images have dark mode handling
- [ ] Accessibility contrast checked
- [ ] Transitions smooth

---

## 🔍 Debugging

### Check if token is applied
```css
/* Add temporarily to see if token is working */
border: 2px solid red !important;
```

### Verify theme is active
```javascript
console.log(document.documentElement.getAttribute('data-theme'));
console.log(document.documentElement.classList.contains('dark'));
```

### Test contrast ratios
Use browser DevTools or online tools like:
- WebAIM Contrast Checker
- Contrast Ratio Calculator

---

## 📚 Full Documentation

- **Complete Token Reference**: See `DESIGN_SYSTEM.md`
- **Component Specifications**: See `COMPONENT_SPEC.md`
- **Example Styles**: See `component-examples.css`

---

**Last Updated**: 2024
**Version**: 1.0.0

