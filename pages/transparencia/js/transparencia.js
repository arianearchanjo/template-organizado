(function () {
  'use strict';

  // var anoAtivo = '2026'; // [DESATIVADO] Filtro de exercício comentado temporariamente.
  var anoAtivo = 'todos';
  var secaoAtiva = 'inicio';
  var modoGlobalSearch = false;

  var CATEGORIAS = {
    'receitas-despesas':   'Receitas & Despesas',
    'licitacoes':          'Compras & Licitações',
    'pessoal':             'Pessoal',
    'planejamento':        'Planejamento',
    'contabilidade':       'Contabilidade & Finanças',
    'legislacao':          'Leis & Atos',
    'acesso-informacao':   'Acesso à Informação',
    'servicos-sociais':    'Saúde, Educação & Social',
    'administracao':       'Administração'
  };

  function ativarSecao(id) {
    modoGlobalSearch = false;
    secaoAtiva = id;

    document.querySelectorAll('.pt-nav-btn[data-secao]').forEach(function (btn) {
      var ativo = btn.getAttribute('data-secao') === id;
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-expanded', ativo ? 'true' : 'false');
    });

    document.querySelectorAll('.pt-secao').forEach(function (sec) {
      sec.classList.remove('visivel');
    });

    var alvo = document.getElementById('secao-' + id);
    if (alvo) { alvo.classList.add('visivel'); }

    /* [DESATIVADO] Filtro de exercício comentado temporariamente.
    var filtro = document.getElementById('pt-filtro-barra');
    if (filtro) {
      var ocultarFiltro = (id === 'inicio' || id === 'busca');
      filtro.classList.toggle('pt-oculto', ocultarFiltro);
    }

    if (id !== 'inicio' && id !== 'busca') {
      aplicarFiltroAno(anoAtivo);
    }
    */
  }

  /* [DESATIVADO] Filtro de exercício comentado temporariamente.
  function aplicarFiltroAno(ano) {
    anoAtivo = ano;

    document.querySelectorAll('.pt-btn-ano').forEach(function (btn) {
      var ativo = btn.getAttribute('data-ano') === ano;
      btn.classList.toggle('ativo', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    if (modoGlobalSearch) {
      executarBuscaGlobal(document.getElementById('pt-busca').value);
      return;
    }

    var secao = document.querySelector('.pt-secao.visivel');
    if (!secao || secao.id === 'secao-inicio' || secao.id === 'secao-busca') return;

    secao.querySelectorAll('[data-year]').forEach(function (item) {
      var dy = item.getAttribute('data-year');
      item.classList.toggle('pt-item-oculto', !(ano === 'todos' || dy === ano || dy === 'todos'));
    });

    var visiv = secao.querySelectorAll('[data-year]:not(.pt-item-oculto)').length;
    var aviso = secao.querySelector('.pt-aviso-vazio');
    if (aviso) { aviso.classList.toggle('visivel', visiv === 0); }
  }
  */

  function escaparHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function destacarTexto(texto, termo) {
    if (!termo) return escaparHTML(texto);
    var safe = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaparHTML(texto).replace(new RegExp('(' + safe + ')', 'gi'), '<mark>$1</mark>');
  }

  function executarBuscaGlobal(termo) {
    modoGlobalSearch = true;
    secaoAtiva = 'busca';

    document.querySelectorAll('.pt-nav-btn[data-secao]').forEach(function (btn) {
      btn.classList.remove('ativo');
      btn.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('.pt-secao').forEach(function (sec) { sec.classList.remove('visivel'); });

    var secBusca = document.getElementById('secao-busca');
    if (secBusca) secBusca.classList.add('visivel');

    /* [DESATIVADO] Filtro de exercício comentado temporariamente.
    var filtro = document.getElementById('pt-filtro-barra');
    if (filtro) filtro.classList.remove('pt-oculto');
    */

    var desc = document.getElementById('pt-busca-desc');
    if (desc) {
      var anoLabel = anoAtivo === 'todos' ? 'todos os exercícios' : 'exercício ' + anoAtivo;
      desc.textContent = 'Pesquisando "' + termo + '" em ' + anoLabel + '.';
    }

    var lista = document.getElementById('pt-lista-resultados');
    var aviso = document.getElementById('pt-busca-vazio');
    if (!lista) return;

    var termoLow = termo.toLowerCase().trim();
    var resultados = [];

    document.querySelectorAll('[data-busca]').forEach(function (item) {
      var dyItem = item.getAttribute('data-year');
      var passaAno = (anoAtivo === 'todos' || dyItem === anoAtivo || dyItem === 'todos');
      if (!passaAno) return;

      var textoBusca = (item.getAttribute('data-busca') || '').toLowerCase();
      var textoLink = '';
      var linkEl = item.querySelector('a.pt-link');
      if (linkEl) {
        var sp = linkEl.querySelector('span');
        textoLink = sp ? sp.textContent.toLowerCase() : linkEl.textContent.toLowerCase();
      }

      if (textoBusca.indexOf(termoLow) !== -1 || textoLink.indexOf(termoLow) !== -1) {
        var secPai = item.closest('.pt-secao');
        var secId = secPai ? secPai.id.replace('secao-', '') : '';
        var cat = CATEGORIAS[secId] || '';

        var nomeExibido = '';
        var href = '';
        var externo = false;

        if (linkEl) {
          var spanNome = linkEl.querySelector('span');
          nomeExibido = spanNome ? spanNome.textContent.trim() : linkEl.textContent.trim();
          href = linkEl.getAttribute('href') || '#';
          externo = linkEl.target === '_blank';
        }

        resultados.push({ nome: nomeExibido, href: href, externo: externo, cat: cat });
      }
    });

    lista.innerHTML = '';

    if (resultados.length === 0) {
      if (aviso) aviso.classList.add('visivel');
    } else {
      if (aviso) aviso.classList.remove('visivel');
      resultados.forEach(function (r) {
        var li = document.createElement('li');
        li.className = 'pt-resultado-item';
        li.setAttribute('role', 'listitem');

        var nomeHL = destacarTexto(r.nome, termoLow);
        var isElotech = r.href.indexOf('campinagrandedosul.oxy.elotech.com.br/portaltransparencia/1/') !== -1;
        var extClass = r.externo ? (isElotech ? 'link-externo' : '') : '';
        var ext = r.externo ? ' target="_blank" rel="noopener noreferrer"' : '';

        var ico = r.externo
          ? '<i class="fas fa-external-link-alt pt-resultado-seta" aria-hidden="true"></i>'
          : '<i class="fas fa-chevron-right pt-resultado-seta" aria-hidden="true"></i>';

        li.innerHTML =
          '<a href="' + escaparHTML(r.href) + '"' + ext + (extClass ? ' class="' + extClass + '"' : '') + '>' +
            '<span class="pt-resultado-categoria">' + escaparHTML(r.cat) + '</span>' +
            '<span class="pt-resultado-info"><span class="pt-resultado-nome">' + nomeHL + '</span></span>' +
            ico +
          '</a>';

        lista.appendChild(li);
      });
    }
  }

  function limparBusca() {
    var input = document.getElementById('pt-busca');
    if (input) input.value = '';
    modoGlobalSearch = false;
    ativarSecao('inicio');
  }

  function init() {
    document.querySelectorAll('.pt-nav-btn[data-secao]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-secao');
        limparBusca();
        ativarSecao(id);
      });
    });

    /* [DESATIVADO] Filtro de exercício comentado temporariamente.
    document.querySelectorAll('.pt-btn-ano').forEach(function (btn) {
      btn.addEventListener('click', function () {
        aplicarFiltroAno(btn.getAttribute('data-ano'));
      });
    });
    */

    var inputBusca = document.getElementById('pt-busca');
    var btnBusca = document.getElementById('pt-busca-btn');

    function disparaBusca() {
      var t = inputBusca ? inputBusca.value.trim() : '';
      if (t.length >= 2) {
        executarBuscaGlobal(t);
      } else if (t.length === 0) {
        limparBusca();
      }
    }

    if (inputBusca) {
      inputBusca.addEventListener('input', function () {
        var t = inputBusca.value.trim();
        if (t.length >= 2) {
          executarBuscaGlobal(t);
        } else if (t.length === 0) {
          limparBusca();
        }
      });

      inputBusca.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); disparaBusca(); }
        if (e.key === 'Escape') { limparBusca(); }
      });
    }

    if (btnBusca) {
      btnBusca.addEventListener('click', function () { disparaBusca(); });
    }

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var id = el.getAttribute('data-goto');
        ativarSecao(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    iniciarAvisoElotech();
    ativarSecao('inicio');
  }

  function iniciarAvisoElotech() {
    var modal = document.createElement('div');
    modal.id = 'pt-modal-elotech';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'pt-modal-titulo');
    modal.setAttribute('aria-describedby', 'pt-modal-msg');
    modal.innerHTML =
      '<div class="pt-modal-caixa">' +
        '<div class="pt-modal-icone" aria-hidden="true"><i class="fas fa-circle-info"></i></div>' +
        '<h2 id="pt-modal-titulo" class="pt-modal-titulo">Sistema Externo</h2>' +
        '<p id="pt-modal-msg" class="pt-modal-msg">Você será direcionado para um sistema externo.' +
        ' Após o acesso, <strong>selecione o ano desejado</strong> no topo da página.</p>' +
        '<div class="pt-modal-acoes">' +
          '<button id="pt-modal-cancelar" class="pt-modal-btn pt-modal-btn-sec">Cancelar</button>' +
          '<button id="pt-modal-confirmar" class="pt-modal-btn pt-modal-btn-pri">Continuar <i class="fas fa-external-link-alt" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var urlDestino = null;

    function abrirModal(url) {
      urlDestino = url;
      modal.classList.add('ativo');
      document.getElementById('pt-modal-confirmar').focus();
    }

    function fecharModal() {
      modal.classList.remove('ativo');
      urlDestino = null;
    }

    document.getElementById('pt-modal-cancelar').addEventListener('click', fecharModal);

    document.getElementById('pt-modal-confirmar').addEventListener('click', function () {
      if (urlDestino) { window.open(urlDestino, '_blank', 'noopener,noreferrer'); }
      fecharModal();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) { fecharModal(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('ativo')) { fecharModal(); }
    });

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a.link-externo');
      if (!link) return;
      e.preventDefault();
      abrirModal(link.getAttribute('href'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();