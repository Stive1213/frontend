# LifeHub Component Specification Guide

## Figma-Style Component Application Guide

This document provides detailed specifications for applying design tokens to all LifeHub components, ensuring nothing is left light by accident when implementing dark mode.

---

## 1. Sidebar Component

### Structure
```
Sidebar Container
├── Background: var(--sidebar-bg)
├── Border: 1px solid var(--sidebar-border)
└── Content
    ├── Profile Section
    │   ├── Background: transparent
    │   ├── Text: var(--sidebar-text)
    │   └── Muted Text: var(--sidebar-text-muted)
    └── Navigation Items
        ├── Default: transparent bg, var(--sidebar-text)
        ├── Hover: var(--sidebar-hover)
        └── Active: var(--sidebar-active), var(--primary) text
```

### Implementation
```jsx
<div className="sidebar bg-sidebar-bg border-r border-sidebar-border">
  <div className="text-sidebar-text">
    <p className="text-sidebar-text-muted">Muted content</p>
  </div>
  <nav>
    <div className="sidebar-item hover:bg-sidebar-hover">
      Default item
    </div>
    <div className="sidebar-item bg-sidebar-active text-primary">
      Active item
    </div>
  </nav>
</div>
```

### Checklist
- [ ] Background uses `--sidebar-bg`
- [ ] Border uses `--sidebar-border`
- [ ] Text uses `--sidebar-text`
- [ ] Muted text uses `--sidebar-text-muted`
- [ ] Hover state uses `--sidebar-hover`
- [ ] Active state uses `--sidebar-active` and `--primary`
- [ ] Scrollbar styled with `--scrollbar-*` tokens

---

## 2. Topbar/Header Component

### Structure
```
Header Container
├── Background: var(--header-bg)
├── Border: 1px solid var(--header-border)
├── Shadow: var(--shadow-sm)
└── Content
    ├── Logo/Title: var(--header-text)
    ├── Actions: var(--header-text)
    └── Muted Elements: var(--header-text-muted)
```

### Implementation
```jsx
<nav className="bg-header-bg border-b border-header-border shadow-sm">
  <h1 className="text-header-text">LifeHub</h1>
  <span className="text-header-text-muted">Subtitle</span>
</nav>
```

### Checklist
- [ ] Background uses `--header-bg`
- [ ] Border uses `--header-border`
- [ ] Shadow uses `--shadow-sm`
- [ ] Text uses `--header-text`
- [ ] Muted text uses `--header-text-muted`
- [ ] Icons inherit text color or use semantic colors

---

## 3. Content Card Component

### Structure
```
Card Container
├── Background: var(--card-bg)
├── Border: 1px solid var(--card-border)
├── Shadow: var(--shadow)
├── Border Radius: 0.75rem
└── Content
    ├── Header: border-bottom var(--divider)
    ├── Body: var(--text-primary)
    └── Footer: border-top var(--divider)
```

### Implementation
```jsx
<div className="card bg-card-bg border border-card-border shadow rounded-xl p-6">
  <div className="card-header border-b border-divider pb-4 mb-4">
    <h3 className="text-text-primary">Card Title</h3>
  </div>
  <div className="card-body text-text-primary">
    Content here
  </div>
  <div className="card-footer border-t border-divider pt-4 mt-4">
    Footer content
  </div>
</div>
```

### Hover State
```jsx
<div className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
```

### Checklist
- [ ] Background uses `--card-bg`
- [ ] Border uses `--card-border`
- [ ] Shadow uses `--shadow` (hover: `--card-shadow-hover`)
- [ ] Text uses `--text-primary` or `--text-secondary`
- [ ] Dividers use `--divider`
- [ ] Transitions are smooth

---

## 4. Input Fields

### Structure
```
Input Container
├── Background: var(--input-bg)
├── Border: 1px solid var(--input-border)
├── Text: var(--input-text)
├── Placeholder: var(--input-placeholder)
└── States
    ├── Focus: border var(--input-border-focus), ring
    ├── Disabled: var(--input-disabled-*)
    ├── Error: border var(--error)
    └── Success: border var(--success)
```

### Implementation

**Normal Input:**
```jsx
<input
  className="input bg-input-bg border border-input-border text-input-text placeholder:text-input-placeholder rounded-lg px-4 py-3 focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
/>
```

