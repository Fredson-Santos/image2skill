/**
 * Image2Skill — Live DOM Design System, Layout, Component & Exact SVG Icon Extractor
 * Executado via `agent-browser eval -b <base64>` quando uma URL ou site é identificado.
 * Extrai:
 *  1. Variáveis CSS nativas (:root custom properties)
 *  2. Tipografia exata (fontFamily, fontSize, fontWeight, letterSpacing, lineHeight)
 *  3. Arquitetura de Layout & Grid (sidebar, header, main, grids, gaps, paddings)
 *  4. Anatomia real dos Componentes (Botões, Cards, Inputs, Badges, Tabelas)
 *  5. Catálogo de Ícones SVG Reais (outerHTML limpo, viewBox, strokeWidth, contexto/botão pai)
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

  // 1. Extrair variáveis CSS (:root e html/body/.dark)
  const rootVars = {};
  try {
    const htmlCs = window.getComputedStyle(document.documentElement);
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules || [])) {
          if (
            rule.selectorText &&
            (rule.selectorText.includes(':root') ||
              rule.selectorText.includes('.dark') ||
              rule.selectorText === 'html' ||
              rule.selectorText === 'body')
          ) {
            for (const prop of Array.from(rule.style || [])) {
              if (prop.startsWith('--')) {
                rootVars[prop] = htmlCs.getPropertyValue(prop).trim() || rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (_) {}
    }
  } catch (_) {}

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

  // 2. Estrutura de Layout e Containers
  const layout = {
    body: extractStyle(document.body),
    header: pickFirstVisible(['header', '[role="banner"]', 'nav']),
    sidebar: pickFirstVisible(['aside', '[class*="sidebar"]', 'nav[aria-label]']),
    main: pickFirstVisible(['main', '[role="main"]', '[class*="container"]']),
    gridContainer: pickFirstVisible(['[class*="grid"]', 'main > div']),
  };

  // 3. Escala Tipográfica Computada
  const typography = {
    h1: pickFirstVisible(['h1']),
    h2: pickFirstVisible(['h2']),
    h3: pickFirstVisible(['h3']),
    body: pickFirstVisible(['p', 'main div']),
    monoOrCode: pickFirstVisible(['code', 'pre', '[class*="mono"]']),
  };

  // 4. Anatomia dos Componentes Reais
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

  // 5. Extração Real e Limpa dos Ícones SVG da Página
  const cleanSvgOuterHtml = (svgEl) => {
    const clone = svgEl.cloneNode(true);
    // Remove atributos de hidratação/framework desnecessários mantendo geometria e classes essenciais
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
    // Captura ícones e ilustrações compactas visíveis (entre 8px e 80px)
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
    cssVariablesCount: Object.keys(rootVars).length,
    cssVariablesSample: Object.fromEntries(Object.entries(rootVars).slice(0, 45)),
    layout,
    typography,
    components,
    iconsCount: icons.length,
    icons,
  };
})()
