/**
 * acessibilidade-component.js — Barra de Acessibilidade (Web Component unificado)
 * Prefeitura de Campina Grande do Sul – PR
 *
 * Uso em qualquer página:
 *   1. Carregue este arquivo:  <script src="path/to/acessibilidade-component.js" defer></script>
 *   2. Use a tag no HTML:      <barra-acessibilidade></barra-acessibilidade>
 *
 * Módulos internos:
 *   1. Controle de Fonte (eMAG)
 *   2. Alto Contraste (eMAG)
 *   3. VLibras
 *   4. Atalhos de Teclado (eMAG) — Alt+1, Alt+2, Alt+3
 *   5. Text-to-Speech (único botão inteligente)
 *        • Clique 1 : ativa modo cursor/foco — lê o elemento sob o mouse / em foco
 *        • Clique 2 : para a leitura e desativa o modo
 *        • Tooltip  : "Converter o texto em áudio"
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     CONFIGURAÇÕES GLOBAIS
  ════════════════════════════════════════════════════════════════════════ */

  var FONTE_BASE = 16;
  var FONTE_MIN  = 12;
  var FONTE_MAX  = 26;
  var FONTE_STEP = 2;

  var FONTE_KEY     = 'pmcgs_fontSize';
  var CONTRASTE_KEY = 'pmcgs_highContrast';


  /* ══════════════════════════════════════════════════════════════════════
     1. CONTROLE DE FONTE
  ════════════════════════════════════════════════════════════════════════ */

  function aplicarFonte(px) {
    px = Math.min(FONTE_MAX, Math.max(FONTE_MIN, px));
    document.documentElement.style.fontSize = px + 'px';
    try { localStorage.setItem(FONTE_KEY, px); } catch (e) {}
  }

  function fonteAtual() {
    var fs = document.documentElement.style.fontSize;
    return fs ? parseInt(fs, 10) : FONTE_BASE;
  }

  (function restaurarFonte() {
    try {
      var salvo = parseInt(localStorage.getItem(FONTE_KEY), 10);
      if (salvo && salvo >= FONTE_MIN && salvo <= FONTE_MAX) aplicarFonte(salvo);
    } catch (e) {}
  })();


  /* ══════════════════════════════════════════════════════════════════════
     2. ALTO CONTRASTE
  ════════════════════════════════════════════════════════════════════════ */

  function aplicarContraste(ativo) {
    document.body.classList.toggle('high-contrast', ativo);
    ['pi-btn-contraste', 'pi-sb-btn-contraste'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    try { localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0'); } catch (e) {}
  }

  (function restaurarContraste() {
    try {
      if (localStorage.getItem(CONTRASTE_KEY) === '1') aplicarContraste(true);
    } catch (e) {}
  })();


  /* ══════════════════════════════════════════════════════════════════════
     UTILITÁRIO: vincula clique a elemento pelo ID
  ════════════════════════════════════════════════════════════════════════ */

  function bind(id, fn) {
    // Usa delegação de eventos no document para garantir que funcione
    // mesmo que o elemento seja adicionado dinamicamente (Web Components)
    // ou carregado após este script.
    document.addEventListener('click', function (e) {
      var target = e.target.closest('#' + id);
      if (target) {
        e.preventDefault();
        fn();
      }
    });
  }


  /* ══════════════════════════════════════════════════════════════════════
     4. ATALHOS DE TECLADO (eMAG 3.1)
     Alt+1 → conteúdo principal / Alt+2 → menu / Alt+3 → rodapé
  ════════════════════════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    // Melhoria 2: Escape desativa o TTS se estiver ativo
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (TTS && TTS.estaAtivo && TTS.estaAtivo()) {
        TTS.toggle();
      }
      return;
    }

    if (!e.altKey) return;

    // Melhoria 5: Alt+0 foca a própria barra de acessibilidade (eMAG)
    if (e.key === '0' || e.keyCode === 48) {
      e.preventDefault();
      var barra = document.getElementById('barra-topo');
      if (barra) { barra.setAttribute('tabindex', '-1'); barra.focus(); barra.scrollIntoView({ behavior: 'smooth' }); }
    }
    if (e.key === '1' || e.keyCode === 49) {
      e.preventDefault();
      var conteudo = document.getElementById('pi-conteudo');
      if (conteudo) { conteudo.setAttribute('tabindex', '-1'); conteudo.focus(); conteudo.scrollIntoView({ behavior: 'smooth' }); }
    }
    if (e.key === '2' || e.keyCode === 50) {
      e.preventDefault();
      var primeiroLink = document.querySelector('#pi-nav-list .nav-link');
      if (primeiroLink) primeiroLink.focus();
    }
    if (e.key === '3' || e.keyCode === 51) {
      e.preventDefault();
      var rodape = document.getElementById('pi-footer');
      if (rodape) rodape.scrollIntoView({ behavior: 'smooth' });
    }
  });


  /* ══════════════════════════════════════════════════════════════════════
     5. TEXT-TO-SPEECH — botão único inteligente
     ──────────────────────────────────────────────────────────────────────
     Um único botão (#pi-btn-tts) com dois estados:

       DESATIVADO (padrão)
         • Ícone: fa-headphones
         • Tooltip: "Converter o texto em áudio"
         • aria-pressed="false"
         → Clique: ATIVA o modo cursor

       ATIVADO
         • Ícone: fa-assistive-listening-systems  (indica "escutando")
         • Tooltip: "Desativar leitura de texto"
         • aria-pressed="true"
         • Anel pulsante verde no botão
         • Cursor customizado na área de conteúdo
         → O sistema lê automaticamente o elemento semântico
           sob o cursor (mouseover) ou em foco via teclado (focusin)
         → Clique novamente: DESATIVA e para a leitura

     Comportamento de leitura por cursor/foco:
       • Debounce 400ms — só lê quando o cursor "pousa" no elemento
       • Anti-repetição — não relê o mesmo texto consecutivamente
       • Promoção ao ancestral semântico — lê o <p>, <h2>, <li>
         mais próximo, não o elemento filho clicado
       • Highlight outline no elemento em leitura (sem afetar layout)
       • Ignora barra de acessibilidade, aria-hidden e elementos ocultos
       • Extrai apenas texto visível (ignora script, nav, footer, etc.)

     Voz: seleciona pt-BR automaticamente, com fallback seguro.
     Chrome keep-alive: pause/resume a cada 10s evita corte silencioso.
  ════════════════════════════════════════════════════════════════════════ */

  var TTS = (function () {

    /* ── Constantes ─────────────────────────────────────────────────── */

    var TAGS_IGNORADAS = [
      'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME',
      'NAV', 'HEADER', 'FOOTER',
      'BUTTON', 'SELECT', 'OPTION', 'svg', 'IMG'
    ];

    // Tags semânticas elegíveis para leitura por cursor
    var TAGS_CURSOR = [
      'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'LI', 'A', 'SPAN', 'LABEL',
      'TD', 'TH', 'CAPTION', 'BLOCKQUOTE', 'FIGCAPTION'
    ];

    var RATE          = 0.95; // Velocidade de fala (levemente pausado)
    var PITCH         = 1.0;
    var CURSOR_MIN    = 8;    // Mínimo de chars para disparar leitura
    var DEBOUNCE_MS   = 400;  // Delay de debounce (ms)

    /* ── Estado ─────────────────────────────────────────────────────── */

    var _ativo             = false; // Modo cursor ativo ou não
    var _voz               = null;  // SpeechSynthesisVoice selecionada
    var _ultimoTexto       = '';    // Anti-repetição
    var _elementoDestacado = null;  // Referência ao elemento com outline
    var _timerDebounce     = null;  // ID do setTimeout do debounce

    /* ── Suporte ────────────────────────────────────────────────────── */

    function suportado() {
      return ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined');
    }

    /* ── Seleção de voz pt-BR ───────────────────────────────────────── */

    function selecionarVoz() {
      var vozes = window.speechSynthesis.getVoices();
      if (!vozes || !vozes.length) return null;
      return vozes.find(function (v) { return v.lang.toLowerCase() === 'pt-br'; })
          || vozes.find(function (v) { return v.lang.toLowerCase().startsWith('pt'); })
          || vozes[0]
          || null;
    }

    /**
     * Garante voz carregada antes de falar.
     * Chrome carrega vozes de forma assíncrona via evento 'voiceschanged'.
     * Polling de 100ms com limite de 20 tentativas (~2s) como fallback.
     */
    function garantirVoz(callback) {
      _voz = selecionarVoz();
      if (_voz) { callback(); return; }
      var n = 0;
      var t = setInterval(function () {
        _voz = selecionarVoz();
        if (_voz || ++n > 20) { clearInterval(t); callback(); }
      }, 100);
    }

    /* ── Extração de texto ──────────────────────────────────────────── */

    /**
     * Extrai texto visível e útil de um elemento DOM.
     * Ignora: tags de sistema, elementos ocultos (CSS), aria-hidden,
     * roles de navegação/banner e qualquer nó não-texto.
     */
    function extrairTexto(el) {
      if (!el) return '';
      if (el.nodeType === Node.TEXT_NODE) return el.textContent.trim();

      var st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return '';
      if (TAGS_IGNORADAS.indexOf(el.tagName) !== -1) return '';

      var role = (el.getAttribute('role') || '').toLowerCase();
      if (role === 'navigation' || role === 'banner' || role === 'complementary') return '';
      if (el.getAttribute('aria-hidden') === 'true') return '';

      var partes = [];
      el.childNodes.forEach(function (filho) {
        var t = extrairTexto(filho);
        if (t) partes.push(t);
      });
      return partes.join(' ');
    }

    /* ── Highlight do elemento lido ─────────────────────────────────── */

    // Aplica outline sutil sem deslocar layout (outline ≠ border)
    function destacar(el) {
      removerDestaque();
      if (!el) return;
      _elementoDestacado = el;
      el.setAttribute('data-tts-highlight', 'true');
    }

    function removerDestaque() {
      if (_elementoDestacado) {
        _elementoDestacado.removeAttribute('data-tts-highlight');
        _elementoDestacado = null;
      }
    }

    /* ── Promoção ao ancestral semântico ────────────────────────────── */

    /**
     * Sobe na árvore DOM a partir de `el` até encontrar uma tag
     * de TAGS_CURSOR. Limita a 6 níveis e não sai de #pi-conteudo.
     * Garante que lemos o <p> ou <h2> e não o <strong> ou <em> filho.
     */
    function promoverSemantico(el) {
      if (!el || el === document.body) return null;
      var limite   = 6;
      var conteudo = document.getElementById('pi-conteudo');
      var c        = el;
      while (c && c !== document.body && limite-- > 0) {
        if (conteudo && !conteudo.contains(c)) return null;
        if (TAGS_CURSOR.indexOf(c.tagName || '') !== -1) return c;
        c = c.parentElement;
      }
      return null;
    }

    /* ── Leitura de elemento único ──────────────────────────────────── */

    /**
     * Lê o texto de um elemento com uma única SpeechSynthesisUtterance.
     * Cancela qualquer fala anterior antes de começar (sem sobreposição).
     * Remove o destaque ao fim ou em caso de erro.
     */
    function lerElemento(texto, el) {
      window.speechSynthesis.cancel();

      var u = new SpeechSynthesisUtterance(texto);
      if (_voz) u.voice = _voz;
      u.lang  = (_voz && _voz.lang) ? _voz.lang : 'pt-BR';
      u.rate  = RATE;
      u.pitch = PITCH;

      u.onend   = function () { removerDestaque(); };
      u.onerror = function (ev) {
        if (ev.error !== 'interrupted' && ev.error !== 'canceled') {
          console.warn('[TTS] Erro:', ev.error);
        }
        removerDestaque();
      };

      destacar(el);
      window.speechSynthesis.speak(u);
    }

    /* ── Handler mouseover / focusin ────────────────────────────────── */

    /**
     * Callback compartilhado para 'mouseover' e 'focusin'.
     *
     * Fluxo:
     *   1. Guarda: sai se _ativo === false
     *   2. Ignora elementos da própria barra de acessibilidade
     *   3. Ignora aria-hidden
     *   4. Promove ao ancestral semântico (TAGS_CURSOR)
     *   5. Extrai e valida o texto (mínimo CURSOR_MIN chars)
     *   6. Anti-repetição: suprime se igual ao último texto
     *   7. Debounce DEBOUNCE_MS: cancela timer anterior, agenda leitura.
     *      Dentro do timer, revalida _ativo (pode ter mudado no delay).
     */
    function _onCursor(e) {
      if (!_ativo) return;

      var alvo = e.target;
      if (!alvo || alvo.nodeType !== Node.ELEMENT_NODE) return;

      // Ignora a barra de acessibilidade
      var barra = document.getElementById('barra-topo');
      if (barra && barra.contains(alvo)) return;

      if (alvo.getAttribute('aria-hidden') === 'true') return;

      var elAlvo = promoverSemantico(alvo);
      if (!elAlvo) return;

      var texto = extrairTexto(elAlvo).replace(/\s+/g, ' ').trim();
      if (!texto || texto.length < CURSOR_MIN) return;
      if (texto === _ultimoTexto) return;

      // Debounce: só lê quando o cursor "pousa" no elemento
      clearTimeout(_timerDebounce);
      _timerDebounce = setTimeout(function () {
        if (!_ativo) return;
        _ultimoTexto = texto;
        if (!_voz) {
          garantirVoz(function () { lerElemento(texto, elAlvo); });
        } else {
          lerElemento(texto, elAlvo);
        }
      }, DEBOUNCE_MS);
    }

    /* ── Atualização do botão único ─────────────────────────────────── */

    /**
     * Sincroniza o botão #pi-btn-tts com o estado _ativo.
     *
     * Desativado → fa-headphones   | "Converter o texto em áudio"
     * Ativado    → fa-assistive-listening-systems | "Desativar leitura de texto"
     */
    function atualizarBotao() {
      var btn = document.getElementById('pi-btn-tts');
      if (!btn) return;
      var icone = btn.querySelector('i');

      if (_ativo) {
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Desativar leitura de texto');
        btn.setAttribute('title', 'Desativar leitura de texto');
        btn.classList.add('tts-ativo');
        if (icone) { icone.className = 'fas fa-assistive-listening-systems'; icone.setAttribute('aria-hidden', 'true'); }
      } else {
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Converter o texto em áudio');
        btn.setAttribute('title', 'Converter o texto em áudio');
        btn.classList.remove('tts-ativo');
        if (icone) { icone.className = 'fas fa-headphones'; icone.setAttribute('aria-hidden', 'true'); }
      }
    }

    /* ── Toast de feedback visual (estilo Elotech) ──────────────────── */

    /**
     * Exibe um toast no canto superior direito da tela, igual ao padrão
     * do sistema Elotech: faixa verde com label "Informação" em negrito
     * e uma mensagem descritiva abaixo.
     *
     * Comportamento:
     *   • Aparece com fade-in + slide (translateY) suave
     *   • Some automaticamente após `duracao` ms (padrão 3000)
     *   • Um novo toast cancela o anterior se ainda estiver visível
     *   • Botão × permite fechar manualmente
     *   • Acessível: role="alert" + aria-live="assertive"
     *   • Um único container #pi-tts-toast é reutilizado entre chamadas
     *
     * @param {string} mensagem  Texto principal do toast
     * @param {number} [duracao] Tempo de exibição em ms (padrão: 3000)
     */
    var _toastTimer = null; // ID do setTimeout de auto-remoção

    function mostrarToast(mensagem, duracao) {
      duracao = duracao || 3000;

      // Cancela auto-remoção de toast anterior
      clearTimeout(_toastTimer);

      // Reutiliza ou cria o container do toast
      var toast = document.getElementById('pi-tts-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pi-tts-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toast);
      }

      // Constrói o conteúdo interno (label + mensagem + botão fechar)
      toast.innerHTML =
        '<div class="pi-toast-inner">' +
          '<div class="pi-toast-header">' +
            '<span class="pi-toast-label">Informação</span>' +
            '<button class="pi-toast-close" aria-label="Fechar notificação" type="button">&#x2715;</button>' +
          '</div>' +
          '<p class="pi-toast-msg">' + mensagem + '</p>' +
        '</div>';

      // Botão de fechar manual
      toast.querySelector('.pi-toast-close').addEventListener('click', function () {
        fecharToast(toast);
      });

      // Força reflow para a transição de entrada funcionar mesmo em chamadas
      // consecutivas (o navegador precisa "ver" o estado anterior antes de animar)
      toast.classList.remove('pi-toast-saindo');
      void toast.offsetWidth; // reflow intencional
      toast.classList.add('pi-toast-visivel');

      // Auto-remoção após `duracao` ms
      _toastTimer = setTimeout(function () { fecharToast(toast); }, duracao);
    }

    /**
     * Inicia a animação de saída do toast e o remove do DOM ao terminar.
     * @param {HTMLElement} toast - O elemento #pi-tts-toast
     */
    function fecharToast(toast) {
      if (!toast) return;
      clearTimeout(_toastTimer);
      toast.classList.remove('pi-toast-visivel');
      toast.classList.add('pi-toast-saindo');
      // Remove do DOM após a transição de saída (300ms)
      setTimeout(function () {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }

    /* ── Ativar / Desativar ─────────────────────────────────────────── */

    /**
     * Ativa o modo cursor/foco.
     * Registra listeners com { passive: true } — não bloqueia scroll.
     * Aplica cursor customizado na área de conteúdo (#pi-conteudo).
     * Exibe toast de confirmação ao usuário.
     */
    function ativar() {
      if (_ativo) return;
      _ativo       = true;
      _ultimoTexto = '';
      document.addEventListener('mouseover', _onCursor, { passive: true });
      document.addEventListener('focusin',   _onCursor, { passive: true });
      var c = document.getElementById('pi-conteudo');
      if (c) c.classList.add('tts-cursor-mode');
      atualizarBotao();
      mostrarToast('Conversor de texto para áudio ativado!');
    }

    /**
     * Desativa o modo cursor/foco.
     * Remove exatamente os listeners registrados em ativar()
     * (mesma referência _onCursor, necessária para removeEventListener).
     * Limpa highlight, cancela debounce pendente e para qualquer fala.
     * Exibe toast de confirmação ao usuário.
     */
    function desativar() {
      if (!_ativo) return;
      _ativo = false;
      document.removeEventListener('mouseover', _onCursor);
      document.removeEventListener('focusin',   _onCursor);
      clearTimeout(_timerDebounce);
      removerDestaque();
      window.speechSynthesis.cancel();
      _ultimoTexto = '';
      var c = document.getElementById('pi-conteudo');
      if (c) c.classList.remove('tts-cursor-mode');
      atualizarBotao();
      mostrarToast('Conversor de texto para áudio desativado!');
    }

    /**
     * Toggle público: ativa se desativado, desativa (e para) se ativado.
     * Chamado pelo clique em #pi-btn-tts.
     */
    function toggle() {
      if (!suportado()) {
        // Melhoria 7: toast acessível no lugar de alert() bloqueante
        mostrarToast('Seu navegador não suporta leitura de texto em áudio.');
        return;
      }
      _ativo ? desativar() : ativar();
    }

    // Limpeza ao sair da página
    window.addEventListener('beforeunload', function () {
      if (suportado()) window.speechSynthesis.cancel();
    });

    // Workaround Chrome: keep-alive para evitar corte silencioso após ~15s
    if (suportado()) {
      setInterval(function () {
        if (_ativo && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    }

    return { toggle: toggle, suportado: suportado, estaAtivo: function () { return _ativo; } };

  })(); // fim do módulo TTS


  /* ══════════════════════════════════════════════════════════════════════
     WEB COMPONENT: <barra-acessibilidade>
  ════════════════════════════════════════════════════════════════════════ */

  class Acessibilidade extends HTMLElement {
    connectedCallback() {
      var base = typeof getBasePath === 'function' ? getBasePath() : '';

      this.innerHTML = `
        <div id="barra-topo" role="banner" lang="pt-BR">
          <div class="container">
            <div class="barra-inner">

              <div class="barra-acesso" aria-label="Controles de acessibilidade">
                <span aria-hidden="true">Acessibilidade</span>
                <a href="#" id="pi-btn-fonte-aumentar" role="button" aria-label="Aumentar fonte">A+</a>
                <a href="#" id="pi-btn-fonte-diminuir" role="button" aria-label="Diminuir fonte">A-</a>
                <a href="#" id="pi-btn-fonte-resetar"  role="button" aria-label="Restaurar fonte">A</a>
                <a href="#" id="pi-btn-contraste" class="barra-acesso-contraste"
                   role="button" aria-label="Ativar alto contraste" aria-pressed="false" title="Alto contraste">
                  <i class="fas fa-adjust" aria-hidden="true"></i>
                </a>

                <!-- ── Botão TTS único (Módulo 5) ─────────────────────────────
                     Clique 1: ativa leitura por cursor/foco
                               ícone → fa-assistive-listening-systems
                               tooltip → "Desativar leitura de texto"
                     Clique 2: desativa e para tudo
                               ícone → fa-headphones
                               tooltip → "Converter o texto em áudio"
                ──────────────────────────────────────────────────────────── -->
                <a href="#" id="pi-btn-tts"
                   role="button"
                   aria-label="Converter o texto em áudio"
                   aria-pressed="false"
                   title="Converter o texto em áudio"
                   class="barra-acesso-tts">
                  <i class="fas fa-headphones" aria-hidden="true"></i>
                </a>

                <a href="../acessibilidade/" class="barra-acesso-icone" title="Página de Acessibilidade">
                  <i class="fas fa-universal-access" aria-hidden="true"></i>
                </a>
              </div>

              <div class="barra-sep" aria-hidden="true"></div>

              <nav class="barra-badges" aria-label="Acesso rápido">
                <a href="../mapa-site/"
                   aria-label="Mapa do site"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-sitemap" aria-hidden="true"></i>&nbsp; MAPA DO SITE
                </a>
                <a href="../e-sic/"
                   aria-label="Acesso à informação"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-info-circle" aria-hidden="true"></i>&nbsp; ACESSO À INFORMAÇÃO
                </a>
                <a href="../ouvidoria/"
                   aria-label="Ouvidoria"
                   class="barra-acesso-icone" style="width:auto; padding:0 10px; font-size:10px; font-weight:700;">
                  <i class="fas fa-comments" aria-hidden="true"></i>&nbsp; OUVIDORIA
                </a>
              </nav>

              <div class="barra-sep" aria-hidden="true"></div>

              <div class="barra-info-bloco" aria-label="Informações de atendimento">
                <div class="barra-horario">
                  <i class="fas fa-clock"></i>
                  <div class="barra-horario-texto">
                    <span class="barra-horario-dias">Seg – Sex</span>
                    <span class="barra-horario-horas">08h30–12h · 13h30–17h30</span>
                  </div>
                </div>
                <div class="barra-sep" aria-hidden="true"></div>
                <a href="tel:+554131627000" class="barra-telefone">
                  <span>(41) 3162-7000</span> <small>PREFEITURA</small>
                </a>
              </div>

            </div>
          </div>
        </div>
      `;

      this._bindBotoes();

      // Sincroniza estado do contraste com botão recém-criado
      var contrasteAtivo = document.body.classList.contains('high-contrast');
      var btnContraste = document.getElementById('pi-btn-contraste');
      if (btnContraste) btnContraste.setAttribute('aria-pressed', contrasteAtivo ? 'true' : 'false');

      this._injetarEstilosTTS();
    }

    _bindBotoes() {
      bind('pi-btn-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
      bind('pi-btn-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
      bind('pi-btn-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
      bind('pi-btn-contraste', function () {
        aplicarContraste(!document.body.classList.contains('high-contrast'));
      });

      // Botão TTS único — toggle on/off do modo cursor
      bind('pi-btn-tts', function () { TTS.toggle(); });

      // Sidebar (se existir na página)
      bind('pi-sb-fonte-aumentar', function () { aplicarFonte(fonteAtual() + FONTE_STEP); });
      bind('pi-sb-fonte-diminuir', function () { aplicarFonte(fonteAtual() - FONTE_STEP); });
      bind('pi-sb-fonte-resetar',  function () { aplicarFonte(FONTE_BASE); });
      bind('pi-sb-btn-contraste', function () {
        aplicarContraste(!document.body.classList.contains('high-contrast'));
      });
    }

    /**
     * Injeta estilos do botão TTS e do modo cursor diretamente no <head>.
     * Sem dependência de CSS externo.
     *
     * Inclui:
     *   • Transição suave do botão
     *   • Estado ativo: fundo verde + anel pulsante (indica "escutando")
     *   • Highlight outline no elemento lido ([data-tts-highlight])
     *   • Cursor SVG customizado na área de conteúdo (.tts-cursor-mode)
     *   • Respeito a prefers-reduced-motion (WCAG 2.3.3)
     */
    _injetarEstilosTTS() {
      if (document.getElementById('pi-tts-styles')) return;

      var style = document.createElement('style');
      style.id = 'pi-tts-styles';
      style.textContent = `

        /* ── Botão TTS (#pi-btn-tts) ─────────────────────────────────── */

        #pi-btn-tts {
          transition: color 0.2s ease, background-color 0.2s ease,
                      opacity 0.2s ease, box-shadow 0.2s ease;
        }

        /* Estado ATIVO: modo escuta ligado */
        #pi-btn-tts.tts-ativo,
        #pi-btn-tts[aria-pressed="true"] {
          color: #fff !important;
          background-color: var(--cor-primaria, #1a5276) !important;
          border-radius: 3px;
          opacity: 1 !important;
          /* Anel pulsante indica "escuta ativa" */
          animation: tts-ring 2s ease-in-out infinite;
        }

        @keyframes tts-ring {
          0%,  100% { box-shadow: 0 0 0 2px var(--cor-primaria, #1a5276), 0 0 0 4px rgba(26,82,118,0.28); }
          50%        { box-shadow: 0 0 0 2px var(--cor-primaria, #1a5276), 0 0 0 7px rgba(26,82,118,0.08); }
        }

        /* ── Highlight do elemento sendo lido ────────────────────────── */
        /* outline não afeta o fluxo do documento — nunca desloca layout */

        [data-tts-highlight="true"] {
          outline: 2px solid var(--cor-primaria, #1a5276) !important;
          outline-offset: 3px !important;
          border-radius: 2px;
        }

        /* ── Cursor customizado na área de conteúdo (modo ativo) ─────── */
        /* SVG inline (data URI) — sem dependência de arquivo externo     */

        .tts-cursor-mode,
        .tts-cursor-mode p,
        .tts-cursor-mode h1, .tts-cursor-mode h2, .tts-cursor-mode h3,
        .tts-cursor-mode h4, .tts-cursor-mode h5, .tts-cursor-mode h6,
        .tts-cursor-mode li, .tts-cursor-mode a, .tts-cursor-mode span,
        .tts-cursor-mode td, .tts-cursor-mode th {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Ccircle cx='11' cy='11' r='10' fill='%231a5276' opacity='0.15'/%3E%3Cpath d='M7 8.5v5l3.5-1.75L14 13.5v-5' stroke='%231a5276' stroke-width='1.5' fill='none' stroke-linejoin='round'/%3E%3C/svg%3E") 11 11, pointer !important;
        }

        /* ── Respeita prefers-reduced-motion (WCAG 2.3.3) ───────────── */

        @media (prefers-reduced-motion: reduce) {
          #pi-btn-tts.tts-ativo,
          #pi-btn-tts[aria-pressed="true"] {
            animation: none !important;
            box-shadow: 0 0 0 2px var(--cor-primaria, #1a5276) !important;
          }
        }

        /* ── Melhoria 6: focus-visible nos controles da barra (WCAG 2.4.7) ── */
        /* Garante indicador de foco visível em navegação por teclado          */

        #pi-btn-fonte-aumentar:focus-visible,
        #pi-btn-fonte-diminuir:focus-visible,
        #pi-btn-fonte-resetar:focus-visible,
        #pi-btn-contraste:focus-visible,
        #pi-btn-tts:focus-visible {
          outline: 3px solid var(--cor-primaria, #1a5276) !important;
          outline-offset: 2px !important;
          border-radius: 2px;
        }

        /* Remove outline do foco programático em elementos-âncora de navegação */
        /* (tabindex="-1" é adicionado via JS apenas para scroll/foco por atalho) */
        #barra-topo:focus,
        #pi-conteudo:focus,
        #pi-footer:focus {
          outline: none !important;
        }

        /* ════════════════════════════════════════════════════════════
           TOAST DE FEEDBACK VISUAL (estilo Elotech)
           Posicionado no canto superior direito, faixa verde,
           label "Informação" + mensagem + botão fechar.
        ════════════════════════════════════════════════════════════ */

        #pi-tts-toast {
          position: fixed;
          top: 72px;               /* abaixo da barra de acessibilidade  */
          right: 16px;
          z-index: 99999;
          min-width: 260px;
          max-width: 340px;
          pointer-events: none;    /* invisível ao mouse antes de aparecer */

          /* Estado inicial: fora da tela, invisível */
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        /* Estado visível: entra com fade + slide para baixo */
        #pi-tts-toast.pi-toast-visivel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* Estado saindo: sai com fade + slide para cima */
        #pi-tts-toast.pi-toast-saindo {
          opacity: 0;
          transform: translateY(-12px);
          pointer-events: none;
        }

        /* Container interno com borda esquerda verde e sombra */
        .pi-toast-inner {
          background: #fff;
          border-left: 5px solid #2e7d32;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10);
          overflow: hidden;
          font-family: inherit;
        }

        /* Cabeçalho: label verde + botão fechar */
        .pi-toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #2e7d32;
          padding: 6px 10px 6px 12px;
        }

        .pi-toast-label {
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Botão × de fechar */
        .pi-toast-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          padding: 0 2px;
          margin: 0;
          transition: color 0.15s;
        }
        .pi-toast-close:hover { color: #fff; }

        /* Corpo da mensagem */
        .pi-toast-msg {
          margin: 0;
          padding: 9px 12px 10px;
          font-size: 13px;
          color: #1a1a1a;
          line-height: 1.4;
        }

        /* Ajuste para telas pequenas */
        @media (max-width: 480px) {
          #pi-tts-toast {
            right: 8px;
            left: 8px;
            min-width: unset;
            max-width: unset;
          }
        }

        /* Respeita prefers-reduced-motion também no toast */
        @media (prefers-reduced-motion: reduce) {
          #pi-tts-toast {
            transition: opacity 0.15s ease;
            transform: none !important;
          }
          #pi-tts-toast.pi-toast-saindo {
            transform: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  customElements.define('barra-acessibilidade', Acessibilidade);


  /* ══════════════════════════════════════════════════════════════════════
     3. VLIBRAS
     O script vlibras-plugin.js deve ser carregado antes deste arquivo.
  ════════════════════════════════════════════════════════════════════════ */

  function inicializarVLibras() {
    if (typeof window.VLibras !== 'undefined') {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarVLibras);
  } else {
    inicializarVLibras();
  }

})();