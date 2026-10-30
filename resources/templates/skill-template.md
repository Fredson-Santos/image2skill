---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# {{DISPLAY_NAME}} — Style Reference & Design System

> {{TAGLINE}}

**Tema Base:** {{THEME_TYPE}} (`{{COLOR_CANVAS}}`)  
**Arquétipo Visual:** {{STYLE_ARCHETYPE}}  
**Superfícies:** Canvas `{{COLOR_CANVAS}}` | Card `{{COLOR_SURFACE}}` | Elevated `{{COLOR_SURFACE_ELEVATED}}`  
**Acento Principal:** `{{ACCENT_PRIMARY}}` (Texto de contraste: `{{ACCENT_PRIMARY_FG}}`)  
**Assinatura Geométrica:** Controles `{{RADIUS_CONTROLS}}px`, Cards `{{RADIUS_CARDS}}px`, Bordas `{{BORDER_STYLE}}`

---

## 1. Tokens de Superfícies, Cores & Contraste

Extraídos com precisão matemática dos pixels e estilos computados da referência:

| Nome do Token | Valor Hex / RGB | Contraste vs Canvas | Papel / Função na Interface |
| :--- | :--- | :--- | :--- |
{{COLOR_TOKENS_TABLE}}

### 1.1 Paleta Semântica & Visualização de Dados (Charts)
- **Chart / Data 1:** `{{CHART_1}}`
- **Chart / Data 2:** `{{CHART_2}}`
- **Chart / Data 3:** `{{CHART_3}}`
- **Chart / Data 4:** `{{CHART_4}}`
- **Status (Success / Warning / Danger):** `{{STATUS_SUCCESS}}` / `{{STATUS_WARNING}}` / `{{STATUS_DANGER}}`

---

## 2. Tipografia & Escala Fluida

- **Família Sans:** `{{FONT_SANS}}`
- **Família Mono:** `{{FONT_MONO}}`
- **Família Display:** `{{FONT_DISPLAY}}`
- **Diretriz de Tracking:** Títulos display utilizam tracking `{{TRACKING_DISPLAY}}`, corpo `{{TRACKING_BODY}}` e rótulos mono `{{TRACKING_MONO}}`.

### Escala de Texto
| Papel | Tamanho | Peso | Line-Height | Tracking | Exemplo de Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
{{TYPE_SCALE_TABLE}}

---

## 3. Arquitetura de Layout, Grid, Sombras e Formas

- **Estrutura de Layout (`App Shell`):** {{LAYOUT_STRUCTURE}}
- **Sistema de Grid & Densidade:** {{GRID_SPEC}} (Base: `{{SPACING_BASE}}px`)
- **Raio de Controles (Botões/Inputs):** `{{RADIUS_CONTROLS}}px`
- **Raio de Cards e Contêineres:** `{{RADIUS_CARDS}}px`
- **Bordas Estruturais:** `{{BORDER_STYLE}}`
- **Sistema de Elevação / Sombras:** `{{SHADOW_CARD}}`

---

## 4. Componentes Principais & Micro-interações

Consulte o arquivo [`resources/components.md`](./resources/components.md) para ver a implementação completa em HTML + Tailwind CSS de todos os componentes:
{{COMPONENTS_SUMMARY_LIST}}

---

## 5. Diretrizes de Implementação & Brand Neutrality (Regra Inegociável)

> [!IMPORTANT]
> **Neutralidade de Marca na Interface (White-Label):**
> Ao implementar interfaces usando esta skill, **NUNCA injete referências ao nome da skill ou à biblioteca/site de origem** em títulos, logos, badges, kickers, placeholders ou rodapés, a menos que o usuário solicite explicitamente essa marca. A interface gerada deve ser 100% voltada ao produto do usuário ou utilizar marcas fictícias limpas (white-label).

### O que fazer (Do):
- [x] Mantenha a interface 100% white-label e contextualizada ao negócio do usuário, sem auto-referências à skill.
{{DOS_LIST}}

### O que NÃO fazer (Don't):
- [ ] NUNCA adicione o nome da skill ou site de referência em textos, badges de status, logos ou cabeçalhos da interface gerada sem solicitação explícita.
{{DONTS_LIST}}

---

## 6. Arquivos e Recursos da Skill
- [`resources/tokens.css`](./resources/tokens.css): Variáveis CSS completas e `@theme` Tailwind v4.
- [`resources/tailwind.config.js`](./resources/tailwind.config.js): Configuração Tailwind v3.
- [`resources/components.md`](./resources/components.md): Catálogo de layout e componentes prontos.
- [`resources/templates/preview.html`](./resources/templates/preview.html): Réplica fiel e showcase validado visualmente.
