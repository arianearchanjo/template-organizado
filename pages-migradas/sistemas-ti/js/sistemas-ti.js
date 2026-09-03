/**
 * JS — Sistemas da TI
 * Página catálogo de sistemas municipais.
 */
(function () {
  "use strict";

  var PRONTO = "data-sti-pronto";

  function inicializar() {
    var alvo = document.getElementById("pi-conteudo");
    if (!alvo) return;
    if (alvo.getAttribute(PRONTO) === "true") return;
    alvo.setAttribute(PRONTO, "true");

    animarCards();
  }

  function animarCards() {
    var cards = document.querySelectorAll(".sti-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target;
          var todos = Array.prototype.slice.call(cards);
          var indice = todos.indexOf(card);
          var delay = indice * 0.05;

          card.style.transition = "opacity 0.5s ease " + delay + "s, transform 0.5s ease " + delay + "s";
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";

          observer.unobserve(card);
        }
      });
    }, { threshold: 0.08 });

    cards.forEach(function (card) {
      card.style.opacity = "0";
      card.style.transform = "translateY(16px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }
})();