**Disabled Input:**
```jsx
<input
  disabled
  className="input bg-input-disabled-bg border-input-disabled-border text-input-disabled-text cursor-not-allowed opacity-60"
/>
```

**Error Input:**
```jsx
<input
  className="input border-error focus:ring-error/10"
/>
```

**Success Input:**
```jsx
<input
  className="input border-success focus:ring-success/10"
/>
```

### Checklist
- [ ] Background uses `--input-bg`
- [ ] Border uses `--input-border`
- [ ] Text uses `--input-text`
- [ ] Placeholder uses `--input-placeholder`
- [ ] Focus uses `--input-border-focus` with ring
- [ ] Disabled uses `--input-disabled-*` tokens
- [ ] Error/Success states use semantic colors

---

## 5. Buttons

### Structure
```
Button Container
├── Primary: var(--primary) bg, var(--primary-text)
├── Secondary: var(--secondary) bg, var(--secondary-text)
├── Ghost: transparent bg, var(--border) border
└── States
    ├── Hover: darker variant, shadow
    ├── Active: darkest variant
    └── Disabled: opacity 0.5
```

### Implementation

**Primary Button:**
```jsx
<button className="btn-primary bg-primary text-primary-text hover:bg-primary-hover active:bg-primary-active shadow-md hover:shadow-lg rounded-lg px-6 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
  Primary Button
</button>
```

**Secondary Button:**
```jsx
<button className="btn-secondary bg-secondary text-secondary-text hover:bg-secondary-hover active:bg-secondary-active shadow-md hover:shadow-lg rounded-lg px-6 py-3 font-medium transition-all">
  Secondary Button
</button>
```

**Ghost Button:**
```jsx
<button className="btn-ghost bg-transparent text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong active:bg-surface-active rounded-lg px-6 py-3 font-medium transition-all">
  Ghost Button
</button>
```

**Accent Button:**
```jsx
<button className="bg-accent text-accent-text hover:bg-accent-hover active:bg-accent-active shadow-md hover:shadow-lg rounded-lg px-6 py-3 font-medium transition-all">
  Accent Button
</button>
```

### Checklist
- [ ] Background uses semantic color tokens
- [ ] Text uses corresponding `-text` token
- [ ] Hover uses `-hover` variant
- [ ] Active uses `-active` variant
- [ ] Shadow applied on hover
- [ ] Disabled state has opacity and cursor change

---

## 6. Modal/Dialog

### Structure
```
Modal Overlay
├── Background: var(--overlay-modal)
├── Backdrop Filter: blur(4px)
└── Modal Container
    ├── Background: var(--surface-elevated)
    ├── Border: 1px solid var(--border)
    ├── Shadow: var(--shadow-xl)
    └── Content
        ├── Header: border-bottom var(--divider)
        ├── Body: var(--text-primary)
        └── Footer: border-top var(--divider)
```

### Implementation
```jsx
<div className="modal-overlay fixed inset-0 bg-overlay-modal backdrop-blur-sm flex items-center justify-center z-50">
  <div className="modal bg-surface-elevated border border-border shadow-xl rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    <div className="modal-header border-b border-divider p-6">
      <h2 className="text-text-primary text-xl font-semibold">Modal Title</h2>
    </div>
    <div className="modal-body p-6 text-text-primary">
      Modal content
    </div>
    <div className="modal-footer border-t border-divider p-6 flex gap-3 justify-end">
      <button className="btn-ghost">Cancel</button>
      <button className="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Checklist
- [ ] Overlay uses `--overlay-modal`
- [ ] Backdrop blur applied
- [ ] Modal uses `--surface-elevated`
- [ ] Border uses `--border`
- [ ] Shadow uses `--shadow-xl`
- [ ] Dividers use `--divider`
- [ ] Scrollbar styled if content overflows

---

## 7. Dropdown Menu

### Structure
```
Dropdown Container
└── Dropdown Menu
    ├── Background: var(--surface-elevated)
    ├── Border: 1px solid var(--border)
    ├── Shadow: var(--shadow-lg)
    └── Items
        ├── Default: var(--text-primary)
        ├── Hover: var(--surface-hover)
        └── Divider: var(--divider)
