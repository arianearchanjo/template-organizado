/**
 * JS — Sistema de Controle de Estoque
 * Página de status: em desenvolvimento, indisponível para uso.
 * Sem interações dinâmicas no momento; mantido no padrão das demais páginas.
 */
(function () {
  "use strict";

  var PRONTO = "data-ce-pronto";

  function inicializar() {
    var alvo = document.getElementById("pi-conteudo");
    if (!alvo) return;
    if (alvo.getAttribute(PRONTO) === "true") return;
    alvo.setAttribute(PRONTO, "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

  var alvo = document.getElementById("dynamic-content");
  if (alvo && window.MutationObserver) {
    var observer = new MutationObserver(function () {
      if (document.getElementById("pi-conteudo")) {
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
    if (document.getElementById('ce-destaque-conteudo') && window.iniciarCardsRotativos) {
        window.iniciarCardsRotativos({
            seletor: '#ce-destaque-conteudo',
            rotulo: 'Funcionalidade em destaque',
            icone: 'fas fa-star',
            classeCard: 'ce-card-rotativo',
            tempo: 5000,
            itens: [
                { rotulo: 'Organização', html: '<p><strong>Controle de estoque</strong><br>Materiais e medicamentos com quantidades e validade organizados em um só lugar.</p>' },
                { rotulo: 'Movimentações', html: '<p><strong>Entradas e saídas</strong><br>Histórico completo de todas as movimentações do almoxarifado.</p>' },
                { rotulo: 'Requisições', html: '<p><strong>Requisições digitais</strong><br>Solicitações das unidades de saúde com fluxo de aprovação.</p>' },
                { rotulo: 'Relatórios', html: '<p><strong>Visão gerencial</strong><br>Relatórios de saldos, consumo e itens em falta.</p>' }
            ]
        });
    }
});