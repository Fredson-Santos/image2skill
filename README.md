# Image2Skill — Visual & DOM Reverse Engineering Engine

> High-precision visual and structural UI reverse-engineering skill for AI coding agents (Antigravity, Claude Code, Cursor). Transforms screenshots, mockups, and live URLs into **complete Design Systems and standardized Agent Skills** with mathematical accuracy.

---

## 🚀 Overview

Unlike purely subjective vision-only estimation, **Image2Skill** combines **3 deterministic engines**:

1. **Mathematical Pixel Extraction (`scripts/extract_palette.py`):** Analyzes the image via Python (Pillow) to extract exact HEX/RGB codes, color dominance percentages, and real WCAG AA/AAA contrast ratios.
2. **Hybrid URL + Screenshot Mode (`agent-browser` + `scripts/extract_dom_styles.js`):** When a URL or recognizable web app is identified, inspects the live rendered DOM to capture CSS custom properties per theme (light and dark, including tokens inside `@layer` and `@media`), exact font families, grid templates, shadows, border radii, and literal `<svg>` icon vectors (Zero-Unicode Rule).
3. **Self-Healing Visual Validation (`agent-browser`):** Renders the generated `preview.html` in a headless browser in each theme and at mobile width, runs an accessibility (`a11y`) audit, checks focus, interactions, label consistency and white-label text, and compares it against the original reference before completing the task.

---

## 📦 Installation

### Option 1: Via `npx skills`
```bash
npx skills add Fredson-Santos/image2skill
```

### Option 2: Clone directly into your workspace
```bash
git clone https://github.com/Fredson-Santos/image2skill.git .agents/skills/image2skill
```

### Option 3: Global Installation (Antigravity)
```bash
git clone https://github.com/Fredson-Santos/image2skill.git ~/.gemini/config/skills/image2skill
```

---

## 🛠️ Prerequisites

- **Python 3.8+** with `Pillow` installed (`pip install Pillow`) for the mathematical palette extractor (`scripts/extract_palette.py`).
- **`agent-browser`** (optional, recommended for Hybrid URL+Screenshot DOM extraction and self-healing `preview.html` visual validation).
- **bash/zsh or PowerShell:** every command in the skill is documented for both shells, so it works on macOS, Linux, WSL, and Windows.

---

## 📂 Repository Structure

```text
image2skill/
├── SKILL.md                                  # Core agent instructions and 5-phase pipeline
├── scripts/
│   ├── extract_palette.py                    # Mathematical HEX/RGB & WCAG contrast extractor
│   └── extract_dom_styles.js                 # Live DOM CSS :root, typography, grid & SVG extractor
└── resources/
    ├── extraction-protocol.md                # Detailed visual & DOM reverse-engineering protocol
    └── templates/
        ├── skill-template.md                 # Standardized template for generated SKILL.md
        ├── tokens-template.css               # CSS :root variables + Tailwind v4 @theme template
        ├── tailwind-template.js              # Tailwind v3 theme extension template
        ├── components-template.md            # HTML + Tailwind component catalog template
        └── preview-template.html             # Interactive UI replica + live styleguide template
```

---

## ⚡ Usage

Provide a screenshot, mockup, or URL in your agent chat and ask:

- *"Create a skill based on this screenshot"*
- *"Turn this image into a design system"*
- *"Run image2skill on this image / site"*

### What gets generated for each new skill:
Every execution of `image2skill` automatically scaffolds a new skill inside `.agents/skills/<skill-name>/` containing 5 complete artifacts:
1. `SKILL.md` — Visual architecture documentation, token tables, contrast ratios, White-Label rules, and *Do's & Don'ts*.
2. `resources/tokens.css` — Complete `:root` CSS variables + Tailwind v4 `@theme` configuration.
3. `resources/tailwind.config.js` — Ready-to-use Tailwind v3 theme extension.
4. `resources/components.md` — Production-ready HTML + Tailwind snippets faithful to the reference UI.
5. `resources/templates/preview.html` — Self-contained interactive showcase featuring both a full UI replica and a live design system matrix.