```

### Implementation
```jsx
<div className="dropdown relative">
  <button className="trigger">Open Menu</button>
  <div className="dropdown-menu absolute top-full right-0 mt-2 bg-surface-elevated border border-border shadow-lg rounded-lg min-w-[12rem] z-50">
    <button className="dropdown-item w-full text-left px-4 py-3 text-text-primary hover:bg-surface-hover transition-colors">
      Item 1
    </button>
    <div className="h-px bg-divider my-1"></div>
    <button className="dropdown-item w-full text-left px-4 py-3 text-text-primary hover:bg-surface-hover transition-colors">
      Item 2
    </button>
  </div>
</div>
```

### Checklist
- [ ] Background uses `--surface-elevated`
- [ ] Border uses `--border`
- [ ] Shadow uses `--shadow-lg`
- [ ] Items use `--text-primary`
- [ ] Hover uses `--surface-hover`
- [ ] Dividers use `--divider`

---

## 8. Tables

### Structure
```
Table Container
├── Background: transparent
└── Table
    ├── Header
    │   ├── Background: var(--bg-secondary)
    │   ├── Border: 2px solid var(--border)
    │   └── Text: var(--text-primary)
    └── Body
        ├── Rows: var(--text-primary)
        ├── Borders: 1px solid var(--divider)
        └── Hover: var(--surface-hover)
```

### Implementation
```jsx
<table className="table w-full text-text-primary">
  <thead className="bg-bg-secondary border-b-2 border-border">
    <tr>
      <th className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide">Column 1</th>
      <th className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-surface-hover transition-colors">
      <td className="px-4 py-3 border-b border-divider">Data 1</td>
      <td className="px-4 py-3 border-b border-divider">Data 2</td>
    </tr>
  </tbody>
</table>
```

### Checklist
- [ ] Header uses `--bg-secondary`
- [ ] Header border uses `--border`
- [ ] Text uses `--text-primary`
- [ ] Row borders use `--divider`
- [ ] Hover uses `--surface-hover`
- [ ] Last row has no bottom border

---

## 9. Badges

### Structure
```
Badge Container
├── Primary: var(--primary-light) bg, var(--primary) text
├── Success: var(--success-light) bg, var(--success) text
├── Warning: var(--warning-light) bg, var(--warning) text
├── Error: var(--error-light) bg, var(--error) text
└── Accent: var(--accent-light) bg, var(--accent) text
```

### Implementation
```jsx
<span className="badge-primary inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
  Primary Badge
</span>

<span className="badge-success inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-light text-success">
  Success Badge
</span>

<span className="badge-warning inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-light text-warning">
  Warning Badge
</span>

<span className="badge-error inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-error-light text-error">
  Error Badge
</span>
```

### Checklist
- [ ] Background uses `-light` variant
- [ ] Text uses base semantic color
- [ ] Rounded corners (full)
- [ ] Appropriate padding

---

## 10. Tooltips

### Structure
```
Tooltip Container
└── Tooltip Content
    ├── Background: var(--surface-elevated)
    ├── Border: 1px solid var(--border)
    ├── Shadow: var(--shadow-lg)
    └── Text: var(--text-primary)
```

### Implementation
```jsx
<div className="tooltip relative group">
  <button>Hover me</button>
  <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-elevated border border-border shadow-lg rounded-md text-sm text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
    Tooltip text
  </div>
</div>
```

### Checklist
- [ ] Background uses `--surface-elevated`
- [ ] Border uses `--border`
- [ ] Shadow uses `--shadow-lg`
- [ ] Text uses `--text-primary`
- [ ] Proper z-index for visibility

---

## 11. Scrollbars

### Structure
```
Scrollbar Container
├── Track: var(--scrollbar-track)
└── Thumb
    ├── Default: var(--scrollbar-thumb)
    └── Hover: var(--scrollbar-thumb-hover)
```

### Implementation
```jsx
<div className="custom-scrollbar overflow-y-auto">
  {/* Content */}
</div>
```

**CSS (already in design-tokens.css):**
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

### Checklist
- [ ] Track uses `--scrollbar-track`
- [ ] Thumb uses `--scrollbar-thumb`
- [ ] Hover uses `--scrollbar-thumb-hover`
- [ ] Applied to all scrollable containers

---

## 12. Charts

### Structure
```
Chart Container
├── Background: var(--card-bg)
├── Border: 1px solid var(--card-border)
├── Shadow: var(--shadow)
└── Content
    ├── Title: var(--text-primary)
    └── Chart: (library-specific, ensure text uses tokens)
