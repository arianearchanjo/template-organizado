# Template padrão — Página de sistema da TI (SGA, BookEase, FootEasy…)

> **Para que serve:** criar uma página de apresentação para um sistema municipal usando o
> mesmo "esqueleto" das páginas já migradas (`sga`, `bookease`, `footeasy`), **sem** deixar
> todas as páginas visualmente iguais.
>
> **Como usar:** este documento é o *briefing* que você passa para o agente de cada projeto.
> Leia a parte **"O que é fixo"** (não pode mudar) e a parte **"O que varia"** (é onde o
> sistema mantém sua personalidade). Depois preencha a **Ficha do sistema** e entregue ao agente.

---

## 0. Regra de entrega — OBRIGATÓRIO

> ⚠️ **O agente NÃO deve criar, editar ou publicar nenhum arquivo.** Ele deve apenas
> **retornar o conteúdo completo no chat**, em blocos de código, pronto para copiar e colar.

1. **Não** crie pastas, não grave `index.html`, `conteudo.html`, CSS ou JS.
2. **Devolva no chat**, cada arquivo em seu próprio bloco, com o caminho no cabeçalho:

   ```text
   ### pages-migradas/[slug]/index.html
   ```

   ```html
   <!DOCTYPE html> ...
   ```

3. Use apenas **o conteúdo do arquivo**, sem explicar longamente o que fez (comentários
   curtos no topo do HTML são aceitos).
4. O usuário copia esse conteúdo e o cola em outro ambiente para gravar os arquivos.
5. Se precisar de ajustes, o agente **revisa e devolve novamente no chat** — nunca altera
   arquivos.

---

## 1. Regra de ouro

Cada página de sistema divide-se em **dois tipos de bloco**:

1. **Blocos fixos (infraestrutura)** — repetidos em todas as páginas do portal, sem criar
   identidade própria:
   - hero padrão (`#pi-hero` + breadcrumb + título + subtítulo)
   - layout com coluna principal + sidebar à direita
   - acessibilidade (skip nav, foco visível, alto contraste, teclado, leitor de tela)
   - componentes globais de cabeçalho/busca/rodapé (carregados via web component, NÃO duplicar)
   - prevenção de "largura infinita" (overflow) e rolagem horizontal

2. **Blocos de identidade (conteúdo)** — é aqui que o sistema mostra a cara dele:
   - escolha do tom de texto (público comum, informal, institucional…)
   - **quais seções entram e em que ordem**
   - ícones, badges, vocabulário e destaque visual próprio
   - seções especiais (números, fluxo, perfis, carrossel, tabela de etapas, selos…)

> **Objetivo:** manter a identidade do portal (não criar uma identidade isolada por página),
> deixando cada sistema com um visual reconhecível e único. Compare com `sga`, `bookease` e
> `footeasy`: a estrutura é a mesma, mas nenhuma é cópia visual das outras.

---

## 2. O que é FIXO (não alterar)

### 2.1. Estrutura de arquivos

```text
pages-migradas/
└── nome-do-sistema/
    ├── index.html        # carrega componentes globais e injeta conteudo.html
    ├── conteudo.html     # hero + coluna principal + sidebar
    ├── css/nome.css      # estilos (fixos + de identidade)
    └── js/nome.js        # comportamentos (carrossel etc.)
```

### 2.2. `index.html` — esqueleto (padrão das demais páginas)

Copie diretamente de `sga/index.html` ou `bookease/index.html`. Pontos que **não mudam**:

- `<meta name="viewport">`
- `function getBasePath() { return "../../"; }`
- Bootstrap 4, Font Awesome 6, Google Font Roboto
- `_global/css/index.css` + css da página
- Elementos de acessibilidade: `pi-skip-nav`, `<barra-acessibilidade>`, `<meu-search>`,
  `<meu-header>`, `<meu-footer>`, div do VLibras (`vw`)
- Scripts globais (jquery, bootstrap, vlibras, componentes globais) + js da página
- `fetch("conteudo.html")` injetando o conteúdo em `#dynamic-content`
- Atualize apenas: `<title>`, `<meta name="description">`

### 2.3. Bloco de identidade fixo no CSS (obrigatório em TODA página)

Estas regras impedem o bug de **"largura infinita"** e garantem comportamento responsivo.
Inclua sempre, adaptando o nome da página:

```css
/* Contém vazamentos horizontais vindos do conteúdo dinâmico */
#dynamic-content,
#pi-main {
  background: #fff;
  padding: 40px 0 56px;
}
#dynamic-content {
  overflow-x: hidden;
  width: 100%;
}

/* Layout: coluna principal + sidebar à direita, sem estourar a largura */
.pi-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 28px;
  align-items: start;
}
.pi-layout > article,
.pi-layout > aside {
  min-width: 0;
}

/* No mobile, conteúdo primeiro e sidebar depois */
@media (max-width: 991px) {
  .pi-layout { grid-template-columns: 1fr; }
}
```

