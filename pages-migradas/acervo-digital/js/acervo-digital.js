/**
 * JS — Acervo Digital
 * "Nesta página" com destaque da seção visível (scrollspy).
 * Compatível com HTML estático e com conteúdo injetado via fetch.
 */
(function () {
  "use strict";

  var PRONTO = "data-acervo-pronto";

  function initOnThisPage() {
    var nav = document.getElementById("pi-on-this-page");
    if (!nav || nav.getAttribute(PRONTO)) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
    var refs = [];
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href").slice(1);
      var alvo = document.getElementById(id);
      if (alvo) refs.push({ alvo: alvo, link: links[i] });
    }
    if (!refs.length) return;

    nav.setAttribute(PRONTO, "1");

    function atualizar() {
      var y = window.scrollY + 120;
      var ativo = refs[0];
      for (var j = 0; j < refs.length; j++) {
        if (refs[j].alvo.offsetTop <= y) ativo = refs[j];
      }
      for (var k = 0; k < refs.length; k++) {
        if (refs[k].link === ativo.link) refs[k].link.classList.add("active");
        else refs[k].link.classList.remove("active");
      }
    }

    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  }

  function inicializar() {
    initOnThisPage();
  }

  window.initAcervoDigital = inicializar;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

  var alvo = document.getElementById("dynamic-content");
  if (alvo && window.MutationObserver) {
    var observer = new MutationObserver(function () {
      if (document.getElementById("pi-on-this-page")) {
        inicializar();
        observer.disconnect();
      }
    });
    observer.observe(alvo, { childList: true, subtree: true });
  }
})();

window.iniciarCardsRotativos = function (config) {
    var seletor = config.seletor;
    var rotulo = config.rotulo || "Em destaque";
    var icone = config.icone || "fas fa-star";
    var itens = config.itens || [];
    var tempo = config.tempo || 5000;
    var classeCard = config.classeCard || "card-rotativo";

    if (!seletor) return;

    var wrapper = document.querySelector(seletor);
    if (!wrapper) return;

    if (wrapper.getAttribute("data-cards-rotativos-pronto") === "true") return;
    wrapper.setAttribute("data-cards-rotativos-pronto", "true");

    if (!itens || !itens.length) {
        wrapper.innerHTML = '<p class="card-rotativo-vazio">Nenhum item disponível no momento.</p>';
        return;
    }

    var indice = 0;
    var timeout = null;

    function renderizar() {
        var item = itens[indice];
        wrapper.innerHTML = "";

        var card = document.createElement("div");
        card.className = classeCard;

        var cabecalho = document.createElement("div");
        cabecalho.className = "card-rotativo-cabecalho";

        var iconeEl = document.createElement("i");
        iconeEl.className = icone;
        iconeEl.setAttribute("aria-hidden", "true");

        var rotuloEl = document.createElement("span");
        rotuloEl.className = "card-rotativo-rotulo";
        rotuloEl.textContent = rotulo;

        cabecalho.appendChild(iconeEl);
        cabecalho.appendChild(rotuloEl);
        card.appendChild(cabecalho);

        var corpo = document.createElement("div");
        corpo.className = "card-rotativo-corpo";
        corpo.innerHTML = item.html || "";
        card.appendChild(corpo);

        wrapper.appendChild(card);
    }

    function proximo() {
        indice = (indice + 1) % itens.length;
        renderizar();
        timeout = setTimeout(proximo, tempo);
    }

    renderizar();
    timeout = setTimeout(proximo, tempo);
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('ad-destaque-conteudo') && window.iniciarCardsRotativos) {
        window.iniciarCardsRotativos({
            seletor: '#ad-destaque-conteudo',
            rotulo: 'Destaque do acervo',
            icone: 'fas fa-images',
            classeCard: 'ad-card-rotativo',
            tempo: 5000,
            itens: [
                { rotulo: 'Fotografias institucionais', html: '<p><strong>Registros oficiais</strong><br>Fotografias das secretarias e departamentos preservadas com identificação de pessoas e contexto.</p>' },
                { rotulo: 'Busca por período', html: '<p><strong>Pesquisa temporal</strong><br>Encontre imagens por década, ano ou período específico da história municipal.</p>' },
                { rotulo: 'Álbuns temáticos', html: '<p><strong>Organização por assunto</strong><br>Álbuns separados por evento, obra, inauguração ou comemoração oficial.</p>' },
                { rotulo: 'Acesso controlado', html: '<p><strong>Perfis de acesso</strong><br>Cada usuário visualiza apenas as imagens liberadas para o seu perfil.</p>' }
            ]
        });
    }
});