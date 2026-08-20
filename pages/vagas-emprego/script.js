/* ══════════════════════════════════════════════════════════════════════════
   script.js — Página de Vagas de Emprego
   Prefeitura de Campina Grande do Sul – PR

   Funcionalidades:
     1. Busca por palavra-chave (campo de texto)
     2. Filtro por área (botões)
     3. Expansão/retração dos requisitos de cada vaga (acessível)
     4. Paginação

   Convenções do projeto:
     • Inicialização idempotente (pode rodar mais de uma vez sem duplicar).
     • Usa textContent para dados do sistema sempre que possível.
     • Respeita navegação por teclado e leitores de tela (aria-expanded).
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var POR_PAGINA = 8;

  var buscaInput   = document.getElementById('vg-busca-input');
  var filtroBtns   = document.querySelectorAll('.vg-filtro-btn');
  var cards        = document.querySelectorAll('.vg-card');
  var contagemEl   = document.getElementById('vg-contagem');
  var semResultado = document.getElementById('vg-sem-resultado');

  var pagNumeros   = document.getElementById('vg-pag-numeros');
  var pagPrev      = document.getElementById('vg-pag-prev');
  var pagNext      = document.getElementById('vg-pag-next');

  var categoriaAtiva = 'todas';
  var paginaAtual   = 1;
  var cardsFiltrados = [];

  /* ── Filtrar ───────────────────────────────────────────────────────── */
  function aplicarFiltro() {
    var termo = buscaInput.value.trim().toLowerCase();
    cardsFiltrados = [];

    cards.forEach(function (card) {
      var titulo    = card.getAttribute('data-titulo') || '';
      var categoria = card.getAttribute('data-categoria') || '';
      var bateCategoria = (categoriaAtiva === 'todas' || categoria === categoriaAtiva);
      var bateBusca     = (termo === '' || titulo.indexOf(termo) !== -1);

      if (bateCategoria && bateBusca) {
        cardsFiltrados.push(card);
      }
    });

    contagemEl.textContent = cardsFiltrados.length;
    semResultado.classList.toggle('ativo', cardsFiltrados.length === 0);
    paginaAtual = 1;
    renderPaginacao();
  }

  /* ── Paginação ─────────────────────────────────────────────────────── */
  function totalPaginas() {
    return Math.max(1, Math.ceil(cardsFiltrados.length / POR_PAGINA));
  }

  function renderPaginacao() {
    var total = totalPaginas();
    if (total <= 1) {
      pagNumeros.innerHTML = '';
      pagPrev.disabled = true;
      pagNext.disabled = true;
      ocultarPagina();
      return;
    }

    /* Números */
    var html = '';
    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= paginaAtual - 1 && i <= paginaAtual + 1)) {
        html += '<button type="button" class="vg-pag-num' + (i === paginaAtual ? ' ativo' : '') +
                '" data-pagina="' + i + '" aria-label="Página ' + i + '"' +
                (i === paginaAtual ? ' aria-current="page"' : '') + '>' + i + '</button>';
      } else if (i === paginaAtual - 2 || i === paginaAtual + 2) {
        html += '<span class="vg-pag-ellipsis" aria-hidden="true">…</span>';
      }
    }
    pagNumeros.innerHTML = html;

    /* Botões prev/next */
    pagPrev.disabled = (paginaAtual === 1);
    pagNext.disabled = (paginaAtual === total);

    /* Eventos dos números */
    pagNumeros.querySelectorAll('.vg-pag-num').forEach(function (btn) {
      btn.addEventListener('click', function () {
        paginaAtual = parseInt(btn.getAttribute('data-pagina'), 10);
        renderPaginacao();
      });
    });

    ocultarPagina();
  }

  function ocultarPagina() {
    var inicio = (paginaAtual - 1) * POR_PAGINA;
    var fim    = inicio + POR_PAGINA;

    cards.forEach(function (card) { card.hidden = true; });

    cardsFiltrados.forEach(function (card, idx) {
      if (idx >= inicio && idx < fim) {
        card.hidden = false;
      }
    });

    /* Fecha accordions abertos ao mudar de página */
    document.querySelectorAll('.vg-card-header[aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      var detalhes = btn.parentElement.querySelector('.vg-card-detalhes');
      if (detalhes) detalhes.hidden = true;
    });
  }

  /* ── Eventos ───────────────────────────────────────────────────────── */
  if (buscaInput) {
    buscaInput.addEventListener('input', aplicarFiltro);
  }

  filtroBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtroBtns.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('ativo');
      btn.setAttribute('aria-pressed', 'true');
      categoriaAtiva = btn.getAttribute('data-categoria');
      aplicarFiltro();
    });
  });

  if (pagPrev) {
    pagPrev.addEventListener('click', function () {
      if (paginaAtual > 1) { paginaAtual--; renderPaginacao(); }
    });
  }

  if (pagNext) {
    pagNext.addEventListener('click', function () {
      if (paginaAtual < totalPaginas()) { paginaAtual++; renderPaginacao(); }
    });
  }

  /* ── Accordion: expansão dos requisitos de cada vaga ─────────────────── */
  document.querySelectorAll('.vg-card-header').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card     = btn.closest('.vg-card');
      var detalhes = card ? card.querySelector('.vg-card-detalhes') : null;
      if (!detalhes) return;

      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var novoEstado = !isExpanded;

      btn.setAttribute('aria-expanded', novoEstado ? 'true' : 'false');
      detalhes.hidden = !novoEstado;
    });
  });

  /* ── Inicializar ───────────────────────────────────────────────────── */
  aplicarFiltro();

})();
