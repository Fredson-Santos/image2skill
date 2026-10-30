# {{DISPLAY_NAME}} — Component Catalog & Structural Anatomy

This catalog documents the layout architecture and UI components extracted from the visual reference, ready for use with **HTML + Tailwind CSS**.

> [!IMPORTANT]
> **Brand Neutrality (White-Label):** All components must use copy and data relevant to the user's product, never injecting the skill name or source website branding.

---

## 1. Layout & Grid Architecture (`App Shell`)

- **Primary Structure:** `{{LAYOUT_STRUCTURE}}` (e.g., Fixed `240px` Sidebar + Fluid Main with `max-w-7xl` / Sticky Header + Bento Grid)
- **Content Grid:** `{{GRID_SPEC}}`
- **Padding & Gaps:** `{{PADDING_GAP_SPEC}}`

```html
{{LAYOUT_SHELL_HTML}}
```

---

## 2. Action Buttons & Controls (`Buttons`)

- **Radius:** `{{RADIUS_CONTROLS}}px`
- **Transitions / States:** Hover, Active (`scale-[0.98]`), Focus Ring (`ring-2`)

```html
<!-- Primary Button + Secondary Button + Ghost -->
{{BUTTONS_HTML}}
```

---

## 3. Cards, Panels & Surfaces (`Cards & Containers`)

- **Surface:** `{{COLOR_SURFACE}}` on canvas `{{COLOR_CANVAS}}`
- **Border & Shadow:** `{{BORDER_STYLE}}` | `{{SHADOW_CARD}}`
- **Radius:** `{{RADIUS_CARDS}}px`

```html
{{CARDS_HTML}}
```

---

## 4. Text Inputs, Search & Selectors (`Inputs & Forms`)

```html
{{INPUTS_HTML}}
```

---

## 5. Badges, Pills & Status Indicators (`Badges & Tags`)

```html
{{BADGES_HTML}}
```

---

## 6. Data Components, Lists & Charts (`Data & Lists`)

```html
{{DATA_COMPONENT_HTML}}
```

---

## 7. Iconography System & Extracted SVGs (`Icons & Vectors`)

- **Icon Style:** `{{ICON_STYLE_SPEC}}` (e.g., `1.75px` Outline with `stroke-linecap="round"`, 2x2/3x3 Dot-Matrix, or Duotone)
- **Zero-Unicode Rule:** Never replace icons with text symbols or emojis; always use literal DOM-extracted `<svg>` elements or Lucide Icons.

```html
{{ICONS_CATALOG_HTML}}
```
