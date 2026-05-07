/**
 * JS — Escola Municipal / CMEI
 * Prefeitura de Campina Grande do Sul
 *
 * 1. Sistema de abas
 * 2. Lightbox da galeria de fotos
 *
 * Acessibilidade (Fonte, Contraste, Atalhos, TTS, VLibras) agora é gerenciada 
 * centralmente por _global/js/acessibilidade-component.js
 */

// ── 1. SISTEMA DE ABAS ────────────────────────────────────────────────
(function () {
  var botoes  = document.querySelectorAll('.sec-tab-btn');
  var paineis = document.querySelectorAll('.sec-tab-painel');

  botoes.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alvo = btn.getAttribute('aria-controls');

      botoes.forEach(function (b) {
        b.classList.remove('ativo');
        b.setAttribute('aria-selected', 'false');
      });
      paineis.forEach(function (p) { p.classList.remove('ativo'); });

      btn.classList.add('ativo');
      btn.setAttribute('aria-selected', 'true');
      var painel = document.getElementById(alvo);
      if (painel) painel.classList.add('ativo');
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


// ── 2. CARROSSEL + LIGHTBOX ──────────────────────────────────────────
(function () {

  /* ── Carrossel ── */
  var track    = document.getElementById('es-carrossel-track');
  var btnPrev  = document.getElementById('es-btn-prev');
  var btnNext  = document.getElementById('es-btn-next');
  var dotsWrap = document.getElementById('es-carrossel-dots');

  if (!track) return;

  var slides      = track.querySelectorAll('.es-carrossel-slide');
  var total       = slides.length;
  var visiveis    = 3; // quantos slides cabem por vez (desktop)
  var posAtual    = 0; // índice do primeiro slide visível

  // Recalcula quantos slides cabem por largura
  function calcVisiveis() {
    var w = track.parentElement.offsetWidth;
    if (w <= 480) return 1;
    if (w <= 768) return 2;
    return 3;
  }

  // Cria as bolinhas
  function criarDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    var grupos = Math.ceil(total / calcVisiveis());
    for (var i = 0; i < grupos; i++) {
      var dot = document.createElement('button');
      dot.className = 'es-carrossel-dot' + (i === 0 ? ' ativo' : '');
      dot.setAttribute('aria-label', 'Grupo de fotos ' + (i + 1));
      dot.setAttribute('data-grupo', i);
      dot.addEventListener('click', function () {
        irPara(parseInt(this.getAttribute('data-grupo')) * calcVisiveis());
      });
      dotsWrap.appendChild(dot);
    }
  }

  function atualizarDots() {
    if (!dotsWrap) return;
    var v = calcVisiveis();
    var grupoAtual = Math.floor(posAtual / v);
    dotsWrap.querySelectorAll('.es-carrossel-dot').forEach(function (d, i) {
      d.classList.toggle('ativo', i === grupoAtual);
    });
  }

  function atualizarBotoes() {
    if (btnPrev) btnPrev.disabled = posAtual <= 0;
    if (btnNext) btnNext.disabled = posAtual >= total - calcVisiveis();
  }

  function irPara(idx) {
    var v = calcVisiveis();
    posAtual = Math.max(0, Math.min(idx, total - v));
    var larguraSlide = track.parentElement.offsetWidth / v;
    track.style.transform = 'translateX(-' + (posAtual * larguraSlide) + 'px)';
    atualizarDots();
    atualizarBotoes();
  }

  if (btnPrev) btnPrev.addEventListener('click', function () { irPara(posAtual - calcVisiveis()); });
  if (btnNext) btnNext.addEventListener('click', function () { irPara(posAtual + calcVisiveis()); });

  // Swipe touch
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) irPara(diff > 0 ? posAtual + 1 : posAtual - 1);
  });

  // Redimensionamento
  window.addEventListener('resize', function () {
    criarDots();
    irPara(0);
  });

  criarDots();
  irPara(0);


  /* ── Lightbox (clique nas fotos do carrossel) ── */
  var lightbox  = document.getElementById('es-lightbox');
  var imgEl     = document.getElementById('es-lightbox-img');
  var btnFechar = document.getElementById('es-lightbox-fechar');

  if (!lightbox || !imgEl) return;

  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      var img = slide.querySelector('img');
      if (!img) return;
      imgEl.setAttribute('src', img.getAttribute('src'));
      imgEl.setAttribute('alt', img.getAttribute('alt') || '');
      lightbox.classList.add('ativo');
      document.body.style.overflow = 'hidden';
      if (btnFechar) btnFechar.focus();
    });
  });

  function fechar() {
    lightbox.classList.remove('ativo');
    imgEl.setAttribute('src', '');
    document.body.style.overflow = '';
  }

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) fechar(); });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && lightbox.classList.contains('ativo')) fechar();
  });

})();
