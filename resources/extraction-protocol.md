# Image2Skill — Visual & DOM UI Extraction Protocol

This document defines the hybrid reverse-engineering algorithm (Pixel + Live DOM + Visual Validation) that the agent must follow when given a screenshot, mockup, reference image, or URL of a user interface.

---

## 1. Automated Extraction (Pixel + Live DOM)

### Step 0A: Mathematical Color Extraction via Python Script (Mandatory for Images)
Before estimating any color visually, run the palette extractor on the user-provided image:

```bash
python3 <skill-dir>/scripts/extract_palette.py "<image-path>"     # bash/zsh (PowerShell: python ...)
```

`<skill-dir>` is the folder containing the image2skill `SKILL.md`. If the reference has two themes, run the extractor once per theme image.

- Use the **exact HEX codes** returned under `Dominant Colors` to map `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--border-subtle`, and `--text-primary`.
- Use the codes under `Accent & Chart Candidates` to map `--accent-primary`, `--accent-secondary`, and `--chart-1..5`.
- Validate the `contrast vs canvas` column to ensure WCAG readability.

### Step 0B: URL / Website Detection & Live Layout/Component Extraction via `agent-browser`
Inspect both the image and the user's prompt for **any clue of a URL or web domain**:
- Visible address bar in the screenshot (e.g., `app.site.com`, `localhost:3000`, `*.vercel.app`, `*.sslip.io`, etc.);
- URL explicitly provided in the user's text prompt;
- Clearly identifiable public product or web app with an accessible URL.

**Whenever a URL or live site is identified:**
1. Open the target URL in an isolated `agent-browser` session:
   ```bash
   export AGENT_BROWSER_SESSION=image2skill-extract     # PowerShell: $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   agent-browser open "<URL>"
   agent-browser wait 2000
   ```
2. Extract the **semantic layout tree and interactive elements**:
   ```bash
   agent-browser snapshot -i
   ```
3. Extract **CSS variables per theme context, computed font families, grid/layout properties, component styles, and SVG icons** by piping the skill's DOM extractor to `eval --stdin`:
   ```bash
   agent-browser eval --stdin < <skill-dir>/scripts/extract_dom_styles.js
   ```
   ```powershell
   Get-Content <skill-dir>/scripts/extract_dom_styles.js -Raw | agent-browser eval --stdin
   ```
   - `cssVariables` is keyed by context (`:root`, `.dark`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark) :root`, `@layer base :root`, …). Values come from the CSS rules themselves, so light and dark values are both available. Map each theme from its own context.
   - `stylesheetReport.skippedCrossOrigin` lists stylesheets that could not be read (no CORS). Tokens defined there are missing; recover them from computed styles and the image.
   - To read computed values of the other theme, toggle it on the page (click the site's theme switch, or re-open in a new session with `AGENT_BROWSER_COLOR_SCHEME=dark`) and run the extractor again.
4. If the screenshot shows an internal view or demo account (e.g., an "Explore demo account" button or internal tab), navigate to it using `agent-browser click` and re-run `extract_dom_styles.js`.
5. Close the session when finished: `agent-browser close`.

### Step 0C: Theme Inventory
Before mapping tokens, decide whether the reference has **one theme or two**. With two themes, every color and elevation token needs a light and a dark value; the dark values go into `{{DARK_THEME_BLOCK}}` of `tokens.css`. Overriding only surfaces is a defect.

---

## 2. Visual & Structural Decomposition Steps

### Step 1: Aesthetic Archetype Classification
Identify which primary archetype best describes the interface:
- **Dark Precision / Technical:** Deep dark canvas (`#08090a` to `#151515`), translucent `1px` hairline borders, tight heading tracking, and monospace metadata labels.
- **Neo-Brutalist / Pop Technical:** Warm cream/oatmeal or vibrant canvas, solid `2px–3px` black borders, hard offset drop shadows without blur (`4px 4px 0px #111`), tilted stickers/badges.
- **Editorial Minimal / Workspace:** Pure white or warm paper canvas (`#ffffff` / `#f7f7f5`), high-contrast typography (Sans or Serif), subtle dividers, and soft pastel tags.
- **Motion-First / Soft Modern:** Generous border radii (`16px–24px`), `rounded-full` pills, tactile layered surfaces (`#151515` → `#1c1c1c` → `#262626`), and smooth micro-interactions.
- **Glassmorphic / Ambient Gradient:** Translucent surfaces with `backdrop-filter: blur(16px)`, specular borders, and subtle radial glows.

### Step 2: Layout & Grid Architecture (`App Shell`)
Extract the macro geometry of the viewport:
1. **Navigation:** Fixed left sidebar (what width? e.g., `240px` or `64px` compact rail), sticky horizontal topbar, or floating dock/pill?
2. **Main Grid:** How many columns make up the workspace? (e.g., 4 top KPI cards + asymmetric 2-column `2fr 1fr` grid below + full-width table).
3. **Density (Paddings & Gaps):** Internal card padding (`16px`, `20px`, `24px`) and spacing between blocks (`gap-3`, `gap-4`, `gap-6`).

