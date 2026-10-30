---
name: image2skill
description: >-
  Visual & Structural UI Reverse Engineering Engine (Image-to-Skill, URL+Screenshot-to-Skill & Screenshot-to-Design-System). Use ONLY when the user provides a UI reference — a screenshot, mockup, or URL of an interface — AND asks to turn it into a skill or design system ("create a skill from this screenshot", "extract the design system from this site", "replicate this UI as a skill", "criar uma skill a partir desta imagem/tela", "image2skill"). Do not use for generic skill authoring with no UI reference. Combines pixel extraction (Python), live DOM/CSS/Layout/SVG inspection via agent-browser (when a URL is present), and a self-healing visual validation loop for preview.html.
---

# Image2Skill — Visual & DOM Reverse Engineering Engine

**Image2Skill** transforms UI screenshots, mockups, and reference websites into **complete Design Systems and standardized AI Agent Skills**.

Unlike purely subjective visual estimation, Image2Skill combines **3 deterministic engines**:
1. **Mathematical Pixel Extraction (`scripts/extract_palette.py`):** Extracts exact HEX/RGB codes, color dominance, and WCAG contrast ratios directly from the image pixels.
2. **Hybrid URL + Screenshot Mode (`agent-browser` + `scripts/extract_dom_styles.js`):** Whenever the image or prompt contains a URL, domain, or recognizable web app, inspects the live rendered DOM to extract CSS variables **per theme** (light/dark, including tokens inside `@layer` and `@media`), exact font families, layout/grid architecture, component anatomy, and literal `<svg>` icon vectors.
3. **Self-Healing Visual Validation (`agent-browser`):** Renders the generated `preview.html` in a real headless browser in both themes and at mobile width, runs an accessibility audit, and compares it against the original reference before delivery.

> **Paths:** `<skill-dir>` below means the folder that contains this `SKILL.md` (for example `.claude/skills/image2skill`, `.agents/skills/image2skill`, or a global skills folder, depending on the agent). Resolve it once and use it in every command. Commands are given for **bash/zsh** (macOS, Linux, WSL) and **PowerShell** (Windows); use the one matching the shell you have.

---

## 🎯 Activation Triggers

Activate this workflow only when **both** are true:
- The user sends or references a screenshot, mockup, or URL of an app, dashboard, website, or landing page; **and**
- They ask to turn it into a skill, a design system, or a replicated UI style, e.g.:
  - *"Create a skill based on this screenshot"*
  - *"Turn this image into a design system"*
  - *"Replicate the style of this UI into a skill"*
  - *"Run image2skill on this image / site"*

A request to "create a skill" with no UI reference is **not** a trigger.

---

## 🛠️ Execution Pipeline (5 Phases)

Consult the full technical specification in [`resources/extraction-protocol.md`](./resources/extraction-protocol.md) and strictly execute the 5 phases below. Read **Known Pitfalls** at the end before writing any file.

### Phase 1: Hybrid Extraction (Pixels + Live DOM + Visual Decomposition)

1. **Exact Color Extraction (Python):**
   ```bash
   python3 <skill-dir>/scripts/extract_palette.py "<image-path>"          # bash/zsh
   ```
   ```powershell
   python <skill-dir>/scripts/extract_palette.py "<image-path>"           # PowerShell
   ```
   If the reference shows two themes (two screenshots, or a light and dark half), run it once per theme image.

2. **Live Layout, CSS & Component Extraction (`agent-browser` Hybrid Mode):**
   Check if the user provided a URL **or** if the screenshot displays a URL in the address bar, domain name, or recognizable public web app. If so:
   ```bash
   # bash/zsh
   export AGENT_BROWSER_SESSION=image2skill-extract
   agent-browser open "<detected-URL>"
   agent-browser wait 2000
   agent-browser snapshot -i
   agent-browser eval --stdin < <skill-dir>/scripts/extract_dom_styles.js
   agent-browser close
   ```
   ```powershell
   # PowerShell
   $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   agent-browser open "<detected-URL>"
   agent-browser wait 2000
   agent-browser snapshot -i
   Get-Content <skill-dir>/scripts/extract_dom_styles.js -Raw | agent-browser eval --stdin
   agent-browser close
   ```
   - `cssVariables` is grouped by context (for example `:root`, `.dark`, `@media (prefers-color-scheme: dark) :root`, `@layer base :root`). Map the light theme from the base context and the dark theme from the dark context. Do **not** assume one value per token.
   - Check `stylesheetReport.skippedCrossOrigin`: tokens in those files were not readable. Fill that gap from the computed styles in `layout`/`components` and from the image.
   - Use `typography`, `layout`, `components`, and the **`icons` array (literal `svgHtml`)** for exact fonts, radii, shadows, grids, and icons.

