---
name: image2skill
description: >-
  Especialista em Engenharia Reversa Visual e Estrutural de Interfaces (Image-to-Skill, URL+Print-to-Skill & Screenshot-to-Design-System). Ative esta skill sempre que o usuário fornecer uma imagem, print, screenshot, mockup ou URL de uma interface e pedir para "criar uma skill", "replicar o design", "extrair design system", "transformar print em skill" ou acionar o "image2skill". Utiliza extração matemática de pixels (Python), inspeção real de DOM/CSS/Layout via agent-browser (quando há URL/site identificável) e loop de auto-validação visual do preview.html.
---

# Image2Skill — Visual & DOM Reverse Engineering Engine

O **Image2Skill** transforma prints, capturas de tela, mockups e sites de referência em **Design Systems completos e Skills padronizadas do Antigravity**.

Diferente de uma análise puramente subjetiva, o Image2Skill combina **3 motores**:
1. **Extração Matemática de Pixels (`scripts/extract_palette.py`):** Extrai os códigos HEX/RGB exatos e taxas de contraste WCAG diretamente da imagem.
2. **Modo Híbrido URL + Print (`agent-browser` + `scripts/extract_dom_styles.js`):** Sempre que a imagem ou o prompt contiver uma URL, domínio ou site reconhecível, inspeciona o DOM real ao vivo para extrair variáveis `:root`, famílias tipográficas exatas, arquitetura de layout/grid e anatomia de componentes.
3. **Self-Healing Visual Validation (`agent-browser`):** Renderiza o `preview.html` gerado em um navegador real, audita acessibilidade (`a11y`), tira screenshot e compara com o print original antes de entregar.

---

## 🎯 Gatilhos de Ativação

Ative este procedimento sempre que o usuário:
- Enviar ou mencionar um print / captura de tela de um app, dashboard, site ou landing page (com ou sem URL).
- Disser frases como:
  - *"Crie uma skill com base nesse print"*
  - *"Transforme essa imagem em um design system"*
  - *"Replique o estilo dessa interface em uma skill"*
  - *"Rode o image2skill nessa imagem / site"*

---

## 🛠️ Procedimento de Execução (Pipeline em 5 Fases)

Consulte os detalhes técnicos em [`resources/extraction-protocol.md`](./resources/extraction-protocol.md) e execute rigorosamente as 5 fases abaixo:

### Fase 1: Extração Híbrida (Pixels + DOM Real + Decomposição Visual)

1. **Extração Exata de Cores (Python):**
   Execute o script de paleta na imagem fornecida para obter os valores HEX reais e o cálculo de contraste WCAG:
   ```powershell
   python .agents/skills/image2skill/scripts/extract_palette.py "<caminho-da-imagem>"
   ```

2. **Extração de Layout, CSS e Componentes do Site (Modo Híbrido `agent-browser`):**
   Verifique se o usuário informou uma URL **ou** se a própria imagem exibe uma URL na barra de endereços, domínio ou nome de web app acessível. Se sim:
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content .agents/skills/image2skill/scripts/extract_dom_styles.js -Raw)))
   agent-browser open "<URL-detectada>"
   agent-browser wait 2000
   agent-browser snapshot -i
   agent-browser eval -b $b64
   agent-browser close
   ```
   - Use a saída de `snapshot -i` e `extract_dom_styles.js` para capturar **100% de precisão** nas variáveis CSS `:root`, `fontFamily`, `fontSize`, `letterSpacing`, `borderRadius`, `boxShadow`, `gridTemplateColumns`, `gap`, estrutura dos componentes e o **array `icons` com o `svgHtml` exato de todos os ícones `<svg>` da página**.

3. **Decomposição Estética, Iconográfica e Arquitetural:**
   Combine os dados extraídos com a inspeção visual da imagem para mapear:
   - **Arquétipo Visual:** Dark Precision, Neo-Brutalist, Editorial Minimal, Motion-First ou Glassmorphic.
   - **Pilha de Superfícies:** `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--bg-surface-muted`, `--bg-surface-hover`.
   - **Bordas & Elevação:** Hairline (`1px` translúcida), sólida, ou neo-brutalista (`2px+` com hard shadow); sombras `--shadow-sm`, `--shadow-card`, `--shadow-elevated`.
   - **Tipografia Fluida & Tracking:** Fontes Sans, Mono e Display; tracking em títulos (`--tracking-display`) e rótulos técnicos (`--tracking-mono`).
   - **Acentos, Status e Paleta de Gráficos:** `--accent-primary`, `--accent-secondary`, `--status-*` e `--chart-1` a `--chart-5`.
   - **Iconografia Fiel (Regra Zero-Unicode):**
     - **NUNCA** substitua ícones por emojis ou símbolos Unicode (`☀`, `☾`, `▭`, `🤖`, `⊞`, `✕`, `i`).
     - Se extraiu do DOM via `extract_dom_styles.js`, incorpore o **`svgHtml` literal** de cada ícone.
     - Se a entrada for apenas uma imagem sem URL, utilize o **Lucide Icons CDN** (`https://unpkg.com/lucide@latest`) ou desenhe o `<svg>` vetorial completo respeitando `viewBox`, `stroke-width` e estilo (outline, solid ou dot-matrix).
   - **Layout & Componentes:** Estrutura do App Shell (Sidebar/Header/Main Grid) e todos os componentes visíveis no print.

