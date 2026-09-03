/* ══════════════════════════════════════════════════════════════════════════
   sala.js — Página Sala do Empreendedor
   Prefeitura de Campina Grande do Sul – PR

   Funcionalidades:
     1. Scroll-spy da sidebar (destaque da seção visível)

   Convenções do projeto:
     • Inicialização idempotente (pode rodar mais de uma vez sem duplicar).
     • Respeita navegação por teclado e leitores de tela.
     • Desconecta observer quando não há mais necessidade.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PREFIX = 'se-';
  var observerRef = null;

  function iniciarScrollSpy() {
    if (observerRef) return;

    var links = document.querySelectorAll('.pi-sidebar-links a[href^="#"]');
    if (!links.length) return;

    var idMap = {};
    links.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        idMap[hash.slice(1)] = link.closest('li');
      }
    });

    var secoes = Object.keys(idMap).map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);

    if (!secoes.length) return;

    var listItems = links.length;
    for (var i = 0; i < listItems; i++) {
      links[i].removeEventListener('click', onFocusLink);
      links[i].addEventListener('click', onFocusLink);
    }

    function onFocusLink() {
      this.blur();
    }

    var ticking = false;

    function atualizarScrollSpy() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        ticking = false;
        var scrollY = window.scrollY || window.pageYOffset;
        var offset = 120;
        var active = null;

        for (var i = 0; i < secoes.length; i++) {
          var rect = secoes[i].getBoundingClientRect();
          if (rect.top <= offset) {
            active = secoes[i].id;
          }
        }

        var keys = Object.keys(idMap);
        for (var j = 0; j < keys.length; j++) {
          var li = idMap[keys[j]];
          if (!li) continue;

          var a = li.querySelector('a');
          var isActive = keys[j] === active;

          li.classList.toggle('ativo', isActive);
          if (a) {
            a.setAttribute('aria-current', isActive ? 'page' : 'false');
            var icon = a.querySelector('.pi-sidebar-ico');
            if (icon) {
              icon.classList.toggle('pi-sidebar-ico-ativo', isActive);
            }
          }
        }
      });
    }

    window.addEventListener('scroll', atualizarScrollSpy, { passive: true });
    window.addEventListener('resize', atualizarScrollSpy, { passive: true });
    atualizarScrollSpy();
  }

  function tentarIniciar() {
    if (document.querySelector('.pi-sidebar-links')) {
      iniciarScrollSpy();
      return;
    }

    if (!window.MutationObserver) return;

    observerRef = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var nodo = added[j];
          if (nodo.nodeType !== 1) continue;
          if (nodo.matches && (nodo.matches('.pi-sidebar-links') || (nodo.querySelector && nodo.querySelector('.pi-sidebar-links')))) {
            iniciarScrollSpy();
            if (observerRef) {
              observerRef.disconnect();
              observerRef = null;
            }
            return;
          }
        }
      }
    });

    observerRef.observe(document.documentElement, { childList: true, subtree: true });
  }

  tentarIniciar();

})();
