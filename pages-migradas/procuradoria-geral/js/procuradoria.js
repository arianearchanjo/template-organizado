/**
 * secretarias.js — Prefeitura de Campina Grande do Sul
 *
 * Funcionalidades:
 *  1. Sistema de abas (tabs) com suporte a teclado
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */

/* ══════════════════════════════════════════════════════════════
   1. SISTEMA DE ABAS (TABS)
   Controla a troca de painéis via clique ou teclado.
   Segue o padrão ARIA: role="tab", aria-selected, aria-controls.
══════════════════════════════════════════════════════════════ */

(function () {

  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

  /**
   * Ativa a aba correspondente ao botão clicado.
   * Desativa todas as outras abas e oculta seus painéis.
   * @param {HTMLElement} btnAtivo - Botão da aba a ativar
   */
  function ativarAba(btnAtivo) {
    var alvo = btnAtivo.getAttribute('aria-controls');

    // Desativar todas as abas
    botoes.forEach(function (btn) {
      btn.classList.remove('ativo');
      btn.setAttribute('aria-selected', 'false');
    });

    // Ocultar todos os painéis
    paineis.forEach(function (painel) {
      painel.classList.remove('ativo');
    });

    // Ativar a aba e o painel selecionados
    btnAtivo.classList.add('ativo');
    btnAtivo.setAttribute('aria-selected', 'true');

    var painelAtivo = document.getElementById(alvo);
    if (painelAtivo) {
      painelAtivo.classList.add('ativo');
    }
  }

  /* Vincular eventos a cada botão de aba */
  botoes.forEach(function (btn) {

    // Clique do mouse
    btn.addEventListener('click', function () {
      ativarAba(btn);
    });

    // Suporte a teclado: Enter e Espaço ativam a aba (WCAG 2.1.1)
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ativarAba(btn);
      }
    });

  });

})();