```

### Implementation
```jsx
<div className="chart-container bg-card-bg border border-card-border shadow rounded-xl p-6">
  <h3 className="chart-title text-text-primary font-semibold mb-4">Chart Title</h3>
  {/* Chart component - ensure chart library uses CSS variables for colors */}
</div>
```

### Checklist
- [ ] Container uses `--card-bg` and `--card-border`
- [ ] Title uses `--text-primary`
- [ ] Chart library configured to use tokens
- [ ] Grid lines use `--divider` or `--border-light`
- [ ] Legend text uses `--text-primary` or `--text-secondary`

---

## 13. Footer

### Structure
```
Footer Container
├── Background: var(--bg-secondary)
├── Border: 1px solid var(--border)
└── Text: var(--text-secondary) or var(--text-muted)
```

### Implementation
```jsx
<footer className="footer bg-bg-secondary border-t border-border text-text-secondary py-8 px-6">
  <p className="text-text-muted text-sm">© 2024 LifeHub. All rights reserved.</p>
</footer>
```

### Checklist
- [ ] Background uses `--bg-secondary`
- [ ] Border uses `--border`
- [ ] Text uses `--text-secondary` or `--text-muted`

---

## 14. Images in Dark Mode

### Structure
```
Image Container
└── Overlay (dark mode only)
    └── Background: var(--image-overlay)
```

### Implementation
```jsx
<div className="image-dark-safe relative">
  <img src="image.jpg" alt="Description" className="w-full h-auto rounded-lg" />
</div>
```

**CSS (already in design-tokens.css):**
```css
.image-dark-safe::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--image-overlay);
  pointer-events: none;
  border-radius: inherit;
}
```

### Alternative: CSS Filter
```css
[data-theme="dark"] img,
.dark img {
  filter: brightness(0.9) contrast(1.1);
}
```

### Checklist
- [ ] Overlay applied in dark mode
- [ ] Or filter applied to images
- [ ] Images don't break dark mode visually

---

## 15. Glass/Frosted Panels

### Structure
```
Glass Container
├── Background: var(--glass-bg)
├── Backdrop Filter: var(--glass-backdrop)
└── Border: 1px solid var(--glass-border)
```

### Implementation
```jsx
<div className="glass bg-glass backdrop-blur-glass border border-glass rounded-xl p-6">
  Frosted glass content
</div>
```

### Checklist
- [ ] Background uses `--glass-bg`
- [ ] Backdrop filter uses `--glass-backdrop`
- [ ] Border uses `--glass-border`
- [ ] Works in both light and dark mode

---

## Global Checklist

Before shipping any component, verify:

- [ ] All backgrounds use design tokens (never hardcoded colors)
- [ ] All text uses design tokens
- [ ] All borders use design tokens
- [ ] All shadows use design tokens
- [ ] Hover states implemented
- [ ] Active/focus states implemented
- [ ] Disabled states implemented
- [ ] Tested in both light and dark mode
- [ ] Scrollbars styled (if scrollable)
- [ ] Images have dark mode handling
- [ ] Transitions are smooth
- [ ] Accessibility contrast ratios met
- [ ] No hardcoded colors remain

---

## Quick Reference: Token Naming Convention

- **Backgrounds**: `--bg`, `--bg-secondary`, `--surface`, `--surface-elevated`
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled`
- **Borders**: `--border`, `--border-light`, `--border-strong`, `--divider`
- **Colors**: `--primary`, `--secondary`, `--accent`, `--success`, `--warning`, `--error`
- **States**: `-hover`, `-active`, `-light` suffixes
- **Shadows**: `--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **Overlays**: `--overlay-light`, `--overlay-medium`, `--overlay-heavy`, `--overlay-modal`

---

## Implementation Priority

1. **Critical**: Backgrounds, text, borders, buttons, inputs
2. **High**: Cards, modals, dropdowns, tables
3. **Medium**: Badges, tooltips, scrollbars, charts
4. **Low**: Glass effects, image overlays, advanced animations

---

This specification ensures complete dark mode coverage across all LifeHub components.

