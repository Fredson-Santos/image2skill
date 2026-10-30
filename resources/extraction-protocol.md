# Image2Skill — Protocolo de Extração Visual & DOM de Interfaces

Este documento define o algoritmo híbrido de engenharia reversa (Pixel + DOM + Visual Validation) que o agente deve seguir ao receber um print, mockup, imagem de referência ou URL de uma interface.

---

## 1. Extração Automatizada (Pixel + Live DOM)

### Etapa 0A: Extração Matemática de Cores via Script Python (Obrigatória para Imagens)
Antes de estimar qualquer cor visualmente, execute o extrator de paleta sobre a imagem enviada pelo usuário:

```powershell
python .agents/skills/image2skill/scripts/extract_palette.py "<caminho-da-imagem>"
```

- Utilize os códigos **HEX exatos** retornados em `Cores Dominantes` para mapear `--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--border-subtle` e `--text-primary`.
- Utilize os códigos em `Candidatos de Acento & Gráficos` para mapear `--accent-primary`, `--accent-secondary` e `--chart-1..5`.
- Valide a coluna `contraste vs canvas` para assegurar legibilidade WCAG.

### Etapa 0B: Detecção de URL / Site & Extração Real de Layout/Componentes via `agent-browser`
Inspecione a imagem e o pedido do usuário em busca de **qualquer pista de URL ou domínio web**:
- Barra de endereços visível no print (ex: `app.site.com`, `localhost:3000`, `*.vercel.app`, `*.sslip.io`, etc.);
- URL fornecida no texto pelo usuário;
- Nome de produto/site público claramente identificável que possua URL acessível.

**Sempre que uma URL/site for identificada:**
1. Abra o site em uma sessão isolada do `agent-browser`:
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-extract"
   agent-browser open "<URL>"
   agent-browser wait 2000
   ```
2. Extraia a **árvore semântica de layout e componentes interativos**:
   ```powershell
   agent-browser snapshot -i
   ```
3. Extraia **todas as variáveis CSS `:root`, fontes reais, grid/layout e estilos computados dos componentes** injetando o extrator DOM da skill via Base64 (`-b`):
   ```powershell
   $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content .agents/skills/image2skill/scripts/extract_dom_styles.js -Raw)))
   agent-browser eval -b $b64
   ```
4. Caso a tela do print seja uma subpágina ou conta demo (ex: botão "Explorar conta de demonstração" ou abas internas), navegue até ela com `agent-browser click` e rode novamente o `extract_dom_styles.js`.
5. Feche a sessão ao concluir: `agent-browser close`.

---

## 2. Etapas de Decomposição Visual & Estrutural

### Etapa 1: Classificação do Arquétipo Estético
Identifique em qual arquétipo principal a interface se enquadra:
- **Dark Precision / Technical:** Canvas escuro profundo (`#08090a` a `#151515`), bordas hairline `1px` translúcidas, tracking apertado em títulos e fontes mono para metadados.
- **Neo-Brutalist / Pop Technical:** Fundo creme/papel ou vibrante, bordas sólidas pretas de `2px–3px`, sombras duras deslocadas sem blur (`4px 4px 0px #111`), badges/stickers inclinados.
- **Editorial Minimal / Workspace:** Canvas branco/papel quente (`#ffffff` / `#f7f7f5`), tipografia de alto contraste (Sans ou Serif), divisórias sutis e tags pastel.
- **Motion-First / Soft Modern:** Raios amplos (`16px–24px`), pílulas `rounded-full`, superfícies táteis em camadas (`#151515` → `#1c1c1c` → `#262626`) e micro-interações.
- **Glassmorphic / Ambient Gradient:** Superfícies translúcidas com `backdrop-filter: blur(16px)`, bordas especulares e brilhos radiais sutis.

### Etapa 2: Arquitetura de Layout & Grid (`App Shell`)
Extraia a geometria macro da tela:
1. **Navegação:** Sidebar lateral fixa (qual largura? ex: `240px` ou rail `64px`), Topbar horizontal sticky, ou Flutuante (Dock/Pill)?
2. **Grid Principal:** Quantas colunas compõem a área de trabalho? (ex: 4 KPI cards no topo + Grid 2 colunas assimétrico `2fr 1fr` abaixo + Tabela full-width).
3. **Densidade (Paddings & Gaps):** Espaçamento interno dos cards (`16px`, `20px`, `24px`) e distância entre blocos (`gap-3`, `gap-4`, `gap-6`).

### Etapa 3: Superfícies, Bordas e Sistema de Elevação
1. **Pilha de Camadas (Surface Stack):**
   - `--bg-canvas`: Fundo geral da aplicação.
   - `--bg-surface`: Cards, linhas de tabela e painéis.
   - `--bg-surface-elevated`: Modais, popovers, drawers, assistentes laterais.
   - `--bg-surface-muted`: Fundos secundários, cabeçalhos de tabela, trilhos de switch/tabs.