3. **Aesthetic, Iconographic & Architectural Decomposition:**
   Combine the extracted data with visual inspection of the image to map:
   - **Visual Archetype:** Dark Precision, Neo-Brutalist, Editorial Minimal, Motion-First, or Glassmorphic.
   - **Themes:** single theme, or two themes (record every token for both).
   - **Surface Stack:** `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--bg-surface-muted`, `--bg-surface-hover`.
   - **Borders & Elevation:** Hairline (`1px` translucent), solid, or neo-brutalist (`2px+` with hard offset shadow); elevation tokens `--elevation-sm`, `--elevation-card`, `--elevation-elevated`.
   - **Fluid Typography & Tracking:** Sans, Mono, and Display families (`--font-family-*`); heading tracking (`--tracking-display`) and technical label tracking (`--tracking-mono`).
   - **Accents, Status & Chart Palette:** `--accent-primary`, `--accent-secondary`, `--status-success|warning|danger|info`, and `--chart-1` through `--chart-5`.
   - **Focus ring:** `--border-focus` with at least 3:1 contrast against the canvas in every theme.
   - **Faithful Iconography (Zero-Unicode Rule):**
     - **NEVER** replace icons with emojis or Unicode symbols (`☀`, `☾`, `▭`, `🤖`, `⊞`, `✕`, `i`).
     - If extracted from the DOM, embed the **literal `svgHtml`** for each icon.
     - If the input is an image without a URL, use the pinned **Lucide** script already in the preview template, or craft complete inline `<svg>` vectors matching the exact `viewBox`, `stroke-width`, and style (outline, solid, or dot-matrix).
   - **Layout & Components:** App Shell structure (Sidebar/Header/Main Grid) and all visible UI components.

---

### Phase 2: Defining the New Skill Name & Scope
Choose a descriptive `kebab-case` name for the new skill based on the analyzed aesthetic or reference:
- Examples: `linear-midnight-ui`, `conekta-fintech-ui`, `raycast-dark-ui`, `stripe-editorial-ui`.

---

### Phase 3: Standardized Generation of the 5 Skill Files

Create the skill directory next to this one (`<skills-root>/<skill-name>/`) using the **5 official templates** in `resources/templates/`, leaving zero unreplaced `{{...}}` placeholders. Generate them **in this order**, because later files copy from earlier ones:

1. **`resources/tokens.css`** (from [`tokens-template.css`](./resources/templates/tokens-template.css)) — the single source of truth for values.
   - Complete `:root` variables + Tailwind v4 `@theme` block.
   - `{{DARK_THEME_BLOCK}}`: a full override block (`.dark, [data-theme="dark"] { ... }`) overriding **every** color and elevation token when the design has two themes; otherwise a one-line comment.

2. **`resources/tailwind.config.js`** (from [`tailwind-template.js`](./resources/templates/tailwind-template.js)) — Tailwind v3 mapping of the same tokens.

3. **`resources/components.md`** (from [`components-template.md`](./resources/templates/components-template.md)) — HTML + Tailwind snippets for the App Shell, Buttons, Cards, Inputs, Badges, Data/Charts, Theme Switching (if two themes) and SVG Icons, following its baseline rules.