---

### Fase 2: Definição do Nome e Escopo da Nova Skill
Escolha um nome descritivo em `kebab-case` para a nova skill baseado no estilo ou referência analisada:
- Exemplos: `linear-midnight-ui`, `conekta-fintech-ui`, `raycast-dark-ui`, `stripe-editorial-ui`.

---

### Fase 3: Geração Padronizada dos 5 Arquivos da Nova Skill

Crie a pasta da skill em `.agents/skills/<nome-da-skill>/` utilizando obrigatoriamente os **5 templates oficiais** em `resources/templates/`, sem deixar nenhum placeholder `{{...}}` por preencher:

1. **`SKILL.md`** (baseado em [`resources/templates/skill-template.md`](./resources/templates/skill-template.md)):
   - Frontmatter YAML válido com `name` e `description` detalhada (incluindo os tokens principais e gatilhos de ativação).
   - Tabelas completas de cores (com taxa de contraste), paleta de gráficos (`--chart-1..5`), escala tipográfica, arquitetura de layout/grid, catálogo de componentes e *Do's & Don'ts*.
   - **Regra Inegociável de White-Label (Brand Neutrality):** Instrua explicitamente a nunca injetar o nome da skill ou do site de origem nas interfaces geradas.

2. **`resources/tokens.css`** (baseado em [`resources/templates/tokens-template.css`](./resources/templates/tokens-template.css)):
   - Variáveis CSS `:root` completas (Superfícies, Bordas, Texto, Acentos, Status, Charts `--chart-1..5`, Tipografia Fluida `clamp()`, Raios e Sombras) + bloco `@theme` para Tailwind v4.

3. **`resources/tailwind.config.js`** (baseado em [`resources/templates/tailwind-template.js`](./resources/templates/tailwind-template.js)):
   - Mapeamento completo de `theme.extend` para Tailwind v3.

4. **`resources/components.md`** (baseado em [`resources/templates/components-template.md`](./resources/templates/components-template.md)):
   - Código HTML + Tailwind pronto para o App Shell (Layout/Grid), Botões, Cards, Inputs, Badges e Tabelas/Gráficos extraídos.

5. **`resources/templates/preview.html`** (baseado em [`resources/templates/preview-template.html`](./resources/templates/preview-template.html)):
   - Página HTML autônoma contendo:
     - **Seção 1 (`#interface-replica`):** Réplica fiel e interativa da interface do print original (usando marca white-label limpa).
     - **Seção 2 (`#styleguide-showcase`):** Matriz visual com swatches de todos os tokens de cor, tipografia e componentes isolados.

---

### Fase 4: Loop de Auto-Validação Visual (Self-Healing `preview.html`)

Antes de finalizar, valide a renderização real do `preview.html` usando o `agent-browser`:

```powershell
$env:AGENT_BROWSER_SESSION = "image2skill-validate"
agent-browser open "file:///<caminho-absoluto>/resources/templates/preview.html"
agent-browser wait 1500
agent-browser screenshot "<caminho-temporario>/preview-validation.png"
agent-browser a11y
agent-browser close
```

1. Visualize o screenshot `preview-validation.png` com `read_file` e compare com a imagem de referência original.
2. Verifique se o resultado de `agent-browser a11y` aponta falhas graves de contraste ou estrutura.
3. Caso identifique desalinhamentos, quebras de grid ou cores distantes da referência, ajuste `preview.html` e `tokens.css` e valide novamente.

---

### Fase 5: Apresentação do Resultado ao Usuário

Apresente um resumo conciso e estruturado contendo:
1. **Paleta & Tokens Extraídos:** Tabela com os valores HEX/RGB exatos, contraste e papel na interface.
2. **Arquitetura de Layout & Estilo:** Resumo do arquétipo visual, grid, tipografia e componentes mapeados.
3. **Validação Visual:** Exiba o screenshot renderizado do `preview.html` validado na Fase 4.
4. **Links Clicáveis (`file:///`):** Links diretos para os 5 arquivos gerados (`SKILL.md`, `tokens.css`, `tailwind.config.js`, `components.md`, `preview.html`).

---

## 📚 Scripts, Protocolos e Templates Embutidos

- [`scripts/extract_palette.py`](./scripts/extract_palette.py): Extrator matemático de paleta HEX/RGB e contraste WCAG via Pillow.
- [`scripts/extract_dom_styles.js`](./scripts/extract_dom_styles.js): Extrator de variáveis CSS `:root`, layout/grid, tipografia e componentes reais via `agent-browser eval`.
- [`resources/extraction-protocol.md`](./resources/extraction-protocol.md): Protocolo completo de engenharia reversa visual e DOM.
- [`resources/templates/skill-template.md`](./resources/templates/skill-template.md): Template para `SKILL.md`.
- [`resources/templates/tokens-template.css`](./resources/templates/tokens-template.css): Template enriquecido para `resources/tokens.css`.
- [`resources/templates/tailwind-template.js`](./resources/templates/tailwind-template.js): Template para `resources/tailwind.config.js`.
- [`resources/templates/components-template.md`](./resources/templates/components-template.md): Template para `resources/components.md`.
- [`resources/templates/preview-template.html`](./resources/templates/preview-template.html): Template para `resources/templates/preview.html`.
