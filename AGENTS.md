# Orientações para agentes — templates PMC-GS

## Contexto do projeto

Este repositório contém templates e páginas migradas para o sistema da Prefeitura de Campina Grande do Sul. Parte do HTML é carregada ou processada pelo sistema legado em produção.

Uma página pode ser:

- um fragmento de conteúdo inserido pelo CMS;
- uma página local completa usada para desenvolvimento e homologação;
- um template que depende dos componentes globais de cabeçalho, busca, acessibilidade, hero e rodapé.

Antes de alterar uma página, verifique páginas semelhantes em `pages-migradas`, `pages` e `templates`. O objetivo é manter a identidade do sistema, não criar uma identidade visual isolada para cada página.

## Estrutura e padrão visual

- Utilize as cores e variáveis globais do template, como `--verde`, `--verde-escuro`, `--verde-claro`, `--cinza-bg`, `--cinza-borda` e `--texto`.
- Quando precisar de variáveis específicas da página, referencie as variáveis globais e forneça apenas um valor de fallback.
- Use o hero padrão do sistema (`pi-hero`) quando a página completa precisar de hero.
- Não duplique cabeçalho, busca, acessibilidade ou rodapé dentro de fragmentos carregados pelo CMS.
- Prefira cards com bordas discretas, fundo branco, cantos arredondados e sombras leves.
- Evite cores arbitrárias, gradientes e componentes que destoem das páginas institucionais existentes.
- Preserve suporte a foco visível, navegação por teclado, leitores de tela e alto contraste.

## Layout principal e sidebar

Nas páginas institucionais que usam sidebar:

- o conteúdo principal fica à esquerda;
- a sidebar fica sempre à direita no desktop;
- a sidebar deve ser mais estreita que o conteúdo;
- a sidebar pode reunir ações rápidas, contato, horário e endereço;
- não coloque o conteúdo principal dentro da sidebar;
- no mobile, o conteúdo principal vem primeiro e a sidebar depois;
- botões da sidebar precisam de espaçamento vertical e não podem ficar grudados;
- textos, ícones e botões devem permanecer alinhados em telas pequenas.

Estrutura recomendada:

```css
.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 28px;
}

@media (max-width: 991px) {
  .page-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

## Páginas de catálogos de software (SGA, BookEase etc.)

Páginas que apresentam sistemas municipais devem seguir a estrutura usada em `pages-migradas/sga` e `pages-migradas/bookease`: hero do sistema, apresentação, cards de recursos, fluxo/status quando existir, descrição de perfis de acesso, CTA final e sidebar com ações.

Quando o sistema for **restrito** (uso interno da administração, sem acesso público):

- use o card de acesso restrito no mesmo padrão do SGA (`sga-badge-interno`), logo no início da apresentação:
  - ícone `fa-user-lock`;
  - texto com `<strong>` no início e esclarecimento em texto corrido;
  - fungo claro alinhado à paleta institucional (verde-claro), borda e ícone verdes;
- deixe claro no hero ou na descrição que o acesso é exclusivo de servidores autorizados;
- no CTA final e na sidebar, use rótulos como "Exclusivo para servidores" em vez de "Acessar sistema";
- mantenha o mesmo padrão visual dos demais cards da página (neutralidade, cantos arredondados, sombras leves);
- preserve suporte a alto contraste (`body.high-contrast`) para o card de acesso restrito.

Referência: `pages-migradas/sga/conteudo.html` (`.sga-badge-interno`) e `pages-migradas/sga/css/sga.css`.

## Abas

As abas devem seguir o padrão usado em `secretarias` e `conheca-campina`.

No desktop:

- use uma faixa horizontal clara e coerente com o restante do template;
- indique a aba ativa com cor institucional, borda ou fundo;
- cada botão deve possuir `role="tab"`, `aria-selected`, `aria-controls` e `tabindex`;
- cada painel deve possuir `role="tabpanel"` e `aria-labelledby`;
- implemente navegação por teclado com setas, `Home` e `End`.

No mobile:

- as abas podem rolar horizontalmente;
- use botões laterais circulares com setas quando houver conteúdo oculto;
- esconda a seta esquerda quando a primeira aba estiver totalmente visível;
- esconda a seta direita quando a última aba estiver totalmente visível;
- nunca deixe uma seta ativa se não houver mais conteúdo naquela direção;
- mantenha os cards das abas centralizados, com textos curtos e sem desalinhamento;
- ao selecionar a primeira aba, force `scrollLeft = 0` e atualize imediatamente as setas;
- recalcule as setas em `scroll`, `resize` e após mudar de aba.

## IDs e integração com o sistema legado

IDs e atributos usados pelo sistema legado são dados funcionais e devem ser preservados.

Exemplo:

```html
<div
  class="spweb-file"
  data-model="_SectionFiles2"
  data-category="31"
  data-subcategory="0">