4. **`resources/templates/preview.html`** (from [`preview-template.html`](./resources/templates/preview-template.html)):
   - Paste `tokens.css` (without `@theme`) into `{{TOKENS_CSS_WITHOUT_THEME_BLOCK}}` and the config object into `{{TAILWIND_CONFIG_OBJECT}}`. **Never retype token values by hand.**
   - **Section 1 (`#interface-replica`):** faithful, interactive replica of the reference (white-label).
   - **Section 2 (`#styleguide-showcase`):** swatches that render `var(--real-token)` with the token's real name and `light / dark` values; typography specimens; isolated components.
   - `{{INTERACTIONS_JS}}`: the code for every behavior the visible text promises (see the template's BEHAVIOR CONTRACT).

5. **`SKILL.md`** (from [`skill-template.md`](./resources/templates/skill-template.md)), written last so its tables match the files above:
   - Valid YAML frontmatter with `name` and a `description` with key tokens and activation triggers.
   - Token tables with contrast ratios, chart palette, typographic scale, layout, component catalog, and *Do's & Don'ts*.
   - **Non-Negotiable White-Label Rule (Brand Neutrality).**

---

### Phase 4: Self-Healing Visual Validation Loop (`preview.html`)

Before finishing, render `preview.html` in a real browser, **once per theme and once at mobile width**:

```bash
# bash/zsh — repeat with AGENT_BROWSER_COLOR_SCHEME=dark (in a new session) when the design has two themes
export AGENT_BROWSER_SESSION=image2skill-validate-light
export AGENT_BROWSER_COLOR_SCHEME=light
agent-browser open "file://<absolute-path>/resources/templates/preview.html"
agent-browser wait 1500
agent-browser screenshot --full "<temp-dir>/preview-light.png"
agent-browser set viewport 375 812
agent-browser screenshot --full "<temp-dir>/preview-mobile.png"
agent-browser a11y --tags wcag2a,wcag2aa
agent-browser close
```
```powershell
# PowerShell — same steps
$env:AGENT_BROWSER_SESSION = "image2skill-validate-light"
$env:AGENT_BROWSER_COLOR_SCHEME = "light"
agent-browser open "file:///<absolute-path>/resources/templates/preview.html"
agent-browser wait 1500
agent-browser screenshot --full "<temp-dir>/preview-light.png"
agent-browser set viewport 375 812
agent-browser screenshot --full "<temp-dir>/preview-mobile.png"
agent-browser a11y --tags wcag2a,wcag2aa
agent-browser close
```

Then check, and fix `preview.html` / `tokens.css` and re-validate if anything fails:
1. **Fidelity:** layout, surfaces, borders, fonts, and alignment match the reference in each theme.
2. **Accessibility:** no `a11y` violations; contrast holds in both themes.
3. **Focus:** `agent-browser press Tab` a few times and screenshot — the focused element must have a visible outline.
4. **Behavior contract:** every behavior named in visible text works (click the tabs, toggles, theme switch; screenshot after each). Remove any text describing behavior that is not implemented.
5. **Consistency:** counts and labels match what is rendered ("03 tasks" ⇒ 3 items; "Last 6 months" ⇒ 6 bars); every swatch name exists in `tokens.css`.
6. **White-label:** search the visible text for the skill name, the source site, and source library names (e.g. "shadcn", "BeUI", "Linear"); remove them.
7. **Mobile:** no horizontal scroll and no overlapping header items at 375px.

---

### Phase 5: Presenting Results to the User

Present a concise, structured summary containing:
1. **Extracted Palette & Tokens:** Table with exact HEX/RGB values (light / dark), contrast ratios, and UI roles.
2. **Layout & Style Architecture:** Visual archetype, grid system, typography, and mapped components.
3. **Visual Validation:** The validation screenshots from Phase 4 and any issue that remains.
4. **Clickable Links (`file://`):** Direct links to all 5 generated files.

---

## ⚠️ Known Pitfalls (read before generating)

| Pitfall | Why it breaks | Do this instead |
| :--- | :--- | :--- |
| `bg-status-info/10`, `border-accent/20` with `var()` colors in Tailwind v3 | v3 cannot add alpha to `var(--x)`; the class silently does nothing | `.tone` helper with `color-mix(in srgb, var(--token) 10%, transparent)` |
| `outline-none` on inputs/buttons | Keyboard users lose all focus indication | Keep the template's `:focus-visible` rule; `--border-focus` ≥ 3:1 |
| Decorative `<span>` checkboxes/switches | Not operable, invisible to assistive tech | `<input type="checkbox">`, `<button role="switch" aria-checked>` |
| Text promising behavior ("spring", "drag", "live", stiffness values) with no JS | The preview lies about the system | Implement it in `{{INTERACTIONS_JS}}` or delete the text |
| Swatch with hardcoded hex or invented token name | Styleguide drifts from the real tokens | `style="background: var(--real-token)"` + real name |
| `@theme { --font-sans: var(--font-sans) }` (same name on both sides) | Self-referencing variable ⇒ invalid at computed time | Primitives are `--font-family-*` / `--elevation-*`; `@theme` maps to them |
| Only surfaces overridden in dark mode | Accents, status, charts, and shadows keep light values | Override every color and elevation token in `{{DARK_THEME_BLOCK}}` |
| Second theme only reachable by clicking (no persistence) | Theme resets on reload, flashes on load | Template's head script + `localStorage` |
| Source library names in visible text | Violates White-Label rule | Phase 4 check 6 |
| `lucide@latest` | Icon names change between majors and break the page | Keep the pinned version from the template |

---

## 📚 Embedded Scripts, Protocols & Templates

- [`scripts/extract_palette.py`](./scripts/extract_palette.py): HEX/RGB palette and WCAG contrast extractor powered by Pillow (full resolution up to 4 MP).
- [`scripts/extract_dom_styles.js`](./scripts/extract_dom_styles.js): CSS variables per theme context (recursing into `@layer`/`@media`/`@supports`), layout/grid, typography, components, and SVG icons, via `agent-browser eval --stdin`.
- [`resources/extraction-protocol.md`](./resources/extraction-protocol.md): Complete visual and DOM reverse-engineering protocol.
- [`resources/templates/skill-template.md`](./resources/templates/skill-template.md): Template for `SKILL.md`.
- [`resources/templates/tokens-template.css`](./resources/templates/tokens-template.css): Template for `resources/tokens.css`.
- [`resources/templates/tailwind-template.js`](./resources/templates/tailwind-template.js): Template for `resources/tailwind.config.js`.
- [`resources/templates/components-template.md`](./resources/templates/components-template.md): Template for `resources/components.md`.
- [`resources/templates/preview-template.html`](./resources/templates/preview-template.html): Template for `resources/templates/preview.html`.
