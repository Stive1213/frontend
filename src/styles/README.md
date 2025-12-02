# LifeHub Design System

Welcome to the LifeHub Design System! This directory contains all the design tokens, component styles, and documentation needed to build a pixel-perfect, fully dark-mode compatible UI.

## 📁 File Structure

```
styles/
├── design-tokens.css      # All CSS custom properties (tokens) for light & dark mode
├── component-examples.css  # Example component styles using tokens
├── DESIGN_SYSTEM.md        # Complete token reference with HEX/RGBA values
├── COMPONENT_SPEC.md       # Figma-style component specifications
├── QUICK_REFERENCE.md      # Quick lookup guide for common patterns
└── README.md              # This file
```

## 🚀 Getting Started

### 1. Import the Design System

The design system is already imported in `src/index.css`. If you need to import it manually:

```css
@import "./styles/design-tokens.css";
@import "./styles/component-examples.css";
```

### 2. Apply Theme

The design system supports two ways to enable dark mode:

**Option A: Data Attribute**
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

**Option B: CSS Class**
```javascript
document.documentElement.classList.add('dark');
```

### 3. Use Tokens in Your Components

**CSS:**
```css
.my-component {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

**Tailwind (with config):**
```jsx
<div className="bg-card-bg text-text-primary border border-border">
  Content
</div>
```

## 📖 Documentation Guide

### For Quick Lookups
→ **QUICK_REFERENCE.md** - Fast token lookup and common patterns

### For Complete Reference
→ **DESIGN_SYSTEM.md** - Full token tables, contrast ratios, accessibility info

### For Component Implementation
→ **COMPONENT_SPEC.md** - Detailed specs for every component type

### For Example Code
→ **component-examples.css** - Copy-paste ready component styles

## 🎨 Key Features

✅ **Complete Light & Dark Mode** - Every token has both variants  
✅ **Full Coverage** - Backgrounds, surfaces, text, borders, shadows, overlays, scrollbars  
✅ **Accessibility** - WCAG AA/AAA contrast ratios verified  
✅ **Glass Effects** - Frosted glass panels with backdrop blur  
✅ **Image Safety** - Dark mode overlays for images  
✅ **Smooth Transitions** - Automatic theme switching animations  
✅ **Tailwind Ready** - Pre-configured Tailwind classes  

## 🎯 Design Tokens Overview

### Core Tokens
- **Backgrounds**: `--bg`, `--bg-secondary`, `--surface`, `--surface-elevated`
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled`
- **Borders**: `--border`, `--border-light`, `--border-strong`, `--divider`
- **Semantic Colors**: `--primary`, `--secondary`, `--accent`, `--success`, `--warning`, `--error`
- **Shadows**: `--shadow-sm` through `--shadow-xl`, plus dark mode glows
- **Overlays**: `--overlay-light` through `--overlay-modal`
- **Component-Specific**: Sidebar, header, card, input tokens

### Token Naming Convention
- Base tokens: `--primary`, `--success`, etc.
- State variants: `--primary-hover`, `--primary-active`
- Light variants: `--primary-light` (for badges, backgrounds)
- Text variants: `--primary-text` (for text on colored backgrounds)

## 🔧 Usage Examples

### Sidebar
```jsx
<div className="bg-sidebar-bg border-r border-sidebar-border">
  <nav>
    <div className="text-sidebar-text hover:bg-sidebar-hover">
      Item
    </div>
  </nav>
</div>
```

### Card
```jsx
<div className="bg-card-bg border border-card-border shadow rounded-xl p-6">
  <h3 className="text-text-primary">Title</h3>
  <p className="text-text-secondary">Content</p>
</div>
```

### Button
```jsx
<button className="bg-primary text-primary-text hover:bg-primary-hover shadow-md rounded-lg px-6 py-3">
  Click me
</button>
```

### Input
```jsx
<input
  className="bg-input-bg border border-input-border text-input-text placeholder:text-input-placeholder focus:border-input-border-focus rounded-lg px-4 py-3"
/>
```

### Modal
```jsx
<div className="fixed inset-0 bg-overlay-modal backdrop-blur-sm">
  <div className="bg-surface-elevated border border-border shadow-xl rounded-2xl">
    Content
  </div>
</div>
```

## ✅ Pre-Implementation Checklist

Before implementing any component:

- [ ] Read the relevant section in `COMPONENT_SPEC.md`
- [ ] Check `QUICK_REFERENCE.md` for token names
- [ ] Verify all colors use tokens (no hardcoded values)
- [ ] Test in both light and dark mode
- [ ] Check accessibility contrast ratios
- [ ] Ensure hover/active/focus states are implemented
- [ ] Style scrollbars if component is scrollable
- [ ] Apply image overlays if using images

## 🐛 Troubleshooting

### Tokens not working?
1. Check that `design-tokens.css` is imported
2. Verify theme attribute/class is set correctly
3. Check browser DevTools to see if CSS variables are defined

### Colors look wrong?
1. Ensure you're using tokens, not hardcoded colors
2. Check if theme is correctly applied
3. Verify token names are spelled correctly

### Dark mode not working?
1. Check `data-theme="dark"` or `.dark` class on root element
2. Verify `[data-theme="dark"]` selector in CSS
3. Check browser DevTools computed styles

## 📚 Additional Resources

- **Tailwind Config**: `../tailwind.config.js` - Token mappings for Tailwind
- **Main CSS**: `../index.css` - Global styles and theme setup
- **Component Examples**: `component-examples.css` - Ready-to-use styles

## 🎓 Best Practices

1. **Always use tokens** - Never hardcode colors
2. **Test both modes** - Always verify light and dark mode
3. **Follow specs** - Use `COMPONENT_SPEC.md` as your guide
4. **Check accessibility** - Verify contrast ratios
5. **Use semantic colors** - Prefer `--primary` over `--accent` for main actions
6. **Consistent spacing** - Use Tailwind spacing scale
7. **Smooth transitions** - Leverage built-in transitions
8. **Image safety** - Apply overlays or filters in dark mode

## 🔄 Updating the Design System

When adding new tokens:

1. Add to `design-tokens.css` in both `:root` and `[data-theme="dark"]`
2. Update `tailwind.config.js` if needed
3. Document in `DESIGN_SYSTEM.md`
4. Add examples to `component-examples.css` if applicable
5. Update `QUICK_REFERENCE.md` for quick access

## 📞 Support

For questions or issues:
1. Check the documentation files in this directory
2. Review `COMPONENT_SPEC.md` for component-specific guidance
3. Consult `QUICK_REFERENCE.md` for common patterns

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained by**: LifeHub Design Team

