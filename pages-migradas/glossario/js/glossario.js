'use strict';

/**
 * glossario.js — Prefeitura de Campina Grande do Sul
 *
 * 1. Gerar botões do alfabeto dinamicamente
 * 2. Filtro por letra
 * 3. Campo de pesquisa de termos
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */

document.addEventListener('DOMContentLoaded', function () {

// ── MÓDULOS DO GLOSSÁRIO (filtro + pesquisa compartilham estado via closure) ──
(function () {

  // ─── Estado compartilhado ────────────────────────────────────────────────
  var letraAtiva = 'todos';     // letra atualmente selecionada no filtro
  var dadosOriginais = [];      // cache de { card, termoEl, defEl, termoHTML, defHTML }

  var grupos       = document.querySelectorAll('.gloss-grupo');
  var semResultado = document.getElementById('gloss-sem-resultado');

  /**
   * Seletor unificado para capturar tanto os botões de letra quanto o botão "Todos".
   * O botão "Todos" usa apenas .gloss-letra-todos (sem .gloss-letra-btn),
   * por isso ambas as classes precisam constar no seletor.
   */
  var SELETOR_BOTOES_FILTRO = '.gloss-letra-btn, .gloss-letra-todos';

  /**
   * Restaura todos os textos dos cards ao HTML original (remove highlights).
   */
  function restaurarTextos() {
    dadosOriginais.forEach(function (d) {
      d.termoEl.innerHTML = d.termoHTML;
      d.defEl.innerHTML   = d.defHTML;
    });
  }

  // Inicializa o cache de textos originais
  document.querySelectorAll('.gloss-card').forEach(function (card) {
    var termoEl = card.querySelector('.gloss-termo');
    var defEl   = card.querySelector('.gloss-definicao');
    if (!termoEl || !defEl) return;
    dadosOriginais.push({
      card:      card,
      termoEl:   termoEl,
      defEl:     defEl,
      termoHTML: termoEl.innerHTML,
      defHTML:   defEl.innerHTML
    });
  });


  // ── 1. GERAR BOTÕES DO ALFABETO DINAMICAMENTE ──────────────────────────
  /**
   * Lê os grupos existentes no DOM e gera um botão por letra do alfabeto,
   * desabilitando as que não têm termos.
   * Os botões gerados recebem apenas .gloss-letra-btn (nunca .gloss-letra-todos).
   */
  (function gerarAlfabeto() {
    // Extrai letras a partir do data-grupo de cada .gloss-grupo presente no DOM
    var letrasComTermos = [];
    grupos.forEach(function (el) {
      var g = (el.dataset.grupo || '').toUpperCase().trim();
      if (g && letrasComTermos.indexOf(g) === -1) letrasComTermos.push(g);
    });

    var container = document.querySelector('.gloss-alfabeto');
    if (!container) return;

    // Limpa conteúdo anterior (evita duplicatas em re-execuções)
    container.innerHTML = '';

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letra) {
      var temTermos = letrasComTermos.indexOf(letra) !== -1;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gloss-letra-btn' + (temTermos ? '' : ' gloss-letra-vazia');
      btn.dataset.letra = letra;
      btn.textContent = letra;
      btn.disabled = !temTermos;
      btn.setAttribute('aria-label', temTermos
        ? 'Filtrar termos com a letra ' + letra
        : 'Sem termos com a letra ' + letra
      );
      btn.setAttribute('aria-pressed', 'false');
      container.appendChild(btn);
    });
  })();


  // ── 2. FILTRO POR LETRA ──────────────────────────────────────────────────
  /**
   * Exibe apenas os grupos cuja letra corresponde ao filtro selecionado.
   * Quando letra === 'todos', exibe todos os grupos.
   * @param {string} letra — Letra maiúscula ou 'todos'
   */
  function filtrarPorLetra(letra) {
    letraAtiva = letra;

    var total = 0;
    grupos.forEach(function (grupo) {
      var cards   = grupo.querySelectorAll('.gloss-card');
      var visivel = (letra === 'todos' || grupo.dataset.grupo === letra);
      grupo.style.display = visivel ? '' : 'none';
      // Restaura visibilidade individual dos cards dentro do grupo
      cards.forEach(function (c) { c.style.display = ''; });
      if (visivel) total += cards.length;
    });

    if (semResultado) semResultado.style.display = (total === 0) ? 'flex' : 'none';

    var infoResultado = document.getElementById('gloss-info-resultado');
    if (infoResultado) {
      infoResultado.textContent = (letra === 'todos') ? ''
        : (total > 0
            ? total + ' termo' + (total !== 1 ? 's' : '') + ' na letra ' + letra + '.'
            : '');
    }
  }

  /**
   * Marca visualmente o botão ativo e desmarca os demais.
   * @param {HTMLElement} btnAtivo
   */
  function marcarAtivo(btnAtivo) {
    document.querySelectorAll(SELETOR_BOTOES_FILTRO).forEach(function (b) {
      b.classList.remove('ativo');
      b.setAttribute('aria-pressed', 'false');
    });
    btnAtivo.classList.add('ativo');
    btnAtivo.setAttribute('aria-pressed', 'true');
  }

  // Delegação de eventos — botões de letra (.gloss-letra-btn) e "Todos" (.gloss-letra-todos)
  document.addEventListener('click', function (e) {
    // closest captura o botão mesmo se o clique cair em filho (ex.: ícone <i>)
    var btn = e.target.closest(SELETOR_BOTOES_FILTRO);
    if (!btn || btn.disabled) return;

    var lista = document.getElementById('gloss-lista');
    var letra = btn.dataset.letra || 'todos'; // fallback seguro

    marcarAtivo(btn);

    // Se havia pesquisa ativa, limpa antes de filtrar por letra
    var inputPesquisa = document.getElementById('gloss-input-pesquisa');
    if (inputPesquisa && inputPesquisa.value.trim().length > 0) {
      inputPesquisa.value = '';
      var btnLimpar = document.getElementById('gloss-btn-limpar');
      if (btnLimpar) btnLimpar.style.display = 'none';
      var infoPesq = document.getElementById('gloss-pesquisa-info');
      if (infoPesq) infoPesq.textContent = '';
      restaurarTextos();
    }

    filtrarPorLetra(letra);

    if (lista) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Inicializa o filtro garantindo que o estado visual coincide com letraAtiva = 'todos'
  filtrarPorLetra('todos');


  // ── 3. CAMPO DE PESQUISA ──────────────────────────────────────────────────
  (function campoPesquisa() {
    var input     = document.getElementById('gloss-input-pesquisa');
    var btnLimpar = document.getElementById('gloss-btn-limpar');
    var infoPesq  = document.getElementById('gloss-pesquisa-info');
    var infoLetra = document.getElementById('gloss-info-resultado');

    if (!input) return;

    /** Escapa caracteres especiais de regex na string fornecida. */
    function escaparRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Envolve todas as ocorrências de `termo` em `texto` com <mark>.
     * @param {string} texto
     * @param {string} termo
     * @returns {string}
     */
    function destacar(texto, termo) {
      var re = new RegExp('(' + escaparRegex(termo) + ')', 'gi');
      return texto.replace(re, '<mark class="gloss-highlight">$1</mark>');
    }

    /**
     * Filtra os cards pelo texto da query e aplica destaques nas ocorrências.
     * Sem query, restaura o estado do filtro por letra.
     * @param {string} query
     */
    function pesquisar(query) {
      var q = query.trim();

      // Sem texto: volta ao estado do filtro por letra
      if (q.length === 0) {
        restaurarTextos();
        filtrarPorLetra(letraAtiva);
        if (infoPesq) infoPesq.textContent = '';
        if (btnLimpar) btnLimpar.style.display = 'none';
        return;
      }

      // Com texto: ignora filtro por letra — mostra todos os grupos temporariamente
      grupos.forEach(function (g) { g.style.display = ''; });
      if (infoLetra) infoLetra.textContent = '';

      // Restaura textos antes de reaplicar destaques
      restaurarTextos();

      var totalEncontrados = 0;

      grupos.forEach(function (grupo) {
        var algumVisivel = false;

        grupo.querySelectorAll('.gloss-card').forEach(function (card) {
          var termoEl    = card.querySelector('.gloss-termo');
          var defEl      = card.querySelector('.gloss-definicao');
          var textoTotal = (termoEl ? termoEl.textContent : '') + ' ' + (defEl ? defEl.textContent : '');

          if (new RegExp(escaparRegex(q), 'i').test(textoTotal)) {
            card.style.display = '';
            if (termoEl) termoEl.innerHTML = destacar(termoEl.textContent, q);
            if (defEl)   defEl.innerHTML   = destacar(defEl.textContent,   q);
            totalEncontrados++;
            algumVisivel = true;
          } else {
            card.style.display = 'none';
          }
        });

        grupo.style.display = algumVisivel ? '' : 'none';
      });

      if (semResultado) semResultado.style.display = (totalEncontrados === 0) ? 'flex' : 'none';

      if (infoPesq) {
        var plural = totalEncontrados !== 1;
        infoPesq.textContent = totalEncontrados > 0
          ? totalEncontrados + ' termo' + (plural ? 's' : '') + ' encontrado' + (plural ? 's' : '') + ' para "' + q + '".'
          : 'Nenhum termo encontrado para "' + q + '".';
      }
    }

    // Digitação com debounce de 180 ms
    var debounceTimer;
    input.addEventListener('input', function () {
      var q = input.value;
      if (btnLimpar) btnLimpar.style.display = q.length > 0 ? 'block' : 'none';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { pesquisar(q); }, 180);
    });

    // ESC limpa o campo
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.blur();
      }
    });

    // Botão ×
    if (btnLimpar) {
      btnLimpar.addEventListener('click', function () {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    }
  })();

})(); // fim do módulo glossário

}); // fim do DOMContentLoaded