### Step 3: Surfaces, Borders & Elevation System
1. **Surface Stack:**
   - `--bg-canvas`: Root application background.
   - `--bg-surface`: Cards, table rows, and panels.
   - `--bg-surface-elevated`: Modals, popovers, drawers, side assistants.
   - `--bg-surface-muted`: Secondary backgrounds, table headers, switch/tab rails.
2. **Borders & Shadows:**
   - Translucent hairline (`rgba(255,255,255,0.08)`), solid (`1px solid #e5e7eb`), or thick (`2px solid #111`)?
   - Soft ambient shadow, hard offset shadow, or purely chromatic elevation (no shadow)?

### Step 4: Typography Hierarchy & Scale
1. **Font Families:** Primary Sans, technical Mono (for `tabular-nums`, code, dates, financial amounts), and Display (if present).
2. **Weights, Sizes & Tracking:** Extract exact values (from live DOM or visual inspection) for Display/H1, H2, H3, Body, and Overline/Mono.

### Step 5: Accents, Semantic Colors, Focus & Chart Palette (`--chart-1..5`)
1. **Primary Accent (`--accent-primary`):** Primary action color and its contrasting foreground text (`--accent-primary-fg`).
2. **Data Visualization Palette (`--chart-1` to `--chart-5`):** Colors used in bar/line/donut charts, progress bars, and category breakdowns.
3. **Status (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`):** Semantic colors for positive, warning, destructive, and informational states.
4. **Focus ring (`--border-focus`):** Must reach at least 3:1 contrast against the canvas in every theme (WCAG 1.4.11). If the reference's ring is lighter, darken it and note the change.

### Step 6: Faithful Iconography & SVG Extraction (Zero-Unicode Rule)
> [!IMPORTANT]
> **NEVER improvise icons using Unicode characters or Emojis** (e.g., NEVER use `☀`, `☾`, `▭`, `🤖`, `⊞`, `△`, `◫`, `✕`, `i`, `⋯` in place of real vector icons).

1. **When a URL / Live Site is available (`agent-browser`):**
   - `scripts/extract_dom_styles.js` returns an `icons` array containing up to 35 objects `{ contexts, dimensions, viewBox, strokeWidth, color, svgHtml }` extracted directly from the live DOM.
   - Copy the **exact literal `svgHtml`** for each button, tab, input, or card into `components.md` and `preview.html`.
2. **When ONLY an Image is available (no accessible URL):**
   - Identify the icon family and stroke style in the screenshot:
     - **Technical Outline (Lucide / Tabler / Feather):** Uniform stroke (`1.5px`, `1.75px`, or `2px`), `stroke-linecap="round"`, `stroke-linejoin="round"`. Use the **Lucide** script pinned in the preview template (`<i data-lucide="icon-name"></i>`; never switch it to `@latest`) or complete inline `<svg>` vectors.
     - **Dot-Matrix / Pixel / Custom:** Build the inline `<svg>` with `<circle>` or `<rect>` elements at the exact matrix coordinates (e.g., 2x2 or 3x3 dot grid).
     - **Solid / Duotone:** Use `<svg fill="currentColor">` with secondary opacity layers.

### Step 7: Complete Component Anatomy
Faithfully reconstruct every component visible in the reference (including real SVGs):
- App Shell (Sidebar / Header / Main Grid)
- Buttons (Primary, Secondary, Ghost, Icon Button)
- KPI / Metric Cards & Containers
- Interactive Tables / Lists with Hover States
- Inputs, Search Bars (`cmd+k` / `/`), Selects, and Switches
- Badges, Category Pills, and Trend Indicators
- Modals or Side Assistants (if present)

---

## 3. Self-Healing Visual Validation Loop (`preview.html`)

After generating the 5 skill files in Phase 3, **NEVER deliver `preview.html` without validating it in a real browser**, once per theme and once at mobile width:

1. Open the generated `preview.html` (one session per theme):
   ```bash
   export AGENT_BROWSER_SESSION=image2skill-validate-dark   # PowerShell: $env:AGENT_BROWSER_SESSION = "..."
   export AGENT_BROWSER_COLOR_SCHEME=dark                   # light | dark
   agent-browser open "file://<absolute-path-to-preview.html>"
   agent-browser wait 1500
   ```
2. Capture the rendering, the mobile layout, and run the accessibility audit:
   ```bash
   agent-browser screenshot --full "<temp-dir>/preview-dark.png"
   agent-browser set viewport 375 812
   agent-browser screenshot --full "<temp-dir>/preview-dark-mobile.png"
   agent-browser a11y --tags wcag2a,wcag2aa
   ```
3. Exercise the interactions: press `Tab` a few times (`agent-browser press Tab`) and screenshot to confirm a visible focus outline; click every tab, toggle, and theme switch shown in the replica and screenshot after each. Then `agent-browser close`.
4. Inspect the screenshots against the user's original reference:
   - Do layout, background colors, borders, fonts, and alignment match the reference in each theme?
   - Does any text lack contrast, or did any card break the grid? Any horizontal scroll at 375px?
   - Does every behavior named in visible text actually work? Do counts and labels match what is rendered?
   - Does every swatch use a real token name from `tokens.css` and render `var(--token)`?
   - Is the visible text free of the skill name, the source site, and source library names?
5. If anything fails, **edit `preview.html` and `tokens.css` immediately and re-validate** before presenting the result.
