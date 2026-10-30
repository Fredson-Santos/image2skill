# {{DISPLAY_NAME}} — Catálogo de Componentes & Anatomia Estrutural

Este catálogo documenta a arquitetura de layout e os componentes extraídos da referência visual, prontos para uso com **HTML + Tailwind CSS**.

> [!IMPORTANT]
> **Brand Neutrality (White-Label):** Todos os componentes devem utilizar rótulos e dados do produto do usuário, sem nunca injetar nomes da skill ou do site de origem.

---

## 1. Arquitetura de Layout & Grid (`App Shell`)

- **Estrutura Principal:** `{{LAYOUT_STRUCTURE}}` (ex: Sidebar fixa `240px` + Main fluido com `max-w-7xl` / Header sticky + Bento Grid)
- **Grid de Conteúdo:** `{{GRID_SPEC}}`
- **Padding e Gaps:** `{{PADDING_GAP_SPEC}}`

```html
{{LAYOUT_SHELL_HTML}}
```

---

## 2. Botões & Controles de Ação (`Buttons`)

- **Raio:** `{{RADIUS_CONTROLS}}px`
- **Transição / Estados:** Hover, Active (`scale-[0.98]`), Focus Ring (`ring-2`)

```html
<!-- Botão Primário + Botão Secundário + Ghost -->
{{BUTTONS_HTML}}
```

---

## 3. Cards, Painéis & Superfícies (`Cards & Containers`)

- **Superfície:** `{{COLOR_SURFACE}}` sobre canvas `{{COLOR_CANVAS}}`
- **Borda & Sombra:** `{{BORDER_STYLE}}` | `{{SHADOW_CARD}}`
- **Raio:** `{{RADIUS_CARDS}}px`

```html
{{CARDS_HTML}}
```

---

## 4. Campos de Entrada, Busca & Seletores (`Inputs & Forms`)

```html
{{INPUTS_HTML}}
```

---

## 5. Badges, Pills & Indicadores de Status (`Badges & Tags`)

```html
{{BADGES_HTML}}
```

---

## 6. Componentes de Dados, Listas ou Gráficos (`Data & Lists`)

```html
{{DATA_COMPONENT_HTML}}
```

---

## 7. Sistema de Iconografia & SVGs Extraídos (`Icons & Vectors`)

- **Estilo de Ícone:** `{{ICON_STYLE_SPEC}}` (ex: Outline `1.75px` `stroke-linecap="round"`, Dot-Matrix 2x2/3x3, ou Duotone)
- **Regra Zero-Unicode:** Nunca substitua ícones por caracteres de texto ou emojis; utilize sempre os `<svg>` literais extraídos do DOM ou Lucide Icons.

```html
{{ICONS_CATALOG_HTML}}
```

