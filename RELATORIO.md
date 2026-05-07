# Documentação Técnica: Portal Institucional (Template Organizado)

Este documento serve como a base de conhecimento central para desenvolvedores e IAs (agentes de codificação) que atuam no projeto. Ele detalha a arquitetura, os padrões de codificação e a estratégia de evolução do portal.

---

## 1. Visão Geral do Projeto

O projeto é um **protótipo funcional e estruturado** para o novo portal da Prefeitura de Campina Grande do Sul – PR. Ele não é apenas um conjunto de páginas estáticas, mas uma base arquitetural projetada para ser migrada para um ambiente dinâmico (Backend/CMS).

### Tecnologias Utilizadas
- **HTML5 & CSS3:** Utilização de CSS Vanilla para máxima performance e controle estético.
- **JavaScript (Vanilla):** Uso de **Web Components** para modularização de elementos globais (Header, Footer, Busca, Acessibilidade).
- **Bootstrap 4.6:** Utilizado via CDN apenas para o grid e utilitários básicos.
- **Font Awesome 6:** Iconografia padronizada via CDN.

---

## 2. Estrutura de Pastas e Responsabilidades

A organização de pastas foi desenhada para separar o que é **global/reutilizável** do que é **específico/entidade**.

### `/_global/` (O Núcleo do Projeto)
Esta pasta contém tudo o que é compartilhado entre todas as páginas do portal.
- **`/_global/css/`**: Estilos base, reset, variáveis globais (`index.css`) e estilos específicos dos componentes de acessibilidade.
- **`/_global/js/`**: Implementação dos Web Components (`header-component.js`, `footer-component.js`, etc.).
- **`/_global/img/global/`**: **Imagens Centralizadas**. Aqui residem assets como `logo.png` e `ilustracao.png` (heros), eliminando a redundância de ter cópias dessas imagens em cada pasta de página.

### `/assets/` (Estilos e Imagens Locais)
Contém assets que, embora possam ser usados em mais de uma página, têm escopo limitado ou pertencem a módulos específicos.
- **`/assets/css/`**: CSS específico de páginas (ex: `ouvidoria.css`, `escola.css`).
- **`/assets/img/`**: Imagens exclusivas de certas seções (ex: fotos de secretários, banners da home).

### `/pages/` (As Entidades/Módulos)
Cada subpasta em `/pages/` representa uma seção do site (ex: `ouvidoria`, `secretarias`, `e-sic`).
- **`index.html`**: A página completa, contendo o shell (head, scripts e componentes globais).
- **`conteudo.html`**: **O Fragmento de Conteúdo**. Contém apenas o HTML interno da seção (geralmente o `<main>`). 
    - *Importante:* Esta estrutura facilita a migração futura, onde o sistema carregará apenas o `conteudo.html` dentro de um template mestre.

---

## 3. Estratégia de Assets Globais

Para garantir a performance e a facilidade de manutenção, adotamos a **Centralização de Assets de Identidade**.

- **Regra:** Imagens que aparecem em múltiplas páginas (como logos e ilustrações de fundo de hero) **devem** ser referenciadas a partir de `/_global/img/global/`.
- **Caminhos:** Os caminhos devem ser preferencialmente **relativos** (ex: `../../_global/img/global/logo.png`) para garantir compatibilidade com servidores locais como o Live Server, ou usar a variável `${base}` dentro dos componentes JavaScript.

---

## 4. Padronizações e Convenções

### Nomenclatura
- **Arquivos e Pastas:** `kebab-case` (ex: `conheca-campina`, `header-component.js`).
- **Classes CSS:** Prefixo `pi-` para elementos globais (Portal Institucional) ou prefixos específicos de módulo (ex: `ouv-` para Ouvidoria).

### Lógica de Caminho Base
Todas as páginas `index.html` possuem um script no `<head>` que define a função `getBasePath()`. Isso permite que componentes JS saibam onde estão em relação à raiz e carreguem assets corretamente.

### Reutilização de Componentes
Sempre que um elemento for repetido em mais de 3 páginas, ele deve ser avaliado para se tornar um Web Component em `/_global/js/`.

---

## 5. Páginas Placeholder e Templates Estruturais

Algumas páginas no diretório `/pages/` funcionam atualmente como **Modelos de Estrutura (Placeholders)**:
- `conselho/`, `escola-cmeis/`, `formularios/`, `secretarias/`, `servico/`, `unidade-saude/`.

**Definição:** O conteúdo atual destas páginas é meramente ilustrativo (*mock data*). Elas servem para documentar como o layout deve se comportar quando receber dados dinâmicos do banco de dados. Novos desenvolvedores devem preservar a estrutura de classes e IDs, pois eles são o alvo de futuras integrações.

---

## 6. Estratégia de Migração para Backend

O projeto foi preparado para uma transição suave:
1.  **Templates Reutilizáveis:** Os arquivos `index.html` de cada página servem como guia para a criação do "Master Page" no servidor.
2.  **Injeção de Conteúdo:** O arquivo `conteudo.html` de cada pasta é o código que será efetivamente "dinamizado" por linguagens como PHP, C# (Razor) ou Python.
3.  **Componentização:** Como o Header/Footer são Web Components, eles podem ser atualizados em um único arquivo JS e refletir em todo o sistema legado e novo simultaneamente.

---

## 7. Fluxo Recomendado para IA (Contexto para Agentes)

Ao interagir com este código, a IA deve seguir estas diretrizes:

1.  **Não Duplicar Assets:** Antes de adicionar uma imagem, verifique se ela já existe em `/_global/img/global/` ou em `assets/img/`.
2.  **Referenciar _global:** Sempre prefira apontar para o diretório global para elementos de identidade visual.
3.  **Respeitar o Padrão de Caminhos:** Ao editar arquivos dentro de `pages/`, use caminhos relativos (ex: `../../`) para sair da estrutura de pastas da página e acessar os globais.
4.  **Modularidade:** Se solicitado a criar um novo elemento repetitivo, sugira a criação de um Web Component em `/_global/js/`.
5.  **Não Alterar Estrutura de Placeholders:** Ao editar páginas marcadas como templates (Seção 5), foque na estrutura visual e não tente "corrigir" o conteúdo textual que é apenas figurativo.

---

## 8. Resumo Técnico

- **Arquitetura:** Front-end Modular baseado em Web Components e Fragmentos de Conteúdo.
- **Padrão de Assets:** Globalização em `/_global/` para redução de redundância.
- **Organização de Páginas:** Dualidade `index.html` (Shell) e `conteudo.html` (Payload).
- **Escopo:** Base estrutural de alta fidelidade visual preparada para renderização dinâmica futura.
- **Manutenção:** Centralizada. Mudanças no Header/Footer em um único arquivo JS afetam o portal inteiro.

---
*Este relatório deve ser mantido atualizado a cada mudança significativa na estrutura de diretórios ou na lógica de componentes do projeto.*
