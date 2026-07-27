/* ============================================
   BookEase - Catálogo Público de Livros
   Script de Integração com API
   ============================================ */

var BEC_CONFIG = {
  apiUrl: "https://bookease.pmcgs.pr.gov.br/api/books",
  organizationId: "",  // vazio = todas as bibliotecas
  pageSize: 24,
};

(function () {
  'use strict';

  // ============================================
  // Estado da Aplicação
  // ============================================

  var state = {
    livros: [],
    filteredLivros: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    filters: {
      busca: '',
      situacao: '',
      biblioteca: '',
      categoria: '',
      ano: ''
    },
    bibliotecas: [],
    categorias: [],
    anos: [],
    loading: false
  };

  // ============================================
  // Elementos do DOM
  // ============================================

  var elements = {
    inputBusca: null,
    btnLimparBusca: null,
    lista: null,
    semResultado: null,
    loading: null,
    paginacao: null,
    contadorResultados: null,
    numResultados: null,
    chipsSituacao: null,
    filtroBiblioteca: null,
    filtroCategoria: null,
    filtroAno: null,
    btnLimparFiltros: null,
    btnLimparVazio: null
  };

  // ============================================
  // Inicialização
  // ============================================

  function init() {
    cacheElements();
    bindEvents();
    fetchBooks();
  }

  function cacheElements() {
    elements.inputBusca = document.getElementById('bec-input-busca');
    elements.btnLimparBusca = document.getElementById('bec-btn-limpar-busca');
    elements.lista = document.getElementById('bec-lista');
    elements.semResultado = document.getElementById('bec-sem-resultado');
    elements.loading = document.getElementById('bec-loading');
    elements.paginacao = document.getElementById('bec-paginacao');
    elements.contadorResultados = document.querySelector('.bec-contador');
    elements.numResultados = document.getElementById('bec-num-resultados');
    elements.chipsSituacao = document.querySelectorAll('.bec-chip');
    elements.filtroBiblioteca = document.getElementById('bec-filtro-biblioteca');
    elements.filtroCategoria = document.getElementById('bec-filtro-categoria');
    elements.filtroAno = document.getElementById('bec-filtro-ano');
    elements.btnLimparFiltros = document.getElementById('bec-limpar-filtros');
    elements.btnLimparVazio = document.getElementById('bec-btn-limpar-vazio');
  }

  function bindEvents() {
    // Busca com debounce
    var debounceTimer;
    elements.inputBusca.addEventListener('input', function () {
      var valor = this.value;
      elements.btnLimparBusca.style.display = valor ? 'block' : 'none';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        state.filters.busca = valor;
        state.currentPage = 1;
        applyFilters();
      }, 250);
    });

    // Limpar busca
    elements.btnLimparBusca.addEventListener('click', function () {
      elements.inputBusca.value = '';
      elements.btnLimparBusca.style.display = 'none';
      state.filters.busca = '';
      state.currentPage = 1;
      applyFilters();
    });

    // Chips de situação
    elements.chipsSituacao.forEach(function (chip) {
      chip.addEventListener('click', function () {
        elements.chipsSituacao.forEach(function (c) {
          c.classList.remove('ativo');
          c.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('ativo');
        this.setAttribute('aria-pressed', 'true');
        state.filters.situacao = this.dataset.situacao;
        state.currentPage = 1;
        applyFilters();
      });
    });

    // Botões limpar filtros
    if (elements.btnLimparFiltros) {
      elements.btnLimparFiltros.addEventListener('click', clearAllFilters);
    }
    if (elements.btnLimparVazio) {
      elements.btnLimparVazio.addEventListener('click', clearAllFilters);
    }
  }

  // ============================================
  // API
  // ============================================

  function fetchBooks() {
    showLoading(true);

    var url = BEC_CONFIG.apiUrl;
    var params = [];

    if (BEC_CONFIG.organizationId) {
      params.push('organizationId=' + encodeURIComponent(BEC_CONFIG.organizationId));
    }

    params.push('pageSize=1000');

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        state.livros = Array.isArray(data) ? data : (data.books || data.data || []);
        extractFilters();
        applyFilters();
        showLoading(false);
      })
      .catch(function (error) {
        console.error('Erro ao buscar livros:', error);
        showLoading(false);
        showSemResultado(true);
      });
  }

  // ============================================
  // Extração de Filtros
  // ============================================

  function extractFilters() {
    var bibliotecasSet = {};
    var categoriasSet = {};
    var anosSet = {};

    state.livros.forEach(function (livro) {
      var org = livro.organization || livro.biblioteca || livro.library;
      if (org) {
        var nome = typeof org === 'string' ? org : (org.name || org.nome || '');
        if (nome) bibliotecasSet[nome] = true;
      }

      var cat = livro.category || livro.categoria;
      if (cat) {
        var catNome = typeof cat === 'string' ? cat : (cat.name || cat.nome || '');
        if (catNome) categoriasSet[catNome] = true;
      }

      var ano = livro.year || livro.ano || livro.publicationYear;
      if (ano) {
        var anoNum = parseInt(ano);
        if (!isNaN(anoNum)) {
          var decada = Math.floor(anoNum / 10) * 10;
          anosSet[decada] = true;
        }
      }
    });

    state.bibliotecas = Object.keys(bibliotecasSet).sort();
    state.categorias = Object.keys(categoriasSet).sort();
    state.anos = Object.keys(anosSet).sort(function (a, b) {
      return parseInt(b) - parseInt(a);
    });

    renderFiltroBibliotecas();
    renderFiltroCategorias();
    renderFiltroAnos();
  }

  function renderFiltroBibliotecas() {
    var container = elements.filtroBiblioteca.querySelector('.bec-filtro-opcoes');
    if (!container) return;

    container.innerHTML = '';

    var allLabel = createRadioLabel('biblioteca', '', 'Todas', true);
    container.appendChild(allLabel);

    state.bibliotecas.forEach(function (bib) {
      var label = createRadioLabel('biblioteca', bib, bib, false);
      container.appendChild(label);
    });

    if (BEC_CONFIG.organizationId || state.bibliotecas.length <= 1) {
      elements.filtroBiblioteca.style.display = 'none';
    }

    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        state.filters.biblioteca = this.value;
        state.currentPage = 1;
        applyFilters();
      });
    });
  }

  function renderFiltroCategorias() {
    var container = elements.filtroCategoria.querySelector('.bec-filtro-opcoes');
    if (!container) return;

    container.innerHTML = '';

    var allLabel = createRadioLabel('categoria', '', 'Todas', true);
    container.appendChild(allLabel);

    state.categorias.forEach(function (cat) {
      var label = createRadioLabel('categoria', cat, cat, false);
      container.appendChild(label);
    });

    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        state.filters.categoria = this.value;
        state.currentPage = 1;
        applyFilters();
      });
    });
  }

  function renderFiltroAnos() {
    var container = elements.filtroAno.querySelector('.bec-filtro-opcoes');
    if (!container) return;

    container.innerHTML = '';

    var allLabel = createRadioLabel('ano', '', 'Todos', true);
    container.appendChild(allLabel);

    state.anos.forEach(function (decada) {
      var label = createRadioLabel('ano', decada, decada + 's', false);
      container.appendChild(label);
    });

    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        state.filters.ano = this.value;
        state.currentPage = 1;
        applyFilters();
      });
    });
  }

  function createRadioLabel(name, value, text, checked) {
    var label = document.createElement('label');
    label.className = 'bec-radio';

    var input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = checked;

    var custom = document.createElement('span');
    custom.className = 'bec-radio-custom';

    label.appendChild(input);
    label.appendChild(custom);
    label.appendChild(document.createTextNode(' ' + text));

    return label;
  }

  // ============================================
  // Filtros
  // ============================================

  function applyFilters() {
    state.filteredLivros = state.livros.filter(function (livro) {
      // Busca por título/ISBN/categoria
      if (state.filters.busca) {
        var busca = state.filters.busca.toLowerCase();
        var titulo = (livro.title || livro.titulo || '').toLowerCase();
        var isbn = (livro.isbn || '').toLowerCase();
        var catNome = '';
        var cat = livro.category || livro.categoria;
        if (cat) {
          catNome = (typeof cat === 'string' ? cat : (cat.name || cat.nome || '')).toLowerCase();
        }
        var autor = (livro.author || livro.autor || '').toLowerCase();

        if (
          titulo.indexOf(busca) === -1 &&
          isbn.indexOf(busca) === -1 &&
          catNome.indexOf(busca) === -1 &&
          autor.indexOf(busca) === -1
        ) {
          return false;
        }
      }

      // Filtro por situação
      if (state.filters.situacao) {
        var status = (livro.status || livro.situacao || '').toLowerCase();
        if (status !== state.filters.situacao) {
          return false;
        }
      }

      // Filtro por biblioteca
      if (state.filters.biblioteca) {
        var org = livro.organization || livro.biblioteca || livro.library;
        var nomeOrg = '';
        if (org) {
          nomeOrg = typeof org === 'string' ? org : (org.name || org.nome || '');
        }
        if (nomeOrg !== state.filters.biblioteca) {
          return false;
        }
      }

      // Filtro por categoria
      if (state.filters.categoria) {
        var cat2 = livro.category || livro.categoria;
        var catNome2 = '';
        if (cat2) {
          catNome2 = typeof cat2 === 'string' ? cat2 : (cat2.name || cat2.nome || '');
        }
        if (catNome2 !== state.filters.categoria) {
          return false;
        }
      }

      // Filtro por ano (década)
      if (state.filters.ano) {
        var anoLivro = livro.year || livro.ano || livro.publicationYear;
        var anoNum = parseInt(anoLivro);
        if (!isNaN(anoNum)) {
          var decada = Math.floor(anoNum / 10) * 10;
          if (String(decada) !== state.filters.ano) {
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    });

    state.totalItems = state.filteredLivros.length;
    state.totalPages = Math.max(1, Math.ceil(state.totalItems / BEC_CONFIG.pageSize));

    if (state.currentPage > state.totalPages) {
      state.currentPage = state.totalPages;
    }

    renderLista();
    renderPaginacao();
    updateContador();
  }

  function clearAllFilters() {
    state.filters = {
      busca: '',
      situacao: '',
      biblioteca: '',
      categoria: '',
      ano: ''
    };
    state.currentPage = 1;

    elements.inputBusca.value = '';
    elements.btnLimparBusca.style.display = 'none';

    elements.chipsSituacao.forEach(function (chip) {
      chip.classList.remove('ativo');
      chip.setAttribute('aria-pressed', 'false');
    });
    var chipTodos = document.querySelector('.bec-chip[data-situacao=""]');
    if (chipTodos) {
      chipTodos.classList.add('ativo');
      chipTodos.setAttribute('aria-pressed', 'true');
    }

    var radioGroups = ['biblioteca', 'categoria', 'ano'];
    radioGroups.forEach(function (group) {
      var firstRadio = document.querySelector('.bec-filtro-opcoes input[name="' + group + '"]');
      if (firstRadio) {
        firstRadio.checked = true;
      }
    });

    applyFilters();
  }

  // ============================================
  // Renderização
  // ============================================

  function renderLista() {
    var start = (state.currentPage - 1) * BEC_CONFIG.pageSize;
    var end = start + BEC_CONFIG.pageSize;
    var livrosPagina = state.filteredLivros.slice(start, end);

    if (livrosPagina.length === 0) {
      elements.lista.innerHTML = '';
      showSemResultado(true);
      return;
    }

    showSemResultado(false);

    var html = '';
    livrosPagina.forEach(function (livro) {
      html += renderCard(livro);
    });

    elements.lista.innerHTML = html;

    elements.lista.querySelectorAll('.bec-card').forEach(function (card, index) {
      card.addEventListener('click', function () {
        var livroIndex = start + index;
        openModal(state.filteredLivros[livroIndex]);
      });
    });
  }

  function renderCard(livro) {
    var titulo = livro.title || livro.titulo || 'Sem título';
    var autor = livro.author || livro.autor || 'Autor desconhecido';
    var capa = livro.coverImage || livro.capa || livro.image || '';
    var categoria = '';
    var cat = livro.category || livro.categoria;
    if (cat) {
      categoria = typeof cat === 'string' ? cat : (cat.name || cat.nome || '');
    }
    var status = (livro.status || livro.situacao || '').toLowerCase();

    var capaHtml = capa
      ? '<img src="' + escapeHtml(capa) + '" alt="' + escapeHtml(titulo) + '" loading="lazy">'
      : '<i class="fas fa-book" aria-hidden="true"></i>';

    return '<div class="bec-card" role="listitem" tabindex="0" aria-label="' + escapeHtml(titulo) + '">' +
      '<div class="bec-card-capa">' + capaHtml + '</div>' +
      '<div class="bec-card-body">' +
        '<h3 class="bec-card-titulo">' + escapeHtml(titulo) + '</h3>' +
        '<p class="bec-card-autor">' + escapeHtml(autor) + '</p>' +
        '<div class="bec-card-meta">' +
          (categoria ? '<span class="bec-card-categoria">' + escapeHtml(categoria) + '</span>' : '') +
          (status ? '<span class="bec-card-situacao ' + status + '">' + capitalizeFirst(status) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderPaginacao() {
    if (state.totalPages <= 1) {
      elements.paginacao.innerHTML = '';
      return;
    }

    var html = '';

    html += '<button class="bec-pag-btn" data-page="prev" ' + (state.currentPage === 1 ? 'disabled' : '') + '>' +
      '<i class="fas fa-chevron-left" aria-hidden="true"></i>' +
    '</button>';

    var startPage = Math.max(1, state.currentPage - 2);
    var endPage = Math.min(state.totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      html += '<button class="bec-pag-btn" data-page="1">1</button>';
      if (startPage > 2) {
        html += '<span class="bec-pag-btn" disabled>...</span>';
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      html += '<button class="bec-pag-btn' + (i === state.currentPage ? ' ativo' : '') + '" data-page="' + i + '">' + i + '</button>';
    }

    if (endPage < state.totalPages) {
      if (endPage < state.totalPages - 1) {
        html += '<span class="bec-pag-btn" disabled>...</span>';
      }
      html += '<button class="bec-pag-btn" data-page="' + state.totalPages + '">' + state.totalPages + '</button>';
    }

    html += '<button class="bec-pag-btn" data-page="next" ' + (state.currentPage === state.totalPages ? 'disabled' : '') + '>' +
      '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
    '</button>';

    elements.paginacao.innerHTML = html;

    elements.paginacao.querySelectorAll('.bec-pag-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        var page = this.dataset.page;
        if (page === 'prev') {
          state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (page === 'next') {
          state.currentPage = Math.min(state.totalPages, state.currentPage + 1);
        } else {
          state.currentPage = parseInt(page);
        }
        renderLista();
        renderPaginacao();
        window.scrollTo({ top: elements.lista.offsetTop - 100, behavior: 'smooth' });
      });
    });
  }

  function updateContador() {
    elements.numResultados.textContent = state.totalItems;
  }

  // ============================================
  // Modal
  // ============================================

  function openModal(livro) {
    var titulo = livro.title || livro.titulo || 'Sem título';
    var autor = livro.author || livro.autor || 'Autor desconhecido';
    var capa = livro.coverImage || livro.capa || livro.image || '';
    var isbn = livro.isbn || '';
    var categoria = '';
    var cat = livro.category || livro.categoria;
    if (cat) {
      categoria = typeof cat === 'string' ? cat : (cat.name || cat.nome || '');
    }
    var ano = livro.year || livro.ano || livro.publicationYear || '';
    var status = (livro.status || livro.situacao || '').toLowerCase();
    var editora = livro.publisher || livro.editora || '';
    var paginas = livro.pages || livro.paginas || '';
    var sinopse = livro.description || livro.sinopse || livro.resumo || '';
    var org = livro.organization || livro.biblioteca || livro.library;
    var nomeOrg = '';
    if (org) {
      nomeOrg = typeof org === 'string' ? org : (org.name || org.nome || '');
    }

    var overlay = document.createElement('div');
    overlay.className = 'bec-modal-overlay';

    var detalhesHtml = '';
    if (isbn) detalhesHtml += '<span><i class="fas fa-barcode" aria-hidden="true"></i> ISBN: ' + escapeHtml(isbn) + '</span>';
    if (categoria) detalhesHtml += '<span><i class="fas fa-tag" aria-hidden="true"></i> ' + escapeHtml(categoria) + '</span>';
    if (ano) detalhesHtml += '<span><i class="fas fa-calendar" aria-hidden="true"></i> ' + escapeHtml(String(ano)) + '</span>';
    if (editora) detalhesHtml += '<span><i class="fas fa-building" aria-hidden="true"></i> ' + escapeHtml(editora) + '</span>';
    if (paginas) detalhesHtml += '<span><i class="fas fa-file" aria-hidden="true"></i> ' + escapeHtml(String(paginas)) + ' páginas</span>';
    if (nomeOrg) detalhesHtml += '<span><i class="fas fa-library" aria-hidden="true"></i> ' + escapeHtml(nomeOrg) + '</span>';
    if (status) detalhesHtml += '<span><i class="fas fa-info-circle" aria-hidden="true"></i> Situação: <strong>' + capitalizeFirst(status) + '</strong></span>';

    var capaHtml = capa
      ? '<img src="' + escapeHtml(capa) + '" alt="' + escapeHtml(titulo) + '" class="bec-modal-capa">'
      : '<div class="bec-modal-capa" style="display:flex;align-items:center;justify-content:center;"><i class="fas fa-book" style="font-size:4rem;color:#bdc3c7;"></i></div>';

    overlay.innerHTML =
      '<div class="bec-modal">' +
        '<button class="bec-modal-fechar" aria-label="Fechar">&times;</button>' +
        '<div class="bec-modal-conteudo">' +
          capaHtml +
          '<div class="bec-modal-info">' +
            '<h2>' + escapeHtml(titulo) + '</h2>' +
            '<p class="bec-modal-autor">' + escapeHtml(autor) + '</p>' +
            (detalhesHtml ? '<div class="bec-modal-detalhes">' + detalhesHtml + '</div>' : '') +
            (sinopse ? '<p style="margin-top:1rem;font-size:0.9rem;color:#555;line-height:1.6;">' + escapeHtml(sinopse) + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.bec-modal-fechar').addEventListener('click', function () {
      overlay.remove();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handler);
      }
    });
  }

  // ============================================
  // Helpers
  // ============================================

  function showLoading(show) {
    elements.loading.style.display = show ? 'block' : 'none';
    if (show) {
      elements.lista.style.display = 'none';
      elements.semResultado.style.display = 'none';
      elements.paginacao.style.display = 'none';
    } else {
      elements.lista.style.display = '';
      elements.paginacao.style.display = '';
    }
  }

  function showSemResultado(show) {
    elements.semResultado.style.display = show ? 'block' : 'none';
    elements.lista.style.display = show ? 'none' : '';
    elements.paginacao.style.display = show ? 'none' : '';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ============================================
  // Iniciar quando o DOM estiver pronto
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