</div>
```

Regras:

- não altere `data-model`, `data-category`, `data-subcategory` ou `data-thumb` sem solicitação explícita;
- não substitua os arquivos reais por links inventados ou conteúdo estático;
- mantenha as URLs retornadas pelo sistema;
- IDs de categorias e subcategorias informados pelo usuário devem ser copiados exatamente;
- IDs de abas, painéis, accordions e controles precisam ser únicos na página;
- todo `aria-controls` deve apontar para um ID existente;
- todo `aria-labelledby` deve apontar para o controle correto;
- ao gerar IDs via JavaScript, prefixe-os com o nome da página para evitar colisões.

## Componentes de arquivos e DataTables

Os componentes `_SectionFiles2` e `_SectionFiles3` podem gerar internamente IDs fixos, como `accordionfiles` e `tbl-file`. Várias instâncias podem provocar:

```text
DataTables warning: Cannot reinitialise DataTable
```

Para evitar o problema:

- prefira uma única carga `_SectionFiles2` para uma categoria que já agrupe suas subcategorias;
- transforme visualmente o resultado depois que o sistema legado preencher o componente;
- use `MutationObserver` para aguardar o conteúdo dinâmico;
- não inicialize DataTables manualmente sobre uma tabela já inicializada;
- se o DataTables precisar ser configurado, utilize `retrieve: true` antes da carga do componente;
- não esconda o aviso sem corrigir a reinicialização;
- não replique várias instâncias `_SectionFiles3` apenas para criar cards visuais se `_SectionFiles2` puder fornecer os mesmos grupos;
- após transformar o conteúdo, marque o elemento com `data-*` para impedir processamento duplicado;
- desconecte o `MutationObserver` quando a transformação terminar.

## Padrão visual para arquivos

Use `pages-migradas/progressao-funcional` como referência para listagens de documentos.

O resultado deve possuir:

- filtro por ano quando os títulos contiverem anos;
- pastas em accordion;
- título completo da categoria;
- badge de ano no desktop;
- lista de arquivos com nome, extensão e ação de download;
- PDF com ícone vermelho;
- Word com ícone azul;
- Excel com ícone verde;
- outros formatos com ícone institucional neutro;
- botão ou ícone de download em verde;
- hover discreto com fundo claro e borda lateral verde;
- nomes longos com quebra de linha segura;
- links abrindo em nova aba com `target="_blank"` e `rel="noopener"`;
- layout compacto, mas confortável no mobile.

Não copie o HTML final emitido pelo sistema legado. Leia o conteúdo gerado, preserve nomes e URLs e construa a apresentação moderna via JavaScript.

## Documentos com capas e etapas

Quando uma página tiver documentos divididos por etapas:

- mantenha as pastas principais solicitadas, por exemplo PDM e PlanMob;
- ao abrir uma pasta, mostre claramente cada etapa separada;
- preserve as capas informadas em `data-thumb`;
- mantenha o título oficial de cada etapa;
- em desktop, cada etapa pode ocupar toda a largura, com capa à esquerda e arquivos à direita;
- em mobile, empilhe capa e arquivos;
- não limite o carregador de documentos a metade do contêiner quando houver apenas uma fonte de dados;
- para listas extensas, priorize a largura da área de arquivos.

## Accordions e pastas

- O botão da pasta deve ocupar toda a largura.
- Centralize verticalmente ícone, texto e seta.
- Use `aria-expanded` e `aria-controls`.
- O painel fechado deve usar o atributo `hidden`.
- A seta deve girar ao abrir.
- No mobile, permita quebra de linha no título sem deslocar o ícone ou a seta.
- Não use IDs genéricos repetidos como `collapse_1` em componentes diferentes; sempre adicione um prefixo da página.

## Responsividade

Toda página deve ser conferida pelo menos nestas larguras:

- 320 px;
- 375 px;
- 576 px;
- 768 px;
- 992 px;
- desktop amplo.

Verifique:

- ausência de rolagem horizontal;
- conteúdo principal antes da sidebar no mobile;
- botões sem sobreposição ou espaçamento colado;
- textos centralizados somente onde fizer sentido;
- títulos longos quebrando corretamente;
- tabelas legadas ocultadas ou transformadas de forma responsiva;
- setas das abas no estado correto;
- capas sem cortes indevidos;
- cards usando toda a largura disponível.

## JavaScript

- O código precisa funcionar tanto quando o HTML já está presente quanto quando é inserido via `fetch`.
- Inicializações devem ser idempotentes.
- Use `textContent` para dados vindos do sistema sempre que possível.
- Evite inserir nomes de arquivos ou títulos dinâmicos diretamente em `innerHTML`.
- Preserve query strings e URLs relativas dos arquivos.
- Não dependa de temporizadores fixos para aguardar o SPWeb; prefira `MutationObserver`.
- Desconecte observers que já cumpriram sua função.
- Mantenha suporte ao comportamento reduzido de movimento quando houver rolagem animada.

## Arquivos e organização

Para uma nova página migrada, prefira:

```text
pages-migradas/
└── nome-da-pagina/
    ├── index.html
    ├── style.css
    └── script.js
```

Se a página completa do projeto usar o padrão de conteúdo separado, preserve a estrutura já adotada nela, por exemplo:

```text
nome-da-pagina/
├── index.html
├── conteudo.html
├── css/
└── js/
```

Não mova arquivos existentes apenas para uniformizar diretórios.

## Validação antes de finalizar

Execute verificações proporcionais à alteração:

```powershell
node --check "caminho\para\script.js"
git diff --check -- "caminho/da/pagina"
```

Também confirme:

- IDs únicos;
- categorias e subcategorias corretas;
- ausência de múltiplas inicializações do DataTables;
- funcionamento das pastas e abas;
- ordem correta no desktop e mobile;
- preservação dos links do sistema legado;
- ausência de alterações não relacionadas.

