/**
 * Image2Skill — Live DOM Design System, Layout, Component & Exact SVG Icon Extractor
 * Executed via `agent-browser eval -b <base64>` when a URL or live site is identified.
 * Extracts:
 *  1. Native CSS custom properties (:root / .dark variables)
 *  2. Exact typography (fontFamily, fontSize, fontWeight, letterSpacing, lineHeight)
 *  3. Layout & Grid architecture (sidebar, header, main, grids, gaps, paddings)
 *  4. Real Component anatomy (Buttons, Cards, Inputs, Badges, Tables)
 *  5. Exact SVG Icon catalog (clean outerHTML, viewBox, strokeWidth, parent button/context)
 */
(() => {
  const rgbToHex = (rgbStr) => {
    if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') return null;
    const m = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return rgbStr;
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return a < 1 ? `${hex} (alpha: ${a})` : hex;
  };

  // 1. Extract CSS custom properties, keeping each theme separate.
  //    - Values are read from the rule itself (not getComputedStyle), so light and dark
  //      values do not collapse into whatever theme happens to be active.
  //    - Grouping rules (@media, @layer, @supports, @container) are walked recursively,
  //      because Tailwind v4 / shadcn put their tokens inside @layer and @media blocks.
  const THEME_SELECTOR = /(^|[\s,(])(:root|html|body|\.dark|\.light|\[data-theme[^\]]*\]|\[data-mode[^\]]*\]|\[class[^\]]*dark[^\]]*\])/;
  const MAX_VARS_PER_CONTEXT = 300;
  const cssVariables = {}; // { "<at-rule context> <selector>": { "--token": "value" } }
  const stylesheetReport = { read: 0, skippedCrossOrigin: [] };

  const walkRules = (rules, context) => {
    for (const rule of Array.from(rules || [])) {
      if (rule.cssRules && !rule.selectorText) {
        // Grouping rule: @media, @supports, @layer, @container...
        let label = '';
        if (rule.media) label = `@media ${rule.media.mediaText}`;
        else if (rule.conditionText !== undefined) label = `@${rule.constructor.name.replace(/^CSS|Rule$/g, '').toLowerCase()} ${rule.conditionText}`;
        else if (rule.name !== undefined) label = `@layer ${rule.name}`;
        walkRules(rule.cssRules, label ? `${context}${context ? ' ' : ''}${label}` : context);
        continue;
      }
      if (!rule.selectorText || !rule.style || !THEME_SELECTOR.test(rule.selectorText)) continue;
      const key = `${context}${context ? ' ' : ''}${rule.selectorText}`.trim();
      for (const prop of Array.from(rule.style)) {
        if (!prop.startsWith('--')) continue;
        cssVariables[key] = cssVariables[key] || {};
        if (Object.keys(cssVariables[key]).length >= MAX_VARS_PER_CONTEXT) break;
        cssVariables[key][prop] = rule.style.getPropertyValue(prop).trim();
      }
      // Nested CSS rules (native CSS nesting)
      if (rule.cssRules && rule.cssRules.length) walkRules(rule.cssRules, key);
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walkRules(sheet.cssRules, '');
      stylesheetReport.read += 1;
    } catch (_) {
      // Cross-origin stylesheet without CORS: report it instead of failing silently.
      stylesheetReport.skippedCrossOrigin.push(sheet.href || '(inline)');
    }
  }

  const activeTheme = {
    htmlClass: document.documentElement.className,
    dataTheme: document.documentElement.getAttribute('data-theme'),
    prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  };

  const extractStyle = (el) => {
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      className: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
      dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      display: cs.display,
      gridTemplateColumns: cs.display.includes('grid') ? cs.gridTemplateColumns : undefined,
      gap: cs.gap !== 'normal' ? cs.gap : undefined,
      padding: cs.padding,
      backgroundColor: rgbToHex(cs.backgroundColor),
      color: rgbToHex(cs.color),
      border: cs.borderWidth !== '0px' ? `${cs.borderWidth} ${cs.borderStyle} ${rgbToHex(cs.borderColor)}` : 'none',
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
      backdropFilter: cs.backdropFilter !== 'none' ? cs.backdropFilter : undefined,
      fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
    };
  };

  const pickFirstVisible = (selectors) => {
    for (const sel of selectors) {
      const els = Array.from(document.querySelectorAll(sel));
      const found = els.find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 10 && r.height > 10;
      });
      if (found) return extractStyle(found);
    }
    return null;
  };

  // 2. Layout & Container Structure
  const layout = {
    body: extractStyle(document.body),
    header: pickFirstVisible(['header', '[role="banner"]', 'nav']),
    sidebar: pickFirstVisible(['aside', '[class*="sidebar"]', 'nav[aria-label]']),
    main: pickFirstVisible(['main', '[role="main"]', '[class*="container"]']),
    gridContainer: pickFirstVisible(['[class*="grid"]', 'main > div']),
  };

  // 3. Computed Typographic Scale
  const typography = {
    h1: pickFirstVisible(['h1']),
    h2: pickFirstVisible(['h2']),
    h3: pickFirstVisible(['h3']),
    body: pickFirstVisible(['p', 'main div']),
    monoOrCode: pickFirstVisible(['code', 'pre', '[class*="mono"]']),
  };

  // 4. Real Component Anatomy
  const components = {
    primaryButton: pickFirstVisible([
      'button[class*="primary"]',
      'a[class*="primary"]',
      'button[type="submit"]',
      'main button',
      'button',
    ]),
    secondaryButton: pickFirstVisible([
      'button[class*="secondary"]',
      'button[class*="outline"]',
      'button[class*="ghost"]',
    ]),
    card: pickFirstVisible([
      '[class*="card"]',
      'article',
      'section > div > div',
    ]),
    input: pickFirstVisible([
      'input[type="text"]',
      'input[type="search"]',
      'input[type="email"]',
      'input',
      'textarea',
    ]),
    badge: pickFirstVisible([
      '[class*="badge"]',
      '[class*="pill"]',
      '[class*="tag"]',
      '[class*="chip"]',
    ]),
    tableRow: pickFirstVisible(['tbody tr', '[role="row"]']),
  };

  // 5. Clean & Exact Extraction of Page SVG Icons
  const cleanSvgOuterHtml = (svgEl) => {
    const clone = svgEl.cloneNode(true);
    // Strip unnecessary framework/hydration attributes while preserving geometry and classes
    const removeAttrs = ['data-hk', 'data-testid', 'data-slot', 'focusable', 'aria-hidden'];
    const walk = (node) => {
      if (node.nodeType === 1) {
        removeAttrs.forEach((a) => node.removeAttribute(a));
        Array.from(node.children).forEach(walk);
      }
    };
    walk(clone);
    return clone.outerHTML.replace(/\s+/g, ' ').trim();
  };

  const getSvgContext = (svgEl) => {
    const parentInteractive = svgEl.closest('button, a, [role="tab"], [role="button"], label, li, h1, h2, h3, div');
    if (!parentInteractive) return 'standalone';
    const aria = parentInteractive.getAttribute('aria-label') || parentInteractive.getAttribute('title');
    const text = (parentInteractive.innerText || parentInteractive.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    const tag = parentInteractive.tagName.toLowerCase();
    return `${tag}${aria ? `[aria="${aria}"]` : ''}${text ? `: "${text}"` : ''}`;
  };

  const iconMap = new Map();
  for (const svg of Array.from(document.querySelectorAll('svg'))) {
    const rect = svg.getBoundingClientRect();
    // Capture visible compact icons and illustrations (between 8px and 80px)
    if (rect.width < 8 || rect.height < 8 || rect.width > 80 || rect.height > 80) continue;
    const innerSig = svg.innerHTML.replace(/\s+/g, '');
    const ctx = getSvgContext(svg);

    if (iconMap.has(innerSig)) {
      const existing = iconMap.get(innerSig);
      if (existing.contexts.length < 4 && !existing.contexts.includes(ctx)) {
        existing.contexts.push(ctx);
      }
      continue;
    }

    const cs = window.getComputedStyle(svg);
    iconMap.set(innerSig, {
      contexts: [ctx],
      dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      viewBox: svg.getAttribute('viewBox') || `0 0 ${Math.round(rect.width)} ${Math.round(rect.height)}`,
      fill: svg.getAttribute('fill') || cs.fill,
      stroke: svg.getAttribute('stroke') || cs.stroke,
      strokeWidth: svg.getAttribute('stroke-width') || cs.strokeWidth,
      color: rgbToHex(cs.color),
      svgHtml: cleanSvgOuterHtml(svg),
    });
    if (iconMap.size >= 35) break;
  }
  const icons = Array.from(iconMap.values());

  return {
    url: window.location.href,
    title: document.title,
    activeTheme,
    stylesheetReport,
    cssVariablesCount: Object.values(cssVariables).reduce((n, group) => n + Object.keys(group).length, 0),
    cssVariables,
    layout,
    typography,
    components,
    iconsCount: icons.length,
    icons,
  };
})()
