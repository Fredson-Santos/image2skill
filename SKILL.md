---
name: image2skill
description: >-
  Visual & Structural UI Reverse Engineering Engine (Image-to-Skill, URL+Screenshot-to-Skill & Screenshot-to-Design-System). Activate this skill whenever the user provides an image, screenshot, mockup, or URL of a UI and asks to "create a skill", "replicate this design", "extract a design system", "turn this screenshot into a skill", "criar uma skill", or triggers "image2skill". Combines mathematical pixel extraction (Python), live DOM/CSS/Layout/SVG inspection via agent-browser (when a URL or recognizable site is present), and a self-healing visual validation loop for preview.html.
---

# Image2Skill — Visual & DOM Reverse Engineering Engine

**Image2Skill** transforms UI screenshots, mockups, and reference websites into **complete Design Systems and standardized AI Agent Skills**.

Unlike purely subjective visual estimation, Image2Skill combines **3 deterministic engines**:
1. **Mathematical Pixel Extraction (`scripts/extract_palette.py`):** Extracts exact HEX/RGB codes, color dominance, and WCAG contrast ratios directly from the image pixels.
2. **Hybrid URL + Screenshot Mode (`agent-browser` + `scripts/extract_dom_styles.js`):** Whenever the image or prompt contains a URL, domain, or recognizable web app, inspects the live rendered DOM to extract `:root` CSS variables, exact font families, layout/grid architecture, component anatomy, and literal `<svg>` icon vectors.
3. **Self-Healing Visual Validation (`agent-browser`):** Renders the generated `preview.html` in a real headless browser, runs an accessibility (`a11y`) audit, captures a validation screenshot, and compares it against the original reference before delivery.

---

## 🎯 Activation Triggers

Activate this workflow whenever the user:
- Sends or references a screenshot, mockup, or URL of an app, dashboard, website, or landing page.
- Uses phrases such as:
  - *"Create a skill based on this screenshot"*
  - *"Turn this image into a design system"*
  - *"Replicate the style of this UI into a skill"*
  - *"Run image2skill on this image / site"*

---

## 🛠️ Execution Pipeline (5 Phases)

Consult the full technical specification in [`resources/extraction-protocol.md`](./resources/extraction-protocol.md) and strictly execute the 5 phases below:

### Phase 1: Hybrid Extraction (Pixels + Live DOM + Visual Decomposition)

1. **Exact Color Extraction (Python):**
   Run the palette extractor script on the provided image to obtain exact HEX values and WCAG contrast ratios:
   ```powershell
   python .agents/skills/image2skill/scripts/extract_palette.py "<image-path>"
   ```

2. **Live Layout, CSS & Component Extraction (`agent-browser` Hybrid Mode):**
   Check if the user provided a URL **or** if the screenshot displays a URL in the address bar, domain name, or recognizable public web app. If so:
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content .agents/skills/image2skill/scripts/extract_dom_styles.js -Raw)))
   agent-browser open "<detected-URL>"
   agent-browser wait 2000
   agent-browser snapshot -i
   agent-browser eval -b $b64
   agent-browser close
   ```
   - Use the output from `snapshot -i` and `extract_dom_styles.js` to capture **100% accuracy** on `:root` CSS variables, `fontFamily`, `fontSize`, `letterSpacing`, `borderRadius`, `boxShadow`, `gridTemplateColumns`, `gap`, component anatomy, and the **`icons` array containing the exact `svgHtml` of all `<svg>` icons on the page**.

3. **Aesthetic, Iconographic & Architectural Decomposition:**
   Combine the extracted data with visual inspection of the image to map:
   - **Visual Archetype:** Dark Precision, Neo-Brutalist, Editorial Minimal, Motion-First, or Glassmorphic.
   - **Surface Stack:** `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--bg-surface-muted`, `--bg-surface-hover`.
   - **Borders & Elevation:** Hairline (`1px` translucent), solid, or neo-brutalist (`2px+` with hard offset shadow); shadows `--shadow-sm`, `--shadow-card`, `--shadow-elevated`.
   - **Fluid Typography & Tracking:** Sans, Mono, and Display font families; heading tracking (`--tracking-display`) and technical label tracking (`--tracking-mono`).
   - **Accents, Status & Chart Palette:** `--accent-primary`, `--accent-secondary`, `--status-*`, and `--chart-1` through `--chart-5`.
   - **Faithful Iconography (Zero-Unicode Rule):**
     - **NEVER** replace icons with emojis or Unicode symbols (`☀`, `☾`, `▭`, `🤖`, `⊞`, `✕`, `i`).
     - If extracted from the DOM via `extract_dom_styles.js`, embed the **literal `svgHtml`** for each icon.
     - If the input is an image without a URL, use the **Lucide Icons CDN** (`https://unpkg.com/lucide@latest`) or craft complete inline `<svg>` vectors matching the exact `viewBox`, `stroke-width`, and style (outline, solid, or dot-matrix).
   - **Layout & Components:** App Shell structure (Sidebar/Header/Main Grid) and all visible UI components.

