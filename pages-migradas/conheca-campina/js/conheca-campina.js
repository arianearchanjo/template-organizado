/**
 * conheca-campina.js
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
   * DADOS BIOGRÁFICOS (Galeria de Prefeitos)
   * ───────────────────────────────────────────────────────────────────── */
  var biografias = {
    '1': {
      nome:    'Dacyr Siqueira Trevisan',
      mandato: '1953–1956 · 1965–1968',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/wo5qrffkkt2.JPG',
      bio:     'Dacyr Siqueira Trevisan foi um dos primeiros prefeitos após a emancipação do município. Liderou o processo de estruturação administrativa de Campina Grande do Sul em seus primeiros anos como município autônomo.'
    },
    '2': {
      nome:    'Ary Alves Bandeira',
      mandato: '1956–1960 · 1969–1973',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/x24xcu2umar.JPG',
      bio:     'Ary Alves Bandeira exerceu dois mandatos na prefeitura, sendo responsável por importantes obras de infraestrutura urbana.'
    },
    '3': {
      nome:    'Mário Strapasson',
      mandato: '1961–1965',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/thcy50of30e.JPG',
      bio:     'Mário Strapasson governou o município no período de expansão demográfica da região metropolitana de Curitiba.'
    },
    '4': {
      nome:    'João Maria de Barros',
      mandato: '1973–1977',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/14i24ttbtli.jpg',
      bio:     'João Maria de Barros administrou o município no período do regime militar.'
    },
    '5': {
      nome:    'Elerian do Rocio Zanetti',
      mandato: '1977–1982 · 1989–1992 · 1997–2000 · 2001–2004',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/3udrz3elcpl.JPG',
      bio:     'Elerian do Rocio Zanetti foi the prefeito mais vezes eleito na história do município, com quatro mandatos.'
    },
    '6': {
      nome:    'Nivaldo Bernardi',
      mandato: '1983–1988',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/urg0t0rsfln.JPG',
      bio:     'Nivaldo Bernardi governou no período de redemocratização do Brasil.'
    },
    '7': {
      nome:    'Marco Antonio Caron',
      mandato: '1993–1996',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/ekz13uxwt4d.JPG',
      bio:     'Marco Antonio Caron assumiu a prefeitura em um período de estabilização econômica nacional.'
    },
    '8': {
      nome:    'Nelise Cristiane Dalprá',
      mandato: '2004–2008',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/go1fhasroqf.jpg',
      bio:     'Nelise Cristiane Dalprá foi a primeira mulher a ser eleita prefeita de Campina Grande do Sul.'
    },
    '9': {
      nome:    'Luiz Carlos Assunção',
      mandato: '2008–2012 · 2013–2016',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/gcn24v3cive.jpg',
      bio:     'Luiz Carlos Assunção governou Campina Grande do Sul por dois mandatos consecutivos, entre 2008 e 2016.'
    },
    '10': {
      nome:    'Bihl Zanetti',
      mandato: '2017–2024',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/zfzdmho3kdd.jpg',
      bio:     'Bihl Zanetti administrou o município por dois mandatos, de 2017 a 2024.'
    },
    '11': {
      nome:    'Belenice Koffke Buff Rotini',
      mandato: 'Out.–Dez. 2024',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/1pfqvafwuqz.png',
      bio:     'Belenice Koffke Buff Rotini exerceu a função de prefeita interina no final de 2024.'
    },
    'atual': {
      nome:    'Luiz Carlos Assunção',
      mandato: '2025–2028 (mandato atual)',
      foto:    'https://campinagrandedosul.pr.gov.br/Downloads/Imagens/2026/2553/gcn24v3cive.jpg',
      bio:     'Luiz Carlos Assunção retornou ao cargo de prefeito de Campina Grande do Sul em 2025.',
      atual:   true
    }
  };

  var cardAtivo  = null;
  var painelAtual = null;

  function initPrefeitos() {
    var grid = document.getElementById('cc-prefeitos-grid');
    if (!grid) return;

    var cards = grid.querySelectorAll('.cc-prefeito-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-id');
        var bio = biografias[id];
        if (!bio) return;
        if (cardAtivo === card) { fecharBio(); return; }
        if (painelAtual) { fecharBio(); }
        cardAtivo = card;
        card.classList.add('ativo');
        var painel = criarPainel(bio);
        
        var topoCard = card.getBoundingClientRect().top;
        var ultimoNaLinha = card;
        cards.forEach(function(c) {
            if (Math.abs(c.getBoundingClientRect().top - topoCard) < 10) {
                ultimoNaLinha = c;
            }
        });

        if (ultimoNaLinha.nextSibling) {
          grid.insertBefore(painel, ultimoNaLinha.nextSibling);
        } else {
          grid.appendChild(painel);
        }
        painelAtual = painel;
        setTimeout(function () {
          painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      });
    });
  }

  function criarPainel(bio) {
    var painel = document.createElement('div');
    painel.className = 'cc-bio-painel' + (bio.atual ? ' cc-bio-dourado' : '');
    painel.innerHTML =
      '<button class="cc-bio-fechar">&times;</button>' +
      '<div class="cc-bio-inner">' +
        '<div class="cc-bio-foto">' +
          (bio.foto ? '<img src="' + bio.foto + '" alt="' + bio.nome + '">' : '') +
        '</div>' +
        '<div class="cc-bio-texto">' +
          '<h3>' + bio.nome + '</h3>' +
          '<p class="cc-bio-mandato"><i class="fas fa-calendar-alt"></i> ' + bio.mandato + '</p>' +
          '<p>' + bio.bio + '</p>' +
        '</div>' +
      '</div>';
    painel.querySelector('.cc-bio-fechar').addEventListener('click', function (e) {
      e.stopPropagation();
      fecharBio();
    });
    return painel;
  }

  function fecharBio() {
    if (cardAtivo) cardAtivo.classList.remove('ativo');
    if (painelAtual && painelAtual.parentNode) painelAtual.parentNode.removeChild(painelAtual);
    cardAtivo = null;
    painelAtual = null;
  }

  /* ─────────────────────────────────────────────────────────────────────
   * MENU LATERAL — NAVEGAÇÃO POR SEÇÕES
   * ───────────────────────────────────────────────────────────────────── */
  function initMenu() {
    var card = document.querySelector('.cc-menu-card');
    var lista = document.querySelector('.cc-menu-lista');
    var itens = document.querySelectorAll('.cc-menu-item');
    var scrollBtnLeft = document.querySelector('.cc-menu-scroll-btn-left');
    var scrollBtnRight = document.querySelector('.cc-menu-scroll-btn-right');

    if (!lista) return;

    function scrollMenu(direction) {
      var scrollAmount = lista.clientWidth * 0.8;
      var newScroll = lista.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      lista.scrollTo({ left: newScroll, behavior: 'smooth' });
    }

    function updateScrollButtons() {
      if (!lista || !scrollBtnLeft || !scrollBtnRight) return;

      var scrollLeft = Math.round(lista.scrollLeft);
      var scrollWidth = lista.scrollWidth;
      var clientWidth = lista.clientWidth;

      // Se não houver scroll possível, esconde ambos
      if (scrollWidth <= clientWidth + 5) {
        scrollBtnLeft.style.setProperty('display', 'none', 'important');
        scrollBtnRight.style.setProperty('display', 'none', 'important');
        return;
      }

      // Esquerda: mostra se não estiver no início (margem de segurança)
      if (scrollLeft > 50) {
        scrollBtnLeft.style.setProperty('display', 'flex', 'important');
      } else {
        scrollBtnLeft.style.setProperty('display', 'none', 'important');
      }

      // Direita: mostra se não estiver no fim (margem de segurança)
      if (scrollLeft + clientWidth < scrollWidth - 10) {
        scrollBtnRight.style.setProperty('display', 'flex', 'important');
      } else {
        scrollBtnRight.style.setProperty('display', 'none', 'important');
      }
    }

    if (scrollBtnLeft) {
      scrollBtnLeft.addEventListener('click', function(e) {
        e.preventDefault();
        scrollMenu('left');
      });
    }

    if (scrollBtnRight) {
      scrollBtnRight.addEventListener('click', function(e) {
        e.preventDefault();
        scrollMenu('right');
      });
    }

    lista.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    window.addEventListener('load', updateScrollButtons);

    // Inicializa visibilidade em múltiplos estágios para garantir
    updateScrollButtons();
    setTimeout(updateScrollButtons, 100);
    setTimeout(updateScrollButtons, 500);
    setTimeout(updateScrollButtons, 1000);

    function ativarSecao(item) {
      var alvoId = item.getAttribute('aria-controls');
      var painel = document.getElementById(alvoId);
      if (!painel) return;

      itens.forEach(function (i) {
        i.classList.remove('ativo');
        i.setAttribute('aria-selected', 'false');
        var p = document.getElementById(i.getAttribute('aria-controls'));
        if (p) p.setAttribute('hidden', '');
      });

      item.classList.add('ativo');
      item.setAttribute('aria-selected', 'true');
      painel.removeAttribute('hidden');

      if (window.innerWidth <= 900) {
        var topPos = card.getBoundingClientRect().top + window.pageYOffset - 10;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }

    itens.forEach(function (item) {
      item.addEventListener('click', function () {
        ativarSecao(item);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
   * LIGHTBOX — VISUALIZAÇÃO DE IMAGENS
   * ───────────────────────────────────────────────────────────────────── */
  function initLightbox() {
    var lightbox = document.getElementById('cc-lightbox');
    var lbImg = document.getElementById('cc-lightbox-img');
    var lbCap = document.getElementById('cc-lightbox-caption');
    var lbFechar = document.getElementById('cc-lightbox-fechar');

    if (!lightbox || !lbImg) return;

    function abrirLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt;
      lbCap.textContent = alt;
      lightbox.classList.add('ativo');
      document.body.style.overflow = 'hidden'; // Trava scroll
    }

    function fecharLightbox() {
      lightbox.classList.remove('ativo');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    // Delegação de evento para imagens (fotos históricas, pontos turísticos, brasão/bandeira)
    document.addEventListener('click', function (e) {
      var el = e.target;
      
      // Verifica se clicou em uma imagem dentro de uma classe de galeria
      if (el.tagName === 'IMG' && (el.closest('.cc-foto-item') || el.closest('.cc-ponto-foto') || el.closest('.cc-simbolo-img-wrap') || el.closest('.cc-docs-img'))) {
        abrirLightbox(el.src, el.alt || 'Imagem de Campina Grande do Sul');
      }
    });

    lbFechar.addEventListener('click', fecharLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) fecharLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fecharLightbox();
    });
  }

  function init() {
    initPrefeitos();
    initMenu();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