### 2.4. Acessibilidade inegociável

- `:focus-visible` visível (padrão global já cobre); nunca remova `outline`
- Navegação por teclado em abas, accordions e carrosséis (setas, Home, End)
- `aria-*` corretos: `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby`
- IDs únicos na página; `aria-controls`/`aria-labelledby` apontando para IDs existentes
- Suporte a `body.high-contrast` para os componentes da página
- Respeitar `prefers-reduced-motion` em animações
- Conferir larguras: 320, 375, 576, 768, 992 e desktop amplo; sem rolagem horizontal

### 2.5. Integração com o sistema legado

- Preserve `data-model`, `data-category`, `data-subcategory`, `data-thumb` e URLs reais
- Nunca substitua arquivos reais por links inventados
- Para `_SectionFiles2`/`_SectionFiles3`: **uma única carga** por categoria, use
  `MutationObserver` para aguardar o conteúdo, não reaproveite IDs fixos e não reinicialize
  DataTable (use `retrieve: true`); marque o elemento transformado com `data-*` e desconecte
  o observer ao terminar

### 2.6. JavaScript

- Funcionar já com o HTML presente E quando inserido via `fetch`
- Inicialização idempotente; prefira `MutationObserver` a temporizadores fixos
- Use `textContent` para dados vindos do sistema; tudo para `innerHTML` com cuidado
- Prefixe IDs gerados por JS com o nome da página

---

## 3. O que VARIA (é aqui que está a originalidade)

### 3.1. Ficha do sistema (preencha e entregue ao agente)

Copie o bloco abaixo, preencha e cole junto com o template:

```markdown
# Ficha do sistema

**Nome:** [nome do sistema]
**Slug/pasta:** pages-migradas/[slug]
**URL de acesso:** [https://…]
**Título da página (title):** […]

**O que o sistema faz (1 frase para pessoa comum):** […]
**Para quem é? (público):** [público / servidores / restrito…]

**Tipo de acesso:**
- [ ] Público
- [ ] Restrito (só servidores autorizados)  → usar badge de acesso restrito
- [ ] Híbrido (parte pública, parte restrita)

**Seções que percebo no sistema (marque as que existem):**
- [ ] Sobre o sistema (sempre presente)
- [ ] Destaque/demonstração visual (ex.: "Consulta pública do catálogo")
- [ ] Resultados em números (indicadores estatísticos)
- [ ] Funcionalidades em grade de cards
- [ ] Funcionalidades em carrossel (2 por vez, infinito)
- [ ] Fluxo do processo (etapas / status)
- [ ] Perfis de acesso
- [ ] Tabela "Como começar / Como acessar"
- [ ] Caráter inovador / selos
- [ ] Tecnologias utilizadas
- [ ] CTA final de acesso

**Ícone/badge de identidade:** [ex.: fa-futbol, fa-book-open, fa-user-lock…]

**Observação de tom:** [ex.: "falar com o público geral, evitar jargão técnico",
"levar em conta que o acesso é restrito a servidores", etc.]
```

### 3.2. Seções disponíveis (escolha, não use todas)

Cada sistema deve combinar **pelo menos 3-4 seções de identidade** diferentes entre si.
Exemplos reais:

| Seção | SGA | BookEase | FootEasy |
|---|---|---|---|
| Sobre o sistema | ✔ | ✔ | ✔ |
| Badge de acesso restrito | ✔ | ✖ | ✖ |
| Destaque visual | ✖ | ✔ (catálogo público) | ✖ |
| Resultados em números | ✖ | ✖ | ✔ |
| Funcionalidades (grade) | ✔ | ✔ | ✔ |
| Funcionalidades (carrossel) | ✔ | ✔ | ✖ |
| Fluxo / status | ✔ | ✖ | ✖ |
| Perfis de acesso | ✖ | ✖ | ✔ |
| Tabela de etapas ("como começar") | ✖ | ✔ | ✔ |
| Tecnologias | ✖ | ✖ | ✔ |
| Selos / caráter inovador | ✔ | ✔ | ✔ |
| CTA final | ✔ | ✔ | ✔ |

**Regra:** não copie a mesma combinação da página vizinha. Se um sistema usa números, outro
usa fluxo; se um tem carrossel, o outro tem tabela de etapas. Isso mantém a originalidade.

### 3.3. Como dar personalidade (sem fugir do padrão do portal)

