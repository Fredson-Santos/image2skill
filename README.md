# Image2Skill — Visual & DOM Reverse Engineering Engine

> Motor de engenharia reversa visual e estrutural para agentes de IA (Antigravity / Claude Code / Cursor). Transforma prints, screenshots, mockups e URLs de interfaces em **Design Systems completos e Skills padronizadas** com precisão matemática.

---

## 🚀 Visão Geral

Diferente de uma análise puramente subjetiva por visão computacional, o **Image2Skill** opera com **3 motores combinados**:

1. **Extração Matemática de Pixels (`scripts/extract_palette.py`):** Analisa a imagem via Python (Pillow) para extrair os códigos HEX/RGB exatos, dominância cromática e taxas de contraste WCAG AA/AAA reais.
2. **Modo Híbrido URL + Print (`agent-browser` + `scripts/extract_dom_styles.js`):** Quando uma URL ou web app acessível é identificado, inspeciona o DOM renderizado em tempo real para capturar variáveis CSS `:root`, famílias tipográficas, grids, sombras, raios de borda e o código `<svg>` literal dos ícones (Regra Zero-Unicode).
3. **Self-Healing Visual Validation (`agent-browser`):** Renderiza o `preview.html` gerado em um navegador headless, executa auditoria de acessibilidade (`a11y`), captura screenshot de validação e compara com a referência original antes de finalizar.

---

## 📦 Instalação

### Opção 1: Via `npx skills`
```bash
npx skills add Fredson-Santos/image2skill
```

### Opção 2: Clone direto no projeto (Workspace Skill)
```bash
git clone https://github.com/Fredson-Santos/image2skill.git .agents/skills/image2skill
```

### Opção 3: Instalação Global no Antigravity
```bash
git clone https://github.com/Fredson-Santos/image2skill.git ~/.gemini/config/skills/image2skill
```

---

## 🛠️ Pré-requisitos

- **Python 3.8+** com `Pillow` instalado (`pip install Pillow`) para o extrator matemático de paleta (`scripts/extract_palette.py`).
- **`agent-browser`** (opcional, recomendado para o Modo Híbrido URL+Print e auto-validação visual do `preview.html`).

---

## 📂 Estrutura da Skill

```text
image2skill/
├── SKILL.md                                  # Instruções principais e pipeline de 5 fases do agente
├── scripts/
│   ├── extract_palette.py                    # Extrator matemático de cores HEX/RGB e contraste WCAG
│   └── extract_dom_styles.js                 # Extrator de CSS :root, tipografia, grid e SVGs via DOM
└── resources/
    ├── extraction-protocol.md                # Protocolo detalhado de engenharia reversa visual e DOM
    └── templates/
        ├── skill-template.md                 # Template padronizado para o SKILL.md gerado
        ├── tokens-template.css               # Template CSS :root + Tailwind v4 @theme
        ├── tailwind-template.js              # Template de configuração Tailwind v3
        ├── components-template.md            # Catálogo de componentes HTML + Tailwind
        └── preview-template.html             # Réplica interativa + Styleguide visual autônomo
```

---

## ⚡ Como Usar

Basta enviar uma imagem, print ou URL no chat do agente e pedir:

- *"Crie uma skill com base nesse print"*
- *"Transforme essa imagem em um design system"*
- *"Rode o image2skill nessa imagem / site"*

### O que é gerado para cada nova skill criada:
Cada execução do `image2skill` gera automaticamente uma nova skill em `.agents/skills/<nome-da-skill>/` contendo 5 artefatos completos:
1. `SKILL.md` — Documentação da arquitetura visual, tabelas de tokens, contraste, regras White-Label e *Do's & Don'ts*.
2. `resources/tokens.css` — Variáveis CSS `:root` completas + bloco `@theme` para Tailwind v4.
3. `resources/tailwind.config.js` — Extensão de tema pronta para Tailwind v3.
4. `resources/components.md` — Snippets HTML + Tailwind fiéis aos componentes da referência.
5. `resources/templates/preview.html` — Showcase interativo contendo a réplica da interface original e o guia de estilos vivo.
