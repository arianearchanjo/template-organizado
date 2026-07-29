(function () {
  "use strict";

  var botoes = Array.prototype.slice.call(document.querySelectorAll(".sec-tab-btn"));
  var paineis = Array.prototype.slice.call(document.querySelectorAll(".sec-tab-painel"));

  function ativarAba(botao, focar, atualizarHash) {
    var painelId = botao.getAttribute("aria-controls");

    botoes.forEach(function (item) {
      var ativo = item === botao;
      item.classList.toggle("ativo", ativo);
      item.setAttribute("aria-selected", String(ativo));
      item.tabIndex = ativo ? 0 : -1;
    });

    paineis.forEach(function (painel) {
      var ativo = painel.id === painelId;
      painel.classList.toggle("ativo", ativo);
      painel.hidden = !ativo;
    });

    if (focar) {
      botao.focus();
    }

    if (atualizarHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + painelId);
    }
  }

  function ativarPeloHash() {
    var botao = botoes.find(function (item) {
      return "#" + item.getAttribute("aria-controls") === window.location.hash;
    });

    if (botao) {
      ativarAba(botao, false, false);
    }
  }

  botoes.forEach(function (botao, indice) {
    botao.addEventListener("click", function () {
      ativarAba(botao, false, true);
    });

    botao.addEventListener("keydown", function (evento) {
      var proximoIndice;

      if (evento.key === "ArrowRight") proximoIndice = (indice + 1) % botoes.length;
      if (evento.key === "ArrowLeft") proximoIndice = (indice - 1 + botoes.length) % botoes.length;
      if (evento.key === "Home") proximoIndice = 0;
      if (evento.key === "End") proximoIndice = botoes.length - 1;

      if (typeof proximoIndice === "number") {
        evento.preventDefault();
        ativarAba(botoes[proximoIndice], true, true);
      }
    });
  });

  paineis.forEach(function (painel) {
    painel.hidden = !painel.classList.contains("ativo");
  });

  ativarPeloHash();
  window.addEventListener("hashchange", ativarPeloHash);
})();