2. **Bordas & Sombras:**
   - Hairline translúcida (`rgba(255,255,255,0.08)`), sólida (`1px solid #e5e7eb`) ou grossa (`2px solid #111`)?
   - Sombra difusa suave, sombra dura (`offset`) ou elevação puramente cromática (sem sombra)?

### Etapa 4: Hierarquia de Tipografia e Escala
1. **Famílias:** Sans principal, Mono técnica (para números tabulares `tabular-nums`, códigos, datas, valores financeiros) e Display (se houver).
2. **Pesos, Tamanhos e Tracking:** Extraia os valores reais (do DOM ou da inspeção visual) para Display/H1, H2, H3, Body e Overline/Mono.

### Etapa 5: Acentos, Cores Semânticas e Paleta de Gráficos (`--chart-1..5`)
1. **Acento Primário (`--accent-primary`):** Cor de ação principal e cor do texto sobre ela (`--accent-primary-fg`).
2. **Paleta de Dados (`--chart-1` a `--chart-5`):** Cores usadas em gráficos de barra/linha/donut, barras de progresso e categorias.
3. **Status (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`):** Cores de badges positivos, alertas e variações negativas.

### Etapa 6: Extração Fiel de Iconografia & SVGs (Regra Zero-Unicode)
> [!IMPORTANT]
> **PROIBIDO improvisar ícones com caracteres Unicode ou Emojis** (ex: NUNCA use `☀`, `☾`, `▭`, `🤖`, `⊞`, `△`, `◫`, `✕`, `i`, `⋯` no lugar de ícones reais).

1. **Quando houver URL / Site (`agent-browser`):**
   - O script `scripts/extract_dom_styles.js` retorna a propriedade `icons` contendo até 35 objetos `{ context, dimensions, viewBox, strokeWidth, color, svgHtml }` extraídos diretamente do DOM.
   - Copie o `svgHtml` **literal e exato** de cada botão, aba, input ou card para dentro do `components.md` e do `preview.html`.
2. **Quando houver APENAS Imagem (sem URL acessível):**
   - Identifique a família e o estilo dos ícones no print:
     - **Outline Técnico (Lucide / Tabler / Feather):** Traço uniforme (`1.5px`, `1.75px` ou `2px`), `stroke-linecap="round"`, `stroke-linejoin="round"`. Utilize o CDN oficial do **Lucide Icons** (`<script src="https://unpkg.com/lucide@latest"></script>` + `<i data-lucide="nome-do-icone"></i>`) ou `<svg>` vetorial completo.
     - **Dot-Matrix / Pixel / Custom:** Construa o `<svg>` com os elementos `<circle>` ou `<rect>` nas coordenadas exatas da matriz (ex: matriz 2x2 ou 3x3 de pontos).
     - **Solid / Duotone:** Utilize `<svg fill="currentColor">` com opacidade secundária nas camadas internas.

### Etapa 7: Anatomia Completa dos Componentes
Reconstrua fielmente todos os componentes presentes na referência (incluindo seus SVGs reais):
- App Shell (Sidebar / Header / Main Grid)
- Botões (Primário, Secundário, Ghost, Ícone)
- Cards de KPI / Métricas e Contêineres
- Tabelas / Listas Interativas com Hover
- Inputs, Buscas (`cmd+k` / `/`), Selects e Switches
- Badges, Pills de Categoria e Indicadores de Tendência
- Modais ou Assistentes Laterais (se presentes)

---

## 3. Loop de Auto-Validação Visual (Self-Healing `preview.html`)

Após gerar os 5 arquivos da skill na Fase 3, **NUNCA entregue o `preview.html` sem validá-lo no navegador**:

1. Abra o arquivo `preview.html` recém-gerado com o `agent-browser`:
   ```powershell
   $env:AGENT_BROWSER_SESSION = "image2skill-validate"
   agent-browser open "file:///<caminho-absoluto-do-preview.html>"
   agent-browser wait 1500
   ```
2. Capture um screenshot da renderização real e rode a auditoria de acessibilidade/contraste:
   ```powershell
   agent-browser screenshot "<caminho-temporario>/preview-check.png"
   agent-browser a11y
   agent-browser close
   ```
3. Inspecione visualmente o `preview-check.png` com `read_file` e compare com a imagem original do usuário:
   - O layout, cores de fundo, bordas, fontes e alinhamentos correspondem fielmente ao print original?
   - Algum texto ficou sem contraste ou algum card quebrou o grid?
4. Se houver qualquer divergência visual ou erro de contraste, **edite o `preview.html` e `tokens.css`** imediatamente antes de apresentar o resultado final ao usuário.
