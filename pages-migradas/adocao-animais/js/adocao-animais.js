/**
 * adocao-animais.js — Lógica para a página de adoção
 */

(function () {
  'use strict';

  function ajustarBanner() {
    const img = document.getElementById("pi-banner-img");
    if (!img) return;

    // URLs fornecidas pelo layout antigo
    const urlMobile = "https://www.campinagrandedosul.pr.gov.br/Downloads/Imagens/2019/1/anso5sodwif.jpg";
    const urlDesktop = "https://www.campinagrandedosul.pr.gov.br/Downloads/Imagens/2019/1/uql1ycvji1y.jpg";

    if (window.innerWidth <= 768) {
      if (img.src !== urlMobile) img.src = urlMobile;
    } else {
      if (img.src !== urlDesktop) img.src = urlDesktop;
    }
  }

  // Executa ao carregar e ao redimensionar
  window.addEventListener("load", ajustarBanner);
  window.addEventListener("resize", ajustarBanner);

})();