- **Cores:** use sempre as variáveis globais (`--verde`, `--verde-escuro`, `--verde-claro`,
  `--cinza-bg`, `--cinza-borda`, `--texto`). Não invente paleta nova por página. A diferença
  entre páginas vem dos **ícones, badges, seções e tom**, não de cores aleatórias.
- **Badge de acesso restrito:** quando o sistema for restrito a servidores, use o card no
  padrão do SGA (`.sga-badge-interno`): ícone `fa-user-lock`, `<strong>` no início + texto
  corrido, fundo verde-claro, borda e ícone verdes. No CTA e na sidebar use "Exclusivo para
  servidores" em vez de "Acessar sistema".
- **Toast/estilo dos cards:** neutros, cantos arredondados, bordas discretas, sombras leves —
  como o resto das páginas institucionais.
- **Vocabulário:** evite expor detalhes técnicos sensíveis (API, rotas, OAuth, frameworks,
  "logs de auditoria" etc.). Prefira linguagem de pessoa comum.
- **Nunca** duplicar cabeçalho, busca, acessibilidade ou rodapé dentro do fragmento.

---

## 4. Componentes prontos para reutilizar

### 4.1. Carrossel "2 por vez, infinito"

Comportamento implementado em `sga/js/sga.js` e `bookease/js/bookease.js`:

- Mostra **exatamente 2 cards completos** por vez (nenhum card cortado ao meio)
- Navegação **infinita**: as setas nunca são desabilitadas quando há mais de 2 cards;
  ao chegar no fim, volta ao início (e vice-versa)
- A largura de cada card é calculada em JS com base no viewport (`dimensionar()`)
- Redimensiona em `resize`; respeita `prefers-reduced-motion`

Estrutura mínima no HTML:

```html
<div class="NOME-carrossel" data-carrossel>
  <div class="NOME-cards-grid NOME-carrossel-track" data-carrossel-track="NOME-slug" role="list">
    <article class="NOME-card" role="listitem">…</article>
    <!-- quantos quiser; o JS cuida do "2 por vez" -->
  </div>
</div>
```

No CSS, quando ativo:

```css
.NOME-carrossel--ativo { position: relative; overflow: hidden; }
.NOME-carrossel--ativo .NOME-carrossel-track {
  display: flex; flex-wrap: nowrap; gap: 0;
  transition: transform .35s ease; will-change: transform;
}
.NOME-carrossel--ativo .NOME-card { flex: 0 0 auto; margin-right: 16px; /* largura via JS */ }
```

> Importante: remova larguras fixas (ex.: `width: 340px`) dos itens do carrossel — o JS
> define a largura para caberem exatamente 2 por viewport.

### 4.2. Sidebar (padrão)

- Principal à esquerda, sidebar à direita no desktop; mais estreita (280 px)
- Pode reunir: acesso rápido, "nesta página", informações, links úteis e contato
- Botões com espaçamento vertical (sem ficar grudados); alinhados em telas pequenas
- No mobile: conteúdo primeiro, sidebar depois (veja CSS em 2.3)

### 4.3. Accordions / pastas (páginas com documentos)

- Botão ocupa toda a largura; ícone/texto/seta centralizados verticalmente
- `aria-expanded`, `aria-controls`, painel com `hidden` quando fechado
- Seta gira ao abrir; permitir quebra de linha do título no mobile
- IDs com prefixo da página (nunca `collapse_1` repetido)

---

## 5. Checklist antes de publicar

- [ ] IDs únicos na página; `aria-*` corretos
- [ ] Categorias/subcategorias e URLs do legado preservadas
- [ ] Sem dados técnicos sensíveis expostos no texto
- [ ] Carrossel mostra exatamente 2 cards e é infinito (se houver carrossel)
- [ ] Accordions/abas funcionais (teclado e tela cheia)
- [ ] Ordem correta: conteúdo antes da sidebar no mobile
- [ ] Sem rolagem horizontal em 320 / 375 / 576 / 768 / 992 / desktop
- [ ] Alto contraste (`body.high-contrast`) conferido
- [ ] `node --check js/nome.js` e `git diff --check` sem erros
- [ ] Página registrada em `pages/sistemas-ti/` (ou seção correspondente)

---

## 6. Referências (páginas reais para copiar a infraestrutura)

| Sistema | Onde ver |
|---|---|
| SGA | `pages-migradas/sga/` (badge de acesso restrito, fluxo, carrossel) |
| BookEase | `pages-migradas/bookease/` (destaque, tabela de etapas, carrossel) |
| FootEasy | `pages-migradas/footeasy/` (números, perfis, tecnologias, selos) |
| Normas gerais | `AGENTS.md` (abaixo, na raiz do repositório) |