---

### Phase 2: Defining the New Skill Name & Scope
Choose a descriptive `kebab-case` name for the new skill based on the analyzed aesthetic or reference:
- Examples: `linear-midnight-ui`, `conekta-fintech-ui`, `raycast-dark-ui`, `stripe-editorial-ui`.

---

### Phase 3: Standardized Generation of the 5 Skill Files

Create the skill directory at `.agents/skills/<skill-name>/` using the **5 official templates** in `resources/templates/`, leaving zero unreplaced `{{...}}` placeholders:

1. **`SKILL.md`** (based on [`resources/templates/skill-template.md`](./resources/templates/skill-template.md)):
   - Valid YAML frontmatter with `name` and a comprehensive `description` (including key tokens and activation triggers).
   - Complete color token tables (with contrast ratios), chart palette (`--chart-1..5`), typographic scale, layout/grid architecture, component catalog, and *Do's & Don'ts*.
   - **Non-Negotiable White-Label Rule (Brand Neutrality):** Explicitly instruct agents never to inject the skill name or source website branding into generated interfaces unless requested by the user.

2. **`resources/tokens.css`** (based on [`resources/templates/tokens-template.css`](./resources/templates/tokens-template.css)):
   - Complete `:root` CSS variables (Surfaces, Borders, Text, Accents, Status, Charts `--chart-1..5`, Fluid Typography `clamp()`, Radii, and Shadows) + Tailwind v4 `@theme` block.

3. **`resources/tailwind.config.js`** (based on [`resources/templates/tailwind-template.js`](./resources/templates/tailwind-template.js)):
   - Complete `theme.extend` mapping for Tailwind v3.

4. **`resources/components.md`** (based on [`resources/templates/components-template.md`](./resources/templates/components-template.md)):
   - Ready-to-use HTML + Tailwind snippets for the App Shell (Layout/Grid), Buttons, Cards, Inputs, Badges, Tables/Charts, and SVG Icons.

5. **`resources/templates/preview.html`** (based on [`resources/templates/preview-template.html`](./resources/templates/preview-template.html)):
   - Self-contained HTML page featuring:
     - **Section 1 (`#interface-replica`):** Faithful, interactive replica of the original screenshot UI (using clean white-label branding).
     - **Section 2 (`#styleguide-showcase`):** Visual matrix with color token swatches, typography specimens, and isolated components.

---

### Phase 4: Self-Healing Visual Validation Loop (`preview.html`)

Before finishing, validate the real browser rendering of `preview.html` using `agent-browser`:

```powershell
$env:AGENT_BROWSER_SESSION = "image2skill-validate"
agent-browser open "file:///<absolute-path>/resources/templates/preview.html"
agent-browser wait 1500
agent-browser screenshot "<temp-path>/preview-validation.png"
agent-browser a11y
agent-browser close
```

1. Inspect `preview-validation.png` using `read_file` and compare it side-by-side with the original reference image.
2. Check whether `agent-browser a11y` reports any contrast or structural issues.
3. If you spot any misalignment, broken grids, or color drift from the reference, update `preview.html` and `tokens.css` and re-validate.

---

### Phase 5: Presenting Results to the User

Present a concise, structured summary containing:
1. **Extracted Palette & Tokens:** Table with exact HEX/RGB values, contrast ratios, and UI roles.
2. **Layout & Style Architecture:** Summary of the visual archetype, grid system, typography, and mapped components.
3. **Visual Validation:** Display or reference the validated screenshot of `preview.html` from Phase 4.
4. **Clickable Links (`file:///`):** Direct links to all 5 generated files (`SKILL.md`, `tokens.css`, `tailwind.config.js`, `components.md`, `preview.html`).

---

## 📚 Embedded Scripts, Protocols & Templates

- [`scripts/extract_palette.py`](./scripts/extract_palette.py): Mathematical HEX/RGB palette and WCAG contrast extractor powered by Pillow.
- [`scripts/extract_dom_styles.js`](./scripts/extract_dom_styles.js): Live `:root` CSS variables, layout/grid, typography, component, and SVG icon extractor via `agent-browser eval`.
- [`resources/extraction-protocol.md`](./resources/extraction-protocol.md): Complete visual and DOM reverse-engineering protocol.
- [`resources/templates/skill-template.md`](./resources/templates/skill-template.md): Template for `SKILL.md`.
- [`resources/templates/tokens-template.css`](./resources/templates/tokens-template.css): Enriched template for `resources/tokens.css`.
- [`resources/templates/tailwind-template.js`](./resources/templates/tailwind-template.js): Template for `resources/tailwind.config.js`.
- [`resources/templates/components-template.md`](./resources/templates/components-template.md): Template for `resources/components.md`.
- [`resources/templates/preview-template.html`](./resources/templates/preview-template.html): Template for `resources/templates/preview.html`.
