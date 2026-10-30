# Image2Skill — Visual & DOM UI Extraction Protocol

This document defines the hybrid reverse-engineering algorithm (Pixel + Live DOM + Visual Validation) that the agent must follow when given a screenshot, mockup, reference image, or URL of a user interface.

---

## 1. Automated Extraction (Pixel + Live DOM)

### Step 0A: Mathematical Color Extraction via Python Script (Mandatory for Images)
Before estimating any color visually, run the palette extractor on the user-provided image:

```powershell
python .agents/skills/image2skill/scripts/extract_palette.py "<image-path>"
```

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
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   agent-browser open "<URL>"
   agent-browser wait 2000
   ```
2. Extract the **semantic layout tree and interactive elements**:
   ```powershell
   agent-browser snapshot -i
   ```
3. Extract **all `:root` CSS variables, computed font families, grid/layout properties, component styles, and SVG icons** by injecting the skill's DOM extractor via Base64 (`-b`):
   ```powershell
   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content .agents/skills/image2skill/scripts/extract_dom_styles.js -Raw)))
   agent-browser eval -b $b64
   ```
4. If the screenshot shows an internal view or demo account (e.g., an "Explore demo account" button or internal tab), navigate to it using `agent-browser click` and re-run `extract_dom_styles.js`.
5. Close the session when finished: `agent-browser close`.

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

### Step 5: Accents, Semantic Colors & Chart Palette (`--chart-1..5`)
1. **Primary Accent (`--accent-primary`):** Primary action color and its contrasting foreground text (`--accent-primary-fg`).
2. **Data Visualization Palette (`--chart-1` to `--chart-5`):** Colors used in bar/line/donut charts, progress bars, and category breakdowns.
3. **Status (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`):** Semantic colors for positive, warning, and destructive states.

### Step 6: Faithful Iconography & SVG Extraction (Zero-Unicode Rule)
> [!IMPORTANT]
> **NEVER improvise icons using Unicode characters or Emojis** (e.g., NEVER use `☀`, `☾`, `▭`, `🤖`, `⊞`, `△`, `◫`, `✕`, `i`, `⋯` in place of real vector icons).

1. **When a URL / Live Site is available (`agent-browser`):**
   - `scripts/extract_dom_styles.js` returns an `icons` array containing up to 35 objects `{ contexts, dimensions, viewBox, strokeWidth, color, svgHtml }` extracted directly from the live DOM.
   - Copy the **exact literal `svgHtml`** for each button, tab, input, or card into `components.md` and `preview.html`.
2. **When ONLY an Image is available (no accessible URL):**
   - Identify the icon family and stroke style in the screenshot:
     - **Technical Outline (Lucide / Tabler / Feather):** Uniform stroke (`1.5px`, `1.75px`, or `2px`), `stroke-linecap="round"`, `stroke-linejoin="round"`. Use the official **Lucide Icons CDN** (`<script src="https://unpkg.com/lucide@latest"></script>` + `<i data-lucide="icon-name"></i>`) or complete inline `<svg>` vectors.
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

After generating the 5 skill files in Phase 3, **NEVER deliver `preview.html` without validating it in a real browser**:

1. Open the newly generated `preview.html` with `agent-browser`:
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-validate"
   agent-browser open "file:///<absolute-path-to-preview.html>"
   agent-browser wait 1500
   ```
2. Capture a screenshot of the live rendering and run the accessibility/contrast audit:
   ```powershell
   agent-browser screenshot "<temp-path>/preview-check.png"
   agent-browser a11y
   agent-browser close
   ```
3. Visually inspect `preview-check.png` using `read_file` and compare it against the user's original reference image:
   - Do the layout, background colors, borders, fonts, and alignments faithfully match the original screenshot?
   - Is any text lacking contrast, or did any card break the grid?
4. If there is any visual discrepancy or contrast issue, **immediately edit `preview.html` and `tokens.css`** before presenting the final result to the user.
