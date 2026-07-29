(function () {
  'use strict';

  function iniciarAbas(container) {
    if (container.dataset.pcAbasInicializadas === 'true') return;

    var rolagem = container.querySelector('.pc-tabs-rolagem');
    var abas = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
    var setaEsquerda = container.querySelector('.pc-tabs-seta-esquerda');
    var setaDireita = container.querySelector('.pc-tabs-seta-direita');

    if (!rolagem || !abas.length || !setaEsquerda || !setaDireita) return;
    container.dataset.pcAbasInicializadas = 'true';

    function atualizarSetas() {
      var tolerancia = 2;
      var inicio = rolagem.scrollLeft <= tolerancia;
      var fim = rolagem.scrollLeft + rolagem.clientWidth >= rolagem.scrollWidth - tolerancia;
      var possuiRolagem = rolagem.scrollWidth > rolagem.clientWidth + tolerancia;

      setaEsquerda.hidden = !possuiRolagem || inicio;
      setaDireita.hidden = !possuiRolagem || fim;
    }

    function ativarAba(aba, moverFoco) {
      abas.forEach(function (item) {
        var painel = document.getElementById(item.getAttribute('aria-controls'));
        var ativa = item === aba;

        item.classList.toggle('ativo', ativa);
        item.setAttribute('aria-selected', ativa ? 'true' : 'false');
        item.setAttribute('tabindex', ativa ? '0' : '-1');
        if (painel) painel.hidden = !ativa;
      });

      if (aba === abas[0]) {
        rolagem.scrollLeft = 0;
      } else {
        aba.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }

      if (moverFoco) aba.focus();
      atualizarSetas();
      window.requestAnimationFrame(atualizarSetas);
    }

    function moverSelecao(indice) {
      var destino = (indice + abas.length) % abas.length;
      ativarAba(abas[destino], true);
    }

    abas.forEach(function (aba, indice) {
      aba.addEventListener('click', function () { ativarAba(aba, false); });
      aba.addEventListener('keydown', function (evento) {
        if (evento.key === 'ArrowRight') {
          evento.preventDefault();
          moverSelecao(indice + 1);
        } else if (evento.key === 'ArrowLeft') {
          evento.preventDefault();
          moverSelecao(indice - 1);
        } else if (evento.key === 'Home') {
          evento.preventDefault();
          moverSelecao(0);
        } else if (evento.key === 'End') {
          evento.preventDefault();
          moverSelecao(abas.length - 1);
        }
      });
    });

    setaEsquerda.addEventListener('click', function () {
      rolagem.scrollBy({ left: -rolagem.clientWidth * 0.8, behavior: 'smooth' });
    });
    setaDireita.addEventListener('click', function () {
      rolagem.scrollBy({ left: rolagem.clientWidth * 0.8, behavior: 'smooth' });
    });
    rolagem.addEventListener('scroll', atualizarSetas, { passive: true });
    window.addEventListener('resize', atualizarSetas);
    atualizarSetas();
  }

  function iniciarAccordions(container) {
    if (container.dataset.pcAccordionsInicializados === 'true') return;

    var botoes = Array.prototype.slice.call(container.querySelectorAll('.pc-pasta-botao'));
    if (!botoes.length) return;
    container.dataset.pcAccordionsInicializados = 'true';

    botoes.forEach(function (botao) {
      botao.addEventListener('click', function () {
        var painel = document.getElementById(botao.getAttribute('aria-controls'));
        if (!painel) return;

        var aberto = botao.getAttribute('aria-expanded') === 'true';
        botao.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        painel.hidden = aberto;

        var icone = botao.querySelector('.pc-pasta-icone i');
        if (icone) {
          icone.classList.toggle('fa-folder', aberto);
          icone.classList.toggle('fa-folder-open', !aberto);
        }
      });
    });
  }

  function obterTipoArquivo(url) {
    var caminho = (url || '').split('?')[0].split('#')[0];
    var correspondencia = caminho.match(/\.([a-z0-9]+)$/i);
    return correspondencia ? correspondencia[1].toLowerCase() : '';
  }

  function nomeIniciaComEdital(nome) {
    return /^\s*edital(?:\s|[-_:.]|n[º°o]\b)/i.test(nome || '');
  }

  function obterIconeArquivo(extensao, ehEdital) {
    if (ehEdital) return { classe: 'fas fa-file-signature', cor: 'pc-arquivo-icone-edital' };
    if (extensao === 'pdf') return { classe: 'far fa-file-pdf text-danger', cor: '' };
    if (['doc', 'docx', 'odt'].indexOf(extensao) !== -1) {
      return { classe: 'far fa-file-word', cor: '' };
    }
    if (['xls', 'xlsx', 'ods', 'csv'].indexOf(extensao) !== -1) {
      return { classe: 'far fa-file-excel', cor: '' };
    }
    return { classe: 'far fa-file-alt', cor: '' };
  }

  function criarItemArquivo(arquivo) {
    var extensao = obterTipoArquivo(arquivo.url) || obterTipoArquivo(arquivo.nome);
    var ehEdital = nomeIniciaComEdital(arquivo.nome);
    var icone = obterIconeArquivo(extensao, ehEdital);
    var link = document.createElement('a');
    var wrapperIcone = document.createElement('span');
    var elementoIcone = document.createElement('i');
    var info = document.createElement('span');
    var nome = document.createElement('span');
    var tipo = document.createElement('span');
    var acao = document.createElement('span');
    var iconeDownload = document.createElement('i');

    link.className = 'pc-arquivo-item';
    link.href = arquivo.url;
    link.target = '_blank';
    link.rel = 'noopener';

    wrapperIcone.className = 'pc-arquivo-icone' + (icone.cor ? ' ' + icone.cor : '');
    wrapperIcone.setAttribute('aria-hidden', 'true');
    elementoIcone.className = icone.classe;
    wrapperIcone.appendChild(elementoIcone);

    info.className = 'pc-arquivo-info';
    nome.className = 'pc-arquivo-nome';
    nome.textContent = arquivo.nome;
    tipo.className = 'pc-arquivo-tipo';
    tipo.textContent = extensao
      ? extensao.toUpperCase() + (ehEdital ? ' — Edital' : ' — Anexo')
      : (ehEdital ? 'Edital' : 'Anexo');
    info.appendChild(nome);
    info.appendChild(tipo);

    acao.className = 'pc-arquivo-acao';
    acao.appendChild(document.createTextNode('Acessar '));
    iconeDownload.className = 'fas fa-external-link-alt';
    iconeDownload.setAttribute('aria-hidden', 'true');
    acao.appendChild(iconeDownload);

    link.appendChild(wrapperIcone);
    link.appendChild(info);
    link.appendChild(acao);
    return link;
  }

  function transformarDocumentos2026(fonte) {
    if (fonte.dataset.pcDocumentosProcessados === 'true') return true;

    var categorias = [];
    Array.prototype.forEach.call(fonte.querySelectorAll('tbody tr'), function (linha) {
      var controle = linha.querySelector('td.text-info > a') || linha.querySelector('td a');
      var conteudo = linha.querySelector('.collapse');
      if (!controle || !conteudo) return;

      var titulo = controle.textContent.trim();
      var arquivos = Array.prototype.map.call(conteudo.querySelectorAll('ul li a'), function (link, indice) {
        return {
          nome: link.textContent.trim(),
          url: link.getAttribute('href'),
          ordemOriginal: indice
        };
      }).filter(function (arquivo) {
        return arquivo.nome && arquivo.url;
      }).sort(function (arquivoA, arquivoB) {
        var editalA = nomeIniciaComEdital(arquivoA.nome);
        var editalB = nomeIniciaComEdital(arquivoB.nome);
        if (editalA !== editalB) return editalA ? -1 : 1;
        return arquivoA.ordemOriginal - arquivoB.ordemOriginal;
      });

      categorias.push({ titulo: titulo, arquivos: arquivos });
    });

    var configuracoes = [
      { numero: '01/2026', subcategoria: '386' },
      { numero: '02/2026', subcategoria: '387' }
    ];
    var encontradas = 0;

    configuracoes.forEach(function (configuracao) {
      var categoria = categorias.find(function (item) {
        return item.titulo.indexOf(configuracao.numero) !== -1;
      });
      var pasta = document.querySelector('[data-pc-subcategory="' + configuracao.subcategoria + '"]');
      if (!categoria || !pasta) return;

      encontradas += 1;
      var painel = pasta.querySelector('.pc-pasta-painel');
      if (!painel) return;

      painel.replaceChildren();
      if (!categoria.arquivos.length) {
        var vazio = document.createElement('div');
        vazio.className = 'pc-documentos-pendentes';
        var mensagem = document.createElement('p');
        mensagem.textContent = 'Nenhum documento disponível nesta pasta.';
        vazio.appendChild(mensagem);
        painel.appendChild(vazio);
        return;
      }

      categoria.arquivos.forEach(function (arquivo) {
        painel.appendChild(criarItemArquivo(arquivo));
      });
    });

    if (encontradas !== configuracoes.length) return false;
    fonte.dataset.pcDocumentosProcessados = 'true';
    fonte.remove();
    return true;
  }

  function observarDocumentos2026(fonte) {
    if (fonte.dataset.pcObserverDocumentos === 'true') return;
    fonte.dataset.pcObserverDocumentos = 'true';

    if (transformarDocumentos2026(fonte)) return;

    var observer = new MutationObserver(function () {
      if (transformarDocumentos2026(fonte)) observer.disconnect();
    });
    observer.observe(fonte, { childList: true, subtree: true });
  }

  function iniciar(root) {
    if (root.matches && root.matches('.pc-projetos-culturais')) iniciarAbas(root);
    if (root.matches && root.matches('[data-pc-accordions]')) iniciarAccordions(root);
    if (root.matches && root.matches('.pc-spweb-fonte')) observarDocumentos2026(root);
    if (!root.querySelectorAll) return;
    Array.prototype.forEach.call(root.querySelectorAll('.pc-projetos-culturais'), iniciarAbas);
    Array.prototype.forEach.call(root.querySelectorAll('[data-pc-accordions]'), iniciarAccordions);
    Array.prototype.forEach.call(root.querySelectorAll('.pc-spweb-fonte'), observarDocumentos2026);
  }

  function observarInsercoes() {
    if (!document.body || document.body.dataset.pcObserverAtivo === 'true') return;
    document.body.dataset.pcObserverAtivo = 'true';

    new MutationObserver(function (mutacoes) {
      mutacoes.forEach(function (mutacao) {
        Array.prototype.forEach.call(mutacao.addedNodes, function (node) {
          if (node.nodeType === 1) iniciar(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function inicializar() {
    iniciar(document);
    observarInsercoes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar, { once: true });
  } else {
    inicializar();
  }
}());
