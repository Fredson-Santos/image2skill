---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# {{DISPLAY_NAME}} — Style Reference & Design System

> {{TAGLINE}}

**Base Theme:** {{THEME_TYPE}} (`{{COLOR_CANVAS}}`)  
**Visual Archetype:** {{STYLE_ARCHETYPE}}  
**Surface Stack:** Canvas `{{COLOR_CANVAS}}` | Card `{{COLOR_SURFACE}}` | Elevated `{{COLOR_SURFACE_ELEVATED}}`  
**Primary Accent:** `{{ACCENT_PRIMARY}}` (Contrast Foreground: `{{ACCENT_PRIMARY_FG}}`)  
**Geometric Signature:** Controls `{{RADIUS_CONTROLS}}px`, Cards `{{RADIUS_CARDS}}px`, Borders `{{BORDER_STYLE}}`

---

## 1. Surface, Color & Contrast Tokens

Mathematically extracted from the reference pixels and computed styles:

| Token Name | Hex / RGB Value | Contrast vs Canvas | UI Role / Function |
| :--- | :--- | :--- | :--- |
{{COLOR_TOKENS_TABLE}}

### 1.1 Semantic & Data Visualization Palette (Charts)
- **Chart / Data 1:** `{{CHART_1}}`
- **Chart / Data 2:** `{{CHART_2}}`
- **Chart / Data 3:** `{{CHART_3}}`
- **Chart / Data 4:** `{{CHART_4}}`
- **Status (Success / Warning / Danger):** `{{STATUS_SUCCESS}}` / `{{STATUS_WARNING}}` / `{{STATUS_DANGER}}`

---

## 2. Typography & Fluid Scale

- **Sans Family:** `{{FONT_SANS}}`
- **Mono Family:** `{{FONT_MONO}}`
- **Display Family:** `{{FONT_DISPLAY}}`
- **Tracking Guideline:** Display headings use `{{TRACKING_DISPLAY}}`, body text uses `{{TRACKING_BODY}}`, and monospace labels use `{{TRACKING_MONO}}`.

### Type Scale
| Role | Size | Weight | Line-Height | Tracking | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
{{TYPE_SCALE_TABLE}}

---

## 3. Layout Architecture, Grid, Shadows & Shapes

- **Layout Structure (`App Shell`):** {{LAYOUT_STRUCTURE}}
- **Grid System & Density:** {{GRID_SPEC}} (Base unit: `{{SPACING_BASE}}px`)
- **Control Radius (Buttons/Inputs):** `{{RADIUS_CONTROLS}}px`
- **Card & Container Radius:** `{{RADIUS_CARDS}}px`
- **Structural Borders:** `{{BORDER_STYLE}}`
- **Elevation / Shadow System:** `{{SHADOW_CARD}}`

---

## 4. Core Components & Micro-interactions

See [`resources/components.md`](./resources/components.md) for full HTML + Tailwind CSS implementations of all extracted components:
{{COMPONENTS_SUMMARY_LIST}}

---

## 5. Implementation Guidelines & Brand Neutrality (Non-Negotiable Rule)

> [!IMPORTANT]
> **Interface Brand Neutrality (White-Label):**
> When building interfaces with this skill, **NEVER inject references to the skill name or the source website/library** in titles, logos, badges, kickers, placeholders, or footers unless explicitly requested by the user. Generated interfaces must be 100% tailored to the user's product or use clean white-label branding.

### Do:
- [x] Keep the generated interface 100% white-label and contextualized to the user's domain, without self-referencing the skill.
{{DOS_LIST}}

### Don't:
- [ ] NEVER add the skill name or reference website name in copy, status badges, logos, or headers without explicit user instruction.
{{DONTS_LIST}}

---

## 6. Skill Files & Resources
- [`resources/tokens.css`](./resources/tokens.css): Complete CSS custom properties and Tailwind v4 `@theme`.
- [`resources/tailwind.config.js`](./resources/tailwind.config.js): Tailwind v3 configuration.
- [`resources/components.md`](./resources/components.md): Ready-to-use layout and component catalog.
- [`resources/templates/preview.html`](./resources/templates/preview.html): Faithful UI replica and visually validated showcase.
