(function () {
  "use strict";

  function initColetaLixoBanners(root) {
    var scope = root || document;
    var transcript = scope.querySelector(".pi-cronograma-transcrito");
    var schedules = scope.querySelector("[data-pi-cronogramas]");
    var lightbox = document.getElementById("pi-banner-lightbox");

    if (schedules && schedules.dataset.piCronogramasInitialized !== "true") {
      var ruralPanel = schedules.querySelector('[data-pi-cronograma-painel="rural"]');
      if (transcript && ruralPanel && !ruralPanel.contains(transcript)) {
        ruralPanel.appendChild(transcript);
      }

      var buttons = schedules.querySelectorAll("[data-pi-cronograma-botao]");
      var panels = schedules.querySelectorAll("[data-pi-cronograma-painel]");

      function showSchedule(value) {
        panels.forEach(function (panel) {
          var active = panel.dataset.piCronogramaPainel === value;
          panel.hidden = !active;
        });
        buttons.forEach(function (button) {
          var active = button.dataset.piCronogramaBotao === value;
          button.setAttribute("aria-expanded", active ? "true" : "false");
          button.classList.toggle("is-active", active);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.dataset.piCronogramaBotao;
          var activePanel = schedules.querySelector('[data-pi-cronograma-painel="' + value + '"]');
          var isOpen = activePanel && !activePanel.hidden;
          if (isOpen) {
            activePanel.hidden = true;
            button.setAttribute("aria-expanded", "false");
            button.classList.remove("is-active");
          } else {
            showSchedule(value);
          }
        });
      });

      schedules.dataset.piCronogramasInitialized = "true";
    }

    if (!lightbox || lightbox.dataset.piBannerInitialized === "true") {
      return;
    }

    var image = lightbox.querySelector(".pi-banner-lightbox__conteudo img");
    var imageContainer = lightbox.querySelector(".pi-banner-lightbox__conteudo");
    var closeButton = lightbox.querySelector(".pi-banner-lightbox__fechar");
    var zoomOutButton = lightbox.querySelector('[data-pi-zoom="out"]');
    var zoomResetButton = lightbox.querySelector('[data-pi-zoom="reset"]');
    var zoomInButton = lightbox.querySelector('[data-pi-zoom="in"]');
    var lastTrigger = null;
    var zoom = 1;
    var minZoom = 1;
    var maxZoom = 3;
    var zoomStep = 0.25;

    function updateZoom(nextZoom) {
      zoom = Math.min(maxZoom, Math.max(minZoom, nextZoom));
      image.style.height = zoom === 1 ? "" : (zoom * 100) + "%";
      image.style.maxHeight = zoom === 1 ? "" : "none";
      imageContainer.classList.toggle("is-zoomed", zoom > 1);
      zoomResetButton.textContent = Math.round(zoom * 100) + "%";
      zoomOutButton.disabled = zoom === minZoom;
      zoomInButton.disabled = zoom === maxZoom;

      if (zoom === 1) {
        imageContainer.scrollTop = 0;
        imageContainer.scrollLeft = 0;
      }
    }

    function closeLightbox() {
      if (lightbox.hidden) {
        return;
      }

      lightbox.hidden = true;
      document.body.classList.remove("pi-banner-aberto");
      image.removeAttribute("src");
      image.alt = "";
      updateZoom(1);

      if (lastTrigger) {
        lastTrigger.focus();
      }
    }

    function openLightbox(trigger) {
      lastTrigger = trigger;
      image.src = trigger.dataset.piBannerSrc;
      image.alt = trigger.dataset.piBannerAlt || "";
      lightbox.hidden = false;
      document.body.classList.add("pi-banner-aberto");
      updateZoom(1);
      closeButton.focus();
    }

    scope.querySelectorAll("[data-pi-banner-src]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger);
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    zoomOutButton.addEventListener("click", function () {
      updateZoom(zoom - zoomStep);
    });
    zoomResetButton.addEventListener("click", function () {
      updateZoom(1);
    });
    zoomInButton.addEventListener("click", function () {
      updateZoom(zoom + zoomStep);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.hidden && event.key === "Escape") {
        closeLightbox();
      }
    });

    lightbox.dataset.piBannerInitialized = "true";
  }

  window.initColetaLixoBanners = initColetaLixoBanners;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initColetaLixoBanners(document);
    }, { once: true });
  } else {
    initColetaLixoBanners(document);
  }
})();
