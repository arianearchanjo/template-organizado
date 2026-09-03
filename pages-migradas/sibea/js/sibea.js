(function () {
  "use strict";

  var REDUZIDO = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var PROCESSADO = "data-carrossel-pronto";

  function prefixoClasseAtiva(wrapper) {
    var classes = wrapper.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf("carrossel") !== -1 && classes[i].indexOf("--") === -1) {
        return classes[i] + "--ativo";
      }
    }
    return null;
  }

  function criarNavegacao(wrapper) {
    var nav = document.createElement("div");
    nav.className = "sibea-carrossel-nav";
    nav.setAttribute("aria-label", "Navegação do carrossel");

    var anterior = document.createElement("button");
    anterior.type = "button";
    anterior.className = "sibea-carrossel-btn sibea-carrossel-btn--prev";
    anterior.setAttribute("aria-label", "Mostrar cards anteriores");
    anterior.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

    var proximo = document.createElement("button");
    proximo.type = "button";
    proximo.className = "sibea-carrossel-btn sibea-carrossel-btn--next";
    proximo.setAttribute("aria-label", "Mostrar próximos cards");
    proximo.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

    nav.appendChild(anterior);
    nav.appendChild(proximo);

    wrapper.appendChild(nav);
    return nav;
  }

  function tiraNavegacao(wrapper) {
    var nav = wrapper.querySelector(".sibea-carrossel-nav");
    if (nav) nav.remove();
  }

  function larguraPasso(track) {
    var primeiro = track.children[0];
    if (!primeiro) return 0;
    var estilo = window.getComputedStyle(primeiro);
    var margem = parseFloat(estilo.marginRight) || 0;
    return primeiro.getBoundingClientRect().width + margem;
  }

  function QUANTIDADE_VISIVEL() {
    return 2;
  }

  function dimensionar(wrapper, track) {
    var itens = track.children;
    if (!itens.length) return;
    var viewport = wrapper.clientWidth;
    var estilo = window.getComputedStyle(itens[0]);
    var gap = parseFloat(estilo.marginRight) || 0;
    var cardWidth = (viewport - gap) / QUANTIDADE_VISIVEL();
    if (cardWidth <= 0) return;
    for (var i = 0; i < itens.length; i++) {
      itens[i].style.width = cardWidth + "px";
    }
  }

  function iniciar(wrapper) {
    var track = wrapper.querySelector("[data-carrossel-track]");
    var ativa = prefixoClasseAtiva(wrapper);
    if (!track || !ativa || wrapper.hasAttribute(PROCESSADO)) return;

    wrapper.setAttribute(PROCESSADO, "sibea");

    var indice = 0;
    var nav = criarNavegacao(wrapper);
    var anterior = nav.querySelector(".sibea-carrossel-btn--prev");
    var proximo = nav.querySelector(".sibea-carrossel-btn--next");

    function totalItems() {
      return track.children.length;
    }

    function maximoIndice() {
      return Math.max(0, totalItems() - QUANTIDADE_VISIVEL());
    }

    function aplicar() {
      var deslocamento = indice * larguraPasso(track);
      track.style.transform = "translateX(-" + deslocamento + "px)";
    }

    function atualizar() {
      if (totalItems() <= QUANTIDADE_VISIVEL()) {
        track.style.transform = "translateX(0)";
        anterior.disabled = true;
        proximo.disabled = true;
        return;
      }
      var max = maximoIndice();
      if (indice > max) indice = max;
      aplicar();
      anterior.disabled = false;
      proximo.disabled = false;
    }

    anterior.addEventListener("click", function () {
      if (totalItems() <= QUANTIDADE_VISIVEL()) return;
      indice = (indice <= 0) ? maximoIndice() : indice - 1;
      aplicar();
    });

    proximo.addEventListener("click", function () {
      if (totalItems() <= QUANTIDADE_VISIVEL()) return;
      indice = (indice >= maximoIndice()) ? 0 : indice + 1;
      aplicar();
    });

    function redimensionar() {
      dimensionar(wrapper, track);
      atualizar();
    }

    window.addEventListener("resize", redimensionar);

    wrapper.classList.add(ativa);
    redimensionar();
  }

  function escanear(raiz) {
    var local = raiz && raiz.querySelectorAll ? raiz : document;
    var dentro = local.querySelectorAll ? local.querySelectorAll("[data-carrossel]") : [];
    for (var i = 0; i < dentro.length; i++) iniciar(dentro[i]);

    if (raiz && raiz.nodeType === 1 && raiz.matches && raiz.matches("[data-carrossel]")) {
      iniciar(raiz);
    }
  }

  function aoAdicionar(mutacoes) {
    for (var m = 0; m < mutacoes.length; m++) {
      var added = mutacoes[m].addedNodes;
      for (var n = 0; n < added.length; n++) {
        var nodo = added[n];
        if (nodo.nodeType !== 1) continue;
        if (nodo.matches && nodo.matches("[data-carrossel]")) iniciar(nodo);
        escanear(nodo);
      }
    }
  }

  if (document.body) escanear(document);
  else document.addEventListener("DOMContentLoaded", function () { escanear(document); });

  if (window.MutationObserver) {
    var observer = new MutationObserver(aoAdicionar);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('sibea-animais-destaque') && window.iniciarCardsRotativos) {
      window.iniciarCardsRotativos({
        seletor: '#sibea-animais-destaque',
        rotulo: 'Animal para adoção',
        icone: 'fas fa-paw',
        classeCard: 'sibea-card-rotativo',
        tempo: 5000,
        itens: [
          { rotulo: 'Rex', html: '<p><strong>Rex</strong><br>Cachorro — Médio porte<br><small>Macho, 3 anos, castrado, vacinado.</small></p>' },
          { rotulo: 'Luna', html: '<p><strong>Luna</strong><br>Gata — Pequeno porte<br><small>Fêmea, 1 ano, castrada, vacinada.</small></p>' },
          { rotulo: 'Thor', html: '<p><strong>Thor</strong><br>Cachorro — Grande porte<br><small>Macho, 5 anos, castrado, vacinado.</small></p>' },
          { rotulo: 'Mel', html: '<p><strong>Mel</strong><br>Gata — Pequeno porte<br><small>Fêmea, 2 anos, castrada, vacinada.</small></p>' }
        ]
      });
    }

    carregarContagemAnimais();
  });

  function carregarContagemAnimais() {
    var card = document.getElementById('sibea-api-card');
    if (!card) return;

    var loader = card.querySelector('.sibea-api-loader');
    var countEl = card.querySelector('.sibea-api-count');
    var errorEl = card.querySelector('.sibea-api-error');
    var totalEl = document.getElementById('sibea-api-total');

    if (!loader || !countEl || !errorEl || !totalEl) return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://sibea.pmcgs.pr.gov.br/api/adoption/animals?pageSize=1', true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
      loader.hidden = true;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var body = JSON.parse(xhr.responseText);
          var total = 0;
          if (body && typeof body.pagination !== 'undefined') {
            total = Number(body.pagination.total) || 0;
          } else if (Array.isArray(body.data)) {
            total = body.data.length;
          }
          totalEl.textContent = total;
          countEl.hidden = false;
        } catch (e) {
          errorEl.hidden = false;
        }
      } else {
        errorEl.hidden = false;
      }
    };

    xhr.onerror = function () {
      loader.hidden = true;
      errorEl.hidden = false;
    };

    xhr.send();
  }
})();