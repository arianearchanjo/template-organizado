(function () {
  "use strict";

  function loadContent() {
    var container = document.getElementById("pi-pagina-entulho");

    if (!container || container.dataset.piContentLoaded === "true") {
      return;
    }

    fetch("conteudo.html")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Não foi possível carregar o conteúdo da página.");
        }
        return response.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        container.dataset.piContentLoaded = "true";
        if (typeof window.initColetaLixoBanners === "function") {
          window.initColetaLixoBanners(container);
        }
      })
      .catch(function () {
        container.textContent = "Não foi possível carregar o conteúdo da página.";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadContent);
  } else {
    loadContent();
  }
}());
