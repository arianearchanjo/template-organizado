(function () {
  "use strict";

  function initSistemaTI() {
    // Adicione aqui comportamentos específicos do novo sistema.
    // O template funciona sem JavaScript adicional.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSistemaTI);
  } else {
    initSistemaTI();
  }

  window.addEventListener("sistema-ti:conteudo-carregado", initSistemaTI);
})();
