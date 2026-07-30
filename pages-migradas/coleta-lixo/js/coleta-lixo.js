(function () {
  "use strict";

  function initColetaLixoBanners(root) {
    var scope = root || document;
    var transcript = scope.querySelector(".pi-cronograma-transcrito");
    var highlightedBanner = scope.querySelector(".pi-banners-grid--destaque");
    var lightbox = document.getElementById("pi-banner-lightbox");

    if (transcript && highlightedBanner && transcript.previousElementSibling !== highlightedBanner) {
      highlightedBanner.insertAdjacentElement("afterend", transcript);
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
