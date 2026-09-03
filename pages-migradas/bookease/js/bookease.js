/**
 * cards-rotativos.js — Cards rotativos para BookEase, FootEasy e SIBEA
 * Exibe itens de exemplo em rotação automática.
 * Cada página deve chamar `iniciarCardsRotativos(config)` após injetar o HTML.
 */
(function () {
  "use strict";

  var PROCESSADO = "data-cards-rotativos-pronto";

  function iniciarCardsRotativos(config) {
    var seletor = config.seletor;
    var rotulo = config.rotulo || "Em destaque";
    var icone = config.icone || "fas fa-star";
    var itens = config.itens || [];
    var tempo = config.tempo || 5000;
    var classeCard = config.classeCard || "card-rotativo";

    if (!seletor) return;

    var wrapper = document.querySelector(seletor);
    if (!wrapper) return;

    if (wrapper.getAttribute(PROCESSADO) === "true") return;
    wrapper.setAttribute(PROCESSADO, "true");

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
  }

  window.iniciarCardsRotativos = iniciarCardsRotativos;

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('bdig-livros-destaque')) {
    window.iniciarCardsRotativos({
      seletor: '#bdig-livros-destaque',
      rotulo: 'Livro em destaque',
      icone: 'fas fa-book',
      classeCard: 'bookease-card-rotativo',
      tempo: 5000,
      itens: [
        { rotulo: 'Dom Casmurro', html: '<p><strong>Dom Casmurro</strong><br>Machado de Assis — Literatura Brasileira<br><small>Clássico disponível para consulta no acervo.</small></p>' },
        { rotulo: 'O Alquimista', html: '<p><strong>O Alquimista</strong><br>Paulo Coelho — Ficção<br><small>História de Santiago e a busca pelo tesouro.</small></p>' },
        { rotulo: 'A Moreninha', html: '<p><strong>A Moreninha</strong><br>Joaquim Manuel de Macedo — Romance<br><small>Uma das primeiras obras da literatura nacional.</small></p>' },
        { rotulo: 'Grande Sertão: Veredas', html: '<p><strong>Grande Sertão: Veredas</strong><br>João Guimarães Rosa — Literatura Brasileira<br><small>Uma das maiores obras da língua portuguesa.</small></p>' }
      ]
    });
  }
});
})();
