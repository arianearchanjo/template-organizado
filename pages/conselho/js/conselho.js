/**
 * conselho.js — Template de Páginas de Conselhos Municipais
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Módulos:
 *   1. Navegação de abas (tabs com ARIA)
 *   2. Acordeon de arquivos (ARIA)
 *   3. Botão "Voltar ao topo"
 *   4. Inicialização
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */

(function () {
  'use strict';


  /* ══════════════════════════════════════════════════════════════════════
     1. NAVEGAÇÃO DE ABAS
     Gerencia a troca de painéis com suporte a ARIA e navegação
     por teclado (setas esquerda/direita conforme WAI-ARIA Authoring).
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarAbas() {
    var nav    = document.querySelector('.cn-abas-nav');
    if (!nav) return;

    var botoes = nav.querySelectorAll('.cn-aba-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        ativarAba(btn, botoes);
      });

      /* Navegação por teclado: setas + Home + End */
      btn.addEventListener('keydown', function (e) {
        var idx = Array.prototype.indexOf.call(botoes, btn);

        if (e.key === 'ArrowRight' || e.keyCode === 39) {
          e.preventDefault();
          var prox = botoes[(idx + 1) % botoes.length];
          prox.focus();
          ativarAba(prox, botoes);
        }

        if (e.key === 'ArrowLeft' || e.keyCode === 37) {
          e.preventDefault();
          var ant = botoes[(idx - 1 + botoes.length) % botoes.length];
          ant.focus();
          ativarAba(ant, botoes);
        }

        if (e.key === 'Home') {
          e.preventDefault();
          botoes[0].focus();
          ativarAba(botoes[0], botoes);
        }

        if (e.key === 'End') {
          e.preventDefault();
          botoes[botoes.length - 1].focus();
          ativarAba(botoes[botoes.length - 1], botoes);
        }
      });
    });
  }

  /**
   * Ativa a aba clicada e exibe o painel correspondente.
   * Desativa todas as outras abas e oculta seus painéis.
   *
   * @param {HTMLElement} abaAtiva  — botão da aba a ativar
   * @param {NodeList}    todosBtns — todos os botões da navegação
   */
  function ativarAba(abaAtiva, todosBtns) {
    todosBtns.forEach(function (btn) {
      var painel = document.getElementById(btn.getAttribute('aria-controls'));
      var esteAtivo = btn === abaAtiva;

      btn.classList.toggle('cn-aba-ativa', esteAtivo);
      btn.setAttribute('aria-selected', esteAtivo ? 'true' : 'false');
      btn.setAttribute('tabindex', esteAtivo ? '0' : '-1');

      if (painel) {
        if (esteAtivo) {
          painel.removeAttribute('hidden');
          painel.classList.add('cn-painel-ativo');
        } else {
          painel.setAttribute('hidden', '');
          painel.classList.remove('cn-painel-ativo');
        }
      }
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     2. ACORDEON DE ARQUIVOS
     Abre/fecha cada bloco de arquivos ao clicar no botão.
     Suporte a ARIA (aria-expanded) e animação de ícone.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarAcordeon() {
    var botoes = document.querySelectorAll('.cn-acordeon-btn');

    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idCorpo  = btn.getAttribute('aria-controls');
        var corpo    = document.getElementById(idCorpo);
        var aberto   = btn.getAttribute('aria-expanded') === 'true';

        if (!corpo) return;

        if (aberto) {
          /* Fechar */
          btn.setAttribute('aria-expanded', 'false');
          corpo.setAttribute('hidden', '');
        } else {
          /* Abrir */
          btn.setAttribute('aria-expanded', 'true');
          corpo.removeAttribute('hidden');
        }
      });
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     3. BOTÃO "VOLTAR AO TOPO"
     Aparece após rolar 300px. Ao clicar, retorna suavemente ao início.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarBtnTopo() {
    var btn = document.getElementById('cn-btn-topo');
    if (!btn) return;

    /* Exibe/oculta conforme posição do scroll */
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 300) {
        btn.classList.add('cn-btn-topo-visivel');
      } else {
        btn.classList.remove('cn-btn-topo-visivel');
      }
    }, { passive: true });

    /* Rola ao topo ao clicar */
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. INICIALIZAÇÃO
     Aguarda o DOM estar pronto antes de executar todos os módulos.
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    inicializarAbas();
    inicializarAcordeon();
    inicializarBtnTopo();
  });

})();
