/**
 * secretarias.js — Prefeitura de Campina Grande do Sul
 */

(function () {
  'use strict';

  function initTabs() {
    var card = document.querySelector('.sec-menu-card');
    var nav = document.querySelector('.sec-tabs-nav');
    var scrollBtnLeft = document.querySelector('.sec-tabs-scroll-btn-left');
    var scrollBtnRight = document.querySelector('.sec-tabs-scroll-btn-right');
    var todosBotoes = document.querySelectorAll('.sec-tab-btn');
    var todosPaineis = document.querySelectorAll('.sec-tab-painel');

    if (!nav) return;

    // Função para rolar o menu
    function scrollMenu(direction) {
      var scrollAmount = nav.clientWidth * 0.8;
      var newScroll = nav.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      nav.scrollTo({ left: newScroll, behavior: 'smooth' });
    }

    // Gerenciar visibilidade dos botões
    function updateScrollButtons() {
      if (!nav || !scrollBtnLeft || !scrollBtnRight) return;

      var scrollLeft = Math.round(nav.scrollLeft);
      var scrollWidth = nav.scrollWidth;
      var clientWidth = nav.clientWidth;

      // Se não houver scroll possível, esconde ambos
      if (scrollWidth <= clientWidth + 5) {
        scrollBtnLeft.style.setProperty('display', 'none', 'important');
        scrollBtnRight.style.setProperty('display', 'none', 'important');
        return;
      }

      // Esquerda: mostra se não estiver no início (margem de segurança)
      if (scrollLeft > 50) {
        scrollBtnLeft.style.setProperty('display', 'flex', 'important');
      } else {
        scrollBtnLeft.style.setProperty('display', 'none', 'important');
      }

      // Direita: mostra se não estiver no fim
      if (scrollLeft + clientWidth < scrollWidth - 10) {
        scrollBtnRight.style.setProperty('display', 'flex', 'important');
      } else {
        scrollBtnRight.style.setProperty('display', 'none', 'important');
      }
    }

    // Clique nos botões físicos de scroll
    if (scrollBtnLeft) {
      scrollBtnLeft.addEventListener('click', function(e) {
        e.preventDefault();
        scrollMenu('left');
      });
    }

    if (scrollBtnRight) {
      scrollBtnRight.addEventListener('click', function(e) {
        e.preventDefault();
        scrollMenu('right');
      });
    }

    nav.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    window.addEventListener('load', updateScrollButtons);

    // Inicializa visibilidade em múltiplos estágios para garantir
    updateScrollButtons();
    setTimeout(updateScrollButtons, 100);
    setTimeout(updateScrollButtons, 500);
    setTimeout(updateScrollButtons, 1000);
    // Função central para ativar aba
    function ativarAba(btn) {
      var alvoId = btn.getAttribute('aria-controls');
      var painel = document.getElementById(alvoId);

      if (!painel) return;

      // Reset
      todosBotoes.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-selected', 'false');
      });
      todosPaineis.forEach(function (p) {
        p.classList.remove('ativo');
      });

      // Ativa
      btn.classList.add('ativo');
      btn.setAttribute('aria-selected', 'true');
      painel.classList.add('ativo');

      // Scroll suave mobile para o topo do conteúdo da aba
      if (window.innerWidth <= 991) {
        var topPos = card.getBoundingClientRect().top + window.pageYOffset - 10;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }

    // Clique em qualquer aba
    todosBotoes.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        ativarAba(btn);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }

})();
