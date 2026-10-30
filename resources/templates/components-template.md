# {{DISPLAY_NAME}} — Component Catalog & Structural Anatomy

This catalog documents the layout architecture and UI components extracted from the visual reference, ready for use with **HTML + Tailwind CSS**.

> [!IMPORTANT]
> **Brand Neutrality (White-Label):** All components must use copy and data relevant to the user's product, never injecting the skill name or source website branding.

> [!IMPORTANT]
> **Baseline rules for every snippet below:**
> - Visible keyboard focus on every interactive element (`focus-visible` outline using `--border-focus`). Never use `outline-none` without a replacement.
> - Real controls only: `<button>`, `<input type="checkbox">`, `role="switch"` / `role="tab"` with `aria-checked` / `aria-selected` kept in sync by JS. No decorative `<span>` toggles.
> - Tinted backgrounds from tokens use `color-mix(in srgb, var(--token) 10%, transparent)`, not `bg-token/10` (opacity modifiers do not work on `var()` colors in Tailwind v3).
> - Decorative SVGs get `aria-hidden="true"`; icon-only buttons get an `aria-label`.

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

## 7. Theme Switching (only if the reference has two themes)

Tokens switch on `data-theme="dark"` on `<html>`. Apply the saved or system theme in `<head>` before first paint to avoid a flash, then toggle with:

```html
<button type="button" data-theme-toggle role="switch" aria-checked="false" aria-label="Dark mode"
  class="h-8 px-2.5 inline-flex items-center gap-2 rounded-full bg-surface-muted border border-border-default text-xs font-medium">
  <!-- icon -->
</button>
<script>
  document.querySelector('[data-theme-toggle]').addEventListener('click', function (e) {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    root.classList.toggle('dark', next === 'dark');
    e.currentTarget.setAttribute('aria-checked', String(next === 'dark'));
    try { localStorage.setItem('theme', next); } catch (err) {}
  });
</script>
```

---

## 8. Iconography System & Extracted SVGs (`Icons & Vectors`)

- **Icon Style:** `{{ICON_STYLE_SPEC}}` (e.g., `1.75px` Outline with `stroke-linecap="round"`, 2x2/3x3 Dot-Matrix, or Duotone)
- **Zero-Unicode Rule:** Never replace icons with text symbols or emojis; always use literal DOM-extracted `<svg>` elements or Lucide Icons.

```html
{{ICONS_CATALOG_HTML}}
```
